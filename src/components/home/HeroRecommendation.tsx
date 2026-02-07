import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, Clock, Flame, IndianRupee, Star, ChevronRight, Sparkles } from 'lucide-react';
import { IndianMenuItem } from '@/types/indian-food';
import { formatPrice, getSpiceDisplay } from '@/data/indian-food-data';
import { cn } from '@/lib/utils';
import { useIndianFood } from '@/context/IndianFoodContext';

interface HeroRecommendationProps {
  item: IndianMenuItem;
  onViewDetails: (item: IndianMenuItem) => void;
  onNext: () => void;
  whyRecommended?: string;
}

export function HeroRecommendation({ item, onViewDetails, onNext, whyRecommended }: HeroRecommendationProps) {
  const { addFavorite, removeFavorite, isFavorite } = useIndianFood();
  const [isLiked, setIsLiked] = useState(isFavorite(item.id));
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Swipe indicators
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Swiped right - add to favorites
      if (!isLiked) {
        addFavorite(item);
        setIsLiked(true);
      }
      onNext();
    } else if (info.offset.x < -100) {
      // Swiped left - skip
      onNext();
    } else if (info.offset.y < -100) {
      // Swiped up - view details
      onViewDetails(item);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="relative">
      {/* Swipe indicators */}
      <motion.div
        style={{ opacity: leftIndicatorOpacity }}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 text-4xl"
      >
        👎
      </motion.div>
      <motion.div
        style={{ opacity: rightIndicatorOpacity }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-4xl"
      >
        ❤️
      </motion.div>

      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        className="relative rounded-3xl overflow-hidden bg-card shadow-xl cursor-grab"
      >
        {/* Image */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <motion.img
            src={item.image}
            alt={item.nameEn}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              {item.isBestseller && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Bestseller
                </span>
              )}
              <span className={cn(
                "px-3 py-1 rounded-full text-white text-xs font-semibold",
                item.isVeg ? "bg-green-600" : "bg-red-600"
              )}>
                {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={cn(
                "p-3 rounded-full backdrop-blur-sm transition-all",
                isLiked ? "bg-red-500 text-white" : "bg-white/20 text-white"
              )}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </motion.button>
          </div>

          {/* Food info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-1">{item.nameEn}</h2>
            <p className="text-white/80 text-sm mb-3">{item.region.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <IndianRupee className="w-4 h-4" />
                {formatPrice(item.price)}
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Clock className="w-4 h-4" />
                {item.cookTime} mins
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                4.5
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                {getSpiceDisplay(item.spiceLevel)}
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Flame className="w-4 h-4" />
                {item.calories} cal
              </span>
            </div>
          </div>
        </div>

        {/* Why recommended */}
        {whyRecommended && (
          <div className="px-5 py-3 bg-primary/10 border-t border-primary/20">
            <p className="text-sm text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {whyRecommended}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-5 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewDetails(item)}
            className="flex-1 py-4 rounded-2xl gradient-bg text-white font-semibold flex items-center justify-center gap-2 shadow-glow"
          >
            I'll take it!
            <ChevronRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="px-6 py-4 rounded-2xl border-2 border-border bg-card font-semibold hover:bg-muted transition-all"
          >
            Show More
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
}
