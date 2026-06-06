import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/useCart';
import { useUserState } from '@/contexts/user/useUser';
import { supabase } from '@/lib/supabase';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import '../../styles/checkout.css';

interface ProfileInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Página de datos de envío.
// Aquí el usuario llena sus datos de envío y revisa el resumen de su pedido antes de pagar
const Checkout: React.FC = () => {
  const { cart, getCartTotal } = useCart();
  const { id: userId, isLoggedIn, loading: authLoading } = useUserState();
  const navigate = useNavigate();

  // Redirige al login si el usuario no está autenticado
  // Cubre accesos directos por URL, no solo el botón del carrito
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/auth/sign-in', { state: { from: '/checkout' }, replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  // Datos del perfil cargados desde Supabase.
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  // Solo dirección, ciudad y departamento son editables (los datos personales vienen del perfil)
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    department: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('first_name, last_name, email, phone, address, city, state, zip')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            firstName: data.first_name ?? '',
            lastName: data.last_name ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
          });
          // Llenamos la dirección si ya estaba guardada en el perfil.
          setFormData({
            address: data.address ?? '',
            city: data.city ?? '',
            department: data.state ?? '',
            zipCode: data.zip ?? '',
          });
        }
      });
  }, [userId]);

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

  // Cuando el usuario envía el formulario, guardamos los datos y lo llevamos a la página de pago
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guardamos los datos de envío en localStorage para usarlos después
    localStorage.setItem('lumiere_shipping', JSON.stringify({
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      ...formData,
    }));

    // Intentamos guardar la dirección en el perfil. Si falla, igual dejamos seguir al pago.
    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({
            address: formData.address,
            city: formData.city,
            state: formData.department,
            zip: formData.zipCode,
          })
          .eq('id', userId);
      } catch (err) {
        console.error('No se pudo guardar la dirección en el perfil:', err);
      }
    }

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

        {/* Enlace para volver al carrito */}
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

            {/* Datos personales cargados automáticamente desde el perfil */}
            {profile && (
              <div className="profile-info-card">
                <p className="profile-info-name">
                  <i className="fa-solid fa-user"></i>
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="profile-info-detail">
                  <i className="fa-solid fa-envelope"></i>
                  {profile.email}
                </p>
                {profile.phone && (
                  <p className="profile-info-detail">
                    <i className="fa-solid fa-phone"></i>
                    {profile.phone}
                  </p>
                )}
              </div>
            )}

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

            {/* Botón para ir al pago (solo si los campos requeridos están llenos) */}
            <button type="submit" className="continue-payment-btn">
              Continuar al Pago
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
