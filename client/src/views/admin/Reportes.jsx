import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const pieData = [
  { name: 'Directos', value: 400 },
  { name: 'Referidos', value: 300 },
  { name: 'Campañas', value: 300 },
  { name: 'Otros', value: 200 }
];

const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171'];

const lineData = [
  { date: '2026-05-01', ventas: 120 },
  { date: '2026-05-04', ventas: 200 },
  { date: '2026-05-07', ventas: 150 },
  { date: '2026-05-10', ventas: 250 },
  { date: '2026-05-13', ventas: 300 },
  { date: '2026-05-16', ventas: 280 },
  { date: '2026-05-19', ventas: 320 }
];

const areaData = lineData;

const barData = [
  { name: 'Ene', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 350 },
  { name: 'Abr', value: 280 },
  { name: 'May', value: 500 }
];

const Reportes = () => {
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
            <h2 className="text-lg font-bold mb-4">Origen de ventas (ejemplo)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Simple Line Chart */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Ventas (últimos días) - ejemplo</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ReTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#60A5FA" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Segunda fila de gráficos: Area y Tiny Bar */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Tendencia acumulada (Area) - ejemplo</h2>
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
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <ReTooltip />
                  <Area type="monotone" dataKey="ventas" stroke="#60A5FA" fillOpacity={1} fill="url(#colorVentas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Mini Bar (ejemplo)</h2>
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tick={{ fontSize: 12 }} width={60} />
                  <ReTooltip />
                  <Bar dataKey="value" fill="#34D399" radius={[4,4,4,4]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reportes;
