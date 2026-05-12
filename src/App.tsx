import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Payment from "./pages/Payment/Payment";
import Confirmation from "./pages/Confirmation/Confirmation";
import BestSellerDetail from "./pages/best-seller-detail/BestSellerDetail";
import ProductDetail from "./pages/ProductDetail";

// TODO: Use UserProvider with name and email instead of just cart
function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/best-sellers/:productId" element={<BestSellerDetail />} />
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