import React, { useEffect, useRef, useState } from 'react';

/* ── Glow Button ─────────────────────────────────────────────────── */
const glowStyle = `
  .glow-btn {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.3s ease;
  }
  .glow-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
    filter: blur(18px);
    transform: scale(1.3);
  }
  .glow-btn:hover::before { opacity: 1; }
  .glow-btn:hover { transform: translateY(-2px); }
  .glow-btn:active { transform: translateY(0px); }

  /* Primary — blue glow */
  .glow-btn-primary { background: #fff; color: #000; }
  .glow-btn-primary::before { background: radial-gradient(ellipse at center, #3b82f6 0%, #1d4ed8 60%, transparent 100%); }
  .glow-btn-primary:hover { background: #3b82f6; color: #fff; box-shadow: 0 0 30px 4px rgba(59,130,246,0.45); }

  /* Ghost — violet glow */
  .glow-btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; }
  .glow-btn-ghost::before { background: radial-gradient(ellipse at center, #818cf8 0%, #4f46e5 60%, transparent 100%); }
  .glow-btn-ghost:hover { background: rgba(255,255,255,0.05); color: #fff; box-shadow: 0 0 28px 4px rgba(99,102,241,0.35); border-color: rgba(99,102,241,0.5); }
`;

const GlowButton = ({ children, variant = 'primary', onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`glow-btn glow-btn-${variant} font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl ${className}`}
  >
    {children}
  </button>
);
import Navbar from '../components/layout/Navbar.jsx';
import Contacto from './Contacto.jsx';
import { useNavigate } from 'react-router-dom';

/* ── Infinite Auto-Carousel ─────────────────────────────────────── */
const InfiniteCarousel = ({ images }) => {
  const trackRef = useRef(null);
  const currentRef = useRef(0);          // slide index (0-based, in cloned list)
  const isTransitioningRef = useRef(false);
  const [activeRealIdx, setActiveRealIdx] = useState(0);

  // Build: [last clone] + [originals] + [first clone]
  const slides = [images[images.length - 1], ...images, images[0]];
  const total = slides.length;           // e.g. 5 for 3 images
  const DURATION = 3000;                 // ms between slides
  const TRANSITION = '0.8s cubic-bezier(0.77, 0, 0.175, 1)';

  /* Set position instantly (no animation) */
  const jumpTo = (idx) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${idx * 100}%)`;
    currentRef.current = idx;
  };

  /* Animate to a slide */
  const goTo = (idx) => {
    const track = trackRef.current;
    if (!track || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    track.style.transition = TRANSITION;
    track.style.transform = `translateX(-${idx * 100}%)`;
    currentRef.current = idx;

    // Update dot indicator (map clone indices → real indices)
    const realIdx = idx === 0
      ? images.length - 1
      : idx === total - 1
        ? 0
        : idx - 1;
    setActiveRealIdx(realIdx);
  };

  /* After transition ends, silently reset if on a clone */
  const handleTransitionEnd = () => {
    const track = trackRef.current;
    if (!track) return;
    const idx = currentRef.current;

    if (idx === total - 1) {
      // was on right clone → jump to real first
      jumpTo(1);
      setActiveRealIdx(0);
    } else if (idx === 0) {
      // was on left clone → jump to real last
      jumpTo(images.length);
      setActiveRealIdx(images.length - 1);
    }
    isTransitioningRef.current = false;
  };

  /* Start on slide index 1 (real first) and autoplay */
  useEffect(() => {
    jumpTo(1);
    setActiveRealIdx(0);

    const interval = setInterval(() => {
      const next = currentRef.current + 1;
      goTo(next >= total ? total - 1 : next);
    }, DURATION);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  return (
    <div className="flex-1 w-full overflow-hidden rounded-[3rem] border border-white/5 shadow-2xl bg-slate-900/50 relative">
      {/* Track */}
      <div
        ref={trackRef}
        onTransitionEnd={handleTransitionEnd}
        style={{ display: 'flex', willChange: 'transform' }}
      >
        {slides.map((img, idx) => (
          <div
            key={idx}
            style={{ minWidth: '100%', height: '400px', position: 'relative', flexShrink: 0 }}
          >
            <img
              src={img.url}
              alt={img.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
            />
            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem' }}>
              <span
                style={{
                  fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
                  letterSpacing: '0.15em', background: '#2563eb',
                  padding: '4px 12px', borderRadius: '4px', color: '#fff'
                }}
              >
                {/* show real asset number for clones too */}
                {idx === 0 ? images.length : idx === total - 1 ? 1 : idx}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: '8px', fontStyle: 'italic' }}>
                {img.label}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: '1.25rem', right: '1.5rem',
        display: 'flex', gap: '6px', alignItems: 'center'
      }}>
        {images.map((_, i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: i === activeRealIdx ? '22px' : '7px',
              height: '7px',
              borderRadius: '999px',
              background: i === activeRealIdx ? '#3b82f6' : 'rgba(255,255,255,0.3)',
              transition: 'width 0.4s ease, background 0.4s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Inicio ──────────────────────────────────────────────────────── */
const Inicio = () => {
  useEffect(() => {
    if (document.getElementById('glow-btn-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'glow-btn-styles';
    tag.textContent = glowStyle;
    document.head.appendChild(tag);
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.rol_id === 1 || user.rol_id === 4) {
        navigate('/principal');
      }
    }
  }, [navigate]);

  const servicios = [
    { title: "Servicio Técnico", desc: "Reparación y mantenimiento especializado de hardware industrial.", icon: "🛠️" },
    { title: "Componentes", desc: "Venta de piezas electrónicas de alta fidelidad con garantía oficial.", icon: "🔌" },
    { title: "Servidores", desc: "Configuración y optimización de infraestructura de red y servidores.", icon: "🖥️" }
  ];

  const imagenesCarrusel = [
    { url: "https://images.unsplash.com/photo-1721332150382-d4114ee27eff?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", label: "Servidores de Alta Densidad" },
    { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000", label: "Microprocesadores" },
    { url: "https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=1000", label: "Componentes SMD" }
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200">

      {/* NAVBAR REUTILIZABLE */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-left">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">
                CALIDAD <br /> <span className="text-blue-500">ELECTRÓNICA</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg mb-10 leading-relaxed">
                Expertos en servicio técnico especializado y suministro de componentes industriales al mejor precio del mercado venezolano.
              </p>
              <div className="flex gap-4">
                <GlowButton
                  variant="primary"
                  onClick={() => {
                    navigate('/catalogo');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Explorar Catálogo
                </GlowButton>
                <GlowButton
                  variant="ghost"
                  onClick={() => {
                    const contacto = document.getElementById('contacto');
                    if (contacto) contacto.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Contacto
                </GlowButton>
              </div>
            </div>

            {/* Carrusel Visual — Infinite Auto-play */}
            <InfiniteCarousel images={imagenesCarrusel} />
          </div>
        </div>
      </section>

      {/* SECCIÓN DE SERVICIOS */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {servicios.map((s, i) => (
          <div key={i} className="p-10 bg-[#0d1117] border border-white/5 rounded-[2.5rem] hover:border-blue-500/50 transition-all group">
            <div className="text-4xl mb-6"></div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-500 transition-colors">{s.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </section>
      <Contacto />
    </div>
  );
};

export default Inicio;
