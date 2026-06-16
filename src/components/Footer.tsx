import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-8 px-4 border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-xl">🦀</span>
          <div>
            <p className="font-bold text-slate-200">Quiz Digital &bull; Plataforma Educacional de Saúde & Cultura Digital</p>
            <p className="text-slate-500">Desenvolvido com Next.js 15, Drizzle ORM, PostgreSQL & Framer Motion</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 font-medium">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Servidores Online
          </span>
          <span>&bull;</span>
          <span>Modo Kahoot! Multiplayer</span>
          <span>&bull;</span>
          <span>Inovação Alagoana</span>
        </div>
      </div>
    </footer>
  );
}
