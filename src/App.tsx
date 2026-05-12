import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import BestSellerDetail from "./pages/best-seller-detail/BestSellerDetail";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/CreateAccount/CreateAccount";
import CategorySelection from "./pages/SellProduct/CategorySelection";
import SkincareDetails from "./pages/SellProduct/SkincareDetails";
import SuccessPublish from "./pages/SellProduct/SuccessPublish";

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
        <Route path="/sell/details" element={<SkincareDetails />} />
        <Route path="/sell/success" element={<SuccessPublish />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;