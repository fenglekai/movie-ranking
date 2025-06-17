import { Movie } from "@/types/movie";
import { Star, Flame, TrendingUp } from "lucide-react";

interface MobileMovieCardProps {
  movie: Movie;
  rank: number;
}

const getRankStyle = (rank: number) => {
  if (rank === 1)
    return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
  if (rank === 2)
    return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
  if (rank === 3)
    return "bg-gradient-to-r from-amber-600 to-amber-800 text-white";
  return "bg-muted text-muted-foreground";
};

export function MobileMovieCard({ movie, rank }: MobileMovieCardProps) {
  return (
    <a href={movie.url} target="_blank" className="block">
      <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-all duration-200 border-b border-border/50 last:border-b-0">
        {/* 排名 */}
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(
            rank
          )}`}
        >
          {rank <= 3 ? <TrendingUp className="w-3 h-3" /> : rank}
        </div>

        {/* 标题 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-1 text-foreground">
            {movie.title}
          </h3>
        </div>

        {/* 评分/热度 */}
        <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0 text-xs">
          {movie.rating > 0 ? (
            <>
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{movie.rating}</span>
            </>
          ) : movie.hot ? (
            <>
              <Flame className="w-3 h-3 fill-current" />
              <span className="font-medium">{movie.hot}</span>
            </>
          ) : (
            <span className="font-medium text-muted-foreground">暂无</span>
          )}
        </div>
      </div>
    </a>
  );
} 