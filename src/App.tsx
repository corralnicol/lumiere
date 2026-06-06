import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AppProviders } from "./contexts/providers";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Payment from "./pages/Payment/Payment";
import Confirmation from "./pages/Confirmation/Confirmation";
import Products from "./pages/products/Products";
import ProductDetails from "./pages/product-details/ProductDetails";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import AccountOverview from "./pages/account/Overview";
import CategorySelection from "./pages/SellProduct/CategorySelection";
import SkincareDetails from "./pages/SellProduct/SkincareDetails";
import SuccessPublish from "./pages/SellProduct/SuccessPublish";
import Seller from "@/pages/seller/Seller";

function useHashScroll() {
  const location = useLocation();

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = location.hash.slice(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        }
      } else {
        window.scrollTo(0, 0);
      }
    };

    handleHashScroll();
  }, [location]);
}

function ScrollToHash() {
  useHashScroll();
  return null;
}

// Pendiente: usar el usuario completo en toda la app.
function App() {
  return (
    <AppProviders >
      <Router>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          {/* Flujo de compra: carrito, envío, pago y confirmación */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
          {/* Rutas de autenticación */}
          <Route path="/auth/sign-in" element={<Login />} />
          <Route path="/auth/sign-up" element={<CreateAccount />} />
          <Route path="/account" element={<AccountOverview />} />
          {/* Rutas de vendedor */}
          <Route path="/seller" element={<Seller />} />
          <Route path="/sell" element={<CategorySelection />} />
          <Route path="/sell/details" element={<SkincareDetails />} />
          <Route path="/sell/success" element={<SuccessPublish />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}

export default App;
