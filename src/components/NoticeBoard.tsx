import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2, Check, AlertCircle, Info, Activity, Plus, StickyNote, Send, Trash2, RotateCcw, Trash } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, deleteDoc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { cn } from '../contexts/lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'Update' | 'Alert' | 'Activity';
  timestamp: any;
  position?: { top: string; left: string };
  rotate?: number;
  zIndex?: number;
  className?: string;
  pinColor?: string;
  gridIndex?: number;
}

export const NoticeBoard = React.memo(({ zoomedNotice, setZoomedNotice }: any) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isFlyingBack, setIsFlyingBack] = useState(false);
  const [isRecycling, setIsRecycling] = useState<string | null>(null);
  const [isRecycleListOpen, setIsRecycleListOpen] = useState(false);
  const [deletedNotices, setDeletedNotices] = useState<any[]>([]);
  
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Grid Configuration
  const GRID_COLS = 3;
  const GRID_ROWS = 3;

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Hardcoded check for the known admin email
      if (user.email === 'rocketb665@gmail.com') {
        setIsAdmin(true);
        return;
      }

      // Check role field in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data()?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);
  
  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticesData = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        
        // Calculate grid position if not present
        const gridIndex = data.gridIndex ?? index;
        const row = Math.floor(gridIndex / GRID_COLS);
        const col = gridIndex % GRID_COLS;
        
        const top = `${15 + row * 25}%`;
        const left = `${10 + col * 30}%`;

        const rotates = [-2, 3, -1, 2, -3, 1, -2, 2, -1];
        const pinColors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500'];

        return {
          id: doc.id,
          ...data,
          gridIndex,
          position: data.position || { top, left },
          rotate: data.rotate || rotates[gridIndex % rotates.length],
          zIndex: data.zIndex || gridIndex + 10,
          pinColor: data.pinColor || pinColors[gridIndex % pinColors.length],
          className: data.className || "bg-[#fff9c4] p-6 rounded-sm shadow-lg border-l-4 border-amber-200 w-64 min-h-[180px] font-handwriting"
        };
      }) as Notice[];
      setNotices(noticesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notices');
    });

    return () => unsubscribe();
  }, []);

  const playFlutterSound = () => {
    // Simulated paper flutter sound or visual cue
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  };

  const findEmptyGridIndex = () => {
    const occupiedIndices = notices.map(n => n.gridIndex);
    for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
      if (!occupiedIndices.includes(i)) return i;
    }
    return notices.length; // Fallback
  };

  const handlePostNote = async () => {
    if (!newNoteContent.trim()) {
      setIsExtracting(false);
      return;
    }

    setIsFlyingBack(true);
    playFlutterSound();

    const gridIndex = findEmptyGridIndex();
    const row = Math.floor(gridIndex / GRID_COLS);
    const col = gridIndex % GRID_COLS;
    const top = `${15 + row * 25}%`;
    const left = `${10 + col * 30}%`;

    try {
      await addDoc(collection(db, 'notices'), {
        title: "New Note",
        content: newNoteContent,
        category: 'Update',
        timestamp: serverTimestamp(),
        gridIndex,
        position: { top, left },
        rotate: Math.random() * 6 - 3,
        zIndex: gridIndex + 10,
        pinColor: 'bg-rose-500'
      });
      
      setTimeout(() => {
        setIsExtracting(false);
        setIsFlyingBack(false);
        setNewNoteContent('');
      }, 800);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notices');
      setIsFlyingBack(false);
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    if (clickTimeout.current) {
      // Double click
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      if (isAdmin) {
        setEditingId(notice.id);
        setEditContent(notice.content);
      }
    } else {
      // Single click
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
        setZoomedNotice(notice.id);
      }, 250);
    }
  };

  useEffect(() => {
    if (!isRecycleListOpen) return;

    const q = query(collection(db, 'recycle_bin_notices'), orderBy('deletedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeletedNotices(docs);
      
      // Auto-purge logic: items older than 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const toPurge = docs.filter((d: any) => {
        const deletedAt = d.deletedAt?.toDate();
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
  }, [isRecycleListOpen]);

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

  const handleRecycle = (notice: Notice) => {
    setIsRecycling(notice.id);
    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
  };

  const performMigration = async (notice: Notice) => {
    try {
      // 1. Immediate local state update for zero-lag disappearance
      setNotices(prev => prev.filter(n => n.id !== notice.id));
      
      const noticeRef = doc(db, 'notices', notice.id);
      const noticeSnap = await getDoc(noticeRef);
      
      if (noticeSnap.exists()) {
        const data = noticeSnap.data();
        // 2. Add to Recycle Bin collection
        await setDoc(doc(db, 'recycle_bin_notices', notice.id), {
          ...data,
          deletedAt: new Date() // Use Date for immediate local tracking
        });
        
        // 3. Delete from main notices collection
        await deleteDoc(noticeRef);
      }
      
      setIsRecycling(null);
      setZoomedNotice(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${notice.id}`);
      setIsRecycling(null);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const noticeRef = doc(db, 'notices', id);
      await updateDoc(noticeRef, {
        content: editContent,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notices/${id}`);
    }
  };

  const categoryConfig = {
    Alert: { icon: AlertCircle, color: 'text-rose-500' },
    Update: { icon: Info, color: 'text-blue-500' },
    Activity: { icon: Activity, color: 'text-emerald-500' }
  };

  return (
    <motion.div
      key="notice-board"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full min-h-[800px] bg-[#d4a373] overflow-hidden rounded-[40px] shadow-inner perspective-1000"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/20" />

      {/* Grid Layer for visual debugging or texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

      {notices.map((notice) => {
        if (zoomedNotice === notice.id) return null;
        const CategoryIcon = categoryConfig[notice.category]?.icon || Info;

        return (
          <motion.div
            key={notice.id}
            layoutId={`notice-${notice.id}`}
            onClick={() => handleNoticeClick(notice)}
            className={cn("absolute cursor-pointer group animate-flutter", notice.className)}
            style={{ ...notice.position, zIndex: notice.zIndex }}
            initial={{ rotate: notice.rotate, scale: 0.9, opacity: 0 }}
            animate={{ rotate: notice.rotate, scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, rotate: notice.rotate + 1, zIndex: 100 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            
            {notice.pinColor && (
              <div className={cn("absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-md border-2 border-black/20 z-10", notice.pinColor)}>
                <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full" />
              </div>
            )}
            
            <div className="space-y-3 relative z-0">
              <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                <CategoryIcon className={cn("w-4 h-4", categoryConfig[notice.category]?.color)} />
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{notice.category}</span>
              </div>
              
              {editingId === notice.id ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={() => handleSaveEdit(notice.id)}
                    className="w-full bg-transparent border-none p-0 text-xl font-handwriting outline-none resize-none min-h-[120px] text-blue-800 leading-relaxed"
                    style={{ backgroundImage: 'linear-gradient(transparent 31px, #e5e5e5 31px)', backgroundSize: '100% 32px' }}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleSaveEdit(notice.id)}
                      className="p-1 bg-sage-primary text-white rounded-md"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xl text-blue-900 font-handwriting leading-relaxed line-clamp-6">
                  {notice.content}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Note Pocket (Bottom-Left) */}
      {isAdmin && (
        <motion.div 
          className="absolute bottom-12 left-12 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button 
            onClick={() => {
              setIsExtracting(true);
              playFlutterSound();
            }}
            className="w-20 h-24 bg-[#c29364] rounded-t-lg rounded-b-3xl shadow-2xl border-t-8 border-[#b0845a] flex items-center justify-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <StickyNote className="w-10 h-10 text-white/80" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/20 blur-sm rounded-full" />
          </button>
        </motion.div>
      )}

      {/* Dustbin (Bottom-Right) - Now triggers Recycle List */}
      {isAdmin && (
        <motion.div 
          className="absolute bottom-12 right-12 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button 
            onClick={() => setIsRecycleListOpen(true)}
            className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border-2 border-dashed border-white/30 flex items-center justify-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Trash2 className="w-10 h-10 text-white/60 group-hover:text-amber-400 transition-colors" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/20 blur-sm rounded-full" />
          </button>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">Recycle Bin</span>
        </motion.div>
      )}

      {/* Flying Note Input */}
      <AnimatePresence>
        {isExtracting && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100] rounded-[40px]"
              onClick={handlePostNote}
            />
            
            <motion.div
              initial={{ 
                x: -200, 
                y: 400, 
                scale: 0.1, 
                rotate: -20,
                opacity: 0 
              }}
              animate={isFlyingBack ? {
                x: 0,
                y: 0,
                scale: 0.5,
                opacity: 0,
                rotate: 10
              } : { 
                x: '50%', 
                y: '50%', 
                translateX: '-50%',
                translateY: '-50%',
                scale: 1, 
                rotate: 0,
                opacity: 1 
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 120, 
                damping: 15,
                mass: 1
              }}
              className="absolute z-[110] w-[80%] max-w-2xl aspect-[4/3] bg-[#fff9c4] p-12 shadow-[0_30px_60px_rgba(0,0,0,0.3)] rounded-sm border-l-8 border-amber-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lined Paper Effect */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(transparent 39px, #e5e5e5 39px)', backgroundSize: '100% 40px' }} />
              
              <div className="relative h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-amber-600/50 font-bold uppercase tracking-widest text-xs">New Thought</span>
                  <button onClick={() => setIsExtracting(false)} className="text-amber-600/50 hover:text-amber-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <textarea
                  autoFocus
                  placeholder="Write your intention..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-4xl font-handwriting text-blue-800 placeholder:text-blue-200 resize-none leading-[40px]"
                />

                <div className="flex justify-end mt-4">
                  <button 
                    onClick={handlePostNote}
                    className="group flex items-center gap-3 px-8 py-4 bg-sage-primary text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Post to Board
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedNotice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedNotice(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 rounded-[40px]"
            />
            {notices.filter((n) => n.id === zoomedNotice).map((notice) => (
              <motion.div
                key={`zoomed-${notice.id}`}
                layoutId={`notice-${notice.id}`}
                className={cn(notice.className, "absolute z-[60] overflow-y-auto max-h-[80%] w-[90%] md:w-[60%] lg:w-[50%] left-[5%] md:left-[20%] lg:left-[25%] top-[10%] shadow-[0_20px_50px_rgba(0,0,0,0.5)] !h-auto !bg-[#fff9c4] border-l-8 border-amber-200")}
                initial={{ rotate: notice.rotate }}
                animate={isRecycling === notice.id ? {
                  rotateY: 360,
                  scale: 0,
                  x: '40vw',
                  y: '40vh',
                  opacity: 0
                } : { rotate: 0 }}
                onAnimationComplete={() => {
                  if (isRecycling === notice.id) {
                    performMigration(notice);
                  }
                }}
                exit={{ rotate: notice.rotate }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                <div className="sticky top-4 flex justify-end gap-2 mr-4 z-50">
                  {isAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRecycle(notice); }} 
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-full transition-colors"
                      title="Recycle"
                    >
                      <Trash2 className="w-6 h-6 text-rose-500" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setZoomedNotice(null); }} 
                    className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-800" />
                  </button>
                </div>
                <div className="p-12 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white", 
                      notice.category === 'Alert' ? 'bg-rose-500' : notice.category === 'Activity' ? 'bg-emerald-500' : 'bg-blue-500'
                    )}>
                      {notice.category}
                    </div>
                  </div>
                  
                  <div 
                    className="text-4xl text-blue-900 font-handwriting leading-relaxed whitespace-pre-wrap"
                    style={{ backgroundImage: 'linear-gradient(transparent 47px, #e5e5e5 47px)', backgroundSize: '100% 48px' }}
                    onClick={() => {
                      if (isAdmin) {
                        setEditingId(notice.id);
                        setEditContent(notice.content);
                        setZoomedNotice(null);
                      }
                    }}
                  >
                    {notice.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Recycle Bin List Modal */}
      <AnimatePresence>
        {isRecycleListOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecycleListOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md z-[100] rounded-[40px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute inset-0 m-auto w-[90%] max-w-lg h-[70%] bg-white rounded-[48px] shadow-2xl z-[110] overflow-hidden flex flex-col"
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
                <button onClick={() => setIsRecycleListOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
    </motion.div>
  );
});
