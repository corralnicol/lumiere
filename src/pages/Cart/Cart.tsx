import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import '../../styles/cart.css';

// Página del carrito de compras
// Aquí el usuario ve los productos que ha añadido y puede modificar cantidades o eliminarlos
const Cart: React.FC = () => {
  // Traemos las funciones del carrito desde el contexto global
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  // Función para mostrar mensajes tipo "toast" (la necesitan el Header y Footer)
  const showFeedback = (message: string, type: "info" | "success" | "warning" = "info") => {
    console.log(`Feedback: ${message} (${type})`);
  };

  // Calculamos el subtotal, el envío y el total
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 5.00 : 0; // Envío fijo de $5 si hay productos
  const total = subtotal + shipping;

  return (
    <>
      <Header onFeedback={showFeedback} />
      
      <main className="cart-page">
        <h1 className="cart-title">Tu Carrito</h1>
        
        {/* Si el carrito está vacío mostramos un mensaje bonito */}
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">
              <i className="fa-solid fa-basket-shopping"></i>
            </div>
            <p className="empty-text">Tu carrito está vacío</p>
            <Link to="/" className="continue-btn">Seguir Comprando</Link>
          </div>
        ) : (
          // Si tiene productos, mostramos la lista y el resumen
          <div className="cart-container">
            {/* Lista de productos en el carrito */}
            <div className="cart-items">
              {cart.map((item) => (
                <article key={item.id} className="cart-item">
                  <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                  
                  {/* Info del producto: marca, nombre y precio */}
                  <div className="cart-item-info">
                    <p className="cart-item-brand">{item.brand}</p>
                    <h2 className="cart-item-name">{item.name}</h2>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  </div>

                  {/* Controles para cambiar cantidad o eliminar */}
                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Disminuir cantidad"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <span className="item-quantity">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Aumentar cantidad"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Eliminar producto"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Resumen del pedido con subtotal, envío y total */}
            <aside className="cart-summary">
              <h2 className="summary-title">Resumen del Pedido</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Envío</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {/* Botón para ir a la página de checkout */}
              <Link to="/checkout" className="checkout-btn">
                Ir a Pagar
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
              
              {/* Link para volver al home y seguir comprando */}
              <Link to="/" className="continue-btn" style={{ width: '100%', textAlign: 'center', marginTop: '15px' }}>
                Continuar Comprando
              </Link>
            </aside>
          </div>
        )}
      </main>
      
      <Footer onFeedback={showFeedback} />
    </>
  );
};

export default Cart;
