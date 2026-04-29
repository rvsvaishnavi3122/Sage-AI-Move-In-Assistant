/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, IndianRupee, Banknote, LayoutGrid, List, Plus, Wallet, ShoppingBag, Eye, Trash2, MapPin, Edit2, X, Sparkles, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { AppState, HomeItem } from '../types';
import LocalResources from './LocalResources';
import { CURRENCY_SYMBOLS } from '../constants';

interface Props {
  state: AppState;
  onUpdateItems: (items: HomeItem[]) => void;
  onToggleComplete: (id: string) => void;
  onToggleAesthetics: () => void;
  onUpdateBudget: (budget: number) => void;
}

function ListItem({ item, toggleComplete, startEdit, deleteItem, currencySymbol }: { 
  item: HomeItem, 
  toggleComplete: (id: string) => void, 
  startEdit: (item: HomeItem) => void, 
  deleteItem: (id: string) => void,
  currencySymbol: string
}) {
  return (
    <motion.div 
      layout
      className={`glass p-4 rounded-3xl flex items-center gap-4 transition-all ${item.completed ? 'opacity-60 scale-[0.98]' : 'hover:shadow-md'}`}
    >
      <button 
        onClick={() => toggleComplete(item.id)}
        className={`shrink-0 transition-colors ${item.completed ? 'text-olive shadow-sm' : 'text-ink/10'}`}
      >
        {item.completed ? <CheckCircle2 size={32} /> : <Circle size={32} strokeWidth={1.5} />}
      </button>
      
      <div className="flex-1 min-w-0" onClick={() => startEdit(item)}>
        <h4 className={`font-semibold text-ink transition-all truncate ${item.completed ? 'line-through text-ink/40' : ''}`}>
          {item.name}
        </h4>
        <div className="flex gap-2 items-center mt-1">
          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
            item.priority === 'Critical' ? 'bg-terracotta/10 text-terracotta border border-terracotta/20' : 
            item.priority === 'Must-have' ? 'tag-buy-now' : 'tag-later'
          }`}>
            {item.priority}
          </span>
          {item.reasoning && (
            <span className="text-[8px] text-ink/30 italic truncate max-w-[150px]">
              “{item.reasoning}”
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-xs font-bold text-ink/40 italic">{currencySymbol}{item.estimatedCost}</span>
        <button 
          onClick={() => deleteItem(item.id)}
          className="p-1 text-ink/10 hover:text-terracotta transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Planner({ state, onUpdateItems, onToggleComplete, onToggleAesthetics, onUpdateBudget }: Props) {
  const [view, setView] = useState<'strategy' | 'category' | 'priority' | 'local' | 'all'>('strategy');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemNameInput, setItemNameInput] = useState('');
  const [itemCategoryInput, setItemCategoryInput] = useState<HomeItem['category']>('Bedroom');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(state.preferences.budget.toString());
  const currencySymbol = CURRENCY_SYMBOLS[state.preferences.currency] || state.preferences.currency;

  const stats = useMemo(() => {
    const totalSetupCost = state.items.reduce((acc, item) => acc + item.estimatedCost, 0);
    const totalActualSpend = state.items.reduce((acc, item) => acc + (item.completed ? (item.actualCost || item.estimatedCost) : 0), 0);
    const budgetLimit = state.preferences.budget || totalSetupCost || 1;
    const progress = totalActualSpend > 0 ? (totalActualSpend / budgetLimit) * 100 : 0;
    const completionRate = state.items.length > 0 ? (state.items.filter(i => i.completed).length / state.items.length) : 0;
    
    // Urgent Today: Critical + Uncompleted
    const dailyFocus = state.items
      .filter(i => !i.completed && i.priority === 'Critical')
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, 3);

    // Looking Ahead: Must-have + Uncompleted (not in dailyFocus)
    const lookingAhead = state.items
      .filter(i => !i.completed && i.priority === 'Must-have' && !dailyFocus.find(df => df.id === i.id))
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, 3);

    return { totalActual: totalActualSpend, progress, completionRate, dailyFocus, lookingAhead, totalSetupCost };
  }, [state.items, state.preferences.budget]);

  // Sage dynamic advice
  const sageAdvice = useMemo(() => {
    if (stats.completionRate === 0) return "Let's start with your critical 48-hour items. I've prioritized them for you.";
    if (stats.completionRate < 0.3) return "Great start! You've handled the basics. Ready to tackle the bedroom next?";
    if (stats.progress > 90) return "Careful! You're nearing your budget limit. Let's look for 'Nice-to-have' items to skip.";
    return "Steady progress. Don't forget to check the 'Local Tips' for finding good deals in " + (state.preferences.targetCity || "town") + ".";
  }, [stats.completionRate, stats.progress, state.preferences.targetCity]);

  const toggleComplete = (id: string) => {
    onToggleComplete(id);
  };

  const addItem = () => {
    if (!itemNameInput.trim()) return;
    const item: HomeItem = {
      id: Math.random().toString(36).substring(7),
      name: itemNameInput.trim(),
      category: itemCategoryInput,
      priority: 'Must-have',
      urgency: 5,
      estimatedCost: 2000, // Default for custom items
      completed: false
    };
    onUpdateItems([...state.items, item]);
    setItemNameInput('');
    setIsAddingItem(false);
  };

  const saveEditedItem = () => {
    if (!editingItemId || !itemNameInput.trim()) return;
    onUpdateItems(state.items.map(item => 
      item.id === editingItemId 
        ? { ...item, name: itemNameInput.trim(), category: itemCategoryInput } 
        : item
    ));
    setEditingItemId(null);
    setItemNameInput('');
  };

  const startEdit = (item: HomeItem) => {
    setEditingItemId(item.id);
    setItemNameInput(item.name);
    setItemCategoryInput(item.category);
  };

  const deleteItem = (id: string) => {
    onUpdateItems(state.items.filter(item => item.id !== id));
  };

  const categories = useMemo(() => {
    const itemCats = state.items.map(i => i.category);
    const allCats = ['Bedroom', 'Kitchen', 'Bathroom', 'Living Room', 'Essentials', 'Utility'] as const;
    // @ts-ignore - Handle mixed types if any
    return Array.from(new Set([...allCats, ...itemCats]));
  }, [state.items]);

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-serif font-medium text-ink leading-tight">My Home Plan 🏠</h2>
          {state.preferences.moveInDate && (
            <div className="bg-terracotta/10 px-4 py-2 rounded-2xl border border-terracotta/10 text-right">
              <p className="text-[8px] font-bold uppercase tracking-widest text-terracotta/60">Countdown</p>
              <p className="text-sm font-serif font-bold italic text-terracotta">
                {Math.max(0, Math.ceil((new Date(state.preferences.moveInDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days to Move
              </p>
            </div>
          )}
        </div>
        
        {/* Budget Card */}
        {state.preferences.accommodationType !== 'Shared Space' && (
          <div className="bg-sage shadow-xl shadow-sage/20 rounded-3xl p-6 text-white overflow-hidden relative border border-white/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">Overall Setup Progress</span>
                <button 
                  onClick={() => {
                    setTempBudget(state.preferences.budget.toString());
                    setIsEditingBudget(true);
                  }}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
                >
                  <Edit2 size={12} />
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold italic">{Math.round(stats.progress)}%</span>
                <span className="text-xs text-white/50 font-medium">Completed</span>
              </div>
              
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>Items Prepared</span>
                  <span>{state.items.filter(i => i.completed).length} / {state.items.length}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stats.progress, 100)}%` }}
                    className="h-full bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
                {state.preferences.currency === 'INR' ? <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-olive" size={20} /> : <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-olive" size={20} />}
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
                  className="w-full bg-beige/30 border-2 border-white rounded-3xl py-5 pl-12 pr-6 text-2xl font-serif focus:outline-none focus:border-olive text-ink"
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
                  className="flex-1 py-4 bg-olive text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-olive/20"
                >
                  Update Budget
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Control Tabs */}
      <div className="flex items-center justify-between gap-1 p-1.5 bg-sage/5 rounded-2xl border border-sage/10">
        <button 
          onClick={() => setView('strategy')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all ${view === 'strategy' ? 'bg-white shadow-sm text-olive' : 'text-ink/40'}`}
        >
          <Sparkles size={12} /> Today
        </button>
        <button 
          onClick={() => setView('all')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all ${view === 'all' ? 'bg-white shadow-sm text-olive' : 'text-ink/40'}`}
        >
          <List size={12} /> List
        </button>
        <button 
          onClick={() => setView('category')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all ${view === 'category' ? 'bg-white shadow-sm text-olive' : 'text-ink/40'}`}
        >
          <LayoutGrid size={12} /> Rooms
        </button>
        <button 
          onClick={() => setView('local')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all ${view === 'local' ? 'bg-white shadow-sm text-olive' : 'text-ink/40'}`}
        >
          <MapPin size={12} /> Tips
        </button>
      </div>

      {/* Conditional Content */}
      <AnimatePresence mode="wait">
        {view === 'strategy' && (
          <motion.div
            key="strategy-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Sage's Advice (Persistent Assistant) */}
            <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 border-2 border-white/60 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={48} className="text-olive" />
               </div>
               <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-olive flex items-center justify-center text-white shrink-0 shadow-lg shadow-olive/20">
                      <span className="font-serif italic font-bold">S</span>
                    </div>
                    {state.streak && state.streak > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-terracotta text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                        {state.streak}D
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-olive">{state.preferences.assistantName || 'Sage'}'s Advice</p>
                    <p className="text-sm text-ink/80 leading-relaxed font-serif italic">
                      “{sageAdvice}”
                    </p>
                  </div>
               </div>
            </div>

            {/* Daily Focus (Decision Engine) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" /> Today's Critical Path
                </h3>
              </div>
              
              {stats.dailyFocus.length > 0 ? (
                <div className="space-y-3">
                  {stats.dailyFocus.map(item => (
                    <ListItem key={item.id} item={item} toggleComplete={toggleComplete} startEdit={startEdit} deleteItem={deleteItem} currencySymbol={currencySymbol} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/40 h-24 rounded-[32px] border-2 border-dashed border-white/60 flex flex-col items-center justify-center text-center p-6 gap-2">
                   <CheckCircle2 className="text-olive/20" size={24} />
                   <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">Main tasks cleared!</p>
                </div>
              )}
            </div>

            {/* Looking Ahead section */}
            {stats.lookingAhead.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 flex items-center gap-2">
                    <TrendingUp size={14} className="text-olive" /> Looking Ahead
                  </h3>
                  <span className="text-[9px] text-ink/30 italic">Have extra time?</span>
                </div>
                <div className="space-y-3 bg-white/30 p-4 rounded-[32px] border border-white/20">
                  {stats.lookingAhead.map(item => (
                    <ListItem key={item.id} item={item} toggleComplete={toggleComplete} startEdit={startEdit} deleteItem={deleteItem} currencySymbol={currencySymbol} />
                  ))}
                  <button 
                    onClick={() => setView('all')}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-olive/60 flex items-center justify-center gap-2 hover:text-olive transition-colors underline-offset-4 hover:underline"
                  >
                    View full checklist <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Habit Loop / Streak */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/40 rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center text-terracotta">
                    <AlertCircle size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Next Big Spend</p>
                    <p className="text-sm font-serif font-bold italic text-ink mt-1">{currencySymbol}{Math.max(...state.items.filter(i => !i.completed).map(i => i.estimatedCost), 0).toLocaleString()}</p>
                  </div>
               </div>
               <div className="bg-white/40 rounded-3xl p-5 border border-white/60 shadow-sm flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-lg bg-olive/10 flex items-center justify-center text-olive">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Ready to Buy</p>
                    <p className="text-sm font-serif font-bold italic text-ink mt-1">{state.items.filter(i => !i.completed).length} Items</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {view === 'local' ? (
          <motion.div
            key="local-resources"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <LocalResources city={state.preferences.targetCity} stage={stats.completionRate > 0.7 ? 'final' : stats.completionRate > 0.2 ? 'partial' : 'initial'} />
          </motion.div>
        ) : view !== 'strategy' ? (
          <motion.div 
            key="items-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {view === 'all' ? (
              <div className="space-y-5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-olive flex items-center gap-2 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-olive" /> Full Checklist
                </h3>
                <div className="space-y-4">
                  {state.items.map(item => (
                    <ListItem key={item.id} item={item} toggleComplete={toggleComplete} startEdit={startEdit} deleteItem={deleteItem} currencySymbol={currencySymbol} />
                  ))}
                </div>
              </div>
            ) : view === 'category' ? (
              categories.map(cat => {
                const catItems = state.items.filter(i => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-olive flex items-center gap-2 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-olive" /> {cat}
                    </h3>
                    <div className="space-y-4">
                      {catItems.map(item => (
                        <ListItem key={item.id} item={item} toggleComplete={toggleComplete} startEdit={startEdit} deleteItem={deleteItem} currencySymbol={currencySymbol} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
                (['Critical', 'Must-have', 'Nice-to-have'] as const).map(prio => {
                  const prioItems = state.items.filter(i => i.priority === prio);
                  if (prioItems.length === 0) return null;

                  return (
                    <div key={prio} className="space-y-5">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-olive flex items-center gap-2 ml-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-olive" /> {prio}
                      </h3>
                      <div className="space-y-4">
                        {prioItems.map(item => (
                          <ListItem key={item.id} item={item} toggleComplete={toggleComplete} startEdit={startEdit} deleteItem={deleteItem} currencySymbol={currencySymbol} />
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Add New Item Hint */}
      <motion.button 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsAddingItem(true)}
        className="w-full p-8 bg-white/40 border-2 border-dashed border-white rounded-[40px] flex flex-col items-center gap-3 text-ink/30 hover:border-olive/20 hover:text-olive/40 transition-all group"
      >
        <div className="p-3 bg-white/50 rounded-2xl group-hover:bg-olive group-hover:text-white transition-all">
          <Plus size={32} />
        </div>
        <p className="font-semibold text-sm uppercase tracking-widest">Add your own items</p>
        <span className="text-[10px] text-ink/20 serif-italic italic">“Customize your setup list”</span>
      </motion.button>

      <div className="text-center">
        <button 
          onClick={onToggleAesthetics}
          className="text-olive font-bold text-xs uppercase tracking-widest hover:underline opacity-60"
        >
          Room Aesthetics
        </button>
      </div>

      {/* Add/Edit Item Modal */}
      <AnimatePresence>
        {(isAddingItem || editingItemId) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingItem(false);
                setEditingItemId(null);
                setItemNameInput('');
              }}
              className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 glass rounded-[40px] p-8 z-[60] shadow-2xl space-y-6 max-w-sm mx-auto"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-semibold text-ink italic">{editingItemId ? 'Edit Essential' : 'New Essential'}</h3>
                <p className="text-sm text-ink/60 leading-relaxed serif-italic italic">“Customize your setup list” 🌿</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-2">Item Name</label>
                  <input 
                    autoFocus
                    type="text"
                    value={itemNameInput}
                    onChange={(e) => setItemNameInput(e.target.value)}
                    placeholder="e.g. Dining Chairs"
                    className="w-full bg-white/60 border-2 border-white/40 rounded-3xl py-4 px-6 text-lg font-serif focus:outline-none focus:border-olive text-ink shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-2">Room / Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Bedroom', 'Kitchen', 'Bathroom', 'Living Room', 'Utility', 'Essentials'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setItemCategoryInput(cat)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border-2 transition-all ${
                          itemCategoryInput === cat 
                          ? 'bg-olive text-white border-olive' 
                          : 'bg-white/40 text-ink/40 border-transparent hover:border-white/60'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setIsAddingItem(false);
                    setEditingItemId(null);
                    setItemNameInput('');
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/60 text-ink/60 font-bold text-xs uppercase tracking-widest transition-all hover:bg-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={editingItemId ? saveEditedItem : addItem}
                  disabled={!itemNameInput.trim()}
                  className="flex-1 py-4 px-6 rounded-2xl bg-olive text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-olive/20 active:scale-95 disabled:opacity-50"
                >
                  {editingItemId ? 'Save' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
