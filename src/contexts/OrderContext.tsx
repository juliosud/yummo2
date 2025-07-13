import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  supabase,
  Order as DBOrder,
  OrderItem as DBOrderItem,
} from "@/lib/supabase";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  orderTime: Date;
  tableNumber: string;
  sessionCode?: string; // Track which session this order belongs to
  estimatedMinutes?: number;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (
    order: Omit<Order, "id" | "orderTime" | "status">,
  ) => Promise<void>;
  updateOrder: (orderId: string, updatedOrder: Partial<Order>) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: Order["status"],
  ) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTableNumber, setCurrentTableNumber] = useState<string>("");

  // Convert database order to context order format
  const convertDBOrderToOrder = (dbOrder: DBOrder): Order => {
    const items: OrderItem[] =
      dbOrder.order_items?.map((item) => ({
        id: item.menu_item_id,
        name: item.item_name || item.menu_item?.name || "Unknown Item",
        price: item.price,
        quantity: item.quantity,
        image:
          item.menu_item?.image ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
      })) || [];

    return {
      id: dbOrder.id,
      items,
      total: dbOrder.total,
      status: dbOrder.status,
      orderTime: new Date(dbOrder.created_at),
      tableNumber: dbOrder.table_number,
      sessionCode: dbOrder.session_code,
      estimatedMinutes: dbOrder.estimated_minutes,
    };
  };

  // Get current table number from URL
  const getCurrentTableNumber = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("table") || "1";
  };

  // Get current session code from URL
  const getCurrentSessionCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("session");
  };

  // Fetch orders from database (filtered by current table and session)
  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Get current table number and session code
      const tableNumber = getCurrentTableNumber();
      const sessionCode = getCurrentSessionCode();
      setCurrentTableNumber(tableNumber);

      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log(
          `📦 OrderContext: Using mock data for table ${tableNumber} (database not connected)`,
        );
        console.warn(
          "🔧 To enable real-time orders: Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in project settings",
        );
        // Use mock data when Supabase is not configured (filtered by table)
        const mockOrders: Order[] = [
          {
            id: "mock-1",
            items: [
              {
                id: "1",
                name: "Vegetarian Pad Thai",
                price: 14.99,
                quantity: 1,
                image:
                  "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&q=80",
              },
              {
                id: "2",
                name: "Shrimp Tacos",
                price: 19.49,
                quantity: 2,
                image:
                  "https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&q=80",
              },
            ],
            total: 53.97,
            status: "preparing",
            orderTime: new Date(),
            tableNumber: tableNumber,
            sessionCode: sessionCode,
            estimatedMinutes: 25,
          },
        ];
        setOrders(mockOrders);
        setLoading(false);
        return;
      }

      console.log(
        `📦 OrderContext: Fetching orders for table ${tableNumber} and session ${sessionCode} from Supabase database...`,
      );

      // Build query to filter by table number and session code
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            menu_item_id,
            quantity,
            price,
            item_name,
            menu_item:menu_items (
              id,
              name,
              image
            )
          )
        `,
        )
        .eq("table_number", tableNumber);

      // Add session code filter if available
      if (sessionCode) {
        query = query.eq("session_code", sessionCode);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching orders:", error);
        // Fallback to empty array on error
        setOrders([]);
        return;
      }

      console.log(
        `✅ OrderContext: Successfully fetched ${data?.length || 0} orders for table ${tableNumber} and session ${sessionCode} from database`,
      );
      const convertedOrders = data?.map(convertDBOrderToOrder) || [];
      setOrders(convertedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new order to database
  const addOrder = async (
    orderData: Omit<Order, "id" | "orderTime" | "status">,
  ) => {
    try {
      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, adding mock order");
        // Add mock order when Supabase is not configured
        const newOrder: Order = {
          id: `mock-${Date.now()}`,
          items: orderData.items,
          total: orderData.total,
          status: "pending",
          orderTime: new Date(),
          tableNumber: orderData.tableNumber,
          sessionCode: orderData.sessionCode || getCurrentSessionCode(),
          estimatedMinutes: Math.floor(Math.random() * 20) + 10,
        };
        setOrders((prev) => [newOrder, ...prev]);
        return;
      }

      console.log("Adding order to Supabase:", orderData);

      // First, ensure menu items exist or create them
      const menuItemsToInsert = [];
      for (const item of orderData.items) {
        // Check if menu item exists
        const { data: existingItem } = await supabase
          .from("menu_items")
          .select("id")
          .eq("id", item.id)
          .single();

        if (!existingItem) {
          // Create menu item if it doesn't exist
          menuItemsToInsert.push({
            id: item.id,
            name: item.name,
            description: `Delicious ${item.name}`,
            price: item.price,
            image: item.image,
            category: "main",
            prep_time: 15,
            rating: 4.5,
          });
        }
      }

      if (menuItemsToInsert.length > 0) {
        const { error: menuError } = await supabase
          .from("menu_items")
          .insert(menuItemsToInsert);

        if (menuError) {
          console.error("Error creating menu items:", menuError);
        }
      }

      // Insert order
      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_number: orderData.tableNumber,
          session_code: orderData.sessionCode || getCurrentSessionCode(),
          total: orderData.total,
          status: "pending",
          estimated_minutes: Math.floor(Math.random() * 20) + 10,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        return;
      }

      console.log("Order created successfully:", orderResult);

      // Insert order items
      const orderItems = orderData.items.map((item) => ({
        order_id: orderResult.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        item_name: item.name,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        return;
      }

      console.log("Order items created successfully");

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  // Update entire order in database
  const updateOrder = async (orderId: string, updatedOrder: Partial<Order>) => {
    try {
      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, updating mock order");
        // Update local state only when Supabase is not configured
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, ...updatedOrder } : order,
          ),
        );
        return;
      }

      console.log(`Updating order ${orderId}:`, updatedOrder);

      // Update order in database
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          total: updatedOrder.total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (orderError) {
        console.error("Error updating order:", orderError);
        return;
      }

      // If items are updated, we need to update order_items table
      if (updatedOrder.items) {
        // Delete existing order items
        const { error: deleteError } = await supabase
          .from("order_items")
          .delete()
          .eq("order_id", orderId);

        if (deleteError) {
          console.error("Error deleting order items:", deleteError);
          return;
        }

        // Insert updated order items
        const orderItems = updatedOrder.items.map((item) => ({
          order_id: orderId,
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
          item_name: item.name,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("Error updating order items:", itemsError);
          return;
        }
      }

      console.log("Order updated successfully");

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Update order status in database
  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"],
  ) => {
    try {
      // Check if Supabase is properly configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, updating mock order status");
        // Update local state only when Supabase is not configured
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status } : order,
          ),
        );
        return;
      }

      console.log(`🔄 Updating order ${orderId} status to ${status}`);

      // Optimistic update - update UI immediately
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );

      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        console.error("❌ Error updating order status:", error);
        // Revert optimistic update on error
        await fetchOrders();
        throw error;
      }

      console.log("✅ Order status updated successfully in database");
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      throw error;
    }
  };

  // Refresh orders
  const refreshOrders = async () => {
    await fetchOrders();
  };

  // Fetch orders on mount and when URL changes
  useEffect(() => {
    fetchOrders();

    // Listen for URL changes (e.g., when navigating between different table sessions)
    const handleUrlChange = () => {
      const newTableNumber = getCurrentTableNumber();
      if (newTableNumber !== currentTableNumber) {
        console.log(
          `🔄 OrderContext: Table changed from ${currentTableNumber} to ${newTableNumber}, refetching orders`,
        );
        fetchOrders();
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [currentTableNumber]);

  // Set up real-time subscription for orders
  useEffect(() => {
    // Only set up subscription if Supabase is properly configured
    if (
      !import.meta.env.VITE_SUPABASE_URL ||
      !import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      return;
    }

    console.log("🔔 Setting up real-time subscription for orders");

    const tableNumber = getCurrentTableNumber();
    const subscription = supabase
      .channel(`orders_realtime_table_${tableNumber}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `table_number=eq.${tableNumber}`,
        },
        (payload) => {
          console.log(
            `🔔 Real-time order update received for table ${tableNumber}:`,
            payload,
          );
          fetchOrders();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        (payload) => {
          console.log(
            `🔔 Real-time order items update received for table ${tableNumber}:`,
            payload,
          );
          // Only refetch if this order item belongs to current table's orders
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      console.log("🔕 Unsubscribing from real-time updates");
      subscription.unsubscribe();
    };
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrder,
        updateOrderStatus,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
