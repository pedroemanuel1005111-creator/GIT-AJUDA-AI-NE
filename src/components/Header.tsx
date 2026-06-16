"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Sparkles, BookOpen, PlusCircle, Play, Pause, SkipBack, SkipForward, Radio, FastForward, Rewind } from "lucide-react";
import { soundManager } from "@/utils/audio";
import { useBackgroundMusic } from "./BackgroundMusic";

export default function Header({ roomCode, roomName }: { roomCode?: string; roomName?: string }) {
  const [sfxOn, setSfxOn] = useState(true);
  const [showRadioModal, setShowRadioModal] = useState(false);
  const bgm = useBackgroundMusic();

  const toggleSfx = () => {
    soundManager.soundEnabled = !sfxOn;
    setSfxOn(!sfxOn);
    if (!sfxOn) {
      soundManager.playClick();
    }
  };

  const handleToggleMusic = () => {
    soundManager.playClick();
    bgm.toggle();
  };

  useEffect(() => {
    setSfxOn(soundManager.soundEnabled);
  }, []);

  // Format seconds to mm:ss helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
              🌴
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5">
                Quiz <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Digital</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Saúde Digital & Cultura Digital
              </p>
            </div>
          </Link>

          {/* Center Room Info (if inside a room) */}
          {roomCode && (
            <div className="hidden md:flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-1.5 rounded-full shadow-inner">
              <span className="text-xs font-semibold text-slate-400">SALA:</span>
              <span className="text-sm font-black text-white">{roomName || "Competição"}</span>
              <div className="h-4 w-px bg-slate-700" />
              <span className="text-xs font-semibold text-purple-400">PIN:</span>
              <span className="font-mono text-base font-black tracking-widest bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 border border-purple-500/30">
                {roomCode}
              </span>
            </div>
          )}

          {/* Right Actions & Audio Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!roomCode && (
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <Link
                  href="/questions"
                  onClick={() => soundManager.playClick()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  Banco de Questões
                </Link>
                <Link
                  href="/custom-quiz"
                  onClick={() => soundManager.playClick()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  Criar Questão
                </Link>
              </div>
            )}

            {/* Efeitos Sonoros Toggle */}
            <button
              onClick={toggleSfx}
              title={sfxOn ? "Desativar efeitos sonoros de jogo" : "Ativar efeitos sonoros de jogo"}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                sfxOn
                  ? "bg-slate-800 text-purple-400 border-purple-500/40 shadow-lg shadow-purple-500/10"
                  : "bg-slate-800/50 text-slate-500 border-slate-700"
              }`}
            >
              {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Toggle Music / Radio Drawer Open Button */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={handleToggleMusic}
                title={bgm.isPlaying ? "Pausar Rádio" : "Tocar Rádio"}
                className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  bgm.isPlaying
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/30 animate-pulse"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {bgm.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <button
                onClick={() => { setShowRadioModal(true); soundManager.playClick(); }}
                className="px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Escolher Música</span>
                {bgm.isPlaying && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Interactive Custom Music Radio Modal Drawer */}
      {showRadioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl shadow">
                  📻
                </div>
                <div>
                  <h2 className="font-black text-lg text-white leading-none">Quiz Digital &bull; Rádio Playlist</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Trilha Sonora Upbeat & Gaming — Escolha sua favorita</p>
                </div>
              </div>

              <button
                onClick={() => { setShowRadioModal(false); soundManager.playClick(); }}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors cursor-pointer"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            </div>

            {/* Now Playing Animated Header Box */}
            <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-2xl p-5 mb-4 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left min-w-0 w-full sm:w-auto">
                <span className="text-4xl sm:text-5xl flex-shrink-0 filter drop-shadow animate-bounce">
                  {bgm.currentTrack.emoji}
                </span>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin flex-shrink-0" />
                    <span className="text-xs font-bold text-purple-300 tracking-wider uppercase">Faixa Ativa</span>
                  </div>
                  <h3 className="font-extrabold text-base text-white truncate">{bgm.currentTrack.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{bgm.currentTrack.artist}</p>
                </div>
              </div>

              {/* Player Execution Controls */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 flex-shrink-0 shadow">
                <button
                  onClick={() => { soundManager.playClick(); bgm.prevTrack(); }}
                  title="Música Anterior"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => { soundManager.playClick(); bgm.jumpTime(-10); }}
                  title="Retroceder 10 segundos"
                  className="p-2.5 rounded-xl text-sky-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleMusic}
                  title={bgm.isPlaying ? "Pausar" : "Tocar"}
                  className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white transition-transform hover:scale-110 active:scale-95 shadow cursor-pointer"
                >
                  {bgm.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  onClick={() => { soundManager.playClick(); bgm.jumpTime(10); }}
                  title="Adiantar 10 segundos"
                  className="p-2.5 rounded-xl text-sky-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-0.5 font-bold text-[10px]"
                >
                  <FastForward className="w-4 h-4" />
                  +10s
                </button>

                <button
                  onClick={() => { soundManager.playClick(); bgm.nextTrack(); }}
                  title="Próxima Música"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            {/* Timelines Scrub Progress Bar */}
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl mb-4 flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400 w-12 text-right flex-shrink-0">
                {formatTime(bgm.currentTime)}
              </span>

              <div className="flex-grow flex items-center relative group">
                <input
                  type="range"
                  min={0}
                  max={bgm.duration || 200}
                  step={1}
                  value={bgm.currentTime}
                  onChange={(e) => bgm.seekTo(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-purple-400 transition-all shadow-inner"
                  title="Arraste para adiantar ou retroceder a música"
                />
              </div>

              <span className="font-mono text-xs text-slate-400 w-12 text-left flex-shrink-0">
                {formatTime(bgm.duration)}
              </span>
            </div>

            {/* Volume Range Input Bar */}
            <div className="bg-slate-950/40 border border-slate-800 p-3.5 rounded-2xl mb-6 flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-grow flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bgm.volume}
                  onChange={(e) => bgm.setVolume(Number(e.target.value))}
                  className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-mono font-bold text-xs text-purple-300 w-9 text-right flex-shrink-0">{bgm.volume}%</span>
              </div>
            </div>

            {/* Tracklist Interactive Menu */}
            <div className="flex-grow overflow-y-auto space-y-2 pr-1">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Playlist de Músicas (Clique para Tocar)</p>

              {bgm.playlist.map((track, tIdx) => {
                const isSelected = bgm.currentTrackIndex === tIdx;

                return (
                  <button
                    key={track.id}
                    onClick={() => { soundManager.playClick(); bgm.playTrack(tIdx); }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10 scale-[1.01]"
                        : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-2xl flex-shrink-0">{track.emoji}</span>
                      <div className="min-w-0">
                        <p className={`font-extrabold text-sm truncate ${isSelected ? "text-purple-200 font-black" : "text-white"}`}>{track.title}</p>
                        <p className="text-xs text-slate-400 truncate font-medium">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono text-xs text-slate-500">{track.duration}</span>

                      {isSelected ? (
                        <span className="bg-purple-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase flex items-center gap-1 shadow animate-pulse flex-shrink-0">
                          {bgm.isPlaying ? "Tocando 🎶" : "Selecionada"}
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors">
                          <Play className="w-3.5 h-3.5 fill-current text-slate-400" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Bottom Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center flex-shrink-0">
              <button
                onClick={() => { setShowRadioModal(false); soundManager.playClick(); }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Concluído &bull; Voltar ao Quiz Digital
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
