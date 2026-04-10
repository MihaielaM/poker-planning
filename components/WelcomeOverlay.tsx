'use client';

import { useState } from 'react';
import JesterHat from './JesterHat';

const MESSAGES = [
  // Estimare & story points
  "Welcome! Time to pretend you know how long things take.",
  "Your estimates are about to disappoint everyone equally.",
  "Remember: 1 story point = 1 unit of pure optimism.",
  "Spoiler: whatever you pick, the answer is probably 8.",
  "Please round all estimates to the nearest 'forever'.",
  "Fun fact: no estimate in history has ever been correct. Good luck.",
  "The correct answer is always 'it depends'. Unfortunately, that's not a card.",
  "Welcome to the place where 'simple change' goes to die.",
  "If in doubt, pick 13. If still in doubt, also pick 13.",
  "Pro tip: your gut feeling is wrong. Your gut is always wrong.",
  "Velocity is just a fancy word for 'how wrong were we last sprint'.",
  "Story points don't measure time. They measure suffering.",
  "Fibonacci sequence: nature's way of saying 'this will take longer'.",
  "Today we estimate. Tomorrow we cry. The day after we re-estimate.",
  "Please silence your impostor syndrome for the duration of this session.",
  "All estimates are correct. Just not in this timeline.",
  "Warning: estimating may cause sudden onset of over-confidence.",
  "The Fibonacci sequence wasn't designed for software. We adopted it anyway.",
  "A story point is worth exactly as much as your team agrees it is. So nothing.",
  "Velocity measures how fast you're going in the wrong direction.",
  "Sprint capacity is theoretical. Scope creep is very, very real.",
  "Story points: because 'I have no idea' needed a number attached to it.",
  "Your estimate today is tomorrow's 'we underestimated this'.",
  "There is no spoon. There is no accurate estimate either.",
  "Every story point you vote is a small act of hope. Hope is irrational.",

  // Sarcasm about complexity
  "Oh, you thought this would be simple? Adorable.",
  "It's always a 5 until someone opens the Jira ticket.",
  "Someone is about to say 'just a small change' and ruin everyone's day.",
  "The backend team would like you to know they disagree with everything in advance.",
  "Technically, it's already been estimated. Just incorrectly.",
  "This looks like a 2. It is not a 2.",
  "Plot twist: the ticket description is missing half the requirements.",
  "Someone in this room has no idea what this feature does. They will vote first.",
  "Complexity is just simplicity with more meetings.",
  "Bold of you to assume the requirements won't change mid-sprint.",
  "This feature already exists. In a different repo. Differently.",
  "Someone will say '1 point' and everyone will silently judge them.",
  "The requirements are clear to whoever wrote them. Nobody else.",
  "Every 'simple' ticket is simple the way a knot is simple.",
  "'It's basically done' — famous last words before a 13-point vote.",
  "The ticket says 2 points. The ticket is lying.",
  "Acceptance criteria: the part everyone reads after they're already done.",
  "The simplest solution is always obvious after the sprint review.",
  "Scope is fluid. Estimates are not. This is the fundamental contradiction.",
  "If you can describe the feature in one sentence, you're missing at least three sentences.",
  "The edge cases are not edge cases. They are the entire feature.",
  "This looks straightforward. In Scrum, that's a red flag.",
  "Somewhere, a PO is describing this ticket as 'self-explanatory'.",
  "The integration is simple. Until you actually integrate.",
  "Every 1-point vote in this room will be explained at length in the next standup.",

  // Team dynamics
  "Please vote your conscience, not your trauma.",
  "Remember: there are no wrong answers. Only wrong estimates.",
  "The person who voted 1 will be asked to justify themselves. Aggressively.",
  "Your team's average estimate will haunt your standup for weeks.",
  "Whoever votes highest wins the privilege of being right and hated.",
  "Consensus is just peer pressure with a Fibonacci sequence.",
  "Fun game: guess who copied their vote from the last person.",
  "We're all professionals here. Except for our estimates.",
  "The quiet ones always have the highest estimates. Listen to them.",
  "If everyone votes the same, it means either clarity or shared confusion.",
  "Voting anonymously removes shame. The shame remains.",
  "Let's reach consensus by exhausting everyone into agreement.",
  "The PM is watching. Estimate calmly.",
  "After this session, someone will say 'we need more refinement'. That someone is right.",
  "High vote vs low vote: one of you is a hero, one of you is in denial.",
  "The person who says '2 points' and the person who says '13 points' are both describing the same ticket.",
  "Majority vote in planning poker is just democracy applied to wishful thinking.",
  "Someone here will change their vote after hearing one explanation. That's fine. That's growth.",
  "Watch for the person who picks the highest card with visible relief. They've been here before.",
  "Group estimation: where individual uncertainty becomes collective uncertainty with confidence.",
  "If the senior dev votes 8, just vote 8. Trust the scar tissue.",
  "Whoever finishes voting last is either very thoughtful or checking Slack.",
  "No vote is final until someone says 'wait, but what about the mobile version?'",
  "The team that estimates together, re-estimates together.",
  "Someone in this session has already started implementing it. Their vote will be 1.",

  // Filosofie existențială
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
  "A feature is only truly complete when the next ticket references it as 'the old approach'.",
  "You are not estimating duration. You are estimating regret.",
  "The map is not the territory. The ticket is not the feature.",
  "To estimate is to hope. To re-estimate is to learn. To re-re-estimate is Scrum.",
  "Every sprint begins with a plan and ends with a retrospective about the plan.",
  "An estimate is a hypothesis. The sprint is the experiment. The retro is the funeral.",
  "Certainty in planning is not a sign of clarity. It is a sign of inexperience.",
  "We do not estimate tasks. We estimate our understanding of tasks. Subtle, but important.",
  "The backlog is infinite. The sprint is finite. This tension is the soul of Agile.",
  "Story points exist so that time becomes relative. Einstein would have been a great Scrum Master.",
  "Every estimation session is a philosophical exercise in collective delusion dressed as process.",
  "You are here because someone, somewhere, decided that guessing needed structure.",
  "The ticket will be done when it is done. The estimate is just a story we tell ourselves.",
];

export default function WelcomeOverlay({ name }: { name: string }) {
  const [visible, setVisible] = useState(true);
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div className="relative bg-rd-surface border border-rd-border-2 rounded-2xl px-8 py-7 max-w-lg w-full text-center shadow-2xl">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-4 text-rd-muted hover:text-white text-xl leading-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-3">
          <JesterHat size={64} />
        </div>

        {/* Greeting */}
        <p className="text-rd-yellow font-semibold text-lg mb-2">
          Hey, {name}!
        </p>

        {/* Message */}
        <p className="text-white text-base leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
