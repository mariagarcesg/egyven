import React from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import Notification from '../../components/ui/Notification.jsx';

const ComparadorView = () => {
  const [running, setRunning] = React.useState(false);
  const [log, setLog] = React.useState('');
  const [competidores, setCompetidores] = React.useState([]);
  const [precios, setPrecios] = React.useState([]);
  const [productos, setProductos] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formProductoId, setFormProductoId] = React.useState('');
  const [formPlataforma, setFormPlataforma] = React.useState('Amazon');
  const [formUrl, setFormUrl] = React.useState('');
  const [notification, setNotification] = React.useState({ message: '', type: 'success' });
  const [editingId, setEditingId] = React.useState(null);

  const clearForm = () => {
    setFormProductoId('');
    setFormPlataforma('Amazon');
    setFormUrl('');
  };

  const handleCreateCompetidor = async (e) => {
    e.preventDefault();
    if (!formProductoId || !formPlataforma || !formUrl) {
      setNotification({ message: 'Complete todos los campos', type: 'error' });
      return;
    }
    try {
      const extractCompetitorId = (url, plataforma) => {
        try {
          const u = String(url || '');
          if (plataforma === 'Amazon') {
            const m = u.match(/\/dp\/([A-Z0-9]{10})/i) || u.match(/([A-Z0-9]{10})/i);
            return m ? m[1] : null;
          }
          if (plataforma === 'eBay') {
            const m = u.match(/\/itm\/(\d{12})/i) || u.match(/(\d{12})/);
            return m ? m[1] : null;
          }
        } catch (e) { /* ignore */ }
        return null;
      };

      const competitor_product_id = extractCompetitorId(formUrl, formPlataforma);
      const payload = { producto_id: formProductoId, plataforma: formPlataforma, url: formUrl };
      if (competitor_product_id) payload.competitor_product_id = competitor_product_id;
      let resp;
      // If editingId is set, try to update via PUT; otherwise create via POST
      if (editingId) {
        resp = await fetch(`http://localhost:5000/api/comparador/competidores/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        // fallback to POST if PUT not supported
        if (resp.status === 404) {
          resp = await fetch('http://localhost:5000/api/comparador/competidores', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
        }
      } else {
        resp = await fetch('http://localhost:5000/api/comparador/competidores', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
      }
      if (!resp.ok) {
        const text = await resp.text().catch(() => null);
        throw new Error(text || resp.statusText || 'Error al guardar');
      }
      const data = await resp.json();
      // success
      setIsModalOpen(false);
      clearForm();
      setEditingId(null);
      await loadCompetidores();
      setNotification({ message: 'Competidor asociado correctamente', type: 'success' });
    } catch (err) {
      console.error('Error creando competidor:', err);
      setNotification({ message: 'Error: ' + (err.message || String(err)), type: 'error' });
    }
  };

  const openEditModal = (row) => {
    // row may be a precio row; prefer competitor-specific fields when available
    setFormProductoId(row.producto_id || '');
    setFormPlataforma(row.plataforma || 'Amazon');
    const buildUrlFromId = (plataforma, id) => {
      if (!id) return '';
      if (plataforma === 'Amazon') return `https://www.amazon.com/dp/${id}`;
      if (plataforma === 'eBay') return `https://www.ebay.com/itm/${id}`;
      return id;
    };

    const urlToUse = row.url_competidor || (row.competitor_product_id ? buildUrlFromId(row.plataforma || 'Amazon', row.competitor_product_id) : '') || row.nombre_competidor || '';
    setFormUrl(urlToUse);
    setEditingId(row.competitor_id || row.id || null);
    setIsModalOpen(true);
  };

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

  const refreshTables = async () => {
    console.log('refreshTables invoked');
    try {
      await Promise.all([loadCompetidores(), loadPrecios(), loadProductos()]);
      console.log('refreshTables completed');
    } catch (err) {
      console.warn('Error refreshing tables', err);
    }
  };

  const handleActualizarPrecio = async (p) => {
    try {
      setNotification({ message: 'Actualizando precio...', type: 'success' });
      // Find matching competitor entry if available
      const comp = competidores.find(c => String(c.producto_id) === String(p.producto_id) && String(c.plataforma).toLowerCase() === String(p.plataforma).toLowerCase());
      const payload = { producto_id: p.producto_id, plataforma: p.plataforma };
      if (comp) {
        if (comp.competitor_product_id) payload.competitor_product_id = comp.competitor_product_id;
        else if (comp.url_competidor) payload.url = comp.url_competidor;
      } else if (p.nombre_competidor) {
        payload.competitor_product_id = p.nombre_competidor;
      }

      const resp = await fetch('http://localhost:5000/api/comparador/precios/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error((data && data.message) || resp.statusText || 'Error actualizando');
      setNotification({ message: 'Precio actualizado', type: 'success' });
      await loadPrecios();
    } catch (err) {
      console.error('Error actualizando precio:', err);
      setNotification({ message: 'Error actualizando: ' + (err.message || String(err)), type: 'error' });
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
      {notification.message && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'success' })} />
      )}
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-black italic tracking-wide">COMPARADOR DE PRECIOS</h1>
        <p className="text-slate-400 mt-2">Módulo de logística y análisis de mercado para la toma de decisiones.</p>

        <div className="mt-6 flex gap-4 items-center">
          <button
            type="button"
            onClick={runComparador}
            disabled={running}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 rounded-md font-bold text-white transition-colors text-sm shadow-md"
          >
            {running ? 'Ejecutando escaneo...' : 'Ejecutar actualización de precios'}
          </button>
          
          <button
            type="button"
            onClick={() => { setEditingId(null); clearForm(); setIsModalOpen(true); }}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 rounded-md text-slate-900 transition-colors text-sm font-semibold border border-slate-200"
          >
            Asociar Producto
          </button>
        </div>

        {/* Modal: Asociar Producto */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/70" onClick={() => { setIsModalOpen(false); setEditingId(null); clearForm(); }} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md mx-4 p-6 text-slate-100 shadow-lg">
              <h3 className="text-lg font-bold mb-4">{editingId ? 'Editar competidor' : 'Asociar nuevo competidor'}</h3>
              <form onSubmit={handleCreateCompetidor} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Producto</label>
                  <select value={formProductoId} onChange={e => setFormProductoId(e.target.value)} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm">
                    <option value="">-- Seleccione --</option>
                    {productos.map(prod => (
                      <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Plataforma</label>
                  <select value={formPlataforma} onChange={e => setFormPlataforma(e.target.value)} className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm">
                    <option>Amazon</option>
                    <option>eBay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">URL del competidor</label>
                  <input value={formUrl} onChange={e => setFormUrl(e.target.value)} type="text" placeholder="https://..." className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm" />
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setIsModalOpen(false); clearForm(); setEditingId(null); }} className="px-3 py-2 text-sm rounded-md bg-slate-700">Cancelar</button>
                  <button type="submit" className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-10">
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
                    <th className="px-4 py-3 font-semibold">Acciones</th>
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
                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                              <button type="button" onClick={() => openEditModal(p)} className="px-3 py-1 rounded-md bg-yellow-500 hover:bg-yellow-600 text-xs font-semibold text-white">Editar</button>
                              <button type="button" onClick={() => handleActualizarPrecio(p)} className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-xs font-semibold text-white">Actualizar</button>
                            </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Log de la última transacción eliminado por petición del usuario */}
      </div>
    </div>
  );
};

export default ComparadorView;