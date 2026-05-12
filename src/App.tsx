import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import BestSellerDetail from "./pages/best-seller-detail/BestSellerDetail";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/best-sellers/:productId" element={<BestSellerDetail />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;