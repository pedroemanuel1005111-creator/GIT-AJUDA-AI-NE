"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";

// Track List Item interface
export interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  duration: string;
  emoji: string;
}

// Official user-requested YouTube tracks and curated premium gaming/synthwave mix
export const PLAYLIST_TRACKS: PlaylistItem[] = [
  {
    id: "track-1",
    videoId: "n8X9_MgEdCg", // User requested playlist leader track
    title: "Cybernetic Odyssey (Faixa Principal)",
    artist: "Upbeat Synthwave & Gaming Mix",
    duration: "3:24",
    emoji: "🚀"
  },
  {
    id: "track-2",
    videoId: "p99YbkB-evw", // User requested previous track
    title: "Retro Arcade Anthem",
    artist: "8-Bit Symphony Hero",
    duration: "2:45",
    emoji: "👾"
  },
  {
    id: "track-3",
    videoId: "jK2aIUmmdP4",
    title: "Electrified Pulse (NCS Style)",
    artist: "Nitro Fun Vibe",
    duration: "3:12",
    emoji: "⚡"
  },
  {
    id: "track-4",
    videoId: "bM7SZ5SBzyY",
    title: "Sururu Valley Speedrun",
    artist: "Alagoas Cyber Tech",
    duration: "2:58",
    emoji: "🌴"
  },
  {
    id: "track-5",
    videoId: "AOeY-nDp7hI",
    title: "Pixelated Sunset",
    artist: "Chiptune Dreams",
    duration: "3:40",
    emoji: "🌇"
  },
  {
    id: "track-6",
    videoId: "1WP_YLn1D1c",
    title: "Kahoot Competição Arena",
    artist: "Quiz Digital Gamification",
    duration: "2:30",
    emoji: "🏆"
  }
];

// Official YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  loadVideoById: (id: string | { videoId: string; startSeconds?: number }) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  getPlayerState: () => number;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            loop?: number;
            modestbranding?: number;
            rel?: number;
            showinfo?: number;
            iv_load_policy?: number;
            playsinline?: number;
          };
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
            onError?: (e: unknown) => void;
          };
        }
      ) => YTPlayer;
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface MusicContextValue {
  isPlaying: boolean;
  isReady: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  currentTrackIndex: number;
  currentTrack: PlaylistItem;
  playlist: PlaylistItem[];
  toggle: () => void;
  setVolume: (v: number) => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  jumpTime: (deltaSeconds: number) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function useBackgroundMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useBackgroundMusic must be used inside BackgroundMusicProvider");
  return ctx;
}

export default function BackgroundMusic({ children }: { children: ReactNode }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(40); // Start at 40% volume
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const activeTrack = PLAYLIST_TRACKS[currentTrackIndex] || PLAYLIST_TRACKS[0];

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (playerRef.current) {
      playerRef.current.setVolume(v);
    }
  }, []);

  const playTrack = useCallback((index: number) => {
    if (!playerRef.current || index < 0 || index >= PLAYLIST_TRACKS.length) return;

    setCurrentTrackIndex(index);
    const track = PLAYLIST_TRACKS[index];

    playerRef.current.unMute();
    playerRef.current.setVolume(volume);
    playerRef.current.loadVideoById(track.videoId);
    setIsPlaying(true);
  }, [volume]);

  const nextTrack = useCallback(() => {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST_TRACKS.length;
    playTrack(nextIdx);
  }, [currentTrackIndex, playTrack]);

  const prevTrack = useCallback(() => {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST_TRACKS.length) % PLAYLIST_TRACKS.length;
    playTrack(prevIdx);
  }, [currentTrackIndex, playTrack]);

  const seekTo = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    const target = Math.max(0, Math.min(seconds, duration || 1000));
    playerRef.current.seekTo(target, true);
    setCurrentTime(target);
  }, [duration]);

  const jumpTime = useCallback((deltaSeconds: number) => {
    if (!playerRef.current) return;
    const curr = playerRef.current.getCurrentTime() || currentTime;
    const total = playerRef.current.getDuration() || duration;
    const target = Math.max(0, Math.min(curr + deltaSeconds, total - 1));
    playerRef.current.seekTo(target, true);
    setCurrentTime(target);
  }, [currentTime, duration]);

  const toggle = useCallback(() => {
    if (!playerRef.current) return;

    if (!isPlaying) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      
      const YTState = window.YT?.PlayerState;
      const state = playerRef.current.getPlayerState();
      
      if (YTState && (state === YTState.CUED || state === YTState.ENDED)) {
        playerRef.current.loadVideoById(activeTrack.videoId);
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(true);
    } else {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, [isPlaying, volume, activeTrack.videoId]);

  // Keep ref current for YouTube event listener
  const nextTrackRef = useRef(nextTrack);
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  // Real-time time progress tracker interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        if (playerRef.current) {
          const curr = playerRef.current.getCurrentTime?.() || 0;
          const tot = playerRef.current.getDuration?.() || 0;
          setCurrentTime(curr);
          if (tot > 0) setDuration(tot);
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject the YouTube IFrame API script once
    const existingScript = document.getElementById("yt-iframe-api");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const initPlayer = () => {
      if (!containerRef.current || playerRef.current) return;

      playerRef.current = new window.YT.Player("bg-music-player", {
        height: "10", // Small hidden size
        width: "10",
        videoId: PLAYLIST_TRACKS[0].videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(volume);
            e.target.mute(); // Muted by default for browser autoplay policies
            setIsReady(true);
          },
          onStateChange: (e) => {
            const YT = window.YT;
            if (YT.PlayerState) {
              if (e.data === YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setDuration(e.target.getDuration() || 0);
              } else if (e.data === YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (e.data === YT.PlayerState.ENDED) {
                // Automatically transition to Next Track in the playlist
                nextTrackRef.current();
              }
            }
          },
          onError: (err) => {
            console.warn("YouTube BGM player error, skipping to next track:", err);
            nextTrackRef.current();
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCb = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCb) prevCb();
        initPlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MusicContext.Provider value={{
      isPlaying,
      isReady,
      volume,
      currentTime,
      duration,
      currentTrackIndex,
      currentTrack: activeTrack,
      playlist: PLAYLIST_TRACKS,
      toggle,
      setVolume,
      playTrack,
      nextTrack,
      prevTrack,
      seekTo,
      jumpTime
    }}>
      {children}
      {/* Hidden YouTube iframe container */}
      <div
        ref={containerRef}
        className="pointer-events-none fixed opacity-0 -z-50 w-px h-px overflow-hidden left-0 top-0"
        aria-hidden="true"
      >
        <div id="bg-music-player" />
      </div>
    </MusicContext.Provider>
  );
}
