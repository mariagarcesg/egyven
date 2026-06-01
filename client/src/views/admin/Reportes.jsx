import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
// dynamic import of react-chartjs-2/chart.js to avoid Vite static resolution errors

// default placeholder data
const pieDataDefault = [
  { name: 'Directos', value: 400 },
  { name: 'Referidos', value: 300 },
  { name: 'Campañas', value: 300 },
  { name: 'Otros', value: 200 }
];

const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171'];

const lineDataDefault = [
  { date: '2026-05-01', ventas: 120 },
  { date: '2026-05-04', ventas: 200 },
  { date: '2026-05-07', ventas: 150 },
  { date: '2026-05-10', ventas: 250 },
  { date: '2026-05-13', ventas: 300 },
  { date: '2026-05-16', ventas: 280 },
  { date: '2026-05-19', ventas: 320 }
];

// Helper: format 'YYYY-MM-DD' or 'YYYY-MM' to 'Mes Año' (e.g., 'May 2026')
function formatMonthYear(dateStr) {
  if (!dateStr) return '';
  // handle 'YYYY-MM' or 'YYYY-MM-DD'
  let d;
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [y,m] = dateStr.split('-');
    d = new Date(Number(y), Number(m) - 1, 1);
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d)) return dateStr;
  return new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(d);
}

  // areaData will show individual invoices (estatus_id = 3) by fecha_venta

const barDataDefault = [
  { name: 'Ene', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 350 },
  { name: 'Abr', value: 280 },
  { name: 'May', value: 500 }
];

const Reportes = () => {
  const [pieData, setPieData] = React.useState(pieDataDefault);
  const [loadingPie, setLoadingPie] = React.useState(true);
  const [pieRealData, setPieRealData] = React.useState(false);
  const [ChartPieComp, setChartPieComp] = React.useState(null);
  const [chartAvailable, setChartAvailable] = React.useState(false);
  const [retryingChart, setRetryingChart] = React.useState(false);
  const [lineData, setLineData] = React.useState(lineDataDefault);
  const [loadingLine, setLoadingLine] = React.useState(true);
  const [areaData, setAreaData] = React.useState(lineDataDefault);
  const [barData, setBarData] = React.useState(barDataDefault);
  const [loadingBar, setLoadingBar] = React.useState(true);

  React.useEffect(() => {
    const fetchTop = async () => {
      setLoadingPie(true);
      try {
        const res = await fetch('http://localhost:5000/api/facturas/top-productos');
        if (!res.ok) throw new Error('No response');
        const data = await res.json();
        console.log('Top productos ->', data);
        if (Array.isArray(data) && data.length) {
          setPieData(data.map(d => ({ name: d.nombre || `#${d.producto_id}`, value: Number(d.total) })));
          setPieRealData(true);
        } else {
          setPieData(pieDataDefault);
          setPieRealData(false);
        }
      } catch (err) {
        console.error('Error fetching top productos:', err);
        setPieData(pieDataDefault);
        setPieRealData(false);
      } finally {
        setLoadingPie(false);
      }
    };
    fetchTop();

    // Fetch ventas por dia (últimos 30 días)
    (async () => {
      setLoadingLine(true);
      try {
        const resp = await fetch('http://localhost:5000/api/facturas/ventas-ultimos-dias?days=30');
        if (!resp.ok) throw new Error('No response ventas');
        const d = await resp.json();
        if (Array.isArray(d) && d.length) {
          setLineData(d.map(item => ({ date: item.fecha, ventas: Number(item.total) })));
        } else {
          setLineData(lineDataDefault);
        }
      } catch (err) {
        console.error('Error fetching ventas por dia:', err);
        setLineData(lineDataDefault);
      } finally {
        setLoadingLine(false);
      }
    })();

    // Fetch invoices with estatus_id = 3 to populate area chart points
    (async () => {
      try {
        const resp = await fetch('http://localhost:5000/api/facturas');
        if (!resp.ok) throw new Error('No response facturas');
        const all = await resp.json();
        if (Array.isArray(all) && all.length) {
          const filtered = all
            .filter(f => Number(f.estatus_id) === 3)
            .map(f => ({ date: f.fecha_venta ? f.fecha_venta.split('T')[0] : f.fecha_venta, ventas: Number(f.total_pagado || f.total || 0) }));
          // sort by date asc
          filtered.sort((a,b) => new Date(a.date) - new Date(b.date));
          if (filtered.length) setAreaData(filtered);
        }
      } catch (err) {
        console.error('Error fetching facturas for area chart:', err);
      }
    })();

    // Fetch equipos ingresos por mes (últimos 12 meses)
    (async () => {
      setLoadingBar(true);
      try {
        const resp = await fetch('http://localhost:5000/api/facturas/equipos-ingresos-por-mes?months=12');
        if (!resp.ok) throw new Error('No response equipos por mes');
        const d = await resp.json();
        if (Array.isArray(d) && d.length) {
          // map to { name: 'YYYY-MM', value: count }
          const mapped = d.map(item => ({ name: item.month, value: Number(item.count) }));
          setBarData(mapped);
        } else {
          setBarData(barDataDefault);
        }
      } catch (err) {
        console.error('Error fetching equipos ingresos por mes:', err);
        setBarData(barDataDefault);
      } finally {
        setLoadingBar(false);
      }
    })();

    // Try to dynamically load Chart.js/react-chartjs-2; if not installed, we'll fallback
    (async () => {
      try {
        const [mod] = await Promise.all([import('react-chartjs-2'), import('chart.js/auto')]);
        if (mod && mod.Pie) {
          setChartPieComp(() => mod.Pie);
          setChartAvailable(true);
        }
      } catch (err) {
        console.warn('chart libs not available, fallback to list view', err);
        setChartAvailable(false);
        setChartPieComp(null);
      }
    })();

    const reattemptLoadChart = async () => {
      setRetryingChart(true);
      try {
        const mod = await import('react-chartjs-2');
        await import('chart.js/auto');
        if (mod && mod.Pie) {
          setChartPieComp(() => mod.Pie);
          setChartAvailable(true);
        }
      } catch (err) {
        console.warn('Retry load failed', err);
        setChartAvailable(false);
      } finally {
        setRetryingChart(false);
      }
    };
  }, []);

  const PieSection = () => {
    const labels = pieData.map(p => p.name);
    const values = pieData.map(p => p.value);
    const chartData = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: COLORS.slice(0, values.length),
          borderWidth: 1
        }
      ]
    };

    const options = {
      maintainAspectRatio: false,
      layout: { padding: { bottom: 8, left: 6, right: 6 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            boxWidth: 12,
            padding: 8
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const sum = context.dataset.data.reduce((a,b) => a + b, 0) || 0;
              const pct = sum ? ((value / sum) * 100).toFixed(1) : '0.0';
              return `${label}: ${value} (${pct}%)`;
            }
          }
        }
      }
    };

    return (
      <div className="w-full h-64">
        <div className="w-full h-full">
          {chartAvailable && ChartPieComp ? (
            <ChartPieComp data={chartData} options={options} />
          ) : (
            <div className="p-4">
              <ul className="space-y-2">
                {pieData.map((p, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-3 h-3" style={{ background: COLORS[i % COLORS.length] }}></span>
                    <span className="font-bold">{p.name}</span>
                    <span className="text-slate-500 ml-2">{p.value}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-3">
                <div className="text-sm text-yellow-600">Instala `react-chartjs-2` y `chart.js` para ver el gráfico.</div>
                <button
                  onClick={async () => {
                    if (retryingChart) return;
                    setRetryingChart(true);
                    try {
                      const mod = await import('react-chartjs-2');
                      await import('chart.js/auto');
                      if (mod && mod.Pie) {
                        setChartPieComp(() => mod.Pie);
                        setChartAvailable(true);
                      }
                    } catch (err) {
                      console.warn('Retry load failed', err);
                    } finally {
                      setRetryingChart(false);
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-bold bg-blue-600 text-white ${retryingChart ? 'opacity-60 cursor-wait' : 'hover:bg-blue-700'}`}
                >
                  {retryingChart ? 'Intentando...' : 'Reintentar cargar gráfico'}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2">
          {loadingPie && <div className="text-sm text-slate-400 italic">Cargando datos...</div>}
          {!loadingPie && !pieRealData && <div className="text-sm text-yellow-600 font-bold">Usando datos por defecto</div>}
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="h-20"></div>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-black">Reportes</h1>
          <p className="text-slate-500 mt-2">Resumenes de ventas y métricas del sistema.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Producto más pedido</h2>
            <PieSection />
          </div>

          {/* Simple Line Chart */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Ventas en los últimos días</h2>
            <div className="w-full h-72">
              {loadingLine ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-400 italic">Cargando ventas...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={val => formatMonthYear(val)} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ventas" stroke="#60A5FA" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        {/* Segunda fila de gráficos: Area y Tiny Bar */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Tendencia acumulada (Ventas) </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={val => formatMonthYear(val)} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="ventas" stroke="#60A5FA" fillOpacity={1} fill="url(#colorVentas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Equipos Servicio Ténico por Mes</h2>
            <div className="w-full h-40">
              {loadingBar ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-400 italic">Cargando entradas de equipos...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tick={{ fontSize: 12 }} tickFormatter={val => formatMonthYear(val)} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#34D399" radius={[4,4,4,4]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reportes;
