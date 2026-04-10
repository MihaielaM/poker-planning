'use client';

import { useState } from 'react';

const MESSAGES = [
  // Prea târziu
  "This room has left the building. Much like your sense of urgency.",
  "The team estimated, voted, and moved on. Without you.",
  "Gone. Like your chances of influencing this sprint.",
  "This room expired. So did everyone's patience waiting for you.",
  "The session ended. The retrospective already happened. The action items were ignored. You missed everything.",
  "Room not found. Neither was your punctuality.",
  "Everyone voted. Everyone left. The room was cleaned up. You're welcome.",
  "The estimates are in. The room is gone. You can go back to whatever you were doing.",
  "By the time you arrived, the team had already re-estimated, argued, and reached consensus. Twice.",
  "This room has been archived, much like the feature it was estimating.",
  "You are 404 hours late. Approximately.",
  "The Fibonacci sequence continues. This room does not.",
  "Sprint ended. Room deleted. Career: unaffected. Probably.",
  "This session concluded at a velocity you couldn't match.",
  "The team closed the room and opened a new ticket: 'Find missing participant'.",

  // Ironie despre estimări
  "The room was estimated to last forever. The estimate was wrong.",
  "Someone voted 1 point on 'how long this room would stay alive'. They were optimistic.",
  "This room's lifespan was underestimated by the entire team.",
  "Ironically, nobody estimated how long it would take you to get here.",
  "The room expired faster than a story point gets re-estimated.",
  "We gave the room 3 story points. It delivered. You didn't.",
  "This room moved at actual velocity, not planned velocity.",
  "The room's definition of done included 'participant shows up'. It was removed from acceptance criteria.",
  "Estimated room duration: 1 sprint. Actual: gone before you blinked.",
  "The room had better time management than most sprints. RIP.",
  "Plot twist: the room shipped on time. You did not.",

  // Scrum & Agile irony
  "This room is now in the 'Done' column. You're still in 'To Do'.",
  "The team completed the sprint. The room was closed. The backlog grows eternal.",
  "This room has been moved to the archive, which is Scrum for 'goodbye forever'.",
  "Room status: Done. Your status: Blocked.",
  "The standup was held, the blockers were identified, and you were one of them.",
  "This room reached its definition of done. You haven't reached the room.",
  "Sprint review happened. Sprint retro happened. Room was deleted. All without you.",
  "The velocity was high. Your arrival was not.",
  "Agile means adapting to change. The change is: this room is gone.",
  "The team self-organized without you. They were surprisingly efficient.",
  "This room was part of an epic that has since been completed and celebrated.",
  "Kanban rule: limit your work in progress. Apparently that included this room.",
  "The burndown chart burned all the way down. Including this room.",
  "User story: As a participant, I want to join before the room expires. Acceptance criteria: not met.",

  // Sarcasm prietenos
  "Oh, you wanted to join? That's adorable. The room had other plans.",
  "Good news: the team estimated without you. Bad news: see 'good news'.",
  "Don't worry, there's a new room somewhere. This one just isn't it.",
  "You found the room. The room, however, had already found the exit.",
  "This page exists. The room it refers to does not. Philosophy.",
  "The link worked perfectly. The room, less so.",
  "Technically you made it. Practically, you did not.",
  "Close, but in software estimation, 'close' still means 'wrong'.",
  "You're in the right place at the wrong time. Classic.",
  "The URL is correct. The timing is not.",
  "Your attendance has been noted. Your absence has been noted harder.",
  "The room remembers you. Just kidding. The room is gone.",
  "You came. You saw. The room had already conquered its expiry date.",
  "Better luck next sprint.",
  "The room is not lost. It's exactly where it was deleted.",

  // Planning poker specific
  "All cards have been played. Including the 'room exists' card.",
  "Someone played the ∞ card on room longevity. It was not accurate.",
  "The deck has been shuffled. The table has been folded. You can go home.",
  "Voting has closed. Results have been tallied. Room has been composted.",
  "The highest card was played, the lowest card was questioned, and the room was deleted.",
  "Everyone revealed their cards. The room revealed its expiry date.",
  "No more cards to play here. This hand is over.",
  "The joker has left the building. So has the room.",
  "The cards were dealt. The points were debated. The room expired mid-argument.",
  "Round 1: done. Round 2: done. Room: done. You: still arriving.",
  "The facilitator revealed the votes and then accidentally revealed the room too.",
  "Consensus was reached. The consensus was to delete this room.",
  "All participants voted. The room voted to leave as well.",
  "The average estimate for this room's existence was 0. The team was right.",

  // Existențial
  "What is a room but a temporary gathering of optimistic estimates?",
  "The room existed. Then it didn't. Much like sprint goals.",
  "Impermanence is the only constant in Scrum. And in rooms.",
  "You cannot step into the same planning session twice. — Agile Heraclitus",
  "The room was here. Now it is a memory. A very short memory.",
  "In the end, all rooms return to the void from which they came.",
  "Time is a flat circle. This room is a flat 404.",
  "Everything that has a creation date has a deletion date.",
  "The room completed its lifecycle and achieved moksha.",
  "Rooms, like user stories, must eventually be closed.",
  "To estimate is human. To expire is room.",
  "The universe tends toward entropy. So do planning sessions.",
  "This room has achieved the ultimate agile goal: it is finished.",
  "What remains after a room is deleted? The lessons. And the regret of arriving late.",
  "In planning poker, as in life, timing is everything.",

  // Self-aware / meta
  "You clicked a link to a room that no longer exists. Respect the commitment though.",
  "The fact that you're here means someone cared enough to send you a link. That person moved on.",
  "This URL once led somewhere meaningful. Today it leads here.",
  "You have successfully navigated to a deleted room. Achievement unlocked: 🏆 Fashionably Late.",
  "The link was alive when it was sent. Things change.",
  "Someone shared this link with you. They assumed you'd be faster.",
  "Error 404: Room not found. But your dedication to showing up? Found.",
  "The room held a moment of silence for your arrival. Then it expired.",
  "This is not the room you're looking for. Also, it's not anywhere.",
  "Your journey ends here. The room's journey ended earlier.",
  "The page loaded successfully. It just has nothing useful to show you.",
  "You typed the URL correctly. Or clicked the link. Either way, impressive effort for nothing.",
  "The room is unavailable. Like most things you need, exactly when you need them.",
  "Thank you for your interest in this room. It has since accepted a better offer.",
  "The room has moved on. We hope you will too.",

  // Misc funny
  "Gone in 24 hours. Faster than most sprint commitments.",
  "This room had a better completion rate than most features.",
  "Deleted. No retro, no ceremony. Just gone.",
  "The room didn't make it to the next sprint. Neither did the ticket it was estimating.",
  "If a room expires and nobody is there to see it, does it make a 404?",
  "Room: shipped. Memories: vague. You: late.",
  "This room retired early. It earned it.",
  "We regret to inform you that this room has been sunsetted.",
  "The room has been deprecated. Please migrate to a new room at your earliest convenience.",
  "This room is now legacy infrastructure.",
  "Room lifecycle: Created → Used → Forgotten → Deleted → You arrived.",
  "The room gave everything it had. Then it gave its expiry date.",
  "No room was harmed in the making of this 404. The room was harmed later.",
  "Some rooms live long lives. This one lived the right amount.",
  "This room completed its sprint and earned its place in the eternal backlog in the sky.",
];

export default function RoomExpired() {
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  return (
    <div className="min-h-screen bg-rd-dark flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="text-6xl mb-6">🃏</div>
        <h2 className="text-rd-yellow font-bold text-xl mb-4">Room not found</h2>
        <p className="text-rd-subtle text-base leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
