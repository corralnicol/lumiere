import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserState } from '@/contexts/user/UserContext';
import './SellerAnalytics.css';

interface SellerMetrics {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  top_product_by_units: string | null;
}

interface ChartData {
  name: string;
  revenue: number;
}

const SellerAnalytics: React.FC = () => {
  const user = useUserState();
  const [metrics, setMetrics] = useState<SellerMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch summary metrics from the view
        const { data: metricsData, error: metricsError } = await supabase
          .from('seller_analytics')
          .select('*')
          .maybeSingle(); // maybeSingle because if they have no sales, it returns nothing
          
        if (metricsError) throw metricsError;

        if (metricsData) {
          setMetrics({
            total_orders: metricsData.total_orders,
            total_revenue: metricsData.total_revenue,
            avg_order_value: metricsData.avg_order_value,
            top_product_by_units: metricsData.top_product_by_units,
          });
        }

        // 2. Fetch chart data (revenue by product)
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            quantity,
            unit_price,
            product_id,
            products:product_id (name)
          `)
          .eq('seller_id', user.id);

        if (itemsError) throw itemsError;

        if (orderItems && orderItems.length > 0) {
          const revenueByProduct: Record<string, number> = {};
          
          orderItems.forEach((item: any) => {
            const productName = item.products?.name || 'Unknown Product';
            const revenue = item.quantity * item.unit_price;
            if (!revenueByProduct[productName]) {
              revenueByProduct[productName] = 0;
            }
            revenueByProduct[productName] += revenue;
          });

          const formattedChartData = Object.keys(revenueByProduct).map(key => ({
            name: key.length > 15 ? key.substring(0, 15) + '...' : key,
            revenue: revenueByProduct[key]
          })).sort((a, b) => b.revenue - a.revenue);

          setChartData(formattedChartData);
        }

      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  if (loading) {
    return <div className="analytics-loading">Cargando métricas...</div>;
  }

  if (!metrics || metrics.total_orders === 0) {
    return (
      <div className="seller-analytics-container">
        <h3 className="seller-analytics-title">Analíticas de Ventas</h3>
        <div className="analytics-empty">Aún no tienes ventas para mostrar analíticas.</div>
      </div>
    );
  }

  return (
    <div className="seller-analytics-container">
      <h3 className="seller-analytics-title">Analíticas de Ventas</h3>
      <p className="seller-analytics-subtitle">Resumen de tu rendimiento como vendedor</p>

      <div className="analytics-metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Órdenes Recibidas</span>
          <span className="metric-value">{metrics.total_orders}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Ingresos Totales</span>
          <span className="metric-value">${Number(metrics.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Valor Promedio por Orden</span>
          <span className="metric-value">${Number(metrics.avg_order_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-section">
          <h4 className="chart-title">Ingresos por Producto</h4>
          <div className="custom-bar-chart">
            {chartData.map((data, index) => {
              const maxRevenue = Math.max(...chartData.map(d => d.revenue));
              const percentage = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="custom-bar-row">
                  <span className="custom-bar-label">{data.name}</span>
                  <div className="custom-bar-track">
                    <div className="custom-bar-fill" style={{ width: `${Math.max(percentage, 1)}%` }}></div>
                  </div>
                  <span className="custom-bar-value">${data.revenue.toLocaleString('en-US')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics;
