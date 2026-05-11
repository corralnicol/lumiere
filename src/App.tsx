import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import BestSellerDetail from "./pages/best-seller-detail/BestSellerDetail";
import Products from "./pages/products/Products";
import ProductDetail from "./pages/ProductDetail";

function useHashScroll() {
  const location = useLocation();

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.slice(1);
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

function AppContent() {
  useHashScroll();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/best-sellers/:productId" element={<BestSellerDetail />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;