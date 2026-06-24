import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Users, 
  Moon, 
  Sun, 
  Languages, 
  LogOut, 
  ChevronLeft,
  Camera,
  Edit3,
  Trash2,
  RotateCcw,
  Trash,
  X
} from 'lucide-react';
import { cn } from '../contexts/lib/utils';
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, serverTimestamp, getDocs, where, writeBatch, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AnimatePresence } from 'motion/react';

interface SettingsPageProps {
  onBack: () => void;
  userData: any;
  onLogout: () => void;
  onUpdateProfile: () => void;
}

export const SettingsPage = ({ onBack, userData, onLogout, onUpdateProfile }: SettingsPageProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('English');
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [deletedNotices, setDeletedNotices] = useState<any[]>([]);

  React.useEffect(() => {
    if (!isRecycleBinOpen) return;

    const q = query(collection(db, 'recycle_bin_notices'), orderBy('deletedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeletedNotices(docs);
      
      // Auto-purge logic: items older than 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const toPurge = docs.filter((d: any) => {
        const deletedAt = d.deletedAt?.toDate ? d.deletedAt.toDate() : new Date(d.deletedAt);
        return deletedAt && deletedAt < sevenDaysAgo;
      });

      if (toPurge.length > 0) {
        const batch = writeBatch(db);
        toPurge.forEach(d => {
          batch.delete(doc(db, 'recycle_bin_notices', d.id));
        });
        batch.commit().catch(err => console.error("Purge failed:", err));
      }
    });

    return () => unsubscribe();
  }, [isRecycleBinOpen]);

  const handleRestore = async (notice: any) => {
    try {
      const { deletedAt, id, ...rest } = notice;
      await addDoc(collection(db, 'notices'), {
        ...rest,
        timestamp: serverTimestamp()
      });
      await deleteDoc(doc(db, 'recycle_bin_notices', notice.id));
      if ('vibrate' in navigator) navigator.vibrate(20);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notices');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recycle_bin_notices', id));
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `recycle_bin_notices/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-serif font-bold text-sage-primary">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Profile Header */}
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative flex items-center justify-center font-serif font-bold text-4xl">
              {userData.profileImage ? (
                <img 
                  src={userData.profileImage} 
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
                  "w-full h-full flex items-center justify-center bg-sage-primary text-white",
                  userData.profileImage && "hidden"
                )}
              >
                {(userData.name || userData.displayName || 'S').charAt(0).toUpperCase()}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-sage-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-sage-dark transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">{userData.name || 'Seeker'}</h2>
            <p className="text-gray-500">{userData.email}</p>
          </div>

          <button 
            onClick={onUpdateProfile}
            className="flex items-center gap-2 px-6 py-3 bg-sage-primary/10 text-sage-primary rounded-2xl font-bold hover:bg-sage-primary/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </section>

        {/* Account Info */}
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Account Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-primary shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                <p className="font-bold text-gray-900">{userData.name || 'Not Set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-primary shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Age</p>
                <p className="font-bold text-gray-900">{userData.age || 'Not Set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-primary shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</p>
                <p className="font-bold text-gray-900">{userData.gender || 'Not Set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-primary shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                <p className="font-bold text-gray-900 truncate max-w-[150px]">{userData.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Settings */}
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">App Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-primary shadow-sm">
                  {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <span className="font-bold text-gray-700">Theme</span>
              </div>
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                {theme === 'light' ? 'Light' : 'Dark'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sage-primary shadow-sm">
                  <Languages className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700">Language</span>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-bold text-sage-primary outline-none cursor-pointer"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Sanskrit</option>
              </select>
            </div>

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all group"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-bold">Logout</span>
            </button>

            <button 
              onClick={() => setIsRecycleBinOpen(true)}
              className="w-full flex items-center gap-4 p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition-all group"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="font-bold">Recycle Bin</span>
            </button>
          </div>
        </section>
      </div>

      {/* Recycle Bin Modal */}
      <AnimatePresence>
        {isRecycleBinOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecycleBinOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-[80vh] bg-white rounded-[48px] shadow-2xl z-[110] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-gray-900">Recycle Bin</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Auto-purges after 7 days</p>
                  </div>
                </div>
                <button onClick={() => setIsRecycleBinOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {deletedNotices.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <Trash className="w-16 h-16" />
                    <p className="font-bold text-gray-500">Your bin is empty</p>
                  </div>
                ) : (
                  deletedNotices.map((notice) => (
                    <motion.div 
                      key={notice.id}
                      layout
                      className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4"
                    >
                      <p className="text-gray-700 font-medium line-clamp-2">{notice.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Deleted {notice.deletedAt?.toDate ? notice.deletedAt.toDate().toLocaleDateString() : new Date(notice.deletedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleRestore(notice)}
                            className="p-2 bg-white text-sage-primary rounded-xl shadow-sm hover:bg-sage-primary hover:text-white transition-all"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePermanentDelete(notice.id)}
                            className="p-2 bg-white text-rose-500 rounded-xl shadow-sm hover:bg-rose-500 hover:text-white transition-all"
                            title="Delete Permanently"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
