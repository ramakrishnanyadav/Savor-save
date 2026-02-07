import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Edit, 
  Check, 
  X,
  Upload,
  UtensilsCrossed,
  Flame,
  Wallet,
  Target,
  LogOut
} from 'lucide-react';
import { useIndianFood } from '@/context/IndianFoodContext';
import { useAuth } from '@/context/AuthContext';
import { 
  DietaryType, 
  RegionalCuisine, 
  SpiceLevel, 
  FoodStyle, 
  UserGoal,
  DIETARY_OPTIONS,
  REGIONAL_CUISINES,
  SPICE_LEVELS,
  FOOD_STYLES,
  USER_GOALS
} from '@/types/indian-food';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const defaultAvatars = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=d1f4d9',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=ffdfba',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=ffeaa7',
];

export function EditableProfileView() {
  const { userProfile, updateProfile, favorites } = useIndianFood();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edited profile when user profile changes
  if (!editedProfile && userProfile) {
    setEditedProfile(userProfile);
  }

  const handleSave = () => {
    if (editedProfile) {
      updateProfile(editedProfile);
      toast.success('✅ Profile updated! Recommendations will update based on your preferences.');
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditedProfile(prev => prev ? { ...prev, avatar: base64 } : null);
      if (!isEditing) {
        updateProfile({ avatar: base64 });
      }
      setShowAvatarModal(false);
      toast.success('📸 Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    setEditedProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    if (!isEditing) {
      updateProfile({ avatar: avatarUrl });
    }
    setShowAvatarModal(false);
    toast.success('📸 Avatar updated!');
  };

  const toggleRegionalPreference = (region: RegionalCuisine) => {
    if (!editedProfile) return;
    const current = editedProfile.regionalPreferences || [];
    setEditedProfile({
      ...editedProfile,
      regionalPreferences: current.includes(region)
        ? current.filter(r => r !== region)
        : [...current, region]
    });
  };

  const toggleFoodStyle = (style: FoodStyle) => {
    if (!editedProfile) return;
    const current = editedProfile.foodStyles || [];
    setEditedProfile({
      ...editedProfile,
      foodStyles: current.includes(style)
        ? current.filter(s => s !== style)
        : [...current, style]
    });
  };

  const toggleGoal = (goal: UserGoal) => {
    if (!editedProfile) return;
    const current = editedProfile.goals || [];
    setEditedProfile({
      ...editedProfile,
      goals: current.includes(goal)
        ? current.filter(g => g !== goal)
        : [...current, goal]
    });
  };

  if (!userProfile || !editedProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const displayProfile = isEditing ? editedProfile : userProfile;

  return (
    <div className="pb-24 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary via-orange-500 to-amber-500 rounded-3xl p-6 relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
              backgroundSize: '20px 20px'
            }} 
          />
        </div>

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAvatarModal(true)}
            className="relative flex-shrink-0"
          >
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
              {displayProfile.avatar ? (
                <img 
                  src={displayProfile.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <User size={40} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg">
              <Camera size={14} className="text-primary" />
            </div>
          </motion.button>

          {/* User info */}
          <div className="flex-1 text-white">
            <h2 className="text-xl font-bold">{displayProfile.name}</h2>
            <p className="text-white/80 text-sm flex items-center gap-1">
              <MapPin size={12} />
              {displayProfile.location?.city}, {displayProfile.location?.state}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <div className="text-center">
                <span className="font-bold block">{favorites.length}</span>
                <span className="text-white/70 text-xs">Favorites</span>
              </div>
              <div className="text-center">
                <span className="font-bold block">₹{displayProfile.budgetMin}-{displayProfile.budgetMax}</span>
                <span className="text-white/70 text-xs">Budget</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <div className="absolute top-2 right-2">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm hover:bg-white/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-white px-3 py-1.5 rounded-lg text-primary text-sm font-medium flex items-center gap-1 hover:bg-white/90 transition-colors"
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm flex items-center gap-1 hover:bg-white/30 transition-colors"
              >
                <Edit size={14} />
                Edit
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User size={18} className="text-primary" />
          Personal Information
        </h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-muted-foreground">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="font-medium">{displayProfile.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail size={12} />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedProfile.email || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="font-medium">{displayProfile.email || 'Not set'}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone size={12} />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editedProfile.phone || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="font-medium">{displayProfile.phone || 'Not set'}</p>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.location?.city || ''}
                  onChange={(e) => setEditedProfile({ 
                    ...editedProfile, 
                    location: { ...editedProfile.location, city: e.target.value } 
                  })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <p className="font-medium">{displayProfile.location?.city || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground">State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.location?.state || ''}
                  onChange={(e) => setEditedProfile({ 
                    ...editedProfile, 
                    location: { ...editedProfile.location, state: e.target.value } 
                  })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <p className="font-medium">{displayProfile.location?.state || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Food Preferences - Key for recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-primary" />
          Food Preferences
          <span className="text-xs text-muted-foreground font-normal ml-auto">Affects recommendations</span>
        </h3>

        {/* Dietary */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Dietary Preference</label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => isEditing && setEditedProfile({ ...editedProfile, dietary: opt.id as DietaryType })}
                disabled={!isEditing}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all",
                  displayProfile.dietary === opt.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground",
                  isEditing && "hover:scale-105 cursor-pointer"
                )}
              >
                {opt.icon} {opt.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Regional Cuisines */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Favorite Regional Cuisines</label>
          <div className="flex flex-wrap gap-2">
            {REGIONAL_CUISINES.map(cuisine => (
              <button
                key={cuisine.id}
                onClick={() => isEditing && toggleRegionalPreference(cuisine.id as RegionalCuisine)}
                disabled={!isEditing}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all",
                  displayProfile.regionalPreferences?.includes(cuisine.id as RegionalCuisine)
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground",
                  isEditing && "hover:scale-105 cursor-pointer"
                )}
              >
                {cuisine.icon} {cuisine.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Spice Level */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Flame size={14} />
            Spice Tolerance: {SPICE_LEVELS.find(s => s.id === displayProfile.spiceLevel)?.nameEn || 'Medium'}
          </label>
          {isEditing ? (
            <div className="flex gap-2">
              {SPICE_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setEditedProfile({ ...editedProfile, spiceLevel: level.id as SpiceLevel })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm transition-all",
                    displayProfile.spiceLevel === level.id
                      ? "bg-red-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {level.icon} {level.nameEn}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(level => {
                const spiceIndex = SPICE_LEVELS.findIndex(s => s.id === displayProfile.spiceLevel) + 1;
                return (
                  <span
                    key={level}
                    className={`text-xl ${level <= spiceIndex ? 'opacity-100' : 'opacity-20'}`}
                  >
                    🌶️
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Food Styles */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Preferred Styles</label>
          <div className="flex flex-wrap gap-2">
            {FOOD_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => isEditing && toggleFoodStyle(style.id as FoodStyle)}
                disabled={!isEditing}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all",
                  displayProfile.foodStyles?.includes(style.id as FoodStyle)
                    ? "bg-blue-500 text-white"
                    : "bg-muted text-muted-foreground",
                  isEditing && "hover:scale-105 cursor-pointer"
                )}
              >
                {style.icon} {style.nameEn}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Budget Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-primary" />
          Budget Range
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Minimum (₹)</label>
            {isEditing ? (
              <input
                type="number"
                value={editedProfile.budgetMin}
                onChange={(e) => setEditedProfile({ ...editedProfile, budgetMin: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="font-medium text-lg">₹{displayProfile.budgetMin}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Maximum (₹)</label>
            {isEditing ? (
              <input
                type="number"
                value={editedProfile.budgetMax}
                onChange={(e) => setEditedProfile({ ...editedProfile, budgetMax: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <p className="font-medium text-lg">₹{displayProfile.budgetMax}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target size={18} className="text-primary" />
          Your Goals
        </h3>

        <div className="flex flex-wrap gap-2">
          {USER_GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => isEditing && toggleGoal(goal.id as UserGoal)}
              disabled={!isEditing}
              className={cn(
                "px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2",
                displayProfile.goals?.includes(goal.id as UserGoal)
                  ? "bg-violet-500 text-white"
                  : "bg-muted text-muted-foreground",
                isEditing && "hover:scale-105 cursor-pointer"
              )}
            >
              <span className="text-lg">{goal.icon}</span>
              {goal.nameEn}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-muted-foreground">Logged in account</p>
          </div>
          <button
            onClick={async () => {
              setIsLoggingOut(true);
              await signOut();
              toast.success('Logged out successfully');
            }}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Choose Avatar</h3>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Upload option */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-4 py-3 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload size={20} />
                Upload Photo
              </button>

              {/* Default avatars */}
              <p className="text-sm text-muted-foreground mb-3">Or choose from defaults:</p>
              <div className="grid grid-cols-3 gap-3">
                {defaultAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAvatar(avatar)}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                  >
                    <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
