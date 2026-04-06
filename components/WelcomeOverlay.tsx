'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  // Estimare & story points
  "Welcome! Time to pretend you know how long things take.",
  "Your estimates are about to disappoint everyone equally.",
  "Remember: 1 story point = 1 unit of pure optimism.",
  "Spoiler: whatever you pick, the answer is probably 8.",
  "Please round all estimates to the nearest 'forever'.",
  "Today's forecast: 2 points of complexity with a 90% chance of scope creep.",
  "Fun fact: no estimate in history has ever been correct. Good luck.",
  "The correct answer is always 'it depends'. Unfortunately, that's not a card.",
  "Your mission, should you choose to accept it: lie convincingly about deadlines.",
  "Welcome to the place where 'simple change' goes to die.",
  "If in doubt, pick 13. If still in doubt, also pick 13.",
  "Pro tip: your gut feeling is wrong. Your gut is always wrong.",
  "Velocity is just a fancy word for 'how wrong were we last sprint'.",
  "Story points don't measure time. They measure suffering.",
  "You will now collectively hallucinate a delivery date.",
  "Fibonacci sequence: nature's way of saying 'this will take longer'.",
  "Today we estimate. Tomorrow we cry. The day after we re-estimate.",
  "Please silence your impostor syndrome for the duration of this session.",
  "All estimates are correct. Just not in this timeline.",
  "Warning: estimating may cause sudden onset of over-confidence.",

  // Sarcasm about complexity
  "Oh, you thought this would be simple? Adorable.",
  "It's always a 5 until someone opens the Jira ticket.",
  "Someone is about to say 'just a small change' and ruin everyone's day.",
  "The backend team would like you to know they disagree with everything in advance.",
  "Technically, it's already been estimated. Just incorrectly.",
  "This looks like a 2. It is not a 2.",
  "Plot twist: the ticket description is missing half the requirements.",
  "Someone in this room has no idea what this feature does. They will vote first.",
  "Don't worry, we'll figure out the edge cases in production.",
  "It's not legacy code, it's 'organically grown architecture'.",
  "Complexity is just simplicity with more meetings.",
  "The real story points were the meetings we had along the way.",
  "Bold of you to assume the requirements won't change mid-sprint.",
  "This feature already exists. In a different repo. Differently.",
  "Someone will say '1 point' and everyone will silently judge them.",

  // Team dynamics
  "Please vote your conscience, not your trauma.",
  "Remember: there are no wrong answers. Only wrong estimates.",
  "The person who voted 1 will be asked to justify themselves. Aggressively.",
  "Your team's average estimate will haunt your standup for weeks.",
  "Whoever votes highest wins the privilege of being right and hated.",
  "Consensus is just peer pressure with a Fibonacci sequence.",
  "Today's agenda: argue about points, avoid actual work.",
  "Fun game: guess who copied their vote from the last person.",
  "We're all professionals here. Except for our estimates.",
  "The quiet ones always have the highest estimates. Listen to them.",
  "If everyone votes the same, it means either clarity or shared confusion.",
  "Voting anonymously removes shame. The shame remains.",
  "Let's reach consensus by exhausting everyone into agreement.",
  "The PM is watching. Estimate calmly.",
  "After this session, someone will say 'we need more refinement'. That someone is right.",

  // Deadlines & delivery
  "Your estimate will be turned into a commitment by someone above your pay grade.",
  "Fun fact: 'done' has a different definition for every person in this call.",
  "Whatever you estimate today becomes the release date by Tuesday.",
  "Remember: Q4 is just Q3 with more excuses.",
  "The deadline was yesterday. The estimate is still needed.",
  "This sprint's goal: estimate realistically and watch it ignored.",
  "The roadmap needs this by end of sprint. The sprint ends Friday. Today is Thursday.",
  "No pressure, but this is blocking three other teams.",
  "A 'quick win' feature that will outlive everyone on this call.",
  "Estimate like nobody's watching. Because the PM is watching.",
  "This ticket has been in the backlog since 2022. No rush though.",
  "We ship fast. We just can't guarantee it works.",
  "Agile means we're wrong on a rolling two-week basis.",
  "The customer wants it yesterday. Please estimate accordingly.",
  "Ship early, ship often, apologize forever.",

  // Bugs & tech debt
  "Consider: what if we just don't fix this and see what happens?",
  "This ticket will spawn four child tickets and a heated debate.",
  "Technical debt is just future-you's problem. Vote low.",
  "There's a bug in here somewhere. We just haven't found it yet.",
  "Every 1-point ticket contains at least one 8-point surprise.",
  "The system works. We just don't know why.",
  "This will be done in 2 points or 2 weeks. No in-between.",
  "If it breaks in production, it wasn't estimated by you. Probably.",
  "Refactoring is just adding complexity until it feels clean.",
  "The tests are optional. The bugs are not.",
  "We don't have a bug tracker. We have a 'feature backlog'.",
  "It works on localhost. Ship it.",
  "The logs say it's fine. The logs lie.",
  "Someone added 'add unit tests' to the acceptance criteria. That someone is brave.",
  "Undocumented behavior is just a hidden feature waiting to be discovered.",

  // Meetings & process
  "This meeting could have been a story point.",
  "Refinement: where good tickets come to be misunderstood.",
  "We could have shipped something in the time it took to estimate it.",
  "Two hours of meetings to save 30 minutes of coding. Math checks out.",
  "Agile ceremony: where we celebrate the illusion of control.",
  "The real sprint planning was the friends we argued with along the way.",
  "Groomig session #4 on the same ticket. The ticket remains unchanged.",
  "This session will achieve consensus right before someone says 'actually...'.",
  "We've aligned on misalignment. Progress!",
  "The retro will fix this. The retro has never fixed anything.",

  // Philosophy & existential
  "A story point is a unit of collective self-deception.",
  "Time is a flat circle. Your backlog is a flat square.",
  "In the beginning there was the ticket. And it was vague.",
  "All estimation is prediction. All prediction is optimism wearing a suit.",
  "The uncertainty principle: the more accurately you estimate, the less you understand.",
  "What is a sprint but a structured way to disappoint a PM?",
  "Complexity is not discovered. It is revealed by the ticket assignee on day 3.",
  "You may estimate anything. You may not estimate accurately.",
  "Somewhere, a developer is already refactoring your estimate.",
  "The answer is not 42. The answer is 'needs more context'.",
  "Effort and complexity are not the same. Neither is your estimate.",
  "All estimates are lies. Some lies are more useful than others.",
  "Software is never done. Just differently incomplete.",
  "A feature is only truly complete when the next ticket references it as 'the old approach'.",
  "You are not estimating duration. You are estimating regret.",

  // Misc fun
  "May your velocity be high and your blockers zero.",
  "Pick a number. Any number. It's wrong.",
  "Welcome! Coffee not included. Estimation anxiety is free.",
  "Before you vote: breathe. After you vote: apologize.",
  "This session is proudly sponsored by optimism and deadlines.",
  "First time estimating? Don't worry. The seasoned folks are also guessing.",
  "You are now part of an estimation ceremony. Dress code: imposter syndrome.",
  "Points are just feelings with numbers attached.",
  "Nobody knows anything. Vote anyway.",
  "This ticket will be re-estimated at least twice more. Enjoy round one.",
  "The answer to '1 or 2?' is usually 5.",
  "Overthinking this? Good. That's the spirit.",
  "Your estimate has been noted. It will not be respected.",
  "Good luck. You'll need it. We all need it.",
];

const DISPLAY_MS = 4500;
const FADE_MS = 600;

export default function WelcomeOverlay({ name }: { name: string }) {
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), DISPLAY_MS);
    const removeTimer = setTimeout(() => setVisible(false), DISPLAY_MS + FADE_MS);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-[600ms] ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={() => setFading(true)}
    >
      <div
        className="relative bg-rd-surface border border-rd-border-2 rounded-2xl px-8 py-7 max-w-lg w-full text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setFading(true)}
          className="absolute top-3 right-4 text-rd-muted hover:text-white text-lg leading-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Icon */}
        <div className="text-4xl mb-3">🃏</div>

        {/* Greeting */}
        <p className="text-rd-yellow font-semibold text-lg mb-1">
          Hey, {name}!
        </p>

        {/* Message */}
        <p className="text-white text-base leading-relaxed mb-4">
          {message}
        </p>

        {/* Countdown bar */}
        <div className="h-0.5 bg-rd-border rounded-full overflow-hidden">
          <div
            className="h-full bg-rd-yellow origin-left"
            style={{
              animation: `shrink ${DISPLAY_MS}ms linear forwards`,
            }}
          />
        </div>

        <style>{`
          @keyframes shrink {
            from { transform: scaleX(1); }
            to   { transform: scaleX(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
