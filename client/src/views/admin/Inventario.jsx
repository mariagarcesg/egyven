import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import axios from 'axios';

const InventarioView = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const fetchProductos = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/api/productos`);
                setProductos(res.data || []);
            } catch (err) {
                setError('Error al cargar productos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            <Navbar />
            <div className="h-20"></div>

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
                <div className="bg-white border border-slate-200 rounded-[1rem] overflow-hidden shadow-sm min-h-[200px]">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Productos</h2>

                        {loading && (
                            <div className="text-slate-500 italic">Cargando productos...</div>
                        )}

                        {error && (
                            <div className="text-red-500">{error}</div>
                        )}

                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Costo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio Venta</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock Actual</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {productos.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{p.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.SKU || p.sku || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.costo != null ? p.costo : '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.precio_venta != null ? p.precio_venta : '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.stock_actual != null ? p.stock_actual : '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.categoria_nombre || (p.categoria_id && p.categoria_id.nombre) || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {productos.length === 0 && (
                                    <div className="py-6 text-center text-slate-500">No se encontraron productos.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InventarioView;