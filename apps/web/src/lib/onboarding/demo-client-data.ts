/**
 * Story 7.4 — Demo client "Alex Rivera" static content.
 *
 * Hand-written so the demo is deterministic, zero per-signup AI cost, and high
 * quality. Seeded into each new Path-B user via seed-demo-client.ts.
 *
 * Content quality rubric (BRAINSTORM §5, §13):
 *  - Generic exec-coaching themes (leadership presence, delegation, team dynamics)
 *  - Believable persona — VP Engineering at a fictional mid-size company
 *  - Sessions show progression: problem → exploration → breakthrough → consolidation
 *  - No real company / public-figure references
 *  - No dated cultural references
 *
 * Quarterly review: refresh if content feels stale.
 */

import type { CoachBriefContent } from '@meetsolis/shared';
import type { AIIntelligenceStrip } from '@meetsolis/shared';

// ---------------------------------------------------------------------------
// Date helpers — anchored at seed time so the demo always feels "recent"
// ---------------------------------------------------------------------------

export function demoDates(seedAt: Date = new Date()) {
  const d = (daysAgo: number) => {
    const out = new Date(seedAt);
    out.setUTCDate(out.getUTCDate() - daysAgo);
    return out.toISOString().slice(0, 10); // YYYY-MM-DD
  };
  return {
    startDate: d(90), // ~3 months ago — coaching engagement start
    session1: d(90), // Session 1 — goal-setting
    session2: d(60), // Session 2 — exec presence emerges (~2 months ago)
    session3: d(30), // Session 3 — breakthrough (~1 month ago)
    session4: d(14), // Session 4 — continued work (~2 weeks ago)
  };
}

// ---------------------------------------------------------------------------
// Client profile
// ---------------------------------------------------------------------------

export const DEMO_CLIENT_PROFILE = {
  name: 'Alex Rivera',
  role: 'VP Engineering',
  company: 'Northridge Logistics',
  goal: 'Step into executive presence and build a stronger leadership voice with the senior team.',
  email: null as string | null,
  // Story 7.7 — ABOUT fields prefilled so demo lands on a rich profile
  industry: 'Technology' as string,
  company_size: '201-1000' as
    | 'solo'
    | '2-10'
    | '11-50'
    | '51-200'
    | '201-1000'
    | '1000+',
} as const;

// ---------------------------------------------------------------------------
// AI Intelligence Strip (pre-populated)
// ---------------------------------------------------------------------------

export function buildDemoAIStrip(
  seedAt: Date = new Date()
): AIIntelligenceStrip {
  return {
    recurring_theme:
      'Executive presence — speaking with authority in senior rooms',
    theme_frequency: 'Present in 3 of 4 sessions',
    recent_breakthrough:
      'Delivered the Q3 all-hands talk without retreating into technical detail — first time landing a vision-level message',
    current_focus:
      'Translating exec presence into peer-level influence with the CFO and CRO, not just downward leadership',
    generated_at: seedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Sessions — 4 sessions, ~3-month arc, biweekly-to-monthly cadence
// ---------------------------------------------------------------------------

export interface DemoSession {
  title: string;
  session_date: string; // YYYY-MM-DD
  transcript_text: string;
  summary: string;
  key_topics: string[];
}

export function buildDemoSessions(seedAt: Date = new Date()): DemoSession[] {
  const d = demoDates(seedAt);
  return [
    // ---------- Session 1 — Goal-setting ----------
    {
      title: 'Goal-setting — defining what "executive presence" means to Alex',
      session_date: d.session1,
      transcript_text: [
        'Coach: Welcome, Alex. Before we get into anything tactical, I want to understand what brought you to coaching now.',
        'Alex: My CEO told me directly — I need to grow into the VP role, not just hold the title. She said I run engineering well but I disappear in senior conversations. I default to listening when I should be shaping the room.',
        'Coach: When she said that, what was the first reaction in your body?',
        'Alex: Honestly, defensive. Then about ten minutes later — recognition. She is right. I prep for one-on-ones. I do not prep for all-hands. I do not prep for leadership offsites. I treat them like I am still a senior engineer attending, not leading.',
        'Coach: What would it look like if you were leading those rooms instead of attending them?',
        'Alex: I would have a point of view going in. I would be willing to disagree with the CFO out loud. I would talk about strategy, not implementation. I would stop translating every business question into a technical answer.',
        'Coach: That last one is interesting. Say more about that habit.',
        'Alex: Someone asks "should we acquire Mercer?" and I immediately think about their codebase. The CEO does not need that. She needs whether the engineering org can absorb the integration in nine months without breaking shipping velocity. Different question.',
        'Coach: What feels at stake if you keep operating the way you have been?',
        'Alex: I plateau. I stay a really good director-level operator with a VP title. And eventually they bring in someone over me to do the work I should be doing.',
        'Coach: For the next three months, what is the working definition of executive presence you want to build toward?',
        'Alex: Going into senior rooms with a thesis. Holding the thesis under pressure. Speaking to the business outcome, not the implementation. Being someone the CEO can put in front of the board.',
      ].join('\n\n'),
      summary:
        'Initial session. Alex named the gap between his director-level execution and the VP-level presence his CEO is asking for. Working definition of executive presence: enter senior rooms with a thesis, hold it under pressure, speak to business outcomes not implementation. Pattern noticed: defaults to translating business questions into technical answers.',
      key_topics: [
        'executive presence',
        'CEO feedback',
        'leadership identity',
        'goal-setting',
      ],
    },

    // ---------- Session 2 — Exec presence theme emerges ----------
    {
      title:
        'Exec presence under pressure — the M&A leadership offsite debrief',
      session_date: d.session2,
      transcript_text: [
        'Coach: You said before we started that this past week was rough. Where do you want to start?',
        "Alex: The leadership offsite. M&A topic came up — the Mercer acquisition I mentioned last time. CFO pitched it. CEO turned to me. And I — I went into the codebase again. I started talking about their tech stack and integration timelines. I watched the CEO's face shift and I knew.",
        'Coach: What did the shift look like?',
        'Alex: She went from leaning forward to leaning back. Polite nod. Then she moved the conversation along.',
        'Coach: What were you feeling in that moment?',
        'Alex: Like I had just demoted myself in front of the whole leadership team. And then for the rest of the offsite I overcorrected — talked too much, too loud, on topics I had no business weighing in on.',
        'Coach: What is the pattern you are seeing?',
        'Alex: I default to safe ground when I feel exposed. The safe ground for me is technical. And then when I realize I look small, I overcompensate by talking more. Neither of those is presence.',
        'Coach: If you could rerun that moment with the CFO, what would you have said instead?',
        'Alex: Probably — "the question I would want to answer before we move is whether we can integrate them without breaking our Q4 commitments to existing enterprise customers. That is the engineering risk. The tech stack risk is solvable. The roadmap displacement is what would actually hurt us." That is a VP answer.',
        'Coach: What stopped you from saying that in the room?',
        'Alex: I had not thought about it that way until just now. I had not prepared for the M&A topic at all. I prepared for the org structure discussion. So when the CFO opened that door, I had no thesis, and I retreated to what I knew.',
        'Coach: So the gap is not presence. The gap is preparation for the strategic conversation, not just the operational one.',
        'Alex: Yes. That lands. I prepare like a director — meeting agendas, status updates. I do not prepare like a VP — thesis, point of view, anticipated counter-arguments.',
      ].join('\n\n'),
      summary:
        'Alex debriefed the M&A leadership offsite where he defaulted to technical detail under pressure with the CFO, then overcompensated. Key insight: the gap is not presence itself but the kind of preparation done before senior rooms. He prepares operationally; he needs to prepare strategically — thesis, point of view, anticipated counter-arguments.',
      key_topics: [
        'executive presence',
        'M&A discussion',
        'leadership preparation',
        'defaulting to technical',
        'CFO dynamics',
      ],
    },

    // ---------- Session 3 — Breakthrough ----------
    {
      title: 'Breakthrough — landing the Q3 all-hands talk',
      session_date: d.session3,
      transcript_text: [
        'Coach: You came in smiling. That is not the usual entrance.',
        'Alex: All-hands was Tuesday. I gave a fifteen-minute opening on what engineering is doing this quarter. And it landed.',
        'Coach: Walk me through what landed mean to you.',
        'Alex: People stayed in their seats. Slack lit up afterward. Two of my own senior engineers messaged me — they said it was the first time they understood why we are doing the platform rebuild. The CFO came up to me after. He said it was the clearest he has heard the engineering strategy in two years.',
        'Coach: What did you do differently?',
        'Alex: Prepared like a VP, finally. I wrote the thesis first — "we are rebuilding the platform because our enterprise customers are starting to ask questions our current architecture cannot answer." Everything else flowed from that. I did not show any code. I did not show any architecture diagrams. I showed two customer quotes and one chart of roadmap displacement risk. That was it.',
        'Coach: What was that like for you — standing up there without the technical scaffolding?',
        'Alex: Exposed at first. I rehearsed three times the night before because I kept reaching for the architecture slide. But by the time I was up there I felt steady. Not because the slides were strong — because the thesis was right and I knew it.',
        'Coach: That is the difference. You held the thesis under pressure.',
        'Alex: Yes. And here is what surprised me. The Q&A was the easy part. Once the thesis was clear, every question routed back to it. Even when finance pushed on budget, I could answer from the thesis instead of getting pulled into implementation cost details.',
        'Coach: What does this tell you about the work going forward?',
        'Alex: That the leverage point is the thirty minutes I spend writing the thesis before any senior conversation. Not the conversation itself. The conversation is downstream of preparation. I had been treating it as the other way around.',
        'Coach: How do you want to operationalize that?',
        'Alex: Standing thirty-minute block on my calendar before any leadership meeting. No exceptions. I write the thesis, the two anticipated push-backs, and my answer to each. If I do not have a thesis by the end of the thirty minutes, I cancel my attendance.',
      ].join('\n\n'),
      summary:
        'Breakthrough session. Alex delivered the Q3 all-hands talk holding a strategic thesis instead of retreating to technical detail. CFO praised it as the clearest engineering strategy framing in two years. Insight: the leverage is in the thirty-minute thesis-writing block before any senior conversation, not in the conversation itself. Committed to a standing thesis-prep block before every leadership meeting.',
      key_topics: [
        'executive presence',
        'all-hands speaking',
        'thesis-driven communication',
        'CFO recognition',
        'thesis preparation ritual',
      ],
    },

    // ---------- Session 4 — Consolidation + new edge ----------
    {
      title: 'Peer-level influence — extending presence to the CFO and CRO',
      session_date: d.session4,
      transcript_text: [
        'Coach: How is the thesis-prep block holding up?',
        'Alex: Three weeks in. Held every time. It is the highest-leverage thirty minutes of my week.',
        'Coach: Where is your edge now?',
        'Alex: Downward and to the CEO, I feel solid. The room where I still shrink is peer level — the CFO and the CRO. We meet weekly as a senior team. I lead engineering well in that room. I do not push back on revenue strategy or capital allocation. And they do not push back on engineering. We are all polite. Nothing moves.',
        'Coach: What is the cost of polite?',
        'Alex: We made a hiring plan last quarter that I knew was wrong. I had a view that we were over-investing in field engineering and under-investing in platform. I did not bring it up because the CRO had pitched it and the CFO had signed off. So I executed something I did not believe in. We are paying for that now — platform is bottlenecked, field engineers are underutilized.',
        'Coach: What kept you from speaking up?',
        'Alex: I had a thesis. I had prep. I just — did not want the conflict. The CRO is more senior in the company by years. I respect him. I told myself "trust the team." But trust is not the same as silence.',
        'Coach: Where else have you used "trust the team" as cover for not bringing your view?',
        'Alex: Probably more places than I want to admit. Roadmap prioritization with the CRO last month. Budget reallocation conversation with the CFO two weeks ago. Same pattern. I had a view. I sat on it. I told myself I was deferring to expertise.',
        'Coach: What is the difference between deferring to expertise and avoiding peer conflict?',
        'Alex: Deferring to expertise — I would say "you are closer to revenue, what is your read?" and then engage with their answer. Avoiding conflict — I do not bring my view at all. I have been doing the second and telling myself it is the first.',
        'Coach: What is the next concrete experiment?',
        'Alex: In the next weekly senior team meeting, I bring my platform-vs-field view to the CRO directly. I do not soften it. I do not bury it in the agenda. I open with "here is something I think we got wrong last quarter and what I would change going forward."',
        'Coach: What is the version of you that walks into that meeting?',
        'Alex: The one who held the thesis at all-hands. Not a different person. Just that one, but pointed sideways instead of outward.',
      ].join('\n\n'),
      summary:
        'Alex consolidated the thesis-prep ritual (3 weeks of standing 30-min blocks before leadership meetings). New edge identified: peer-level influence with CFO and CRO. He has been mistaking "trust the team" for avoiding peer conflict. Concrete example: executed a Q-prior hiring plan he knew was wrong because he did not push back on the CRO. Committed to bringing his platform-vs-field view directly to the CRO in the next senior team meeting, opening with "here is something I think we got wrong."',
      key_topics: [
        'peer-level influence',
        'CFO and CRO dynamics',
        'avoiding conflict',
        'trust the team as cover',
        'thesis prep ritual sustained',
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Action items per session — mix of coach + client assignees, mix of completed
// ---------------------------------------------------------------------------

export interface DemoActionItemSeed {
  sessionIndex: 0 | 1 | 2 | 3;
  description: string;
  assignee: 'coach' | 'client';
  completed: boolean;
}

export const DEMO_ACTION_ITEMS: DemoActionItemSeed[] = [
  // Session 1
  {
    sessionIndex: 0,
    description:
      'Write a one-paragraph working definition of executive presence for Alex to react to next session',
    assignee: 'coach',
    completed: true,
  },
  {
    sessionIndex: 0,
    description:
      'Notice and journal one moment per week where Alex translates a business question into a technical answer',
    assignee: 'client',
    completed: true,
  },
  // Session 2
  {
    sessionIndex: 1,
    description:
      'Before the next senior leadership meeting, write a one-page thesis: position, two anticipated counter-arguments, response to each',
    assignee: 'client',
    completed: true,
  },
  {
    sessionIndex: 1,
    description:
      'Send Alex two short readings on strategic vs operational preparation by Friday',
    assignee: 'coach',
    completed: true,
  },
  // Session 3
  {
    sessionIndex: 2,
    description:
      'Block a recurring 30-minute thesis-prep slot on the calendar before every leadership meeting — no exceptions',
    assignee: 'client',
    completed: true,
  },
  {
    sessionIndex: 2,
    description: 'Share the all-hands talk transcript with Alex by end of week',
    assignee: 'coach',
    completed: false,
  },
  // Session 4 (open — recent)
  {
    sessionIndex: 3,
    description:
      'In the next weekly senior team meeting, bring the platform-vs-field view directly to the CRO without softening',
    assignee: 'client',
    completed: false,
  },
  {
    sessionIndex: 3,
    description:
      'Draft three observations on peer-conflict avoidance patterns Alex named, send before next session',
    assignee: 'coach',
    completed: false,
  },
];

// ---------------------------------------------------------------------------
// Coach Brief — pre-generated, mirrors Story 6.4 CoachBriefContent shape
// ---------------------------------------------------------------------------

export function buildDemoBriefContent(
  seedAt: Date = new Date(),
  session3Id?: string,
  session4Id?: string,
  session4ActionItemIds: { id: string; text: string; completed: boolean }[] = []
): CoachBriefContent {
  const d = demoDates(seedAt);
  return {
    client_name: DEMO_CLIENT_PROFILE.name,
    minutes_until_session: null, // manual brief — no calendar event
    last_session: {
      session_id: session4Id ?? '00000000-0000-0000-0000-000000000000',
      date: d.session4,
      weeks_ago: 2,
      action_items: session4ActionItemIds.length
        ? session4ActionItemIds.map(a => ({
            id: a.id,
            text: a.text,
            status: a.completed ? ('done' as const) : ('open' as const),
          }))
        : [
            {
              id: '00000000-0000-0000-0000-000000000000',
              text: 'In the next weekly senior team meeting, bring the platform-vs-field view directly to the CRO without softening',
              status: 'open' as const,
            },
            {
              id: '00000000-0000-0000-0000-000000000000',
              text: 'Draft three observations on peer-conflict avoidance patterns Alex named, send before next session',
              status: 'open' as const,
            },
          ],
      key_theme:
        'Peer-level influence — extending presence sideways, not just downward',
    },
    ai_prep_note: [
      "Alex made a clear leap last session — he now sees 'trust the team' as cover for avoiding peer conflict, especially with the CFO and CRO. The thesis-prep ritual is holding (3 weeks). The new work is using that thesis sideways, not just in all-hands or with the CEO.",
      '',
      'Watch for: he may report on whether he brought the platform-vs-field view to the CRO. If he did, dig into how the CRO received it and what Alex felt during. If he did not, the conversation is about what he told himself instead — and whether the avoidance pattern is shrinking or just relocating.',
      '',
      'Possible opening: "Last time we ended on the platform-vs-field conversation with the CRO. What happened with that?"',
    ].join('\n'),
    past_breakthroughs: [
      {
        session_id: session3Id ?? '00000000-0000-0000-0000-000000000000',
        date: d.session3,
        summary:
          'Q3 all-hands talk landed. Held a strategic thesis without retreating to technical detail. CFO praised it. Alex identified the leverage point — the 30-minute thesis-prep block before any senior room.',
      },
    ],
    coach_open_questions: '',
    is_first_session: false,
    suggested_questions: [],
    edited_fields: [],
  };
}
