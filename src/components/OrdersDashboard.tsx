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
import { Search, RefreshCw } from "lucide-react";
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
  status: "Ready" | "In Progress" | "Completed";
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

  // Use orders from context if available, otherwise use prop orders or mock data
  const orders =
    contextOrders.length > 0
      ? contextOrders.map((order) => ({
          id: order.id,
          tableNumber: order.tableNumber,
          customerName: `Customer ${order.tableNumber}`,
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          status:
            order.status === "pending"
              ? ("In Progress" as const)
              : order.status === "preparing"
                ? ("In Progress" as const)
                : order.status === "ready"
                  ? ("Ready" as const)
                  : ("Completed" as const),
          total: order.total,
          timestamp: order.orderTime.toISOString(),
          dineIn: true,
          takeaway: false,
        }))
      : propOrders || mockOrders;

  const filteredOrders = orders.filter((order) => {
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
    newStatus: "Ready" | "In Progress" | "Completed",
  ) => {
    console.log(`Updating order ${orderId} to status: ${newStatus}`);

    // Map dashboard statuses to context statuses
    const statusMap = {
      "In Progress": "preparing" as const,
      Ready: "ready" as const,
      Completed: "completed" as const,
    };

    const contextStatus = statusMap[newStatus];
    if (contextStatus) {
      await updateOrderStatus(orderId, contextStatus);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Orders Dashboard</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="in progress">In Progress</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-muted-foreground">
                    {loading ? "Loading orders..." : "No orders found"}
                  </p>
                  {!loading && (
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      className="mt-4"
                      disabled={isRefreshing}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      Refresh Orders
                    </Button>
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
    status: "Ready" | "In Progress" | "Completed",
  ) => void;
}

const OrderCard = ({ order, onStatusChange }: OrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
        return "bg-green-500 text-white";
      case "in progress":
        return "bg-amber-500 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {order.tableNumber}
              </div>
              <CardTitle>{order.customerName}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Order #{order.id}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border flex justify-between font-medium">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/30 pt-2">
        <div className="text-xs text-muted-foreground">
          {new Date(order.timestamp).toLocaleTimeString()} •
          {order.dineIn ? "Dine In" : ""}
          {order.dineIn && order.takeaway ? " / " : ""}
          {order.takeaway ? "Takeaway" : ""}
        </div>
        <div className="flex space-x-2">
          {order.status !== "Completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(order.id, "Completed")}
            >
              Mark Complete
            </Button>
          )}
          {order.status === "In Progress" && (
            <Button size="sm" onClick={() => onStatusChange(order.id, "Ready")}>
              Mark Ready
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
