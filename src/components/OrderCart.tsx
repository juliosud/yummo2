import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderCartProps {
  items?: OrderItem[];
  tableNumber?: string;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  onPlaceOrder?: () => void;
  orderStatus?: "pending" | "placed" | "preparing" | "ready" | "completed";
  estimatedTime?: number;
}

const OrderCart = ({
  items = [
    { id: "1", name: "Vegetarian Pad Thai", price: 14.99, quantity: 1 },
    { id: "2", name: "Shrimp Tacos", price: 19.49, quantity: 2 },
    { id: "3", name: "Belgian Waffles", price: 12.99, quantity: 1 },
  ],
  tableNumber = "TA",
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
  onPlaceOrder = () => {},
  orderStatus = "pending",
  estimatedTime = 25,
}: OrderCartProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onPlaceOrder();
      setIsSubmitting(false);
    }, 1500);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const getProgressValue = () => {
    switch (orderStatus) {
      case "placed":
        return 25;
      case "preparing":
        return 50;
      case "ready":
        return 100;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusText = () => {
    switch (orderStatus) {
      case "placed":
        return "Order Received";
      case "preparing":
        return "Preparing Your Order";
      case "ready":
        return "Order Ready for Pickup";
      case "completed":
        return "Order Completed";
      default:
        return "Cart";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            {orderStatus === "pending" ? (
              <span className="flex items-center gap-2">
                <ShoppingBag size={20} />
                Your Order
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Clock size={20} />
                {getStatusText()}
              </span>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            Table {tableNumber}
          </Badge>
        </div>

        {orderStatus !== "pending" && (
          <div className="mt-2">
            <Progress value={getProgressValue()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Received</span>
              <span>Preparing</span>
              <span>Ready</span>
            </div>
            {estimatedTime > 0 &&
              orderStatus !== "ready" &&
              orderStatus !== "completed" && (
                <p className="text-sm text-center mt-2">
                  Estimated time:{" "}
                  <span className="font-medium">{estimatedTime} min</span>
                </p>
              )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="mx-auto text-muted-foreground" size={40} />
            <p className="mt-2 text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li
                key={item.id}
                className="p-4 flex justify-between items-center"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {orderStatus === "pending" ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="font-medium">{item.quantity}x</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="p-4 bg-slate-50">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {orderStatus === "ready" && (
          <Alert className="m-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Your order is ready! Please pick it up at the counter.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="p-4 bg-white border-t">
        {orderStatus === "pending" && items.length > 0 && (
          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        )}

        {orderStatus === "placed" || orderStatus === "preparing" ? (
          <div className="w-full text-center text-sm text-muted-foreground">
            We'll notify you when your order is ready
          </div>
        ) : null}

        {orderStatus === "ready" && (
          <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
            Confirm Pickup
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrderCart;
