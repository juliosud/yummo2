import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders } from "@/contexts/OrderContext";
import { supabase, executeRawQuery } from "@/lib/supabase";

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
        "Hello! I'm your AI restaurant insights assistant with full database access. Just ask me any question about your restaurant - I'll automatically detect if I need to pull data from your database to answer it. You can ask in plain English about sales, popular items, table performance, customer analytics, or anything else. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Execute SQL query and format results
  const executeSQLQuery = async (query: string) => {
    try {
      const { data, error } = await executeRawQuery(query);

      if (error) {
        return `❌ Query error: ${error.message}`;
      }

      if (!data || data.length === 0) {
        return "No results found for your query.";
      }

      // Format results as a table-like string
      const columns = Object.keys(data[0]);
      const maxRows = 10; // Limit results to prevent overwhelming response
      const limitedData = data.slice(0, maxRows);

      let result = `Found ${data.length} result(s)${data.length > maxRows ? ` (showing first ${maxRows})` : ""}:\n\n`;

      // Create a simple table format
      result += columns.join(" | ") + "\n";
      result += columns.map(() => "---").join(" | ") + "\n";

      limitedData.forEach((row) => {
        result +=
          columns.map((col) => String(row[col] || "")).join(" | ") + "\n";
      });

      return result;
    } catch (error) {
      console.error("SQL execution error:", error);
      return `❌ Error executing query: ${error.message || "Unknown error"}`;
    }
  };

  // Intelligent query detection - determines if a question needs database data
  const needsDatabaseData = (message: string): boolean => {
    const dataKeywords = [
      // Numbers and analytics
      "how many",
      "how much",
      "total",
      "count",
      "average",
      "sum",
      "revenue",
      "sales",
      "profit",
      // Time-based queries
      "today",
      "yesterday",
      "this week",
      "last week",
      "this month",
      "recent",
      "latest",
      // Comparisons and rankings
      "most",
      "least",
      "best",
      "worst",
      "top",
      "bottom",
      "popular",
      "unpopular",
      "highest",
      "lowest",
      // Status and operational
      "pending",
      "ready",
      "preparing",
      "completed",
      "active",
      "busy",
      "slow",
      // Business entities
      "orders",
      "customers",
      "tables",
      "menu",
      "items",
      "dishes",
      "food",
      "drinks",
      // Performance metrics
      "performance",
      "trends",
      "analysis",
      "insights",
      "statistics",
      "metrics",
      // Questions about specific data
      "which",
      "what",
      "who",
      "when",
      "where",
      "list",
      "show me",
      "tell me about",
    ];

    return dataKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword),
    );
  };

  // Smart query generator based on natural language
  const generateSmartQuery = async (
    userMessage: string,
  ): Promise<string | null> => {
    const message = userMessage.toLowerCase();

    // Revenue and sales queries
    if (
      message.includes("revenue") ||
      message.includes("sales") ||
      message.includes("money") ||
      message.includes("total")
    ) {
      if (message.includes("today")) {
        return `
          SELECT 
            COUNT(*) as order_count,
            SUM(total) as total_revenue,
            AVG(total) as avg_order_value,
            MIN(total) as min_order,
            MAX(total) as max_order
          FROM orders 
          WHERE DATE(created_at) = CURRENT_DATE
        `;
      } else if (message.includes("week") || message.includes("7 days")) {
        return `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as order_count,
            SUM(total) as total_revenue,
            AVG(total) as avg_order_value
          FROM orders 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
      } else {
        return `
          SELECT 
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            AVG(total) as avg_order_value,
            MIN(created_at) as first_order,
            MAX(created_at) as latest_order
          FROM orders
        `;
      }
    }

    // Popular items queries
    if (
      message.includes("popular") ||
      message.includes("best") ||
      message.includes("top") ||
      (message.includes("most") &&
        (message.includes("ordered") || message.includes("sold")))
    ) {
      const timeFilter = message.includes("today")
        ? "AND o.created_at >= CURRENT_DATE"
        : message.includes("week")
          ? "AND o.created_at >= CURRENT_DATE - INTERVAL '7 days'"
          : "";

      return `
        SELECT 
          mi.name,
          mi.category,
          mi.price,
          COUNT(oi.id) as order_count,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.price * oi.quantity) as total_revenue
        FROM menu_items mi
        JOIN order_items oi ON mi.id = oi.menu_item_id
        JOIN orders o ON oi.order_id = o.id
        WHERE 1=1 ${timeFilter}
        GROUP BY mi.id, mi.name, mi.category, mi.price
        ORDER BY total_quantity DESC
        LIMIT 10
      `;
    }

    // Order status queries
    if (
      message.includes("orders") &&
      (message.includes("status") ||
        message.includes("pending") ||
        message.includes("ready") ||
        message.includes("preparing"))
    ) {
      const timeFilter = message.includes("today")
        ? "WHERE created_at >= CURRENT_DATE"
        : "";

      return `
        SELECT 
          status,
          COUNT(*) as count,
          AVG(total) as avg_value,
          MIN(created_at) as oldest_order,
          MAX(created_at) as newest_order
        FROM orders 
        ${timeFilter}
        GROUP BY status
        ORDER BY count DESC
      `;
    }

    // Table performance queries
    if (
      message.includes("table") &&
      (message.includes("busy") ||
        message.includes("performance") ||
        message.includes("most") ||
        message.includes("revenue"))
    ) {
      return `
        SELECT 
          t.name as table_name,
          t.seats,
          t.status,
          t.table_type,
          COUNT(o.id) as total_orders,
          SUM(o.total) as total_revenue,
          AVG(o.total) as avg_order_value
        FROM tables t
        LEFT JOIN orders o ON t.table_id = o.table_number AND o.created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY t.id, t.name, t.seats, t.status, t.table_type
        ORDER BY total_orders DESC NULLS LAST
      `;
    }

    // Customer queries
    if (
      message.includes("customer") &&
      (message.includes("how many") ||
        message.includes("count") ||
        message.includes("total"))
    ) {
      return `
        SELECT 
          COUNT(DISTINCT COALESCE(customer_name, table_number)) as unique_customers,
          COUNT(*) as total_orders,
          AVG(total) as avg_spend_per_order
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      `;
    }

    // Menu analysis
    if (
      message.includes("menu") &&
      (message.includes("how many") ||
        message.includes("count") ||
        message.includes("categories"))
    ) {
      return `
        SELECT 
          category,
          COUNT(*) as item_count,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM menu_items
        GROUP BY category
        ORDER BY item_count DESC
      `;
    }

    // Time-based analysis
    if (
      message.includes("hour") ||
      message.includes("time") ||
      message.includes("when")
    ) {
      return `
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as order_count,
          SUM(total) as revenue,
          AVG(total) as avg_order_value
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour
      `;
    }

    return null;
  };

  // Generate AI responses with intelligent data fetching
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
        return "❌ **Database Not Connected**\n\nTo enable AI insights with real data:\n1. Go to project settings in Tempo\n2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n3. Run the SQL setup from src/lib/supabase-ai-setup.sql\n\nCurrently using demo data for basic functionality.";
      }

      // Check if user is asking for explicit SQL query or database schema
      if (
        message.includes("sql") ||
        message.includes("query") ||
        message.includes("select") ||
        message.includes("table")
      ) {
        if (
          message.includes("schema") ||
          message.includes("tables") ||
          message.includes("structure")
        ) {
          // Show available tables
          const schemaQuery = `
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position
          `;
          return await executeSQLQuery(schemaQuery);
        }

        // Try to extract and execute SQL query from user message
        const sqlMatch = message.match(/(?:select|with)\s+[\s\S]*?(?:;|$)/i);
        if (sqlMatch) {
          const query = sqlMatch[0].replace(/;$/, ""); // Remove trailing semicolon
          return await executeSQLQuery(query);
        }
      }

      // Intelligent data fetching - check if question needs database data
      if (needsDatabaseData(userMessage)) {
        console.log(
          "🤖 AI detected question needs database data, generating smart query...",
        );

        const smartQuery = await generateSmartQuery(userMessage);
        if (smartQuery) {
          const result = await executeSQLQuery(smartQuery);

          // Add contextual interpretation based on the question
          let interpretation = "";
          if (message.includes("revenue") || message.includes("sales")) {
            interpretation = "💰 **Revenue Analysis**\n\n";
          } else if (
            message.includes("popular") ||
            message.includes("best") ||
            message.includes("top")
          ) {
            interpretation = "🏆 **Popular Items Analysis**\n\n";
          } else if (message.includes("orders") && message.includes("status")) {
            interpretation = "📋 **Order Status Overview**\n\n";
          } else if (message.includes("table")) {
            interpretation = "🪑 **Table Performance Analysis**\n\n";
          } else if (message.includes("customer")) {
            interpretation = "👥 **Customer Analytics**\n\n";
          } else if (message.includes("menu")) {
            interpretation = "🍽️ **Menu Analysis**\n\n";
          } else if (message.includes("hour") || message.includes("time")) {
            interpretation = "⏰ **Time-based Analysis**\n\n";
          }

          return `${interpretation}${result}`;
        }
      }

      // Check if user is asking for SQL query or database schema
      if (
        message.includes("sql") ||
        message.includes("query") ||
        message.includes("select") ||
        message.includes("table")
      ) {
        if (
          message.includes("schema") ||
          message.includes("tables") ||
          message.includes("structure")
        ) {
          // Show available tables
          const schemaQuery = `
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name, ordinal_position
          `;
          return await executeSQLQuery(schemaQuery);
        }

        // Try to extract and execute SQL query from user message
        const sqlMatch = message.match(/(?:select|with)\s+[\s\S]*?(?:;|$)/i);
        if (sqlMatch) {
          const query = sqlMatch[0].replace(/;$/, ""); // Remove trailing semicolon
          return await executeSQLQuery(query);
        }
      }

      // Fallback to original logic for basic queries
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

      // Default response with enhanced capabilities
      return `I can help you analyze your restaurant data! Just ask me any question and I'll automatically pull the relevant data to answer it.

🤖 **Smart Analysis**: I automatically detect when your question needs database data and fetch it
📊 **Natural Language**: Ask questions in plain English - no need for technical terms
🔍 **SQL Queries**: I can also run specific SQL queries if you prefer
🗃️ **Database Schema**: Ask about "tables" or "schema" to see your database structure

**Example Questions:**
• "How much revenue did we make today?"
• "What are our most popular menu items?"
• "Which tables are the busiest?"
• "How many orders are pending?"
• "Show me sales by hour"
• "What's our average order value?"
• "How many customers did we serve this week?"

**Technical Queries:**
• "Run this SQL: SELECT * FROM orders WHERE status = 'pending'"
• "Show me the database schema"

**Available Data**: orders, menu items, tables, customers, revenue, and more!

💡 **Just ask naturally** - I'll figure out what data you need and get it for you!`;
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
              placeholder="Ask me anything about your restaurant - I'll get the data automatically..."
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
