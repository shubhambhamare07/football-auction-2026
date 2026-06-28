"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, Shield, Users, Send, Settings, HelpCircle, CheckCircle2, Circle, Sparkles, Check, Bell } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Room, RoomPlayer, ChatMessage } from "../types";
import { audio } from "../utils/audio";
import { motion, AnimatePresence } from "framer-motion";

interface LobbyViewProps {
  room: Room;
  currentUsername: string;
  chatMessages: ChatMessage[];
  onToggleReady: () => void;
  onStartAuction: () => void;
  onKickPlayer: (name: string) => void;
  onSendMessage: (text: string) => void;
}

export default function LobbyView({
  room,
  currentUsername,
  chatMessages,
  onToggleReady,
  onStartAuction,
  onKickPlayer,
  onSendMessage,
}: LobbyViewProps) {
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Find current user's profile
  const me = room.players.find((p) => p.name === currentUsername);
  const isHost = me?.is_host || false;
  
  // Format budget
  const formatMoney = (val: number) => {
    return `€${(val / 1000000).toLocaleString()}M`;
  };

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
    audio.playClick();
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.room_code);
    audio.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Join link for QR Code
  const joinUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/?join=${room.room_code}` 
    : `https://gfa2026.com/join/${room.room_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    audio.playPop();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 flex flex-col lg:flex-row gap-6 relative z-10 select-none">
      
      {/* Left Sidebar: Lobby Info & Settings */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        
        {/* Lobby Details Box */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-[10px] font-black text-[#00E676] uppercase tracking-widest">Waiting Lobby</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-1 tracking-tight uppercase leading-none">
            Lobby #{room.room_code}
          </h2>
          <p className="text-xs text-white/40 mb-6 font-medium">{room.room_name}</p>

          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Room Code</span>
            <div className="flex items-center justify-between bg-slate-950/60 border border-white/10 px-4 py-3.5 rounded-xl shadow-inner group">
              <span className="text-base font-black tracking-wider text-white uppercase">{room.room_code}</span>
              <button 
                onClick={handleCopyCode}
                className="text-white/40 hover:text-[#00E676] transition-colors cursor-pointer"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-4 h-4 text-[#00E676]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <button 
              onClick={handleCopyLink}
              className="mt-1 w-full py-2 bg-slate-950/40 border border-white/5 hover:border-[#00E676]/30 text-white/60 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? "✓ Invite Link Copied!" : "📋 Copy Invite Link"}
            </button>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex flex-col items-center gap-2.5 p-4 rounded-xl bg-slate-950/40 border border-white/5">
            <div className="p-3 bg-white rounded-xl inline-block shadow-lg">
              <QRCodeSVG value={joinUrl} size={110} />
            </div>
            <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Scan to draft instantly</span>
          </div>

          {/* Action Trigger */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onToggleReady();
              }}
              className={`w-full py-4.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                me?.is_ready 
                  ? "bg-transparent border-[#00E676] text-[#00E676] hover:bg-[#00E676]/10 shadow-[0_4px_15px_rgba(0,230,118,0.15)]" 
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {me?.is_ready ? "✓ Ready to Play" : "Mark Ready"}
            </button>

            {isHost && (
              <button
                onClick={() => {
                  audio.playVictory();
                  onStartAuction();
                }}
                className="w-full py-4.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(0,230,118,0.25)] hover:shadow-[0_10px_25px_rgba(0,230,118,0.4)] transition-all duration-200 text-xs cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
              >
                🚀 Start Draft Round
              </button>
            )}
          </div>
        </div>

        {/* Match Settings Info */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl">
          <h3 className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-pulse" /> Match Parameters
          </h3>
          <div className="flex flex-col gap-3 text-[11px] font-medium text-white/50">
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span>Host Manager</span>
              <span className="text-white font-extrabold">{room.players.find(p => p.is_host)?.name || "Unknown"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span>Starting Budget</span>
              <span className="text-white font-extrabold">{formatMoney(room.settings.budget)}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span>Draft Sequence</span>
              <span className="text-white font-extrabold capitalize">{room.settings.auction_order || "Random"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span>Bidding Timer</span>
              <span className="text-white font-extrabold">{room.settings.timer_duration} Seconds</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>Roster Targets</span>
              <span className="text-white font-extrabold">11 Pitch + 4 Subs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel: Joined Managers Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00E676]" /> Active Managers
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 border border-white/10 text-[9px] font-black text-[#00E676] px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" /> Ping: Active
              </span>
              <span className="bg-slate-950 border border-white/10 text-[9px] font-black text-[#00E676] px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-inner">
                {room.players.length} / {room.settings.max_players} Logged In
              </span>
            </div>
          </div>

          {/* Grid of Players */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <AnimatePresence>
              {room.players.map((p, idx) => (
                <motion.div 
                  key={p.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden group hover:border-[#00E676]/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full border border-white/10 bg-slate-900 flex items-center justify-center text-sm font-black text-white uppercase select-none shadow-inner">
                      {p.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white flex items-center gap-1.5">
                        {p.name}
                        {p.is_host && <span title="Host"><Shield className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]/10" /></span>}
                        {p.name === currentUsername && <span className="text-[8px] font-black text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/15 px-2 py-0.5 rounded-md uppercase tracking-wider">You</span>}
                      </span>
                      <span className="text-[10px] text-white/40 font-bold">Budget: {formatMoney(p.budget)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {p.is_ready ? (
                      <span className="text-[9px] font-black text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/15 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-white/30 bg-white/5 border border-white/5 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                        <Circle className="w-3.5 h-3.5 opacity-40 animate-pulse" /> Pending
                      </span>
                    )}

                    {/* Kick Action */}
                    {isHost && !p.is_host && (
                      <button
                        onClick={() => {
                          audio.playHammer();
                          onKickPlayer(p.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/15 transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Kick
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Waiting Slots */}
            {Array.from({ length: room.settings.max_players - room.players.length }).map((_, idx) => (
              <div 
                key={`empty-${idx}`}
                className="border border-dashed border-white/5 bg-transparent rounded-2xl p-4 flex items-center justify-center text-center text-[10px] text-white/20 uppercase tracking-widest font-black animate-pulse"
              >
                + Waiting for manager...
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Chat System */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6 h-[550px] lg:h-[620px]">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <Bell className="w-4 h-4 text-[#00E676]" />
            <span className="text-xs font-black text-white uppercase tracking-wider">Lobby Feed & Chat</span>
          </div>

          {/* Chat Feed Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 text-xs pb-4"
          >
            {chatMessages.map((msg, idx) => {
              if (msg.sender === "System") {
                return (
                  <div key={idx} className="bg-slate-950/50 border border-white/5 px-3 py-2.5 rounded-xl text-white/40 text-[10px] leading-relaxed italic text-center font-semibold">
                    {msg.text}
                  </div>
                );
              }
              const isMe = msg.sender === currentUsername;
              return (
                <div key={idx} className={`flex flex-col gap-1 max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                  <span className="text-[9px] text-white/40 px-1 font-bold">{msg.sender}</span>
                  <div className={`px-3.5 py-2.5 rounded-2xl leading-relaxed text-[11px] ${
                    isMe 
                      ? "bg-[#00E676] text-[#0A0D10] font-black rounded-tr-none shadow-[0_4px_12px_rgba(0,230,118,0.15)]" 
                      : "bg-slate-950/70 border border-white/10 text-white font-semibold rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-white/5">
            <input
              type="text"
              placeholder="Send quick reaction..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950/60 border border-white/10 focus:border-[#00E676] outline-none text-white font-semibold px-4 py-3 rounded-xl text-xs transition-all shadow-inner"
            />
            <button
              type="submit"
              className="p-3 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] rounded-xl transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </form>
        </div>

        {/* Footer Support Buttons */}
        <div className="flex gap-4 text-[10px] font-black text-white/30 px-2 justify-between uppercase tracking-wider">
          <button className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
          <button className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5" /> Support
          </button>
        </div>
      </div>

    </div>
  );
}
