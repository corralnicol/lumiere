import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Payment from "./pages/Payment/Payment";
import Confirmation from "./pages/Confirmation/Confirmation";

// Componente principal de la app
// Envolvemos todo con CartProvider para que el carrito esté disponible en todas las páginas
// Y con Router para poder navegar entre las distintas pantallas del flujo de compra
function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Página principal */}
          <Route path="/" element={<Home />} />

          {/* Flujo de compra: carrito → checkout → pago → confirmación */}
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