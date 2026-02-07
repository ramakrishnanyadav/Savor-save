import { motion } from 'framer-motion';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { RestaurantCard } from './RestaurantCard';
import { Restaurant } from '@/types';

interface RecommendedCarouselProps {
  restaurants: Restaurant[];
  title: string;
  subtitle?: string;
}

export function RecommendedCarousel({ restaurants, title, subtitle }: RecommendedCarouselProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <motion.button
          whileHover={{ x: 4 }}
          className="flex items-center gap-1 text-sm text-primary font-medium"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {restaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="flex-shrink-0 w-[280px] snap-start">
              <RestaurantCard restaurant={restaurant} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
