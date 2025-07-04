import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import MenuView from "./components/MenuView";
import CustomerMenu from "./components/CustomerMenu";
import OrdersPage from "./components/OrdersPage";
import DatabaseTest from "./components/DatabaseTest";
import { OrderProvider } from "./contexts/OrderContext";
import routes from "tempo-routes";

function App() {
  return (
    <OrderProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/admin/menu"
              element={<MenuView onAddToCart={() => {}} />}
            />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/database-test" element={<DatabaseTest />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </OrderProvider>
  );
}

export default App;
