import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AppProviders } from "./contexts/providers";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Payment from "./pages/Payment/Payment";
import Confirmation from "./pages/Confirmation/Confirmation";
import BestSellerDetails from "./pages/best-seller-details/BestSellerDetails";
import Products from "./pages/products/Products";
import ProductDetails from "./pages/product-details/ProductDetails";
import KitDetails from "./pages/kit-details/KitDetails";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import AccountOverview from "./pages/account/Overview";
import CategorySelection from "./pages/SellProduct/CategorySelection";
import SkincareDetails from "./pages/SellProduct/SkincareDetails";
import SuccessPublish from "./pages/SellProduct/SuccessPublish";
import Seller from "@/pages/seller/Seller";
import Profile from "./pages/Profile/Profile";
import BuyerOverview from "./pages/BuyerOverview/BuyerOverview";

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

// chicas usen userprovider con email nombre y foto de perfil en lugar de solo el carrito
function App() {
  return (
    <AppProviders >
      <Router>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kits/:kitId" element={<KitDetails />} />
          <Route path="/best-sellers/:productId" element={<BestSellerDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          {/* Order flow: cart -> checkout -> payment -> confirmation */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/overview" element={<BuyerOverview />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<CreateAccount />} />
          <Route path="/account" element={<AccountOverview />} />
          <Route path="/profile" element={<Profile />} />
          {/* Seller Routes */}
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