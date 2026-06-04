import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useUserState } from '@/contexts/user/UserContext';
import { supabase } from '@/lib/supabase';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import '../../styles/checkout.css';

// Página de checkout
// Aquí el usuario llena sus datos de envío y revisa el resumen de su pedido antes de pagar
const Checkout: React.FC = () => {
  const { cart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const user = useUserState();

  // Separamos el nombre completo en nombre y apellido
  const nameParts = (user?.name || '').trim().split(' ');
  const firstNameFromContext = nameParts[0] || '';
  const lastNameFromContext = nameParts.slice(1).join(' ') || '';

  // Estado para guardar los datos que el usuario escribe en el formulario
  const [formData, setFormData] = useState({
    firstName: firstNameFromContext,
    lastName: lastNameFromContext,
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    department: '',
    zipCode: '',
  });
  const [_isSaving, setIsSaving] = useState(false);
  const [_saveError, setSaveError] = useState('');


  // Cuando carga el usuario, actualizamos los campos del contexto por si llegaron tarde
  useEffect(() => {
    if (user?.name || user?.email) {
      const parts = (user?.name || '').trim().split(' ');
      const timer = setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          firstName: parts[0] || prev.firstName,
          lastName: parts.slice(1).join(' ') || prev.lastName,
          email: user?.email || prev.email,
          phone: user?.phone || prev.phone,
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user?.name, user?.email, user?.phone]);

  // Función simple para los mensajes del Header y Footer
  const showFeedback = (message: string, type: "info" | "success" | "warning" = "info") => {
    console.log(`Feedback: ${message} (${type})`);
  };

  // Cálculo de precios
  const subtotal = getCartTotal();
  const shipping = 5.00;
  const total = subtotal + shipping;

  // Actualiza el estado cuando el usuario escribe en cualquier campo del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cuando el usuario envía el formulario, guardamos dirección en Supabase y lo llevamos al pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    // Si el usuario está logueado, guardamos los datos de envío en su perfil de Supabase
    if (user?.isLoggedIn && user?.id) {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          address: formData.address,
          city: formData.city,
          state: formData.department,
          zip: formData.zipCode,
        })
        .eq('id', user.id!);

      setIsSaving(false);

      if (error) {
        console.error('Error guardando dirección:', error);
        setSaveError('No se pudo guardar la dirección. Intenta de nuevo.');
        return;
      }
    }

    // Guardamos los datos de envío en localStorage para usarlos en la página de pago
    localStorage.setItem('lumiere_shipping', JSON.stringify(formData));
    navigate('/payment');
  };

  // Si el carrito está vacío, mandamos al usuario de vuelta al carrito
  if (cart.length === 0) {
    return (
      <>
        <Header onFeedback={showFeedback} />
        <main className="checkout-page">
          <h1 className="checkout-title">Checkout</h1>
          <div className="empty-cart">
            <div className="empty-icon">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <p className="empty-text">No tienes productos en tu carrito</p>
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

      <main className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        {/* Indicador de progreso: muestra en qué paso del proceso estamos */}
        <div className="checkout-steps">
          <div className="step completed">
            <span className="step-number"><i className="fa-solid fa-check"></i></span>
            <span>Carrito</span>
          </div>
          <div className="step-divider"></div>
          <div className="step active">
            <span className="step-number">2</span>
            <span>Envío</span>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <span className="step-number">3</span>
            <span>Pago</span>
          </div>
          <div className="step-divider"></div>
          <div className="step">
            <span className="step-number">4</span>
            <span>Confirmación</span>
          </div>
        </div>

        {/* Link para volver al carrito */}
        <Link to="/cart" className="back-link">
          <i className="fa-solid fa-arrow-left"></i>
          Volver al Carrito
        </Link>

        <div className="checkout-container">
          {/* Formulario de datos de envío */}
          <form className="shipping-form" onSubmit={handleSubmit}>
            <h2 className="form-section-title">
              <i className="fa-solid fa-truck"></i>
              Datos de Envío
            </h2>

            {/* Fila de nombre y apellido */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Fila de email y teléfono */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="300 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Dirección ocupa toda la fila */}
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Calle 123 # 45-67, Apto 101"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Ciudad, departamento y código postal */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Ciudad</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Bogotá"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Departamento</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Amazonas">Amazonas</option>
                  <option value="Antioquia">Antioquia</option>
                  <option value="Arauca">Arauca</option>
                  <option value="Atlántico">Atlántico</option>
                  <option value="Bogotá D.C.">Bogotá D.C.</option>
                  <option value="Bolívar">Bolívar</option>
                  <option value="Boyacá">Boyacá</option>
                  <option value="Caldas">Caldas</option>
                  <option value="Caquetá">Caquetá</option>
                  <option value="Casanare">Casanare</option>
                  <option value="Cauca">Cauca</option>
                  <option value="Cesar">Cesar</option>
                  <option value="Chocó">Chocó</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Cundinamarca">Cundinamarca</option>
                  <option value="Guainía">Guainía</option>
                  <option value="Guaviare">Guaviare</option>
                  <option value="Huila">Huila</option>
                  <option value="La Guajira">La Guajira</option>
                  <option value="Magdalena">Magdalena</option>
                  <option value="Meta">Meta</option>
                  <option value="Nariño">Nariño</option>
                  <option value="Norte de Santander">Norte de Santander</option>
                  <option value="Putumayo">Putumayo</option>
                  <option value="Quindío">Quindío</option>
                  <option value="Risaralda">Risaralda</option>
                  <option value="San Andrés">San Andrés</option>
                  <option value="Santander">Santander</option>
                  <option value="Sucre">Sucre</option>
                  <option value="Tolima">Tolima</option>
                  <option value="Valle del Cauca">Valle del Cauca</option>
                  <option value="Vaupés">Vaupés</option>
                  <option value="Vichada">Vichada</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">Código Postal</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  placeholder="110111"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {_saveError && <p className="error-message" style={{ color: 'var(--accent-red, #ff4d4d)', marginTop: '10px' }}>{_saveError}</p>}

            {/* Botón para ir al pago (solo si los campos requeridos están llenos) */}
            <button type="submit" className="continue-payment-btn" disabled={_isSaving}>
              {_isSaving ? 'Guardando...' : 'Continuar al Pago'}
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>

          {/* Resumen del pedido en la columna derecha */}
          <aside className="order-summary">
            <h2 className="order-summary-title">Tu Pedido</h2>

            {/* Lista de productos en miniatura */}
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

            {/* Desglose de precios */}
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

export default Checkout;
