export type Participant = {
  id: string;
  name: string;
  isOnline: boolean;
  hasVoted: boolean;
  isVoter: boolean;
  vote?: string | null;
  isHighlight?: boolean;
};

export type RoomData = {
  room: {
    code: string;
    status: 'waiting' | 'revealed';
    roundNumber: number;
  };
  participants: Participant[];
  stats?: {
    average: number | null;
    nearestFibonacci: number | null;
    totalVoters: number;
  } | null;
};
