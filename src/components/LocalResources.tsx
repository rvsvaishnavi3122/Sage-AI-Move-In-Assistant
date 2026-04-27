/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ExternalLink, Truck, ShoppingBag, Map as MapIcon, Info } from 'lucide-react';

interface Props {
  city?: string;
  stage: 'initial' | 'partial' | 'final';
}

interface Resource {
  title: string;
  desc: string;
  url: string;
  category: 'Moving' | 'Shopping' | 'Local';
  icon: any;
}

export default function LocalResources({ city, stage }: Props) {
  const cityName = city || 'your new city';
  
  const resources: Resource[] = [
    {
      title: 'Moving & Logistics',
      desc: `Best rated movers and packers in ${cityName}.`,
      url: 'https://www.porter.in/',
      category: 'Moving',
      icon: Truck
    },
    {
      title: 'Furniture Rental',
      desc: 'Set up your home quickly with affordable rental options.',
      url: 'https://www.rentomojo.com/',
      category: 'Shopping',
      icon: ShoppingBag
    },
    {
      title: 'Second-hand Marketplace',
      desc: `Find great deals on pre-loved items in ${cityName}.`,
      url: 'https://www.olx.in/',
      category: 'Shopping',
      icon: ShoppingBag
    },
    {
      title: 'Local Discovery',
      desc: `Explore the best neighborhoods and hidden gems in ${cityName}.`,
      url: 'https://www.google.com/maps',
      category: 'Local',
      icon: MapIcon
    }
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-3 ml-2">
        <div className="p-2 bg-sage/20 rounded-xl text-olive">
          <Info size={20} />
        </div>
        <h3 className="font-serif font-medium text-ink">Local Guide to {cityName} ✨</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {resources.map((res, i) => (
          <motion.a
            key={res.title}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group glass p-5 rounded-3xl flex items-center gap-4 hover:shadow-md transition-all border border-white/40"
          >
            <div className="w-12 h-12 bg-beige rounded-2xl flex items-center justify-center text-olive group-hover:bg-olive group-hover:text-white transition-colors shadow-sm">
              <res.icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink transition-all flex items-center gap-2">
                {res.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs text-ink/40 leading-relaxed mt-1 line-clamp-2">{res.desc}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="p-6 bg-white/40 rounded-3xl border border-white/20 text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-olive mb-1">Sage Tip 🌿</p>
        <p className="text-xs text-ink/60 serif-italic italic">
           “I suggest booking movers at least 48 hours in advance for the best rates in {cityName}.”
        </p>
      </div>
    </div>
  );
}
