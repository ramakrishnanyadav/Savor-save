import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Moon, Sun, Plus, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';

interface TopBarProps {
  onAddExpense: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onViewChange?: (view: string) => void;
}

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'budget',
    title: 'Budget Alert',
    message: 'You\'ve used 75% of your monthly budget',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'expense',
    title: 'Expense Added',
    message: 'Successfully added ₹450 expense at Punjabi Tadka',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'New Restaurant',
    message: 'Check out the new Italian place near you!',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Achievement Unlocked',
    message: 'You\'ve tried 10 different cuisines! 🎉',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

export function TopBar({ onAddExpense, isDarkMode, onToggleDarkMode, onViewChange }: TopBarProps) {
  const { userProfile } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget': return '💰';
      case 'expense': return '🧾';
      case 'recommendation': return '🍽️';
      case 'achievement': return '🏆';
      default: return '📢';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <motion.div
          className={cn(
            'relative flex-1 max-w-md transition-all duration-300',
            isSearchFocused && 'max-w-lg'
          )}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search restaurants, cuisines..."
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-xl',
              'bg-muted/50 border border-transparent',
              'focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20',
              'transition-all duration-300 placeholder:text-muted-foreground'
            )}
          />
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Add Expense Button */}
          <motion.button
            onClick={onAddExpense}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white font-medium shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span>Add Expense</span>
          </motion.button>

          {/* Mobile Add Button */}
          <motion.button
            onClick={onAddExpense}
            className="sm:hidden p-3 rounded-xl gradient-bg text-white shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={onToggleDarkMode}
            className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className={cn(
                            'flex items-start gap-3 p-4 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer relative group',
                            !notification.read && 'bg-primary/5'
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground text-sm">{notification.title}</p>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(notification.time, { addSuffix: true })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-muted transition-all"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-border">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onViewChange?.('profile');
                        }}
                        className="w-full py-2 text-sm text-center text-primary hover:text-primary/80 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar */}
          <motion.button
            onClick={() => onViewChange?.('profile')}
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-border"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-2 ring-border">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
