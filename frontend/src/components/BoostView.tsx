"use client";

import React, { useState } from "react";
import { Zap, ShieldAlert, Sparkles, Award, Shield, User, Users, Coins, HelpCircle, ChevronRight } from "lucide-react";
import { Player, RoomPlayer } from "../types";
import { audio } from "../utils/audio";
import { motion, AnimatePresence } from "framer-motion";

interface BoostViewProps {
  currentUsername: string;
  playersList: RoomPlayer[];
  onPurchaseBoost: (boostName: string, footballerName?: string) => void;
  onFinishBoosts?: () => void;
  onNavigateToPitch: () => void;
}

export default function BoostView({
  currentUsername,
  playersList,
  onPurchaseBoost,
  onFinishBoosts,
  onNavigateToPitch,
}: BoostViewProps) {
  const [selectedBoost, setSelectedBoost] = useState<string | null>(null);
  
  const me = playersList.find((p) => p.name === currentUsername);
  const isHost = me?.is_host;
  
  const boostOptions = [
    {
      name: "Captain",
      bonus: "+10 pts",
      price: 100000000,
      desc: "Applies to one squad player. Adds 10 fantasy points.",
      textColor: "text-[#FFD700]",
      glowColor: "rgba(255, 215, 0, 0.25)",
      bgColor: "from-amber-500/15 via-[#1A1910] to-[#0D1115] border-yellow-500/30 hover:border-yellow-500/50 shadow-[0_0_20px_rgba(255,215,0,0.05)]",
      icon: <Award className="w-7 h-7 text-[#FFD700]" />,
      requiresPlayer: true,
      allowedPositions: ["Striker", "Forward", "Midfielder", "Left Winger", "Right Winger", "Center Back", "Left Back", "Right Back", "Goalkeeper"]
    },
    {
      name: "Golden Boot",
      bonus: "+8 pts",
      price: 80000000,
      desc: "Applies only to Strikers or Forwards. Adds 8 points.",
      textColor: "text-[#00E676]",
      glowColor: "rgba(0, 230, 118, 0.25)",
      bgColor: "from-emerald-500/15 via-[#0F1E17] to-[#0D1115] border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_20px_rgba(0,230,118,0.05)]",
      icon: <Sparkles className="w-7 h-7 text-[#00E676]" />,
      requiresPlayer: true,
      allowedPositions: ["Striker", "Forward"]
    },
    {
      name: "Defensive Wall",
      bonus: "+6 pts",
      price: 60000000,
      desc: "Applies to Center Back, Fullbacks, or GKs. Adds 6 points.",
      textColor: "text-[#2979FF]",
      glowColor: "rgba(41, 121, 255, 0.25)",
      bgColor: "from-blue-500/15 via-[#0F1722] to-[#0D1115] border-blue-500/30 hover:border-blue-500/50 shadow-[0_0_20px_rgba(41,121,255,0.05)]",
      icon: <Shield className="w-7 h-7 text-[#2979FF]" />,
      requiresPlayer: true,
      allowedPositions: ["Center Back", "Left Back", "Right Back", "Goalkeeper"]
    },
    {
      name: "Playmaker",
      bonus: "+5 pts",
      price: 50000000,
      desc: "Applies only to Midfielders or Wingers. Adds 5 points.",
      textColor: "text-purple-400",
      glowColor: "rgba(192, 132, 252, 0.25)",
      bgColor: "from-purple-500/15 via-[#181322] to-[#0D1115] border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_20px_rgba(192,132,252,0.05)]",
      icon: <Zap className="w-7 h-7 text-purple-400" />,
      requiresPlayer: true,
      allowedPositions: ["Midfielder", "Left Winger", "Right Winger"]
    },
    {
      name: "Team Chemistry",
      bonus: "+5 pts",
      price: 40000000,
      desc: "Applies +5 points directly to squad score. Purchase multiple times.",
      textColor: "text-rose-400",
      glowColor: "rgba(251, 113, 133, 0.25)",
      bgColor: "from-rose-500/15 via-[#221319] to-[#0D1115] border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_20px_rgba(251,113,133,0.05)]",
      icon: <Users className="w-7 h-7 text-rose-400" />,
      requiresPlayer: false,
      allowedPositions: []
    }
  ];

  const formatMoney = (val: number) => {
    return `€${(val / 1000000).toLocaleString()}M`;
  };

  const handleActivateClick = (boostName: string, requiresPlayer: boolean, price: number) => {
    audio.playClick();
    if (!me) return;
    
    if (me.budget < price) {
      alert(`Insufficient budget to purchase this boost! Cost: ${formatMoney(price)}. Your budget: ${formatMoney(me.budget)}.`);
      return;
    }
    
    if (requiresPlayer) {
      setSelectedBoost(boostName);
    } else {
      // Chemistry Boost (No footballer picker needed)
      onPurchaseBoost(boostName);
      audio.playCoin();
    }
  };

  const handleSelectPlayer = (footballerName: string) => {
    if (!selectedBoost) return;
    onPurchaseBoost(selectedBoost, footballerName);
    setSelectedBoost(null);
    audio.playCoin();
  };

  // Calculate current fantasy points for a manager
  const getProjectedPoints = (player: RoomPlayer) => {
    const base = player.squad.reduce((sum, f) => sum + f.fantasy_score, 0);
    const chemistry = player.chemistry_score || 0;
    return base + chemistry;
  };

  // Get allowed players for footballer picker
  const activeBoostOpt = boostOptions.find(o => o.name === selectedBoost);
  const eligibleSquad = me?.squad.filter(f => {
    if (!activeBoostOpt) return false;
    // Check position restriction
    const isAllowedPos = activeBoostOpt.allowedPositions.includes(f.position);
    // Check if player already has a boost
    const noBoost = !f.boost_applied;
    return isAllowedPos && noBoost;
  }) || [];

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-6 relative z-10 select-none">
      
      {/* Left Column: Wallet & Projected Leaderboard Standings */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Wallet details */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Coins className="w-24 h-24 text-[#00E676]" />
          </div>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Available Euros Wallet</span>
          <span className="text-4xl font-black text-[#00E676] text-glow-green tracking-tight block">
            {me ? formatMoney(me.budget) : "€0M"}
          </span>
          <div className="mt-5 pt-4 border-t border-white/5 flex justify-around text-xs font-semibold">
            <div>
              <span className="text-white/40 block text-[8px] uppercase font-black tracking-wider">Base Squad</span>
              <span className="font-extrabold text-white text-sm">
                {me?.squad.reduce((sum, f) => sum + f.fantasy_score, 0) || 0} pts
              </span>
            </div>
            <div className="border-l border-white/5 pl-4">
              <span className="text-white/40 block text-[8px] uppercase font-black tracking-wider">Chemistry</span>
              <span className="font-extrabold text-rose-400 text-sm">
                +{me?.chemistry_score || 0} pts
              </span>
            </div>
            <div className="border-l border-white/5 pl-4">
              <span className="text-white/40 block text-[8px] uppercase font-black tracking-wider">Projected Total</span>
              <span className="font-extrabold text-[#00E676] text-sm drop-shadow-[0_0_8px_rgba(0,230,118,0.2)]">
                {me ? getProjectedPoints(me) : 0} pts
              </span>
            </div>
          </div>
        </div>

        {/* Live projected standings */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl flex-1">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 pb-2.5 border-b border-white/5 flex items-center gap-1.5">
            📊 Live Standings Standings
          </h3>

          <div className="flex flex-col gap-2.5">
            {[...playersList]
              .sort((a, b) => getProjectedPoints(b) - getProjectedPoints(a) || b.budget - a.budget)
              .map((p, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                    p.name === currentUsername 
                      ? "bg-[#00E676]/5 border-[#00E676]/20 text-[#00E676]" 
                      : "bg-slate-950/40 border-white/5 text-white/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white/30 text-[10px]">#{idx + 1}</span>
                    <span className="font-black truncate max-w-[110px]">{p.name}</span>
                    {p.is_host && <span className="text-[9px] text-[#FFD700]" title="Host">👑</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-white/30 font-bold">{formatMoney(p.budget)}</span>
                    <span className="font-black text-sm">{getProjectedPoints(p)} pts</span>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                audio.playClick();
                onNavigateToPitch();
              }}
              className="w-full py-4.5 bg-slate-950/60 border border-white/10 hover:bg-slate-950 hover:text-white text-white/80 font-black rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              ⚽ View Lineup Pitch
            </button>
          </div>
        </div>

      </div>

      {/* Right Column: Available Boosts Store Board */}
      <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <span className="text-[9px] font-black text-[#FFD700] uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-md">
              ⚡ Boost Center
            </span>
            <h2 className="text-xl font-black text-white mt-3 uppercase tracking-tight">Tactical Enhancements</h2>
            <p className="text-xs text-white/45 mt-1 font-medium">Use your remaining budget to acquire collectible boost cards for your draft roster.</p>
          </div>

          {/* Grid of options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boostOptions.map((opt, idx) => {
              const affordable = me ? me.budget >= opt.price : false;
              const count = me?.boosts_purchased.filter(b => b === opt.name).length || 0;
              
              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border bg-gradient-to-b ${opt.bgColor} flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-300 group`}
                >
                  {/* Glowing background card element */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at center, ${opt.glowColor} 0%, transparent 70%)`
                    }}
                  />
                  
                  <div className="flex gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-black text-sm text-white block uppercase tracking-wide">{opt.name}</span>
                          <span className="text-[10px] text-white/40 block mt-1 font-medium">{opt.desc}</span>
                        </div>
                        <span className={`text-[10px] font-black bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5 ${opt.textColor}`}>
                          {opt.bonus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-2 relative z-10">
                    <div>
                      <span className="text-[8px] text-white/30 uppercase block font-black">Boost Price</span>
                      <span className="text-xs font-black text-white">{formatMoney(opt.price)}</span>
                    </div>
                    
                    <button
                      onClick={() => handleActivateClick(opt.name, opt.requiresPlayer, opt.price)}
                      disabled={!affordable}
                      className={`px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        affordable 
                          ? "bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] shadow-[0_4px_12px_rgba(0,230,118,0.2)] hover:scale-102 active:scale-98" 
                          : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
                      }`}
                    >
                      {opt.name === "Team Chemistry" && count > 0 
                        ? `Acquire (x${count})` 
                        : "Buy Card"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-white/20" />
            <span>Apply upgrades now. stand by for host to finalize standings.</span>
          </div>

          {isHost ? (
            <button
              onClick={() => {
                audio.playClick();
                if (confirm("Are you sure all players are finished? This will calculate the final standings and end the game!")) {
                  onFinishBoosts?.();
                }
              }}
              className="px-8 py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black rounded-xl shadow-[0_6px_20px_rgba(0,230,118,0.25)] hover:shadow-[0_10px_25px_rgba(0,230,118,0.4)] hover:scale-102 active:scale-98 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Continue to Standings Standings 🏆
            </button>
          ) : (
            <div className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/5 text-white/40 text-xs font-bold uppercase tracking-wider animate-pulse">
              ⌛ Awaiting Host to Finalize Upgrades...
            </div>
          )}
        </div>

      </div>

      {/* Roster Player Picker Modal */}
      <AnimatePresence>
        {selectedBoost && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 rounded-3xl border border-[#00E676]/30 max-w-md w-full relative shadow-2xl bg-[#0D1115]"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">
                Apply {selectedBoost} Upgrade
              </h3>
              <p className="text-xs text-white/40 mb-6 font-medium">Select an eligible player from your squad. Note: players can only hold one active boost.</p>

              {eligibleSquad.length === 0 ? (
                <div className="py-6 text-center text-xs text-white/30 uppercase tracking-widest font-black flex flex-col gap-2 items-center">
                  <ShieldAlert className="w-8 h-8 text-red-500/60" />
                  <span>No eligible squad players</span>
                  <span className="text-[9px] text-white/20 normal-case font-medium">Check position restrictions or verify if players already have boosts.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {eligibleSquad.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPlayer(f.name)}
                      className="w-full bg-slate-950/60 border border-white/5 hover:border-[#00E676]/40 p-3.5 rounded-xl flex items-center justify-between text-xs text-left text-white/90 hover:text-white hover:bg-slate-950 transition-all cursor-pointer group"
                    >
                      <div>
                        <span className="font-black text-sm block group-hover:text-[#00E676] transition-colors">{f.name}</span>
                        <span className="text-[10px] text-white/40 block mt-0.5 font-bold">{f.position} - {f.country}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-[#FFD700] block">OVR {f.rating}</span>
                        <span className="text-[10px] text-[#00E676] font-bold block mt-0.5">+{f.fantasy_score} pts</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setSelectedBoost(null)}
                className="w-full py-3.5 bg-white/5 border border-white/10 text-white font-black rounded-xl text-xs mt-6 cursor-pointer hover:bg-white/10 uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
