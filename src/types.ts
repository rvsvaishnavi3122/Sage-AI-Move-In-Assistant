/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AccommodationType = 'Studio' | '1BHK' | '2BHK+' | 'Shared Space' | '';
export type PersonaType = 'The Organizer' | 'The Decorator' | 'The Budget Master';
export type PriorityLevel = 'Critical' | 'Must-have' | 'Nice-to-have';

export interface HomeItem {
  id: string;
  name: string;
  category: 'Bedroom' | 'Kitchen' | 'Bathroom' | 'Living Room' | 'Essentials' | 'Utility';
  priority: PriorityLevel;
  urgency: number; // 1-10
  estimatedCost: number;
  actualCost?: number;
  completed: boolean;
  reasoning?: string; // AI explanation of why this is included
  tags?: string[];
}

export interface UserPreferences {
  accommodationType: AccommodationType;
  budget: number;
  currency: string;
  countryCode: string;
  targetCity?: string;
  assistantName?: string;
  assistantPersona?: PersonaType;
  moveInDate?: string;
}

export interface AppState {
  step: 'landing' | 'assistant_setup' | 'chat' | 'setup' | 'planner';
  preferences: UserPreferences;
  items: HomeItem[];
  dailyTasks?: string[]; // IDs of items prioritized for today
  streak?: number;
  lastActive?: string;
}
