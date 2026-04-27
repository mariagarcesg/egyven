import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { useNavigate } from 'react-router-dom';

const Principal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    // Solo roles 1 y 4 tienen acceso
    if (parsedUser.rol_id !== 1 && parsedUser.rol_id !== 4) {
      navigate('/');
    } else {
      setUser(parsedUser);
    }
  }, [navigate]);

  const modulos = [
    {
      id: 'facturacion',
      title: 'Facturación',
      desc: 'Gestión de ventas, facturas y reportes financieros.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-600 to-blue-800',
      path: '/facturacion'
    },
    {
      id: 'usuarios',
      title: 'Usuarios',
      desc: 'Administración de personal, roles y permisos de acceso.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-indigo-600 to-indigo-800',
      path: '/usuarios'
    },
    {
      id: 'inventario',
      title: 'Inventario',
      desc: 'Control de stock, activos y almacén de componentes.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-600',
      path: '/inventario'
    },
    {
      id: 'comparador',
      title: 'Comparador de Precios',
      desc: 'Análisis de mercado y comparativa de costos industriales.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-slate-700 to-slate-900',
      path: '/comparador'
    }
  ];

  const isAdmin = user?.rol_id === 1 || user?.rol_id === 4;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isAdmin ? 'bg-white text-slate-900' : 'bg-[#05070a] text-slate-200'} font-sans`}>
      <Navbar />
      <div className="h-20"></div>

      {/* Hero Section Simplificada */}
      <header className={`py-20 px-6 border-b ${isAdmin ? 'border-slate-200 bg-slate-50' : 'border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Panel de Administración</span>
          <h1 className={`text-6xl font-black tracking-tighter mb-6 uppercase ${isAdmin ? 'text-slate-900' : 'text-white'}`}>
            SISTEMA <span className="text-blue-600">PRINCIPAL</span>
          </h1>
          <p className={`${isAdmin ? 'text-slate-500' : 'text-slate-400'} max-w-2xl mx-auto text-lg leading-relaxed`}>
            Bienvenido al centro de control de EGYVEN. Gestiona todos los procesos operativos desde aquí.
          </p>
        </div>
      </header>

      {/* Grid de Módulos */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modulos
            .filter(modulo => !(user?.rol_id === 4 && modulo.id === 'usuarios'))
            .map((modulo) => (
            <div 
              key={modulo.id}
              onClick={() => navigate(modulo.path)}
              className={`group relative border rounded-[2.5rem] p-10 overflow-hidden cursor-pointer transition-all duration-500 shadow-xl ${
                isAdmin 
                  ? 'bg-white border-slate-100 hover:border-blue-500 hover:shadow-blue-500/10' 
                  : 'bg-[#0d1117] border-white/5 hover:border-blue-500/40 shadow-2xl'
              }`}
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${modulo.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${modulo.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  {modulo.icon}
                </div>
                
                <h3 className={`text-3xl font-black mb-4 transition-colors uppercase italic tracking-tighter ${isAdmin ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-400'}`}>
                  {modulo.title}
                </h3>
                
                <p className={`text-sm leading-relaxed mb-8 max-w-xs ${isAdmin ? 'text-slate-500' : 'text-slate-500'}`}>
                  {modulo.desc}
                </p>

                <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  Acceder al Módulo
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </main>

      <footer className={`py-10 text-center border-t mt-auto ${isAdmin ? 'border-slate-200 bg-slate-50' : 'border-white/5'}`}>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
          EGYVEN Industrial Management System © 2026
        </p>
      </footer>
    </div>
  );
};

export default Principal;
