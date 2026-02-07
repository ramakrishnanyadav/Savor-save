import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Heart, TrendingUp } from 'lucide-react';
import { Restaurant } from '@/types';
import { cn, getPriceRangeDisplay } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function RestaurantCard({ restaurant, index = 0, isFavorite = false, onToggleFavorite }: RestaurantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="food-card group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {restaurant.trending && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-white text-xs font-medium">
            <TrendingUp className="w-3 h-3" />Trending
          </motion.div>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{restaurant.rating}</span>
          <span className="text-muted-foreground text-xs">({restaurant.reviewCount})</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Heart className={cn("w-5 h-5 transition-colors", isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-rose-500")} />
        </motion.button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{restaurant.name}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
          <span>{restaurant.cuisine.join(', ')}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="text-amber-600 font-medium">{getPriceRangeDisplay(restaurant.priceRange)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" /><span>{restaurant.distance} km</span></div>
          <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" /><span>{restaurant.deliveryTime}</span></div>
        </div>
        {restaurant.dietaryOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {restaurant.dietaryOptions.slice(0, 3).map((option) => (<span key={option} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">{option}</span>))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
