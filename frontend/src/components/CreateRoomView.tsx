"use client";

import React, { useState } from "react";
import { ArrowLeft, PlusCircle, Globe, DollarSign, Timer, Shuffle, Settings, ShieldAlert, Sparkles } from "lucide-react";
import { audio } from "../utils/audio";
import { motion } from "framer-motion";

interface CreateRoomViewProps {
  onBack: () => void;
  onCreateRoom: (data: {
    display_name: string;
    room_name: string;
    settings: {
      budget: number;
      timer_duration: number;
      boosts_enabled: boolean;
      transfers_enabled: boolean;
      auction_order: string;
    };
  }) => void;
}

export default function CreateRoomView({ onBack, onCreateRoom }: CreateRoomViewProps) {
  const [displayName, setDisplayName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [budget, setBudget] = useState(1000000000); // 1B Euros default
  const [timer, setTimer] = useState(30); // 30s default
  const [boostsEnabled, setBoostsEnabled] = useState(true);
  const [transfersEnabled, setTransfersEnabled] = useState(true);
  const [auctionOrder, setAuctionOrder] = useState("Random");
  const [poolSelection, setPoolSelection] = useState("Elite Nations (12)");

  const formatSliderValue = (val: number) => {
    if (val >= 1000000000) {
      return `€${(val / 1000000000).toFixed(1).replace(".0", "")} Billion`;
    }
    return `€${val / 1000000} Million`;
  };

  const handleGenerate = () => {
    if (!displayName.trim()) {
      alert("Please enter a Display Name.");
      return;
    }
    audio.playClick();
    onCreateRoom({
      display_name: displayName,
      room_name: roomName || `${displayName}'s Tournament`,
      settings: {
        budget,
        timer_duration: timer,
        boosts_enabled: boostsEnabled,
        transfers_enabled: transfersEnabled,
        auction_order: auctionOrder,
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 relative z-10 select-none">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 bg-[#0D1115]/90 shadow-2xl flex flex-col md:flex-row gap-12 relative overflow-hidden">
        {/* Glow ambient background inside the panel */}
        <div className="absolute -left-36 -top-36 w-96 h-96 bg-[#00E676]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -right-36 -bottom-36 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Left Form: Configuration */}
        <div className="flex-1 flex flex-col gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2 text-[#00E676] font-bold text-xs uppercase tracking-widest"
            >
              <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse" /> Tournament Console
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3">
              Configure Tournament
            </h1>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              Establish starting budgets, round timers, and active features to generate your custom Socket lobby.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Display Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <span>👤</span> Display Name
              </label>
              <input
                type="text"
                placeholder="Manager Name"
                maxLength={14}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] outline-none text-white font-semibold px-4 py-3.5 rounded-xl text-sm transition-all shadow-inner"
              />
            </div>

            {/* Room Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <span>🏰</span> Tournament Title
              </label>
              <input
                type="text"
                placeholder="e.g. World League Draft"
                maxLength={25}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] outline-none text-white font-semibold px-4 py-3.5 rounded-xl text-sm transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Player Pool Selector Card */}
          <div className="flex flex-col gap-2 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00E676]" /> World Cup Player Pool
            </label>
            <select
              value={poolSelection}
              onChange={(e) => setPoolSelection(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 focus:border-[#00E676] outline-none text-white font-bold px-4 py-3.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              <option value="Elite Nations (12)">Elite Nations Pool (12 Countries - 180 Players)</option>
              <option value="Top Nations (24)" disabled>Top Nations Pool (24 Countries) — Coming Soon</option>
            </select>
          </div>

          {/* Budget Range Selector */}
          <div className="flex flex-col gap-3 bg-slate-900/30 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-sm">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#00E676]" /> Starting Budget
              </label>
              <span className="text-[#00E676] text-sm font-black drop-shadow-[0_0_8px_rgba(0,230,118,0.2)]">
                {formatSliderValue(budget)}
              </span>
            </div>
            
            <input
              type="range"
              min="500000000"
              max="2000000000"
              step="50000000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#00E676] bg-slate-950/80 h-2.5 rounded-lg cursor-pointer transition-all"
            />
            <div className="flex items-center justify-between text-[9px] text-white/30 font-extrabold uppercase tracking-wide px-1">
              <span>€500M</span>
              <span>€1.25B</span>
              <span>€2.0B</span>
            </div>
          </div>

          {/* Auction Settings (Timer / Order) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Auction Bidding Timer */}
            <div className="flex flex-col gap-2.5 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[#00E676]" /> Bidding Timer
              </label>
              <div className="flex gap-2">
                {[15, 30, 45].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setTimer(t);
                    }}
                    className={`flex-1 py-3 text-xs font-black rounded-xl border transition-all duration-200 cursor-pointer ${
                      timer === t
                        ? "bg-[#00E676] border-[#00E676] text-[#0A0D10] shadow-[0_4px_12px_rgba(0,230,118,0.25)]"
                        : "bg-slate-950/40 border-white/5 text-white/60 hover:bg-slate-950/80 hover:text-white"
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>

            {/* Auction Draw Order */}
            <div className="flex flex-col gap-2.5 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-[#00E676]" /> Draw Sequence
              </label>
              <div className="flex gap-2">
                {["Random", "Position"].map((order) => (
                  <button
                    key={order}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setAuctionOrder(order === "Position" ? "Position Wise" : "Random");
                    }}
                    className={`flex-1 py-3 text-xs font-black rounded-xl border transition-all duration-200 cursor-pointer ${
                      (order === "Position" ? "Position Wise" : "Random") === auctionOrder
                        ? "bg-[#00E676] border-[#00E676] text-[#0A0D10] shadow-[0_4px_12px_rgba(0,230,118,0.25)]"
                        : "bg-slate-950/40 border-white/5 text-white/60 hover:bg-slate-950/80 hover:text-white"
                    }`}
                  >
                    {order}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Rule Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Boost Cards Toggle */}
            <div className="flex items-center justify-between bg-slate-900/30 p-4 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider">⚡ Allow Boosts</span>
                <span className="text-[9px] text-white/40 font-medium">Activate collectible multipliers</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setBoostsEnabled(!boostsEnabled);
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  boostsEnabled ? "bg-[#00E676]" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    boostsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Transfers Switch */}
            <div className="flex items-center justify-between bg-slate-900/30 p-4 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider">🔄 Roster Trades</span>
                <span className="text-[9px] text-white/40 font-medium">Enable direct player swapping</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setTransfersEnabled(!transfersEnabled);
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  transfersEnabled ? "bg-[#00E676]" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    transfersEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={handleGenerate}
              className="flex-1 py-4.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(0,230,118,0.25)] hover:shadow-[0_10px_25px_rgba(0,230,118,0.4)] hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" /> Establish Lobby
            </button>
            
            <button
              onClick={() => {
                audio.playClick();
                onBack();
              }}
              className="py-4.5 px-6 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[1px] bg-white/5" />

        {/* Right Info Column: Access Code / Connection details */}
        <div className="w-full md:w-[320px] flex flex-col items-center justify-between gap-8 py-4 relative">
          <div className="flex flex-col items-center w-full text-center">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
              Lobby Connection Code
            </span>
            
            {/* Access Code Box */}
            <div className="w-full bg-slate-900/40 border border-dashed border-white/10 rounded-2xl py-6 flex items-center justify-center mb-6 shadow-inner relative group">
              <div className="absolute inset-0 bg-[#00E676]/2 rounded-2xl blur-[12px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-3xl font-black tracking-widest text-[#00E676]/65 uppercase select-none drop-shadow-[0_0_10px_rgba(0,230,118,0.1)]">
                Awaiting
              </span>
            </div>

            {/* High Tech Scan node */}
            <div className="w-48 h-48 rounded-2xl border border-white/5 bg-slate-950/65 flex flex-col items-center justify-center gap-3 p-4 text-center shadow-inner relative overflow-hidden group">
              {/* Target bracket outlines */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00E676]/30" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00E676]/30" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00E676]/30" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00E676]/30" />
              
              <div className="w-12 h-12 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 group-hover:text-[#00E676]/60 transition-colors">
                QR
              </div>
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider leading-tight">
                QR Generator Offline
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/30 border border-white/5 text-center">
            <span className="text-xs">🔒</span>
            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
              Protected Lobby Session
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
