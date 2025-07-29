import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/contexts/OrderContext";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  status: "Ready" | "In Progress" | "Completed" | "Archived";
  total: number;
  timestamp: string;
  dineIn: boolean;
  takeaway: boolean;
}

const OrdersDashboard = ({ orders: propOrders }: { orders?: Order[] }) => {
  const {
    orders: contextOrders,
    updateOrderStatus,
    refreshOrders,
    loading,
  } = useOrders();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Always prioritize context orders over prop orders or mock data
  // This ensures we're always showing the most up-to-date data from the database
  const orders =
    contextOrders.length > 0 || loading
      ? contextOrders.map((order) => ({
          id: order.id,
          tableNumber: order.tableNumber,
          customerName: `Customer ${order.tableNumber}`,
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          // status:
          //   order.status === "pending"
          //     ? ("In Progress" as const)
          //     : order.status === "preparing"
          //       ? ("In Progress" as const)
          //       : order.status === "ready"
          //         ? ("Ready" as const)
          //         : ("Completed" as const),
          status:
            order.status === "pending" || order.status === "preparing"
              ? ("In Progress" as const)
              : order.status === "ready"
                ? ("Ready" as const)
                : order.status === "archived"
                  ? ("Archived" as const)
                  : ("Completed" as const),

          total: order.total,
          timestamp: order.orderTime.toISOString(),
          dineIn: true,
          takeaway: false,
        }))
      : propOrders || mockOrders;

  const filteredOrders = orders.filter((order) => {
    // Always exclude archived orders from the dashboard
    if (order.status === "Archived") {
      return false;
    }

    // Filter by tab
    if (activeTab !== "all" && order.status.toLowerCase() !== activeTab) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.customerName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.tableNumber.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: "Ready" | "In Progress" | "Completed" | "Archived",
  ) => {
    console.log(
      `🔄 OrdersDashboard: Updating order ${orderId} to status: ${newStatus}`,
    );

    try {
      // Map dashboard statuses to context statuses
      const statusMap = {
        "In Progress": "preparing" as const,
        Ready: "ready" as const,
        Completed: "completed" as const,
        Archived: "archived" as const,
      };

      const contextStatus = statusMap[newStatus];
      if (contextStatus) {
        await updateOrderStatus(orderId, contextStatus);
        console.log(
          `✅ OrdersDashboard: Successfully updated order ${orderId} to ${newStatus}`,
        );
      } else {
        console.error(
          `❌ OrdersDashboard: Invalid status mapping for ${newStatus}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ OrdersDashboard: Failed to update order ${orderId}:`,
        error,
      );
      // Optionally show user-friendly error message
      throw error;
    }
  };

  const handleRefresh = async () => {
    console.log("🔄 OrdersDashboard: Manually refreshing orders...");
    setIsRefreshing(true);
    try {
      await refreshOrders();
      console.log("✅ OrdersDashboard: Orders refreshed successfully");
    } catch (error) {
      console.error("❌ OrdersDashboard: Failed to refresh orders:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="w-full h-full bg-background p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Orders Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8 w-full sm:w-[200px] lg:w-[250px] text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="sm"
              className="text-xs sm:text-sm"
            >
              <RefreshCw
                className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
              <span className="sm:hidden">↻</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-2">
              All Orders
            </TabsTrigger>
            <TabsTrigger
              value="in progress"
              className="text-xs sm:text-sm px-2 py-2"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger value="ready" className="text-xs sm:text-sm px-2 py-2">
              Ready
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-xs sm:text-sm px-2 py-2"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleUpdateOrderStatus}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {loading
                      ? "Loading orders from database..."
                      : "No orders found"}
                  </p>
                  {loading && (
                    <div className="mt-4">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  )}
                  {!loading && (
                    <div className="mt-4 space-y-2">
                      <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <RefreshCw
                          className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        Refresh Orders
                      </Button>
                      <p className="text-xs text-muted-foreground px-4">
                        {import.meta.env.VITE_SUPABASE_URL
                          ? "Connected to database - orders will appear here when placed"
                          : "Using demo data - configure database in project settings for live orders"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  onStatusChange: (
    orderId: string,
    status: "Ready" | "In Progress" | "Completed" | "Archived",
  ) => void;
}

const OrderCard = ({ order, onStatusChange }: OrderCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const handleStatusChange = async (
    newStatus: "Ready" | "In Progress" | "Completed" | "Archived",
  ) => {
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
        return "bg-green-500 text-white";
      case "in progress":
        return "bg-amber-500 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      case "archived":
        return "bg-slate-400 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col min-h-[280px] max-w-full">
      <CardHeader className="pb-1 px-2 sm:px-3 md:px-4 pt-2 sm:pt-3 md:pt-4 flex-shrink-0">
        <div className="flex justify-between items-start gap-1 sm:gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-[10px] sm:text-xs md:text-sm flex-shrink-0">
                {order.tableNumber}
              </div>
              <CardTitle className="text-xs sm:text-sm md:text-base truncate leading-tight">
                Table {order.tableNumber}
              </CardTitle>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate leading-tight">
              Order #{order.id}
            </p>
          </div>
          <Badge
            className={`${getStatusColor(order.status)} text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 py-0.5 flex-shrink-0 leading-none`}
          >
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-2 sm:px-3 md:px-4 pb-1 sm:pb-2 overflow-hidden">
        <div className="space-y-0.5 sm:space-y-1 h-full max-h-[120px] sm:max-h-[140px] md:max-h-[160px] overflow-y-auto scrollbar-thin">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="text-[10px] sm:text-xs md:text-sm break-words leading-tight"
            >
              <span className="font-medium text-primary">{item.quantity}x</span>
              <span className="ml-1">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-1 sm:gap-2 bg-muted/30 pt-1 sm:pt-2 px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4 flex-shrink-0 mt-auto">
        <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground text-center leading-tight">
          {new Date(order.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>

        <div className="flex flex-col w-full gap-1">
          {order.status === "In Progress" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusChange("Ready")}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-xs px-2 py-1 h-6 sm:h-7 md:h-8 w-full min-h-0 leading-none"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 animate-spin" />
                    <span className="hidden sm:inline">Updating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Mark Ready</span>
                    <span className="sm:hidden">Ready</span>
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("Completed")}
                disabled={isUpdating}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 text-[10px] sm:text-xs px-2 py-1 h-6 sm:h-7 md:h-8 w-full min-h-0 leading-none"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 animate-spin" />
                    <span className="hidden sm:inline">Completing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Skip to Complete</span>
                    <span className="sm:hidden">Skip</span>
                  </>
                )}
              </Button>
            </>
          )}
          {order.status === "Ready" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("Completed")}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs px-2 py-1 h-6 sm:h-7 md:h-8 w-full min-h-0 leading-none"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 animate-spin" />
                  <span className="hidden sm:inline">Completing...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Mark Complete</span>
                  <span className="sm:hidden">Complete</span>
                </>
              )}
            </Button>
          )}
          {order.status === "Completed" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("Archived")}
              disabled={isUpdating}
              className="bg-slate-600 hover:bg-slate-700 text-white text-[10px] sm:text-xs px-2 py-1 h-6 sm:h-7 md:h-8 w-full min-h-0 leading-none"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 animate-spin" />
                  <span className="hidden sm:inline">Archiving...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Archive Order</span>
                  <span className="sm:hidden">Archive</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: "#325",
    tableNumber: "A4",
    customerName: "Ariel Hikmat",
    items: [
      { name: "Scrambled eggs with toast", quantity: 1, price: 16.99 },
      { name: "Smoked Salmon Bagel", quantity: 1, price: 18.49 },
      { name: "Belgian Waffles", quantity: 2, price: 38.98 },
      { name: "Classic Lemonade", quantity: 1, price: 12.49 },
    ],
    status: "Ready",
    total: 87.34,
    timestamp: "2023-07-12T18:12:00",
    dineIn: true,
    takeaway: false,
  },
  {
    id: "#221",
    tableNumber: "B2",
    customerName: "Denis Freeman",
    items: [
      { name: "Classic Cheeseburger", quantity: 1, price: 19.99 },
      { name: "Fish and Chips", quantity: 2, price: 34.0 },
      { name: "Greek Gyro Plate", quantity: 1, price: 13.99 },
    ],
    status: "In Progress",
    total: 57.87,
    timestamp: "2023-07-12T18:18:00",
    dineIn: true,
    takeaway: false,
  },
  {
    id: "#326",
    tableNumber: "TA",
    customerName: "Morgan Cox",
    items: [
      { name: "Vegetarian Pad Thai", quantity: 1, price: 16.99 },
      { name: "Shrimp Tacos", quantity: 2, price: 19.49 },
      { name: "Belgian Waffles", quantity: 1, price: 38.98 },
    ],
    status: "In Progress",
    total: 86.96,
    timestamp: "2023-07-12T18:19:00",
    dineIn: false,
    takeaway: true,
  },
  {
    id: "#919",
    tableNumber: "TA",
    customerName: "Paul Rey",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 16.99 },
      { name: "Belgian Waffles", quantity: 1, price: 19.49 },
      { name: "Virgin Mojito", quantity: 2, price: 38.98 },
      { name: "Classic Lemonade", quantity: 2, price: 25.98 },
    ],
    status: "In Progress",
    total: 97.96,
    timestamp: "2023-07-12T18:18:00",
    dineIn: false,
    takeaway: true,
  },
  {
    id: "#912",
    tableNumber: "A9",
    customerName: "Maja Becker",
    items: [
      { name: "Feta Stuffed Mushrooms", quantity: 1, price: 18.99 },
      { name: "Lobster Ravioli", quantity: 1, price: 17.99 },
      { name: "Thai Coconut Curry", quantity: 2, price: 14.49 },
    ],
    status: "Completed",
    total: 98.34,
    timestamp: "2023-07-12T17:32:00",
    dineIn: true,
    takeaway: false,
  },
  {
    id: "#908",
    tableNumber: "C2",
    customerName: "Erwan Richard",
    items: [
      { name: "Creamy Garlic Chicken", quantity: 1, price: 15.99 },
      { name: "Greek Gyro Plate", quantity: 1, price: 13.99 },
      { name: "Belgian Waffles", quantity: 1, price: 12.99 },
    ],
    status: "Completed",
    total: 56.96,
    timestamp: "2023-07-12T17:20:00",
    dineIn: true,
    takeaway: false,
  },
];

export default OrdersDashboard;
