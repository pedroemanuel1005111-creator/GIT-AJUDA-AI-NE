"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OFFICIAL_QUESTIONS, QuestionItem } from "@/data/questions";
import { Search, Sparkles, CheckCircle2, HelpCircle, ArrowLeft, Lightbulb } from "lucide-react";
import Link from "next/link";
import { soundManager } from "@/utils/audio";

export default function QuestionsPage() {
  const [filter, setFilter] = useState<"all" | "saude_digital" | "cultura_digital" | "cultura_alagoana">("all");
  const [search, setSearch] = useState("");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    const nextState = !revealedIds[id];
    setRevealedIds(prev => ({ ...prev, [id]: nextState }));
    if (nextState) {
      soundManager.playCorrect();
    } else {
      soundManager.playClick();
    }
  };

  const filteredQuestions = OFFICIAL_QUESTIONS.filter(q => {
    const matchFilter = filter === "all" ? true : q.category === filter;
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) ||
                        q.options.some(opt => opt.toLowerCase().includes(search.toLowerCase())) ||
                        q.explanation.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getCategoryLabel = (cat: QuestionItem["category"]) => {
    switch(cat) {
      case "saude_digital": return { label: "Saúde Digital", emoji: "👩‍⚕️", color: "from-sky-500 to-blue-600", border: "border-sky-500/30" };
      case "cultura_digital": return { label: "Cultura Digital", emoji: "🌐", color: "from-violet-500 to-purple-600", border: "border-purple-500/30" };
      case "cultura_alagoana": return { label: "Cultura Digital Alagoana", emoji: "🌴", color: "from-emerald-500 to-teal-600", border: "border-emerald-500/30" };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Top bar with back link */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/"
            onClick={() => soundManager.playClick()} 
            className="flex items-center gap-2 text-slate-400 hover:text-white font-medium text-sm transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para o Menu Principal
          </Link>
          <div className="flex items-center gap-2 bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full border border-purple-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            Total de 20 Questões Oficiais
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/20 rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 pointer-events-none select-none">
            📚
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Banco de Questões & Gabarito
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-3xl leading-relaxed">
            Navegue pelo nosso acervo de questões elaboradas por especialistas. Perfeito para estudar os conceitos de <strong>Telemedicina, LGPD, Letramento Digital, Cidadania na Web</strong> e a <strong>Cultura Digital e inovação no contexto educacional</strong>.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Pesquisar por palavras-chave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => { setFilter("all"); soundManager.playClick(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
            >
              🚀 Todas (20)
            </button>
            <button
              onClick={() => { setFilter("saude_digital"); soundManager.playClick(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filter === "saude_digital"
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30 scale-105"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
            >
              👩‍⚕️ Saúde Digital (8)
            </button>
            <button
              onClick={() => { setFilter("cultura_digital"); soundManager.playClick(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filter === "cultura_digital"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
            >
              🌐 Cultura Digital (6)
            </button>
            <button
              onClick={() => { setFilter("cultura_alagoana"); soundManager.playClick(); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                filter === "cultura_alagoana"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
            >
              🌴 Cultura Digital Alagoana (6)
            </button>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map((q, index) => {
            const cat = getCategoryLabel(q.category);
            const isRevealed = revealedIds[q.id];

            return (
              <div 
                key={q.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-xl group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${cat.color} text-white shadow`}>
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold px-2 py-0.5 bg-slate-800 rounded">
                      Questão #{index + 1}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-lg font-black text-white mb-6 leading-snug group-hover:text-purple-300 transition-colors">
                    {q.text}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5 mb-6">
                    {q.options.map((option, optIdx) => {
                      const isCorrectOption = optIdx === q.correctOption;
                      return (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-xl text-sm font-medium flex items-start gap-3 transition-all ${
                            isRevealed
                              ? isCorrectOption
                                ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-500/10"
                                : "bg-slate-800/40 border border-slate-800 text-slate-500 opacity-60"
                              : "bg-slate-800/80 border border-slate-700/50 text-slate-300"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                            isRevealed && isCorrectOption 
                              ? "bg-emerald-500 text-slate-950" 
                              : "bg-slate-700 text-slate-300 font-mono"
                          }`}>
                            {isRevealed && isCorrectOption ? <CheckCircle2 className="w-4 h-4" /> : ["A", "B", "C", "D"][optIdx]}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer: Reveal button & Explanation */}
                <div>
                  {isRevealed && (
                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-4 mb-4 text-xs text-purple-200 leading-relaxed animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1 text-sm">
                        <Lightbulb className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        Por que essa é a resposta correta?
                      </div>
                      <p className="text-slate-300 mt-1">{q.explanation}</p>
                    </div>
                  )}

                  <button
                    onClick={() => toggleReveal(q.id)}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isRevealed
                        ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                        : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-lg"
                    }`}
                  >
                    {isRevealed ? (
                      <>Ocultar Resposta e Explicação</>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        Ver Resposta Correta e Comentário
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center my-8">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma questão encontrada</h3>
            <p className="text-slate-400 text-sm mb-6">Tente pesquisar por outros termos ou retorne para todas as categorias.</p>
            <button 
              onClick={() => { setFilter("all"); setSearch(""); }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all"
            >
              Mostrar Todas as Questões
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
