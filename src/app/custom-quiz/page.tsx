"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, CheckCircle2, ArrowLeft, PlusCircle, HelpCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { soundManager } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function CustomQuizPage() {
  const [category, setCategory] = useState<"saude_digital" | "cultura_digital" | "cultura_alagoana">("saude_digital");
  const [text, setText] = useState("");
  const [options, setOptions] = useState<[string, string, string, string]>(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [explanation, setExplanation] = useState("");
  const [timeLimit, setTimeLimit] = useState("20");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOptionChange = (idx: number, value: string) => {
    const nextOpts = [...options] as [string, string, string, string];
    nextOpts[idx] = value;
    setOptions(nextOpts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || options.some(opt => !opt.trim()) || !explanation.trim()) {
      alert("Por favor, preencha o enunciado, todas as 4 opções e a explicação educacional.");
      return;
    }

    setLoading(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          text: text.trim(),
          options: options.map(o => o.trim()),
          correctOption,
          explanation: explanation.trim(),
          timeLimit: Number(timeLimit) || 20,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccess(true);
        soundManager.playVictory();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        // Clear form
        setText("");
        setOptions(["", "", "", ""]);
        setExplanation("");
      } else {
        alert(data.error || "Erro ao salvar questão.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/"
            onClick={() => soundManager.playClick()} 
            className="flex items-center gap-2 text-slate-400 hover:text-white font-medium text-sm transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para o Menu
          </Link>
          <Link
            href="/questions"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-1.5 bg-slate-900 text-sky-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Ver Banco de Questões
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-purple-900/50 via-slate-900 to-slate-900 border border-purple-500/20 rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-10 pointer-events-none select-none">
            ✍️
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Criador de Questões Interativas
          </h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            Seja um co-criador do acervo de <strong>Saúde Digital, Cultura Digital ou Inovação Tecnológica</strong>. Suas questões serão integradas ao banco de dados e poderão ser usadas em futuras rodadas no estilo Kahoot!
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-500/20 border-2 border-emerald-500 text-emerald-100 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black flex-shrink-0 text-xl shadow">
                🎉
              </div>
              <div>
                <h3 className="font-bold text-lg text-emerald-200">Questão criada com sucesso!</h3>
                <p className="text-sm text-emerald-300/90">A questão foi salva no PostgreSQL e já pode ser consultada e jogada na plataforma.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSuccess(false); soundManager.playClick(); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow"
              >
                Criar Mais Uma
              </button>
              <Link
                href="/"
                onClick={() => soundManager.playClick()}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all shadow"
              >
                Jogar Agora
              </Link>
            </div>
          </div>
        )}

        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
          {/* Category Picker */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">
              1. Selecione a Categoria Temática
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => { setCategory("saude_digital"); soundManager.playClick(); }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === "saude_digital"
                    ? "bg-sky-600/20 border-2 border-sky-500 text-white shadow-lg shadow-sky-500/10"
                    : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className="text-2xl mb-2 block">👩‍⚕️</span>
                <span className="font-bold text-sm">Saúde Digital</span>
                <span className="text-[11px] opacity-80 mt-1">PEP, Telemedicina, IoMT, LGPD</span>
              </button>

              <button
                type="button"
                onClick={() => { setCategory("cultura_digital"); soundManager.playClick(); }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === "cultura_digital"
                    ? "bg-purple-600/20 border-2 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                    : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className="text-2xl mb-2 block">🌐</span>
                <span className="font-bold text-sm">Cultura Digital</span>
                <span className="text-[11px] opacity-80 mt-1">Letramento, Cidadania, Netiqueta</span>
              </button>

              <button
                type="button"
                onClick={() => { setCategory("cultura_alagoana"); soundManager.playClick(); }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  category === "cultura_alagoana"
                    ? "bg-emerald-600/20 border-2 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                    : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className="text-2xl mb-2 block">🌴</span>
                <span className="font-bold text-sm">Cultura Digital Alagoana</span>
                <span className="text-[11px] opacity-80 mt-1">Inovação Digital, Cultura Tech, Transformação</span>
              </button>
            </div>
          </div>

          {/* Question Title / Text */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              2. Enunciado da Questão
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ex: O que caracteriza a inclusão digital no contexto educacional moderno?"
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
          </div>

          {/* Answer Options */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">
              3. Alternativas (Escreva 4 opções e marque a <span className="text-emerald-400 font-extrabold underline">correta</span> com o botão)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((opt, oIdx) => {
                const isCorrect = correctOption === oIdx;
                const KahootColors = [
                  { name: "🔺 Opção A (Vermelho)", ring: "focus:border-red-500 focus:ring-red-500", bg: "bg-red-500/10 border-red-500/30 text-red-300" },
                  { name: "🔹 Opção B (Azul)", ring: "focus:border-blue-500 focus:ring-blue-500", bg: "bg-blue-500/10 border-blue-500/30 text-blue-300" },
                  { name: "🔸 Opção C (Amarelo)", ring: "focus:border-amber-500 focus:ring-amber-500", bg: "bg-amber-500/10 border-amber-500/30 text-amber-300" },
                  { name: "🟩 Opção D (Verde)", ring: "focus:border-emerald-500 focus:ring-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" },
                ][oIdx];

                return (
                  <div key={oIdx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{KahootColors.name}</span>
                      <button
                        type="button"
                        onClick={() => { setCorrectOption(oIdx); soundManager.playClick(); }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isCorrect
                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isCorrect ? "Alternativa Correta" : "Marcar como Correta"}
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder={`Escreva o texto da alternativa ${["A", "B", "C", "D"][oIdx]}...`}
                      value={opt}
                      onChange={e => handleOptionChange(oIdx, e.target.value)}
                      className={`w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${KahootColors.ring}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              4. Explicação Comentada (Por que essa resposta está certa?)
            </label>
            <textarea
              rows={2}
              required
              placeholder="Explique de forma clara para que os jogadores aprendam quando o tempo da questão acabar..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
          </div>

          {/* Time limit */}
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <span className="block text-sm font-bold text-slate-300">Tempo de Resposta (Segundos)</span>
              <span className="text-xs text-slate-500">Tempo limite para os jogadores escolherem a alternativa no jogo ao vivo</span>
            </div>
            <select
              value={timeLimit}
              onChange={e => setTimeLimit(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="10">10 Segundos</option>
              <option value="20">20 Segundos (Recomendado)</option>
              <option value="30">30 Segundos</option>
              <option value="45">45 Segundos</option>
            </select>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-black text-base py-4 rounded-2xl shadow-xl shadow-purple-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Salvando Questão no PostgreSQL...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Salvar Questão no Banco de Dados Educacional
              </>
            )}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
