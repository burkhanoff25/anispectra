"use client";

import React, { useEffect, useState, useRef } from 'react';
import EpisodePlayer from '@/components/EpisodePlayer';
import { getSocket } from '@/lib/socket';
import { Copy, Users, MessageSquare, Play, Send, Search, Loader2, PlayCircle, ChevronLeft, Mic, MicOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { searchAnilibria, getAnimeByAlias, getPopularAnime, searchMangaAction, getPopularMangaAction } from '@/app/actions/search';
import type { AniLibertyRelease, MangaDexManga } from '@/lib/types';

interface User {
  id: string;
  name: string;
  image: string;
}

interface ChatMessage {
  user: string;
  image: string;
  text: string;
  time: string;
}

export default function WatchPartyRoom({ roomId }: { roomId: string }) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [hostId, setHostId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Search state
  const [searchType, setSearchType] = useState<'anime' | 'manga'>('anime');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AniLibertyRelease[]>([]);
  const [mangaResults, setMangaResults] = useState<MangaDexManga[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AniLibertyRelease | null>(null);
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  
  // Voice Chat State
  const [isInVoice, setIsInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const audioContainerRef = useRef<HTMLDivElement>(null);
  
  const playerRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const isHost = session?.user?.id === hostId;
  const socket = getSocket();

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  };

  const createPeerConnection = (userId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[userId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { targetId: userId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      let audioElement = document.getElementById(`audio-${userId}`) as HTMLAudioElement;
      if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.id = `audio-${userId}`;
        audioElement.autoplay = true;
        if (audioContainerRef.current) {
          audioContainerRef.current.appendChild(audioElement);
        }
      }
      audioElement.srcObject = event.streams[0];
    };

    return pc;
  };

  const joinVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsInVoice(true);
      socket.emit('join-voice');
    } catch (err) {
      console.error('Failed to access microphone:', err);
      alert('Доступ к микрофону запрещен или недоступен.');
    }
  };

  const leaveVoice = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    Object.keys(peersRef.current).forEach(userId => {
      peersRef.current[userId].close();
      const audioElement = document.getElementById(`audio-${userId}`);
      if (audioElement) audioElement.remove();
    });
    peersRef.current = {};
    
    setIsInVoice(false);
    setIsMuted(false);
    socket.emit('leave-voice');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    if (!socket || !isInVoice) return;

    const handleUserJoined = async (userId: string) => {
      const pc = createPeerConnection(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { targetId: userId, offer });
    };

    const handleOffer = async ({ senderId, offer }: any) => {
      const pc = createPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { targetId: senderId, answer });
    };

    const handleAnswer = async ({ senderId, answer }: any) => {
      const pc = peersRef.current[senderId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = ({ senderId, candidate }: any) => {
      const pc = peersRef.current[senderId];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
    };

    const handleUserLeft = (userId: string) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
      }
      const audioElement = document.getElementById(`audio-${userId}`);
      if (audioElement) audioElement.remove();
    };

    socket.on('user-joined-voice', handleUserJoined);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left-voice', handleUserLeft);

    return () => {
      socket.off('user-joined-voice', handleUserJoined);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left-voice', handleUserLeft);
    };
  }, [isInVoice, socket]);

  useEffect(() => {
    const loadPopular = async () => {
      try {
        const [popularAnime, popularManga] = await Promise.all([
          getPopularAnime(),
          getPopularMangaAction()
        ]);
        setSearchResults(popularAnime);
        setMangaResults(popularManga);
      } catch (e) {
        console.error("Error loading popular items:", e);
      }
    };
    loadPopular();
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      socket.emit('join-room', roomId);
    });

    socket.on('connect_error', (err) => {
      setError('Не удалось подключиться к комнате. Вы вошли в аккаунт?');
      console.error(err);
    });

    socket.on('room-state', (state) => {
      setHostId(state.hostId);
      setVideoUrl(state.videoUrl);
      setUsers(state.users);
      
      // Auto-sync for late joiners (viewer)
      if (state.hostId !== session?.user?.id) {
        if (playerRef.current) {
          playerRef.current.seekTo(state.currentTime, 'seconds');
        }
        setPlaying(state.isPlaying);
      }
    });

    socket.on('users-updated', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('host-changed', (newHostId) => {
      setHostId(newHostId);
    });

    socket.on('video-changed', (url) => {
      setVideoUrl(url);
      setPlaying(false);
    });

    socket.on('sync-play', (time) => {
      if (!isHost) {
        setPlaying(true);
        if (playerRef.current && Math.abs(playerRef.current.getCurrentTime() - time) > 2) {
          playerRef.current.seekTo(time, 'seconds');
        }
      }
    });

    socket.on('sync-pause', (time) => {
      if (!isHost) {
        setPlaying(false);
        if (playerRef.current) {
          playerRef.current.seekTo(time, 'seconds');
        }
      }
    });

    socket.on('sync-seek', (time) => {
      if (!isHost && playerRef.current) {
        playerRef.current.seekTo(time, 'seconds');
      }
    });

    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('connect_error');
      socket.off('room-state');
      socket.off('users-updated');
      socket.off('host-changed');
      socket.off('video-changed');
      socket.off('sync-play');
      socket.off('sync-pause');
      socket.off('sync-seek');
      socket.off('chat-message');
    };
  }, [roomId, session?.user?.id, isHost]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Ссылка скопирована!');
  };

  const handlePlay = () => {
    if (isHost && playerRef.current) {
      setPlaying(true);
      socket.emit('play', playerRef.current.getCurrentTime());
    }
  };

  const handlePause = () => {
    if (isHost && playerRef.current) {
      setPlaying(false);
      socket.emit('pause', playerRef.current.getCurrentTime());
    }
  };

  const handleSeek = (e: number) => {
    if (isHost) {
      socket.emit('seek', e);
    }
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.emit('chat-message', chatInput);
      setChatInput('');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      if (searchType === 'anime') {
        const results = await searchAnilibria(searchQuery);
        setSearchResults(results);
      } else {
        const results = await searchMangaAction(searchQuery);
        setMangaResults(results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAnime = async (anime: AniLibertyRelease) => {
    setIsLoadingAnime(true);
    setSelectedAnime(anime); // Set initial data for quick UI feedback
    try {
      const fullDetails = await getAnimeByAlias(anime.alias);
      if (fullDetails) {
        setSelectedAnime(fullDetails);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAnime(false);
    }
  };

  if (error) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-black text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-black text-zinc-300">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Play className="text-[#C4F135]" /> Совместный просмотр
          </h1>
          <div className="flex items-center gap-2">
            {!isInVoice ? (
              <button
                onClick={joinVoice}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition text-sm font-medium"
              >
                <Mic size={16} /> Войти в голос
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  onClick={leaveVoice}
                  className="px-4 py-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/30 transition text-sm font-medium"
                >
                  Выйти
                </button>
              </div>
            )}
            <button
              onClick={copyInvite}
              className="flex items-center gap-2 px-4 py-2 bg-[#C4F135]/10 text-[#C4F135] rounded-full hover:bg-[#C4F135]/20 transition ml-2 text-sm font-medium"
            >
              <Copy size={16} /> Скопировать ссылку
            </button>
          </div>
        </div>

        {/* Hidden Audio Container for WebRTC Streams */}
        <div ref={audioContainerRef} className="hidden" />


        {/* Player Section */}
        {selectedAnime && (
          <div className="w-full flex flex-col h-full">
            <button 
              onClick={() => setSelectedAnime(null)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white mb-4 text-sm w-fit"
            >
              <ChevronLeft size={16} /> Вернуться к поиску
            </button>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={selectedAnime.poster?.src ? (selectedAnime.poster.src.startsWith('http') ? selectedAnime.poster.src : `https://anilibria.top${selectedAnime.poster.src}`) : ''} 
                alt={selectedAnime.name.main} 
                className="w-12 h-16 object-cover rounded-lg"
              />
              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                {selectedAnime.name.main}
                {isLoadingAnime && <Loader2 size={16} className="animate-spin text-[#C4F135]" />}
              </h4>
            </div>
            
            {!isLoadingAnime && (!selectedAnime.episodes || selectedAnime.episodes.length === 0) ? (
              <p className="text-zinc-500 text-sm">Эпизоды недоступны.</p>
            ) : (
              selectedAnime.episodes && selectedAnime.episodes.length > 0 && (
                <div className="flex-1 w-full bg-black rounded-xl overflow-hidden shadow-2xl min-h-[500px]">
                  <EpisodePlayer episodes={selectedAnime.episodes} titleId={selectedAnime.id.toString()} />
                </div>
              )
            )}
          </div>
        )}

        <div className={`mt-2 p-4 bg-[#111] rounded-xl border border-zinc-800 ${selectedAnime ? 'hidden' : 'flex-1'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Search size={18} className="text-[#C4F135]" /> Поиск
              </h3>
              <div className="flex gap-2">
                <button 
                  className={`px-3 py-1 text-sm rounded-full ${searchType === 'anime' ? 'bg-[#C4F135] text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                  onClick={() => { setSearchType('anime'); setSearchQuery(''); }}
                >
                  Аниме
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-full ${searchType === 'manga' ? 'bg-[#C4F135] text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                  onClick={() => { setSearchType('manga'); setSearchQuery(''); }}
                >
                  Манга
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={`Поиск ${searchType === 'anime' ? 'аниме' : 'манги'}...`} 
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#C4F135]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-[#C4F135] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#b0d930] transition flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>
              
              {searchType === 'anime' && searchResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm text-zinc-400 mb-2">
                    {searchQuery ? 'Результаты поиска' : 'Популярное аниме'}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {searchResults.map(anime => (
                    <div 
                      key={anime.id} 
                      className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-[#C4F135] transition group"
                      onClick={() => handleSelectAnime(anime)}
                    >
                      <div className="aspect-[3/4] relative">
                        <img 
                          src={anime.poster?.src ? (anime.poster.src.startsWith('http') ? anime.poster.src : `https://anilibria.top${anime.poster.src}`) : ''} 
                          alt={anime.name.main} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <PlayCircle size={32} className="text-[#C4F135]" />
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-white line-clamp-2 font-medium">{anime.name.main}</p>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {searchType === 'manga' && mangaResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm text-zinc-400 mb-2">
                    {searchQuery ? 'Результаты поиска' : 'Популярная манга'}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {mangaResults.map(manga => {
                    const title = manga.attributes.title.ru || manga.attributes.title.en || manga.attributes.title["ja-ro"] || "Манга без названия";
                    const coverRel = manga.relationships?.find(r => r.type === "cover_art");
                    const coverFile = coverRel?.attributes?.fileName;
                    const coverUrl = coverFile ? `/api/proxy/image?url=${encodeURIComponent(`https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.512.jpg`)}` : '';
                    return (
                      <div 
                        key={manga.id} 
                        className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-[#C4F135] transition group"
                        onClick={() => window.open(`/manga/${manga.id}`, '_blank')}
                      >
                        <div className="aspect-[3/4] relative">
                          {coverUrl && (
                            <img 
                              src={coverUrl} 
                              alt={title} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-white line-clamp-2 font-medium">{title}</p>
                        </div>
                      </div>
                    )
                  })}
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Sidebar: Chat & Users */}
      <div className="w-full md:w-80 border-l border-zinc-800 flex flex-col h-full bg-[#0a0a0a]">
        
        {/* Users List */}
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Users size={18} className="text-[#C4F135]" /> В комнате ({users.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {users.map((u) => (
              <div key={u.id} className="relative group">
                <img
                  src={u.image || "https://ui-avatars.com/api/?name=" + u.name}
                  alt={u.name}
                  className={`w-10 h-10 rounded-full border-2 ${u.id === hostId ? 'border-[#C4F135]' : 'border-transparent'}`}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-zinc-800 text-xs px-2 py-1 rounded">
                  {u.name} {u.id === hostId ? '(Host)' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className="flex gap-3">
              <img src={msg.image || "https://ui-avatars.com/api/?name=" + msg.user} alt="Avatar" className="w-8 h-8 rounded-full" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm text-white">{msg.user}</span>
                  <span className="text-xs text-zinc-500">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-zinc-300 break-words">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-zinc-800">
          <form onSubmit={sendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Написать сообщение..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C4F135]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-[#C4F135] text-black p-2 rounded-lg disabled:opacity-50 hover:bg-[#a3c92c] transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
