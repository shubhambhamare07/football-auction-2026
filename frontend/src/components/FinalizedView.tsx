"use client";

import React, { useEffect, useState } from "react";
import { Download, Award, Flame, Tag, RefreshCw, Home, ChevronDown, ChevronUp, Sparkles, Coins, TrendingUp } from "lucide-react";
import { audio } from "../utils/audio";
import confetti from "canvas-confetti";

interface LeaderboardEntry {
  name: string;
  score: number;
  budget: number;
  total_rating: number;
  captain: string | null;
  squad_size: number;
  boosts_used?: string[];
  best_purchase?: string;
  most_expensive?: string;
  highest_rated?: string;
}

interface FinalizedViewProps {
  leaderboard: LeaderboardEntry[];
  winnerName: string | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function FinalizedView({
  leaderboard,
  winnerName,
  onPlayAgain,
  onGoHome,
}: FinalizedViewProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Trigger victory sound and confetti upon loading
  useEffect(() => {
    audio.playVictory();
    audio.playCheer();
    
    // Auto-expand champion row by default
    if (leaderboard.length > 0) {
      setExpandedRow(leaderboard[0].name);
    }
    
    // Trigger confetti explosions
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#00E676", "#FFD700", "#ffffff"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#00E676", "#FFD700", "#ffffff"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, [leaderboard]);

  const formatMoney = (val: number) => {
    return (val / 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + "M";
  };

  const toggleRow = (name: string) => {
    audio.playPop();
    setExpandedRow(expandedRow === name ? null : name);
  };

  // Extract top 3 for podium
  const p1 = leaderboard[0];
  const p2 = leaderboard[1];
  const p3 = leaderboard[2];

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 relative z-10">
      
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full animate-pulse">
          🏆 Hall of Fame
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-none mt-4">
          Auction Finalized
        </h1>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mt-2">
          The dust has settled. Final standings for this session.
        </p>
      </div>

      {/* 3D Podium for Top 3 */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16 max-w-3xl mx-auto h-80">
        {/* 2nd Place */}
        {p2 && (
          <div className="flex-1 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-slate-400 bg-slate-800 flex items-center justify-center text-xl font-bold text-white mb-2 uppercase">
              {p2.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-sm font-bold text-white block">{p2.name}</span>
              <span className="text-[10px] text-white/50">{p2.score} pts</span>
            </div>
            <div className="w-full h-24 podium-2 rounded-t-lg flex items-center justify-center">
              <span className="text-3xl font-black text-slate-400">2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {p1 && (
          <div className="flex-1 flex flex-col items-center">
            {/* Crown cup icon */}
            <span className="text-3xl mb-1 animate-bounce">👑</span>
            <div className="w-20 h-20 rounded-full border-2 border-[#FFD700] bg-slate-800 flex items-center justify-center text-2xl font-bold text-white mb-2 uppercase shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              {p1.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-base font-black text-[#FFD700] text-glow-gold block">{p1.name}</span>
              <span className="text-xs font-bold text-[#00E676]">{p1.score} pts</span>
            </div>
            <div className="w-full h-36 podium-1 rounded-t-lg flex items-center justify-center">
              <span className="text-4xl font-black text-[#FFD700] text-glow-gold">1</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {p3 && (
          <div className="flex-1 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-amber-600 bg-slate-800 flex items-center justify-center text-lg font-bold text-white mb-2 uppercase">
              {p3.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-sm font-bold text-white block">{p3.name}</span>
              <span className="text-[10px] text-white/50">{p3.score} pts</span>
            </div>
            <div className="w-full h-20 podium-3 rounded-t-lg flex items-center justify-center">
              <span className="text-3xl font-black text-amber-600">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Session Highlights */}
      <div className="mb-16">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 border-l-4 border-[#00E676] pl-2.5">
          Champions Highlights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Highlight 1 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 bg-[#1A2129]/40 border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700]">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-white/40 uppercase block">Champion MVP</span>
              <span className="text-sm font-extrabold text-white block">{p1?.highest_rated || "None"}</span>
              <span className="text-xs font-semibold text-white/50">Highest OVR card</span>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 bg-[#1A2129]/40 border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <Tag className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-white/40 uppercase block">Smartest Steal</span>
              <span className="text-sm font-extrabold text-white block">{p1?.best_purchase || "None"}</span>
              <span className="text-xs font-semibold text-[#00E676]">Highest OVR / Price ratio</span>
            </div>
          </div>

          {/* Highlight 3 */}
          <div className="glass-card p-5 rounded-xl flex items-center gap-4 bg-[#2979FF]/10 border border-[#2979FF]/20">
            <div className="w-10 h-10 rounded-lg bg-[#2979FF]/10 flex items-center justify-center text-[#2979FF]">
              <Flame className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-white/40 uppercase block">Crown Jewel Signing</span>
              <span className="text-sm font-extrabold text-white block">{p1?.most_expensive || "None"}</span>
              <span className="text-xs font-semibold text-white/50">Most expensive transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 mb-10 overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">Final Leaderboard Standings</h2>
          <button 
            onClick={() => {
              audio.playClick();
              alert("Leaderboard exported successfully!");
            }}
            className="px-4 py-2 border border-[rgba(255,255,255,0.08)] bg-[#1A2129]/50 hover:bg-[#1A2129] text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-white/40 uppercase font-bold border-b border-white/5 pb-3">
                <th className="pb-3 w-12 text-center">Rank</th>
                <th className="pb-3">Manager</th>
                <th className="pb-3">Squad Size</th>
                <th className="pb-3">Remaining Budget</th>
                <th className="pb-3 text-right">Total Score</th>
                <th className="pb-3 w-12 text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isExpanded = expandedRow === entry.name;
                const avgOvr = entry.squad_size > 0 ? (entry.total_rating / entry.squad_size).toFixed(1) : "0.0";
                
                return (
                  <React.Fragment key={idx}>
                    {/* Primary Row */}
                    <tr 
                      onClick={() => toggleRow(entry.name)}
                      className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-all ${
                        idx === 0 ? "bg-[#00E676]/5 text-[#00E676] font-bold" : "text-white/80"
                      }`}
                    >
                      <td className="py-4 text-center font-black">#{idx + 1}</td>
                      <td className="py-4 font-bold flex items-center gap-2">
                        {entry.name}
                        {idx === 0 && <span className="text-[10px] bg-[#FFD700]/10 text-[#FFD700] px-1.5 py-0.5 rounded font-black border border-yellow-500/20">WINNER</span>}
                      </td>
                      <td className="py-4">{entry.squad_size} / 15 players</td>
                      <td className="py-4 font-semibold">{formatMoney(entry.budget)}</td>
                      <td className="py-4 text-right font-extrabold text-sm">{entry.score} pts</td>
                      <td className="py-4 text-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40 inline" /> : <ChevronDown className="w-4 h-4 text-white/40 inline" />}
                      </td>
                    </tr>

                    {/* Expanding details cards row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-black/25 border-b border-white/5 px-6 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white/90">
                            
                            {/* Card 1: Team General stats */}
                            <div className="bg-[#1A2129]/70 border border-white/5 p-4 rounded-lg flex flex-col justify-between">
                              <span className="text-[9px] uppercase font-bold text-white/45 tracking-wider block">Team Summary</span>
                              <div className="my-2">
                                <span className="text-xl font-extrabold text-white block">{avgOvr} OVR</span>
                                <span className="text-[10px] text-white/40">Average Squad Rating</span>
                              </div>
                              <span className="text-[9px] text-[#00E676] font-semibold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Base score: {entry.score - (entry.boosts_used?.filter(b => b === "Team Chemistry").length || 0) * 5} pts
                              </span>
                            </div>

                            {/* Card 2: Boosts Purchased */}
                            <div className="bg-[#1A2129]/70 border border-white/5 p-4 rounded-lg flex flex-col justify-between">
                              <span className="text-[9px] uppercase font-bold text-white/45 tracking-wider block">Boosts Used</span>
                              <div className="my-2 flex flex-wrap gap-1">
                                {(!entry.boosts_used || entry.boosts_used.length === 0) ? (
                                  <span className="text-xs text-white/20">No boosts purchased</span>
                                ) : (
                                  entry.boosts_used.map((b, i) => (
                                    <span key={i} className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-extrabold px-1.5 py-0.5 rounded">
                                      ⚡ {b.split(" (")[0]}
                                    </span>
                                  ))
                                )}
                              </div>
                              <span className="text-[9px] text-purple-400 font-semibold">Total items: {entry.boosts_used?.length || 0}</span>
                            </div>

                            {/* Card 3: Best Steal Card */}
                            <div className="bg-[#1A2129]/70 border border-white/5 p-4 rounded-lg flex flex-col justify-between">
                              <span className="text-[9px] uppercase font-bold text-white/45 tracking-wider block">Best Bargain</span>
                              <div className="my-2">
                                <span className="text-xs font-black text-white truncate block">{entry.best_purchase || "None"}</span>
                                <span className="text-[9px] text-[#00E676] font-bold block mt-0.5">High rating / low bid</span>
                              </div>
                              <span className="text-[9px] text-white/30">Authoritative analysis</span>
                            </div>

                            {/* Card 4: Most Expensive Card */}
                            <div className="bg-[#1A2129]/70 border border-white/5 p-4 rounded-lg flex flex-col justify-between">
                              <span className="text-[9px] uppercase font-bold text-white/45 tracking-wider block">Most Expensive Player</span>
                              <div className="my-2">
                                <span className="text-xs font-black text-[#FFD700] truncate block">{entry.most_expensive || "None"}</span>
                                <span className="text-[9px] text-white/40 block mt-0.5">Highest bid purchase</span>
                              </div>
                              <span className="text-[9px] text-white/30">Marquee player</span>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => {
            audio.playClick();
            onPlayAgain();
          }}
          className="px-8 py-3.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-extrabold rounded-lg shadow-lg hover:shadow-[#00E676]/25 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" /> Host New Tournament
        </button>
        <button
          onClick={() => {
            audio.playClick();
            onGoHome();
          }}
          className="px-8 py-3.5 bg-[#1A2129] border border-[rgba(255,255,255,0.08)] hover:bg-[#202933] text-white font-bold rounded-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Home className="w-4 h-4" /> Exit to Home
        </button>
      </div>

    </div>
  );
}
