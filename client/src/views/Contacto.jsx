import React from "react";

const Contacto = () => (
  <footer id="contacto" className="w-full bg-[#0b0f1a] text-white py-16 px-6 border-t border-white/10 mt-20">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div>
        <h2 className="text-3xl font-black mb-2">Contacto EGYVEN</h2>
        <p className="text-slate-300 mb-2">¿Tienes dudas o necesitas soporte? Contáctanos:</p>
        <ul className="text-slate-400 text-sm">
          <li><span className="font-bold">Teléfono:</span> +58 212-1234567</li>
          <li><span className="font-bold">Email:</span> info@egyven.com</li>
          <li><span className="font-bold">Dirección:</span> Av. Principal, Edif. EGYVEN, Caracas, Venezuela</li>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-bold">Síguenos:</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-blue-400">Facebook</a>
          <a href="#" className="hover:text-blue-400">Instagram</a>
          <a href="#" className="hover:text-blue-400">LinkedIn</a>
        </div>
      </div>
    </div>
    <div className="text-center text-xs text-slate-500 mt-8">&copy; {new Date().getFullYear()} EGYVEN. Todos los derechos reservados.</div>
  </footer>
);

export default Contacto;
