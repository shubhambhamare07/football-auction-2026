"use client";

import React from "react";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { audio } from "../utils/audio";

interface HomeViewProps {
  onCreateRoomClick: () => void;
  onJoinRoomClick: () => void;
}

export default function HomeView({ onCreateRoomClick, onJoinRoomClick }: HomeViewProps) {
  const triggerClick = (cb: () => void) => {
    audio.playClick();
    cb();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4 md:px-8 relative overflow-hidden pitch-grid">
      {/* Glow Ambient */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00E676]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-4xl text-center z-10 flex flex-col items-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 uppercase leading-none"
        >
          Build Your Dream Team.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-[#FFD700] text-glow-green">
            Win The Auction.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-[rgba(255,255,255,0.65)] max-w-2xl leading-relaxed mb-10"
        >
          The most immersive multiplayer football auction experience is here. Outbid
          your rivals, secure legendary talent, and dominate the virtual pitch.
        </motion.p>

        {/* Hero Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <button
            onClick={() => triggerClick(onCreateRoomClick)}
            className="w-full sm:w-auto px-8 py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-bold rounded-lg shadow-lg hover:shadow-[#00E676]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            ⚽ Create Room
          </button>
          <button
            onClick={() => triggerClick(onJoinRoomClick)}
            className="w-full sm:w-auto px-8 py-4 bg-[rgba(20,26,33,0.8)] hover:bg-[rgba(20,26,33,1)] border border-[rgba(255,255,255,0.08)] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Join Room
          </button>
          <a
            href="#how-to-play"
            className="text-white/70 hover:text-white transition-colors flex items-center gap-1 font-semibold text-sm cursor-pointer mt-4 sm:mt-0"
            onClick={() => audio.playClick()}
          >
            How To Play <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      {/* Elite Features Section */}
      <div className="w-full max-w-6xl z-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-8 border-l-4 border-[#00E676] pl-3 uppercase">
          Elite Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#00E676]/10 flex items-center justify-center text-[#00E676]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Real-time Bidding</h3>
            <p className="text-sm text-[rgba(255,255,255,0.55)] leading-relaxed">
              Experience the adrenaline of live auctions. Compete against managers
              worldwide in sub-second bidding wars to secure top-tier talent.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Global Leaderboards</h3>
            <p className="text-sm text-[rgba(255,255,255,0.55)] leading-relaxed">
              Climb the ranks by assembling the most valuable squads. Prove your
              scouting prowess and strategic mastery on the world stage.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-xl flex flex-col gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#2979FF]/10 flex items-center justify-center text-[#2979FF]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Ultimate Team Management</h3>
            <p className="text-sm text-[rgba(255,255,255,0.55)] leading-relaxed">
              Balance your budget, manage player chemistry, and adapt your tactics.
              Every bid shapes the destiny of your franchise.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Section Anchor */}
      <div id="how-to-play" className="w-full max-w-6xl mt-24 z-10 glass-card p-8 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/40">
        <h2 className="text-xl font-bold text-white mb-4 uppercase">How To Play</h2>
        <ul className="list-disc pl-6 text-sm text-[rgba(255,255,255,0.6)] space-y-2 leading-relaxed">
          <li>Create or join a private room using a 6-character access code.</li>
          <li>Each manager starts with a virtual budget (€500 Million by default).</li>
          <li>Bid on randomly served world-class players. Tier S starting values are highest.</li>
          <li>Apply one Boost Card (Captain, Playmaker, etc.) to double or increase points.</li>
          <li>Once rosters are completed, squads are placed on the virtual pitch.</li>
          <li>The manager with the highest total squad Fantasy Points wins the championship trophy instantly!</li>
        </ul>
      </div>
    </div>
  );
}
