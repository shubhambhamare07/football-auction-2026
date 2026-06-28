"use client";

import React, { useState } from "react";
import { ArrowLeft, Clock, ShieldCheck, XCircle, ArrowRightLeft } from "lucide-react";
import { Player, RoomPlayer } from "../types";
import { audio } from "../utils/audio";

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
    return (val / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "M";
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
    <div className="w-full max-w-7xl mx-auto py-6 px-4 relative z-10">
      
      {/* Header Info */}
      <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">Transfer Window</h1>
          <p className="text-xs text-white/50 mt-1">Review incoming offers before the deadline, or propose swap deals.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#1A2129] border border-[rgba(255,255,255,0.08)] px-4 py-2.5 rounded-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00E676] animate-pulse" />
            <span className="text-sm font-extrabold text-white">Window Open</span>
          </div>

          {isHost && (
            <button
              onClick={() => {
                audio.playVictory();
                onFinishWindow();
              }}
              className="px-6 py-2.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-extrabold rounded-lg shadow-lg hover:shadow-[#00E676]/20 transition-all text-xs cursor-pointer"
            >
              🏁 End Transfers & Match
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Propose Trade Offer */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 h-fit">
          <h2 className="text-lg font-bold text-[#FFD700] uppercase tracking-wider mb-4 border-b border-[rgba(255,255,255,0.04)] pb-2">
            🤝 Propose a Trade
          </h2>
          
          <form onSubmit={handlePropose} className="flex flex-col gap-4">
            
            {/* Target Manager */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Select Manager</label>
              <select
                value={selectedReceiver}
                onChange={(e) => {
                  setSelectedReceiver(e.target.value);
                  setTheirPlayerToTrade(null);
                }}
                className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-3 py-2.5 rounded-lg text-xs cursor-pointer"
                required
              >
                <option value="">-- Choose Manager --</option>
                {otherManagers.map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* My Player to Trade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">You Send (My Player)</label>
              <select
                value={myPlayerToTrade ? myPlayerToTrade.name : ""}
                onChange={(e) => {
                  const p = me?.squad.find(f => f.name === e.target.value);
                  setMyPlayerToTrade(p || null);
                }}
                className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-3 py-2.5 rounded-lg text-xs cursor-pointer"
              >
                <option value="">-- Cash Only / No Player --</option>
                {me?.squad.map((f, idx) => (
                  <option key={idx} value={f.name}>{f.name} ({f.position} - OVR {f.rating})</option>
                ))}
              </select>
            </div>

            {/* Their Player to Trade */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">You Receive (Their Player)</label>
              <select
                value={theirPlayerToTrade ? theirPlayerToTrade.name : ""}
                onChange={(e) => {
                  const p = targetManagerProfile?.squad.find(f => f.name === e.target.value);
                  setTheirPlayerToTrade(p || null);
                }}
                className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-3 py-2.5 rounded-lg text-xs cursor-pointer"
                disabled={!selectedReceiver}
              >
                <option value="">-- Cash Only / No Player --</option>
                {targetManagerProfile?.squad.map((f, idx) => (
                  <option key={idx} value={f.name}>{f.name} ({f.position} - OVR {f.rating})</option>
                ))}
              </select>
            </div>

            {/* Cash Adjustment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Cash Component (e.g. +10M if you pay, -10M if they pay)
              </label>
              <input
                type="number"
                placeholder="Euros in Millions (e.g. 5 for €5M)"
                onChange={(e) => setCashAmount(Number(e.target.value) * 1000000)}
                className="w-full bg-[#1A2129] border border-[rgba(255,255,255,0.08)] focus:border-[#00E676] outline-none text-white px-3.5 py-2.5 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-bold rounded-lg text-xs uppercase tracking-wider shadow-md cursor-pointer mt-2"
            >
              Send Trade Offer
            </button>
          </form>
        </div>

        {/* Column 2 & 3: Incoming & Outgoing Offers list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Incoming Offers */}
          <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80 flex-1">
            <h2 className="text-lg font-bold text-[#00E676] uppercase tracking-wider mb-4 border-b border-[rgba(255,255,255,0.04)] pb-2 flex items-center gap-1.5">
              📥 Incoming Trade Offers ({incomingOffers.length})
            </h2>

            {incomingOffers.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-white/20 uppercase tracking-widest font-semibold">
                No Incoming Offers under review
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomingOffers.map((offer) => (
                  <div key={offer.id} className="bg-[#1A2129] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                      <span className="font-bold text-white">Offer from {offer.sender}</span>
                      <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded uppercase font-bold">
                        Pending Review
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      {/* You Send (from sender's view, you send receive_player to them) */}
                      <div className="bg-[#141A21] p-3 rounded-lg border border-[rgba(255,255,255,0.03)] flex flex-col gap-1">
                        <span className="text-[9px] text-white/30 uppercase block">You Send</span>
                        <span className="font-extrabold text-white truncate">
                          {offer.receive_player ? offer.receive_player.name : "None"}
                        </span>
                        {offer.receive_player && <span className="text-[9px] text-white/40">{offer.receive_player.position}</span>}
                      </div>

                      {/* You Receive */}
                      <div className="bg-[#141A21] p-3 rounded-lg border border-[rgba(255,255,255,0.03)] flex flex-col gap-1">
                        <span className="text-[9px] text-white/30 uppercase block">You Receive</span>
                        <span className="font-extrabold text-[#00E676] truncate">
                          {offer.send_player ? offer.send_player.name : "None"}
                        </span>
                        {offer.send_player && <span className="text-[9px] text-[#00E676]/60">{offer.send_player.position}</span>}
                      </div>
                    </div>

                    {/* Cash Considerations */}
                    <div className="flex justify-between items-center bg-[#141A21] p-3 rounded-lg border border-[rgba(255,255,255,0.03)] text-xs">
                      <span className="text-white/40">Cash Adjustment:</span>
                      <span className={`font-extrabold ${offer.cash_adjustment >= 0 ? "text-[#00E676]" : "text-red-500"}`}>
                        {offer.cash_adjustment >= 0 ? `+ ${formatMoney(offer.cash_adjustment)}` : `- ${formatMoney(Math.abs(offer.cash_adjustment))}`}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          audio.playHammer();
                          onResolveOffer(offer.id, "reject");
                        }}
                        className="flex-1 py-2 bg-transparent hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-500 font-bold rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => {
                          audio.playCoin();
                          onResolveOffer(offer.id, "accept");
                        }}
                        className="flex-1 py-2 bg-[#00E676] hover:bg-[#00c853] text-[#0A0D10] font-bold rounded-lg text-xs cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Offers */}
          <div className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#12161A]/80">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 border-b border-[rgba(255,255,255,0.04)] pb-2 flex items-center gap-1.5">
              📤 Outgoing Trade Offers Sent ({outgoingOffers.length})
            </h2>

            {outgoingOffers.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/20 uppercase tracking-widest font-semibold">
                No active outgoing offers
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {outgoingOffers.map((offer) => (
                  <div key={offer.id} className="bg-[#1A2129]/60 border border-[rgba(255,255,255,0.04)] rounded-lg p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">Sent to {offer.receiver}</span>
                        <span className="text-[10px] text-white/40 mt-0.5">
                          {offer.send_player ? `Send ${offer.send_player.name}` : ""} 
                          {offer.receive_player ? ` / Receive ${offer.receive_player.name}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#00E676]">
                        {offer.cash_adjustment >= 0 ? `-${formatMoney(offer.cash_adjustment)}` : `+${formatMoney(Math.abs(offer.cash_adjustment))}`}
                      </span>
                      <span className="text-[9px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase">
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
