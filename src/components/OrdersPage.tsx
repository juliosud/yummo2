import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  CreditCard,
  X,
  ChefHat,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrders } from "@/contexts/OrderContext";
import BottomNavigation from "@/components/BottomNavigation";

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
  estimatedMinutes?: number;
}

const OrdersPage = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [tableNumber, setTableNumber] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get table number from URL params or use first order's table number
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get("table");
    if (table) {
      setTableNumber(table);
    } else if (orders.length > 0) {
      setTableNumber(orders[0].tableNumber);
    }
  }, [orders]);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "preparing":
        return <Package className="h-4 w-4" />;
      case "ready":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "completed":
        return "Completed";
      default:
        return "Pending";
    }
  };

  const getTotalAmount = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getSubtotal = () => {
    return getTotalAmount();
  };

  const getTaxAmount = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTipAmount = () => {
    return getSubtotal() * (selectedTip / 100);
  };

  const getFinalTotal = () => {
    return getSubtotal() + getTaxAmount() + getTipAmount();
  };

  const handleSendToKitchen = () => {
    setShowPaymentDialog(true);
  };

  const handleConfirmSendToKitchen = async () => {
    setIsLoading(true);

    // Simulate 2-second loading
    setTimeout(async () => {
      setIsLoading(false);
      setShowConfirmation(true);

      // Update all pending orders to "preparing" status
      for (const order of orders) {
        if (order.status === "pending") {
          await updateOrderStatus(order.id, "preparing");
        }
      }

      // Hide confirmation after 3 seconds and close dialog
      setTimeout(() => {
        setShowConfirmation(false);
        setShowPaymentDialog(false);
      }, 3000);
    }, 2000);
  };

  const tipOptions = [15, 20, 25];

  return (
    <div className="bg-white min-h-screen w-full">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-6 py-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-6 py-6 space-y-6 pb-48">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-500 text-center">
              You haven't placed any orders yet.
            </p>
            <Button
              onClick={() => (window.location.href = "/menu")}
              className="mt-4 bg-gray-800 hover:bg-gray-900 rounded-full px-6"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden bg-white rounded-3xl shadow-lg border-0"
            >
              <CardContent className="p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600 font-medium">
                    Order #{order.id.slice(-4)}
                  </div>
                  <Badge
                    className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-2 rounded-full font-medium`}
                  >
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </Badge>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.id}`}
                      className="flex items-start sm:items-center gap-3 sm:gap-4"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight break-words">
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="font-bold text-gray-900 text-base sm:text-lg whitespace-nowrap">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 rounded-full px-2 sm:px-3 py-1.5 sm:py-2">
                          <button
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm flex items-center justify-center text-white transition-colors flex-shrink-0 ${
                              order.status === "preparing" ||
                              order.status === "ready" ||
                              order.status === "completed"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gray-900 hover:bg-black"
                            }`}
                            disabled={
                              order.status === "preparing" ||
                              order.status === "ready" ||
                              order.status === "completed"
                            }
                          >
                            <span className="text-sm sm:text-base font-medium leading-none">
                              −
                            </span>
                          </button>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 min-w-[20px] sm:min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shadow-sm flex items-center justify-center text-white transition-colors flex-shrink-0 ${
                              order.status === "preparing" ||
                              order.status === "ready" ||
                              order.status === "completed"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gray-900 hover:bg-black"
                            }`}
                            disabled={
                              order.status === "preparing" ||
                              order.status === "ready" ||
                              order.status === "completed"
                            }
                          >
                            <span className="text-sm sm:text-base font-medium leading-none">
                              +
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Send to Kitchen Section - Only show if there are pending orders */}
      {orders.length > 0 &&
        orders.some((order) => order.status === "pending") && (
          <div className="fixed bottom-20 left-0 right-0 bg-white px-6 py-6">
            <div className="max-w-sm mx-auto">
              {/* Send to Kitchen Button */}
              <Button
                onClick={handleSendToKitchen}
                className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 text-lg font-semibold flex items-center justify-center gap-3"
              >
                <ChefHat className="w-5 h-5" />
                Send to Kitchen
              </Button>
            </div>
          </div>
        )}

      {/* Send to Kitchen Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center mb-6">
              {showConfirmation ? "Order Sent!" : "Send to Kitchen"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {showConfirmation ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Your order has been sent to the kitchen!
                </p>
                <p className="text-gray-600">
                  The kitchen will start preparing your order shortly.
                </p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 text-gray-900 mx-auto mb-4 animate-spin" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Sending to kitchen...
                </p>
                <p className="text-gray-600">
                  Please wait while we process your order.
                </p>
              </div>
            ) : (
              <>
                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-medium">
                      {orders.reduce(
                        (total, order) =>
                          total +
                          order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          ),
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Table Number</span>
                    <span className="font-medium">#{tableNumber}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Order Total</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Send to Kitchen Button */}
                <Button
                  onClick={handleConfirmSendToKitchen}
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 text-lg font-semibold flex items-center justify-center gap-3"
                >
                  <ChefHat className="w-5 h-5" />
                  Confirm Send to Kitchen
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="orders" />
    </div>
  );
};

export default OrdersPage;
