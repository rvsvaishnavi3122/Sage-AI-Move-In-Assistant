/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Home, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-12">
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 10,
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3
        }}
        className="w-24 h-24 bg-sage/20 rounded-3xl flex items-center justify-center text-olive relative"
      >
        <Home size={48} strokeWidth={1.5} />
        <div className="absolute -top-1 -right-1 text-terracotta">
          <Sparkles size={24} fill="currentColor" />
        </div>
      </motion.div>

      <div className="space-y-4">
        <motion.h1 
          className="text-4xl font-serif font-medium leading-tight text-ink"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Your AI Move-In <br />
          <span className="serif-italic text-olive">Assistant 🌿</span>
        </motion.h1>
        
        <motion.p 
          className="text-ink/60 text-lg max-w-[320px] mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Plan, prioritize, and set up your new home without the stress.
        </motion.p>
      </div>

      <motion.button
        onClick={onStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative flex items-center gap-3 bg-olive text-white px-10 py-5 rounded-3xl font-medium text-lg shadow-xl shadow-olive/20 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        Start My Setup
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>

      <motion.div 
        className="pt-12 flex gap-8 grayscale opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex flex-col items-center gap-1">
           <span className="text-[10px] uppercase font-bold tracking-widest text-ink/40">Adaptive</span>
           <div className="w-1 h-1 bg-olive rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-1">
           <span className="text-[10px] uppercase font-bold tracking-widest text-ink/40">Predictive</span>
           <div className="w-1 h-1 bg-olive rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-1">
           <span className="text-[10px] uppercase font-bold tracking-widest text-ink/40">Peaceful</span>
           <div className="w-1 h-1 bg-olive rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
