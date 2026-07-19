"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import type { AniLibertyEpisode } from "@/lib/types";
import { 
  Play, Pause, Maximize, Minimize, Settings, X, 
  Volume2, VolumeX, SkipBack, SkipForward 
} from "lucide-react";

interface EpisodePlayerProps {
  episodes: AniLibertyEpisode[];
  titleId?: string;
}

type Quality = "1080p" | "720p" | "480p";

export default function EpisodePlayer({ episodes, titleId }: EpisodePlayerProps) {
  const [currentEp, setCurrentEp] = useState<AniLibertyEpisode | null>(episodes[0] ?? null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Player State
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<Quality>("1080p");
  const [autoNext, setAutoNext] = useState(true);
  const [skipOpening, setSkipOpening] = useState(false);
  const [skipEnding, setSkipEnding] = useState(false);

  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format time (e.g. 01:23 or 1:02:23)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = Math.floor(timeInSeconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Initialize Video & HLS
  useEffect(() => {
    if (!currentEp || !videoRef.current) return;
    setError(false);
    const video = videoRef.current;

    let targetUrl = "";
    if (quality === "1080p" && currentEp.hls_1080) targetUrl = currentEp.hls_1080;
    else if ((quality === "1080p" || quality === "720p") && currentEp.hls_720) targetUrl = currentEp.hls_720;
    else if (currentEp.hls_480) targetUrl = currentEp.hls_480;

    if (!targetUrl) {
      setError(true);
      return;
    }

    const fullUrl = targetUrl.startsWith("http") ? targetUrl : `https://anilibria.top${targetUrl}`;
    
    // Remember current time to restore after quality change
    const timeToRestore = video.currentTime;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 600, enableWorker: true });
      hlsRef.current = hls;

      hls.loadSource(fullUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (timeToRestore > 0) video.currentTime = timeToRestore;
        if (playing) video.play().catch(() => setPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else { hls.destroy(); setError(true); }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = fullUrl;
      video.currentTime = timeToRestore;
      if (playing) video.play().catch(() => setPlaying(false));
    }

    return () => {
      // Don't destroy on unmount because of quality changes unless it's a full unmount
      // React 18 strict mode double-renders. We'll destroy if ep changes, but wait on quality changes?
      // Actually, safest to let useEffect cleanup handle it.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEp, quality]); // Re-run only when episode or quality changes

  // Always destroy HLS on final unmount
  useEffect(() => {
    return () => hlsRef.current?.destroy();
  }, []);

  // Time Update & Skip Logic
  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentEp) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Skip Opening
    const op = currentEp.opening;
    if (skipOpening && op && op.start !== null && op.stop !== null) {
      if (time >= op.start && time < op.stop) {
        videoRef.current.currentTime = op.stop;
      }
    }
    // Skip Ending
    const ed = currentEp.ending;
    if (skipEnding && ed && ed.start !== null && ed.stop !== null) {
      if (time >= ed.start && time < ed.stop) {
        videoRef.current.currentTime = ed.stop;
      }
    }
  };

  const handleVideoEnd = () => {
    if (autoNext) {
      const currentIndex = episodes.findIndex((ep) => ep.id === currentEp?.id);
      if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
        setCurrentEp(episodes[currentIndex + 1]);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          setPlaying(true);
        }
      } else {
        setPlaying(false);
      }
    } else {
      setPlaying(false);
    }
  };

  // --- History Tracking Hook ---
  useEffect(() => {
    if (!titleId || !currentEp || !playing) return;
    
    // We update history every 10 seconds while playing
    const interval = setInterval(() => {
      if (videoRef.current) {
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "anime",
            titleId,
            episode: currentEp.ordinal,
            season: 1, // Defaulting to 1 since AniLiberty typically maps by alias/title
            progressSeconds: Math.floor(videoRef.current.currentTime),
          })
        }).catch(err => console.error("Failed to sync history", err));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [titleId, currentEp, playing]);
  // -----------------------------

  // Play/Pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play().catch(() => {});
      setPlaying(!playing);
    }
  }, [playing]);

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (videoRef.current) videoRef.current.volume = val;
  };
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !muted;
      videoRef.current.muted = newMuted;
      setMuted(newMuted);
      if (newMuted) setVolume(0);
      else setVolume(videoRef.current.volume || 1);
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) videoRef.current.currentTime = val;
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Controls Visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };
  const handleMouseLeave = () => {
    if (playing && !showSettings) setShowControls(false);
  };

  // Playback Rate
  const changeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "arrowright":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
        case "arrowleft":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  if (episodes.length === 0) {
    return <div className="text-mist">Нет доступных эпизодов.</div>;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div 
          ref={containerRef}
          className="group relative aspect-video overflow-hidden rounded-2xl border border-line bg-base shadow-glow flex flex-col justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => { if(showSettings) setShowSettings(false); }}
        >
          {error ? (
            <div className="flex h-full items-center justify-center text-sm text-mist absolute inset-0 bg-base z-10">
              <div className="text-center">
                <p>Не удалось загрузить видео</p>
                <button 
                  onClick={() => setError(false)} 
                  className="mt-4 rounded-xl border border-line px-4 py-2 hover:text-paper"
                >
                  Повторить
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="h-full w-full outline-none bg-black"
              poster={currentEp?.preview?.src ? `https://anilibria.top${currentEp.preview.src}` : undefined}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                  videoRef.current.playbackRate = playbackRate;
                }
              }}
              onEnded={handleVideoEnd}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onCanPlay={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
            />
          )}

          {/* Loading Spinner */}
          {isLoading && !error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 pointer-events-none">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
            </div>
          )}

          {/* Controls Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-24 transition-opacity duration-300 ${
              showControls || !playing || showSettings ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div className="mb-2 text-white drop-shadow-md px-2">
              <h4 className="font-bold text-lg leading-tight">Эпизод {currentEp?.ordinal}</h4>
              <p className="text-sm text-gray-300">{currentEp?.name || "Без названия"}</p>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-3 mx-2 flex items-center h-1.5 bg-white/20 rounded-full group/bar cursor-pointer">
              <div 
                className="absolute h-full bg-primary rounded-full transition-all duration-75 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
              <div 
                className="absolute h-3 w-3 bg-white rounded-full scale-0 group-hover/bar:scale-100 transition-transform -ml-1.5 shadow"
                style={{ left: `${progressPercent}%` }}
              />
              <input 
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-white px-2">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const idx = episodes.findIndex((e) => e.id === currentEp?.id);
                      if (idx > 0) { setCurrentEp(episodes[idx - 1]); setPlaying(true); }
                    }} 
                    className={`transition ${episodes.findIndex((e) => e.id === currentEp?.id) > 0 ? "hover:text-primary cursor-pointer" : "opacity-30 cursor-not-allowed"}`}
                    title="Предыдущий эпизод"
                  >
                    <SkipBack fill="currentColor" size={20} />
                  </button>

                  <button onClick={togglePlay} className="hover:text-primary transition mx-1">
                    {playing ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
                  </button>

                  <button 
                    onClick={() => {
                      const idx = episodes.findIndex((e) => e.id === currentEp?.id);
                      if (idx >= 0 && idx < episodes.length - 1) { setCurrentEp(episodes[idx + 1]); setPlaying(true); }
                    }} 
                    className={`transition ${episodes.findIndex((e) => e.id === currentEp?.id) < episodes.length - 1 ? "hover:text-primary cursor-pointer" : "opacity-30 cursor-not-allowed"}`}
                    title="Следующий эпизод"
                  >
                    <SkipForward fill="currentColor" size={20} />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 group/vol relative ml-2">
                  <button onClick={toggleMute} className="hover:text-primary transition">
                    {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-300 cursor-pointer accent-primary"
                  />
                </div>
                
                <div className="text-[13px] font-medium tabular-nums text-gray-300 opacity-80">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-5 relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  className={`hover:text-primary transition ${showSettings ? 'rotate-90' : ''}`}
                >
                  <Settings size={20} />
                </button>
                <button onClick={toggleFullscreen} className="hover:text-primary transition">
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>

                {/* Settings Popup */}
                {showSettings && (
                  <div className="absolute bottom-[calc(100%+16px)] right-0 w-[280px] rounded-2xl bg-[#1c1c1e]/95 p-5 shadow-2xl backdrop-blur-xl border border-white/10 text-sm animate-in zoom-in-95 z-30">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="font-bold text-white text-[15px]">Настройки</h4>
                      <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white transition">
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-5 text-gray-200">
                      {/* Speed */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px]">Скорость</span>
                        <select 
                          value={playbackRate} 
                          onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                          className="bg-transparent text-right text-[13px] text-gray-400 outline-none hover:text-white transition cursor-pointer appearance-none"
                        >
                          <option value="0.5" className="bg-[#1c1c1e]">0.5x</option>
                          <option value="1" className="bg-[#1c1c1e]">1x</option>
                          <option value="1.25" className="bg-[#1c1c1e]">1.25x</option>
                          <option value="1.5" className="bg-[#1c1c1e]">1.5x</option>
                          <option value="2" className="bg-[#1c1c1e]">2x</option>
                        </select>
                      </div>
                      
                      {/* Quality */}
                      <div className="flex items-center justify-between">
                        <span className="text-[13px]">Качество</span>
                        <select 
                          value={quality} 
                          onChange={(e) => setQuality(e.target.value as Quality)}
                          className="bg-transparent text-right text-[13px] text-gray-400 outline-none hover:text-white transition cursor-pointer appearance-none"
                        >
                          {currentEp?.hls_1080 && <option value="1080p" className="bg-[#1c1c1e]">1080p</option>}
                          {currentEp?.hls_720 && <option value="720p" className="bg-[#1c1c1e]">720p</option>}
                          {currentEp?.hls_480 && <option value="480p" className="bg-[#1c1c1e]">480p</option>}
                        </select>
                      </div>

                      <div className="h-[1px] w-full bg-white/10 my-1"></div>

                      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-2">Управление опенингом / эндингом</div>

                      {/* Toggles */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[13px] text-gray-300 group-hover:text-white transition">Пропускать опенинг</span>
                        <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${skipOpening ? 'bg-primary' : 'bg-gray-600'}`}>
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transition-transform ${skipOpening ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                        </div>
                        <input type="checkbox" checked={skipOpening} onChange={(e) => setSkipOpening(e.target.checked)} className="hidden" />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[13px] text-gray-300 group-hover:text-white transition">Пропускать эндинг</span>
                        <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${skipEnding ? 'bg-primary' : 'bg-gray-600'}`}>
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transition-transform ${skipEnding ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                        </div>
                        <input type="checkbox" checked={skipEnding} onChange={(e) => setSkipEnding(e.target.checked)} className="hidden" />
                      </label>

                      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-4 mb-2">Управление воспроизведением</div>

                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[13px] text-gray-300 group-hover:text-white transition">Авто-воспроизведение</span>
                        <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${autoNext ? 'bg-primary' : 'bg-gray-600'}`}>
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transition-transform ${autoNext ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                        </div>
                        <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-72 xl:w-80 flex flex-col">
        <h3 className="mb-4 font-display text-lg font-bold text-paper">Эпизоды ({episodes.length})</h3>
        <div className="custom-scrollbar flex max-h-[500px] flex-col gap-2 overflow-y-auto pr-2 bg-base p-2 rounded-2xl border border-line">
          {episodes.map((ep) => {
            const isActive = currentEp?.ordinal === ep.ordinal;
            return (
              <button
                key={ep.id}
                onClick={() => {
                  setCurrentEp(ep);
                  setPlaying(true);
                }}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-panel text-mist hover:bg-panel2 hover:text-paper border border-transparent"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    Эпизод {ep.ordinal}
                  </span>
                  {ep.name && <span className="text-xs opacity-70 mt-1 line-clamp-1">{ep.name}</span>}
                </div>
                {isActive && playing && <Play size={14} className="animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
