export interface Player {
  name: string;
  country: string;
  position: string;
  rating: number;
  tier: string;
  fantasy_score: number;
  starting_price: number;
  boost_applied?: string;
}

export interface RoomPlayer {
  name: string;
  is_host: boolean;
  is_ready: boolean;
  budget: number;
  squad: Player[];
  boost_used: string | null;
  chemistry_score: number;
  boosts_purchased: string[];
  socket_id: string | null;
}

export interface RoomSettings {
  max_players: number;
  budget: number;
  timer_duration: number;
  boosts_enabled: boolean;
  transfers_enabled: boolean;
  auction_order: string;
  countries_count: number;
}

export interface Room {
  room_code: string;
  room_name: string;
  host_name: string;
  status: 'lobby' | 'auction' | 'transfers' | 'boosts' | 'completed';
  settings: RoomSettings;
  players: RoomPlayer[];
  chat_messages: any[];
}

export interface ChatMessage {
  sender: string;
  text: string;
  type: 'chat' | 'join' | 'leave' | 'bid' | 'transfer' | 'boost';
  timestamp: number;
}

export interface LiveBid {
  sender: string;
  amount: number;
  timestamp: number;
}
