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
import { useCart } from "@/contexts/CartContext";
import BottomNavigation from "@/components/BottomNavigation";
import SessionGuard from "@/components/SessionGuard";

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

const OrdersPageContent = () => {
  const { orders, updateOrderStatus, addOrder } = useOrders();
  const { cartItems, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Debug: Log orders to see their structure
  useEffect(() => {
    console.log("📋 OrdersPage: Current orders:", orders);
    orders.forEach((order, index) => {
      console.log(`📋 Order ${index + 1}:`, {
        id: order.id,
        itemsCount: order.items?.length || 0,
        items: order.items,
        status: order.status,
        total: order.total,
      });
    });
  }, [orders]);

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

  const handleSendToKitchen = async () => {
    setIsLoading(true);

    try {
      // If there are cart items, convert them to an order first
      if (cartItems.length > 0) {
        console.log("Sending cart to kitchen:", cartItems);

        // Convert cart items to order items format
        const orderItems = cartItems.map((cartItem) => ({
          id: cartItem.menuItemId,
          name: cartItem.name,
          price: cartItem.price,
          quantity: cartItem.quantity,
          image: cartItem.image,
        }));

        // Calculate total
        const total = getTotalPrice();

        // Create order in the orders table with "preparing" status
        await addOrder({
          items: orderItems,
          total: total,
          tableNumber: tableNumber || "1",
        });

        // Clear the cart after successful order creation
        await clearCart();
        console.log("Cart items sent to kitchen successfully, cart cleared");
      }

      // Update all pending orders to "preparing" status
      orders.forEach((order) => {
        if (order.status === "pending") {
          updateOrderStatus(order.id, "preparing");
        }
      });

      setIsLoading(false);
      setShowConfirmation(true);
      setShowPaymentDialog(true);

      // Hide confirmation after 3 seconds and close dialog
      setTimeout(() => {
        setShowConfirmation(false);
        setShowPaymentDialog(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to send order to kitchen:", error);
      setIsLoading(false);
      // Optionally show error message to user
    }
  };

  const handleConfirmSendToKitchen = async () => {
    setIsLoading(true);

    try {
      // If there are cart items, convert them to an order first
      if (cartItems.length > 0) {
        console.log("Sending cart to kitchen:", cartItems);

        // Convert cart items to order items format
        const orderItems = cartItems.map((cartItem) => ({
          id: cartItem.menuItemId,
          name: cartItem.name,
          price: cartItem.price,
          quantity: cartItem.quantity,
          image: cartItem.image,
        }));

        // Calculate total
        const total = getTotalPrice();

        // Create order in the orders table
        await addOrder({
          items: orderItems,
          total: total,
          tableNumber: tableNumber || "1",
        });

        // Clear the cart after successful order creation
        await clearCart();
        console.log("Cart items sent to kitchen successfully, cart cleared");
      }

      // Update all pending orders to "preparing" status
      orders.forEach((order) => {
        if (order.status === "pending") {
          updateOrderStatus(order.id, "preparing");
        }
      });

      setIsLoading(false);
      setShowConfirmation(true);

      // Hide confirmation after 3 seconds and close dialog
      setTimeout(() => {
        setShowConfirmation(false);
        setShowPaymentDialog(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to send order to kitchen:", error);
      setIsLoading(false);
      // Optionally show error message to user
    }
  };

  const tipOptions = [15, 20, 25];

  return (
    <div className="bg-white min-h-screen w-full">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          </div>
          {tableNumber && (
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
              Table {tableNumber}
            </div>
          )}
        </div>
      </div>

      {/* Cart Items Section - Show items in cart */}
      {cartItems.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-900">
              Items in Cart ({getTotalItems()} items)
            </h2>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Ready to Order
            </div>
          </div>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-blue-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-base">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end mt-1">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900">Cart Total:</span>
              <span className="font-bold text-xl text-blue-900">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="px-6 py-6 space-y-6 pb-48">
        {orders.length === 0 && cartItems.length === 0 ? (
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
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.id}`}
                        className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight break-words mb-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <p className="font-bold text-gray-900 text-base sm:text-lg whitespace-nowrap">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-full px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm border">
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
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl">
                      <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No items found for this order
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Order ID: {order.id}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-700">
                      Order Total:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Placed: {order.orderTime.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Send to Kitchen Section */}
      {(orders.length > 0 || cartItems.length > 0) && (
        <div className="fixed bottom-20 left-0 right-0 bg-white px-6 py-6">
          <div className="max-w-sm mx-auto">
            {/* Send to Kitchen Button */}
            <Button
              onClick={handleSendToKitchen}
              disabled={
                isLoading ||
                (cartItems.length === 0 &&
                  !orders.some((order) => order.status === "pending"))
              }
              className={`w-full rounded-2xl py-4 text-lg font-semibold flex items-center justify-center gap-3 ${
                cartItems.length > 0 ||
                orders.some((order) => order.status === "pending")
                  ? "bg-gray-900 hover:bg-black text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5" />
                  Send to Kitchen
                </>
              )}
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
                      {getTotalItems() +
                        orders.reduce(
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
                      <span>
                        ${(getTotalPrice() + getTotalAmount()).toFixed(2)}
                      </span>
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

const OrdersPage = () => {
  return (
    <SessionGuard>
      <OrdersPageContent />
    </SessionGuard>
  );
};

export default OrdersPage;
