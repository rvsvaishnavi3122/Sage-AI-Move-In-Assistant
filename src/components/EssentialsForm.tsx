/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, UserPlus, Building2, IndianRupee, Loader2, Sparkles, Wand2, MapPin, Maximize, Users, Calendar } from 'lucide-react';
import { AccommodationType, HomeItem, UserPreferences } from '../types';
import { generateEssentials } from '../lib/gemini';

interface Props {
  preferences: UserPreferences;
  onComplete: (prefs: UserPreferences, items: HomeItem[]) => void;
}

const ACCOMMODATIONS: { type: AccommodationType; label: string; icon: any; desc: string }[] = [
  { type: 'Shared Space', label: 'Shared Space', icon: Maximize, desc: 'Single or shared room, co-living' },
  { type: 'Studio', label: 'Studio', icon: Building2, desc: 'Compact minimalist private space' },
  { type: '1BHK', label: '1BHK', icon: Home, desc: 'Private apartment with one bedroom' },
  { type: '2BHK+', label: '2BHK+', icon: Users, desc: 'Spacious family apartment' },
];

export default function EssentialsForm({ preferences, onComplete }: Props) {
  const [prefs, setPrefs] = useState<UserPreferences>(preferences);
  const [isGenerating, setIsGenerating] = useState(false);

  const [step, setStep] = useState(0);
  const steps = [
    "Analyzing accommodation footprint...",
    "Optimizing for ₹" + prefs.budget + " budget...",
    "Finding local essentials in " + (prefs.targetCity || "your city") + "...",
    "Curating your personalized 48-hour plan..."
  ];

  const handleGenerate = async () => {
    if (!prefs.accommodationType) return;
    
    setIsGenerating(true);
    const interval = setInterval(() => {
      setStep(s => (s + 1) % steps.length);
    }, 1500);

    try {
      const items = await generateEssentials(
        prefs.accommodationType, 
        prefs.budget, 
        prefs.targetCity,
        prefs.assistantPersona
      );
      clearInterval(interval);
      onComplete(prefs, items);
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-serif font-medium text-ink">Essentials Setup 🌿</h2>
        <p className="text-ink/60 text-lg">Help us understand your setup so we can generate your smart checklist.</p>
      </div>

      <div className="space-y-6">
        <label className="text-sm font-semibold uppercase tracking-wider text-ink/40 block ml-2">Which city are you moving to?</label>
        <div className="relative group">
          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-olive font-semibold" size={20} />
          <input
            type="text"
            value={prefs.targetCity || ''}
            onChange={(e) => setPrefs(p => ({ ...p, targetCity: e.target.value }))}
            className="w-full bg-white/60 backdrop-blur-[10px] border-2 border-white/40 rounded-3xl py-5 pl-12 pr-6 text-xl font-serif font-medium focus:outline-none focus:border-olive shadow-sm transition-all text-ink focus:shadow-md"
            placeholder="e.g. Pune, Bangalore, Mumbai..."
          />
        </div>
        {prefs.targetCity && prefs.targetCity.length > 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border-2 border-white/60 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-olive/10 flex items-center justify-center text-olive">
                <Building2 size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink uppercase tracking-tight">Property Finder</p>
                <p className="text-xs text-ink/50 leading-tight">Find {prefs.accommodationType || 'PG/Flats'} in {prefs.targetCity}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Housing', url: `https://housing.com/in/rent/search?q=${prefs.targetCity}` },
                { name: 'NoBroker', url: `https://www.nobroker.in/property/rent/${prefs.targetCity}/` },
                { name: 'MagicBricks', url: `https://www.magicbricks.com/property-for-rent-in-${prefs.targetCity.toLowerCase()}` }
              ].map(platform => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-olive border border-olive/10 hover:border-olive/30 shadow-sm transition-all"
                >
                  {platform.name}
                </a>
              ))}
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(`${prefs.accommodationType || 'PG/Flat'} for rent in ${prefs.targetCity}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-olive text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all border border-olive/20"
              >
                Google Search
              </a>
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <label className="text-sm font-semibold uppercase tracking-wider text-ink/40 block ml-2">What is your Target Budget? (₹)</label>
        <div className="relative group">
          <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-olive font-semibold" size={20} />
          <input
            type="number"
            value={prefs.budget || ''}
            onChange={(e) => setPrefs(p => ({ ...p, budget: parseInt(e.target.value) || 0 }))}
            className="w-full bg-white/60 backdrop-blur-[10px] border-2 border-white/40 rounded-3xl py-5 pl-12 pr-6 text-xl font-serif font-medium focus:outline-none focus:border-olive shadow-sm transition-all text-ink focus:shadow-md"
            placeholder="e.g. 50000"
          />
        </div>
      </div>

      <div className="space-y-6">
        <label className="text-sm font-semibold uppercase tracking-wider text-ink/40 block ml-2">When are you moving in?</label>
        <div className="relative group">
          <input
            type="date"
            value={prefs.moveInDate || ''}
            onChange={(e) => setPrefs(p => ({ ...p, moveInDate: e.target.value }))}
            className="w-full bg-white/60 backdrop-blur-[10px] border-2 border-white/40 rounded-3xl py-5 px-6 text-xl font-serif font-medium focus:outline-none focus:border-olive shadow-sm transition-all text-ink focus:shadow-md"
          />
        </div>
      </div>

      <div className="space-y-6">
        <label className="text-sm font-semibold uppercase tracking-wider text-ink/40 block ml-2">Accommodation Type</label>
        <div className="grid grid-cols-1 gap-4">
          {ACCOMMODATIONS.map((item) => (
            <button
              key={item.type}
              onClick={() => setPrefs(p => ({ ...p, accommodationType: item.type }))}
              className={`flex items-center gap-5 p-5 rounded-3xl transition-all border-2 text-left group ${
                prefs.accommodationType === item.type 
                ? 'bg-sage/20 border-olive shadow-md' 
                : 'bg-white border-white/40 hover:border-sage shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                prefs.accommodationType === item.type ? 'bg-olive text-white' : 'bg-beige text-ink/40 group-hover:bg-sage/20 group-hover:text-olive'
              }`}>
                <item.icon size={24} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-lg ${prefs.accommodationType === item.type ? 'text-olive' : 'text-ink'}`}>{item.label}</p>
                <p className="text-sm text-ink/40">{item.desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                prefs.accommodationType === item.type ? 'border-olive bg-olive' : 'border-ink/10'
              }`}>
                {prefs.accommodationType === item.type && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleGenerate}
        disabled={!prefs.accommodationType || isGenerating}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-olive text-white p-6 rounded-3xl font-semibold text-xl shadow-xl shadow-olive/20 flex items-center justify-center gap-3 disabled:opacity-50 transition-all border-none outline-none ring-offset-2 focus:ring-2 focus:ring-olive"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" /> Generating...
          </>
        ) : (
          <>
             Generate Checklist <Wand2 size={24} />
          </>
        )}
      </motion.button>
      
      {isGenerating && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white/40 backdrop-blur-xl border-2 border-white/60 p-8 rounded-[40px] text-center space-y-6 shadow-xl"
        >
          <div className="relative w-20 h-20 mx-auto">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-4 border-dashed border-olive/30 rounded-full"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-olive animate-pulse" size={32} />
             </div>
          </div>
          
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.p 
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-serif italic text-sage-dark min-h-[3rem] flex items-center justify-center px-4"
              >
                {steps[step]}
              </motion.p>
            </AnimatePresence>
            <p className="text-[10px] text-ink/30 uppercase tracking-[0.2em] font-bold">Sage is crafting your strategy</p>
          </div>

          <div className="pt-4 border-t border-white/40">
            <p className="text-xs text-ink/50 leading-relaxed italic">
              "Every home is a story. I'm making sure yours starts with every detail handled."
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
