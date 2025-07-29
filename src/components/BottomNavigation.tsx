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
    // Preserve URL parameters when navigating
    const urlParams = new URLSearchParams(window.location.search);
    const queryString = urlParams.toString();
    window.location.href = `/menu${queryString ? `?${queryString}` : ""}`;
  },
  onOrdersClick = () => {
    // Preserve URL parameters when navigating
    const urlParams = new URLSearchParams(window.location.search);
    const queryString = urlParams.toString();
    window.location.href = `/orders${queryString ? `?${queryString}` : ""}`;
  },
}: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2 pb-safe-bottom">
      <div className="flex items-center justify-center max-w-sm mx-auto">
        <div className="flex items-center justify-between w-full px-6">
          <button
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200"
            onClick={onHomeClick}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                activeTab === "home"
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Home
                className={`w-6 h-6 transition-colors ${
                  activeTab === "home" ? "text-white" : "text-gray-500"
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold transition-colors ${
                activeTab === "home" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Menu
            </span>
          </button>
          <button
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200"
            onClick={onOrdersClick}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                activeTab === "orders"
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <ClipboardList
                className={`w-6 h-6 transition-colors ${
                  activeTab === "orders" ? "text-white" : "text-gray-500"
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold transition-colors ${
                activeTab === "orders" ? "text-gray-900" : "text-gray-500"
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
