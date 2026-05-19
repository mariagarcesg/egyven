import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

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
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">Resumen de ventas (próximamente)</div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">Top productos (próximamente)</div>
        </section>
      </main>
    </div>
  );
};

export default Reportes;
