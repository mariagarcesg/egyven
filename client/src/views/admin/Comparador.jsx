import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

const ComparadorView = () => {
    return (
        <div className="min-h-screen bg-[#05070a] text-white font-sans">
            <Navbar />
            <div className="h-20"></div>
            <div className="max-w-7xl mx-auto px-6 py-10">
                <h1 className="text-4xl font-black italic">COMPARADOR DE PRECIOS</h1>
                <p className="text-slate-400 mt-4">Módulo de logística y análisis de mercado.</p>
            </div>
        </div>
    );
};

export default ComparadorView; 