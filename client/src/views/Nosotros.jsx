import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import Navbar from '../components/layout/Navbar.jsx';

gsap.registerPlugin(Draggable);

const Nosotros = () => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const items = gsap.utils.toArray(".slider-item");
    const loop = verticalLoop(items, {
      paused: false,
      repeat: -1,
      speed: 0.5,
      snap: 1 // Fuerza a que siempre caiga en un cuadro individual
    });

    // Hacerlo interactivo con el mouse/toque
    Draggable.create(document.createElement("div"), {
      trigger: containerRef.current,
      type: "x",
      onPress() {
        loop.pause();
      },
      onDrag() {
        loop.progress(loop.progress() - this.deltaX / (items.length * items[0].offsetWidth));
      },
      onRelease() {
        loop.play();
      }
    });

    return () => loop.kill();
  }, []);

  // Función auxiliar de GSAP para el loop infinito horizontal de cuadros
  function verticalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let tl = gsap.timeline({ repeat: config.repeat, paused: config.paused, defaults: { ease: "none" }, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100) }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      xPercents = [],
      curIndex = 0,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
      totalWidth, curX, distanceToStart, distanceToLoop, item, i;

    gsap.set(items, {
      xPercent: (i, target) => {
        let w = widths[i] = parseFloat(gsap.getProperty(target, "width", "px"));
        xPercents[i] = gsap.utils.snap(0.01, parseFloat(gsap.getProperty(target, "x", "px")) / w * 100 + gsap.getProperty(target, "xPercent"));
        return xPercents[i];
      }
    });
    gsap.set(items, { x: 0 });
    totalWidth = items[length - 1].offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") + (parseFloat(config.paddingRight) || 0);
    for (i = 0; i < length; i++) {
      item = items[i];
      curX = xPercents[i] / 100 * widths[i];
      distanceToStart = item.offsetLeft - startX;
      distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
      tl.to(item, { xPercent: gsap.utils.snap(0.01, (curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
        .fromTo(item, { xPercent: gsap.utils.snap(0.01, (curX - distanceToLoop + totalWidth) / widths[i] * 100) }, { xPercent: xPercents[i], duration: (totalWidth - distanceToLoop + distanceToStart) / pixelsPerSecond, immediateRender: false }, distanceToLoop / pixelsPerSecond)
        .add("label" + i, distanceToStart / pixelsPerSecond);
      times[i] = distanceToStart / pixelsPerSecond;
    }
    function toIndex(index, vars) {
      vars = vars || {};
      (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex) {
        vars.modifiers = { time: gsap.utils.unitize(gsap.utils.wrap(0, tl.duration())) };
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      curIndex = newIndex;
      vars.overwrite = true;
      return tl.tweenTo(time, vars);
    }
    tl.next = vars => toIndex(curIndex + 1, vars);
    tl.prev = vars => toIndex(curIndex - 1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    return tl;
  }

  const imagenesTecnologia = [
    { url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000", titulo: "Ingeniería" },
    { url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000", titulo: "Equipo" },
    { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000", titulo: "Sistemas" },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200">
      <Navbar />

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">

          <div className="flex-1">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">EGYVEN Technology</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 italic">
              CUADROS DE <br /> <span className="text-blue-500">INNOVACIÓN</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8">Nuestros procesos de negocio están segmentados para ofrecer precisión en cada etapa técnica.</p>
          </div>

          {/* Contenedor del Carrusel de Cuadros Individuales */}
          <div ref={containerRef} className="flex-1 w-full h-[500px] relative overflow-hidden flex items-center">
            <div ref={sliderRef} className="flex w-full h-full">
              {imagenesTecnologia.map((item, idx) => (
                <div
                  key={idx}
                  className="slider-item flex-shrink-0 w-full h-full px-4"
                >
                  <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/10 relative group">
                    <img
                      src={item.url}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      alt={item.titulo}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-12">
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase">{item.titulo}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Nosotros;