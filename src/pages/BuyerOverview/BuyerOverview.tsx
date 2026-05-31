import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { useGetOrdersByUserQuery } from '../../services/supabaseApi';

// Página simple de analíticas del comprador.
const BuyerOverview: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.userId);

  // Aquí se leen solo las órdenes del usuario autenticado.
  const { data: orders, isLoading, isError } = useGetOrdersByUserQuery(userId ?? '', {
    skip: !userId,
  });

  // Métricas pedidas para la entrega.
  const totalOrders = orders?.length ?? 0;

  // Nico: si luego cambian la forma de guardar items, revisen esta suma.
  const totalSpent = orders?.reduce((acc: number, order: any) => {
    const orderTotal = order.items?.reduce(
      (sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 1),
      0
    ) ?? 0;
    return acc + orderTotal;
  }, 0) ?? 0;

  if (!userId) {
    return (
      <div className="buyer-overview-page">
        <h1>Mis Compras</h1>
        <p>Inicia sesión para ver tus compras.</p>
      </div>
    );
  }

  if (isLoading) return <p>Cargando tus órdenes...</p>;
  if (isError) return <p>Error al cargar las órdenes.</p>;

  return (
    <div className="buyer-overview-page">
      <h1>Mis Compras</h1>

      {/* tarjetas con las métricas */}
      <div className="overview-cards">
        <div className="overview-card">
          <h3>Total de Órdenes</h3>
          <p className="overview-value">{totalOrders}</p>
        </div>
        <div className="overview-card">
          <h3>Total Gastado</h3>
          <p className="overview-value">${totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* lista de órdenes recientes */}
      <h2>Órdenes Recientes</h2>
      {totalOrders === 0 ? (
        <p>No tienes órdenes aún.</p>
      ) : (
        <ul className="orders-list">
          {orders?.map((order: any) => (
            <li key={order.id} className="order-item-card">
              <span>Orden #{order.id}</span>
              <span>Estado: {order.status}</span>
              <span>Productos: {order.items?.length ?? 0}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuyerOverview;
