import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import BestSellerDetail from "./pages/best-seller-detail/BestSellerDetail";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import CategorySelection from "./pages/SellProduct/CategorySelection";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/best-sellers/:productId" element={<BestSellerDetail />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<CreateAccount />} />
        <Route path="/sell" element={<CategorySelection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;