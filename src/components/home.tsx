import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  User,
  LogOut,
  ChefHat,
  ClipboardList,
  BarChart3,
  Settings,
  Calculator,
  Users,
  Plus,
  Trash2,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import MenuView from "./MenuView";
import OrdersDashboard from "./OrdersDashboard";
import AIInsightsChat from "./AIInsightsChat";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import QRCode from "qrcode";

interface Table {
  id: string;
  name: string;
  seats: number;
  status: "available" | "occupied" | "reserved";
  x: number;
  y: number;
  sessionActive: boolean;
  qrCode?: string;
  menuUrl?: string;
}

const TableManagement = () => {
  const [tables, setTables] = useState<Table[]>([
    {
      id: "1",
      name: "Table 1",
      seats: 4,
      status: "available",
      x: 50,
      y: 50,
      sessionActive: false,
    },
    {
      id: "2",
      name: "Table 2",
      seats: 2,
      status: "occupied",
      x: 200,
      y: 50,
      sessionActive: false,
    },
    {
      id: "3",
      name: "Table 3",
      seats: 6,
      status: "available",
      x: 350,
      y: 50,
      sessionActive: false,
    },
    {
      id: "4",
      name: "Table 4",
      seats: 4,
      status: "reserved",
      x: 50,
      y: 200,
      sessionActive: false,
    },
    {
      id: "5",
      name: "Table 5",
      seats: 8,
      status: "available",
      x: 200,
      y: 200,
      sessionActive: false,
    },
  ]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const addTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      name: `Table ${tables.length + 1}`,
      seats: 4,
      status: "available",
      x: Math.random() * 400,
      y: Math.random() * 300,
      sessionActive: false,
    };
    setTables([...tables, newTable]);
  };

  const updateTablePosition = (id: string, x: number, y: number) => {
    setTables((prevTables) =>
      prevTables.map((table) => (table.id === id ? { ...table, x, y } : table)),
    );
  };

  const deleteTable = (id: string) => {
    setTables(tables.filter((table) => table.id !== id));
  };

  const startSession = async (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    // Generate unique menu URL for this table
    const baseUrl = window.location.origin;
    const menuUrl = `${baseUrl}/menu?table=${id}&session=${Date.now()}`;

    try {
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setTables((prevTables) =>
        prevTables.map((t) =>
          t.id === id
            ? {
                ...t,
                sessionActive: true,
                qrCode: qrCodeDataUrl,
                menuUrl: menuUrl,
              }
            : t,
        ),
      );

      // Show QR code dialog
      const updatedTable = {
        ...table,
        qrCode: qrCodeDataUrl,
        menuUrl: menuUrl,
      };
      setSelectedTable(updatedTable);
      setShowQRDialog(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const endSession = (id: string) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === id
          ? {
              ...table,
              sessionActive: false,
              qrCode: undefined,
              menuUrl: undefined,
            }
          : table,
      ),
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const showQRCode = (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (table && table.qrCode) {
      setSelectedTable(table);
      setShowQRDialog(true);
    }
  };

  const getStatusColor = (sessionActive: boolean) => {
    if (sessionActive) {
      return "bg-blue-50 border-blue-400 text-blue-700 border-2";
    }
    return "bg-gray-50 border-gray-200 text-gray-700";
  };

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Table Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your restaurant tables and their availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <Button
              onClick={() => setIsEditMode(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              Save Layout
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditMode(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              Edit Layout
            </Button>
          )}
          <Button onClick={addTable} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Table
          </Button>
        </div>
      </div>

      <div
        className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg"
        style={{ height: "550px", width: "100%" }}
      >
        <div className="absolute inset-2 text-xs text-gray-400 pointer-events-none">
          Restaurant Floor Plan - Drag tables to arrange layout
        </div>
        {tables.map((table) => (
          <motion.div
            key={table.id}
            drag={isEditMode}
            dragMomentum={false}
            onDragEnd={(event, info) => {
              const rect =
                event.currentTarget.parentElement?.getBoundingClientRect();
              if (rect) {
                const newX = Math.max(
                  0,
                  Math.min(rect.width - 80, table.x + info.offset.x),
                );
                const newY = Math.max(
                  0,
                  Math.min(rect.height - 80, table.y + info.offset.y),
                );
                updateTablePosition(table.id, newX, newY);
              }
            }}
            className={cn(
              "absolute select-none",
              isEditMode ? "cursor-move" : "cursor-default",
            )}
            style={{
              left: table.x,
              top: table.y,
            }}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.1, zIndex: 10 }}
          >
            <div
              className={cn(
                "relative w-20 h-20 border-2 rounded-xl flex flex-col items-center justify-center transition-all shadow-md",
                getStatusColor(table.sessionActive),
              )}
            >
              <button
                onClick={() => deleteTable(table.id)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <Trash2 className="h-3 w-3 text-white" />
              </button>

              {/* Table representation */}
              <div className="w-12 h-6 bg-white/50 rounded-md border border-current mb-1 flex items-center justify-center">
                <div className="text-xs font-bold">{table.seats}</div>
              </div>

              <div className="text-center mb-1">
                <div className="text-xs font-semibold">{table.name}</div>
              </div>

              {/* Session Control Buttons */}
              <div className="flex gap-1">
                {!table.sessionActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startSession(table.id);
                    }}
                    className="px-1 py-0.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                  >
                    Start
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showQRCode(table.id);
                      }}
                      className="px-1 py-0.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-1"
                      title="Show QR Code"
                    >
                      <QrCode className="h-2 w-2" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        endSession(table.id);
                      }}
                      className="px-1 py-0.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      End
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No tables yet
          </h4>
          <p className="text-gray-500 mb-4">
            Add your first table to get started with table management.
          </p>
          <Button onClick={addTable}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Table
          </Button>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code for {selectedTable?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {selectedTable?.qrCode && (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img
                  src={selectedTable.qrCode}
                  alt={`QR Code for ${selectedTable.name}`}
                  className="w-48 h-48"
                />
              </div>
            )}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Customers can scan this QR code to access the menu for{" "}
                {selectedTable?.name}
              </p>
              {selectedTable?.menuUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <code className="text-xs flex-1 truncate">
                    {selectedTable.menuUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedTable.menuUrl!)}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowQRDialog(false)}
                className="flex-1"
              >
                Close
              </Button>
              {selectedTable?.qrCode && (
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.download = `qr-code-${selectedTable.name.toLowerCase().replace(/\s+/g, "-")}.png`;
                    link.href = selectedTable.qrCode;
                    link.click();
                  }}
                  className="flex-1"
                >
                  Download QR
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Home = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Mock login function
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Mock logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      id: "menu",
      label: "Menu",
      icon: ChefHat,
    },
    {
      id: "orders",
      label: "Orders",
      icon: ClipboardList,
    },
    {
      id: "table",
      label: "Table",
      icon: Users,
    },
    {
      id: "accounting",
      label: "Accounting",
      icon: Calculator,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Yummo.ai Restaurant</h1>
            <p className="text-muted-foreground mt-2">
              Restaurant Management System
            </p>
          </div>
          <Button onClick={handleLogin} className="w-full" size="lg">
            <User className="mr-2 h-4 w-4" />
            Staff Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <span className="font-bold text-xl">yummo.ai</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === item.id
                        ? "bg-yellow-100 text-yellow-800 font-medium"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Gladina Samantha</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className="bg-white border-b border-gray-200 px-6"
          style={{ height: "77px" }}
        >
          <div className="flex items-center justify-between h-full">
            <div>
              <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
              <p className="text-sm text-muted-foreground">
                Wednesday, 12 July 2023
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 bg-gray-50">
          {activeTab === "orders" && <OrdersDashboard />}

          {activeTab === "menu" && (
            <div>
              <MenuView onAddToCart={() => {}} />
            </div>
          )}

          {activeTab === "dashboard" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Orders Today
                      </p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +12% from yesterday
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Revenue Today
                      </p>
                      <p className="text-2xl font-bold">$1,247</p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +8% from yesterday
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Orders
                      </p>
                      <p className="text-2xl font-bold">7</p>
                    </div>
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <ChefHat className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    3 ready, 4 in progress
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Avg. Prep Time
                      </p>
                      <p className="text-2xl font-bold">18m</p>
                    </div>
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Search className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    -2m from yesterday
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h4 className="text-lg font-semibold mb-4">
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">Order #325 completed</p>
                        <p className="text-sm text-muted-foreground">
                          Table A4 - Ariel Hikmat
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        2 min ago
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">New order received</p>
                        <p className="text-sm text-muted-foreground">
                          Table B2 - Denis Freeman
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        5 min ago
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">Menu item updated</p>
                        <p className="text-sm text-muted-foreground">
                          Chocolate Cake - Price changed
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        12 min ago
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h4 className="text-lg font-semibold mb-4">
                    Popular Items Today
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Belgian Waffles</p>
                          <p className="text-sm text-muted-foreground">
                            8 orders
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">$103.92</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Meat & Mushrooms</p>
                          <p className="text-sm text-muted-foreground">
                            6 orders
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">$222.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-medium text-sm">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Shrimp Salad</p>
                          <p className="text-sm text-muted-foreground">
                            5 orders
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">$112.50</span>
                    </div>
                  </div>
                </div>

                <div className="h-96">
                  <AIInsightsChat />
                </div>
              </div>
            </div>
          )}

          {activeTab === "table" && <TableManagement />}

          {activeTab === "accounting" && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Accounting</h3>
              <p className="text-muted-foreground">
                Accounting features coming soon...
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Settings</h3>
              <p className="text-muted-foreground">
                Settings panel coming soon...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
