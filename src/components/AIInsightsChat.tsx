import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders } from "@/contexts/OrderContext";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIInsightsChat = () => {
  const { orders, loading } = useOrders();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI restaurant insights assistant. I can help you analyze your restaurant's performance, suggest menu optimizations, identify trends, and answer questions about your operations. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate AI responses based on real data from the database
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase();

    try {
      // Check if we have real data or are using mock data
      const isUsingMockData =
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY;
      const dataSource = isUsingMockData ? "demo" : "live";

      if (isUsingMockData) {
        console.log(
          "🤖 AIInsightsChat: Using demo data (database not connected)",
        );
      }

      if (message.includes("sales") || message.includes("revenue")) {
        const totalRevenue = orders.reduce(
          (sum, order) => sum + order.total,
          0,
        );
        const todayOrders = orders.filter((order) => {
          const orderDate = new Date(order.orderTime);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        });
        const todayRevenue = todayOrders.reduce(
          (sum, order) => sum + order.total,
          0,
        );

        return `Based on your current ${dataSource} data, you have ${orders.length} total orders with ${totalRevenue.toFixed(2)} in total revenue. Today you've had ${todayOrders.length} orders generating ${todayRevenue.toFixed(2)}. Your average order value is ${(totalRevenue / orders.length || 0).toFixed(2)}.${isUsingMockData ? " (Note: This is demo data. Connect to Supabase for real analytics.)" : ""}`;
      }

      if (message.includes("popular") || message.includes("menu")) {
        const itemCounts = new Map<string, number>();
        orders.forEach((order) => {
          order.items.forEach((item) => {
            itemCounts.set(
              item.name,
              (itemCounts.get(item.name) || 0) + item.quantity,
            );
          });
        });

        const sortedItems = Array.from(itemCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        if (sortedItems.length === 0) {
          return `No orders found yet in your ${dataSource} data. Once you have some orders, I can analyze your most popular menu items.${isUsingMockData ? " Connect to Supabase to track real menu performance." : ""}`;
        }

        const topItems = sortedItems
          .map(([name, count]) => `${name} (${count} orders)`)
          .join(", ");
        return `Your most popular items based on ${dataSource} data are: ${topItems}. These items are driving your sales and should be prominently featured in your menu.${isUsingMockData ? " (Demo data - connect to Supabase for real insights)" : ""}`;
      }

      if (message.includes("status") || message.includes("orders")) {
        const statusCounts = orders.reduce(
          (acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const statusSummary = Object.entries(statusCounts)
          .map(([status, count]) => `${count} ${status}`)
          .join(", ");

        return `Current order status from ${dataSource} data: ${statusSummary}. ${statusCounts.pending || 0} orders are waiting to be prepared, ${statusCounts.preparing || 0} are being prepared, and ${statusCounts.ready || 0} are ready for pickup.${isUsingMockData ? " (Demo data - connect to Supabase for real-time order tracking)" : ""}`;
      }

      if (message.includes("table") || message.includes("seating")) {
        const tableCounts = new Map<string, number>();
        orders.forEach((order) => {
          tableCounts.set(
            order.tableNumber,
            (tableCounts.get(order.tableNumber) || 0) + 1,
          );
        });

        const busyTables = Array.from(tableCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([table, count]) => `Table ${table} (${count} orders)`)
          .join(", ");

        return `Table activity from ${dataSource} data: ${busyTables}. These tables have had the most orders. Consider optimizing seating arrangements based on this data.${isUsingMockData ? " (Demo data - connect to Supabase for real table analytics)" : ""}`;
      }

      // Default response
      return `I can help you with insights about sales trends, menu performance, order status, and table management using your ${dataSource} data. Could you be more specific about what aspect of your restaurant you'd like to analyze?${isUsingMockData ? " Note: Currently using demo data - connect to Supabase in project settings for real analytics." : ""}`;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "I'm having trouble accessing your restaurant data right now. Please make sure your database connection is working properly.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Generate AI response with real data
      const responseContent = await generateAIResponse(currentMessage);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I encountered an error while analyzing your data. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollElement) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    };

    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  return (
    <Card className="bg-white h-full flex flex-col max-h-[600px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          AI Restaurant Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 h-full">
          <div className="space-y-4 pb-4 pt-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.sender === "ai" && (
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    message.sender === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-100 text-gray-900",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about sales, menu performance, efficiency..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsChat;
