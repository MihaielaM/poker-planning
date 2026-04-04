export type Participant = {
  id: string;
  name: string;
  isOnline: boolean;
  hasVoted: boolean;
  isVoter: boolean;
  vote?: string | null;
  isHighlight?: boolean;
};

export type Reaction = {
  participantName: string;
  emoji: string;
  createdAt: string;
};

export type RoomData = {
  room: {
    code: string;
    status: 'waiting' | 'revealed';
    roundNumber: number;
  };
  participants: Participant[];
  reactions: Reaction[];
};
