import { motion } from 'framer-motion';
import { TrendingUp, Clock, IndianRupee } from 'lucide-react';
import { IndianMenuItem } from '@/types/indian-food';
import { getSpiceDisplay } from '@/data/indian-food-data';
import { cn } from '@/lib/utils';

interface TrendingSectionProps {
  title: string;
  items: IndianMenuItem[];
  onViewItem: (item: IndianMenuItem) => void;
}

export function TrendingSection({ title, items, onViewItem }: TrendingSectionProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4 pb-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => onViewItem(item)}
              className="w-44 shrink-0 rounded-2xl bg-card border border-border overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div className="relative h-28 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.nameEn}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                    item.isVeg ? "bg-green-500" : "bg-red-500"
                  )}>
                    {item.isVeg ? '🟢' : '🔴'}
                  </span>
                </div>
                
                {item.isBestseller && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold">
                      🔥 Hot
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                  {item.nameEn}
                </h3>
                <p className="text-xs text-muted-foreground mb-2 capitalize">
                  {item.region.replace('_', ' ')}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <IndianRupee className="w-3 h-3" />
                    {item.price.min}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {item.cookTime}m
                  </span>
                  <span className="text-xs">
                    {getSpiceDisplay(item.spiceLevel).slice(0, 2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
