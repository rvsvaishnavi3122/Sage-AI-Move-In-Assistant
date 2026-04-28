/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { List, Wallet, LayoutGrid, ArrowLeft, MessageSquareText, X } from 'lucide-react';
import { AppState, HomeItem, UserPreferences } from './types';
import LandingScreen from './components/LandingScreen';
import AssistantSetup from './components/AssistantSetup';
import ChatAssistant from './components/ChatAssistant';
import EssentialsForm from './components/EssentialsForm';
import Planner from './components/Planner';
import AestheticInspiration from './components/AestheticInspiration';
import BudgetScreen from './components/BudgetScreen';
import { getLayoutConfig } from './lib/layout-config';

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 'landing',
    preferences: {
      accommodationType: '',
      budget: 1000,
      currency: 'INR',
      countryCode: 'IN',
      assistantName: 'Sage',
      assistantPersona: 'The Organizer'
    },
    items: [],
  });

  const [activeView, setActiveView] = useState<'planner' | 'budget' | 'aesthetics'>('planner');
  const [isSageVisible, setIsSageVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const layout = getLayoutConfig(windowWidth);

  const nextStep = useCallback((updates?: Partial<AppState>) => {
    setState(prev => {
      const transitions: Record<string, AppState['step']> = {
        'landing': 'assistant_setup',
        'assistant_setup': 'chat',
        'chat': 'setup',
        'setup': 'planner',
      };

      let step = transitions[prev.step] || prev.step;
      
      const persona = updates?.preferences?.assistantPersona || prev.preferences.assistantPersona;

      // Conditional skips for personas
      if (prev.step === 'assistant_setup' && (persona === 'The Budget Master' || persona === 'The Decorator')) {
        step = 'planner';
        if (persona === 'The Budget Master') setActiveView('budget');
        else if (persona === 'The Decorator') setActiveView('aesthetics');
      } else if (prev.step === 'assistant_setup' && persona === 'The Organizer') {
        setActiveView('planner');
      }

      return { 
        ...prev, 
        ...updates, 
        step 
      };
    });
  }, []);

  const updatePreferences = (prefs: UserPreferences) => {
    setState(prev => ({ ...prev, preferences: prefs }));
    if (prefs.assistantPersona === 'The Budget Master') setActiveView('budget');
    if (prefs.assistantPersona === 'The Decorator') setActiveView('aesthetics');
    if (prefs.assistantPersona === 'The Organizer') setActiveView('planner');
  };

  const updateItems = (items: HomeItem[]) => {
    setState(prev => ({ ...prev, items }));
  };

  const toggleItem = useCallback((id: string) => {
    setState(prev => {
      const today = new Date().toISOString().split('T')[0];
      const items = prev.items.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
      const justCompleted = items.find(i => i.id === id)?.completed;

      let newStreak = prev.streak || 0;
      let newLastActive = prev.lastActive;

      if (justCompleted) {
        if (!prev.lastActive) {
          newStreak = 1;
          newLastActive = today;
        } else if (prev.lastActive === today) {
          // No change, already active today
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (prev.lastActive === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          newLastActive = today;
        }
      }

      return {
        ...prev,
        items,
        streak: newStreak,
        lastActive: newLastActive
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      const prevSteps: Record<string, AppState['step']> = {
        'assistant_setup': 'landing',
        'chat': 'assistant_setup',
        'setup': 'chat',
        'planner': 'setup',
      };

      let step = prevSteps[prev.step] || prev.step;
      
      const persona = prev.preferences.assistantPersona;

      // Handle skips in reverse
      if (prev.step === 'planner' && (persona === 'The Budget Master' || persona === 'The Decorator')) {
        step = 'assistant_setup';
      }

      return { ...prev, step };
    });
  }, []);


  const renderStep = () => {
    switch (state.step) {
      case 'landing':
        return <LandingScreen key="landing" onStart={() => nextStep()} />;
      case 'assistant_setup':
        return (
          <AssistantSetup 
            key="assistant_setup"
            onComplete={(name, persona) => nextStep({ 
              preferences: { ...state.preferences, assistantName: name, assistantPersona: persona } 
            })} 
          />
        );
      case 'chat':
        return <ChatAssistant key="chat" preferences={state.preferences} onComplete={() => nextStep()} />;
      case 'setup':
        return (
          <EssentialsForm 
            key="setup" 
            preferences={state.preferences}
            onComplete={(prefs, items) => nextStep({ preferences: prefs, items })} 
          />
        );
      case 'planner':
        if (activeView === 'aesthetics') {
          return (
            <AestheticInspiration 
              key="aesthetics" 
              state={state} 
              onUpdateItems={updateItems}
            />
          );
        }
        if (activeView === 'budget') {
          return (
            <BudgetScreen 
              key="budget" 
              state={state} 
              onUpdateItems={updateItems}
              onUpdateBudget={(budget) => setState(prev => ({ 
                ...prev, 
                preferences: { ...prev.preferences, budget } 
              }))}
            />
          );
        }
        return (
          <Planner 
            key="planner" 
            state={state} 
            onUpdateItems={updateItems}
            onToggleComplete={toggleItem}
            onToggleAesthetics={() => setActiveView('aesthetics')}
            onUpdateBudget={(budget) => setState(prev => ({ 
              ...prev, 
              preferences: { ...prev.preferences, budget } 
            }))}
          />
        );
      default:
        return <LandingScreen key="landing" onStart={() => nextStep()} />;
    }
  };

  return (
    <div className={`min-h-screen bg-off-white text-slate-800 overflow-x-hidden ${layout.navPosition === 'bottom' ? 'pb-24' : 'pb-4'} ${layout.padding} ${layout.platform === 'ios' ? 'font-sans pt-24' : 'font-sans pt-20'}`}>
      {state.step !== 'landing' && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={goBack}
          className={`fixed top-6 left-6 z-50 w-10 h-10 glass rounded-full flex items-center justify-center text-ink/60 hover:text-ink hover:bg-white/40 transition-all border border-white shadow-sm`}
          title="Go Back"
        >
          <ArrowLeft size={20} />
        </motion.button>
      )}

      {/* Persistent Sage Button */}
      {state.step === 'planner' && !isSageVisible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSageVisible(true)}
          className="fixed bottom-24 right-6 z-[60] w-14 h-14 bg-olive text-white rounded-full flex items-center justify-center shadow-2xl shadow-olive/40 border border-white/20"
        >
          <MessageSquareText size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      )}

      {/* Sage Chat Overlay */}
      <AnimatePresence>
        {isSageVisible && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-off-white/95 backdrop-blur-xl">
             <header className="p-6 flex justify-between items-center bg-white/40 border-b border-white">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-olive flex items-center justify-center text-white">
                      <span className="font-serif italic font-bold">S</span>
                   </div>
                   <div>
                      <h3 className="font-serif font-bold italic text-ink">{state.preferences.assistantName || 'Sage'}</h3>
                      <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">{state.preferences.assistantPersona}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsSageVisible(false)}
                  className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-ink/40"
                >
                  <X size={20} />
                </button>
             </header>
             <div className="flex-1 overflow-hidden p-6">
                <ChatAssistant 
                  preferences={state.preferences} 
                  onComplete={() => setIsSageVisible(false)} 
                  embedded
                />
             </div>
          </div>
        )}
      </AnimatePresence>

      <div className={`${layout.maxWidth} mx-auto transition-all duration-500`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step + activeView}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Navigation */}
      {state.step === 'planner' && (
        <motion.nav 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`fixed ${layout.navPosition === 'bottom' ? 'bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm' : 'top-1/2 -translate-y-1/2 right-6 flex-col w-20 px-2'} ${layout.navStyle} flex justify-between items-center shadow-lg z-50 capitalize border border-white transition-all duration-500`}
        >
          <button 
            onClick={() => setActiveView('planner')}
            className={`flex-1 w-full flex flex-col items-center gap-1 py-3 rounded-2xl transition-all ${activeView === 'planner' ? 'text-olive bg-white/20 shadow-inner' : 'text-ink/40 hover:text-ink/60'}`}
          >
            <List size={layout.navPosition === 'side' ? 24 : 20} />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Plan</span>
          </button>
          
          <button 
            onClick={() => setActiveView('budget')}
            className={`flex-1 w-full flex flex-col items-center gap-1 py-3 rounded-2xl transition-all ${activeView === 'budget' ? 'text-olive bg-white/20 shadow-inner' : 'text-ink/40 hover:text-ink/60'}`}
          >
            <Wallet size={layout.navPosition === 'side' ? 24 : 20} />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Budget</span>
          </button>

          <button 
            onClick={() => setActiveView('aesthetics')}
            className={`flex-1 w-full flex flex-col items-center gap-1 py-3 rounded-2xl transition-all ${activeView === 'aesthetics' ? 'text-olive bg-white/20 shadow-inner' : 'text-ink/40 hover:text-ink/60'}`}
          >
            <LayoutGrid size={layout.navPosition === 'side' ? 24 : 20} />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Ideas</span>
          </button>
        </motion.nav>
      )}
    </div>
  );
}
