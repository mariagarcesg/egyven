import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';

const ComparadorView = () => {
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState('');
  const [competidores, setCompetidores] = React.useState([]);
  const [precios, setPrecios] = React.useState([]);
  const [productos, setProductos] = React.useState([]);

  const loadCompetidores = async () => {
    try {
      const resp = await fetch('http://localhost:5000/api/comparador/competidores');
      const data = await resp.json();
      if (resp.ok && data.ok) setCompetidores(data.rows || []);
    } catch (e) { console.warn(e); }
  };

  const loadPrecios = async () => {
    try {
      const resp = await fetch('http://localhost:5000/api/comparador/precios');
      const data = await resp.json();
      if (resp.ok && data.ok) setPrecios(data.rows || []);
    } catch (e) { console.warn(e); }
  };

  const loadProductos = async () => {
    try {
      const resp = await fetch('http://localhost:5000/api/productos');
      const data = await resp.json();
      if (resp.ok && Array.isArray(data)) setProductos(data || []);
    } catch (e) { console.warn(e); }
  };

  const runComparador = async () => {
    if (running) return;
    setRunning(true);
    setLog('Iniciando...');
    try {
      const resp = await fetch('http://localhost:5000/api/comparador/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 0, delayMs: 200 })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Error');
      setLog(JSON.stringify(data, null, 2));
      await Promise.all([loadCompetidores(), loadPrecios(), loadProductos()]);
    } catch (err) {
      setLog('Error: ' + (err.message || String(err)));
    } finally {
      setRunning(false);
    }
  };

  // Lógica matemática y visual avanzada para la columna de análisis de mercado
  const renderComparison = (myPrice, competitorPrice) => {
    const a = (myPrice === null || myPrice === undefined || myPrice === '') ? null : Number(myPrice);
    const b = (competitorPrice === null || competitorPrice === undefined || competitorPrice === '') ? null : Number(competitorPrice);
    
    if (a === null || isNaN(a) || b === null || isNaN(b)) {
      return <span className="text-slate-500 font-medium">-</span>;
    }
    
    if (a < b) {
      const diff = (b - a).toFixed(2);
      return (
        <span className="text-green-800 font-bold flex items-center gap-1">
          ▼ -${diff}
        </span>
      );
    }
    if (a > b) {
      const diff = (a - b).toFixed(2);
      return (
        <span className="text-rose-500 font-bold flex items-center gap-1">
          ▲ +${diff}
        </span>
      );
    }
    return <span className="text-slate-400 font-bold">= IGUAL</span>;
  };

  React.useEffect(() => {
    loadCompetidores();
    loadPrecios();
    loadProductos();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar />
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-black italic tracking-wide">COMPARADOR DE PRECIOS</h1>
        <p className="text-slate-400 mt-2">Módulo de logística y análisis de mercado para la toma de decisiones.</p>

        <div className="mt-6 flex gap-4 items-center">
          <button 
            onClick={runComparador} 
            disabled={running} 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 rounded-md font-bold text-white transition-colors text-sm shadow-md"
          >
            {running ? 'Ejecutando escaneo...' : 'Ejecutar actualización de precios'}
          </button>
          <button 
            onClick={() => { loadCompetidores(); loadPrecios(); loadProductos(); }} 
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-md text-white transition-colors text-sm font-semibold border border-slate-700/40"
          >
            Refrescar tablas
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10">
          {/* TABLA 1: PRODUCTO COMPETIDORES */}
          <div>
            <h2 className="text-xl font-bold text-slate-500 tracking-tight">Producto Competidores</h2>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-900/40">
              <table className="min-w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700/50">
                    <th className="px-4 py-3 font-semibold">Mis Productos</th>
                    <th className="px-4 py-3 font-semibold">Mis Precios</th>
                    <th className="px-4 py-3 font-semibold">Plataforma</th>
                    <th className="px-4 py-3 font-semibold">Producto Competidor / URL</th>
                    <th className="px-4 py-3 font-semibold">Fecha de creación</th>
                  </tr>
                </thead>
                <tbody>
                  {competidores.map((c) => (
                    <tr key={c.id} className="border-b border-slate-800/40 hover:bg-slate-900/60 transition-colors text-slate-300">
                      <td className="px-4 py-3 font-medium text-slate-900 bg-blue-100">{(productos.find(prod => prod.id == c.producto_id) || {}).nombre || c.producto_id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 bg-blue-100">${(productos.find(prod => prod.id == c.producto_id) || {}).precio_venta ?? '-'}</td>
                      <td className="px-4 py-3 text-blue-800 font-medium">{c.plataforma}</td>
                      <td className="px-4 py-3 text-slate-800 font-mono text-xs max-w-xs truncate" title={c.competitor_product_id || c.url_competidor}>
                        {c.competitor_product_id || c.url_competidor}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLA 2: PRECIOS COMPETENCIA */}
          <div>
            <h2 className="text-xl font-bold text-slate-500 tracking-tight">Precios Competencia</h2>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-900/40">
              <table className="min-w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-200 border-b border-slate-700/50">
                    <th className="px-4 py-3 font-semibold">Mis Productos</th>
                    <th className="px-4 py-3 font-semibold">Mis Precios</th>
                    <th className="px-4 py-3 font-semibold">Plataforma</th>
                    <th className="px-4 py-3 font-semibold">Producto Competidor</th>
                    <th className="px-4 py-3 font-semibold">Precio competencia</th>
                    <th className="px-4 py-3 font-semibold">Análisis de Mercado</th>
                    <th className="px-4 py-3 font-semibold">Última Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {precios.map((p) => {
                    const producto = productos.find(prod => prod.id == p.producto_id) || {};
                    return (
                      <tr key={p.id} className="border-b border-slate-800/40 hover:bg-slate-900/60 transition-colors text-slate-300">
                        <td className="px-4 py-3 font-medium text-slate-900 bg-blue-100">{producto.nombre || p.producto_id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 bg-blue-100">${producto.precio_venta ?? '-'}</td>
                        <td className="px-4 py-3 text-blue-800 font-medium">{p.plataforma}</td>
                        <td className="px-4 py-3 text-slate-800 max-w-xs truncate font-medium" title={p.nombre_competidor}>
                          {p.nombre_competidor || 'Cargando nombre del catálogo...'}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">${Number(p.precio_competencia).toFixed(2)}</td>
                        <td className="px-4 py-3">{renderComparison(producto.precio_venta, p.precio_competencia)}</td>
                        <td className="px-4 py-3 text-slate-700 text-xs">{p.ultima_actualizacion ? new Date(p.ultima_actualizacion).toLocaleString() : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* REGISTRO DE CONSOLA DE LA API */}
        {log && (
          <div className="mt-8">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Log de la última transacción</span>
            <pre className="mt-1 bg-slate-900 text-slate-300 p-4 rounded-lg text-xs font-mono border border-slate-800 whitespace-pre-wrap shadow-inner max-h-48 overflow-y-auto">
              {log}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparadorView;