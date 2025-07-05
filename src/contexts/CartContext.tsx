import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, CartItem as DBCartItem } from "@/lib/supabase";
import {
  getCurrentTableNumber,
  getCurrentSessionCode,
  generateTableSessionId,
  logTableIsolationStatus,
  cleanupOldTableData,
  validateTableSession,
} from "@/lib/table-utils";

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  sessionId: string;
  addToCart: (item: {
    id: string;
    name: string;
    price: number;
    image: string;
  }) => Promise<void>;
  removeFromCart: (menuItemId: string) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (menuItemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  // Generate or get session ID with better persistence and table isolation
  useEffect(() => {
    const table = getCurrentTableNumber();
    const urlSession = getCurrentSessionCode();

    // Create a unique session ID that combines table and session from URL
    let sessionId: string;

    if (urlSession) {
      // Use the session from URL (most reliable for table isolation)
      sessionId = generateTableSessionId(table, urlSession);
    } else {
      // Fallback: try to get existing session from localStorage
      const existingSessionKey = `cart-session-${table}`;
      const existingSessionId = localStorage.getItem(existingSessionKey);

      if (existingSessionId && validateTableSession(table, existingSessionId)) {
        sessionId = existingSessionId;
      } else {
        // Create new session if none exists or validation fails
        sessionId = generateTableSessionId(table);
        localStorage.setItem(existingSessionKey, sessionId);
      }
    }

    // Log table isolation status for debugging
    logTableIsolationStatus("CartContext", table, sessionId);
    setSessionId(sessionId);

    // Clean up old cart data from other tables to prevent cross-contamination
    cleanupOldTableData(table);
  }, []);

  // Convert database cart item to context cart item format
  const convertDBCartItemToCartItem = (dbCartItem: DBCartItem): CartItem => {
    return {
      id: dbCartItem.id,
      menuItemId: dbCartItem.menu_item_id,
      name: dbCartItem.item_name,
      price: dbCartItem.price,
      quantity: dbCartItem.quantity,
      image:
        dbCartItem.item_image ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    };
  };

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);

      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log(
          "🛒 CartContext: Using local storage (database not connected)",
        );
        // Use localStorage when Supabase is not configured
        const localCart = localStorage.getItem(`cart-${sessionId}`);
        if (localCart) {
          try {
            const cartData = JSON.parse(localCart);
            // Handle both old format (array) and new format (object with metadata)
            const items = Array.isArray(cartData)
              ? cartData
              : cartData.items || [];
            setCartItems(items);
            console.log(
              `📦 CartContext: Loaded ${items.length} items from localStorage`,
            );
          } catch (error) {
            console.error("Error parsing cart data from localStorage:", error);
            setCartItems([]);
          }
        }
        setLoading(false);
        return;
      }

      console.log("🛒 CartContext: Fetching cart items from database...");
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching cart items:", error);
        // Fallback to localStorage
        const localCart = localStorage.getItem(`cart-${sessionId}`);
        if (localCart) {
          try {
            const cartData = JSON.parse(localCart);
            const items = Array.isArray(cartData)
              ? cartData
              : cartData.items || [];
            setCartItems(items);
            console.log(
              `📦 CartContext: Fallback loaded ${items.length} items from localStorage`,
            );
          } catch (error) {
            console.error("Error parsing fallback cart data:", error);
            setCartItems([]);
          }
        }
        return;
      }

      const convertedItems = data?.map(convertDBCartItemToCartItem) || [];
      setCartItems(convertedItems);
      console.log(
        "✅ CartContext: Loaded",
        convertedItems.length,
        "cart items from database",
      );
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // Fallback to localStorage
      const localCart = localStorage.getItem(`cart-${sessionId}`);
      if (localCart) {
        try {
          const cartData = JSON.parse(localCart);
          const items = Array.isArray(cartData)
            ? cartData
            : cartData.items || [];
          setCartItems(items);
          console.log(
            `📦 CartContext: Error fallback loaded ${items.length} items from localStorage`,
          );
        } catch (error) {
          console.error("Error parsing error fallback cart data:", error);
          setCartItems([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage as backup with additional metadata and table isolation
  const saveToLocalStorage = (items: CartItem[]) => {
    if (sessionId) {
      const table = getCurrentTableNumber();

      const cartData = {
        items,
        lastUpdated: new Date().toISOString(),
        sessionId,
        tableNumber: table,
      };

      localStorage.setItem(`cart-${sessionId}`, JSON.stringify(cartData));
      localStorage.setItem(
        `cart-${sessionId}-timestamp`,
        Date.now().toString(),
      );

      console.log(
        `💾 CartContext: Saved ${items.length} items to localStorage for table ${table}`,
      );
    }
  };

  // Add item to cart
  const addToCart = async (item: {
    id: string;
    name: string;
    price: number;
    image: string;
  }) => {
    try {
      const existingItem = cartItems.find(
        (cartItem) => cartItem.menuItemId === item.id,
      );

      if (existingItem) {
        // Update quantity
        await updateQuantity(item.id, existingItem.quantity + 1);
        return;
      }

      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, adding to localStorage");
        const newItem: CartItem = {
          id: Date.now().toString(),
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        };
        const newCartItems = [...cartItems, newItem];
        setCartItems(newCartItems);
        saveToLocalStorage(newCartItems);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const tableNumber = urlParams.get("table") || "1";

      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          session_id: sessionId,
          table_number: tableNumber,
          menu_item_id: item.id,
          quantity: 1,
          price: item.price,
          item_name: item.name,
          item_image: item.image,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding to cart:", error);
        return;
      }

      const newCartItem = convertDBCartItemToCartItem(data);
      setCartItems([...cartItems, newCartItem]);
      saveToLocalStorage([...cartItems, newCartItem]);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Remove item from cart
  const removeFromCart = async (menuItemId: string) => {
    try {
      const existingItem = cartItems.find(
        (cartItem) => cartItem.menuItemId === menuItemId,
      );
      if (!existingItem) return;

      if (existingItem.quantity > 1) {
        // Decrease quantity
        await updateQuantity(menuItemId, existingItem.quantity - 1);
        return;
      }

      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, removing from localStorage");
        const newCartItems = cartItems.filter(
          (item) => item.menuItemId !== menuItemId,
        );
        setCartItems(newCartItems);
        saveToLocalStorage(newCartItems);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", existingItem.id);

      if (error) {
        console.error("Error removing from cart:", error);
        return;
      }

      const newCartItems = cartItems.filter(
        (item) => item.menuItemId !== menuItemId,
      );
      setCartItems(newCartItems);
      saveToLocalStorage(newCartItems);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // Update item quantity
  const updateQuantity = async (menuItemId: string, quantity: number) => {
    try {
      const existingItem = cartItems.find(
        (cartItem) => cartItem.menuItemId === menuItemId,
      );
      if (!existingItem) return;

      if (quantity <= 0) {
        await removeFromCart(menuItemId);
        return;
      }

      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, updating localStorage");
        const newCartItems = cartItems.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item,
        );
        setCartItems(newCartItems);
        saveToLocalStorage(newCartItems);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", existingItem.id);

      if (error) {
        console.error("Error updating cart quantity:", error);
        return;
      }

      const newCartItems = cartItems.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item,
      );
      setCartItems(newCartItems);
      saveToLocalStorage(newCartItems);
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, clearing localStorage");
        setCartItems([]);
        localStorage.removeItem(`cart-${sessionId}`);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("session_id", sessionId);

      if (error) {
        console.error("Error clearing cart:", error);
        return;
      }

      setCartItems([]);
      localStorage.removeItem(`cart-${sessionId}`);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Helper functions
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getItemQuantity = (menuItemId: string) => {
    const item = cartItems.find(
      (cartItem) => cartItem.menuItemId === menuItemId,
    );
    return item ? item.quantity : 0;
  };

  // Fetch cart items when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchCartItems();
    }
  }, [sessionId]);

  // Set up real-time subscription for cart items
  useEffect(() => {
    if (!sessionId) return;

    // Only set up subscription if Supabase is properly configured
    if (
      !import.meta.env.VITE_SUPABASE_URL ||
      !import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      return;
    }

    console.log("🔔 Setting up real-time subscription for cart items");

    const subscription = supabase
      .channel(`cart_realtime_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("🔔 Real-time cart update received:", payload);
          fetchCartItems();
        },
      )
      .subscribe();

    return () => {
      console.log("🔕 Unsubscribing from cart real-time updates");
      subscription.unsubscribe();
    };
  }, [sessionId]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        sessionId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
