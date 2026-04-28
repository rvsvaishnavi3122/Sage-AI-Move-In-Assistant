/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IndianRupee, TrendingDown, Wallet, ShoppingBag, CheckCircle2, Circle, AlertCircle, Edit2, X, Banknote } from 'lucide-react';
import { AppState, HomeItem } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';

interface Props {
  state: AppState;
  onUpdateItems: (items: HomeItem[]) => void;
  onUpdateBudget: (budget: number) => void;
}

export default function BudgetScreen({ state, onUpdateItems, onUpdateBudget }: Props) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(state.preferences.budget.toString());
  const currencySymbol = CURRENCY_SYMBOLS[state.preferences.currency] || state.preferences.currency;

  const stats = useMemo(() => {
    const totalSetupCost = state.items.reduce((acc, item) => acc + item.estimatedCost, 0);
    const actualSpend = state.items.reduce((acc, item) => acc + (item.completed ? (item.actualCost || item.estimatedCost) : 0), 0);
    const savings = state.items.reduce((acc, item) => {
      if (item.completed && item.actualCost && item.actualCost < item.estimatedCost) {
        return acc + (item.estimatedCost - item.actualCost);
      }
      return acc;
    }, 0);
    
    const totalBudget = state.preferences.budget || totalSetupCost;
    const remainingBudget = totalBudget - actualSpend;
    const progress = (actualSpend / totalBudget) * 100;
    
    return { totalSetupCost, actualSpend, savings, progress, remainingBudget, totalBudget };
  }, [state.items, state.preferences.budget]);

  const updateActualCost = (id: string, cost: number) => {
    onUpdateItems(state.items.map(item => 
      item.id === id ? { ...item, actualCost: cost, completed: true } : item
    ));
    setEditingItem(null);
  };

  const toggleItem = (id: string) => {
    onUpdateItems(state.items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getAccommodationName = () => {
    switch (state.preferences.accommodationType) {
      case 'Shared Space': return 'Shared Residency';
      case '1BHK': return '1BHK Setup';
      case '2BHK+': return 'Family Home Setup';
      case 'Studio': return 'Studio Loft';
      default: return 'Home Setup';
    }
  };

  return (
    <div className="space-y-8 pb-24 text-ink">
      <header className="space-y-4 pt-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-3xl font-serif font-bold italic text-ink">{getAccommodationName()}</h2>
          <div className="bg-sage/10 text-sage p-2 rounded-2xl">
            <TrendingDown size={24} />
          </div>
        </div>
        
        {/* Financial Overview Card */}
        <div className="bg-ink shadow-xl shadow-ink/20 rounded-[48px] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20 transition-transform group-hover:scale-110" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Total Actual Spend</p>
                <h3 className="text-5xl font-serif font-bold italic tracking-tight">{currencySymbol}{stats.actualSpend.toLocaleString()}</h3>
              </div>
              <div className="bg-white/10 p-4 rounded-[28px] backdrop-blur-md border border-white/10">
                <Wallet size={28} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div 
                className="relative group/budget cursor-pointer"
                onClick={() => {
                  setTempBudget(state.preferences.budget.toString());
                  setIsEditingBudget(true);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Target Budget</p>
                   <Edit2 size={8} className="text-white/20 group-hover/budget:text-white transition-colors" />
                </div>
                <p className="text-2xl font-serif font-bold transition-colors group-hover/budget:text-sage">₹{stats.totalBudget.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage/60">Remaining</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-2xl font-serif font-bold italic ${stats.remainingBudget < 0 ? 'text-terracotta' : 'text-sage'}`}>
                    ₹{stats.remainingBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Budget Edit Modal */}
      <AnimatePresence>
        {isEditingBudget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsEditingBudget(false)}
               className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass rounded-[40px] p-8 w-full max-w-xs shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-semibold text-ink italic">Target Budget</h3>
                <button 
                  onClick={() => setIsEditingBudget(false)}
                  className="p-2 hover:bg-ink/5 rounded-full text-ink/40"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" size={20} />
                <input 
                  autoFocus
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       onUpdateBudget(parseInt(tempBudget) || 0);
                       setIsEditingBudget(false);
                    }
                  }}
                  className="w-full bg-beige/30 border-2 border-white rounded-3xl py-5 pl-12 pr-6 text-2xl font-serif focus:outline-none focus:border-sage text-ink"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditingBudget(false)}
                  className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onUpdateBudget(parseInt(tempBudget) || 0);
                    setIsEditingBudget(false);
                  }}
                  className="flex-1 py-4 bg-sage text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-sage/20"
                >
                  Update Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Itemized Expenses */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">Itemized Breakdown</h3>
          <TrendingDown size={14} className="text-sage" />
        </div>

        <div className="space-y-3">
          {state.items.map((item) => (
            <motion.div
              layout
              key={item.id}
              className={`glass p-5 rounded-3xl flex items-center gap-4 transition-all ${item.completed ? 'opacity-80' : ''}`}
            >
              <button 
                onClick={() => toggleItem(item.id)}
                className={`shrink-0 transition-colors ${item.completed ? 'text-sage' : 'text-ink/10'}`}
              >
                {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} strokeWidth={1.5} />}
              </button>

              <div className="flex-1 min-w-0" onClick={() => setEditingItem(item.id)}>
                <p className="font-semibold text-ink truncate text-sm">{item.name}</p>
                <p className="text-[10px] text-ink/40 uppercase tracking-wider">{item.category}</p>
              </div>

              <div className="text-right" onClick={() => setEditingItem(item.id)}>
                <p className="text-sm font-bold text-ink">{currencySymbol}{(item.actualCost || item.estimatedCost).toLocaleString()}</p>
                {item.actualCost && item.actualCost < item.estimatedCost && (
                  <p className="text-[9px] text-sage font-bold uppercase">Saved {currencySymbol}{item.estimatedCost - item.actualCost}</p>
                )}
                {item.actualCost && item.actualCost > item.estimatedCost && (
                  <p className="text-[9px] text-terracotta font-bold uppercase">Over {currencySymbol}{item.actualCost - item.estimatedCost}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analytics Insight */}
      <div className="p-6 bg-sage/10 rounded-[32px] border border-sage/20 flex gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-sage shrink-0 shadow-sm">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-sage mb-1">Budget Insight</p>
          <p className="text-xs text-ink/70 leading-relaxed serif-italic italic">
            {stats.savings > 0 
              ? `Great job! You've saved ₹${stats.savings} so far by finding better deals. Keep it up! 🌿`
              : "Track your actual spends vs estimated costs to see your real-time savings. Every rupee counts! ✨"}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass rounded-[40px] p-8 w-full max-w-xs shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-semibold text-ink italic">Spent Amount</h3>
                <div className="bg-sage/10 p-2 rounded-xl text-sage">
                  <ShoppingBag size={20} />
                </div>
              </div>

              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" size={20} />
                <input 
                  autoFocus
                  type="number"
                  placeholder="0"
                  defaultValue={state.items.find(i => i.id === editingItem)?.actualCost || state.items.find(i => i.id === editingItem)?.estimatedCost}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateActualCost(editingItem, parseInt((e.target as HTMLInputElement).value) || 0);
                  }}
                  className="w-full bg-beige/30 border-2 border-white rounded-3xl py-5 pl-12 pr-6 text-2xl font-serif focus:outline-none focus:border-sage text-ink"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-ink/40"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                    updateActualCost(editingItem, parseInt(input.value) || 0);
                  }}
                  className="flex-1 py-4 bg-sage text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-sage/20"
                >
                  Save Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
