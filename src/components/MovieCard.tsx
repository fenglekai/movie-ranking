import { Movie, ContentType } from '@/types/movie';
import { Badge } from '@/components/ui/badge';
import { Star, Film, Tv, Mic, TrendingUp } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  rank: number;
}

const getContentTypeIcon = (type: ContentType) => {
  switch (type) {
    case 'movie':
      return <Film className="w-3 h-3" />;
    case 'tv':
      return <Tv className="w-3 h-3" />;
    case 'variety':
      return <Mic className="w-3 h-3" />;
    default:
      return <Film className="w-3 h-3" />;
  }
};

const getContentTypeLabel = (type: ContentType) => {
  switch (type) {
    case 'movie':
      return '电影';
    case 'tv':
      return '电视剧';
    case 'variety':
      return '综艺';
    default:
      return '电影';
  }
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
  if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
  return 'bg-muted text-muted-foreground';
};

export function MovieCard({ movie, rank }: MovieCardProps) {
  return (
    <div className="group flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-all duration-200 border-b border-border/50 last:border-b-0">
      {/* 排名 */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(rank)}`}>
        {rank <= 3 ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          rank
        )}
      </div>

      {/* 主要内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{movie.rating}</span>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex gap-2 flex-wrap mb-2">
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            {getContentTypeIcon(movie.type)}
            {getContentTypeLabel(movie.type)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {movie.genre}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {movie.year}
          </Badge>
          {movie.episodes && (
            <Badge variant="outline" className="text-xs">
              {movie.episodes}集
            </Badge>
          )}
          {movie.status && (
            <Badge variant={movie.status === '完结' ? 'default' : 'secondary'} className="text-xs">
              {movie.status}
            </Badge>
          )}
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {movie.description}
        </p>
      </div>
    </div>
  );
} 