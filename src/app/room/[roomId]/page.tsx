"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { soundManager } from "@/utils/audio";
import confetti from "canvas-confetti";
import { 
  Play, Sparkles, Crown, Trophy, CheckCircle2, XCircle, AlertCircle, 
  Clock, ArrowRight, RotateCcw, Share2, Copy, Check, Users, MessageSquareHeart, 
  Flame, Award, Zap, Lightbulb, BookOpen, Volume2
} from "lucide-react";
import Link from "next/link";
import { QuestionItem } from "@/data/questions";
import QRCode from "react-qr-code";

interface PlayerData {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  streak: number;
}

interface RoomData {
  id: string;
  name: string;
  hostName: string;
  status: "waiting" | "playing" | "question_results" | "podium";
  quizCategory: string;
  currentQuestionIndex: number;
  questionStartTime: number | null;
  timePerQuestion: number;
  totalQuestions: number;
}

interface ReactionData {
  id: string;
  playerName: string;
  emoji: string;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = typeof params.roomId === "string" ? params.roomId : "";
  const isHostMode = searchParams.get("mode") === "host";
  const myPlayerId = searchParams.get("playerId") || "";

  // Game Engine Live States
  const [room, setRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [question, setQuestion] = useState<QuestionItem | null>(null);
  const [answersCount, setAnswersCount] = useState<number>(0);
  const [optionCounts, setOptionCounts] = useState<number[] | null>(null);
  const [myAnswerResult, setMyAnswerResult] = useState<{ isCorrect?: boolean; points?: number; option?: number } | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Reaction Animation State
  const [liveEmojis, setLiveEmojis] = useState<{ id: string; emoji: string; left: number }[]>([]);

  // Sound triggers ref to prevent repetitive playing on every tick
  const lastPlayedStateRef = useRef<string>("");
  const prevPlayersCountRef = useRef<number>(0);

  // Poll room data every 1.5 seconds
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/room/${roomId}`);
        const data = await res.json();

        if (data.error) {
          if (data.error === "Sala não encontrada") {
            alert("Sala não encontrada ou encerrada.");
            router.push("/");
          }
          return;
        }

        const currentRoom = data.room as RoomData;
        const currentPlayers = data.players as PlayerData[];
        
        setRoom(currentRoom);
        setPlayers(currentPlayers);
        setQuestion(data.question);
        setAnswersCount(data.answersCount);
        setOptionCounts(data.optionCounts);

        // Check if I answered
        if (myPlayerId && data.playerSubmittedMap?.[myPlayerId]) {
          setHasAnswered(true);
        }

        // New Player Chime in Lobby
        if (currentRoom.status === "waiting" && currentPlayers.length > prevPlayersCountRef.current) {
          prevPlayersCountRef.current = currentPlayers.length;
          soundManager.playClick();
        }

        // Handle Audio & Confetti state transitions
        const stateKey = `${currentRoom.status}-${currentRoom.currentQuestionIndex}`;
        if (stateKey !== lastPlayedStateRef.current) {
          lastPlayedStateRef.current = stateKey;

          if (currentRoom.status === "question_results") {
            soundManager.playCorrect();
          } else if (currentRoom.status === "podium") {
            soundManager.playVictory();
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
            setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } }), 1500);
            setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } }), 1500);
          } else if (currentRoom.status === "playing") {
            setHasAnswered(false);
            setSelectedOpt(null);
            setMyAnswerResult(null);
          }
        }

      } catch (err) {
        console.error("Error polling room:", err);
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 1500);
    return () => clearInterval(interval);
  }, [roomId, myPlayerId, router]);

  // Countdown timer calculations
  const [timeLeft, setTimeLeft] = useState<number>(20);

  useEffect(() => {
    if (!room || room.status !== "playing" || !room.questionStartTime) return;

    const calcTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const start = room.questionStartTime || now;
      const elapsed = now - start;
      const remaining = Math.max(0, room.timePerQuestion - elapsed);
      
      setTimeLeft(remaining);

      if (remaining === 3 || remaining === 2 || remaining === 1) {
        soundManager.playTimerTick();
      }

      // If time runs out and host mode, automatically trigger next state
      if (remaining === 0 && isHostMode) {
        handleNextState();
      }
    };

    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [room, isHostMode]);

  // Host Actions
  const handleStartGame = async () => {
    if (players.length === 0) {
      if (!confirm("Não há jogadores conectados na sala. Deseja iniciar assim mesmo (para jogar no modo projetor ou teste)?")) {
        return;
      }
    }
    soundManager.playCountdown();
    await fetch(`/api/room/${roomId}/start`, { method: "POST" });
  };

  const handleNextState = async () => {
    soundManager.playClick();
    await fetch(`/api/room/${roomId}/next`, { method: "POST" });
  };

  const handleRestartRoom = async () => {
    if (!confirm("Deseja reiniciar esta competição do zero com todos os jogadores conectados?")) {
      return;
    }
    soundManager.playClick();
    await fetch(`/api/room/${roomId}/restart`, { method: "POST" });
  };

  // Player Answer Action
  const handleSubmitAnswer = async (optionIndex: number) => {
    if (!myPlayerId || hasAnswered || room?.status !== "playing") return;

    setSelectedOpt(optionIndex);
    setHasAnswered(true);
    soundManager.playClick();

    try {
      const res = await fetch(`/api/room/${roomId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: myPlayerId,
          selectedOption: optionIndex,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMyAnswerResult({
          isCorrect: data.isCorrect,
          points: data.pointsEarned,
          option: optionIndex,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar resposta.");
      setHasAnswered(false);
      setSelectedOpt(null);
    }
  };

  // Live Emojis Reaction Broadcast
  const handleSendEmoji = async (emoji: string) => {
    soundManager.playClick();
    const randomLeft = Math.floor(Math.random() * 80) + 10;
    const newEmoji = { id: crypto.randomUUID(), emoji, left: randomLeft };
    
    // Add locally for instant gratification
    setLiveEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setLiveEmojis(prev => prev.filter(item => item.id !== newEmoji.id));
    }, 4000);

    // Send to backend
    const myMe = players.find(p => p.id === myPlayerId);
    await fetch(`/api/room/${roomId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerName: myMe ? myMe.name : "Alguém",
        emoji,
      }),
    });
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/?pin=" + roomId);
    setCopied(true);
    soundManager.playCorrect();
    setTimeout(() => setCopied(false), 2500);
  };

  const getCategoryTitle = (cat?: string) => {
    switch(cat) {
      case "saude_digital": return "👩‍⚕️ Saúde Digital";
      case "cultura_digital": return "🌐 Cultura Digital";
      case "cultura_alagoana": return "🌴 Cultura Digital Alagoana";
      default: return "🚀 Quiz Digital Completo";
    }
  };

  const myPlayerData = players.find(p => p.id === myPlayerId);

  if (!room) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-white items-center justify-center p-6">
        <Sparkles className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Conectando à Sala Interativa...</h2>
        <p className="text-slate-500 text-sm mt-2">Sincronizando com os servidores PostgreSQL</p>
      </div>
    );
  }

  // Find My Podium Rank
  const myRankIndex = players.findIndex(p => p.id === myPlayerId);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : "-";

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <Header roomCode={room.id} roomName={room.name} />

      {/* Floating Animated Reaction Emojis */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {liveEmojis.map(item => (
          <div 
            key={item.id}
            style={{ left: `${item.left}%` }}
            className="absolute bottom-10 text-4xl sm:text-5xl animate-floatUp select-none filter drop-shadow-lg"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full flex flex-col justify-between">
        
        {/* ============================================================== */}
        {/* STATUS: WAITING (LOBBY VIEW) */}
        {/* ============================================================== */}
        {room.status === "waiting" && (
          <div className="flex flex-col items-center justify-center my-auto py-6">
            
            {/* Top Badge */}
            <div className="bg-purple-500/10 border border-purple-500/30 px-5 py-2 rounded-full text-purple-300 font-bold text-xs mb-6 flex items-center gap-2 shadow-inner">
              <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>Apresentador: <strong>{room.hostName}</strong></span>
              <span>&bull;</span>
              <span>Tema: <strong>{getCategoryTitle(room.quizCategory)}</strong> ({room.totalQuestions} Questões)</span>
            </div>

            {/* Spectacular Two-Way Access Hub: Giant PIN + Instant Camera Scan QR Code */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500/40 rounded-3xl p-6 md:p-12 max-w-4xl w-full mb-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 text-[220px] opacity-5 pointer-events-none select-none">🎮</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                
                {/* Left side: Giant PIN */}
                <div className="text-center md:text-left flex flex-col justify-between h-full py-2 border-b md:border-b-0 md:border-r border-slate-800/80 md:pr-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 font-extrabold text-xs mb-3">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Acesso Manual
                    </div>
                    <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-1">PIN do Jogo</p>
                    <p className="text-xs text-slate-500 mb-6">Acesse o site no celular e digite o código abaixo:</p>
                    
                    <div className="font-mono text-6xl md:text-7xl lg:text-8xl font-black tracking-wider text-white py-4 px-2 bg-purple-500/10 border border-purple-500/30 rounded-2xl mb-6 shadow-inner select-all text-center">
                      {room.id}
                    </div>
                  </div>

                  <button
                    onClick={copyRoomLink}
                    className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 font-bold text-xs py-3.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                    {copied ? "Link Convite Copiado!" : "Copiar Link Convite para WhatsApp"}
                  </button>
                </div>

                {/* Right side: High-Resolution Camera Scan QR Code */}
                <div className="text-center flex flex-col items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-300 font-extrabold text-xs mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Acesso Instantâneo
                  </div>
                  <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-1">Aponte a Câmera</p>
                  <p className="text-xs text-slate-500 mb-6 max-w-xs">Escaneie o QR Code com a câmera do celular para entrar sem digitar PIN:</p>
                  
                  <div className="p-4 bg-white rounded-2xl shadow-2xl ring-4 ring-purple-500/20 hover:scale-105 transition-transform flex items-center justify-center select-none">
                    <QRCode
                      value={typeof window !== "undefined" ? window.location.origin + "/?pin=" + room.id : "https://quiz-digital.e2b.app/?pin=" + room.id}
                      size={180}
                      level="H"
                      className="h-auto max-w-full"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Connected Players Grid */}
            <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl mb-10">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 font-black text-lg text-white">
                  <Users className="w-5 h-5 text-purple-400" />
                  Jogadores Conectados
                </div>
                <div className="bg-purple-600 text-white font-extrabold text-sm px-3.5 py-1 rounded-full shadow">
                  {players.length} {players.length === 1 ? "Jogador" : "Jogadores"}
                </div>
              </div>

              {players.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 animate-pulse text-purple-500/50" />
                  <p className="font-bold text-slate-400">Aguardando os competidores entrarem...</p>
                  <p className="text-xs mt-1">Acesse pelo celular ou em outra aba com o PIN <span className="text-purple-400 font-mono font-bold">{room.id}</span></p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {players.map(p => (
                    <div 
                      key={p.id}
                      className={`bg-slate-800/80 border rounded-2xl p-3 flex items-center gap-3 transition-all animate-scaleUp shadow ${
                        p.id === myPlayerId ? "border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500" : "border-slate-700/80"
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{p.avatar}</span>
                      <div className="min-w-0 flex-grow">
                        <p className="font-bold text-xs text-white truncate">{p.name}</p>
                        {p.id === myPlayerId && <span className="text-[9px] text-purple-300 font-extrabold uppercase">Você</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button for Host */}
            {isHostMode ? (
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-black text-xl px-12 py-5 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 animate-pulse cursor-pointer"
              >
                <Play className="w-6 h-6 fill-white" />
                Iniciar a Prova Agora!
              </button>
            ) : (
              <div className="bg-slate-900 border border-slate-800 px-8 py-4 rounded-2xl flex items-center gap-3 text-slate-300 shadow-lg">
                <Clock className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="text-sm font-bold">Você está no Lobby! Olhe para a tela do apresentador.</span>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STATUS: PLAYING (ACTIVE QUESTION) */}
        {/* ============================================================== */}
        {room.status === "playing" && question && (
          <div className="flex flex-col flex-grow w-full py-4">
            
            {/* Top Bar: Question Index & Countdown Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg mb-6">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="bg-purple-600 text-white font-black text-sm px-4 py-1.5 rounded-xl shadow">
                  Questão {room.currentQuestionIndex + 1} / {room.totalQuestions}
                </span>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  {getCategoryTitle(question.category)}
                </span>
              </div>

              {/* Countdown Gauge */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeLeft <= 5 ? "text-red-500 animate-bounce" : "text-yellow-400"}`} />
                  <span className={`font-mono text-2xl font-black ${timeLeft <= 5 ? "text-red-500 font-extrabold" : "text-white"}`}>
                    {timeLeft}s
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">{answersCount} / {players.length} Respostas</span>
                </div>
              </div>
            </div>

            {/* Time progress bar running down */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mb-8 border border-slate-800">
              <div 
                style={{ width: `${(timeLeft / room.timePerQuestion) * 100}%` }}
                className={`h-full transition-all duration-1000 ${
                  timeLeft > 10 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : timeLeft > 5 ? "bg-yellow-500" : "bg-red-500 animate-pulse"
                }`}
              />
            </div>

            {/* Question Title Enunciado Banner */}
            <div className="bg-gradient-to-r from-purple-900/50 via-slate-900 to-slate-900 border-2 border-purple-500/30 rounded-3xl p-6 md:p-12 mb-8 text-center shadow-2xl relative">
              <h2 className="text-2xl md:text-4xl font-black text-white leading-snug max-w-4xl mx-auto">
                {question.text}
              </h2>
            </div>

            {/* Interactive Kahoot-Style Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 flex-grow">
              {question.options.map((optText, optIdx) => {
                const KahootStyle = [
                  { shape: "🔺", color: "from-red-600 to-rose-700 border-red-500 hover:from-red-500 hover:to-rose-600 active:from-red-700 shadow-red-500/20", ring: "ring-red-400" },
                  { shape: "🔹", color: "from-blue-600 to-indigo-700 border-blue-500 hover:from-blue-500 hover:to-indigo-600 active:from-blue-700 shadow-blue-500/20", ring: "ring-blue-400" },
                  { shape: "🔸", color: "from-amber-500 to-yellow-600 border-amber-400 hover:from-amber-400 hover:to-yellow-500 active:from-amber-600 shadow-amber-500/20", ring: "ring-amber-300" },
                  { shape: "🟩", color: "from-emerald-600 to-teal-700 border-emerald-500 hover:from-emerald-500 hover:to-teal-600 active:from-emerald-700 shadow-emerald-500/20", ring: "ring-emerald-400" },
                ][optIdx];

                const isMySelected = selectedOpt === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSubmitAnswer(optIdx)}
                    disabled={hasAnswered || isHostMode}
                    className={`p-6 md:p-8 rounded-3xl border-2 font-black text-left flex items-center justify-between gap-4 transition-all shadow-xl cursor-pointer ${KahootStyle.color} ${
                      isMySelected ? `ring-4 ${KahootStyle.ring} scale-102 brightness-125` : ""
                    } ${hasAnswered && !isMySelected ? "opacity-40 grayscale" : ""} ${isHostMode ? "cursor-default" : "hover:scale-[1.01] active:scale-[0.99]"}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl md:text-5xl filter drop-shadow">{KahootStyle.shape}</span>
                      <span className="text-lg md:text-2xl text-white leading-tight font-extrabold">{optText}</span>
                    </div>

                    {isMySelected && (
                      <span className="bg-slate-950/80 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-white/30 flex items-center gap-1.5 shadow flex-shrink-0 animate-pulse">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Sua Escolha
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom State or Host Advance */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                {myPlayerData && (
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{myPlayerData.avatar}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{myPlayerData.name}</p>
                      <p className="text-[10px] font-mono text-purple-300 font-extrabold">{myPlayerData.score} Pontos (Combo: 🔥{myPlayerData.streak}x)</p>
                    </div>
                  </div>
                )}
              </div>

              {hasAnswered && !isHostMode && (
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                  Resposta recebida pelo servidor! Aguarde os resultados...
                </div>
              )}

              {isHostMode && (
                <button
                  onClick={handleNextState}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  Pular Tempo / Ver Resposta Correta
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STATUS: QUESTION RESULTS (ANSWER REVEAL) */}
        {/* ============================================================== */}
        {room.status === "question_results" && question && (
          <div className="flex flex-col flex-grow w-full py-4">
            
            {/* Reveal Header Banner */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Gabarito da Questão {room.currentQuestionIndex + 1}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white">
                  {question.text}
                </h3>
              </div>

              {isHostMode && (
                <button
                  onClick={handleNextState}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0 animate-pulse"
                >
                  <span>Próxima Pergunta / Etapa</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* My Personal Result Box (if I'm a Player) */}
            {!isHostMode && myAnswerResult && (
              <div className={`p-6 rounded-3xl mb-8 border-2 flex items-center justify-between gap-4 shadow-2xl animate-scaleUp ${
                myAnswerResult.isCorrect 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400 text-white" 
                  : "bg-gradient-to-r from-rose-900/90 to-red-950 border-rose-600 text-white"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 font-bold">
                    {myAnswerResult.isCorrect ? "🎉" : "❌"}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">
                      {myAnswerResult.isCorrect ? "Espetacular! Você Acertou!" : "Que pena... Resposta Incorreta"}
                    </h3>
                    <p className="text-sm font-semibold opacity-90">
                      {myAnswerResult.isCorrect ? `+${myAnswerResult.points} Pontos adicionados à sua pontuação total` : "A alternativa correta está destacada abaixo em Verde"}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 px-4 py-2.5 rounded-2xl border border-white/20 font-mono text-sm font-black">
                  <span>🏆 Sua Posição:</span>
                  <span className="text-yellow-400">#{myRank}</span>
                </div>
              </div>
            )}

            {/* Correct vs Wrong Options Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left: The 4 Options Correctness */}
              <div className="space-y-3 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xl">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Distribuição das Alternativas
                  </h4>

                  {question.options.map((optText, oIdx) => {
                    const isCorrect = question.correctOption === oIdx;
                    const KahootShape = ["🔺", "🔹", "🔸", "🟩"][oIdx];
                    const count = optionCounts ? optionCounts[oIdx] || 0 : 0;

                    return (
                      <div
                        key={oIdx}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                          isCorrect 
                            ? "bg-emerald-500/20 border-2 border-emerald-500 text-white font-black shadow-lg shadow-emerald-500/10 scale-[1.01]" 
                            : "bg-slate-800/40 border-slate-800 text-slate-400 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl flex-shrink-0">{KahootShape}</span>
                          <span className="text-sm truncate leading-snug">{optText}</span>
                          {isCorrect && (
                            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase flex items-center gap-1 shadow flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> Resposta Certa
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-base font-black bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-slate-300 flex-shrink-0">
                          👤 {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Educational Comentário do Professor */}
                <div className="bg-purple-950/60 border border-purple-500/40 rounded-2xl p-5 mt-4 shadow">
                  <div className="flex items-center gap-2 text-yellow-300 font-extrabold text-xs mb-1">
                    <Lightbulb className="w-4 h-4 fill-yellow-300" />
                    Comentário Pedagógico
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>

              {/* Right: Current Score Leaderboard */}
              <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xl">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      Classificação Parcial (Top 6)
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Pontuação Dinâmica</span>
                  </h4>

                  <div className="space-y-2.5">
                    {players.slice(0, 6).map((p, idx) => {
                      const RankMedals = ["🥇", "🥈", "🥉"][idx] || `#${idx + 1}`;
                      const isMe = p.id === myPlayerId;

                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border transition-all ${
                            isMe 
                              ? "bg-purple-600 text-white font-bold border-purple-400 shadow-lg shadow-purple-500/25 scale-[1.02]" 
                              : idx === 0 
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-200" 
                                : "bg-slate-800/80 border-slate-700/60 text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono font-black text-lg w-7 text-center">{RankMedals}</span>
                            <span className="text-2xl">{p.avatar}</span>
                            <span className="font-bold text-sm truncate leading-none">{p.name}</span>
                            {isMe && <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase shadow">Você</span>}
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 font-mono">
                            {p.streak >= 2 && (
                              <span className="text-xs font-black text-orange-400 flex items-center gap-0.5 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-orange-500/30">
                                🔥{p.streak}x
                              </span>
                            )}
                            <span className="font-black text-base">{p.score.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 font-medium">
                  {players.length > 6 ? `...e mais ${players.length - 6} competidores na disputa!` : "Todos os competidores exibidos."}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* STATUS: PODIUM (FINAL GRAND FINALE PODIUM) */}
        {/* ============================================================== */}
        {room.status === "podium" && (
          <div className="flex flex-col flex-grow w-full py-6 animate-fadeIn">
            
            {/* Header Victory Banner */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs mb-3 shadow">
                🎉 PROVA CONCLUÍDA COM SUCESSO! 🎉
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                Pódio dos Campeões
              </h2>
              <p className="text-slate-400 text-sm md:text-base mt-2">
                Parabéns a todos que participaram! Confira abaixo os grandes vencedores da rodada de <strong>{getCategoryTitle(room.quizCategory)}</strong>.
              </p>
            </div>

            {/* Gorgeous Kahoot-Style Gold / Silver / Bronze 3-Step Podium */}
            <div className="flex items-end justify-center gap-3 md:gap-6 max-w-4xl mx-auto h-72 md:h-80 mb-16 px-2 w-full">
              
              {/* 2nd Place (Silver) */}
              {players[1] ? (
                <div className="flex flex-col items-center w-1/3 max-w-[220px] animate-slideUp" style={{ animationDelay: "0.3s" }}>
                  <div className="relative mb-3 text-center">
                    <span className="text-5xl md:text-6xl filter drop-shadow-xl block mb-1 hover:scale-110 transition-transform">{players[1].avatar}</span>
                    <span className="absolute -top-4 -right-2 text-2xl">🥈</span>
                    <p className="font-black text-sm md:text-base text-slate-200 truncate max-w-[120px] md:max-w-[160px]">{players[1].name}</p>
                    <p className="font-mono font-bold text-xs text-slate-400">{players[1].score.toLocaleString()} pts</p>
                  </div>
                  <div className="w-full h-36 md:h-44 bg-gradient-to-t from-slate-700 via-slate-600 to-slate-400 rounded-t-3xl border-x-2 border-t-2 border-slate-300 flex items-center justify-center font-black text-4xl text-slate-900 shadow-2xl">
                    2&ordm;
                  </div>
                </div>
              ) : <div className="w-1/3 max-w-[220px]" />}

              {/* 1st Place (Gold) - The Epic Center */}
              {players[0] ? (
                <div className="flex flex-col items-center w-1/3 max-w-[240px] animate-slideUp" style={{ animationDelay: "0.6s" }}>
                  <div className="relative mb-3 text-center">
                    <Crown className="w-10 h-10 text-yellow-400 fill-yellow-400 mx-auto -mb-2 animate-bounce" />
                    <span className="text-6xl md:text-7xl filter drop-shadow-2xl block mb-1 hover:scale-110 transition-transform">{players[0].avatar}</span>
                    <p className="font-black text-base md:text-xl text-amber-300 truncate max-w-[140px] md:max-w-[180px] font-extrabold">{players[0].name}</p>
                    <p className="font-mono font-black text-sm text-yellow-400 bg-yellow-500/20 px-3 py-0.5 rounded-full border border-yellow-500/30 inline-block mt-1">
                      {players[0].score.toLocaleString()} pts
                    </p>
                  </div>
                  <div className="w-full h-48 md:h-56 bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-400 rounded-t-3xl border-x-2 border-t-2 border-yellow-200 flex items-center justify-center font-black text-5xl md:text-6xl text-slate-950 shadow-2xl ring-4 ring-yellow-400/40">
                    1&ordm;
                  </div>
                </div>
              ) : <div className="w-1/3 max-w-[240px]" />}

              {/* 3rd Place (Bronze) */}
              {players[2] ? (
                <div className="flex flex-col items-center w-1/3 max-w-[220px] animate-slideUp" style={{ animationDelay: "0.1s" }}>
                  <div className="relative mb-3 text-center">
                    <span className="text-5xl md:text-6xl filter drop-shadow-xl block mb-1 hover:scale-110 transition-transform">{players[2].avatar}</span>
                    <span className="absolute -top-4 -right-2 text-2xl">🥉</span>
                    <p className="font-black text-sm md:text-base text-slate-200 truncate max-w-[120px] md:max-w-[160px]">{players[2].name}</p>
                    <p className="font-mono font-bold text-xs text-slate-400">{players[2].score.toLocaleString()} pts</p>
                  </div>
                  <div className="w-full h-24 md:h-32 bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 rounded-t-3xl border-x-2 border-t-2 border-amber-600 flex items-center justify-center font-black text-4xl text-amber-200 shadow-2xl">
                    3&ordm;
                  </div>
                </div>
              ) : <div className="w-1/3 max-w-[220px]" />}

            </div>

            {/* Complete Leaderboard Report Table */}
            <div className="max-w-4xl mx-auto w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl mb-12">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Tabela Completa de Classificação
              </h3>

              <div className="space-y-3">
                {players.map((p, pIdx) => {
                  const Medal = ["🥇 Campeão", "🥈 Vice-Campeão", "🥉 3º Lugar"][pIdx] || `#${pIdx + 1}`;
                  const isMe = p.id === myPlayerId;

                  return (
                    <div 
                      key={p.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        isMe 
                          ? "bg-purple-950/80 border-purple-500 text-white shadow-xl ring-2 ring-purple-500 scale-[1.01]" 
                          : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono font-black text-sm md:text-base w-24 text-slate-400 flex-shrink-0">{Medal}</span>
                        <span className="text-3xl">{p.avatar}</span>
                        <div className="min-w-0">
                          <p className="font-black text-base text-white truncate leading-snug">
                            {p.name} {isMe && <span className="text-xs font-bold text-purple-300 ml-2">(Você)</span>}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            Acertos: <strong className="text-emerald-400 font-mono">{p.correctAnswers}</strong> &bull; Consecutivos Máximos: <strong className="text-orange-400 font-mono">{p.streak}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="font-mono font-black text-xl text-yellow-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex-shrink-0">
                        {p.score.toLocaleString()} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host or Player Actions at the End */}
            <div className="flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto">
              {isHostMode && (
                <button
                  onClick={handleRestartRoom}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-purple-500/25 flex items-center gap-3 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  Jogar Novamente com a mesma Turma
                </button>
              )}

              <Link
                href="/questions"
                onClick={() => soundManager.playClick()}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm px-8 py-4 rounded-2xl border border-slate-700 flex items-center gap-3 transition-all shadow"
              >
                <BookOpen className="w-5 h-5 text-sky-400" />
                Ver Banco de Questões com Gabarito
              </Link>

              <Link
                href="/"
                onClick={() => soundManager.playClick()}
                className="bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-sm px-8 py-4 rounded-2xl border border-slate-800 transition-all"
              >
                Sair para o Início
              </Link>
            </div>

          </div>
        )}

        {/* Live Interactive Reaction Buttons Widget (Available during Waiting and Results) */}
        {room.status !== "playing" && (
          <div className="sticky bottom-4 z-40 max-w-xl mx-auto w-full mt-6">
            <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-purple-500/40 shadow-2xl flex items-center justify-between gap-2 text-center">
              <span className="text-xs font-black text-purple-300 hidden sm:inline uppercase pl-2 flex-shrink-0 flex items-center gap-1">
                <MessageSquareHeart className="w-4 h-4" /> Enviar Reação:
              </span>
              <div className="flex items-center justify-around flex-grow gap-2">
                {["🔥", "🚀", "❤️", "🌴", "🤯", "🦀"].map(emo => (
                  <button
                    key={emo}
                    onClick={() => handleSendEmoji(emo)}
                    className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 hover:border-purple-400 hover:bg-purple-600/20 text-2xl flex items-center justify-center transition-all hover:scale-125 active:scale-95 shadow cursor-pointer"
                    title={`Enviar emoji ${emo}`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
