import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

const UsuariosView = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navbar />
      <div className="h-20"></div>

      <header className="py-14 px-6 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Staff Administration</span>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
            GESTIÓN DE <span className="text-indigo-600">USUARIOS</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold">Lista de Personal</h3>
            <input type="text" placeholder="Buscar usuario..." className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div className="p-20 text-center text-slate-400 italic">
            Módulo de seguridad activo para Administrador.
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsuariosView;