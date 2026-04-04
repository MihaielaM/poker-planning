// Messages shown next to participants who haven't voted when >50% already have
export const SLOW_VOTER_MESSAGES = [
  '...still contemplating life choices',
  'Currently in deep meditation',
  'Probably fell asleep with the card in hand',
  'Googling Fibonacci right now',
  'Forgot the password to their brain',
  'Checking the calendar to see what year it is',
  'Connection to reality is unstable',
  'Bug detected: missing decision',
  'Processing... processing... 2%',
  'Entered power-saving mode',
  'Consulting a fortune teller',
  'Counting on fingers, starting over',
  'Will theoretically vote next week',
  'Loading... please wait',
  'Estimation for the estimation: infinity',
  'Opened a new Stack Overflow tab',
  'Thinks this is a rhetorical question',
  'Calculating existential risks',
  'Spiritually absent at the moment',
  'Ordered a pizza and waiting for inspiration',
  'Reviewing all sprints since 2019',
  'Breaking the world record for indecisiveness',
  'Forgot what Fibonacci means',
  'Getting ready to vote... probably',
  'Screen frozen on "deep thinking"',
  'The calculation is complex, please be patient',
  'Checked "thinking about it" and stayed there',
  'Signal from brain interrupted',
  'Stalling with great professionalism',
  'Their estimate is somewhere in the Universe',
  'Requested a sprint extension',
  'Currently in a stand-up with themselves',
  'Current priority: "thinking about it"',
  'Testing our emotional limits',
  'Probably writing a novel about this task',
  'Brain WiFi is slow today',
  'Started code review without finishing the vote',
  'Calculating story points for story points',
  'Somewhere between 1 and infinity',
  'In a meeting with themselves',
  'Currently offline existentially',
  'Thinking hard... or pretending to',
  'Forgot there was a team',
  'Estimating the duration of the estimation',
  'Went for coffee and never came back',
  'The task is staring at them, they\'re staring back',
  'Found a bug in their own thinking process',
  'Running mental unit tests',
  'Their vote is in production review',
  'Currently: deep work (on voting)',
  'Wondering if there\'s life after the sprint',
  'Analyzing the task from all possible angles',
  'Set a 2-hour timer to vote',
  'Their code votes faster than they do',
  'Syncing with the universe: in progress',
  'Just finished reading the task title',
  'Thinks voting is optional',
  'We\'re waiting... with joy... obviously',
  'Stuck on a non-existent edge case',
  'Opened Jira and forgot why',
  'Their Fibonacci calculator won\'t start',
];

// Short messages shown on highlighted (extreme) vote cards
export const EXTREME_CARD_MESSAGES = [
  'Explain yourself! 😅',
  'Bold move! 🔥',
  'Convince us! 🎤',
  'Interesting... 🤔',
  'Why though? 👀',
  'We\'re curious! 🧐',
  'Are you sure? 😬',
  'Tell us more! 💬',
];

// Banner messages shown below results when there are extreme votes
export const EXTREME_BANNER_MESSAGES = [
  'We have divergence! Those with extreme votes, open the debate 🔥',
  'Someone sees this task differently — and that\'s great! Shall we discuss? 🤝',
  'Discrepancy detected! Time for a warm discussion ☕',
  'Votes at the extremes! Let\'s hear all perspectives 🗣️',
  'We disagree — and that\'s healthy! Who wants to start? 🎯',
  'The team is split! We\'d love to hear your arguments 💡',
  'Estimates at opposite poles! Time to debate 🏆',
  'Large estimation gap detected. Is the task more complex than we thought? 🔍',
  'Same team, different planets on this estimate 🚀',
  'Let\'s hear from the outliers! 🎙️',
];

// Deterministic "random" based on a string seed — consistent across re-renders
export function seededPick<T>(arr: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return arr[Math.abs(hash) % arr.length];
}
