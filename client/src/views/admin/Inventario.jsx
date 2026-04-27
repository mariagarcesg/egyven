import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

const InventarioView = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <Navbar />
            <div className="h-20"></div> {/* Espaciador para el Navbar fijo */}

            <header className="py-14 px-6 border-b border-slate-100 bg-slate-50/50">
                <div className="max-w-7xl mx-auto flex justify-between items-end">
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Warehouse & Stock</span>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
                            CONTROL DE <span className="text-blue-600">INVENTARIO</span>
                        </h1>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        + Añadir Producto
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Contenedor de la Tabla (Fondo Blanco con sombra suave) */}
                <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-medium italic">Cargando base de datos de productos...</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InventarioView;