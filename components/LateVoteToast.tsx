'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  // Prea târziu, prietene
  "Bold move. The votes are already on the table.",
  "Noted. Still wrong. Still too late.",
  "The reveal happened. Your regret is valid. Your vote is not.",
  "Ah yes, the classic post-reveal confidence.",
  "Voting is closed. Your feelings about that are open.",
  "The cards have been shown. Your conscience has not.",
  "Too late. But points for trying.",
  "The votes are in. The damage is done.",
  "Retroactive voting: not a Scrum ceremony.",
  "The reveal happened without asking for your permission. Interesting.",
  "Your vote has been noted and completely ignored.",
  "Nice try. The round disagrees.",
  "The round is over. So is your chance.",
  "Spoiler: this doesn't count.",
  "You can click all you want. The estimate won't change.",

  // Prea des văzut
  "Ah. The classic 'now I see what everyone else voted' strategy.",
  "Suddenly everyone's a 5. Fascinating.",
  "The majority voted 8 and now you also vote 8. Courage.",
  "Post-reveal consensus: where honesty goes to retire.",
  "Amazing how your estimate aligns with the majority right after the reveal.",
  "You didn't vote 5 before. But sure, 5 sounds great now.",
  "Everyone voted 3 and suddenly 3 is your favorite number.",
  "Your estimate has evolved since seeing the others'. Growth.",
  "Oh interesting, you agree with everyone now. That's new.",
  "Pre-reveal: 1. Post-reveal: 8. The learning journey continues.",
  "Nothing changes an estimate quite like seeing everyone else's estimate.",
  "You've recalibrated. The round has not.",
  "Hindsight is 20/20 and also not a valid story point.",
  "Post-reveal voting: the peer pressure olympics.",
  "You're not changing your vote. You're just expressing solidarity.",

  // Filosofie & Scrum
  "Votes, like sprints, cannot be undone.",
  "The round is revealed. What is revealed cannot be unrevealed.",
  "Schrödinger's vote: valid until observed. Observed.",
  "The estimation ceremony is complete. Please do not disturb the ceremony.",
  "In agile, we embrace change. Except in already-revealed votes.",
  "The sprint is done. The vote is done. You are also done.",
  "This is the retro phase. Except there's no retro for votes.",
  "What's done is done. What's estimated is estimated.",
  "Story points are immutable once revealed. Like history. Like your original vote.",
  "The universe does not accept retroactive estimates.",

  // Sarcasm pur
  "Your original vote was brave. This one is just diplomacy.",
  "Changing your vote after the reveal is just expensive agreement.",
  "Ah, post-reveal math. The numbers work out so much better now.",
  "The round has been closed. Please close your tabs accordingly.",
  "You voted. It was wrong. We move on. That's Scrum.",
  "The team saw your original vote. They will not forget.",
  "You had one job. You did it. Now it's done.",
  "The moment has passed. Much like your original confidence.",
  "Your first instinct was honest. This one is social.",
  "The vote is revealed. The revision is rejected.",
  "Clicking again won't help. But it's good exercise.",
  "Still no.",
  "Still no. (And we respect the persistence.)",
  "The round heard you the first time.",
  "Persistence is a virtue. In voting, it's just noise.",

  // Planning poker specific
  "All cards on the table. Including your original one.",
  "The deck has been read. No re-shuffles allowed.",
  "Your card was played. The hand is over.",
  "You can't un-flip a card. Not even a metaphorical one.",
  "The facilitator has revealed. The facilitator does not un-reveal.",
  "The cards have spoken. They will not be speaking again this round.",
  "Round closed. Votes locked. Regrets: unlimited.",
  "Your card is face-up. Your face is unreadable. The vote stands.",
  "The round saw your real estimate. It was noted.",
  "You played your card. The game noticed.",
  "Consensus reached without your amendment. Impressive.",
  "The average has been calculated. Your revision is not included.",
  "The recommended Fibonacci number has been found. Without your help.",
  "The votes are revealed. The truth is out. The round is closed.",
  "Poker face: too late. The cards are already shown.",

  // Self-aware / meta
  "We see you. We appreciate the effort. We don't count the vote.",
  "This is a judgment-free zone. Except for post-reveal voting.",
  "Your original estimate is canon now. Embrace it.",
  "The team knows your real number. This new one fools nobody.",
  "History has recorded your initial vote. History is uneditable.",
  "Your vote is part of the official record. The official record is final.",
  "Somewhere, a velocity chart has already included your original estimate.",
  "The sprint board shows your real vote. The sprint board doesn't lie.",
  "You can change your mind. You cannot change the reveal.",
  "The round saw the real you. The real you voted differently.",

  // Existențial & dramatic
  "It's too late. It was always going to be too late.",
  "The votes have been cast into the eternal void of revealed rounds.",
  "What is done in a sprint cannot be undone in a sprint.",
  "The estimation has passed into history. History does not accept pull requests.",
  "This vote, like all late votes, exists only in the imagination.",
  "Time, like sprint capacity, is finite. Both have run out.",
  "The round is a closed chapter in the story of this sprint.",
  "Your vote has already contributed to the collective delusion. It cannot be recalled.",
  "This estimate is now past tense. You are still in present tense. Philosophically complex.",
  "The moment has been committed. It cannot be amended.",

  // Amuzante
  "Nice try. 0 points for effort. Which is ironic, given the context.",
  "The round ended. Your clicking continues. Respect.",
  "You've discovered the 'vote after reveal' button. It does nothing. Welcome.",
  "That card doesn't work right now. Try again next round.",
  "Insert coin to change vote. No coins accepted.",
  "Error 418: Vote too late. I'm a teapot. Short and stout.",
  "The estimate machine is not accepting new inputs at this time.",
  "Voting booth closed. Please try again next sprint.",
  "Thank you for your vote. It has been warmly received and immediately discarded.",
  "Your enthusiasm for this number is noted and appreciated and irrelevant.",
  "The vote you're looking for is in another round.",
  "Achievement unlocked: 🏆 Voted after reveal. 0 times counted.",
  "This card says: not this round, buddy.",
  "You've voted. You've re-voted. You've post-reveal voted. Impressive trilogy.",
  "The round is closed. The irony of clicking is fully open.",

  // Short & punchy
  "Nope.",
  "Too late.",
  "Adorable. Doesn't count.",
  "Nice. Not valid.",
  "The round disagrees.",
  "Already revealed. Already done.",
  "That ship has sailed and been estimated.",
  "The number you wanted is no longer available.",
  "Round: closed. Vote: irrelevant. Carry on.",
  "The reveal cannot be un-revealed.",
  "Your vote was. Now it just is.",
  "The estimate is final. You are not.",
];

const DISPLAY_MS = 4000;
const FADE_MS = 500;

type Props = { onDone: () => void };

export default function LateVoteToast({ onDone }: Props) {
  const [fading, setFading] = useState(false);
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), DISPLAY_MS);
    const removeTimer = setTimeout(() => onDone(), DISPLAY_MS + FADE_MS);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center pb-10 px-4 pointer-events-none transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="pointer-events-auto bg-rd-surface border border-rd-border-2 rounded-2xl px-5 py-4 max-w-sm w-full shadow-2xl flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🃏</span>
        <p className="text-white text-sm leading-relaxed flex-1">{message}</p>
        <button
          onClick={() => { setFading(true); setTimeout(onDone, FADE_MS); }}
          className="text-rd-muted hover:text-white text-lg leading-none flex-shrink-0 transition-colors mt-0.5"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
