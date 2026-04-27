import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

const FacturacionView = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <Navbar />
            <div className="h-20"></div>

            <header className="py-14 px-6 border-b border-slate-100 bg-slate-50/50">
                <div className="max-w-7xl mx-auto">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Sales & Billing</span>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
                        SISTEMA DE <span className="text-blue-600">FACTURACIÓN</span>
                    </h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Nueva Venta</h3>
                        <div className="h-64 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                            Área de Terminal de Venta
                        </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
                        <h3 className="text-lg font-bold mb-4">Resumen</h3>
                        <p className="text-sm text-slate-500 italic">No hay transacciones activas.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacturacionView;