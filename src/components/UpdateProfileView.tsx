import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Camera, 
  ChevronLeft, 
  Scale, 
  Droplet, 
  Leaf, 
  Utensils, 
  AlertTriangle, 
  Moon, 
  Sun, 
  Save, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../contexts/lib/utils';
import { AyurSyncLoader } from './AyurSyncLoader';

interface UpdateProfileViewProps {
  onBack: () => void;
  userData: any;
  onSave: (updatedData: any) => Promise<void>;
}

export function UpdateProfileView({ onBack, userData, onSave }: UpdateProfileViewProps) {
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    photoURL: userData?.photoURL || '',
    age: userData?.age || '',
    gender: userData?.gender || '',
    height: userData?.height || '', // in cm
    weight: userData?.weight || '', // in kg
    bloodGroup: userData?.bloodGroup || '',
    dosha: userData?.dosha || '',
    dietaryIdentity: userData?.dietaryIdentity || 'No Restrictions',
    allergies: userData?.allergies || [] as string[],
    wakeTime: userData?.wakeTime || '06:00',
    sleepTime: userData?.sleepTime || '22:00',
  });

  const [activeSections, setActiveSections] = useState<string[]>(['identity']);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify({
      displayName: userData?.displayName || '',
      photoURL: userData?.photoURL || '',
      age: userData?.age || '',
      gender: userData?.gender || '',
      height: userData?.height || '',
      weight: userData?.weight || '',
      bloodGroup: userData?.bloodGroup || '',
      dosha: userData?.dosha || '',
      dietaryIdentity: userData?.dietaryIdentity || 'No Restrictions',
      allergies: userData?.allergies || [],
      wakeTime: userData?.wakeTime || '06:00',
      sleepTime: userData?.sleepTime || '22:00',
    });
    setHasChanges(isChanged);
  }, [formData, userData]);

  const bmi = useMemo(() => {
    if (!formData.height || !formData.weight) return null;
    const heightInMeters = formData.height / 100;
    return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [formData.height, formData.weight]);

  const toggleSection = (section: string) => {
    setActiveSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleAddAllergy = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newAllergy.trim()) {
      if (!formData.allergies.includes(newAllergy.trim())) {
        setFormData({ ...formData, allergies: [...formData.allergies, newAllergy.trim()] });
      }
      setNewAllergy('');
    }
  };

  const removeAllergy = (tag: string) => {
    setFormData({ ...formData, allergies: formData.allergies.filter(a => a !== tag) });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate haptic feedback
    if ('vibrate' in navigator) navigator.vibrate(50);
    
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full bg-white border border-sage-primary/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-sage-primary/20 transition-all text-gray-800 placeholder:text-gray-300";
  const labelClasses = "text-[10px] font-bold text-sage-primary/60 uppercase tracking-widest ml-2 mb-1 block";

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-32 pt-4">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Identity Basics */}
        <section className="bg-white rounded-[40px] border border-sage-primary/5 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('identity')}
            className="w-full p-8 flex items-center justify-between hover:bg-sage-primary/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-primary/10 rounded-2xl flex items-center justify-center text-sage-primary">
                <User className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-serif font-bold text-sage-primary text-lg">Identity Basics</h3>
                <p className="text-xs text-gray-400">Your core digital presence</p>
              </div>
            </div>
            {activeSections.includes('identity') ? <ChevronUp className="w-5 h-5 text-gray-300" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
          </button>

          <AnimatePresence>
            {activeSections.includes('identity') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-8 pb-8 space-y-8 overflow-hidden"
              >
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-sage-primary/10 overflow-hidden bg-white relative flex items-center justify-center font-serif font-bold text-4xl">
                      {(formData.photoURL || userData?.profileImage) ? (
                        <img 
                          src={formData.photoURL || userData?.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLDivElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={cn(
                          "w-full h-full flex items-center justify-center bg-sage-primary/10 text-sage-primary",
                          (formData.photoURL || userData?.profileImage) && "hidden"
                        )}
                      >
                        {(formData.displayName || userData?.name || 'S').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-full">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Edit</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className={labelClasses}>Display Name</label>
                    <input 
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className={inputClasses}
                      placeholder="Namaste, Seeker"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className={labelClasses}>Age</label>
                      <input 
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className={inputClasses}
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className={labelClasses}>Gender</label>
                      <div className="flex bg-sage-primary/5 p-1 rounded-2xl border border-sage-primary/10">
                        {['Male', 'Female', 'Other'].map(g => (
                          <button
                            key={g}
                            onClick={() => setFormData({ ...formData, gender: g })}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-[10px] font-bold transition-all",
                              formData.gender === g ? "bg-sage-primary text-white shadow-md" : "text-sage-primary/40 hover:text-sage-primary"
                            )}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Physical Vitals Baseline */}
        <section className="bg-white rounded-[40px] border border-sage-primary/5 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('vitals')}
            className="w-full p-8 flex items-center justify-between hover:bg-sage-primary/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-primary/10 rounded-2xl flex items-center justify-center text-sage-primary">
                <Scale className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-serif font-bold text-sage-primary text-lg">Physical Vitals</h3>
                <p className="text-xs text-gray-400">Clinical baseline metrics</p>
              </div>
            </div>
            {activeSections.includes('vitals') ? <ChevronUp className="w-5 h-5 text-gray-300" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
          </button>

          <AnimatePresence>
            {activeSections.includes('vitals') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-8 pb-8 space-y-8 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className={labelClasses}>Height (cm)</label>
                    <input 
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || '' })}
                      className={inputClasses}
                      placeholder="175"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className={labelClasses}>Weight (kg)</label>
                    <input 
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || '' })}
                      className={inputClasses}
                      placeholder="70"
                    />
                  </div>
                </div>

                {bmi && (
                  <div className="bg-sage-primary/5 p-6 rounded-[32px] border border-sage-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-primary shadow-sm">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-sage-primary/60 uppercase tracking-widest">Calculated BMI</p>
                        <p className="text-2xl font-serif font-bold text-sage-primary">{bmi}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      parseFloat(bmi) < 18.5 ? "bg-blue-50 text-blue-600" :
                      parseFloat(bmi) < 25 ? "bg-emerald-50 text-emerald-600" :
                      parseFloat(bmi) < 30 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {parseFloat(bmi) < 18.5 ? 'Underweight' :
                       parseFloat(bmi) < 25 ? 'Normal' :
                       parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className={labelClasses}>Blood Group</label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className={cn(inputClasses, "appearance-none")}
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Elite Personalization Features */}
        <section className="bg-white rounded-[40px] border border-sage-primary/5 shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('personalization')}
            className="w-full p-8 flex items-center justify-between hover:bg-sage-primary/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-primary/10 rounded-2xl flex items-center justify-center text-sage-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-serif font-bold text-sage-primary text-lg">Elite Personalization</h3>
                <p className="text-xs text-gray-400">Ayurvedic & Lifestyle anchors</p>
              </div>
            </div>
            {activeSections.includes('personalization') ? <ChevronUp className="w-5 h-5 text-gray-300" /> : <ChevronDown className="w-5 h-5 text-gray-300" />}
          </button>

          <AnimatePresence>
            {activeSections.includes('personalization') && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-8 pb-8 space-y-8 overflow-hidden"
              >
                {/* Dosha */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className={labelClasses}>Ayurvedic Constitution (Dosha)</label>
                    <button className="text-[10px] font-bold text-sage-primary hover:underline flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Take Dosha Quiz
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Vata', 'Pitta', 'Kapha'].map(d => (
                      <button
                        key={d}
                        onClick={() => setFormData({ ...formData, dosha: d })}
                        className={cn(
                          "py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                          formData.dosha === d 
                            ? "bg-sage-primary/5 border-sage-primary text-sage-primary" 
                            : "bg-white border-gray-100 text-gray-400 hover:border-sage-primary/30"
                        )}
                      >
                        <Leaf className={cn("w-5 h-5", formData.dosha === d ? "text-sage-primary" : "text-gray-300")} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{d}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Identity */}
                <div className="space-y-4">
                  <label className={labelClasses}>Dietary Identity</label>
                  <div className="flex flex-wrap gap-2">
                    {['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'No Restrictions'].map(diet => (
                      <button
                        key={diet}
                        onClick={() => setFormData({ ...formData, dietaryIdentity: diet })}
                        className={cn(
                          "px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                          formData.dietaryIdentity === diet 
                            ? "bg-sage-primary text-white border-sage-primary shadow-md" 
                            : "bg-white text-gray-400 border-gray-100 hover:border-sage-primary/30"
                        )}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergy Registry */}
                <div className="space-y-4">
                  <label className={labelClasses}>Allergy Registry</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input 
                        type="text"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyDown={handleAddAllergy}
                        placeholder="Type allergy and press Enter..."
                        className={cn(inputClasses, "pl-12")}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies.map(tag => (
                        <span 
                          key={tag}
                          className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                          {tag}
                          <button onClick={() => removeAllergy(tag)} className="hover:text-amber-900">
                            <RefreshCw className="w-3 h-3 rotate-45" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wake/Sleep Anchors */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className={labelClasses}>Wake Up</label>
                    <div className="relative">
                      <Sun className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input 
                        type="time"
                        value={formData.wakeTime}
                        onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                        className={cn(inputClasses, "pl-12")}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className={labelClasses}>Lights Out</label>
                    <div className="relative">
                      <Moon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                      <input 
                        type="time"
                        value={formData.sleepTime}
                        onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                        className={cn(inputClasses, "pl-12")}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Floating Save Button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-6"
          >
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-6 bg-sage-primary text-white rounded-[32px] font-bold text-xl shadow-2xl shadow-sage-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <AyurSyncLoader size="small" />
                  Syncing with Council...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-sage-primary/10 backdrop-blur-sm pointer-events-none flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-12 rounded-[48px] shadow-2xl flex flex-col items-center gap-6"
            >
              <AyurSyncLoader size="large" />
              <div className="text-center">
                <h4 className="text-2xl font-serif font-bold text-sage-primary">Council Syncing</h4>
                <p className="text-sm text-gray-400">Updating your health essence...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
