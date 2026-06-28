"use client";

import React, { useState } from "react";
import { ArrowLeft, Clock, ShieldCheck, XCircle, ArrowRightLeft, Sparkles, Send, Trash2, ArrowRight } from "lucide-react";
import { Player, RoomPlayer } from "../types";
import { audio } from "../utils/audio";
import { motion, AnimatePresence } from "framer-motion";

interface TransferProposal {
  id: string;
  sender: string;
  receiver: string;
  send_player: Player | null;
  receive_player: Player | null;
  cash_adjustment: number; // positive if sender pays receiver
  status: "pending" | "accepted" | "rejected";
}

interface TransferViewProps {
  currentUsername: string;
  playersList: RoomPlayer[];
  proposals: TransferProposal[];
  onPropose: (data: {
    receiver: string;
    send_player: Player | null;
    receive_player: Player | null;
    cash: number;
  }) => void;
  onResolveOffer: (id: string, action: "accept" | "reject") => void;
  onFinishWindow: () => void;
}

export default function TransferView({
  currentUsername,
  playersList,
  proposals,
  onPropose,
  onResolveOffer,
  onFinishWindow,
}: TransferViewProps) {
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [myPlayerToTrade, setMyPlayerToTrade] = useState<Player | null>(null);
  const [theirPlayerToTrade, setTheirPlayerToTrade] = useState<Player | null>(null);
  const [cashAmount, setCashAmount] = useState(0);

  const me = playersList.find((p) => p.name === currentUsername);
  const isHost = me?.is_host || false;
  
  // Players that are not me
  const otherManagers = playersList.filter((p) => p.name !== currentUsername);
  const targetManagerProfile = otherManagers.find((p) => p.name === selectedReceiver);

  // Incoming proposals for me
  const incomingOffers = proposals.filter((p) => p.receiver === currentUsername && p.status === "pending");
  // Outgoing proposals sent by me
  const outgoingOffers = proposals.filter((p) => p.sender === currentUsername && p.status === "pending");

  const formatMoney = (val: number) => {
    return `€${(val / 1000000).toLocaleString()}M`;
  };

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceiver) {
      alert("Please select a target manager.");
      return;
    }
    if (!myPlayerToTrade && !theirPlayerToTrade && cashAmount === 0) {
      alert("Please add a player or cash component to trade.");
      return;
    }
    
    // Validate budget
    if (cashAmount > 0 && me && me.budget < cashAmount) {
      alert("You do not have enough budget for this offer.");
      return;
    }

    onPropose({
      receiver: selectedReceiver,
      send_player: myPlayerToTrade,
      receive_player: theirPlayerToTrade,
      cash: cashAmount,
    });

    // Reset fields
    setMyPlayerToTrade(null);
    setTheirPlayerToTrade(null);
    setCashAmount(0);
    audio.playClick();
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 relative z-10 select-none">
      
      {/* Header Info */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#00E676]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-black text-[#00E676] uppercase tracking-widest bg-[#00E676]/10 border border-[#00E676]/20 px-2.5 py-1 rounded-md">
            Marketplace Active
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mt-3">Transfer Window</h1>
          <p className="text-xs text-white/45 mt-1 font-medium">Review incoming swap contracts or propose custom deals with other club managers.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-slate-950/60 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-2 shadow-inner">
            <Clock className="w-4 h-4 text-[#00E676] animate-pulse" />
            <span className="text-xs font-black text-white uppercase tracking-wider">Trading Open</span>
          </div>

          {isHost && (
            <button
              onClick={() => {
                audio.playVictory();
                onFinishWindow();
              }}
              className="px-6 py-3.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(0,230,118,0.25)] hover:shadow-[0_10px_25px_rgba(0,230,118,0.4)] hover:scale-102 active:scale-98 transition-all text-xs cursor-pointer"
            >
              🏁 Close Transfers & Finalize
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Propose Trade Offer */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl h-fit">
          <h2 className="text-sm font-black text-[#FFD700] uppercase tracking-widest mb-6 border-b border-white/5 pb-3.5 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-[#FFD700] animate-pulse" /> Propose swap contract
          </h2>
          
          <form onSubmit={handlePropose} className="flex flex-col gap-5">
            
            {/* Target Manager */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Select Target Club</label>
              <select
                value={selectedReceiver}
                onChange={(e) => {
                  setSelectedReceiver(e.target.value);
                  setTheirPlayerToTrade(null);
                }}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-[#00E676] outline-none text-white font-bold px-3 py-3.5 rounded-xl text-xs cursor-pointer shadow-inner"
                required
              >
                <option value="">-- Choose Manager --</option>
                {otherManagers.map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name} (Budget: {formatMoney(p.budget)})</option>
                ))}
              </select>
            </div>

            {/* My Player to Trade */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Swap Component (You Send)</label>
              <select
                value={myPlayerToTrade ? myPlayerToTrade.name : ""}
                onChange={(e) => {
                  const p = me?.squad.find(f => f.name === e.target.value);
                  setMyPlayerToTrade(p || null);
                }}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-[#00E676] outline-none text-white font-bold px-3 py-3.5 rounded-xl text-xs cursor-pointer shadow-inner"
              >
                <option value="">-- Cash Only / No Player --</option>
                {me?.squad.map((f, idx) => (
                  <option key={idx} value={f.name}>{f.name} ({f.position} - OVR {f.rating})</option>
                ))}
              </select>
            </div>

            {/* Their Player to Trade */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Swap Component (You Receive)</label>
              <select
                value={theirPlayerToTrade ? theirPlayerToTrade.name : ""}
                onChange={(e) => {
                  const p = targetManagerProfile?.squad.find(f => f.name === e.target.value);
                  setTheirPlayerToTrade(p || null);
                }}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-[#00E676] outline-none text-white font-bold px-3 py-3.5 rounded-xl text-xs cursor-pointer shadow-inner"
                disabled={!selectedReceiver}
              >
                <option value="">-- Cash Only / No Player --</option>
                {targetManagerProfile?.squad.map((f, idx) => (
                  <option key={idx} value={f.name}>{f.name} ({f.position} - OVR {f.rating})</option>
                ))}
              </select>
            </div>

            {/* Cash Adjustment */}
            <div className="flex flex-col gap-2 bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Cash Adjustment component
              </label>
              <span className="text-[9px] text-white/30 block mb-2 font-medium">Positive if you pay target manager. Negative if they pay you.</span>
              <input
                type="number"
                placeholder="Euros in Millions (e.g. 10 for €10M)"
                onChange={(e) => setCashAmount(Number(e.target.value) * 1000000)}
                className="w-full bg-slate-950/80 border border-white/10 focus:border-[#00E676] outline-none text-white font-bold px-4 py-3 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black uppercase tracking-wider rounded-xl shadow-[0_4px_12px_rgba(0,230,118,0.2)] hover:scale-[1.02] active:scale-98 transition-all text-xs cursor-pointer mt-2"
            >
              Propose swap deal
            </button>
          </form>
        </div>

        {/* Column 2 & 3: Incoming & Outgoing Offers list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Incoming Offers */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl flex-1">
            <h2 className="text-sm font-black text-[#00E676] uppercase tracking-widest mb-6 border-b border-white/5 pb-3.5 flex items-center gap-1.5">
              📥 Review incoming offers ({incomingOffers.length})
            </h2>

            {incomingOffers.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-white/20 uppercase tracking-widest font-black">
                No Incoming Offers under review
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {incomingOffers.map((offer) => (
                  <div key={offer.id} className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-5 relative overflow-hidden group">
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                      <span className="font-black text-white">Offer from {offer.sender}</span>
                      <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-md uppercase font-black tracking-wider">
                        Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center text-xs relative my-1">
                      {/* You Send component */}
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5 items-center justify-center relative shadow-inner">
                        <span className="text-[8px] text-white/30 uppercase block font-black">You Send</span>
                        <span className="font-black text-white text-[13px] truncate max-w-full">
                          {offer.receive_player ? offer.receive_player.name : "None"}
                        </span>
                        {offer.receive_player && <span className="text-[9px] font-bold text-white/40">{offer.receive_player.position}</span>}
                      </div>

                      {/* Swap indicator arrow in middle */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-white/40 shadow-md">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>

                      {/* You Receive component */}
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5 items-center justify-center relative shadow-inner">
                        <span className="text-[8px] text-[#00E676]/45 uppercase block font-black">You Receive</span>
                        <span className="font-black text-[#00E676] text-[13px] truncate max-w-full">
                          {offer.send_player ? offer.send_player.name : "None"}
                        </span>
                        {offer.send_player && <span className="text-[9px] font-bold text-[#00E676]/60">{offer.send_player.position}</span>}
                      </div>
                    </div>

                    {/* Cash Considerations */}
                    <div className="flex justify-between items-center bg-slate-900/40 p-3.5 rounded-xl border border-white/5 text-xs font-semibold">
                      <span className="text-white/40 uppercase text-[8px] font-black">Cash Component:</span>
                      <span className={`font-black text-sm ${offer.cash_adjustment >= 0 ? "text-[#00E676]" : "text-red-400"}`}>
                        {offer.cash_adjustment >= 0 ? `+ ${formatMoney(offer.cash_adjustment)}` : `- ${formatMoney(Math.abs(offer.cash_adjustment))}`}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          audio.playHammer();
                          onResolveOffer(offer.id, "reject");
                        }}
                        className="flex-1 py-2.5 bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-500 font-black rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider hover:scale-102 active:scale-98"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() => {
                          audio.playCoin();
                          onResolveOffer(offer.id, "accept");
                        }}
                        className="flex-1 py-2.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-black rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider hover:scale-102 active:scale-98 shadow-[0_4px_12px_rgba(0,230,118,0.2)]"
                      >
                        <ShieldCheck className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Offers */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#0D1115]/90 shadow-2xl">
            <h2 className="text-[10px] font-black text-white/55 uppercase tracking-widest mb-4 border-b border-white/5 pb-2.5 flex items-center gap-1.5">
              📤 Outgoing Trade Offers Sent ({outgoingOffers.length})
            </h2>

            {outgoingOffers.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/20 uppercase tracking-widest font-black">
                No active outgoing offers
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {outgoingOffers.map((offer) => (
                  <div key={offer.id} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-sm">Offer to {offer.receiver}</span>
                        <span className="text-[10px] text-white/40 mt-1 font-bold">
                          {offer.send_player ? `Send: ${offer.send_player.name}` : ""} 
                          {offer.receive_player ? ` / Receive: ${offer.receive_player.name}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-sm text-[#00E676]">
                        {offer.cash_adjustment >= 0 ? `-${formatMoney(offer.cash_adjustment)}` : `+${formatMoney(Math.abs(offer.cash_adjustment))}`}
                      </span>
                      <span className="text-[8px] text-yellow-500 font-black bg-yellow-500/10 px-2.5 py-1 rounded-md border border-yellow-500/20 uppercase tracking-wider animate-pulse">
                        Awaiting Response
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
