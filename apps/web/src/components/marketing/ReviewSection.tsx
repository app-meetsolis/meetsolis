'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Hannah Wallace',
    role: 'Freelance Designer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah',
    content:
      'I used to panic about forgetting small details—like a specific hex code or a layout preference mentioned 20 minutes into a call. Solis feels like a safety net. It catches those blink-and-you-miss-it details so I can just focus on the design conversation.',
    stars: 5,
  },
  {
    id: 2,
    name: 'Trusha Shete',
    role: 'Marketing Strategist',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trusha',
    content:
      "I handle 12 active accounts. Remembering who said what was impossible before Solis. It's a game changer.",
    stars: 5,
  },
  {
    id: 3,
    name: 'MediOrion',
    role: 'Digital Agency',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MediOrion',
    content:
      "Scaling our agency meant drowning in meeting notes. Solis keeps our entire team aligned on client history without us having to manually brief everyone. It's become our central source of truth.",
    stars: 4,
  },
  {
    id: 4,
    name: 'Janvi Soni',
    role: 'Product Manager',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Janvi',
    content:
      "Most tools just transcribe. Solis actually *understands*. I can ask, 'Did we decide on the V2 API specs last week?' and it pulls exactly that segment. It saves me an hour of relistening to recordings every single day.",
    stars: 5,
  },
  {
    id: 5,
    name: 'Bhupendrasingh Rathod',
    role: 'Senior Developer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bhupendra',
    content:
      'Taking notes breaks my flow state. I want to code, not type minutes. Solis handles the memory part silently so I can stay in the zone.',
    stars: 4.5,
  },
  {
    id: 6,
    name: 'Atharva Naik',
    role: 'Business Consultant',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Atharva',
    content:
      "The prep time before consulting calls used to kill my morning. Solis gives me a perfect 'last time we spoke' cheat sheet in seconds. Instant ROI.",
    stars: 5,
  },
  {
    id: 7,
    name: 'Tanvi Thakker',
    role: 'UX Researcher',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvi',
    content:
      "I interview users all day long. Trying to capture emotional nuances while typing frantically was draining me. Now I just listen. Solis remembers the user's hesitation or excitement perfectly. It handles the mental load so I can be present.",
    stars: 5,
  },
  {
    id: 8,
    name: 'Anjali Lanjudkar',
    role: 'Project Lead',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
    content:
      "Tracking action items across 5 projects is chaos. Solis captures 'who promised what' automatically. Lifesaver.",
    stars: 4.5,
  },
  {
    id: 9,
    name: 'Hari Gopal Suthar',
    role: 'Agency Founder',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hari',
    content:
      "I've tried every AI note-taker, but they all feel like dumb recorders. Solis seems to understand the *relationship* history. It connects dots between meetings that I would have definitely missed.",
    stars: 4,
  },
  {
    id: 10,
    name: 'InfernixBlack Ai',
    role: 'AI Solutions',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Infernix',
    content:
      "We build AI agents, so we're skeptical. But the specific focus on client context here is huge. It fills a massive gap in our workflow.",
    stars: 5,
  },
  {
    id: 11,
    name: 'Marcus Thorne',
    role: 'Legal Consultant',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    content:
      "Client confidentiality is my biggest headache. Solis's privacy-first approach is the only reason I felt comfortable switching from manual notes.",
    stars: 5,
  },
  {
    id: 12,
    name: 'Sarah Jenkins',
    role: 'Creative Director',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content:
      "I juggle 3 different design sprints daily. Solis remembers the feedback from the morning standup so I don't have to chase PMs for clarification.",
    stars: 4.5,
  },
  {
    id: 13,
    name: 'David Kim',
    role: 'Startup Founder',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content:
      "Pitching to investors means remembering every objection they raised last time. Solis gives me that edge. It's like having a dedicated Chief of Staff.",
    stars: 5,
  },
  {
    id: 14,
    name: 'Elena Rodriguez',
    role: 'Executive Coach',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    content:
      "My clients value deep listening. Solis allows me to maintain 100% eye contact without worrying about capturing the action plan. It's invisible but indispensable.",
    stars: 5,
  },
  {
    id: 15,
    name: 'James Wilson',
    role: 'Sales Lead',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    content:
      "The 'Recall' feature is magic. Closing deals is easier when you remember the prospect's dog's name from a call 3 months ago. It builds unmatched rapport.",
    stars: 4,
  },
];

export function ReviewSection() {
  return (
    <section className="py-24 bg-[#0B0F19] text-white relative overflow-hidden border-b border-white/5">
      <div className="container px-4 md:px-6 mb-12 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 font-heading">
          Loved by <span className="text-blue-400">client-facing</span> pros.
        </h2>
        <p className="text-slate-400 text-lg">
          Join freelancers and agencies who trust Solis with their client
          relationships.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden py-10">
        {/* Gradient Masks/Foggy Edges */}
        <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-[#0B0F19] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-[#0B0F19] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-8 w-max">
          <MarqueeGroup />
          <MarqueeGroup />
          <MarqueeGroup />
        </div>
      </div>
    </section>
  );
}

const COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-cyan-600',
  'bg-pink-600',
  'bg-teal-600',
];

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Deterministic color assignment based on name string
  const colorIndex =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    COLORS.length;

  return (
    <div
      className={`w-12 h-12 rounded-full ${COLORS[colorIndex]} flex items-center justify-center shrink-0 border border-white/10 font-bold text-white text-base shadow-inner`}
    >
      {initials}
    </div>
  );
}

function MarqueeGroup() {
  return (
    <motion.div
      className="flex gap-8 shrink-0"
      animate={{ x: '-100%' }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    >
      {REVIEWS.map(review => (
        <div
          key={review.id}
          className="w-[350px] md:w-[450px] bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:bg-white/10 transition-colors flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            <InitialsAvatar name={review.name} />
            <div>
              <div className="font-bold text-white">{review.name}</div>
              <div className="text-xs text-blue-400 font-medium">
                {review.role}
              </div>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => {
                // Check if this should be a full star
                if (review.stars >= i + 1) {
                  return (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  );
                }
                // Check if this should be a half star
                if (review.stars > i && review.stars < i + 1) {
                  return (
                    <div key={i} className="relative">
                      {/* Background: Empty Star */}
                      <Star className="w-4 h-4 text-slate-600" />
                      {/* Foreground: Half Filled Star */}
                      <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                    </div>
                  );
                }
                // Default: Empty star
                return <Star key={i} className="w-4 h-4 text-slate-600" />;
              })}
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            &quot;{review.content}&quot;
          </p>
        </div>
      ))}
    </motion.div>
  );
}
