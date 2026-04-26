import React from 'react';
import Navbar from '../components/layout/Navbar.jsx';

const Nosotros = () => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const estadisticas = [
    { valor: "+10", etiqueta: "Años de Experiencia" },
    { valor: "100%", etiqueta: "Calidad Garantizada" },
    { valor: "+500", etiqueta: "Proyectos Técnicos" },
  ];

  const imagenesTecnologia = [
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000", // Ingeniería
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000", // Equipo de trabajo
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000", // Ciberseguridad/Tecnología
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200">
      
      {/* NAVBAR REUTILIZABLE */}
      <Navbar />

      {/* HERO NOSOTROS */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Nuestra Identidad</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8">
              IMPULSANDO LA <br/> <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">EXCELENCIA</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              En EGYVEN, no solo suministramos componentes; construimos la base tecnológica de las industrias en San Diego. Nuestra misión es garantizar que cada pieza y cada servicio técnico eleve la productividad de nuestros clientes.
            </p>
            <div className="grid grid-cols-3 gap-8 border-t border-white/5 pt-10">
              {estadisticas.map((est, i) => (
                <div key={i}>
                  <p className="text-3xl font-black text-white">{est.valor}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{est.etiqueta}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carrusel de Identidad */}
          <div className="flex-1 w-full h-[500px] rounded-[3rem] overflow-hidden border border-white/10 group relative">
            <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
              {imagenesTecnologia.map((img, idx) => (
                <img key={idx} src={img} className="min-w-full object-cover snap-center opacity-70 group-hover:opacity-90 transition-opacity" alt="Tecnología EGYVEN" />
              ))}
            </div>
            <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Desliza para ver más →</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN VALORES / EQUIPO */}
      <section className="bg-[#080a0f] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-4 italic">Nuestro Compromiso</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-12 bg-[#0d1117] rounded-[3rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
              <h3 className="text-3xl font-black text-white mb-6">Equipos de Trabajo</h3>
              <p className="text-slate-400 leading-relaxed">
                Contamos con personal altamente calificado en Scrum y metodologías ágiles para asegurar que cada requerimiento técnico se cumpla en tiempo récord y con la máxima precisión.
              </p>
            </div>

            <div className="p-12 bg-[#0d1117] rounded-[3rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl group-hover:bg-cyan-600/20 transition-all"></div>
              <h3 className="text-3xl font-black text-white mb-6">Tecnología de Punta</h3>
              <p className="text-slate-400 leading-relaxed">
                Desde servidores hasta microcomponentes, seleccionamos solo proveedores que cumplan con estándares internacionales, mitigando riesgos operativos para su empresa.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Nosotros;