
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Platform = 'ios' | 'android' | 'web';

export interface LayoutConfig {
  maxWidth: string;
  padding: string;
  gridCols: string;
  showSidebar: boolean;
  navPosition: 'bottom' | 'side' | 'top';
  cardSpacing: string;
  platform: Platform;
  navStyle: string; // Tailwind classes for platform specific styling
}

const getPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'web';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'web';
};

export const getLayoutConfig = (_width: number): LayoutConfig => {
  const platform = getPlatform();

  // Always return mobile/app-optimized layout for "Complete Mobile Mode"
  return {
    maxWidth: 'max-w-md',
    padding: 'px-6',
    gridCols: 'grid-cols-1',
    showSidebar: false,
    navPosition: 'bottom',
    cardSpacing: 'space-y-4',
    platform,
    navStyle: platform === 'ios' ? 'pb-8 rounded-[40px] backdrop-blur-xl bg-white/60' : 'pb-4 rounded-2xl bg-white/90 shadow-lg',
  };
};
