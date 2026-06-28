"use client";

import React, { useEffect, useState } from "react";
import { Download, Award, Flame, Tag, RefreshCw, Home, ChevronDown, ChevronUp, Sparkles, Coins, TrendingUp, Trophy } from "lucide-react";
import { audio } from "../utils/audio";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

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
    const duration = 6 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ["#00E676", "#FFD700", "#ffffff", "#2979FF"]
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ["#00E676", "#FFD700", "#ffffff", "#2979FF"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, [leaderboard]);

  const formatMoney = (val: number) => {
    return `€${(val / 1000000).toLocaleString()}M`;
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
    <div className="w-full max-w-6xl mx-auto py-12 px-4 relative z-10 select-none">
      
      {/* Title */}
      <div className="text-center mb-16">
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 text-[9px] font-black text-[#FFD700] uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full animate-pulse shadow-md"
        >
          🏆 Tournament Championship Hall of Fame
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-none mt-4 select-none"
        >
          Draft Finalized
        </motion.h1>
        <p className="text-sm text-white/50 mt-2 font-medium">
          The bidding wars have concluded. All squads are verified. Presenting your Champions.
        </p>
      </div>

      {/* 3D Podium for Top 3 */}
      <div className="flex flex-row items-end justify-center gap-4 sm:gap-6 mb-20 max-w-3xl mx-auto h-[260px] sm:h-[300px]">
        {/* 2nd Place */}
        {p2 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-300 bg-slate-800 flex items-center justify-center text-lg font-black text-white mb-2 uppercase shadow-lg select-none">
              {p2.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-xs sm:text-sm font-black text-white block truncate max-w-[100px]">{p2.name}</span>
              <span className="text-[10px] text-white/50 font-bold">{p2.score} pts</span>
            </div>
            {/* Metallic Silver gradient podium block */}
            <div className="w-full h-24 bg-gradient-to-t from-slate-700 via-slate-500 to-slate-400 border-t-2 border-slate-300 shadow-[0_0_20px_rgba(156,163,175,0.2)] rounded-t-2xl flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-100">2</span>
              <span className="text-[8px] font-black text-slate-200/50 uppercase tracking-widest mt-1">Silver</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Championship Center) */}
        {p1 && (
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="flex-1 flex flex-col items-center relative"
          >
            {/* Floating Gold Crown/Trophy above avatar */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute -top-12 z-20"
            >
              <Trophy className="w-9 h-9 text-[#FFD700] fill-[#FFD700]/10 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </motion.div>

            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-[#FFD700] bg-slate-800 flex items-center justify-center text-xl sm:text-2xl font-black text-white mb-2 uppercase shadow-[0_0_30px_rgba(255,215,0,0.35)] select-none relative z-10">
              {p1.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-sm sm:text-base font-black text-[#FFD700] text-glow-gold block truncate max-w-[120px]">{p1.name}</span>
              <span className="text-xs font-black text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.2)]">{p1.score} pts</span>
            </div>
            {/* Metallic Gold gradient podium block */}
            <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-yellow-600 via-amber-500 to-yellow-400 border-t-2 border-yellow-200 shadow-[0_0_30px_rgba(251,191,36,0.3)] rounded-t-2xl flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">1</span>
              <span className="text-[9px] font-black text-yellow-100/50 uppercase tracking-widest mt-1">Champion</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {p3 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-600 bg-slate-800 flex items-center justify-center text-base font-black text-white mb-2 uppercase shadow-lg select-none">
              {p3.name[0]}
            </div>
            <div className="text-center mb-2">
              <span className="text-xs sm:text-sm font-black text-white block truncate max-w-[100px]">{p3.name}</span>
              <span className="text-[10px] text-white/50 font-bold">{p3.score} pts</span>
            </div>
            {/* Metallic Bronze gradient podium block */}
            <div className="w-full h-20 bg-gradient-to-t from-amber-800 via-amber-700 to-amber-500 border-t-2 border-amber-400 shadow-[0_0_15px_rgba(180,83,9,0.15)] rounded-t-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-amber-100">3</span>
              <span className="text-[8px] font-black text-amber-200/50 uppercase tracking-widest mt-0.5">Bronze</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Session Highlights */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-[2px] w-6 bg-[#00E676]" />
          <h2 className="text-sm font-black text-[#00E676] uppercase tracking-widest">
            Champions Highlights
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Highlight 1 */}
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border border-white/5 relative overflow-hidden group hover:border-[#FFD700]/20 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Squad MVP</span>
              <span className="text-sm font-black text-white block mt-0.5">{p1?.highest_rated || "None"}</span>
              <span className="text-[10px] text-white/45 font-medium">Highest rated draft player</span>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border border-white/5 relative overflow-hidden group hover:border-[#00E676]/20 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shadow-inner">
              <Tag className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Smartest Bargain</span>
              <span className="text-sm font-black text-white block mt-0.5">{p1?.best_purchase || "None"}</span>
              <span className="text-[10px] text-[#00E676] font-bold">Highest OVR to Bid ratio</span>
            </div>
          </div>

          {/* Highlight 3 */}
          <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border border-white/5 relative overflow-hidden group hover:border-[#2979FF]/20 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/20 flex items-center justify-center text-[#2979FF] shadow-inner">
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Crown Jewel Draft</span>
              <span className="text-sm font-black text-white block mt-0.5">{p1?.most_expensive || "None"}</span>
              <span className="text-[10px] text-white/45 font-medium">Most expensive marquee signing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 mb-10 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Final Leaderboard Standings</h2>
          <button 
            onClick={() => {
              audio.playClick();
              alert("Tournament results exported successfully!");
            }}
            className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-white/30 uppercase font-black tracking-widest border-b border-white/5 pb-3.5 text-[9px]">
                <th className="pb-3 w-12 text-center">Rank</th>
                <th className="pb-3">Club Manager</th>
                <th className="pb-3 text-center">Squad Size</th>
                <th className="pb-3 text-center">Leftover Budget</th>
                <th className="pb-3 text-right">Final Standing</th>
                <th className="pb-3 w-12 text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => {
                const isExpanded = expandedRow === entry.name;
                const avgOvr = entry.squad_size > 0 ? (entry.total_rating / entry.squad_size).toFixed(1) : "0.0";
                
                return (
                  <React.Fragment key={entry.name}>
                    {/* Primary Row */}
                    <tr 
                      onClick={() => toggleRow(entry.name)}
                      className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-all ${
                        idx === 0 ? "bg-[#00E676]/5 text-[#00E676]" : "text-white/80"
                      }`}
                    >
                      <td className="py-4.5 text-center font-black">#{idx + 1}</td>
                      <td className="py-4.5 font-black text-sm flex items-center gap-2">
                        {entry.name}
                        {idx === 0 && <span className="text-[8px] bg-[#FFD700]/10 text-[#FFD700] px-2 py-0.5 rounded-md font-black border border-yellow-500/20 tracking-wider">WINNER</span>}
                      </td>
                      <td className="py-4.5 text-center font-bold">{entry.squad_size} / 15 players</td>
                      <td className="py-4.5 text-center font-bold">{formatMoney(entry.budget)}</td>
                      <td className="py-4.5 text-right font-black text-sm pr-1">{entry.score} pts</td>
                      <td className="py-4.5 text-center">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40 inline" /> : <ChevronDown className="w-4 h-4 text-white/40 inline" />}
                      </td>
                    </tr>

                    {/* Expanding details cards row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-950/40 border-b border-white/5 px-6 py-5">
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white/90 font-semibold"
                          >
                            
                            {/* Card 1: Team General stats */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Team Summary</span>
                              <div className="my-2">
                                <span className="text-xl font-black text-white block">{avgOvr} OVR</span>
                                <span className="text-[9px] text-white/40 font-bold">Average Squad Rating</span>
                              </div>
                              <span className="text-[9px] text-[#00E676] font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Base score: {entry.score - (entry.boosts_used?.filter(b => b === "Team Chemistry").length || 0) * 5} pts
                              </span>
                            </div>

                            {/* Card 2: Boosts Purchased */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Boosts Used</span>
                              <div className="my-2 flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                                {(!entry.boosts_used || entry.boosts_used.length === 0) ? (
                                  <span className="text-xs text-white/20">No boosts purchased</span>
                                ) : (
                                  entry.boosts_used.map((b, i) => (
                                    <span key={i} className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-black px-2 py-0.5 rounded-md">
                                      ⚡ {b.split(" (")[0]}
                                    </span>
                                  ))
                                )}
                              </div>
                              <span className="text-[9px] text-purple-400 font-bold">Total items: {entry.boosts_used?.length || 0}</span>
                            </div>

                            {/* Card 3: Best Steal Card */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Best Bargain</span>
                              <div className="my-2">
                                <span className="text-xs font-black text-white truncate block">{entry.best_purchase || "None"}</span>
                                <span className="text-[9px] text-[#00E676] font-bold block mt-0.5">High rating / low bid</span>
                              </div>
                              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Scouting report</span>
                            </div>

                            {/* Card 4: Most Expensive Card */}
                            <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between shadow-inner">
                              <span className="text-[8px] uppercase font-black text-white/40 tracking-wider block">Crown Jewel Signing</span>
                              <div className="my-2">
                                <span className="text-xs font-black text-[#FFD700] truncate block">{entry.most_expensive || "None"}</span>
                                <span className="text-[9px] text-white/40 block mt-0.5 font-bold">Highest bid purchase</span>
                              </div>
                              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Marquee player</span>
                            </div>

                          </motion.div>
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
          className="px-8 py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black rounded-xl shadow-[0_6px_20px_rgba(0,230,118,0.25)] hover:shadow-[0_10px_25px_rgba(0,230,118,0.4)] transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" /> Host New Tournament
        </button>
        <button
          onClick={() => {
            audio.playClick();
            onGoHome();
          }}
          className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98"
        >
          <Home className="w-4 h-4" /> Exit to Home
        </button>
      </div>

    </div>
  );
}
