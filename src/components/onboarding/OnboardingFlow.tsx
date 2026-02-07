import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DietaryType, 
  RegionalCuisine, 
  SpiceLevel, 
  FoodStyle,
  UserGoal,
  IndianUserProfile,
  DIETARY_OPTIONS,
  REGIONAL_CUISINES,
  SPICE_LEVELS,
  FOOD_STYLES,
  USER_GOALS,
} from '@/types/indian-food';
import { useIndianFood } from '@/context/IndianFoodContext';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { setUserProfile } = useIndianFood();
  const [step, setStep] = useState(0);
  
  // Form state
  const [dietary, setDietary] = useState<DietaryType>('vegetarian');
  const [regionalPreferences, setRegionalPreferences] = useState<RegionalCuisine[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('medium');
  const [foodStyles, setFoodStyles] = useState<FoodStyle[]>([]);
  const [budgetMin, setBudgetMin] = useState(100);
  const [budgetMax, setBudgetMax] = useState(500);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');

  const totalSteps = 4;

  const toggleRegion = (region: RegionalCuisine) => {
    setRegionalPreferences(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const toggleFoodStyle = (style: FoodStyle) => {
    setFoodStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const toggleGoal = (goal: UserGoal) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleComplete = () => {
    const profile: IndianUserProfile = {
      name: name || 'Food Lover',
      location: { city, state },
      dietary,
      regionalPreferences: regionalPreferences.length > 0 ? regionalPreferences : ['north_indian', 'south_indian'],
      spiceLevel,
      foodStyles: foodStyles.length > 0 ? foodStyles : ['home_style'],
      budgetMin,
      budgetMax,
      language: 'english',
      goals,
      onboardingComplete: true,
      createdAt: new Date(),
    };
    setUserProfile(profile);
    onComplete();
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return regionalPreferences.length >= 2;
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-background dark:via-background dark:to-background">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 max-w-md mx-auto">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  i <= step ? "bg-primary" : "bg-primary/20"
                )}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {step + 1} / {totalSteps}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-32 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Dietary Preferences */}
            {step === 0 && (
              <motion.div
                key="dietary"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">What's your eating style?</h1>
                  <p className="text-muted-foreground">Tell us about your dietary preferences</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {DIETARY_OPTIONS.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDietary(option.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left",
                        dietary === option.id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <span className="text-3xl block mb-2">{option.icon}</span>
                      <p className="font-medium">{option.nameEn}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Regional Preferences */}
            {step === 1 && (
              <motion.div
                key="regional"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Which cuisines do you love?</h1>
                  <p className="text-muted-foreground">Select at least 2 regional cuisines</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {REGIONAL_CUISINES.map((cuisine, index) => (
                    <motion.button
                      key={cuisine.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleRegion(cuisine.id)}
                      className={cn(
                        "p-3 rounded-2xl border-2 transition-all text-left",
                        regionalPreferences.includes(cuisine.id)
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl block mb-1">{cuisine.icon}</span>
                      <p className="font-medium text-sm">{cuisine.nameEn}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Spice Level & Food Style */}
            {step === 2 && (
              <motion.div
                key="spice"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">How spicy do you like it?</h1>
                  <p className="text-muted-foreground">Select your spice tolerance</p>
                </div>

                <div className="space-y-3 mb-8">
                  {SPICE_LEVELS.map((level) => (
                    <motion.button
                      key={level.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSpiceLevel(level.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                        spiceLevel === level.id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">{level.icon}</span>
                      <div className="text-left">
                        <p className="font-medium">{level.nameEn}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold">Food type preferences</h2>
                  <p className="text-sm text-muted-foreground">What kind of food do you prefer?</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {FOOD_STYLES.map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFoodStyle(style.id)}
                      className={cn(
                        "px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2",
                        foodStyles.includes(style.id)
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <span>{style.icon}</span>
                      <span className="text-sm font-medium">{style.nameEn}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Budget & Goals */}
            {step === 3 && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Let's personalize your experience</h1>
                  <p className="text-muted-foreground">Tell us about yourself and your budget</p>
                </div>

                {/* Name input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Budget range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Budget per meal</label>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex justify-between text-2xl font-bold text-primary mb-4">
                      <span>₹{budgetMin}</span>
                      <span>-</span>
                      <span>₹{budgetMax}</span>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min={50}
                        max={500}
                        step={50}
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(Math.min(Number(e.target.value), budgetMax - 50))}
                        className="w-full accent-primary"
                      />
                      <input
                        type="range"
                        min={100}
                        max={2000}
                        step={50}
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(Math.max(Number(e.target.value), budgetMin + 50))}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quick goals (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {USER_GOALS.map((goal) => (
                      <motion.button
                        key={goal.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2",
                          goals.includes(goal.id)
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <span>{goal.icon}</span>
                        <span className="text-sm">{goal.nameEn}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={prevStep}
                className="p-4 rounded-2xl border border-border bg-card hover:bg-muted transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              disabled={!canProceed()}
              className={cn(
                "flex-1 p-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2",
                canProceed()
                  ? "gradient-bg text-white shadow-glow"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {step === totalSteps - 1 ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Start Exploring</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
