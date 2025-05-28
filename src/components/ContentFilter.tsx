import { ContentType } from '@/types/movie';
import { Film, Tv, Mic } from 'lucide-react';

interface ContentFilterProps {
  selectedType: ContentType | 'all';
  onTypeChange: (type: ContentType | 'all') => void;
}

const filterOptions = [
  { value: 'movie' as const, label: '电影', icon: Film, shortLabel: '电影' },
  { value: 'tv' as const, label: '电视剧', icon: Tv, shortLabel: '剧集' },
  { value: 'variety' as const, label: '综艺', icon: Mic, shortLabel: '综艺' },
];

export function ContentFilter({ selectedType, onTypeChange }: ContentFilterProps) {
  return (
    <div className="flex gap-2 justify-center md:justify-start">
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedType === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onTypeChange(option.value)}
            className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isSelected
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:scale-105'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline md:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
} 