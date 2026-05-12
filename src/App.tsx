import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Payment from "./pages/Payment/Payment";
import Confirmation from "./pages/Confirmation/Confirmation";
import BestSellerDetail from "./pages/best-seller-detail/BestSellerDetail";
import Products from "./pages/products/Products";
import ProductDetail from "./pages/ProductDetail";
import KitDetail from "./pages/kit-detail";

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

// TODO: Use UserProvider with name and email instead of just cart
function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kits/:kitId" element={<KitDetail />} />
          <Route path="/best-sellers/:productId" element={<BestSellerDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          {/* Order flow: cart -> checkout -> payment -> confirmation */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;