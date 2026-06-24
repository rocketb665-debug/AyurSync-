import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  User, 
  Lock, 
  ChevronLeft, 
  Edit2, 
  Activity, 
  Download, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../contexts/lib/utils';

interface PrivacySecurityViewProps {
  onBack: () => void;
  userEmail: string | null;
  onUpdateEmail: (newEmail: string) => Promise<void>;
  onUpdatePassword: (currentPass: string, newPass: string) => Promise<void>;
  onDownloadData: () => void;
}

export function PrivacySecurityView({ 
  onBack, 
  userEmail, 
  onUpdateEmail, 
  onUpdatePassword,
  onDownloadData 
}: PrivacySecurityViewProps) {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(userEmail || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reauthStep, setReauthStep] = useState<'none' | 'email' | 'password'>('none');
  const [confirmPass, setConfirmPass] = useState('');

  const maskEmail = (email: string | null) => {
    if (!email) return 'No email provided';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return email;
    return `${user.substring(0, 2)}***@${domain}`;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /[0-9]/.test(pass) && /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEmailUpdate = async () => {
    if (!validateEmail(newEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (reauthStep !== 'email') {
      setReauthStep('email');
      return;
    }
    // In a real app, we would verify confirmPass here
    try {
      await onUpdateEmail(newEmail);
      setIsEditingEmail(false);
      setReauthStep('none');
      setConfirmPass('');
      showToast('Account Credentials Updated Successfully.');
    } catch (error) {
      showToast('Failed to update email. Please check your password.', 'error');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePassword(passwords.new)) {
      showToast('Password must be 8+ chars with 1 number & 1 symbol', 'error');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    try {
      await onUpdatePassword(passwords.current, passwords.new);
      setIsChangingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
      showToast('Account Credentials Updated Successfully.');
    } catch (error) {
      showToast('Failed to update password. Current password incorrect.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-500" />
        </button>
        <h1 className="text-xl font-serif font-bold text-sage-primary">Privacy & Security</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Account Credentials */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <User className="w-5 h-5 text-sage-primary" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Credentials</h2>
          </div>
          
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-8">
            {/* Email Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email ID</p>
                  {!isEditingEmail ? (
                    <p className="text-lg font-bold text-gray-800">{maskEmail(userEmail)}</p>
                  ) : (
                    <input 
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-sage-primary/20 transition-all"
                      placeholder="Enter new email"
                    />
                  )}
                </div>
                <button 
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-sage-primary"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>

              {isEditingEmail && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-2"
                >
                  {reauthStep === 'email' && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500">Confirm Current Password</p>
                      <input 
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-sage-primary/20 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button 
                      onClick={handleEmailUpdate}
                      className="flex-1 py-3 bg-sage-primary text-white rounded-2xl font-bold text-sm hover:bg-sage-secondary transition-all"
                    >
                      {reauthStep === 'email' ? 'Confirm & Update' : 'Update Email'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingEmail(false);
                        setReauthStep('none');
                        setConfirmPass('');
                      }}
                      className="px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Password Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Password</p>
                  <p className="text-lg font-bold text-gray-800 tracking-widest">••••••••</p>
                </div>
                <button 
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="px-4 py-2 bg-gray-50 text-sage-primary rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                >
                  Change Password
                </button>
              </div>

              <AnimatePresence>
                {isChangingPassword && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 overflow-hidden"
                  >
                    {[
                      { label: 'Current Password', key: 'current' },
                      { label: 'New Password', key: 'new' },
                      { label: 'Confirm New Password', key: 'confirm' }
                    ].map((field) => (
                      <div key={field.key} className="space-y-2">
                        <p className="text-xs font-medium text-gray-500">{field.label}</p>
                        <div className="relative">
                          <input 
                            type={showPasswords[field.key as keyof typeof showPasswords] ? 'text' : 'password'}
                            value={passwords[field.key as keyof typeof passwords]}
                            onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sage-primary/20 transition-all pr-12"
                            placeholder="••••••••"
                          />
                          <button 
                            onClick={() => setShowPasswords({ ...showPasswords, [field.key]: !showPasswords[field.key as keyof typeof showPasswords] })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sage-primary transition-colors"
                          >
                            {showPasswords[field.key as keyof typeof showPasswords] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={handlePasswordUpdate}
                        className="flex-1 py-3 bg-sage-primary text-white rounded-2xl font-bold text-sm hover:bg-sage-secondary transition-all"
                      >
                        Update Password
                      </button>
                      <button 
                        onClick={() => setIsChangingPassword(false)}
                        className="px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Security Layers */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Shield className="w-5 h-5 text-sage-primary" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Security Layers</h2>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-gray-800">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
              </div>
              <button 
                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                className={cn(
                  "w-14 h-8 rounded-full transition-all relative",
                  is2FAEnabled ? "bg-sage-primary" : "bg-gray-200"
                )}
              >
                <motion.div 
                  animate={{ x: is2FAEnabled ? 24 : 4 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sage-primary" />
                <p className="font-bold text-gray-800">Login Activity</p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Smartphone className="w-6 h-6 text-sage-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">iPhone 15 Pro</p>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Current Session</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Mumbai, India</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Active now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Lock className="w-5 h-5 text-sage-primary" />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Data & Privacy</h2>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-gray-800">Privacy Mode</p>
                <p className="text-sm text-gray-500">Anonymize health data when shared with specialists.</p>
              </div>
              <button 
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={cn(
                  "w-14 h-8 rounded-full transition-all relative",
                  isPrivacyMode ? "bg-sage-primary" : "bg-gray-200"
                )}
              >
                <motion.div 
                  animate={{ x: isPrivacyMode ? 24 : 4 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <div className="h-px bg-gray-100" />

            <button 
              onClick={onDownloadData}
              className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Download className="w-6 h-6 text-sage-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">Download My Data</p>
                  <p className="text-xs text-gray-500">Request a full health data export (.json)</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6"
          >
            <div className={cn(
              "p-4 rounded-2xl shadow-xl flex items-center gap-3 border",
              toast.type === 'success' ? "bg-white border-emerald-100" : "bg-white border-red-100"
            )}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
              <p className="text-sm font-bold text-gray-800">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
