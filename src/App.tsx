import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home/Home";
import BestSellerDetail from "./pages/best-seller-detail/BestSellerDetail";
import ProductDetail from "./pages/ProductDetail";
import KitDetail from "./pages/kit-detail";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/best-sellers/:productId" element={<BestSellerDetail />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/kits/:kitId" element={<KitDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;