"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";

interface CustomHlsPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
}

export default function CustomHlsPlayer({ url, poster, autoPlay = false }: CustomHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [levels, setLevels] = useState<{ id: number; height: number; name: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 is auto
  const [showSettings, setShowSettings] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const proxyUrl = url.startsWith('/api/proxy/stream') 
        ? url 
        : `/api/proxy/stream?url=${encodeURIComponent(url)}`;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30, // 30s buffer
        enableWorker: true,
        startLevel: -1, // Auto
      });
      hlsRef.current = hls;

      hls.loadSource(proxyUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const availableLevels = data.levels.map((l, index) => ({
          id: index,
          height: l.height,
          name: `${l.height}p`,
        }));
        setLevels(availableLevels);
        
        if (autoPlay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error, trying to recover...", data);
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error, trying to recover...", data);
              hls?.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable error", data);
              setErrorMsg("Xatolik yuz berdi. Iltimos sahifani yangilang.");
              hls?.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / Native iOS support
      video.src = proxyUrl;
      video.addEventListener("loadedmetadata", () => {
        if (autoPlay) video.play().catch(console.error);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, autoPlay]);

  // Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const onDurationChange = () => {
      setDuration(video.duration);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) setVolume(0);
    else setVolume(1);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.currentTime = (val / 100) * duration;
    setProgress(val);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const changeLevel = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setShowSettings(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-glow font-sans"
    >
      {errorMsg ? (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-black/80 z-20">
          <p>{errorMsg}</p>
        </div>
      ) : null}

      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {/* Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 pb-4">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-xs">{formatTime(videoRef.current?.currentTime || 0)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-green-400"
          />
          <span className="text-white text-xs">{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-green-400 transition">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-green-400 transition">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-green-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Settings (Quality) */}
            {levels.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className="text-white hover:text-green-400 transition flex items-center gap-1"
                >
                  <Settings size={20} />
                  <span className="text-xs font-bold">{currentLevel === -1 ? 'Auto' : `${levels[currentLevel]?.height}p`}</span>
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 bg-panel border border-line rounded-xl shadow-xl overflow-hidden z-30">
                    <button 
                      onClick={() => changeLevel(-1)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${currentLevel === -1 ? 'text-green-400 font-bold' : 'text-mist'}`}
                    >
                      Auto
                    </button>
                    {levels.map((level) => (
                      <button 
                        key={level.id}
                        onClick={() => changeLevel(level.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${currentLevel === level.id ? 'text-green-400 font-bold' : 'text-mist'}`}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-green-400 transition">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
