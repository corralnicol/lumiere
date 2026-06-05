import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useUserState } from '@/contexts/user/UserContext';
import { saveServerCart } from '@/lib/cart';
import { placeOrder } from '@/lib/orders';
import type { CartItem } from '@/lib/cart';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import '../../styles/checkout.css';
import '../../styles/payment.css';

// Página de pago
// El usuario elige cómo quiere pagar (tarjeta, PSE, Nequi) y llena los datos de pago
const Payment: React.FC = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const user = useUserState();
  const navigate = useNavigate();

  // Redirige a login si el usuario no está autenticado (place_order requiere auth)
  useEffect(() => {
    if (!user.loading && !user.isLoggedIn) {
      navigate('/auth/sign-in', { state: { from: '/payment' }, replace: true });
    }
  }, [user.loading, user.isLoggedIn, navigate]);

  // Método de pago seleccionado por el usuario
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Datos de la tarjeta de crédito/débito
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  // Estado para el proceso de pago
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Función para los mensajes del Header y Footer
  const showFeedback = (message: string, type: "info" | "success" | "warning" = "info") => {
    console.log(`Feedback: ${message} (${type})`);
  };

  // Cálculo de precios
  const subtotal = getCartTotal();
  const shipping = 5.00;
  const total = subtotal + shipping;

  // Actualiza los datos de la tarjeta cuando el usuario escribe
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Formatea el número de tarjeta para que se vea bonito en la vista previa
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
  };

  // Cuando el usuario confirma el pago
  const handlePayment = async () => {
    if (submitting || !user.isLoggedIn || !user.id) return;

    setSubmitting(true);
    setPaymentError('');

    // Snapshot del carrito antes de que el RPC lo limpie en el servidor
    const orderItems = [...cart];

    try {
      // Guardamos el carrito en el servidor justo antes de llamar al RPC
      // para garantizar que tenga los últimos cambios (por si el debounce no ha disparado)
      await saveServerCart(user.id, cart as CartItem[]);

      // RPC atómico: crea la orden, decrementa stock y limpia profiles.cart
      const orderId = await placeOrder();

      // Guardamos los datos del pedido para mostrarlos en la confirmación
      localStorage.setItem('lumiere_order', JSON.stringify({
        orderNumber: orderId,
        items: orderItems,
        total,
        date: new Date().toISOString(),
        paymentMethod,
      }));

      // Limpiamos el carrito local (el servidor ya lo limpió el RPC)
      clearCart();

      navigate('/confirmation');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el pago. Inténtalo de nuevo.';
      setPaymentError(msg);
      setSubmitting(false);
    }
  };

  // Si el carrito está vacío, no debería estar en esta página
  if (cart.length === 0) {
    return (
      <>
        <Header onFeedback={showFeedback} />
        <main className="payment-page">
          <h1 className="payment-title">Pago</h1>
          <div className="empty-cart">
            <div className="empty-icon">
              <i className="fa-solid fa-credit-card"></i>
            </div>
            <p className="empty-text">No tienes productos para pagar</p>
            <Link to="/" className="continue-btn">Ir a Comprar</Link>
          </div>
        </main>
        <Footer onFeedback={showFeedback} />
      </>
    );
  }

  return (
    <>
      <Header onFeedback={showFeedback} />

      <main className="payment-page">
        <h1 className="payment-title">Método de Pago</h1>

        {/* Indicador de progreso */}
        <div className="checkout-steps">
          <div className="step completed">
            <span className="step-number"><i className="fa-solid fa-check"></i></span>
            <span>Carrito</span>
          </div>
          <div className="step-divider"></div>
          <div className="step completed">
            <span className="step-number"><i className="fa-solid fa-check"></i></span>
            <span>Envío</span>
          </div>
          <div className="step-divider"></div>
          <div className="step active">
            <span className="step-number">3</span>
            <span>Pago</span>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <span className="step-number">4</span>
            <span>Confirmación</span>
          </div>
        </div>

        {/* Link para volver al checkout */}
        <Link to="/checkout" className="back-link">
          <i className="fa-solid fa-arrow-left"></i>
          Volver a Envío
        </Link>

        <div className="payment-container">
          {/* Sección izquierda: opciones de pago */}
          <div className="payment-methods">
            <h2 className="payment-section-title">
              <i className="fa-solid fa-wallet"></i>
              Elige tu Método de Pago
            </h2>

            {/* Las 3 opciones de pago */}
            <div className="method-options">
              {/* Opción 1: Tarjeta */}
              <div
                className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="method-radio">
                  <div className="method-radio-inner"></div>
                </div>
                <div className="method-icon">
                  <i className="fa-solid fa-credit-card"></i>
                </div>
                <div className="method-info">
                  <h3>Tarjeta de Crédito / Débito</h3>
                  <p>Visa, Mastercard, American Express</p>
                </div>
              </div>

              {/* Opción 2: PSE */}
              <div
                className={`method-option ${paymentMethod === 'pse' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('pse')}
              >
                <div className="method-radio">
                  <div className="method-radio-inner"></div>
                </div>
                <div className="method-icon">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <div className="method-info">
                  <h3>PSE - Débito Bancario</h3>
                  <p>Paga directo desde tu cuenta bancaria</p>
                </div>
              </div>

              {/* Opción 3: Nequi / Daviplata */}
              <div
                className={`method-option ${paymentMethod === 'nequi' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('nequi')}
              >
                <div className="method-radio">
                  <div className="method-radio-inner"></div>
                </div>
                <div className="method-icon">
                  <i className="fa-solid fa-mobile-screen"></i>
                </div>
                <div className="method-info">
                  <h3>Nequi / Daviplata</h3>
                  <p>Paga desde tu billetera digital</p>
                </div>
              </div>
            </div>

            {/* Formulario de tarjeta: solo aparece si el método es "tarjeta" */}
            {paymentMethod === 'card' && (
              <div className="card-form">
                {/* Vista previa de la tarjeta (se actualiza mientras escribe) */}
                <div className="card-preview">
                  <div className="card-chip">
                    <i className="fa-solid fa-sim-card"></i>
                  </div>
                  <div className="card-number-display">
                    {cardData.cardNumber
                      ? formatCardNumber(cardData.cardNumber)
                      : '•••• •••• •••• ••••'}
                  </div>
                  <div className="card-bottom">
                    <span>{cardData.cardName || 'NOMBRE DEL TITULAR'}</span>
                    <span>{cardData.expiry || 'MM/AA'}</span>
                  </div>
                </div>

                {/* Campos del formulario de tarjeta */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="cardNumber">Número de Tarjeta</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                      maxLength={19}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="cardName">Nombre del Titular</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      placeholder="Como aparece en la tarjeta"
                      value={cardData.cardName}
                      onChange={handleCardChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiry">Vencimiento</label>
                    <input
                      type="text"
                      id="expiry"
                      name="expiry"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={handleCardChange}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="password"
                      id="cvv"
                      name="cvv"
                      placeholder="•••"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de error si el pago falla */}
            {paymentError && (
              <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
                {paymentError}
              </p>
            )}

            {/* Botón para confirmar el pago */}
            <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={submitting}
              style={submitting ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
            >
              {submitting
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Procesando...</>
                : <><i className="fa-solid fa-lock"></i> Confirmar y Pagar ${total.toFixed(2)}</>
              }
            </button>

            {/* Nota de seguridad */}
            <div className="security-note">
              <i className="fa-solid fa-shield-halved"></i>
              <span>Tus datos están protegidos con encriptación SSL</span>
            </div>
          </div>

          {/* Resumen del pedido */}
          <aside className="order-summary">
            <h2 className="order-summary-title">Tu Pedido</h2>

            {cart.map((item) => (
              <div key={item.id} className="order-item">
                <img src={item.imageUrl} alt={item.name} className="order-item-image" />
                <div className="order-item-details">
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-qty">Cant: {item.quantity}</p>
                </div>
                <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="order-divider"></div>

            <div className="order-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="order-row">
              <span>Envío</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="order-row order-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      </main>

      <Footer onFeedback={showFeedback} />
    </>
  );
};

export default Payment;
