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
  Wallet,
  Settings,
  ChevronRight,
  Download,
  Trash2,
  UtensilsCrossed,
  Moon,
  Sun,
  Bell,
  Shield,
  X,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatIndianNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface ProfileViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const defaultAvatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
];

export function ProfileView({ isDarkMode, onToggleDarkMode }: ProfileViewProps) {
  const { userProfile, updateProfile, expenses, favorites, monthlyBudget, setMonthlyBudget } = useAppContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [editedBudget, setEditedBudget] = useState(monthlyBudget);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleSave = () => {
    updateProfile(editedProfile);
    setMonthlyBudget(editedBudget);
    setIsEditMode(false);
    toast.success('✅ Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedProfile(userProfile);
    setEditedBudget(monthlyBudget);
    setIsEditMode(false);
  };

  const toggleDietaryPreference = (pref: string) => {
    const current = editedProfile.dietaryPreferences || [];
    setEditedProfile({
      ...editedProfile,
      dietaryPreferences: current.includes(pref)
        ? current.filter(p => p !== pref)
        : [...current, pref]
    });
  };

  const toggleFavoriteCuisine = (cuisine: string) => {
    const current = editedProfile.favoriteCuisines || [];
    setEditedProfile({
      ...editedProfile,
      favoriteCuisines: current.includes(cuisine)
        ? current.filter(c => c !== cuisine)
        : [...current, cuisine]
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditedProfile({ ...editedProfile, avatar: base64 });
      updateProfile({ avatar: base64 });
      setShowAvatarModal(false);
      toast.success('📸 Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    setEditedProfile({ ...editedProfile, avatar: avatarUrl });
    updateProfile({ avatar: avatarUrl });
    setShowAvatarModal(false);
    toast.success('📸 Avatar updated!');
  };

  const handleRemoveAvatar = () => {
    setEditedProfile({ ...editedProfile, avatar: '' });
    updateProfile({ avatar: '' });
    setShowAvatarModal(false);
    toast.success('Avatar removed');
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      profile: userProfile,
      expenses: expenses,
      favorites: favorites,
      budget: monthlyBudget,
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `culinary-compass-full-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('📦 All data exported successfully!');
  };

  const spiceToleranceIndex = ['mild', 'medium', 'hot', 'extra-hot'].indexOf(editedProfile.spiceTolerance || 'medium');

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-orange-500 rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
              backgroundSize: '20px 20px'
            }} 
          />
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with click to change */}
          <div className="relative flex-shrink-0 group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAvatarModal(true)}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative"
            >
              {editedProfile.avatar ? (
                <img 
                  src={editedProfile.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={64} className="text-primary" />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </motion.button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-white text-center md:text-left">
            {isEditMode ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="text-2xl md:text-3xl font-bold bg-white/20 backdrop-blur px-4 py-2 rounded-lg mb-2 w-full max-w-xs text-white placeholder-white/70"
                placeholder="Your Name"
              />
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {userProfile.name || 'Setup Your Profile'}
              </h1>
            )}
            <p className="text-white/90 mb-4">{userProfile.email || 'Add your email'}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
                <span className="text-xl md:text-2xl font-bold block">{expenses.length}</span>
                <span className="text-xs md:text-sm">Total Orders</span>
              </div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
                <span className="text-xl md:text-2xl font-bold block">{favorites.length}</span>
                <span className="text-xs md:text-sm">Favorites</span>
              </div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg text-center">
                <span className="text-xl md:text-2xl font-bold block">
                  ₹{formatIndianNumber(totalSpent)}
                </span>
                <span className="text-xs md:text-sm">Total Spent</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-all text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-white px-4 py-2 rounded-lg hover:bg-white/90 transition-all text-primary font-medium text-sm flex items-center gap-1"
                >
                  <Check size={16} />
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-all text-white flex items-center gap-2"
              >
                <Edit size={16} />
                <span className="hidden md:inline">Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Personal Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <User size={24} className="text-primary" />
            Personal Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail size={14} />
                Email
              </label>
              {isEditMode ? (
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg mt-1 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              ) : (
                <p className="font-medium mt-1 text-foreground">{userProfile.email || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone size={14} />
                Phone
              </label>
              {isEditMode ? (
                <input
                  type="tel"
                  value={editedProfile.phone || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg mt-1 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  placeholder="+91 98765 43210"
                />
              ) : (
                <p className="font-medium mt-1 text-foreground">{userProfile.phone || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin size={14} />
                Location
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  value={editedProfile.location || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg mt-1 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  placeholder="City, State"
                />
              ) : (
                <p className="font-medium mt-1 text-foreground">{userProfile.location || 'Not set'}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Food Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
            <UtensilsCrossed size={24} className="text-primary" />
            Food Preferences
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Dietary Preferences</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Halal'].map(diet => (
                  <button
                    key={diet}
                    onClick={() => isEditMode && toggleDietaryPreference(diet)}
                    disabled={!isEditMode}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      (isEditMode ? editedProfile : userProfile).dietaryPreferences?.includes(diet)
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    } ${isEditMode ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Favorite Cuisines</label>
              <div className="flex flex-wrap gap-2">
                {['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese'].map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => isEditMode && toggleFavoriteCuisine(cuisine)}
                    disabled={!isEditMode}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      (isEditMode ? editedProfile : userProfile).favoriteCuisines?.includes(cuisine)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    } ${isEditMode ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Spice Tolerance: {(isEditMode ? editedProfile : userProfile).spiceTolerance || 'Medium'}
              </label>
              {isEditMode ? (
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={spiceToleranceIndex >= 0 ? spiceToleranceIndex : 1}
                  onChange={(e) => {
                    const levels: Array<'mild' | 'medium' | 'hot' | 'extra-hot'> = ['mild', 'medium', 'hot', 'extra-hot'];
                    setEditedProfile({ ...editedProfile, spiceTolerance: levels[parseInt(e.target.value)] });
                  }}
                  className="w-full accent-primary"
                />
              ) : (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(level => (
                    <span
                      key={level}
                      className={`text-2xl ${
                        level <= (spiceToleranceIndex + 1)
                          ? 'opacity-100'
                          : 'opacity-20'
                      }`}
                    >
                      🌶️
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <Wallet size={24} className="text-primary" />
          Budget Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Monthly Budget: ₹{formatIndianNumber(isEditMode ? editedBudget : monthlyBudget)}
            </label>
            {isEditMode ? (
              <input
                type="number"
                value={editedBudget}
                onChange={(e) => setEditedBudget(Number(e.target.value))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                placeholder="15000"
              />
            ) : (
              <div className="space-y-2">
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalSpent / monthlyBudget) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                      (totalSpent / monthlyBudget) * 100 > 90 
                        ? 'bg-red-500' 
                        : (totalSpent / monthlyBudget) * 100 > 70 
                          ? 'bg-yellow-500' 
                          : 'bg-gradient-to-r from-primary to-orange-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Spent: <span className="font-medium text-foreground">₹{formatIndianNumber(totalSpent)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Remaining: <span className="font-medium text-emerald-500">₹{formatIndianNumber(Math.max(0, monthlyBudget - totalSpent))}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* App Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <Settings size={24} className="text-primary" />
          App Settings
        </h3>

        <div className="space-y-3">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
              <span className="text-foreground">Dark Mode</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`w-14 h-7 rounded-full transition-colors relative ${
                isDarkMode ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <motion.div
                animate={{ x: isDarkMode ? 28 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-md absolute top-1"
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary" />
              <span className="text-foreground">Notifications</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-primary" />
              <span className="text-foreground">Privacy & Security</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Data Management Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <Download size={24} className="text-primary" />
          Data Management
        </h3>

        <div className="space-y-3">
          <button 
            onClick={handleExportData}
            className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Download size={20} />
              <div>
                <span className="font-medium">Export All Data</span>
                <p className="text-xs opacity-70">Download profile, expenses, and settings</p>
              </div>
            </div>
            <ChevronRight size={20} />
          </button>

          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} />
              <div>
                <span className="font-medium">Delete All Data</span>
                <p className="text-xs opacity-70">This action cannot be undone</p>
              </div>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-[95vw] max-w-md bg-card rounded-2xl shadow-2xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Change Profile Photo</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Upload Option */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
                >
                  <Upload size={24} className="text-primary" />
                  <span className="font-medium text-foreground">Upload Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Default Avatars */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Or choose an avatar</p>
                  <div className="grid grid-cols-3 gap-3">
                    {defaultAvatars.map((avatar, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectAvatar(avatar)}
                        className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                      >
                        <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Remove Option */}
                {editedProfile.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    Remove Current Photo
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-[95vw] max-w-md bg-card rounded-2xl shadow-2xl p-6 border border-border"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Delete All Data?</h3>
                <p className="text-muted-foreground mb-6">
                  This will permanently delete all your expenses, favorites, and settings. This action cannot be undone.
                </p>

                <div className="mb-4">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Type <span className="font-bold text-red-500">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-center font-mono text-foreground"
                    placeholder="DELETE"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="flex-1 px-4 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-all text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteConfirmText !== 'DELETE'}
                    onClick={() => {
                      toast.success('All data cleared');
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      deleteConfirmText === 'DELETE'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    Delete Everything
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
