import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar.jsx';

const Principal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const modulos = [
    { id: 'facturacion', title: 'Facturación', desc: 'Ventas y reportes financieros.', color: 'bg-blue-600', path: '/admin/facturacion' },
    { id: 'usuarios', title: 'Usuarios', desc: 'Personal y permisos.', color: 'bg-indigo-600', path: '/admin/usuarios' },
    { id: 'inventario', title: 'Inventario', desc: 'Stock y componentes.', color: 'bg-cyan-600', path: '/admin/inventario' },
    { id: 'comparador', title: 'Comparador', desc: 'Análisis de costos.', color: 'bg-slate-800', path: '/admin/comparador' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      <div className="h-20"></div>

      <header className="py-20 px-6 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Management System</span>
          <h1 className="text-6xl font-black tracking-tighter mb-6 uppercase text-slate-900">
            PANEL <span className="text-blue-600">ADMINISTRATIVO</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Bienvenido, <span className="font-bold text-slate-800">{user?.nombre}</span>. Gestiona los procesos operativos de EGYVEN.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modulos
            .filter(mod => !(user?.rol_id === 4 && mod.id === 'usuarios'))
            .map((mod) => (
              <div
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className="group border border-slate-200 bg-white p-10 rounded-[2.5rem] cursor-pointer transition-all duration-500 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className={`w-14 h-14 rounded-2xl ${mod.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black mb-3 uppercase italic tracking-tighter text-slate-900">
                  {mod.title}
                </h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  {mod.desc}
                </p>
                <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                  Entrar →
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Principal;