/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, LayoutGrid, Palette, CircleDollarSign, ChevronRight, UserCircle } from 'lucide-react';
import { PersonaType, UserPreferences } from '../types';

interface Props {
  onComplete: (name: string, persona: PersonaType) => void;
}

const PERSONAS: { type: PersonaType; icon: any; desc: string; color: string }[] = [
  {
    type: 'The Organizer',
    icon: LayoutGrid,
    desc: 'Structured room-wise checklists focused on total completeness.',
    color: 'bg-olive text-white'
  },
  {
    type: 'The Decorator',
    icon: Palette,
    desc: 'Visually rich aesthetic mood-boards and curated room themes.',
    color: 'bg-terracotta text-white'
  },
  {
    type: 'The Budget Master',
    icon: CircleDollarSign,
    desc: 'Financial insights, itemized expense entry, and savings tracking.',
    color: 'bg-sage text-white'
  }
];

export default function AssistantSetup({ onComplete }: Props) {
  const [name, setName] = useState('Sage');
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('The Organizer');

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-serif font-medium text-ink">Meet your Assistant ✨</h2>
        <p className="text-ink/60 text-lg">Every great home starts with a great plan. Who would you like to guide you?</p>
      </div>

      <div className="space-y-6">
        <label className="text-sm font-semibold uppercase tracking-wider text-ink/40 block ml-2">Give them a name</label>
        <div className="relative">
          <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-olive/40" size={24} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/60 backdrop-blur-[10px] border-2 border-white/40 rounded-3xl py-5 pl-14 pr-6 text-xl font-medium focus:outline-none focus:border-olive shadow-sm transition-all text-ink"
            placeholder="e.g. Sage, Hera, Oliver..."
          />
        </div>
      </div>

      <div className="space-y-6">
        <label className="text-sm font-semibold uppercase tracking-wider text-ink/40 block ml-2">Choose a Personality</label>
        <div className="space-y-4">
          {PERSONAS.map((p) => (
            <button
              key={p.type}
              onClick={() => setSelectedPersona(p.type)}
              className={`w-full flex items-start gap-5 p-5 rounded-3xl transition-all border-2 text-left group ${
                selectedPersona === p.type 
                ? 'bg-sage/10 border-olive shadow-md' 
                : 'bg-white/40 border-white/40 hover:border-sage shadow-sm'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                selectedPersona === p.type ? p.color : 'bg-beige text-ink/20 group-hover:bg-sage/20 group-hover:text-olive'
              }`}>
                <p.icon size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-lg ${selectedPersona === p.type ? 'text-olive' : 'text-ink'}`}>{p.type}</p>
                <p className="text-sm text-ink/40 leading-relaxed mt-1">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={() => onComplete(name, selectedPersona)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-olive text-white p-6 rounded-3xl font-semibold text-xl shadow-xl shadow-olive/20 flex items-center justify-center gap-3 transition-all"
      >
        Choose {name} <ChevronRight size={24} />
      </motion.button>
    </div>
  );
}
