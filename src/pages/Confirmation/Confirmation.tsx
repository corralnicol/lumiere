import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import '../../styles/confirmation.css';

// Tipo para la info del pedido que guardamos en localStorage
interface OrderData {
  orderNumber: string;
  items: Array<{
    id: number;
    name: string;
    brand: string;
    imageUrl: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  date: string;
  paymentMethod: string;
}

// Tipo para los datos de envío
interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
}

// Página de confirmación del pedido
// Muestra el comprobante con el número de pedido, los productos y los datos de envío
const Confirmation: React.FC = () => {
  // Leemos los datos del pedido y envío que guardamos en las páginas anteriores
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);

  // Función para los mensajes del Header y Footer
  const showFeedback = (message: string, type: "info" | "success" | "warning" = "info") => {
    console.log(`Feedback: ${message} (${type})`);
  };

  // Al cargar la página, recuperamos los datos del pedido desde localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('lumiere_order');
    const savedShipping = localStorage.getItem('lumiere_shipping');

    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    }
    if (savedShipping) {
      setShippingData(JSON.parse(savedShipping));
    }
  }, []);

  // Formateamos la fecha para que se vea bonita en español
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Si no hay datos del pedido, mostramos un mensaje
  if (!orderData) {
    return (
      <>
        <Header onFeedback={showFeedback} />
        <main className="confirmation-page">
          <h1 className="confirmation-title">Confirmación</h1>
          <div className="empty-cart">
            <div className="empty-icon">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <p className="empty-text">No hay un pedido reciente</p>
            <Link to="/" className="continue-btn">Ir al Inicio</Link>
          </div>
        </main>
        <Footer onFeedback={showFeedback} />
      </>
    );
  }

  // Calculamos el subtotal sumando los precios de todos los productos
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const shipping = 5.00;

  return (
    <>
      <Header onFeedback={showFeedback} />

      <main className="confirmation-page">
        <h1 className="confirmation-title">¡Pedido Confirmado!</h1>

        {/* Indicador de progreso - todos los pasos completados */}
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
          <div className="step completed">
            <span className="step-number"><i className="fa-solid fa-check"></i></span>
            <span>Pago</span>
          </div>
          <div className="step-divider"></div>
          <div className="step active">
            <span className="step-number"><i className="fa-solid fa-check"></i></span>
            <span>Confirmación</span>
          </div>
        </div>

        {/* Animación de éxito con el check */}
        <div className="success-animation">
          <div className="success-circle">
            <i className="fa-solid fa-check"></i>
          </div>
          <p className="success-text">¡Gracias por tu compra!</p>
          <p className="success-subtitle">Te hemos enviado un correo con los detalles de tu pedido</p>
        </div>

        {/* Tarjeta del comprobante tipo recibo */}
        <div className="receipt-card">
          {/* Encabezado del recibo con logo y fecha */}
          <div className="receipt-header">
            <h2 className="receipt-logo">Lumière</h2>
            <p className="receipt-date">{formatDate(orderData.date)}</p>
          </div>

          {/* Número de pedido bien grande y visible */}
          <div className="order-number-section">
            <p className="order-number-label">Número de Pedido</p>
            <p className="order-number-value">{orderData.orderNumber}</p>
          </div>

          {/* Lista de productos comprados */}
          <div className="receipt-items">
            {orderData.items.map((item) => (
              <div key={item.id} className="receipt-item">
                <div className="receipt-item-info">
                  <img src={item.imageUrl} alt={item.name} className="receipt-item-image" />
                  <div>
                    <p className="receipt-item-name">{item.name}</p>
                    <p className="receipt-item-qty">Cantidad: {item.quantity}</p>
                  </div>
                </div>
                <span className="receipt-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Desglose de precios: subtotal, envío y total */}
          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="receipt-total-row">
              <span>Envío</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="receipt-total-row receipt-grand-total">
              <span>Total Pagado</span>
              <span>${orderData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Datos de envío (si los tenemos) */}
          {shippingData && (
            <div className="receipt-shipping">
              <h3 className="receipt-shipping-title">
                <i className="fa-solid fa-truck"></i>
                Envío a:
              </h3>
              <p>
                {shippingData.firstName} {shippingData.lastName}<br />
                {shippingData.address}<br />
                {shippingData.city}, {shippingData.department}<br />
                Tel: {shippingData.phone}
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="confirmation-actions">
            <Link to="/" className="home-btn">
              <i className="fa-solid fa-house"></i>
              Volver al Inicio
            </Link>
            <button className="print-btn" onClick={() => window.print()}>
              <i className="fa-solid fa-print"></i>
              Imprimir Comprobante
            </button>
          </div>
        </div>
      </main>

      <Footer onFeedback={showFeedback} />
    </>
  );
};

export default Confirmation;
