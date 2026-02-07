import { motion } from 'framer-motion';
import { Home, Compass, Receipt, BarChart3, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'orders', label: 'Orders', icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'budget', label: 'Budget', icon: Wallet },
];

export function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 px-2 py-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                className={cn(
                  'p-2 rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
