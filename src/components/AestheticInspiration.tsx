/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Maximize, Wallet, Home, User, Users, ChevronRight, Check, ExternalLink, Plus, Building2 } from 'lucide-react';
import { AppState, AccommodationType, HomeItem } from '../types';

interface Design {
  design_name: string;
  image_prompt: string;
  image_url: string;
  pinterest_url: string;
  items_required: string[];
}

interface Theme {
  id: string;
  theme_name: string;
  icon: any;
  color: string;
  description: string;
  designs: Design[];
}

const THEME_MAP: Record<Exclude<AccommodationType, ''>, Theme[]> = {
  Studio: [
    {
      id: 'studio-minimal',
      theme_name: 'Compact Minimal',
      icon: Maximize,
      color: 'bg-white border-white/40 text-ink/40',
      description: 'Maximizing small spaces with clean, multifunctional essentials.',
      designs: [
        {
          design_name: 'The Productivity Pod',
          image_prompt: 'A cozy minimalist studio apartment with a foldable desk and sleek furniture.',
          image_url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=minimalist%20studio%20apartment%20setup',
          items_required: ['Foldable Laptop Table', 'Slim Floor Lamp', 'Floating Wall Shelf']
        },
        {
          design_name: 'Zen Corner',
          image_prompt: 'A tiny studio corner with floor cushion and indoor plant for relaxation.',
          image_url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=studio%20apartment%20zen%20corner',
          items_required: ['Floor Cushion', 'Snake Plant', 'Fairy Lights']
        },
        {
          design_name: 'Monochrome Haven',
          image_prompt: 'A studio apartment with grey and white tones and sleek multifunctional setup.',
          image_url: 'https://images.unsplash.com/photo-1505691938584-17c8c7ef7d87?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=modern%20studio%20apartment%20decor',
          items_required: ['Grey Bedding Set', 'Mesh Desk Organizer', 'Black Command Hooks']
        }
      ]
    },
    {
      id: 'studio-warm',
      theme_name: 'Cozy Personal',
      icon: Sparkles,
      color: 'bg-terracotta/10 text-terracotta',
      description: 'Adding warmth and personality to a functional studio space.',
      designs: [
        {
          design_name: 'Boho Vibe',
          image_prompt: 'A studio with macrame hangings and warm knit blankets.',
          image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=boho%20studio%20apartment%20decor',
          items_required: ['Macrame Wall Hanging', 'Knit Throw', 'Photo Grid Clip']
        },
        {
          design_name: 'Soft Glow',
          image_prompt: 'A studio apartment filled with string lights and velvet pillows.',
          image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=studio%20fairy%20lights%20setup',
          items_required: ['Warm String Lights', 'Bedside Lamp', 'Velvet Pillows']
        },
        {
          design_name: 'Rustic Touch',
          image_prompt: 'A studio with wooden crates and vintage-style posters.',
          image_url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=rustic%20studio%20apartment%20decor',
          items_required: ['Wooden Storage Box', 'Vintage Poster', 'Jute Basket']
        }
      ]
    }
  ],
  '1BHK': [
    {
      id: 'flat-modern',
      theme_name: 'Modern Industrial',
      icon: Home,
      color: 'bg-ink/10 text-ink',
      description: 'Full-scale setups with bold furniture and open layouts.',
      designs: [
        {
          design_name: 'Urban Loft',
          image_prompt: 'A living room in a flat with leather sofa and metal table.',
          image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=urban%20loft%20living%20room',
          items_required: ['Leather Sofa', 'Metal Frame Coffee Table', 'Large Area Rug']
        },
        {
          design_name: 'Concrete Dream',
          image_prompt: 'A kitchen-dining area with bar stools and minimalist table.',
          image_url: 'https://images.unsplash.com/photo-1556911223-e1520411a070?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=modern%20industrial%20kitchen',
          items_required: ['Bar Stools', '6-Seater Dining Table', 'Pendant Lighting']
        },
        {
          design_name: 'Glass & Steel',
          image_prompt: 'A bedroom with a king bed and blackout curtains.',
          image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=modern%20minimalist%20bedroom',
          items_required: ['King Bed Frame', 'Full Length Mirror', 'Blackout Curtains']
        }
      ]
    },
    {
      id: 'flat-scandi',
      theme_name: 'Scandinavian',
      icon: Maximize,
      color: 'bg-sage/20 text-olive',
      description: 'Bright, airy, and functional designs for the whole apartment.',
      designs: [
        {
          design_name: 'Light Living',
          image_prompt: 'A living room with light wood furniture and many plants.',
          image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=scandinavian%20living%20room%20plants',
          items_required: ['Oak TV Unit', 'Light Grey L-Sofa', 'Potted Monstera']
        },
        {
          design_name: 'Functional Kitchen',
          image_prompt: 'A clean kitchen setup with white cabinets.',
          image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=minimalist%20white%20kitchen%20ideas',
          items_required: ['Kitchen Utility Cart', 'Magnetic Knife Strip', 'Herb Pot Station']
        },
        {
          design_name: 'Serene Bed',
          image_prompt: 'A bright bedroom with cotton duvet and natural light.',
          image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=bright%20scandinavian%20bedroom',
          items_required: ['Plywood Bedside Table', 'Cotton Duvet Set', 'Woven Laundry Hamper']
        }
      ]
    }
  ],
  'Shared Space': [
    {
      id: 'shared-balanced',
      theme_name: 'Personal Sanctuary',
      icon: User,
      color: 'bg-terracotta/10 text-terracotta',
      description: 'Focusing on your private room while coordinating shared spaces.',
      designs: [
        {
          design_name: 'My Peaceful Pad',
          image_prompt: 'A private room with customized storage and a reading nook.',
          image_url: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=private%20bedroom%20shared%20apartment',
          items_required: ['Armchair', 'Bookshelf', 'Curtain Room Divider']
        },
        {
          design_name: 'Shared Harmony',
          image_prompt: 'A shared living area with roommate-friendly organization.',
          image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=shared%20living%20room%20organization',
          items_required: ['Modular Sofa', 'Labeled Bin Organizer', 'Common Area Clock']
        },
        {
          design_name: 'Utility Smart',
          image_prompt: 'A balcony with a compact laundry station.',
          image_url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=balcony%20laundry%20station%20ideas',
          items_required: ['Foldable Drying Rack', 'Shoe Cabinet', 'Balcony Chairs']
        }
      ]
    },
    {
      id: 'shared-budget',
      theme_name: 'Budget Collective',
      icon: Wallet,
      color: 'bg-beige text-ink/60',
      description: 'Social and functional setups using shared resources efficiently.',
      designs: [
        {
          design_name: 'The Gaming Zone',
          image_prompt: 'A shared living room with modular floor seating.',
          image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=shared%20gaming%20room%20projector',
          items_required: ['Portable Projector', 'Bean Bags (Set of 3)', 'Low Height Table']
        },
        {
          design_name: 'Kitchen Hub',
          image_prompt: 'A shared kitchen with breakfast bar stools.',
          image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=shared%20kitchen%20breakfast%20bar',
          items_required: ['Wooden Stools', 'Shared Kettle', 'Wall Mounted Chalkboard']
        },
        {
          design_name: 'Entryway Efficiency',
          image_prompt: 'A shared entryway with many hooks and shoe rack.',
          image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=shared%20entryway%20organization',
          items_required: ['Multi-tier Shoe Rack', 'Coat Hooks', 'Key Holder']
        }
      ]
    }
  ],
  '2BHK+': [
    {
      id: 'flat-luxury',
      theme_name: 'Modern Luxury',
      icon: Home,
      color: 'bg-ink/10 text-ink',
      description: 'Sophisticated setups with high-end finishes and spacious layouts.',
      designs: [
        {
          design_name: 'Grand Living',
          image_prompt: 'A large living room with designer furniture, artwork, and premium lighting.',
          image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=luxury%20modern%20living%20room',
          items_required: ['Sectional Leather Sofa', 'Floor-to-Ceiling Shelving', 'Smart Indirect Lighting']
        },
        {
          design_name: 'Master Retreat',
          image_prompt: 'A luxurious master bedroom with walk-in closet vibes and king bed.',
          image_url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=luxury%20master%20bedroom%20design',
          items_required: ['King Sized Bed', 'Plush Area Rug', 'Smart Bedside Lamps']
        },
        {
          design_name: 'Chef\'s Kitchen',
          image_prompt: 'A large open kitchen with advanced appliances and island.',
          image_url: 'https://images.unsplash.com/photo-1556912177-c54030639a03?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=modern%20chef%20kitchen%20luxury',
          items_required: ['Kitchen Island Stools', 'Double Door Fridge', 'Built-in Microwave']
        }
      ]
    },
    {
      id: 'flat-family',
      theme_name: 'Family Heritage',
      icon: Users,
      color: 'bg-sage/20 text-olive',
      description: 'Warm, durable, and inviting spaces for the entire family.',
      designs: [
        {
          design_name: 'Family Hub',
          image_prompt: 'A warm living room with a large comfortable sofa and display units for photos.',
          image_url: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=family%20friendly%20living%20room',
          items_required: ['Large 5-Seater Sofa', 'Family Photo Gallery Wall', 'Hidden Storage Ottomans']
        },
        {
          design_name: 'Kid\'s Zone / Guest Room',
          image_prompt: 'A versatile second bedroom with bright accents and storage.',
          image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
          pinterest_url: 'https://www.pinterest.com/search/pins/?q=kids%20bedroom%20guest%20room%20combo',
          items_required: ['Twin Bed with Trundle', 'Toy/Linen Storage Cubes', 'Colorful Study Lamp']
        }
      ]
    }
  ],
};

interface Props {
  state: AppState;
  onUpdateItems: (items: HomeItem[]) => void;
}

export default function AestheticInspiration({ state, onUpdateItems }: Props) {
  const [accommodation, setAccommodation] = useState<AccommodationType>(state.preferences.accommodationType || '');
  
  const themes = useMemo(() => {
    if (!accommodation) return [];
    return THEME_MAP[accommodation as keyof typeof THEME_MAP] || [];
  }, [accommodation]);

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const selectedTheme = themes.find(t => t.id === selectedThemeId) || themes[0];

  const addItemToPlan = (itemName: string) => {
    const isAlreadyAdded = state.items.some(i => i.name === itemName);
    if (isAlreadyAdded) return;

    const newItem: HomeItem = {
      id: Math.random().toString(36).substring(7),
      name: itemName,
      category: 'Living Room',
      priority: 'Must-have',
      urgency: 4,
      estimatedCost: 2000,
      completed: false,
      reasoning: 'Recommended gear from ' + (selectedTheme?.theme_name || 'moodboard'),
      tags: ['Decorator Choice']
    };
    onUpdateItems([...state.items, newItem]);
  };

  if (!accommodation) {
    const spaceTypes = [
      { 
        id: 'Shared Space', 
        title: 'Shared Space', 
        subtitle: 'PG / Co-living', 
        icon: Maximize, 
        img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' 
      },
      { 
        id: 'Studio', 
        title: 'Studio', 
        subtitle: 'Minimalist Flat', 
        icon: Building2, 
        img: 'https://images.unsplash.com/photo-1536376074432-8442658292ba?auto=format&fit=crop&w=800&q=80' 
      },
      { 
        id: '1BHK', 
        title: '1BHK', 
        subtitle: 'Your Own Place', 
        icon: Home, 
        img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' 
      },
      { 
        id: '2BHK+', 
        title: '2BHK+', 
        subtitle: 'Spacious Life', 
        icon: Users, 
        img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' 
      },
    ] as const;

    return (
      <div className="space-y-10 pb-12">
        <header className="space-y-1 pt-6">
          <h2 className="text-3xl font-serif font-bold italic text-ink">Decorator Setup ✨</h2>
          <p className="text-[10px] text-terracotta font-bold uppercase tracking-[0.2em]">Craft your master plan</p>
        </header>

        <div className="space-y-4">
          <p className="text-[10px] text-ink/40 font-bold uppercase tracking-[0.2em] ml-2">Choose your space type</p>
          <div className="space-y-6">
            {spaceTypes.map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setAccommodation(type.id);
                  setSelectedThemeId(THEME_MAP[type.id][0].id);
                }}
                className="w-full relative h-48 rounded-[40px] overflow-hidden group shadow-lg hover:shadow-2xl transition-all border-none"
              >
                <img 
                  src={type.img} 
                  alt={type.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute inset-0 p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30 group-hover:bg-white group-hover:text-ink transition-colors">
                      <type.icon size={32} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-serif font-bold text-white group-hover:translate-x-1 transition-transform">{type.title}</h3>
                      <p className="text-sm text-white/60 font-medium italic mt-1">{type.subtitle}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-start pt-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-medium text-ink italic leading-tight">Decorator Corner ✨</h2>
          <p className="text-[10px] text-terracotta font-bold uppercase tracking-[0.2em]">Moodboard for your {accommodation}</p>
        </div>
        <button 
          onClick={() => setAccommodation('')}
          className="p-2 border border-ink/5 rounded-full text-ink/30 hover:text-ink transition-colors"
        >
          <Home size={18} />
        </button>
      </header>

      {/* Theme Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => setSelectedThemeId(theme.id)}
            className={`flex flex-col items-center gap-3 p-4 rounded-3xl min-w-[100px] shrink-0 transition-all border-2 ${
              selectedTheme.id === theme.id 
                ? 'bg-olive border-olive text-white shadow-lg' 
                : 'bg-white border-white/40 text-ink/40 hover:border-white'
            }`}
          >
            <div className={`p-3 rounded-2xl ${selectedTheme.id === theme.id ? 'bg-white/20' : theme.color}`}>
              <theme.icon size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{theme.theme_name}</span>
          </button>
        ))}
      </div>

      {/* Theme Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTheme.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
             <p className="text-ink/60 leading-relaxed italic text-center serif-italic px-4">
                &ldquo;{selectedTheme.description}&rdquo;
              </p>
          </div>

          <div className="space-y-12">
            {selectedTheme.designs.map((design, index) => (
              <motion.div 
                key={design.design_name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-white"
              >
                {/* Visual Image */}
                <div className="h-64 relative overflow-hidden cursor-pointer" onClick={() => window.open(design.pinterest_url, '_blank')}>
                  <img 
                    src={design.image_url} 
                    alt={design.design_name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
                    <h3 className="text-2xl font-serif font-semibold italic text-white">{design.design_name}</h3>
                    <a 
                      href={design.pinterest_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-[#E60023] transition-all border border-white/30 pointer-events-auto"
                      title="See more on Pinterest"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/20">Design Summary</p>
                      <p className="text-xs text-ink/60 font-medium italic leading-relaxed">
                        &ldquo;{design.image_prompt}&rdquo;
                      </p>
                    </div>
                    <div className="bg-sage/20 text-olive p-2 rounded-xl shrink-0">
                      <Sparkles size={16} />
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-olive">Required Gear</h4>
                    <div className="flex flex-wrap gap-2">
                      {design.items_required.map(item => {
                        const isAdded = state.items.some(i => i.name === item);
                        return (
                          <button 
                            key={item} 
                            onClick={() => addItemToPlan(item)}
                            disabled={isAdded}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                              isAdded 
                              ? 'bg-olive/10 border-olive/20 text-olive' 
                              : 'bg-beige/50 border-ink/5 text-ink/60 hover:border-olive/30 hover:bg-white'
                            }`}
                          >
                            {isAdded ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                            <span className="text-[11px] font-bold uppercase tracking-tight">{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-6 bg-terracotta/5 rounded-[40px] flex items-center gap-4 border border-terracotta/10">
            <div className="w-12 h-12 bg-terracotta rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">Decorator Tip</p>
              <p className="text-xs text-ink/40 font-medium italic">Layering textures like rugs and throws makes any rental feel like home. 🏠</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

