"use client";

import React from "react";
import { Volume2, VolumeX, ShieldAlert } from "lucide-react";
import { audio } from "../utils/audio";

interface HeaderProps {
  username?: string;
  budget?: number;
  muteState: boolean;
  onToggleMute: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Header({
  username,
  budget,
  muteState,
  onToggleMute,
  currentView,
  onNavigate,
}: HeaderProps) {
  const formatMoney = (val: number) => {
    return (val / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ",000 M";
  };

  return (
    <header className="w-full border-b border-[rgba(255,255,255,0.06)] bg-[#0A0D10]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Branding */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => onNavigate("home")}
      >
        <span className="text-xl font-bold tracking-tight text-white">
          Global Football Auction <span className="text-[#00E676] text-glow-green">2026</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[rgba(255,255,255,0.7)]">
        <button
          onClick={() => onNavigate("create")}
          className={`hover:text-white transition-colors ${currentView === "create" ? "text-white underline decoration-[#00E676] decoration-2 underline-offset-8" : ""}`}
        >
          Create
        </button>
        <button
          onClick={() => onNavigate("join")}
          className={`hover:text-white transition-colors ${currentView === "join" ? "text-white underline decoration-[#00E676] decoration-2 underline-offset-8" : ""}`}
        >
          Join
        </button>
        <button
          onClick={() => onNavigate("home")} // How to play is anchor on home
          className="hover:text-white transition-colors"
        >
          How to Play
        </button>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Budget Coins Indicator */}
        {budget !== undefined && (
          <div className="bg-[#141A21] border border-[rgba(255,255,255,0.08)] px-4 py-1.5 rounded-full flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[rgba(255,255,255,0.4)]">Coins:</span>
            <span className="text-sm font-extrabold text-[#00E676] text-glow-green">{formatMoney(budget)}</span>
          </div>
        )}

        {/* Mute Toggle */}
        <button
          onClick={() => {
            onToggleMute();
            audio.playClick();
          }}
          className="p-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#141A21]/50 hover:bg-[#141A21] transition-all text-white/70 hover:text-white"
        >
          {muteState ? <VolumeX className="w-4 h-4 text-[#ef4444]" /> : <Volume2 className="w-4 h-4 text-[#00E676]" />}
        </button>

        {/* Profile Avatar */}
        {username && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[#00E676] bg-[#141A21] flex items-center justify-center text-xs font-bold text-white uppercase select-none">
              {username[0]}
            </div>
            <span className="text-xs font-semibold text-white/80 hidden sm:inline">{username}</span>
          </div>
        )}
      </div>
    </header>
  );
}
