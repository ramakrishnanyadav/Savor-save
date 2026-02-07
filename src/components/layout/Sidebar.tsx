import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Compass, 
  Receipt, 
  BarChart3, 
  Wallet,
  User,
  ChevronLeft,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'orders', label: 'My Orders', icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Sidebar({ activeView, onViewChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen bg-card/50 backdrop-blur-xl border-r border-border/50 sticky top-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: isCollapsed ? 0 : 1 }}
        >
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg gradient-text"
              >
                Culinary Compass
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'gradient-bg text-white shadow-glow'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground text-center"
            >
              Track • Discover • Save
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
