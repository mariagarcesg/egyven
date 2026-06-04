import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import axios from 'axios';
import useTasaCambio from '../../hooks/useTasaCambio.js';

const InventarioView = () => {
    const tasa = useTasaCambio();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        nombre: '',
        sku: '',
        costo: '',
        precio_venta: '',
        stock_actual: '',
        categoria_id: '',
        imagen: null,
        status: '1'
    });

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
        // fetch categorias
        const fetchCategorias = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/productos/categorias`);
                setCategories(res.data || []);
            } catch (err) {
                console.error('Error cargando categorias', err);
            }
        };
        fetchCategorias();
    }, []);

    const openModal = (product = null) => {
        if (product) {
            setForm({
                nombre: product.nombre || '',
                sku: product.sku || product.SKU || '',
                costo: product.costo != null ? String(product.costo) : '',
                precio_venta: product.precio_venta != null ? String(product.precio_venta) : '',
                stock_actual: product.stock_actual != null ? String(product.stock_actual) : '',
                categoria_id: product.categoria_id || '',
                imagen: null,
                status: product.status != null ? String(product.status) : '0'
            });
            setEditingId(product.id);
        } else {
            setForm({ nombre:'', sku:'', costo:'', precio_venta:'', stock_actual:'', categoria_id:'', imagen:null, status: '1' });
            setEditingId(null);
        }
        setModalOpen(true);
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        // En campos numericos, permitir solo numeros y punto
        if ((name === 'costo' || name === 'precio_venta') && value !== '') {
            if (!/^[0-9]*\.?[0-9]*$/.test(value)) return;
        }
        if (name === 'stock_actual' && value !== '') {
            if (!/^[0-9]+$/.test(value)) return;
        }
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFile = (e) => {
        setForm(prev => ({ ...prev, imagen: e.target.files[0] }));
    };

    const handleCheckbox = (e) => {
        setForm(prev => ({ ...prev, status: e.target.checked ? '1' : '0' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const fd = new FormData();
            fd.append('nombre', form.nombre);
            fd.append('sku', form.sku);
            fd.append('costo', form.costo || 0);
            fd.append('precio_venta', form.precio_venta || 0);
            fd.append('stock_actual', form.stock_actual || 0);
            fd.append('categoria_id', form.categoria_id || null);
            fd.append('status', form.status != null ? form.status : '0');
            if (form.imagen) fd.append('imagen', form.imagen);

            let res;
            if (editingId) {
                res = await axios.put(`${API_URL}/api/productos/${editingId}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // reemplazar producto en la lista
                setProductos(prev => prev.map(p => p.id === editingId ? res.data : p));
            } else {
                res = await axios.post(`${API_URL}/api/productos`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setProductos(prev => [res.data, ...prev]);
            }
            setModalOpen(false);
            setEditingId(null);
        } catch (err) {
            console.error('Error creando producto', err);
            alert('Error creando producto');
        }
    };

    const handleToggleStatus = async (producto) => {
        const nuevoStatus = producto.status == 1 ? 0 : 1;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const fd = new FormData();
            fd.append('status', nuevoStatus);
            await axios.put(`${API_URL}/api/productos/${producto.id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProductos(prev => prev.map(p => p.id === producto.id ? { ...p, status: nuevoStatus } : p));
        } catch (err) {
            console.error('Error al cambiar status', err);
            alert('Error al cambiar el status del producto');
        }
    };

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
                    <button onClick={openModal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        + Añadir Producto
                    </button>
                </div>
            </header>

            {/* Modal Agregar Producto */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl bg-white rounded-2xl overflow-auto p-6">
                        <h3 className="text-xl font-bold mb-4">Agregar Producto</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold mb-1">Nombre</label>
                                <input name="nombre" value={form.nombre} onChange={handleInput} required className="w-full rounded-md border px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Código (SKU)</label>
                                <input name="sku" value={form.sku} onChange={handleInput} required className="w-full rounded-md border px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Costo</label>
                                <input name="costo" value={form.costo} onChange={handleInput} className="w-full rounded-md border px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Precio</label>
                                <input name="precio_venta" value={form.precio_venta} onChange={handleInput} className="w-full rounded-md border px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Cantidad a ingresar</label>
                                <input name="stock_actual" value={form.stock_actual} onChange={handleInput} className="w-full rounded-md border px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Categoría</label>
                                <select name="categoria_id" value={form.categoria_id} onChange={handleInput} className="w-full rounded-md border px-3 py-2">
                                    <option value="">Seleccione...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input id="disponibilidad" type="checkbox" checked={form.status === '1'} onChange={handleCheckbox} />
                                <label htmlFor="disponibilidad" className="text-sm font-medium">Disponibilidad</label>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold mb-1">Imagen</label>
                                <input type="file" accept="image/*" onChange={handleFile} className="w-full" />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">Cancelar</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                            <div className="overflow-x-auto px-4">
                                <table className="w-full table-auto divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Costo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Precio Venta</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock Actual</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {productos.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4 whitespace-normal text-sm text-slate-900">{p.nombre}</td>
                                                <td className="px-6 py-4 whitespace-normal text-sm text-slate-700 bg-slate-200">{p.SKU || p.sku || '-'}</td>
                                                <td className="px-6 py-4 whitespace-normal text-sm text-slate-700">{p.costo != null ? p.costo : '-'}</td>
                                                <td className="px-6 py-4 whitespace-normal text-sm text-slate-700 bg-green-100">
                                                    <div>{p.precio_venta != null ? p.precio_venta : '-'}</div>
                                                    {tasa && p.precio_venta != null && <div className="text-xs text-slate-400 mt-0.5">Bs. {(Number(p.precio_venta) * tasa).toFixed(2)}</div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal text-sm text-slate-700">{p.stock_actual != null ? p.stock_actual : '-'}</td>
                                                <td className="px-6 py-4 whitespace-normal text-sm bg-blue-50">
                                                    <button
                                                        onClick={() => handleToggleStatus(p)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${p.status == 1 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                                    >
                                                        {p.status == 1 ? 'Disponible' : 'No disponible'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{p.categoria_nombre || (p.categoria_id && p.categoria_id.nombre) || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                    <button onClick={() => openModal(p)} className="px-3 py-1 text-sm rounded bg-yellow-500 text-white mr-2">Editar</button>
                                                </td>
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