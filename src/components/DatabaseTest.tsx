import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Database,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface TestResult {
  name: string;
  status: "success" | "error" | "pending";
  message: string;
  data?: any;
}

const DatabaseTest = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "testing"
  >("testing");

  const runTests = async () => {
    setIsRunning(true);
    setConnectionStatus("testing");
    const testResults: TestResult[] = [];

    // Test 1: Check if Supabase is configured
    testResults.push({
      name: "Environment Configuration",
      status: isSupabaseConfigured ? "success" : "error",
      message: isSupabaseConfigured
        ? "Supabase URL and API key are configured"
        : "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY",
    });

    if (!isSupabaseConfigured) {
      setTests(testResults);
      setConnectionStatus("disconnected");
      setIsRunning(false);
      return;
    }

    try {
      // Test 2: Basic connection test
      testResults.push({
        name: "Database Connection",
        status: "pending",
        message: "Testing connection...",
      });
      setTests([...testResults]);

      const { data: connectionTest, error: connectionError } = await supabase
        .from("menu_items")
        .select("count", { count: "exact", head: true });

      if (connectionError) {
        testResults[testResults.length - 1] = {
          name: "Database Connection",
          status: "error",
          message: `Connection failed: ${connectionError.message}`,
        };
      } else {
        testResults[testResults.length - 1] = {
          name: "Database Connection",
          status: "success",
          message: "Successfully connected to Supabase",
        };
      }
      setTests([...testResults]);

      // Test 3: Check if menu_items table exists and has data
      testResults.push({
        name: "Menu Items Table",
        status: "pending",
        message: "Checking menu items...",
      });
      setTests([...testResults]);

      const {
        data: menuItems,
        error: menuError,
        count,
      } = await supabase
        .from("menu_items")
        .select("*", { count: "exact" })
        .limit(5);

      if (menuError) {
        testResults[testResults.length - 1] = {
          name: "Menu Items Table",
          status: "error",
          message: `Menu items error: ${menuError.message}`,
        };
      } else {
        testResults[testResults.length - 1] = {
          name: "Menu Items Table",
          status: "success",
          message: `Found ${count || 0} menu items`,
          data: menuItems,
        };
      }
      setTests([...testResults]);

      // Test 4: Check orders table
      testResults.push({
        name: "Orders Table",
        status: "pending",
        message: "Checking orders...",
      });
      setTests([...testResults]);

      const {
        data: orders,
        error: ordersError,
        count: ordersCount,
      } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .limit(3);

      if (ordersError) {
        testResults[testResults.length - 1] = {
          name: "Orders Table",
          status: "error",
          message: `Orders error: ${ordersError.message}`,
        };
      } else {
        testResults[testResults.length - 1] = {
          name: "Orders Table",
          status: "success",
          message: `Found ${ordersCount || 0} orders`,
          data: orders,
        };
      }
      setTests([...testResults]);

      // Test 5: Check order_items table
      testResults.push({
        name: "Order Items Table",
        status: "pending",
        message: "Checking order items...",
      });
      setTests([...testResults]);

      const {
        data: orderItems,
        error: orderItemsError,
        count: orderItemsCount,
      } = await supabase
        .from("order_items")
        .select("*", { count: "exact" })
        .limit(3);

      if (orderItemsError) {
        testResults[testResults.length - 1] = {
          name: "Order Items Table",
          status: "error",
          message: `Order items error: ${orderItemsError.message}`,
        };
      } else {
        testResults[testResults.length - 1] = {
          name: "Order Items Table",
          status: "success",
          message: `Found ${orderItemsCount || 0} order items`,
          data: orderItems,
        };
      }
      setTests([...testResults]);

      // Test 6: Test insert operation
      testResults.push({
        name: "Write Operations",
        status: "pending",
        message: "Testing write access...",
      });
      setTests([...testResults]);

      const testMenuItem = {
        name: `Test Item ${Date.now()}`,
        description: "Test menu item for database connectivity",
        price: 9.99,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
        category: "test",
        prep_time: 5,
        rating: 4.0,
        available: false,
      };

      const { data: insertResult, error: insertError } = await supabase
        .from("menu_items")
        .insert(testMenuItem)
        .select()
        .single();

      if (insertError) {
        testResults[testResults.length - 1] = {
          name: "Write Operations",
          status: "error",
          message: `Insert failed: ${insertError.message}`,
        };
      } else {
        // Clean up test item
        await supabase.from("menu_items").delete().eq("id", insertResult.id);

        testResults[testResults.length - 1] = {
          name: "Write Operations",
          status: "success",
          message: "Insert and delete operations successful",
        };
      }
      setTests([...testResults]);

      // Determine overall connection status
      const hasErrors = testResults.some((test) => test.status === "error");
      setConnectionStatus(hasErrors ? "disconnected" : "connected");
    } catch (error) {
      console.error("Database test error:", error);
      testResults.push({
        name: "Unexpected Error",
        status: "error",
        message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
      setTests(testResults);
      setConnectionStatus("disconnected");
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      case "testing":
        return "text-blue-600";
    }
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Database Connection Test</h1>
              <p className="text-gray-600">
                Testing Supabase connectivity and table setup
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${getConnectionStatusColor()}`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "disconnected"
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
              />
              <span className="font-medium capitalize">{connectionStatus}</span>
            </div>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`}
              />
              {isRunning ? "Testing..." : "Run Tests"}
            </Button>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              <strong>Database Not Configured:</strong> Please set up your
              Supabase environment variables in the project settings:
              <ul className="mt-2 ml-4 list-disc">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
              After setting these variables, run the SQL setup script in your
              Supabase dashboard.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getStatusIcon(test.status)}
                    {test.name}
                  </CardTitle>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{test.message}</p>
                {test.data && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                      View Data (
                      {Array.isArray(test.data) ? test.data.length : 1} items)
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-auto max-h-40">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {tests.length === 0 && isRunning && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Running database tests...</p>
            </div>
          </div>
        )}

        {connectionStatus === "connected" && (
          <Alert className="mt-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Database Connection Successful!</strong> Your Supabase
              database is properly configured and all tables are set up
              correctly.
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === "disconnected" && tests.length > 0 && (
          <Alert className="mt-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Database Connection Issues:</strong> There are problems
              with your database setup. Please check the errors above and:
              <ul className="mt-2 ml-4 list-disc">
                <li>Ensure your Supabase project is active</li>
                <li>Verify your environment variables are correct</li>
                <li>
                  Run the database setup SQL script in your Supabase dashboard
                </li>
                <li>Check your Row Level Security policies</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default DatabaseTest;
