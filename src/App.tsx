import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import MenuView from "./components/MenuView";
import CustomerMenu from "./components/CustomerMenu";
import OrdersPage from "./components/OrdersPage";
import DatabaseTest from "./components/DatabaseTest";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import { OrderProvider } from "./contexts/OrderContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import routes from "tempo-routes";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute>
            <MenuView onAddToCart={() => {}} />
          </ProtectedRoute>
        }
      />
      <Route path="/menu" element={<CustomerMenu />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/database-test" element={<DatabaseTest />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <Suspense fallback={<p>Loading...</p>}>
            <>
              <AppRoutes />
              {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
            </>
          </Suspense>
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
