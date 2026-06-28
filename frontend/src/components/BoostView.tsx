"use client";

import React, { useState } from "react";
import { Zap, ShieldAlert, Sparkles, Award, Shield, User, Users, Coins, HelpCircle } from "lucide-react";
import { Player, RoomPlayer } from "../types";
import { audio } from "../utils/audio";

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
      bgColor: "from-amber-500/20 to-yellow-600/10 border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.05)]",
      icon: <Award className="w-6 h-6 text-[#FFD700]" />,
      requiresPlayer: true,
      allowedPositions: ["Striker", "Forward", "Midfielder", "Left Winger", "Right Winger", "Center Back", "Left Back", "Right Back", "Goalkeeper"]
    },
    {
      name: "Golden Boot",
      bonus: "+8 pts",
      price: 80000000,
      desc: "Applies only to Strikers or Forwards. Adds 8 points.",
      textColor: "text-[#00E676]",
      bgColor: "from-emerald-500/20 to-teal-600/10 border-emerald-500/30 shadow-[0_0_15px_rgba(0,230,118,0.05)]",
      icon: <Sparkles className="w-6 h-6 text-[#00E676]" />,
      requiresPlayer: true,
      allowedPositions: ["Striker", "Forward"]
    },
    {
      name: "Defensive Wall",
      bonus: "+6 pts",
      price: 60000000,
      desc: "Applies to Center Back, Fullbacks, or GKs. Adds 6 points.",
      textColor: "text-[#2979FF]",
      bgColor: "from-blue-500/20 to-cyan-600/10 border-blue-500/30 shadow-[0_0_15px_rgba(41,121,255,0.05)]",
      icon: <Shield className="w-6 h-6 text-[#2979FF]" />,
      requiresPlayer: true,
      allowedPositions: ["Center Back", "Left Back", "Right Back", "Goalkeeper"]
    },
    {
      name: "Playmaker",
      bonus: "+5 pts",
      price: 50000000,
      desc: "Applies only to Midfielders or Wingers. Adds 5 points.",
      textColor: "text-purple-400",
      bgColor: "from-purple-500/20 to-indigo-600/10 border-purple-500/30 shadow-[0_0_15px_rgba(192,132,252,0.05)]",
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      requiresPlayer: true,
      allowedPositions: ["Midfielder", "Left Winger", "Right Winger"]
    },
    {
      name: "Team Chemistry",
      bonus: "+5 pts",
      price: 40000000,
      desc: "Applies +5 points directly to squad score. Purchase multiple times.",
      textColor: "text-rose-400",
      bgColor: "from-rose-500/20 to-pink-600/10 border-rose-500/30 shadow-[0_0_15px_rgba(251,113,133,0.05)]",
      icon: <Users className="w-6 h-6 text-rose-400" />,
      requiresPlayer: false,
      allowedPositions: []
    }
  ];

  const formatMoney = (val: number) => {
    return `€${val / 1000000}M`;
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
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-6 relative z-10">
      
      {/* Left Column: Wallet & Projected Leaderboard Standings */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Wallet details */}
        <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Coins className="w-24 h-24 text-[#00E676]" />
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Remaining Euros</span>
          <span className="text-3xl md:text-4xl font-black text-[#00E676] text-glow-green tracking-tight block">
            {me ? formatMoney(me.budget) : "€0M"}
          </span>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-around text-xs">
            <div>
              <span className="text-white/40 block text-[9px] uppercase font-bold">Base Points</span>
              <span className="font-extrabold text-white">
                {me?.squad.reduce((sum, f) => sum + f.fantasy_score, 0) || 0} pts
              </span>
            </div>
            <div className="border-l border-white/5 pl-4">
              <span className="text-white/40 block text-[9px] uppercase font-bold">Chemistry</span>
              <span className="font-extrabold text-rose-400">
                +{me?.chemistry_score || 0} pts
              </span>
            </div>
            <div className="border-l border-white/5 pl-4">
              <span className="text-white/40 block text-[9px] uppercase font-bold">Total Projected</span>
              <span className="font-extrabold text-[#00E676]">
                {me ? getProjectedPoints(me) : 0} pts
              </span>
            </div>
          </div>
        </div>

        {/* Live projected standings */}
        <div className="glass-panel p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 flex-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-white/5">
            Projected standings
          </h3>

          <div className="flex flex-col gap-3">
            {[...playersList]
              .sort((a, b) => getProjectedPoints(b) - getProjectedPoints(a) || b.budget - a.budget)
              .map((p, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    p.name === currentUsername 
                      ? "bg-[#00E676]/5 border-[#00E676]/20 text-[#00E676]" 
                      : "bg-[#181F26]/30 border-white/5 text-white/85"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white/30">#{idx + 1}</span>
                    <span className="font-extrabold truncate max-w-[100px]">{p.name}</span>
                    {p.is_host && <span className="text-[9px] text-[#FFD700]">👑</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-white/40 font-bold">{formatMoney(p.budget)}</span>
                    <span className="font-black text-sm">{getProjectedPoints(p)} pts</span>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onNavigateToPitch();
              }}
              className="w-full py-3 bg-[#1A2129] border border-[rgba(255,255,255,0.08)] hover:bg-[#202933] text-white font-bold rounded-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              ⚽ View Roster Pitch
            </button>
          </div>
        </div>

      </div>

      {/* Right Column: Available Boosts Store Board */}
      <div className="flex-1 glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <span className="text-[9px] font-bold text-[#FFD700] uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded">
              ⚡ Upgrade Center
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2 uppercase tracking-tight">Tactical Enhancements</h2>
            <p className="text-xs text-white/50 mt-1">Spend your remaining Euros on boost items before the final round calculations.</p>
          </div>

          {/* Grid of options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boostOptions.map((opt, idx) => {
              const affordable = me ? me.budget >= opt.price : false;
              // Count how many chemistry boosts used if chemistry
              const count = me?.boosts_purchased.filter(b => b === opt.name).length || 0;
              
              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-xl border bg-[#181F26]/40 flex flex-col justify-between gap-4 relative overflow-hidden transition-all border-white/5 ${opt.bgColor}`}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-sm text-white block uppercase tracking-tight">{opt.name}</span>
                          <span className="text-[10px] text-white/40 block mt-0.5">{opt.desc}</span>
                        </div>
                        <span className={`text-xs font-black bg-white/5 px-2 py-0.5 rounded ${opt.textColor}`}>
                          {opt.bonus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-2">
                    <div>
                      <span className="text-[9px] text-white/30 uppercase block font-semibold">Boost Price</span>
                      <span className="text-xs font-extrabold text-white">{formatMoney(opt.price)}</span>
                    </div>
                    
                    <button
                      onClick={() => handleActivateClick(opt.name, opt.requiresPlayer, opt.price)}
                      disabled={!affordable}
                      className={`px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        affordable 
                          ? "bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] shadow-md" 
                          : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
                      }`}
                    >
                      {opt.name === "Team Chemistry" && count > 0 
                        ? `Buy Again (x${count})` 
                        : "Purchase Boost"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <HelpCircle className="w-4 h-4 text-white/30" />
            <span>Apply upgrades now. Once the host ends this phase, no more boosts can be purchased.</span>
          </div>

          {isHost ? (
            <button
              onClick={() => {
                audio.playClick();
                if (confirm("Are you sure all players are finished? This will calculate the final standings and end the game!")) {
                  onFinishBoosts?.();
                }
              }}
              className="px-8 py-3.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black rounded-lg shadow-lg hover:shadow-[#00E676]/25 transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Continue to Results 🏆
            </button>
          ) : (
            <div className="px-5 py-3.5 rounded-lg bg-white/5 border border-white/5 text-white/50 text-xs font-bold uppercase tracking-wider animate-pulse">
              ⌛ Waiting for Host to finish boosts...
            </div>
          )}
        </div>

      </div>

      {/* Roster Player Picker Modal */}
      {selectedBoost && (
        <div className="fixed inset-0 bg-[#0A0D10]/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-8 rounded-xl border border-[#00E676]/30 max-w-md w-full relative">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
              Apply {selectedBoost} Boost
            </h3>
            <p className="text-xs text-white/50 mb-6">Select an eligible player from your squad. Note: players can only hold one active boost.</p>

            {eligibleSquad.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/20 uppercase tracking-widest font-semibold flex flex-col gap-2 items-center">
                <span>No eligible squad players.</span>
                <span className="text-[10px] text-white/10 normal-case">Check position restrictions or verify if players already have boosts.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                {eligibleSquad.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPlayer(f.name)}
                    className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] hover:border-[#00E676]/40 p-3 rounded-lg flex items-center justify-between text-xs text-left text-white/90 hover:text-white transition-all cursor-pointer"
                  >
                    <div>
                      <span className="font-extrabold">{f.name}</span>
                      <span className="text-[10px] text-white/40 block mt-0.5">{f.position} - {f.country}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#FFD700]">OVR {f.rating}</span>
                      <span className="text-[9px] text-[#00E676] block mt-0.5">{f.fantasy_score} pts</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setSelectedBoost(null)}
              className="w-full py-3 bg-[#1A2129] border border-[rgba(255,255,255,0.08)] text-white hover:text-white font-bold rounded-lg text-xs mt-6 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
