import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-background dark:via-background dark:to-background overflow-hidden relative">
      {/* Floating food illustrations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated food emojis */}
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            rotate: [-5, 5, -5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-6xl"
        >
          🍛
        </motion.div>
        <motion.div
          animate={{ 
            y: [10, -10, 10],
            rotate: [5, -5, 5],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[20%] right-[15%] text-5xl"
        >
          🥘
        </motion.div>
        <motion.div
          animate={{ 
            y: [-15, 15, -15],
            rotate: [-3, 3, -3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[30%] left-[15%] text-5xl"
        >
          🍲
        </motion.div>
        <motion.div
          animate={{ 
            y: [15, -15, 15],
            rotate: [3, -3, 3],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute bottom-[35%] right-[10%] text-6xl"
        >
          🥙
        </motion.div>
        <motion.div
          animate={{ 
            y: [-8, 8, -8],
            rotate: [-4, 4, -4],
          }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute top-[45%] left-[5%] text-4xl"
        >
          🌶️
        </motion.div>
        <motion.div
          animate={{ 
            y: [8, -8, 8],
            rotate: [4, -4, 4],
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute top-[40%] right-[8%] text-4xl"
        >
          🫓
        </motion.div>
        
        {/* Background blurs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center shadow-glow mx-auto mb-6">
            <span className="text-5xl">🍽️</span>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold mb-3"
          >
            <span className="gradient-text">Khana Khazana</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-muted-foreground"
          >
            Your personal Indian food companion
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-muted-foreground mt-1"
          >
            आपका व्यक्तिगत भारतीय खाना साथी
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 mb-12 max-w-md"
        >
          {[
            { icon: '🎯', text: 'Smart Recommendations' },
            { icon: '₹', text: 'Budget Friendly' },
            { icon: '📅', text: 'Meal Planning' },
            { icon: '🌶️', text: 'Spice Preferences' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border"
            >
              <span>{feature.icon}</span>
              <span className="text-sm font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="flex items-center gap-3 px-10 py-5 rounded-2xl gradient-bg text-white text-xl font-semibold shadow-glow animate-pulse-glow"
        >
          <Sparkles className="w-6 h-6" />
          <span>शुरू करें / Get Started</span>
        </motion.button>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Discover authentic Indian cuisine tailored just for you
        </motion.p>
      </div>
    </div>
  );
}
