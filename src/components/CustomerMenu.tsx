import React, { useState, useEffect } from "react";
import { Search, Filter, Clock, Star, Plus, Minus } from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MenuItemCard, { MenuItemListCard } from "@/components/MenuItemCard";
import BottomNavigation from "@/components/BottomNavigation";
import SessionGuard from "@/components/SessionGuard";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  prepTime: number;
  rating: number;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

// Mock data for menu items (same as restaurant menu but filtered for available items)
const staticMenuItems: MenuItem[] = [
  // Breakfast Items
  {
    id: "1",
    name: "Pear & Orange",
    description: "Delicious breakfast with pear and orange flavors",
    price: 25.0,
    image:
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80",
    category: "breakfast",
    prepTime: 20,
    rating: 4.8,
    available: true,
  },
  {
    id: "3",
    name: "Egg & Bread",
    description: "Classic breakfast with farm fresh eggs and artisan bread",
    price: 25.0,
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80",
    category: "breakfast",
    prepTime: 10,
    rating: 4.7,
    available: true,
  },
  {
    id: "4",
    name: "Sweet Pancake",
    description: "Fluffy pancakes with maple syrup and fresh berries",
    price: 13.0,
    image:
      "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&q=80",
    category: "breakfast",
    prepTime: 20,
    rating: 4.9,
    available: true,
  },
  {
    id: "9",
    name: "Avocado Toast",
    description:
      "Sourdough toast topped with smashed avocado, cherry tomatoes, and feta",
    price: 16.0,
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=80",
    category: "breakfast",
    prepTime: 8,
    rating: 4.6,
    available: true,
  },
  {
    id: "10",
    name: "French Toast",
    description: "Thick-cut brioche French toast with cinnamon and vanilla",
    price: 18.0,
    image:
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80",
    category: "breakfast",
    prepTime: 15,
    rating: 4.8,
    available: true,
  },
  {
    id: "11",
    name: "Breakfast Burrito",
    description:
      "Scrambled eggs, bacon, cheese, and hash browns wrapped in a flour tortilla",
    price: 14.5,
    image:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80",
    category: "breakfast",
    prepTime: 12,
    rating: 4.5,
    available: true,
  },

  // Lunch Items
  {
    id: "2",
    name: "Meat & Mushrooms",
    description: "Savory dish with premium meat and wild mushrooms",
    price: 37.0,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    category: "lunch",
    prepTime: 30,
    rating: 5.0,
    available: true,
  },
  {
    id: "5",
    name: "Shrimp Salad",
    description: "Fresh salad with grilled shrimp and citrus dressing",
    price: 22.5,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    category: "lunch",
    prepTime: 15,
    rating: 4.6,
    available: true,
  },
  {
    id: "12",
    name: "Grilled Chicken Sandwich",
    description:
      "Juicy grilled chicken breast with lettuce, tomato, and mayo on brioche",
    price: 19.0,
    image:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&q=80",
    category: "lunch",
    prepTime: 18,
    rating: 4.7,
    available: true,
  },
  {
    id: "13",
    name: "Caesar Salad",
    description:
      "Crisp romaine lettuce with parmesan, croutons, and Caesar dressing",
    price: 16.5,
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80",
    category: "lunch",
    prepTime: 10,
    rating: 4.4,
    available: true,
  },
  {
    id: "14",
    name: "Fish Tacos",
    description:
      "Grilled fish with cabbage slaw and chipotle mayo in corn tortillas",
    price: 21.0,
    image:
      "https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&q=80",
    category: "lunch",
    prepTime: 20,
    rating: 4.8,
    available: true,
  },
  {
    id: "15",
    name: "Beef Burger",
    description:
      "Angus beef patty with cheese, lettuce, tomato, and special sauce",
    price: 24.0,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    category: "lunch",
    prepTime: 25,
    rating: 4.9,
    available: true,
  },
  {
    id: "16",
    name: "Pasta Carbonara",
    description: "Creamy pasta with bacon, eggs, parmesan, and black pepper",
    price: 26.0,
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&q=80",
    category: "lunch",
    prepTime: 22,
    rating: 4.7,
    available: true,
  },
  {
    id: "17",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomatoes, and basil",
    price: 28.0,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
    category: "lunch",
    prepTime: 35,
    rating: 4.6,
    available: true,
  },

  // Dinner Items
  {
    id: "18",
    name: "Grilled Salmon",
    description:
      "Atlantic salmon with lemon herb butter and seasonal vegetables",
    price: 32.0,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
    category: "dinner",
    prepTime: 25,
    rating: 4.8,
    available: true,
  },
  {
    id: "19",
    name: "Ribeye Steak",
    description: "12oz ribeye steak with garlic mashed potatoes and asparagus",
    price: 45.0,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
    category: "dinner",
    prepTime: 40,
    rating: 4.9,
    available: true,
  },
  {
    id: "20",
    name: "Lobster Risotto",
    description: "Creamy arborio rice with fresh lobster and white wine",
    price: 38.0,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80",
    category: "dinner",
    prepTime: 35,
    rating: 4.7,
    available: true,
  },
  {
    id: "21",
    name: "Lamb Chops",
    description:
      "Herb-crusted lamb chops with rosemary jus and roasted vegetables",
    price: 42.0,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
    category: "dinner",
    prepTime: 30,
    rating: 4.8,
    available: true,
  },

  // Desserts
  {
    id: "7",
    name: "Chocolate Cake",
    description: "Rich chocolate cake with ganache frosting",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    category: "dessert",
    prepTime: 10,
    rating: 4.9,
    available: true,
  },
  {
    id: "22",
    name: "Tiramisu",
    description:
      "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
    price: 9.5,
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80",
    category: "dessert",
    prepTime: 5,
    rating: 4.8,
    available: true,
  },
  {
    id: "23",
    name: "Crème Brûlée",
    description: "Vanilla custard with caramelized sugar crust",
    price: 10.0,
    image:
      "https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=400&q=80",
    category: "dessert",
    prepTime: 8,
    rating: 4.7,
    available: true,
  },
  {
    id: "24",
    name: "Cheesecake",
    description: "New York style cheesecake with berry compote",
    price: 9.0,
    image:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80",
    category: "dessert",
    prepTime: 5,
    rating: 4.6,
    available: true,
  },
  {
    id: "25",
    name: "Ice Cream Sundae",
    description:
      "Vanilla ice cream with chocolate sauce, whipped cream, and cherry",
    price: 7.5,
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80",
    category: "dessert",
    prepTime: 3,
    rating: 4.5,
    available: true,
  },

  // Drinks
  {
    id: "8",
    name: "Fresh Fruit Smoothie",
    description: "Refreshing smoothie with seasonal fruits",
    price: 7.5,
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80",
    category: "drinks",
    prepTime: 5,
    rating: 4.7,
    available: true,
  },
  {
    id: "26",
    name: "Craft Beer",
    description: "Local IPA with citrus and pine notes",
    price: 6.0,
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80",
    category: "drinks",
    prepTime: 2,
    rating: 4.4,
    available: true,
  },
  {
    id: "27",
    name: "House Wine",
    description: "Cabernet Sauvignon from local vineyard",
    price: 8.0,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
    category: "drinks",
    prepTime: 2,
    rating: 4.3,
    available: true,
  },
  {
    id: "28",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 5.0,
    image:
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
    category: "drinks",
    prepTime: 3,
    rating: 4.6,
    available: true,
  },
  {
    id: "29",
    name: "Espresso",
    description: "Rich, bold espresso shot",
    price: 3.5,
    image:
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80",
    category: "drinks",
    prepTime: 2,
    rating: 4.8,
    available: true,
  },
  {
    id: "30",
    name: "Iced Tea",
    description: "Refreshing iced tea with lemon",
    price: 4.0,
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
    category: "drinks",
    prepTime: 3,
    rating: 4.2,
    available: true,
  },
];

const CustomerMenuContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    cartItems,
    addToCart: addToCartContext,
    removeFromCart: removeFromCartContext,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  } = useCart();

  // Fetch menu items from database
  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log(
          "🍽️  CustomerMenu: Using static menu items (database not connected)",
        );
        setMenuItems(staticMenuItems);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching menu items:", error);
        // Fallback to static data
        setMenuItems(staticMenuItems);
        return;
      }

      // Convert database format to component format
      const convertedItems: MenuItem[] =
        data?.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category: item.category,
          prepTime: item.prep_time,
          rating: item.rating,
          available: true, // Default to available
        })) || [];

      setMenuItems(
        convertedItems.length > 0 ? convertedItems : staticMenuItems,
      );
      console.log(
        "✅ CustomerMenu: Loaded",
        convertedItems.length,
        "menu items from database",
      );
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems(staticMenuItems);
    } finally {
      setLoading(false);
    }
  };

  // Get table number from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get("table");
    if (table) {
      setTableNumber(table);
    }

    // Fetch menu items
    fetchMenuItems();
  }, []);

  // Reset tabs scroll position and active category on component mount
  useEffect(() => {
    // Always reset to "all" category first
    setActiveCategory("all");

    const resetTabsScroll = () => {
      const tabsList = document.querySelector('[role="tablist"]');
      if (tabsList) {
        // Reset scroll position to 0
        tabsList.scrollLeft = 0;

        // Force a reflow to ensure the scroll position is applied
        tabsList.offsetHeight;

        // Also try scrollTo method as backup
        if (tabsList.scrollTo) {
          tabsList.scrollTo({ left: 0, behavior: "auto" });
        }

        // Additional reset using style property
        (tabsList as HTMLElement).style.scrollBehavior = "auto";
        tabsList.scrollLeft = 0;

        // Reset any transform that might affect positioning
        const firstTab =
          tabsList.querySelector('[data-state="active"]') ||
          tabsList.querySelector('[role="tab"]');
        if (firstTab) {
          (firstTab as HTMLElement).scrollIntoView({
            behavior: "auto",
            block: "nearest",
            inline: "start",
          });
        }
      }
    };

    // Multiple reset attempts with different timing
    const resetWithRAF = () => {
      requestAnimationFrame(() => {
        resetTabsScroll();
        requestAnimationFrame(() => {
          resetTabsScroll();
          // Third RAF for extra safety
          requestAnimationFrame(resetTabsScroll);
        });
      });
    };

    // Immediate reset
    resetTabsScroll();
    resetWithRAF();

    // Extended fallback timeouts for edge cases
    const timeouts = [
      setTimeout(resetTabsScroll, 10),
      setTimeout(resetTabsScroll, 50),
      setTimeout(resetTabsScroll, 100),
      setTimeout(resetTabsScroll, 200),
      setTimeout(resetTabsScroll, 400),
      setTimeout(resetTabsScroll, 800),
    ];

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Filter available menu items based on search query and active category
  const availableItems = menuItems.filter((item) => item.available);
  const filteredItems = availableItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for the tabs
  const categories = [
    "all",
    ...new Set(availableItems.map((item) => item.category)),
  ];

  const addToCart = async (item: MenuItem) => {
    console.log("Adding to cart:", item.name);
    await addToCartContext({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  const removeFromCart = async (itemId: string) => {
    console.log("Removing from cart:", itemId);
    await removeFromCartContext(itemId);
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsItemDialogOpen(true);
  };

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-6 py-6">
        {/* Table Number Indicator */}
        {tableNumber && (
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium">
              Table {tableNumber}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-0">
          <div className="flex gap-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-12 h-14 text-base bg-gray-50 border-0 rounded-l-2xl rounded-r-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="h-14 px-4 bg-gray-800 hover:bg-gray-900 rounded-r-2xl rounded-l-none"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Tabs - Fixed Sticky Position */}
      <div className="bg-white px-6 pt-2 pb-2 sticky top-[116px] z-30">
        <Tabs
          key={activeCategory} // Force re-render when category changes
          defaultValue="all"
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList
            className="bg-transparent p-0 h-auto flex overflow-x-auto gap-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <style jsx>{`
              .bg-transparent::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className={`capitalize px-6 py-3 rounded-full font-medium whitespace-nowrap flex-shrink-0 text-sm transition-colors ${
                  activeCategory === category
                    ? "bg-gray-800 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category === "all" ? "All" : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Menu Items Grid */}
      <div className="bg-white px-6 pt-6 pb-24">
        {/* Popular Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Popular</h2>
            <button className="text-sm text-gray-700 font-medium">
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredItems.slice(0, 4).map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                variant="customer"
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onItemClick={handleItemClick}
                cartQuantity={getItemQuantity(item.id)}
              />
            ))}
          </div>
        </div>

        {/* All Items Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Items</h2>
            <button className="text-sm text-gray-700 font-medium">
              See all
            </button>
          </div>

          <div className="space-y-4">
            {filteredItems.slice(4).map((item) => (
              <MenuItemListCard
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onItemClick={handleItemClick}
                cartQuantity={getItemQuantity(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">No menu items found.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />

      {/* Item Detail Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-xs mx-auto bg-white rounded-3xl border-0 shadow-2xl">
          {selectedItem && (
            <div className="p-0">
              {/* Image */}
              <div className="relative w-full h-48 rounded-t-3xl overflow-hidden">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">
                      {selectedItem.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <DialogHeader className="text-left p-0 space-y-3">
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {selectedItem.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Description */}
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {selectedItem.description}
                </p>

                {/* Macro Info */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Nutrition Info
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">320</div>
                      <div className="text-xs text-gray-500">Calories</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">12g</div>
                      <div className="text-xs text-gray-500">Protein</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">8g</div>
                      <div className="text-xs text-gray-500">Fat</div>
                    </div>
                  </div>
                </div>

                {/* Price and Prep Time */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{selectedItem.prepTime} min</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${selectedItem.price.toFixed(2)}
                  </div>
                </div>

                {/* Add to Cart Section */}
                <div className="flex items-center justify-between">
                  {getItemQuantity(selectedItem.id) > 0 ? (
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => removeFromCart(selectedItem.id)}
                        className="bg-gray-900 hover:bg-black text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-lg font-bold min-w-[32px] text-center bg-gray-100 rounded-full px-3 py-2">
                        {getItemQuantity(selectedItem.id)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(selectedItem)}
                        className="bg-gray-900 hover:bg-black text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => addToCart(selectedItem)}
                      className="bg-gray-900 hover:bg-black text-white rounded-full px-8 py-3 text-base font-medium flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CustomerMenu = () => {
  return (
    <SessionGuard>
      <CustomerMenuContent />
    </SessionGuard>
  );
};

export default CustomerMenu;
