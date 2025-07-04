import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MenuItemCard from "@/components/MenuItemCard";
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

interface MenuViewProps {
  onAddToCart?: (item: MenuItem) => void;
}

// Mock data for menu items
const initialMenuItems: MenuItem[] = [
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
    id: "6",
    name: "Fettuccine Alfredo",
    description: "Creamy pasta with parmesan cheese and fresh herbs",
    price: 19.99,
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80",
    category: "lunch",
    prepTime: 25,
    rating: 4.8,
    available: false,
  },
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
];

const MenuView = ({ onAddToCart = () => {} }: MenuViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter menu items based on search query and active category
  const filteredItems = menuItems.filter((item) => {
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
    ...new Set(menuItems.map((item) => item.category)),
  ];

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
          "🍽️  MenuView: Using initial menu items (database not connected)",
        );
        setMenuItems(initialMenuItems);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching menu items:", error);
        // Fallback to initial data
        setMenuItems(initialMenuItems);
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
        convertedItems.length > 0 ? convertedItems : initialMenuItems,
      );
      console.log(
        "✅ MenuView: Loaded",
        convertedItems.length,
        "menu items from database",
      );
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems(initialMenuItems);
    } finally {
      setLoading(false);
    }
  };

  // Load menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddItem = async (newItem: Omit<MenuItem, "id">) => {
    try {
      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, adding item locally");
        const item: MenuItem = {
          ...newItem,
          id: Date.now().toString(),
        };
        setMenuItems([...menuItems, item]);
        setIsAddDialogOpen(false);
        return;
      }

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          image: newItem.image,
          category: newItem.category,
          prep_time: newItem.prepTime,
          rating: newItem.rating,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding menu item:", error);
        return;
      }

      // Add to local state
      const newMenuItem: MenuItem = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        prepTime: data.prep_time,
        rating: data.rating,
        available: true,
      };

      setMenuItems([newMenuItem, ...menuItems]);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  };

  const handleEditItem = async (updatedItem: MenuItem) => {
    try {
      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, updating item locally");
        setMenuItems(
          menuItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        );
        setIsEditDialogOpen(false);
        setEditingItem(null);
        return;
      }

      const { error } = await supabase
        .from("menu_items")
        .update({
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          image: updatedItem.image,
          category: updatedItem.category,
          prep_time: updatedItem.prepTime,
          rating: updatedItem.rating,
        })
        .eq("id", updatedItem.id);

      if (error) {
        console.error("Error updating menu item:", error);
        return;
      }

      // Update local state
      setMenuItems(
        menuItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      );
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.log("Supabase not configured, deleting item locally");
        setMenuItems(menuItems.filter((item) => item.id !== id));
        return;
      }

      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) {
        console.error("Error deleting menu item:", error);
        return;
      }

      // Update local state
      setMenuItems(menuItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <MenuItemForm onSubmit={handleAddItem} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search menu items..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <Tabs
            defaultValue="all"
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              variant="admin"
              onEdit={(item) => {
                setEditingItem(item);
                setIsEditDialogOpen(true);
              }}
              onDelete={handleDeleteItem}
              onToggleAvailability={toggleAvailability}
            />
          ))}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <MenuItemForm
                initialData={editingItem}
                onSubmit={handleEditItem}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Menu Item Form Component
interface MenuItemFormProps {
  initialData?: MenuItem;
  onSubmit: (item: MenuItem | Omit<MenuItem, "id">) => void;
  isEditing?: boolean;
}

const MenuItemForm = ({
  initialData,
  onSubmit,
  isEditing = false,
}: MenuItemFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    image: initialData?.image || "",
    category: initialData?.category || "breakfast",
    prepTime: initialData?.prepTime || 10,
    rating: initialData?.rating || 4.0,
    available: initialData?.available ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="prepTime">Prep Time (min)</Label>
          <Input
            id="prepTime"
            type="number"
            value={formData.prepTime}
            onChange={(e) =>
              setFormData({ ...formData, prepTime: parseInt(e.target.value) })
            }
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="dessert">Dessert</option>
          <option value="drinks">Drinks</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        {isEditing ? "Update Item" : "Add Item"}
      </Button>
    </form>
  );
};

export default MenuView;
