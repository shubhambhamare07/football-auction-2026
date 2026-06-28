"use client";

import React from "react";
import { ArrowLeft, Award, Sparkles, User, Shield } from "lucide-react";
import { Player, RoomPlayer } from "../types";
import { audio } from "../utils/audio";

interface PitchViewProps {
  currentUsername: string;
  playersList: RoomPlayer[];
  onBack: () => void;
  onNavigateToBoosts: () => void;
}

export default function PitchView({
  currentUsername,
  playersList,
  onBack,
  onNavigateToBoosts,
}: PitchViewProps) {
  const me = playersList.find((p) => p.name === currentUsername);

  // Group squad players by position categories
  const squad = me?.squad || [];
  const gks = squad.filter(p => p.position === "Goalkeeper");
  const defs = squad.filter(p => p.position.includes("Back") || p.position.includes("Defender"));
  const mids = squad.filter(p => p.position.includes("Midfielder") || p.position.includes("Winger"));
  const fwds = squad.filter(p => p.position === "Striker" || p.position === "Forward");

  const totalFantasy = squad.reduce((total, p) => total + p.fantasy_score, 0);
  const avgRating = squad.length > 0 ? (squad.reduce((total, p) => total + p.rating, 0) / squad.length).toFixed(1) : 0;
  
  // Tier counts
  const tierCounts = squad.reduce((acc: Record<string, number>, p) => {
    acc[p.tier] = (acc[p.tier] || 0) + 1;
    return acc;
  }, {});

  const formatMoney = (val: number) => {
    return `€${val / 1000000}M`;
  };

  const renderPlayerBadge = (player: Player) => {
    return (
      <div 
        key={player.name} 
        className="flex flex-col items-center gap-1 group relative cursor-pointer"
        onClick={() => audio.playPop()}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white relative bg-[#1A2129] border ${
          player.tier === "Tier S" 
            ? "border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.3)]" 
            : "border-[rgba(255,255,255,0.08)]"
        }`}>
          {player.name[0]}
          
          {/* Boost Indicator Icon */}
          {player.boost_applied && (
            <span className="absolute -top-1 -right-1 bg-[#00E676] rounded-full p-0.5 text-[8px] border border-[#0A0D10] text-[#0A0D10] font-extrabold animate-bounce">
              ⚡
            </span>
          )}
        </div>
        
        <span className="text-[10px] font-extrabold text-white/90 truncate max-w-[80px] bg-[#141A21] px-1.5 py-0.5 rounded border border-white/5 shadow-md">
          {player.name.split(" ").pop()}
        </span>
        <span className="text-[8px] text-[#00E676] font-bold mt-[-2px]">
          {player.fantasy_score} pts
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 flex flex-col lg:flex-row gap-6 relative z-10">
      
      {/* Left Sidebar: Team Roster Stats */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        
        {/* Statistics panel */}
        <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80">
          <h2 className="text-xl font-extrabold text-white uppercase tracking-tight mb-4 border-b border-[rgba(255,255,255,0.04)] pb-2">
            🏆 Team Statistics
          </h2>

          <div className="flex flex-col gap-4 text-xs">
            <div>
              <span className="text-white/40 block">Total Fantasy Points</span>
              <span className="text-2xl font-extrabold text-[#00E676] text-glow-green mt-0.5 block">
                {totalFantasy} pts
              </span>
            </div>
            <div>
              <span className="text-white/40 block">Remaining Budget</span>
              <span className="text-lg font-extrabold text-white mt-0.5 block">
                {me ? formatMoney(me.budget) : "€0M"}
              </span>
            </div>
            <div>
              <span className="text-white/40 block">Average Rating</span>
              <span className="text-lg font-extrabold text-[#FFD700] mt-0.5 block">
                {avgRating} OVR
              </span>
            </div>
            
            {/* Tier Distribution */}
            <div>
              <span className="text-white/40 block mb-2">Tier Distribution</span>
              <div className="flex flex-col gap-1 text-[10px] font-bold">
                <div className="flex justify-between">
                  <span className="text-[#FFD700]">Tier S</span>
                  <span>{tierCounts["Tier S"] || 0} players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2979FF]">Tier A</span>
                  <span>{tierCounts["Tier A"] || 0} players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tier B</span>
                  <span>{tierCounts["Tier B"] || 0} players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Tier C</span>
                  <span>{tierCounts["Tier C"] || 0} players</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onNavigateToBoosts();
              }}
              className="w-full py-3 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-extrabold rounded-lg shadow-lg hover:shadow-[#00E676]/20 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              ⚡ Boost Center
            </button>
            <button
              onClick={() => {
                audio.playClick();
                onBack();
              }}
              className="w-full py-3 bg-[#1A2129] border border-[rgba(255,255,255,0.08)] hover:bg-[#202933] text-white font-bold rounded-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Game
            </button>
          </div>
        </div>

      </div>

      {/* Center Panel: Football Pitch Visualization */}
      <div className="flex-1 glass-panel rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0C0F12] relative overflow-hidden flex flex-col items-center p-8 h-[600px]">
        {/* Pitch Lines Layout */}
        <div className="absolute inset-4 border-2 border-white/5 rounded-lg pointer-events-none flex flex-col justify-between">
          {/* Penalty box top */}
          <div className="w-1/2 h-20 border-b border-r border-l border-white/5 mx-auto relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 border-b border-r border-l border-white/5" />
          </div>
          {/* Halfway line */}
          <div className="w-full border-t border-white/5 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-white/5" />
          </div>
          {/* Penalty box bottom */}
          <div className="w-1/2 h-20 border-t border-r border-l border-white/5 mx-auto relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 border-t border-r border-l border-white/5" />
          </div>
        </div>

        {/* Pitch Grid Layout (Vertical Position Lanes) */}
        <div className="w-full h-full flex flex-col justify-between z-10 relative py-6">
          
          {/* Strikers Lane */}
          <div className="flex justify-center gap-10 items-center">
            {fwds.length > 0 ? (
              fwds.map(renderPlayerBadge)
            ) : (
              <span className="text-[10px] text-white/10 uppercase tracking-widest font-extrabold">Attackers Empty</span>
            )}
          </div>

          {/* Midfielders Lane */}
          <div className="flex justify-around gap-4 items-center">
            {mids.length > 0 ? (
              mids.map(renderPlayerBadge)
            ) : (
              <span className="text-[10px] text-white/10 uppercase tracking-widest font-extrabold">Midfielders Empty</span>
            )}
          </div>

          {/* Defenders Lane */}
          <div className="flex justify-around gap-4 items-center">
            {defs.length > 0 ? (
              defs.map(renderPlayerBadge)
            ) : (
              <span className="text-[10px] text-white/10 uppercase tracking-widest font-extrabold">Defenders Empty</span>
            )}
          </div>

          {/* Goalkeepers Lane */}
          <div className="flex justify-center items-center">
            {gks.length > 0 ? (
              gks.map(renderPlayerBadge)
            ) : (
              <div className="w-10 h-10 rounded-full border border-dashed border-white/10 flex items-center justify-center text-white/20 text-xs font-bold uppercase">
                GK
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
