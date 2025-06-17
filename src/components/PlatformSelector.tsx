import { Platform } from '@/types/movie';

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatform: string;
  onPlatformChange: (platformId: string) => void;
}

export function PlatformSelector({ platforms, selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {platforms.map((platform) => {
        const isSelected = selectedPlatform === platform.id;
        
        return (
          <button
            key={platform.id}
            onClick={() => onPlatformChange(platform.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isSelected
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:scale-105'
            }`}
          >
            <div className={`w-5 h-5 rounded ${platform.color} flex items-center justify-center text-white text-xs`}>
              {platform.logo}
            </div>
            <span>{platform.name}</span>
          </button>
        );
      })}
    </div>
  );
} 