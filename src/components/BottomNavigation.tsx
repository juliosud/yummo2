import React from "react";
import { Home, ClipboardList } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "home" | "orders";
  onHomeClick?: () => void;
  onOrdersClick?: () => void;
}

const BottomNavigation = ({
  activeTab = "home",
  onHomeClick = () => {
    // Preserve table parameter when navigating
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get("table");
    const menuUrl = table ? `/menu?table=${table}` : "/menu";
    window.location.href = menuUrl;
  },
  onOrdersClick = () => {
    // Preserve table parameter when navigating
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get("table");
    const ordersUrl = table ? `/orders?table=${table}` : "/orders";
    window.location.href = ordersUrl;
  },
}: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
      <div className="flex items-center justify-center max-w-sm mx-auto">
        <div className="flex items-center justify-between w-full px-8">
          <button className="flex flex-col items-center" onClick={onHomeClick}>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                activeTab === "home" ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Home
                className={`w-5 h-5 ${
                  activeTab === "home" ? "text-white" : "text-gray-400"
                }`}
              />
            </div>
            <span
              className={`text-xs mt-1 ${
                activeTab === "home"
                  ? "text-gray-700 font-medium"
                  : "text-gray-400"
              }`}
            >
              Home
            </span>
          </button>
          <button
            className="flex flex-col items-center"
            onClick={onOrdersClick}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                activeTab === "orders" ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <ClipboardList
                className={`w-5 h-5 ${
                  activeTab === "orders" ? "text-white" : "text-gray-400"
                }`}
              />
            </div>
            <span
              className={`text-xs mt-1 ${
                activeTab === "orders"
                  ? "text-gray-700 font-medium"
                  : "text-gray-400"
              }`}
            >
              Orders
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
