"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Play, Sparkles, UserCheck, Crown, BookOpen, PlusCircle, Trophy, Zap, Clock, Loader2 } from "lucide-react";
import { soundManager } from "@/utils/audio";

const AVATAR_LIST = ["🤖", "🧙‍♂️", "👩‍⚕️", "🌴", "🚀", "🏖️", "🦀", "🦁", "⚡", "🔥", "🦄", "🎯"];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Join Form State
  const [pin, setPin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🤖");
  const [joining, setJoining] = useState(false);

  // Host Form State
  const [roomName, setRoomName] = useState("");
  const [hostName, setHostName] = useState("");
  const [quizCategory, setQuizCategory] = useState("all");
  const [timePerQuestion, setTimePerQuestion] = useState("20");
  const [hosting, setHosting] = useState(false);

  // Main UI Mode Switcher
  const [activeTab, setActiveTab] = useState<"join" | "host">("join");

  // Auto-detect ?pin=482910 from scanned QR codes
  useEffect(() => {
    const queryPin = searchParams.get("pin");
    if (queryPin) {
      setPin(queryPin.replace(/\D/g, ""));
      setActiveTab("join");
      // Auto scroll smoothly to the form
      const el = document.getElementById("play-hub");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !playerName.trim()) {
      alert("Por favor, digite o PIN da sala e o seu nome.");
      return;
    }

    setJoining(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pin.trim(),
          playerName: playerName.trim(),
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();
      setJoining(false);

      if (data.success) {
        soundManager.playCorrect();
        router.push(`/room/${data.roomId}?playerId=${data.playerId}`);
      } else {
        soundManager.playWrong();
        alert(data.error || "Erro ao entrar na sala. Verifique o PIN digitado.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
      setJoining(false);
    }
  };

  const handleHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !hostName.trim()) {
      alert("Por favor, preencha o nome da sala e o nome do apresentador.");
      return;
    }

    setHosting(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName.trim(),
          hostName: hostName.trim(),
          quizCategory,
          timePerQuestion: Number(timePerQuestion) || 20,
        }),
      });

      const data = await res.json();
      setHosting(false);

      if (data.success) {
        soundManager.playCorrect();
        router.push(`/room/${data.roomId}?mode=host`);
      } else {
        alert(data.error || "Erro ao criar sala.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
      setHosting(false);
    }
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-12 w-full">
      {/* Spectacular Hero Banner */}
      <div className="bg-gradient-to-tr from-purple-900/60 via-indigo-950/80 to-slate-900 border border-purple-500/30 rounded-3xl p-8 md:p-14 mb-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 text-9xl md:text-[180px] opacity-10 pointer-events-none select-none font-mono tracking-tighter">
          20
        </div>
        
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-sky-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            Competição ao Vivo &bull; Estilo Kahoot! Multiplayer
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
            Dispute online sobre <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Saúde Digital & Cultura Digital</span>
          </h1>
          
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
            Entre em uma sala de prova ao vivo ou crie sua própria competição para testar quem tem os reflexos mais rápidos e os conhecimentos mais afiados sobre a nova era digital.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a 
              href="#play-hub"
              onClick={() => soundManager.playClick()}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-purple-500/25 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              Jogar ou Criar Sala
            </a>
            
            <Link 
              href="/questions"
              onClick={() => soundManager.playClick()}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold px-7 py-4 rounded-2xl border border-slate-700 flex items-center gap-2.5 transition-colors shadow-lg"
            >
              <BookOpen className="w-5 h-5 text-sky-400" />
              Estudar as 20 Questões
            </Link>
          </div>
        </div>
      </div>

      {/* Action Hub (Organized and Redesigned with Luxurious Tabs) */}
      <div id="play-hub" className="mb-16 scroll-mt-24 max-w-3xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-black text-white mb-3">
            Pronto para a Competição?
          </h2>
          <p className="text-slate-400 text-sm">
            Escolha sua modalidade de acesso abaixo: jogue em uma sala já existente ou seja o grande anfitrião e apresentador de uma nova prova.
          </p>
        </div>

        {/* Epic Universal Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl flex border border-slate-800 shadow-2xl max-w-md w-full">
            <button
              onClick={() => { setActiveTab("join"); soundManager.playClick(); }}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                activeTab === "join" 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-102" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-5 h-5 text-purple-300" />
              Entrar em Sala
            </button>
            
            <button
              onClick={() => { setActiveTab("host"); soundManager.playClick(); }}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl font-extrabold text-sm transition-all cursor-pointer ${
                activeTab === "host" 
                  ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/30 scale-102" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Crown className="w-5 h-5 text-yellow-300" />
              Criar Nova Sala
            </button>
          </div>
        </div>

        {/* Active Cards Container */}
        <div className="relative">
          
          {/* Join Room Pristine Card */}
          {activeTab === "join" && (
            <div className="bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-6 md:p-10 shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-2xl shadow">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Modo Jogador</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Conecte-se instantaneamente ou escaneie o QR Code na tela do apresentador</p>
                  </div>
                </div>

                <span className="bg-purple-500/20 text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-purple-500/30 flex items-center gap-1.5 shadow">
                  <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  Resposta Rápida
                </span>
              </div>

              <form onSubmit={handleJoin} className="space-y-8">
                {/* Step 1: PIN Code */}
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-inner">
                  <label className="block text-xs font-black text-purple-300 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                    <span>1. PIN da Sala (Fornecido pelo Apresentador)</span>
                  </label>
                  <input 
                    type="text"
                    maxLength={10}
                    required
                    placeholder="Ex: 839214"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-5 py-4 text-white text-3xl font-mono font-black tracking-widest text-center placeholder-slate-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all select-all"
                  />
                </div>

                {/* Step 2: Apelido / Nickname */}
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-inner">
                  <label className="block text-xs font-black text-purple-300 mb-2 uppercase tracking-widest">
                    2. Seu Nome de Competidor
                  </label>
                  <input 
                    type="text"
                    maxLength={20}
                    required
                    placeholder="Ex: Lampião Cyber, Maceió Tech"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-5 py-3.5 text-white text-lg font-bold placeholder-slate-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                {/* Step 3: Avatar Picker */}
                <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 shadow-inner">
                  <label className="block text-xs font-black text-purple-300 mb-3 uppercase tracking-widest">
                    3. Selecione seu Avatar Emoji
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {AVATAR_LIST.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => { setSelectedAvatar(emoji); soundManager.playClick(); }}
                        className={`h-14 rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                          selectedAvatar === emoji
                            ? "bg-purple-600 border-2 border-white scale-110 shadow-xl shadow-purple-500/50"
                            : "bg-slate-900 border border-slate-800/80 opacity-70 hover:opacity-100 hover:bg-slate-800"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={joining}
                  className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 active:from-purple-700 text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer pt-2"
                >
                  {joining ? (
                    <>
                      <Sparkles className="w-6 h-6 animate-spin" />
                      Conectando à Sala de Prova...
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 fill-white" />
                      Entrar na Competição Agora!
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Create Room Pristine Dashboard Card */}
          {activeTab === "host" && (
            <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900/90 to-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-10 shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-2xl shadow">
                    👑
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Modo Apresentador</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Crie e gerencie o painel com Código PIN e QR Code interativo para a sua turma</p>
                  </div>
                </div>

                <span className="bg-indigo-500/20 text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 shadow">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  Controle de Tela
                </span>
              </div>

              <form onSubmit={handleHost} className="space-y-6">
                {/* Step 1: Room Name */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-inner">
                  <label className="block text-xs font-black text-indigo-300 mb-2 uppercase tracking-widest">
                    1. Nome do Evento / Turma
                  </label>
                  <input 
                    type="text"
                    maxLength={30}
                    required
                    placeholder="Ex: Quiz de Saúde Digital, Competição Cultural"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-5 py-3.5 text-white text-base font-bold placeholder-slate-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Step 2: Host Name */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-inner">
                  <label className="block text-xs font-black text-indigo-300 mb-2 uppercase tracking-widest">
                    2. Nome do Apresentador
                  </label>
                  <input 
                    type="text"
                    maxLength={25}
                    required
                    placeholder="Ex: Prof. Silva, Apresentador Digital"
                    value={hostName}
                    onChange={e => setHostName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-5 py-3.5 text-white text-base font-bold placeholder-slate-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Step 3: Quiz Category */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-inner">
                  <label className="block text-xs font-black text-indigo-300 mb-2 uppercase tracking-widest">
                    3. Categoria Temática das Questões
                  </label>
                  <select
                    value={quizCategory}
                    onChange={e => { setQuizCategory(e.target.value); soundManager.playClick(); }}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-5 py-3.5 text-white text-sm font-bold shadow-inner focus:outline-none cursor-pointer"
                  >
                    <option value="all">🚀 Todas as Categorias (20 Questões Variadas)</option>
                    <option value="saude_digital">👩‍⚕️ Somente Saúde Digital (Telemedicina, LGPD, IoMT)</option>
                    <option value="cultura_digital">🌐 Somente Cultura Digital (Cidadania, Netiqueta)</option>
                    <option value="cultura_alagoana">🌴 Somente Cultura Alagoana (Inovação, Tradição, Tecnologia)</option>
                  </select>
                </div>

                {/* Step 4: Timer Picker */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 shadow-inner">
                  <label className="block text-xs font-black text-indigo-300 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-400" />
                    4. Tempo de Resposta por Questão
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["15", "20", "30"].map(sec => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => { setTimePerQuestion(sec); soundManager.playClick(); }}
                        className={`py-4 rounded-xl font-extrabold text-xs sm:text-sm border transition-all cursor-pointer ${
                          timePerQuestion === sec 
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 scale-105 ring-2 ring-indigo-400" 
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                        }`}
                      >
                        ⏱️ {sec} Segundos
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={hosting}
                  className="w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 active:from-indigo-700 text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer pt-2 mt-4"
                >
                  {hosting ? (
                    <>
                      <Sparkles className="w-6 h-6 animate-spin" />
                      Gerando Nova Sala, PIN & QR Code...
                    </>
                  ) : (
                    <>
                      <Crown className="w-6 h-6" />
                      Criar e Abrir o Lobby da Sala!
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Informative Feature Grid */}
      <div className="mb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-black text-white mb-2">
            Recursos de Nível Profissional
          </h2>
          <p className="text-slate-400 text-sm">
            Criado para oferecer a melhor experiência e engajamento em testes de conhecimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 text-xl">
              ⚡
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Cálculo de Pontos por Velocidade</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Quanto mais rápido o jogador responder corretamente, mais pontos acumula. Respostas seguidas geram bônus de <strong>combo flame (🔥)</strong> na tabela.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 text-xl">
              🤯
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Reações Interativas ao Vivo</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Os jogadores podem enviar chuvas de emojis em tempo real que voam e se multiplicam pela tela do apresentador durante a espera e nos resultados.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 text-xl">
              🏆
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Pódio Final & Comentários</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Celebração apoteótica com efeitos de confete para o Top 3 e exibição de explicações pedagógicas após cada pergunta para máxima retenção de conteúdo.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center flex-grow py-16 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-3" />
          <p className="font-bold text-sm">Carregando painel Quiz Digital...</p>
        </div>
      }>
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  );
}
