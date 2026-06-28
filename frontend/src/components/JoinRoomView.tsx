"use client";

import React, { useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { audio } from "../utils/audio";

interface JoinRoomViewProps {
  onBack: () => void;
  onJoinRoom: (displayName: string, roomCode: string) => void;
}

export default function JoinRoomView({ onBack, onJoinRoom }: JoinRoomViewProps) {
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert("Please enter a Display Name.");
      return;
    }
    if (roomCode.trim().length < 6) {
      alert("Please enter a valid 6-character Room Code.");
      return;
    }
    audio.playClick();
    onJoinRoom(displayName.trim(), roomCode.trim().toUpperCase());
  };

  const triggerClick = (cb: () => void) => {
    audio.playClick();
    cb();
  };

  return (
    <div className="w-full max-w-md mx-auto py-16 px-4 relative z-10">
      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#12161A]/80 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tight">
            Join the Auction
          </h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            Enter a room code to start bidding.
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-5">
          {/* Display Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
              👤 Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Manager 402"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-4 py-3 rounded-lg text-sm transition-all"
              required
            />
          </div>

          {/* Room Code */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#FFD700] uppercase tracking-wider">
              🎟️ Room Code
            </label>
            <input
              type="text"
              placeholder="XXXX-XXXX"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-4 py-3 rounded-lg text-sm tracking-widest text-center font-bold uppercase transition-all"
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-extrabold rounded-lg shadow-lg hover:shadow-[#00E676]/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            Join Room <Play className="w-4 h-4 fill-current" />
          </button>

          {/* Secondary Actions */}
          <div className="flex flex-col gap-3 items-center mt-2">
            <button
              type="button"
              onClick={() => triggerClick(onBack)}
              className="text-xs text-[rgba(255,255,255,0.5)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </button>
            
            <span className="text-[10px] text-[rgba(255,255,255,0.3)] mt-2">
              Browse Live Rooms
            </span>
          </div>
        </form>

      </div>
    </div>
  );
}
