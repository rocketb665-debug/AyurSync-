import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  UserPlus, 
  LogOut, 
  Sparkles,
  MessageCircle,
  X,
  Send,
  Camera,
  Mic,
  Stethoscope,
  Activity,
  Flame,
  Coins,
  Check,
  Heart,
  User,
  Home,
  Settings,
  Trash2,
  ChevronUp,
  Menu,
  MoreVertical,
  Plus,
  Droplets,
  Wind,
  Thermometer,
  Search,
  Scan,
  Brain,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Accessibility,
  Info,
  Compass,
  MessageSquare,
  Phone,
  ArrowUpRight,
  Share2,
  ExternalLink,
  ShieldAlert,
  Bell,
  Clock,
  Calendar,
  History,
  Smartphone,
  CheckCircle,
  BookOpen,
  Bluetooth,
  Radio,
  ExternalLink as LinkIcon,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Edit2,
  RefreshCw,
  Square,
  MapPin,
  Navigation,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  AlertTriangle,
  Sun,
  Moon,
  Star,
  Coffee,
  Utensils,
  Footprints,
  Scale,
  Dumbbell,
  Lightbulb,
  Play,
  Target,
  Award,
  ClipboardList,
  Pin,
  Wand2,
  Apple,
  Zap,
  PlaySquare
} from 'lucide-react';
import Markdown from 'react-markdown';
import { StreamingMessage } from './components/StreamingMessage';
import { MetaShredImmersion } from './components/MetaShredImmersion';
import { MetaShredShowcase } from './components/MetaShredShowcase';
import { MetaShredActiveZone } from './components/MetaShredActiveZone';
import { AyurVaultLibrary } from './components/AyurVaultLibrary';
import { AyurSyncBranding } from './components/AyurSyncBranding';
import { AyurSyncLoader, AyurSyncLoaderModal } from './components/AyurSyncLoader';
import { NoticeBoard } from './components/NoticeBoard';
import { SettingsPage } from './components/SettingsPage';
import { JourneyDetailView } from './components/JourneyDetailView';
import { CustomJourneyOnboarding } from './components/CustomJourneyOnboarding';
import AyurvedaSangam from './components/AyurvedaSangam/AyurvedaSangam';
import SmartNutrition from './pages/SmartNutrition';
import { FullAnalysis } from './components/FullAnalysis';
import { BodyPainMapper } from './components/BodyPainMapper';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
  Sector
} from 'recharts';
import { Suspense, lazy, useMemo } from 'react';

const MedicalScanner = lazy(() => import('./components/MedicalScanner').then(m => ({ default: m.MedicalScanner })));
const VitalityChart = lazy(() => import('./components/VitalityChart').then(m => ({ default: m.VitalityChart })));
import { HealthQuestionnaire } from './components/HealthQuestionnaire';
import { QuickPulse } from './components/QuickPulse';
import { InterventionModule } from './components/InterventionModule';
import { NotificationCenter } from './components/NotificationCenter';
import { PrivacySecurityView } from './components/PrivacySecurityView';
import { UpdateProfileView } from './components/UpdateProfileView';
import { SleepAnalyticsView } from './components/SleepAnalyticsView';
import { HealthCalendarView } from './components/HealthCalendarView';
import { ProtocolMaker } from './components/ProtocolMaker';
import { ArtOfLivingView } from './components/ArtOfLivingView';
import { HappinessProgramView } from './components/HappinessProgramView';
import { IntuitionProcessView } from './components/IntuitionProcessView';
import { SpecialistChat } from './components/SpecialistChat';
import { cn } from './contexts/lib/utils';
import { POLLING_CATEGORIES } from './constants/polling';
import { useAuth } from './contexts/AuthContext';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth as firebaseAuth, db, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getChatResponse, getDietitianResponse, getTrainerResponse, getMedicalStrategistResponse, getPharmacologistResponse, getZenCoachResponse, getSleepScientistResponse, getDermatologistResponse, getStrengthTrainerResponse, getSERPResponse, SERPResponse, analyzeMedicalReport, getSpecialistResponse } from './gemini';

// Types
type View = 'welcome' | 'login' | 'register' | 'blueprint' | 'dashboard' | 'vitality-breakdown';
type Tab = 'home' | 'specialists' | 'consult' | 'journeys' | 'explorer' | 'profile' | 'metric-detail' | 'notice-board' | 'sleep-analytics' | 'health-calendar' | 'specialist-chat' | 'protocol-maker';
type ExploreView = 'launcher' | 'body-pain-mapper' | 'daily-tasks' | 'notification-center' | 'universal-search' | 'medical-scanner' | 'voice-wellness' | 'notice-board' | 'protocols' | 'protocol-detail' | 'health-calendar' | 'ayurvault' | 'session-blueprint' | 'art-of-living' | 'happiness-program' | 'intuition-process' | 'full-analysis' | 'food-scanner';
type ProfileView = 'main' | 'privacy-security' | 'update-profile';

interface Journey {
  id: string;
  title: string;
  description?: string;
  duration: number;
  currentDay: number;
  icon?: any;
  color?: string;
  gradient?: string;
  tags?: string[];
  isLocked?: boolean;
  dietaryBlueprint?: { time: string; meal: string; recommendation: string }[];
  movementPlan?: { type: string; duration: string; time: string }[];
  avoidList?: string[];
  vitals?: string[];
  status?: 'active' | 'completed' | 'missed';
  progress?: number[];
  category?: 'Weight' | 'Sleep' | 'Stress' | 'Strength';
}

interface SessionPhase {
  title: string;
  description: string;
  duration: number; // in minutes
  videoId?: string;
  bioImage: string;
  instructions: string[];
}

interface SessionDetails {
  phases: {
    mobilize: SessionPhase;
    perform: SessionPhase;
    restore: SessionPhase;
  };
}

interface TimelineItem {
  time: string;
  specialistId: string;
  instruction: string;
  category: string;
  linkedPageId?: string;
  sessionDetails?: SessionDetails;
}

interface Protocol {
  id: string;
  title: string;
  image: string;
  description: string;
  whyLabel: string;
  doshaImpact: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  architectNote: string;
  getTimeline?: (healthData: HealthData) => TimelineItem[];
  days?: any[];
}

const initialJourneys: Journey[] = [
  {
    id: 'glow',
    title: '15-Day Natural Glow',
    description: 'A holistic Ayurvedic journey combining Dr. Zara\'s skin rituals with Rohini\'s blood-purifying diet.',
    duration: 15,
    currentDay: 1,
    icon: Sparkles,
    color: 'text-rose-600',
    gradient: 'from-rose-50 to-white',
    tags: ['SKINCARE', 'DETOX', 'HYDRATION'],
    dietaryBlueprint: [
      { time: '7:30 AM', meal: 'Warm Lemon Water with Honey', recommendation: 'Liver Detox' },
      { time: '9:00 AM', meal: 'Papaya & Pomegranate Bowl', recommendation: 'Antioxidant Boost' },
      { time: '1:30 PM', meal: 'Quinoa with Steamed Greens', recommendation: 'Blood Purifying' },
      { time: '7:00 PM', meal: 'Light Vegetable Soup', recommendation: 'Easy Digestion' }
    ],
    movementPlan: [
      { type: 'Face Yoga', duration: '10 Mins', time: 'Morning' },
      { type: 'Gentle Vinyasa', duration: '20 Mins', time: 'Evening' }
    ],
    avoidList: ['Refined Sugar', 'Deep Fried Foods', 'Excess Dairy'],
    vitals: ['Hydration', 'Sleep Quality'],
    status: 'active',
    progress: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    category: 'Stress'
  },
  {
    id: 'meta-shred',
    title: 'Meta-Shred',
    description: 'A high-intensity metabolic reset for rapid fat loss and energy optimization.',
    duration: 15,
    currentDay: 1,
    icon: Flame,
    color: 'text-sage-primary',
    gradient: 'from-sage-light/20 to-white',
    tags: ['METABOLISM', 'FAT LOSS', 'KAPHA'],
    dietaryBlueprint: [
      { time: '7:30 AM', meal: 'Ashwagandha Smoothie', recommendation: 'Post-workout Fuel' },
      { time: '1:00 PM', meal: 'Metabolic Quinoa Bowl', recommendation: 'Digestive Agni' },
      { time: '9:00 PM', meal: 'Golden Milk Detox', recommendation: 'Night Recovery' }
    ],
    movementPlan: [
      { type: 'HIIT Session', duration: '30 Mins', time: '7:00 AM' },
      { type: 'Brisk Walk', duration: '20 Mins', time: '5:00 PM' }
    ],
    avoidList: ['Iced Water', 'Heavy Curd', 'Refined Sugar'],
    isLocked: true
  },
  {
    id: 'weight-loss',
    title: '15-Day Weight Loss',
    description: 'A personalized Ayurvedic plan to balance your metabolism and reach your ideal weight.',
    duration: 15,
    currentDay: 1,
    icon: Scale,
    color: 'text-orange-600',
    gradient: 'from-orange-50 to-white',
    tags: ['STEPS', 'HYDRATION', 'METABOLISM'],
    dietaryBlueprint: [
      { time: '8:00 AM', meal: 'Warm Ginger Water', recommendation: 'Metabolism Booster' },
      { time: '9:00 AM', meal: 'Moong Dal Chilla', recommendation: 'High Protein, Low GI' },
      { time: '1:30 PM', meal: 'Brown Rice & Veggies', recommendation: 'Balanced Lunch' },
      { time: '7:00 PM', meal: 'Bottle Gourd Soup', recommendation: 'Light Dinner' }
    ],
    movementPlan: [
      { type: 'Sun Salutations', duration: '20 Mins', time: 'Sunrise' },
      { type: 'Brisk Walk', duration: '30 Mins', time: 'Evening' }
    ],
    avoidList: ['No iced water', 'No heavy curd after sunset', 'No refined sugar']
  },
  {
    id: 'natural-glow',
    title: '15-Day Natural Glow',
    description: 'A holistic skincare journey combining Dr. Zara\'s Ayurvedic routines with Rohini\'s Blood Purifying Diet.',
    duration: 15,
    currentDay: 1,
    icon: Sparkles,
    color: 'text-rose-400',
    gradient: 'from-rose-50 to-white',
    tags: ['SKINCARE', 'DIET', 'RITUALS'],
    dietaryBlueprint: [
      { time: '7:00 AM', meal: 'Warm Water with Lemon & Honey', recommendation: 'Detoxifies and brightens skin' },
      { time: '10:00 AM', meal: 'Fresh Fruit Bowl (Papaya, Berries)', recommendation: 'Antioxidant boost' },
      { time: '1:00 PM', meal: 'Quinoa Salad with Leafy Greens', recommendation: 'Blood purifying' },
      { time: '4:00 PM', meal: 'Amla Juice or Green Tea', recommendation: 'Vitamin C and antioxidants' },
      { time: '7:30 PM', meal: 'Light Vegetable Soup', recommendation: 'Easy digestion for clear skin' }
    ],
    movementPlan: [
      { type: 'Face Yoga', duration: '10 Mins', time: 'Morning' },
      { type: 'Gentle Vinyasa Flow', duration: '20 Mins', time: 'Evening' }
    ],
    avoidList: ['Fried foods', 'Excessive dairy', 'Refined sugar', 'Late night snacking']
  },
  {
    id: 'sleep-quality',
    title: '10-Day Sleep Quality',
    description: 'Restore your natural circadian rhythm and achieve deep, restorative sleep through ancient rituals.',
    duration: 10,
    currentDay: 1,
    icon: Moon,
    color: 'text-purple-600',
    gradient: 'from-purple-50 to-white',
    tags: ['SLEEP HYGIENE', 'RITUALS', 'RECOVERY'],
    dietaryBlueprint: [
      { time: '8:00 AM', meal: 'Ashwagandha Tea', recommendation: 'Cortisol Regulator' },
      { time: '7:00 PM', meal: 'Warm Spiced Milk', recommendation: 'Sleep Inducer' }
    ],
    movementPlan: [
      { type: 'Yoga Nidra', duration: '15 Mins', time: 'Before Bed' },
      { type: 'Gentle Stretching', duration: '10 Mins', time: 'Evening' }
    ],
    avoidList: ['No caffeine after 2 PM', 'No screens 1 hour before bed', 'No heavy meals at night']
  },
  {
    id: 'cellular-detox',
    title: 'Deep Cellular Detox',
    description: 'A professional-grade 21-day program to flush toxins and rejuvenate your system.',
    duration: 21,
    currentDay: 0,
    icon: Droplets,
    color: 'text-emerald-600',
    gradient: 'from-emerald-50 to-white',
    tags: ['DETOX', 'REJUVENATION', 'PRO'],
    isLocked: true,
    dietaryBlueprint: [],
    movementPlan: [],
    avoidList: []
  }
];

interface Specialist {
  id: 'medical' | 'longevity' | 'behavioral' | 'nutrition' | 'strength' | 'pain' | 'women' | 'pediatric';
  name: string;
  designation: string;
  avatar: string;
  intro: string;
  color: string;
  mission: string;
  personality: string;
}

const specialists: Specialist[] = [
  {
    id: 'medical',
    name: 'Dr. Kavya',
    designation: 'Senior Ayurvedic Consultant',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000dd9c71fa82104a147e55ce76.png',
    intro: "I am Dr. Kavya. I integrate your Vata, Pitta, and Kapha biomarkers into a 10-year health vision.",
    color: '#10B981',
    mission: 'Restoring Prakriti through biomarker precision.',
    personality: 'Wise, traditional yet clinical. Focuses on Metabolic Flexibility and Homeostasis.'
  },
  {
    id: 'longevity',
    name: 'Dr. Aryan',
    designation: 'Vitality & Longevity Strategist',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_000000009c2c71fabbe023c37c88579f.png',
    intro: "I am Dr. Aryan. I ensure your supplements and medications align with your Ayurvedic profile for maximum longevity.",
    color: '#1E293B',
    mission: 'Extending the human health-span through cellular optimization.',
    personality: 'Futuristic, data-driven, direct. References Dr. Zara\'s skin rituals and Rohini\'s diet.'
  },
  {
    id: 'behavioral',
    name: 'Dr. Mira',
    designation: 'Chief Behavioral Strategist',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_0000000059f871fa93c90f24cd47aeda.png',
    intro: "Your sanctuary for mental clarity, emotional healing, and deep behavioral management.",
    color: '#E9D5FF',
    mission: 'Healing the mind to liberate the body.',
    personality: 'Deeply empathetic, calm, humble. Philosophy: "The mind is the soil; the body is the plant."'
  },
  {
    id: 'nutrition',
    name: 'Rohini',
    designation: 'Clinical Nutritionist',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_000000008a3871fa83cefae6688ca347.png',
    intro: "Namaste! I am Rohini. Ready to optimize your nutrition through Ayurvedic Dietetics?",
    color: '#D97706',
    mission: 'Fueling life through Ayurvedic dietetics.',
    personality: 'Disciplined, encouraging, practical. Prioritizes Markdown tables for meal plans.'
  },
  {
    id: 'strength',
    name: 'Veer',
    designation: 'Strength & Physical Resilience Coach',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000148071faacf398e418278925.png',
    intro: "I am Veer. Building long-term resilience through data-backed strength training.",
    color: '#DC2626',
    mission: 'Building physical resilience and metabolic fire.',
    personality: 'High-energy, motivating, stern. Aggressively references medical reports for injury prevention.'
  },
  {
    id: 'pain',
    name: 'Kabir',
    designation: 'Chronic Pain & Mobility Specialist',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000aa1c71fa970a0097c0876eec.png',
    intro: "I am Kabir. I specialize in chronic pain management and mobility optimization.",
    color: '#0D9488',
    mission: 'Eliminating pain through structural harmony.',
    personality: 'Patient, methodical. Proactively checks Ishaan\'s step count to adjust mobility recommendations.'
  },
  {
    id: 'women',
    name: 'Ananya',
    designation: 'Women’s Health & Lunar Synergy Expert',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000ff3071fa981d1b97ddbb685b.png',
    intro: "I am Ananya. Let's align your health with your natural lunar rhythms and hormonal balance.",
    color: '#FDA4AF',
    mission: 'Synchronizing health with the lunar and life cycles.',
    personality: 'Nurturing, expert, protective. Focuses on hormonal balance and lunar cycles.'
  },
  {
    id: 'pediatric',
    name: 'Ishaan',
    designation: 'Pediatric & Teenage Growth Specialist',
    avatar: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000007471fa8b3862f40f9cde63.png',
    intro: "I'm Ishaan. Let's ensure the foundation of health for the younger generation.",
    color: '#0EA5E9',
    mission: 'Architecting the foundation of future vitality.',
    personality: 'Relatable, fun, educational. Aggressively checks vitality stats.'
  }
];

interface MedicalReportResult {
  vitalityBrief: string;
  extractedData: {
    testName: string;
    value: string;
    referenceRange: string;
    status: 'Low' | 'Normal' | 'High';
  }[];
}

interface DailyTask {
  id: string;
  title: string;
  time: string;
  description: string;
  category: string;
  completed: boolean;
  notification: boolean;
  resourceLink?: string;
  isSnoozed?: boolean;
  snoozeTime?: number;
}

interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'action' | 'update' | 'alarm';
  status: 'pending' | 'completed';
  read: boolean;
  icon?: any;
  color?: string;
  bg?: string;
}

interface Device {
  id: string;
  name: string;
  connected: boolean;
  icon: any;
  brand: 'Apple Health' | 'Google Fit' | 'Fitbit' | 'Samsung Health';
}

interface SleepRecord {
  day: string;
  date: string;
  total: number;
  deep: number;
  rem: number;
  bedtime: string;
  wakeup: string;
  quality: number;
}

interface HealthEvent {
  id: string;
  title: string;
  time: string;
  duration?: string;
  type: 'Medication' | 'Appointment' | 'Fasting' | 'Other' | 'Vibe' | 'Pain' | 'Wellness' | 'Lunar' | 'Fever' | 'Consultation';
  vibe?: 'Energy High' | 'Need Rest' | 'In Pain' | 'Focused' | 'Bloated' | 'Fever';
  notes?: string;
  date: string; // ISO string YYYY-MM-DD
}

interface MenstrualData {
  lastPeriodStart: string; // ISO string
  cycleLength: number;
  periodLength: number;
  history: { start: string; end: string }[];
}

interface ScanHistoryEntry {
  id: string;
  name: string;
  type: 'FOOD' | 'MEDICINE';
  timestamp: string; // ISO
  details: any;
}

interface HealthData {
  name: string;
  age: number;
  gender: string;
  profession?: string;
  lifestyleFocus?: string;
  profileImage?: string;
  vitality: {
    steps: number;
    hydration: number;
    oxygen: number;
    heartRate: number;
    bloodSugar: number;
    bloodPressure: string;
    stress: number;
    sleep?: {
      total: number;
      deep: number;
      rem: number;
    };
  };
  sleepHistory?: SleepRecord[];
  healthEvents?: HealthEvent[];
  menstrualData?: MenstrualData;
  scanHistory: ScanHistoryEntry[];
  painMap: { 
    part: string; 
    intensity: number; 
    sensation: string[]; 
    duration: 'Acute' | 'Chronic'; 
    mobilityImpact: boolean; 
    comment: string; 
    timestamp: Date; 
    view: 'front' | 'back';
  }[];
  primaryGoal: string;
  dosha?: string;
}

// Message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  prompt?: string;
}

const getPersonalizedTips = (goal: string, dosha?: string) => {
  const goalLower = goal.toLowerCase();
  const doshaLower = dosha?.toLowerCase() || '';

  if (goalLower.includes('stress') || goalLower.includes('anxiety') || doshaLower.includes('vata')) {
    return [
      { id: 't1', title: 'Calming Pranayama', content: 'Practice Nadi Shodhana (Alternate Nostril Breathing) for 5 minutes to balance Vata and calm the mind.', icon: Wind },
      { id: 't2', title: 'Grounding Diet', content: 'Incorporate warm, nourishing foods like sweet potatoes and warm milk with nutmeg before bed.', icon: Coffee },
      { id: 't3', title: 'Abhyanga', content: 'Perform a warm oil massage using sesame oil before your morning shower to soothe the nervous system.', icon: Droplets }
    ];
  }
  if (goalLower.includes('weight') || goalLower.includes('fat') || doshaLower.includes('kapha')) {
    return [
      { id: 't1', title: 'Ignite Agni', content: 'Drink a glass of warm water with a squeeze of lemon and a pinch of ginger powder first thing in the morning.', icon: Flame },
      { id: 't2', title: 'Kapha-Pacifying Diet', content: 'Favor pungent, bitter, and astringent tastes. Reduce sweet, sour, and salty foods.', icon: Leaf },
      { id: 't3', title: 'Vigorous Exercise', content: 'Engage in brisk walking, jogging, or dynamic yoga (like Sun Salutations) during the Kapha time of day (6 AM - 10 AM).', icon: Activity }
    ];
  }
  if (goalLower.includes('digestion') || goalLower.includes('gut') || doshaLower.includes('pitta')) {
    return [
      { id: 't1', title: 'CCF Tea', content: 'Sip on Cumin, Coriander, and Fennel (CCF) tea throughout the day to gently stimulate digestion.', icon: Coffee },
      { id: 't2', title: 'Mindful Eating', content: 'Eat in a calm environment without distractions. Chew your food thoroughly to aid the digestive process.', icon: Utensils },
      { id: 't3', title: 'Post-Meal Walk', content: 'Take a gentle 10-15 minute walk after meals, especially dinner, to support digestion.', icon: Footprints }
    ];
  }
  // Default tips
  return [
    { id: 't1', title: 'Dinacharya (Daily Routine)', content: 'Wake up before sunrise (Brahma Muhurta) to synchronize your body clock with nature.', icon: Sun },
    { id: 't2', title: 'Hydration', content: 'Drink warm or room temperature water throughout the day. Avoid ice-cold drinks which dampen the digestive fire (Agni).', icon: Droplets },
    { id: 't3', title: 'Mindful Rest', content: 'Ensure 7-8 hours of restful sleep. Try to be in bed by 10 PM to maximize the restorative Pitta cycle.', icon: Moon }
  ];
};

const PieAny = Pie as any;

const GuidedReset = ({ onClose }: { onClose: () => void }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  useEffect(() => {
    let phaseTimer: NodeJS.Timeout;
    if (phase === 'inhale') {
      phaseTimer = setTimeout(() => setPhase('hold'), 4000);
    } else if (phase === 'hold') {
      phaseTimer = setTimeout(() => setPhase('exhale'), 7000);
    } else if (phase === 'exhale') {
      phaseTimer = setTimeout(() => setPhase('inhale'), 8000);
    }
    return () => clearTimeout(phaseTimer);
  }, [phase]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
    >
      <div className="absolute top-8 right-8">
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center space-y-12">
        <h2 className="text-3xl md:text-4xl font-serif text-white/90">4-7-8 Breathing</h2>
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.div
            animate={{
              scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
              opacity: phase === 'hold' ? 0.8 : 0.5,
            }}
            transition={{
              duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8,
              ease: "easeInOut"
            }}
            className="absolute w-48 h-48 bg-purple-500 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
            }}
            transition={{
              duration: phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8,
              ease: "easeInOut"
            }}
            className="absolute w-48 h-48 bg-purple-400 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.5)]"
          />
          <div className="relative z-10 text-white text-4xl font-bold uppercase tracking-widest drop-shadow-lg">
            {phase}
          </div>
        </div>
        <div className="text-white/60 text-xl font-medium">
          0:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  // Production Mode Optimization: Disable logs
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    console.warn = () => {};
  }

  const encrypt = (data: any) => btoa(JSON.stringify(data));
  const decrypt = (str: string) => {
    try {
      return JSON.parse(atob(str));
    } catch (e) {
      return null;
    }
  };

  function useEncryptedState<T>(initialValue: T, storageKey?: string) {
    const initialValueRef = useRef(initialValue);
    const [state, setState] = useState<string>(() => {
      if (storageKey) {
        const saved = localStorage.getItem(storageKey);
        if (saved) return saved;
      }
      return btoa(JSON.stringify(initialValue));
    });
    
    const decryptedValue = useMemo(() => {
      try {
        return JSON.parse(atob(state)) as T;
      } catch (e) {
        return initialValueRef.current;
      }
    }, [state]);

    const setEncryptedState = (newValue: T | ((prev: T) => T)) => {
      let nextValueEncoded: string;
      if (typeof newValue === 'function') {
        const prevDecrypted = JSON.parse(atob(state));
        const nextValue = (newValue as any)(prevDecrypted);
        nextValueEncoded = btoa(JSON.stringify(nextValue));
      } else {
        nextValueEncoded = btoa(JSON.stringify(newValue));
      }
      
      setState(nextValueEncoded);
      if (storageKey) {
        localStorage.setItem(storageKey, nextValueEncoded);
      }
    };

    return [decryptedValue, setEncryptedState] as const;
  }
  const { user, loading, signInWithGoogle, signOut, deleteAccount, updateProfileData } = useAuth();
  const [view, setView] = useState<View>('welcome');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [isCreatingCustomJourney, setIsCreatingCustomJourney] = useState(false);
  const [journeys, setJourneys] = useState<Journey[]>(initialJourneys);
  const [customJourneyStep, setCustomJourneyStep] = useState(0);
  const [customJourneyAnswers, setCustomJourneyAnswers] = useState<any>({});
  const [isGeneratingJourney, setIsGeneratingJourney] = useState(false);
  const [zoomedNotice, setZoomedNotice] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (mainContentRef.current) {
            setIsScrolled(mainContentRef.current.scrollTop > 50);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleProfileClick = () => {
    // 1. Trigger the "Shooting Star" animation by setting isScrolled to true
    setIsScrolled(true);
    
    // 2. Wait for the animation duration (0.8s) then navigate
    setTimeout(() => {
      setActiveTab('profile');
      setProfileView('update-profile');
    }, 800);
  };

  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isQuickPulseOpen, setIsQuickPulseOpen] = useState(false);
  const [activeIntervention, setActiveIntervention] = useState<'bp' | 'hydration' | 'sugar' | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [lastPainEntryHandled, setLastPainEntryHandled] = useState<string | null>(null);
  const [customProtocols, setCustomProtocols] = useEncryptedState<Protocol[]>([], 'ayursync_custom_protocols');

  const [questionnaireData, setQuestionnaireData] = useEncryptedState<any>({}, 'ayursync_questionnaire');
  const [pollingState, setPollingState] = useEncryptedState<Record<string, number>>({}, 'ayursync_polling');
  const [isVitalityModalOpen, setIsVitalityModalOpen] = useState(false);
  const [activeTips, setActiveTips] = useState<any[]>([]);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Global Health Context
  const [healthData, setHealthData] = useEncryptedState<HealthData>({
    name: '',
    age: 25,
    gender: 'Male',
    profession: 'Developer',
    lifestyleFocus: 'Startup Health',
    vitality: {
      steps: 8420,
      hydration: 1200,
      oxygen: 98,
      heartRate: 72,
      bloodSugar: 110,
      bloodPressure: '120/80',
      stress: 45,
      sleep: {
        total: 7.5,
        deep: 1.5,
        rem: 2.0
      }
    },
    sleepHistory: [
      { day: 'Mon', date: 'Mar 26', total: 7.2, deep: 1.8, rem: 1.5, bedtime: '11:00 PM', wakeup: '6:12 AM', quality: 78 },
      { day: 'Tue', date: 'Mar 27', total: 6.8, deep: 1.5, rem: 1.2, bedtime: '11:45 PM', wakeup: '6:33 AM', quality: 65 },
      { day: 'Wed', date: 'Mar 28', total: 8.1, deep: 2.4, rem: 2.1, bedtime: '10:30 PM', wakeup: '6:36 AM', quality: 92 },
      { day: 'Thu', date: 'Mar 29', total: 7.5, deep: 2.1, rem: 1.8, bedtime: '11:15 PM', wakeup: '6:45 AM', quality: 85 },
      { day: 'Fri', date: 'Mar 30', total: 6.2, deep: 1.2, rem: 1.0, bedtime: '12:30 AM', wakeup: '6:42 AM', quality: 58 },
      { day: 'Sat', date: 'Mar 31', total: 8.5, deep: 2.8, rem: 2.3, bedtime: '11:00 PM', wakeup: '7:30 AM', quality: 95 },
      { day: 'Sun', date: 'Apr 01', total: 7.8, deep: 2.2, rem: 1.9, bedtime: '10:45 PM', wakeup: '6:33 AM', quality: 88 },
    ],
    healthEvents: [],
    menstrualData: {
      lastPeriodStart: '',
      cycleLength: 28,
      periodLength: 5,
      history: []
    },
    scanHistory: [],
    painMap: [] as { 
      part: string; 
      intensity: number; 
      sensation: string[]; 
      duration: 'Acute' | 'Chronic'; 
      mobilityImpact: boolean; 
      comment: string; 
      timestamp: Date; 
      view: 'front' | 'back';
    }[],
    primaryGoal: 'Weight Loss',
    profileImage: ''
  }, 'ayursync_health_data');

  useEffect(() => {
    if (user?.photoURL && !healthData.profileImage) {
      setHealthData(prev => ({
        ...prev,
        profileImage: user.photoURL.replace('s96-c', 's400-c')
      }));
    }
  }, [user?.photoURL, healthData.profileImage, setHealthData]);

  const isCheckupDue = useMemo(() => {
    const now = Date.now();
    return Object.entries(POLLING_CATEGORIES).some(([category, config]) => {
      return config.metrics.some(metric => {
        const lastCheck = pollingState[metric] || 0;
        const hoursSince = (now - lastCheck) / (1000 * 60 * 60);
        return hoursSince >= config.standardIntervalHours;
      });
    });
  }, [pollingState]);

  const [latestHealthReport, setLatestHealthReport] = useState<any>(null);
  const [devices, setDevices] = useState<Device[]>([
    { id: 'apple', name: 'Apple Health', brand: 'Apple Health', connected: false, icon: Smartphone },
    { id: 'google', name: 'Google Fit', brand: 'Google Fit', connected: false, icon: Activity },
    { id: 'fitbit', name: 'Fitbit', brand: 'Fitbit', connected: false, icon: Activity },
    { id: 'samsung', name: 'Samsung Health', brand: 'Samsung Health', connected: false, icon: Smartphone }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [longPressedMessageId, setLongPressedMessageId] = useState<string | null>(null);
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set());
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [bluetoothDevice, setBluetoothDevice] = useEncryptedState<any>(null);
  const [showBluetoothInstructions, setShowBluetoothInstructions] = useState(false);
  const [isManualInputMode, setIsManualInputMode] = useState(false);
  const [manualDeviceId, setManualDeviceId] = useState('');
  const [vitalityScore, setVitalityScore] = useState(78);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [categoryScores, setCategoryScores] = useState({
    medical: 32,
    activity: 24,
    vitals: 16,
    hydration: 8
  });

  // Dynamic Vitality Score Calculation
  useEffect(() => {
    const calculateScore = () => {
      const { steps, hydration, oxygen, heartRate, bloodSugar, bloodPressure } = healthData.vitality;
      
      // 1. Medical Reports (40% weight -> max 40 points)
      const medical = latestHealthReport ? 36 : 32;
      
      // 2. Activity (30% weight -> max 30 points)
      const stepsScore = Math.min((steps / 10000) * 20, 20);
      const hrScore = (heartRate >= 60 && heartRate <= 100) ? 10 : 5;
      const activity = stepsScore + hrScore;
      
      // 3. Vitals (20% weight -> max 20 points)
      const oxygenScore = Math.min((oxygen / 95) * 10, 10);
      const bpScore = bloodPressure === '120/80' ? 10 : 8;
      const vitals = oxygenScore + bpScore;
      
      // 4. Hydration (10% weight -> max 10 points)
      const hydrationScore = Math.min((hydration / 3000) * 10, 10);
      
      setCategoryScores({
        medical,
        activity,
        vitals,
        hydration: hydrationScore
      });
      
      return Math.round(medical + activity + vitals + hydrationScore);
    };
    setVitalityScore(calculateScore());
  }, [healthData.vitality, latestHealthReport]);

  // Sync high-resolution profile picture from Google Auth
  useEffect(() => {
    if (user?.photoURL) {
      // Get high-res version of Google profile picture by replacing the size parameter
      const highResPhotoURL = user.photoURL.replace('=s96-c', '=s400-c');
      
      if (healthData.profileImage !== highResPhotoURL) {
        setHealthData(prev => ({
          ...prev,
          profileImage: highResPhotoURL
        }));
      }
    }
  }, [user?.photoURL, healthData.profileImage]);

  // Blueprint state (temporary for onboarding)
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('Male');
  const [activeCard, setActiveCard] = useState<'conditions' | 'goals' | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [primaryChallenge, setPrimaryChallenge] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [referralSource, setReferralSource] = useState('');

  useEffect(() => {
    if (healthData.primaryGoal) {
      setActiveTips(getPersonalizedTips(healthData.primaryGoal, healthData.dosha));
    } else {
      setActiveTips(getPersonalizedTips(''));
    }
  }, [healthData.primaryGoal, healthData.dosha]);

  const dismissTip = (id: string) => {
    setActiveTips(prev => prev.filter(tip => tip.id !== id));
  };

  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [consultMode, setConsultMode] = useState<string>('medical');
  const [dietMessages, setDietMessages] = useState<Message[]>([]);
  const [exerciseMessages, setExerciseMessages] = useState<Message[]>([]);
  const [medicalMessages, setMedicalMessages] = useState<Message[]>([]);
  const [pharmacologyMessages, setPharmacologyMessages] = useState<Message[]>([]);
  const [zenMessages, setZenMessages] = useState<Message[]>([]);
  const [sleepMessages, setSleepMessages] = useState<Message[]>([]);
  const [zaraMessages, setZaraMessages] = useState<Message[]>([]);
  const [veerMessages, setVeerMessages] = useState<Message[]>([]);
  const [isMicActive, setIsMicActive] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    medical: [],
    longevity: [],
    behavioral: [],
    nutrition: [],
    strength: [],
    pain: [],
    women: [],
    pediatric: [],
  });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, messageId: string, text: string } | null>(null);
  const [hasProteinNudge, setHasProteinNudge] = useState(false);
  const [hasRecoveryNudge, setHasRecoveryNudge] = useState(false);
  const [input, setInput] = useState('');
  const [universalSearchQuery, setUniversalSearchQuery] = useState('');
  const [currentSERP, setCurrentSERP] = useState<SERPResponse | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [serpTab, setSerpTab] = useState<'all' | 'places' | 'web' | 'video' | 'store'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [isConsultChatActive, setIsConsultChatActive] = useState(false);
  const [isSpecialistDrawerOpen, setIsSpecialistDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ayurCoins, setAyurCoins] = useState(150);
  const [streak, setStreak] = useState(5);
  const [isVitalityPulse, setIsVitalityPulse] = useState(false);
  const [dailyDharmaTasks, setDailyDharmaTasks] = useState([
    { id: 'activity', title: 'Activity Task', description: 'Walk 2,000 more steps to reach your goal.', type: 'activity', completed: false },
    { id: 'hydration', title: 'Hydration Task', description: 'Drink 2 glasses of water in the next 2 hours.', type: 'hydration', completed: false },
    { id: 'nutrition', title: 'Nutrition Task', description: 'Log a low-glycemic meal to stabilize your 110mg/dL glucose.', type: 'nutrition', completed: false }
  ]);
  const [coinAnimations, setCoinAnimations] = useState<{ id: number; x: number; y: number }[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [expandedJourneyId, setExpandedJourneyId] = useState<string | null>(null);
  const [hasSeenJourneyOnboarding, setHasSeenJourneyOnboarding] = useState(false);
  const [isJourneyBuilderOpen, setIsJourneyBuilderOpen] = useState(false);
  const [isGuidedResetActive, setIsGuidedResetActive] = useState(false);
  const [fullAnalysisData, setFullAnalysisData] = useState<any>(null);
  const [customJourney, setCustomJourney] = useState({
    name: '',
    duration: 15,
    vitals: [] as string[]
  });
  const [showMiraNotification, setShowMiraNotification] = useState(false);
  const [hasShownMiraNotification, setHasShownMiraNotification] = useState(false);

  // Vital Signs Trigger for Mira
  useEffect(() => {
    if (!hasShownMiraNotification && healthData.vitality) {
      const isHighStress = healthData.vitality.stress > 70;
      const isErraticHeartRate = healthData.vitality.heartRate > 100;
      const isPoorSleep = healthData.vitality.sleep ? healthData.vitality.sleep.total < 6 : false;

      if (isHighStress || isErraticHeartRate || isPoorSleep) {
        setShowMiraNotification(true);
        setHasShownMiraNotification(true);
        // Auto-hide after 10 seconds if not interacted with
        setTimeout(() => setShowMiraNotification(false), 10000);
      }
    }
  }, [healthData.vitality, hasShownMiraNotification]);

  // AI Simulation Sync for Journeys
  useEffect(() => {
    const activeWeightLoss = activeJourneys.find(j => j.id === 'weight-loss-15' && j.status === 'active');
    if (activeWeightLoss) {
      const interval = setInterval(() => {
        // Simulate pulling data
        setHealthData(prev => ({
          ...prev,
          vitality: {
            ...prev.vitality,
            steps: prev.vitality.steps + Math.floor(Math.random() * 100)
          }
        }));
        console.log("AI Simulation: Pulled simulated step data for Weight Loss Journey");
      }, 3600000); // Every hour
      return () => clearInterval(interval);
    }
  }, [activeJourneys]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen, selectedSpecialist]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const getQuickLogItems = () => {
    const history = healthData.scanHistory || [];
    if (history.length === 0) return [];

    const now = new Date();
    const currentHour = now.getHours();
    
    // Suggest items scanned within 2 hours of current time in the past
    const timeRelevant = history.filter(h => {
      const scanDate = new Date(h.timestamp);
      const scanHour = scanDate.getHours();
      return Math.abs(scanHour - currentHour) <= 2;
    });

    const counts: Record<string, { count: number, item: any }> = {};
    const itemsToConsider = timeRelevant.length > 0 ? timeRelevant : history;

    itemsToConsider.forEach(h => {
      if (!counts[h.name]) {
        counts[h.name] = { count: 0, item: h };
      }
      counts[h.name].count++;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(entry => entry.item);
  };

  const handleQuickLogClick = (item: ScanHistoryEntry) => {
    setFullAnalysisData(item.details);
    setExploreView('full-analysis');
    setVitalityScore(prev => Math.min(prev + (item.details.vitalityChange || 0), 100));
    showToast(`Quick-Logged: ${item.name}! ✨`);
  };

  const handleStopGeneration = () => {
    if (isTyping) {
      setIsTyping(false);
      // We can't actually kill the underlying fetch in @google/genai easily without AbortController support in the SDK
      // but we can signal our UI to stop waiting.
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear the last partial message if any (though currently we don't stream)
      // If we were streaming, we'd clear the last AI message.
      
      showToast('Generation stopped');
      inputRef.current?.focus();
    }
  };

  const handleLongPressStart = (msg: Message) => {
    if (msg.sender !== 'user') return;
    
    longPressTimer.current = setTimeout(() => {
      setInput(msg.text);
      // Remove original message or mark as editing
      if (selectedSpecialist) {
        setMessages(prev => ({
          ...prev,
          [selectedSpecialist.id]: prev[selectedSpecialist.id].filter(m => m.id !== msg.id)
        }));
      }
      showToast('Editing message...');
      inputRef.current?.focus();
    }, 600); // 600ms for long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleFeedback = (msgId: string, type: 'positive' | 'negative') => {
    if (selectedSpecialist) {
      setMessages(prev => ({
        ...prev,
        [selectedSpecialist.id]: prev[selectedSpecialist.id].map(m => m.id === msgId ? { ...m, feedback: type } : m)
      }));
    }
    
    console.log(`Logged ${type} feedback for message ${msgId}`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AyurSync Wellness Plan',
          text: text,
          url: window.location.href,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      showToast('Share not supported on this browser');
    }
  };

  // Explore State
  const [exploreSelection, setExploreSelection] = useState<'chronic' | 'self-care' | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [painIntensity, setPainIntensity] = useState(5);
  const [painComment, setPainComment] = useState('');
  const [exploreView, setExploreView] = useState<ExploreView>('launcher');

  useEffect(() => {
    if (activePage === 'dashboard' && activeTab === 'explorer' && exploreView === 'ayurvault') {
      setIsSidebarCollapsed(true);
    }
  }, [activePage, activeTab, exploreView]);
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<TimelineItem | null>(null);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [profileView, setProfileView] = useState<ProfileView>('main');

  const getDailyTasks = (activeJourneys: Journey[]) => {
    const isMuscleGain = healthData.primaryGoal === 'Muscle Gain';
    const highBP = parseInt(String(healthData.vitality.bloodPressure).split('/')[0]) > 130;

    // Check for active weight loss journey
    const weightLossJourney = activeJourneys.find(j => j.title.toLowerCase().includes('weight loss'));

    const baseTasks: DailyTask[] = [
      { id: '1', title: 'Brahma Muhurta Wakeup', time: '05:30 AM', description: 'Drink 2 glasses of warm water to flush toxins.', category: 'Wake-up', completed: false, notification: true },
      { 
        id: '2', 
        title: weightLossJourney ? 'Metabolism Flow' : 'Morning Yoga & Pranayama', 
        time: '06:00 AM', 
        description: weightLossJourney ? 'Specific intensity flow from your 15-Day Weight Loss plan.' : 'Sun Salutations and deep breathing for energy.', 
        category: 'Pre-workout', 
        completed: false, 
        notification: true,
        resourceLink: weightLossJourney ? 'journey-detail' : undefined
      },
      { 
        id: '3', 
        title: weightLossJourney ? 'Millet Porridge with Ginger' : 'Ayurvedic Breakfast', 
        time: '08:30 AM', 
        description: weightLossJourney ? 'Package-recommended metabolism-boosting breakfast.' : (isMuscleGain ? 'High protein breakfast with sprouted moong and nuts.' : 'Light warm breakfast like porridge or poha.'), 
        category: 'Breakfast', 
        completed: false, 
        notification: false,
        resourceLink: weightLossJourney ? 'journey-detail' : undefined
      },
      { id: '4', title: 'Deep Work Session', time: '10:00 AM', description: 'Focus on your most important task with zero distractions.', category: 'Deep Work', completed: false, notification: false },
      { id: '5', title: 'Balanced Lunch', time: '01:00 PM', description: 'Largest meal of the day with all six tastes.', category: 'Lunch', completed: false, notification: false },
      { id: '6', title: 'Evening Walk', time: '05:30 PM', description: 'Gentle walk in nature to balance Vata.', category: 'Evening Walk', completed: false, notification: true },
      { id: '7', title: 'Light Dinner', time: '07:30 PM', description: 'Easy to digest meal, 3 hours before sleep.', category: 'Dinner', completed: false, notification: false },
      { id: 'glow-ritual', title: 'Evening Glow Ritual', time: '08:30 PM', description: 'Cleanse and apply your personalized Lepas (Mask) or perform Abhyanga as prescribed by Dr. Zara.', category: 'Skincare', completed: false, notification: true },
      { id: '8', title: 'Sleep-prep Ritual', time: '09:30 PM', description: 'Digital detox and warm milk with nutmeg.', category: 'Sleep-prep', completed: false, notification: true },
    ];

    // Add calendar events as high priority tasks
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEvents = healthData.healthEvents?.filter(e => e.date === todayStr) || [];
    todayEvents.forEach(event => {
      baseTasks.push({
        id: `cal-${event.id}`,
        title: event.title,
        time: event.time,
        description: `High Priority: ${event.type} scheduled in your Health Calendar. ${event.notes || ''}`,
        category: (event.type === 'Consultation' || event.type === 'Appointment') ? 'Appointment' : 'Reminder',
        completed: false,
        notification: true
      });
    });

    // Lunar Cycle Proactive Notification
    const today = new Date();
    const isInPeriod = healthData.menstrualData?.history?.some(h => todayStr >= h.start && todayStr <= h.end);

    if (healthData.gender === 'Female' && healthData.menstrualData?.lastPeriodStart) {
      const lastStart = new Date(healthData.menstrualData.lastPeriodStart);
      const nextStart = new Date(lastStart);
      nextStart.setDate(lastStart.getDate() + (healthData.menstrualData.cycleLength || 28));
      
      const diffTime = nextStart.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 2) {
        baseTasks.push({
          id: 'lunar-cycle-alert',
          title: 'Lunar Cycle Approaching',
          time: '08:00 AM',
          description: 'Your Lunar Cycle is approaching. Dr. Kavya recommends increasing hydration and reducing intense workouts.',
          category: 'Health',
          completed: false,
          notification: true
        });
      }

      if (isInPeriod) {
        baseTasks.push({
          id: 'lunar-cycle-active',
          title: 'Lunar Flow Dharma',
          time: '07:00 AM',
          description: 'Current Phase: Pitta-dominant. Avoid spicy foods and prioritize rest today.',
          category: 'Health',
          completed: false,
          notification: true
        });
      }
    }

    if (weightLossJourney) {
      baseTasks.push({ id: '10', title: 'Avoid Curd Task', time: '06:30 PM', description: 'Package specific notice: Avoid curd in the evening to prevent Kapha buildup.', category: 'Reminder', completed: false, notification: true });
    }

    if (highBP) {
      baseTasks.push({ id: '9', title: 'Guided Pranayama', time: '06:00 PM', description: '15-minute cooling breath to stabilize BP.', category: 'Evening Walk', completed: false, notification: true });
    }

    if (hasProteinNudge) {
      baseTasks.push({ id: 'protein-nudge', title: 'High Protein Meal', time: '08:00 PM', description: 'Veer recommended extra protein for muscle recovery after your heavy session.', category: 'Dinner', completed: false, notification: true });
    }

    if (hasRecoveryNudge) {
      baseTasks.push({ id: 'recovery-nudge', title: 'Deep Recovery Session', time: '09:00 PM', description: 'Kabir scheduled a deep recovery session to reset your nervous system post-workout.', category: 'Sleep-prep', completed: false, notification: true });
    }

    return baseTasks.sort((a, b) => {
      const [timeA, modifierA] = a.time.split(' ');
      const [hoursA, minutesA] = timeA.split(':').map(Number);
      let hA = hoursA;
      if (modifierA === 'PM' && hA < 12) hA += 12;
      if (modifierA === 'AM' && hA === 12) hA = 0;

      const [timeB, modifierB] = b.time.split(' ');
      const [hoursB, minutesB] = timeB.split(':').map(Number);
      let hB = hoursB;
      if (modifierB === 'PM' && hB < 12) hB += 12;
      if (modifierB === 'AM' && hB === 12) hB = 0;

      return (hA * 60 + minutesA) - (hB * 60 + minutesB);
    });
  };

  const [tasks, setTasks] = useState<DailyTask[]>(() => getDailyTasks([]));
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { 
      id: 'routine-checkup', 
      title: 'Routine Health Checkup', 
      description: 'Your clinical intervals recommend a pulse check.', 
      timestamp: new Date(), 
      type: 'action', 
      status: 'pending', 
      read: false,
      icon: Bell, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50' 
    },
    { 
      id: 'welcome-update', 
      title: 'Welcome to AyurSync', 
      description: 'Explore your personalized Ayurvedic journey today.', 
      timestamp: new Date(), 
      type: 'update', 
      status: 'completed', 
      read: true,
      icon: Check, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50' 
    }
  ]);

  useEffect(() => {
    if (isCheckupDue) {
      setNotifications(prev => {
        const exists = prev.find(n => n.id === 'routine-checkup');
        if (exists) {
          if (exists.status === 'completed') {
             return prev.map(n => n.id === 'routine-checkup' ? { ...n, status: 'pending', read: false } : n);
          }
          return prev;
        }
        return [
          { 
            id: 'routine-checkup', 
            title: 'Routine Health Checkup', 
            description: 'Your clinical intervals recommend a pulse check.', 
            timestamp: new Date(), 
            type: 'action', 
            status: 'pending', 
            read: false,
            icon: Bell, 
            color: 'text-rose-500', 
            bg: 'bg-rose-50' 
          },
          ...prev
        ];
      });
    }
  }, [isCheckupDue]);

  useEffect(() => {
    const highBP = parseInt(String(healthData.vitality.bloodPressure).split('/')[0]) > 130;

    setNotifications(prev => {
      let newNotifs = [...prev];
      let added = false;

      if (highBP && !newNotifs.some(n => n.id === 'high-bp-alert')) {
        newNotifs.unshift({
          id: 'high-bp-alert',
          title: 'High BP Detected',
          description: 'Re-measure now. Your blood pressure is elevated.',
          timestamp: new Date(),
          type: 'action',
          status: 'pending',
          read: false,
          icon: AlertCircle,
          color: 'text-rose-500',
          bg: 'bg-rose-50'
        });
        added = true;
      }

      return added ? newNotifs : prev;
    });
  }, [healthData.vitality.bloodPressure]);
  const [activeSystemNotification, setActiveSystemNotification] = useState<AppNotification | null>(null);

  // SOS State
  const [sosProgress, setSosProgress] = useState(0);
  const sosTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Blueprint state (temporary for onboarding)
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<{ type: 'privacy' | 'terms' | 'cookie' | 'help' | 'about' | null }>({ type: null });
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedInUI, setIsLoggedInUI] = useState(false);
  const [blueprintCompleted, setBlueprintCompleted] = useState(false);

  // Sync notifications for upcoming events and lunar cycle
  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Health Events Notifications
    healthData.healthEvents?.forEach(event => {
      if (event.date === todayStr) {
        try {
          const timeParts = event.time.split(' ');
          const [hours, minutes] = timeParts[0].split(':').map(Number);
          const modifier = timeParts[1]; // AM/PM if exists
          
          let h = hours;
          if (modifier === 'PM' && h < 12) h += 12;
          if (modifier === 'AM' && h === 12) h = 0;
          
          const eventTime = new Date(now);
          eventTime.setHours(h, minutes, 0, 0);
          
          const diffMins = (eventTime.getTime() - now.getTime()) / (1000 * 60);
          
          if (diffMins > 0 && diffMins <= 15) {
            setNotifications(prev => {
              const id = `notif-event-${event.id}`;
              if (prev.some(n => n.id === id)) return prev;
              return [
                {
                  id,
                  title: `Upcoming: ${event.title}`,
                  description: `Your ${event.type} is in 15 minutes.`,
                  timestamp: new Date(),
                  type: 'alarm',
                  status: 'pending',
                  read: false,
                  icon: Bell,
                  color: 'text-rose-500',
                  bg: 'bg-rose-50'
                },
                ...prev
              ];
            });
          }
        } catch (e) {
          console.error("Error parsing event time:", event.time, e);
        }
      }
    });

    // Lunar Cycle Proactive Notification
    if (healthData.gender === 'Female' && healthData.menstrualData?.lastPeriodStart) {
      const lastStart = new Date(healthData.menstrualData.lastPeriodStart);
      if (!isNaN(lastStart.getTime())) {
        const nextStart = new Date(lastStart);
        nextStart.setDate(lastStart.getDate() + (healthData.menstrualData.cycleLength || 28));
        
        const diffTime = nextStart.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 2) {
          setNotifications(prev => {
            const id = 'notif-lunar-cycle';
            if (prev.some(n => n.id === id)) return prev;
            return [
              {
                id,
                title: 'Lunar Cycle Approaching',
                description: 'Your Lunar Cycle is approaching. Dr. Kavya recommends increasing hydration and reducing intense workouts.',
                timestamp: new Date(),
                type: 'update',
                status: 'pending',
                read: false,
                icon: Droplets,
                color: 'text-rose-500',
                bg: 'bg-rose-50'
              },
              ...prev
            ];
          });
        }
      }
    }
  }, [healthData.healthEvents, healthData.menstrualData, healthData.gender]);

  useEffect(() => {
    setTasks(prevTasks => {
      const newTasks = getDailyTasks(activeJourneys);
      return newTasks.map(nt => {
        const existing = prevTasks.find(pt => pt.id === nt.id);
        if (existing) {
          return { ...nt, completed: existing.completed, notification: existing.notification };
        }
        return nt;
      });
    });
  }, [activeJourneys, hasProteinNudge, hasRecoveryNudge, healthData.healthEvents, healthData.menstrualData]);
  const [justRegistered, setJustRegistered] = useState(false);

  // Medical Scanner State
  const [medicalReportImage, setMedicalReportImage] = useState<string | null>(null);
  const [medicalReportResult, setMedicalReportResult] = useState<MedicalReportResult | string | null>(null);
  const [isScanningReport, setIsScanningReport] = useState(false);
  const [scanProgressText, setScanProgressText] = useState("Kavya is extracting medical markers...");
  const reportInputRef = useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (isScanningReport) {
      const texts = [
        "Kavya is extracting medical markers...",
        "Analyzing nutritional impacts...",
        "Synthesizing your Vitality Brief..."
      ];
      let i = 0;
      setScanProgressText(texts[0]);
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setScanProgressText(texts[i]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isScanningReport]);

  // Sync Vitality Data from Firestore
  useEffect(() => {
    if (user) {
      const docRef = doc(db, `users/${user.uid}/vitals`, 'current');
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setHealthData(prev => ({
            ...prev,
            vitality: {
              ...prev.vitality,
              bloodSugar: data.bloodSugar || prev.vitality.bloodSugar,
              bloodPressure: data.bloodPressure || prev.vitality.bloodPressure,
              heartRate: data.heartRate || prev.vitality.heartRate,
              steps: data.steps || prev.vitality.steps,
              hydration: data.hydration || prev.vitality.hydration,
              stress: data.stress || prev.vitality.stress,
            }
          }));
        } else {
          // Initialize if not exists
          setDoc(docRef, {
            bloodSugar: 110,
            bloodPressure: '120/80',
            heartRate: 72,
            steps: 8420,
            hydration: 1200,
            stress: 45,
            updatedAt: serverTimestamp()
          }).catch((err: any) => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/vitals/current`));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/vitals/current`);
      });
      return () => unsubscribe();
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      const q = query(
        collection(db, `users/${user.uid}/health_reports`),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setLatestHealthReport(snapshot.docs[0].data());
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/health_reports`);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);

  const handleChatScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      if (!isAtBottom) {
        setIsAutoScrollPaused(true);
      } else {
        setIsAutoScrollPaused(false);
      }
    }
  };

  // Metric Goals & Insights Logic
  const getMetricGoal = (metric: string) => {
    const hasDiabetes = healthData.primaryGoal.toLowerCase().includes('diabetes') || 
                       healthData.vitality.bloodSugar > 140;
    
    switch (metric) {
      case 'Steps': return hasDiabetes ? 12000 : 10000;
      case 'Hydration': return 3000;
      case 'Oxygen': return 95;
      case 'Heart Rate': return 75;
      case 'Blood Sugar': return hasDiabetes ? 110 : 140;
      case 'Blood Pressure': return 120;
      default: return 100;
    }
  };

  const getAIInsight = (metric: string, value: number, goal: number) => {
    const isNegativeMetric = metric === 'Blood Sugar' || metric === 'Blood Pressure' || metric === 'Heart Rate';
    const isAchieved = isNegativeMetric ? value <= goal : value >= goal;
    const diff = Math.abs(value - goal);
    
    if (isAchieved) {
      switch (metric) {
        case 'Steps': return `Goal Achieved! Walking ${value} steps today has improved your insulin sensitivity and cardiovascular oxygenation. Your body is now 15% more efficient at processing glucose.`;
        case 'Hydration': return `Excellent hydration! Your Ojas (vitality) is flowing freely. Proper water intake ensures that your Dhatus (tissues) are well-nourished and toxins are flushed from your system.`;
        case 'Blood Sugar': return `Balanced Agni! Your glucose levels are stable at ${value}mg/dL. This steady state prevents the formation of Ama (metabolic waste) and protects your vital organs from oxidative stress.`;
        case 'Blood Pressure': return `Your blood pressure is within the optimal range. This indicates a calm Vata and a healthy heart, reducing the risk of cardiovascular strain.`;
        case 'Oxygen': return `SpO2 is optimal! Your Prana is circulating effectively, ensuring that every cell in your body is receiving the life-force it needs to thrive.`;
        default: return `Vitality Fact: Your ${metric.toLowerCase()} levels are optimal. This balance supports your overall Prana and ensures long-term health stability.`;
      }
    } else {
      const profile = healthData.primaryGoal.toLowerCase().includes('diabetes') ? 'diabetic' : 'general';
      switch (metric) {
        case 'Steps': return `Warning: You missed your step goal by ${diff} steps. For a ${profile} profile, this inactivity can lead to poor glucose circulation and increased peripheral neuropathy risk.`;
        case 'Blood Sugar': return `Caution: Your glucose is ${diff}mg/dL above target. This elevation can strain your kidneys and lead to inflammation. Consider a short walk or Ayurvedic herbs like Bitter Melon to stabilize.`;
        case 'Oxygen': return `Alert: SpO2 is below target. This indicates reduced Prana flow. Practice deep Pranayama (breathing exercises) to oxygenate your blood and clear your energy channels.`;
        case 'Blood Pressure': return `Attention: Your systolic pressure is ${diff}mmHg above target. This indicates an aggravated Pitta or Vata. Avoid stimulants and practice cooling Sitali breath.`;
        default: return `Notice: Your ${metric.toLowerCase()} is off-target. Consistent monitoring and small lifestyle adjustments are key to restoring your natural Dosha balance.`;
      }
    }
  };

  const getMetricData = (metric: string) => {
    const keyMap: Record<string, string> = {
      'Steps': 'steps',
      'Hydration': 'hydration',
      'Oxygen': 'oxygen',
      'Heart Rate': 'heartRate',
      'Blood Sugar': 'bloodSugar',
      'Blood Pressure': 'bloodPressure'
    };
    
    const key = keyMap[metric] || 'steps';
    let baseValue: number;
    
    if (key === 'bloodPressure') {
      const systolic = parseInt(String(healthData.vitality.bloodPressure).split('/')[0]) || 120;
      baseValue = systolic;
    } else {
      baseValue = healthData.vitality[key as keyof typeof healthData.vitality] as number || 80;
    }

    return [
      { day: 'Mon', value: Math.round(baseValue * 0.9) },
      { day: 'Tue', value: Math.round(baseValue * 1.1) },
      { day: 'Wed', value: Math.round(baseValue * 0.85) },
      { day: 'Thu', value: Math.round(baseValue * 1.05) },
      { day: 'Fri', value: Math.round(baseValue * 0.95) },
      { day: 'Sat', value: Math.round(baseValue * 1.2) },
      { day: 'Sun', value: baseValue },
    ];
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const sanitize = (str: string) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m] || m));
  };

  const handleInterventionComplete = (metric: string, newValue: any) => {
    setHealthData(prev => ({
      ...prev,
      vitality: {
        ...prev.vitality,
        [metric]: newValue
      }
    }));
    setAyurCoins(prev => prev + 50);
    // vitalityScore is automatically updated via useEffect
    setActiveIntervention(null);
  };

  const completeRoutineCheckup = (updates: Record<string, any>) => {
    const now = Date.now();
    const pollingUpdates: Record<string, number> = {};
    
    // Update polling state for metrics that were actually updated
    Object.keys(updates).forEach(metric => {
      pollingUpdates[metric] = now;
    });
    
    setPollingState(prev => ({ ...prev, ...pollingUpdates }));

    // Mark notification as completed
    setNotifications(prev => prev.map(n => n.id === 'routine-checkup' ? { ...n, status: 'completed' } : n));

    // Update health data vitality
    setHealthData(prev => {
      const newVitality = { ...prev.vitality };
      Object.entries(updates).forEach(([metric, value]) => {
        if (metric in newVitality) {
          // Special handling for bloodPressure which must remain a string
          if (metric === 'bloodPressure') {
            (newVitality as any)[metric] = String(value);
          } else if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
            (newVitality as any)[metric] = Number(value);
          } else {
            (newVitality as any)[metric] = value;
          }
        }
      });
      return { ...prev, vitality: newVitality };
    });
  };

  const handlePainSave = (entry: any) => {
    setHealthData(prev => ({
      ...prev,
      painMap: [...prev.painMap, entry]
    }));
    // Data Hand-off logic: Mark this entry as needing a reaction
    setLastPainEntryHandled(null); 
  };

  const handlePainDelete = (index: number) => {
    setHealthData(prev => ({
      ...prev,
      painMap: prev.painMap.filter((_, i) => i !== index)
    }));
  };

  const handleStartMetaShred = () => {
    // 1. Lock user into Meta-Shred Day 1
    setJourneys(prev => prev.map(j => 
      j.id === 'meta-shred' ? { ...j, isLocked: false, currentDay: 1 } : j
    ));
    
    // 2. Trigger notification
    const newNotification: AppNotification = {
      id: `meta-shred-start-${Date.now()}`,
      title: 'Meta-Shred Protocol Activated',
      description: 'Day 1: Rapid Metabolism Ignition is now live. Check your schedule.',
      type: 'update',
      timestamp: new Date(),
      status: 'pending',
      read: false,
      icon: Flame,
      color: 'text-sage-primary',
      bg: 'bg-sage-light/20'
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // 3. Navigate to active zone
    setActivePage('meta-shred-active');
  };

  const handleTabChange = (tabId: Tab) => {
    console.log("Navigating to:", tabId);
    setActiveTab(tabId);
    
    // Explicitly unmount/hide Explorer components and reset states
    setExploreView('launcher');
    setExploreSelection(null);
    setSelectedBodyPart(null);
    setIsManualInputMode(false);
    setIsSpecialistDrawerOpen(false);
    setSelectedJourneyId(null);
    setIsCreatingCustomJourney(false);
    setZoomedNotice(null);
    setActiveMetric(null);
    setIsVitalityModalOpen(false);
    
    // Reset Consult states regardless of target tab to ensure clean unmount
    setIsChatOpen(false);
    setIsTyping(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Specialist Initial Greeting Logic
  useEffect(() => {
    if (isChatOpen && selectedSpecialist && messages[selectedSpecialist.id].length === 0 && !isTyping) {
      const triggerGreeting = async () => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let greeting = "";
        switch (selectedSpecialist.id) {
          case 'medical': greeting = "Namaste. I am Dr. Kavya. I have analyzed your biomarkers and am ready to restore your Prakriti with clinical precision. How shall we begin our consultation?"; break;
          case 'longevity': greeting = "Greetings. I am Dr. Aryan. My focus is extending your health-span through cellular optimization. Let's review your data to architect your longevity."; break;
          case 'behavioral': greeting = "I hear you, and I am here for you. I am Dr. Mira. Let's tend to the soil of your mind so your vitality may bloom. How are you feeling in this moment?"; break;
          case 'nutrition': greeting = "Namaste! I am Rohini. Your nutrition is the fuel for your life. I am ready to optimize your diet through Ayurvedic precision. What have you nourished yourself with today?"; break;
          case 'strength': greeting = "Let's get to work. I am Veer. We are here to build physical resilience and metabolic fire. Are you ready to push your limits safely?"; break;
          case 'pain': greeting = "I am Kabir. My mission is eliminating your pain through structural harmony and methodical movement. Tell me, where does your body feel restricted today?"; break;
          case 'women': greeting = "Welcome. I am Ananya. I am here to help you synchronize your health with your natural lunar and life cycles. How can I support your balance today?"; break;
          case 'pediatric': greeting = "Hi there! I'm Ishaan. I'm here to help architect a foundation of future vitality for the younger ones. How can I help you today?"; break;
        }

        const aiMsg: Message = {
          id: 'greeting-' + Date.now(),
          text: greeting,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => ({
          ...prev,
          [selectedSpecialist.id]: [aiMsg]
        }));
        setIsTyping(false);
      };

      triggerGreeting();
    }
  }, [isChatOpen, selectedSpecialist, messages, isTyping]);

  // Auto scroll to bottom
  React.useEffect(() => {
    if (isChatOpen && !isAutoScrollPaused) {
      const scrollTimeout = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50); // Reduced timeout for faster jump
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages, isTyping, isChatOpen, selectedSpecialist, isAutoScrollPaused]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    // UI-First Bypass
    setTimeout(() => {
      setIsLoggedInUI(true);
      setView('blueprint');
      setIsSubmitting(false);
    }, 500);
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    // UI-First Bypass
    setTimeout(() => {
      setIsLoggedInUI(true);
      setJustRegistered(true);
      setView('blueprint');
      setIsSubmitting(false);
    }, 500);
  };

  const toggleDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const newState = !d.connected;
        if (newState) {
          showToast(`${d.name} connected successfully!`);
        }
        return { ...d, connected: newState };
      }
      return d;
    }));
  };

  const handleSearchDevices = async () => {
    setShowBluetoothInstructions(false);
    setIsScanning(true);
    setDiscoveredDevices([]);
    
    // Prototyping Hack: Wait at least 5 seconds for the Radar Animation
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (!(navigator as any).bluetooth) {
      showToast("Web Bluetooth is not supported. Showing available devices...");
      // Fallback: Always show the mock device
      setDiscoveredDevices([{ id: 'mock-1', name: 'AyurSync Fitband (Ready to Pair)', mock: true }]);
      setIsScanning(false);
      return;
    }

    try {
      // Trigger the browser/system pop-up
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'Fit' },
          { namePrefix: 'Watch' },
          { namePrefix: 'Health' }
        ],
        optionalServices: ['battery_service', 'device_information']
      });

      // Add the selected device to the discovered list
      setDiscoveredDevices(prev => {
        const list = prev.find(d => d.id === device.id) ? prev : [...prev, device];
        // Ensure mock device is also there for testing
        if (!list.find(d => d.id === 'mock-1')) {
          list.push({ id: 'mock-1', name: 'AyurSync Fitband (Ready to Pair)', mock: true });
        }
        return list;
      });
      
      setIsScanning(false);
    } catch (error: any) {
      console.error("Bluetooth Search Error:", error);
      setIsScanning(false);
      
      // Fallback: Always show the mock device even on error
      setDiscoveredDevices([{ id: 'mock-1', name: 'AyurSync Fitband (Ready to Pair)', mock: true }]);
      
      if (error.name !== 'NotFoundError') {
        showToast("Bluetooth search failed. Try manual sync if blocked.");
      }
    }
  };

  const handleManualConnect = () => {
    if (!manualDeviceId.trim()) {
      showToast("Please enter a valid Device ID.");
      return;
    }
    const mockDevice = {
      id: manualDeviceId,
      name: `AyurSync Fitband (${manualDeviceId})`,
      mock: true
    };
    handleConnectDevice(mockDevice);
    setIsManualInputMode(false);
    setManualDeviceId('');
  };

  const handleConnectDevice = async (device: any) => {
    try {
      showToast(`Connecting to ${device.name}...`);
      
      // In a real environment, we'd connect to GATT
      // if (!device.mock) await device.gatt.connect();
      
      setBluetoothDevice(device);
      showToast(`AyurSync is now receiving live vitals from ${device.name}.`);
      
      // Simulate real-time data handshake (Persistent Sync)
      const interval = setInterval(() => {
        // Update health data with simulated live vitals
        setHealthData(prev => ({
          ...prev,
          vitality: {
            ...prev.vitality,
            heartRate: Math.floor(Math.random() * (85 - 65 + 1)) + 65,
            steps: prev.vitality.steps + Math.floor(Math.random() * 5)
          }
        }));
      }, 60000); // Fluctuates every minute

      // Listen for disconnection
      if (!device.mock) {
        device.addEventListener('gattserverdisconnected', () => {
          setBluetoothDevice(null);
          clearInterval(interval);
          showToast(`${device.name} disconnected.`);
        });
      }

    } catch (error) {
      console.error("Bluetooth Connection Error:", error);
      showToast(`Failed to connect to ${device.name}.`);
    }
  };

  const handlePermanentAccountDeletion = async () => {
    setIsDeleteModalOpen(true);
  };

  const confirmAndDelete = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      setIsLoggedInUI(false);
      setView('welcome');
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error("Delete account error", error);
      if (error.code === 'auth/requires-recent-login') {
        setIsDeleteModalOpen(false);
        await signOut();
        setToast("For security, please log in again to confirm account deletion.");
        setTimeout(() => setToast(null), 5000);
        setView('login');
      } else {
        setIsDeleteModalOpen(false);
        setToast("An error occurred while deleting your account.");
        setTimeout(() => setToast(null), 5000);
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // SOS Logic
  const startSosTimer = () => {
    setSosProgress(0);
    sosTimerRef.current = setInterval(() => {
      setSosProgress((prev) => {
        if (prev >= 100) {
          triggerSos();
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const stopSosTimer = () => {
    if (sosTimerRef.current) {
      clearInterval(sosTimerRef.current);
      sosTimerRef.current = null;
    }
    setSosProgress(0);
  };

  const triggerSos = () => {
    stopSosTimer();
    setIsSosModalOpen(true);
  };

  const handleRegenerate = async (msg: Message) => {
    if (isTyping || !selectedSpecialist) return;
    const currentMessages = messages[selectedSpecialist.id] || [];
    const msgIndex = currentMessages.findIndex(m => m.id === msg.id);
    if (msgIndex !== -1) {
      const newMessages = currentMessages.slice(0, msgIndex);
      handleSendMessage(undefined, msg.text, newMessages, 0.9); // Fresher temperature
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string, customHistory?: Message[], temperature?: number) => {
    if (e) e.preventDefault();
    
    if (isTyping) {
      handleStopGeneration();
      return;
    }

    const textToUse = overrideText || input;
    const sanitizedInput = sanitize(textToUse);
    if (!sanitizedInput.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: sanitizedInput, sender: 'user', timestamp: new Date() };
    
    if (!selectedSpecialist) return;

    const historyToUse = customHistory || messages[selectedSpecialist.id] || [];

    setMessages(prev => ({
      ...prev,
      [selectedSpecialist.id]: [...historyToUse, userMsg]
    }));
    
    if (!overrideText) setInput('');
    setIsTyping(true);
    setIsAutoScrollPaused(false); // Resume auto-scroll on new message
    
    // 1.5s simulated typing delay for human-expert feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const history = [...historyToUse, userMsg].map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const response = await getSpecialistResponse(selectedSpecialist, sanitizedInput, healthData, history, undefined, temperature);
      
      if (controller.signal.aborted) return;

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: response || 'I am sorry, I could not process that.', 
        sender: 'ai', 
        timestamp: new Date()
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedSpecialist.id]: [...(prev[selectedSpecialist.id] || []), aiMsg]
      }));

      // Handle Nudges (Cross-Specialist Intelligence)
      if (selectedSpecialist.id === 'strength') {
        if (response.includes('[NUDGE_ROHINI_PROTEIN]')) {
          setHasProteinNudge(true);
          const rohiniNudge: Message = {
            id: Date.now().toString() + '-rohini',
            text: "Veer just informed me about your heavy strength session! I've updated your daily tasks with a High Protein Meal recommendation to support muscle recovery.",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => ({
            ...prev,
            nutrition: [...(prev.nutrition || []), rohiniNudge]
          }));
        }
        if (response.includes('[NUDGE_KABIR_RECOVERY]')) {
          setHasRecoveryNudge(true);
          const kabirNudge: Message = {
            id: Date.now().toString() + '-kabir',
            text: "Veer mentioned your intense workout. I've added a Deep Recovery Session to your evening routine to ensure your nervous system resets properly.",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => ({
            ...prev,
            pain: [...(prev.pain || []), kabirNudge]
          }));
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Generation aborted');
      } else {
        console.error('Error in specialist chat:', err);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleUniversalSearch = async (query: string) => {
    if (!query.trim()) return;
    setExploreView('universal-search');
    setCurrentSearchTerm(query);
    setSerpTab('all');
    setIsSearching(true);
    setCurrentSERP(null);
    setUniversalSearchQuery('');
    
    let locStr = "Location not provided";
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: 60000, timeout: 3000 });
        });
        locStr = `Latitude: ${pos.coords.latitude}, Longitude: ${pos.coords.longitude}`;
      } catch (e) {
        console.warn("Geolocation error:", e);
      }
    }

    const contextPrompt = `
      USER PROFILE & HEALTH CONTEXT:
      - Name: ${healthData.name}
      - Age: ${healthData.age}
      - Gender: ${healthData.gender}
      - Profession: ${healthData.profession || 'Not specified'}
      - Lifestyle Focus: ${healthData.lifestyleFocus || 'Not specified'}
      - Current Location: ${locStr}
      - Current Vitality Stats: 
        * Steps: ${healthData.vitality.steps}
        * Hydration: ${healthData.vitality.hydration}ml
        * Oxygen (O2): ${healthData.vitality.oxygen}%
        * Heart Rate (HR): ${healthData.vitality.heartRate}bpm
        * Blood Sugar: ${healthData.vitality.bloodSugar}mg/dL
        * Blood Pressure (BP): ${healthData.vitality.bloodPressure}
        * Sleep: ${healthData.vitality.sleep?.total}h (Deep: ${healthData.vitality.sleep?.deep}h, REM: ${healthData.vitality.sleep?.rem}h)
      - Connected Devices: ${devices.filter(d => d.connected).map(d => d.name).join(', ') || 'None'}
      - Primary Health Goal: ${healthData.primaryGoal}
      
      DEEP DIVE QUESTIONNAIRE DATA (High-Precision Health Root):
      ${JSON.stringify(questionnaireData, null, 2)}
      
      USER QUESTION: "${query}"
    `;

    try {
      const response = await getSERPResponse(contextPrompt);
      setCurrentSERP(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMedicalReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedicalReportImage(reader.result as string);
        setMedicalReportResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMedicalReportScan = async () => {
    if (!medicalReportImage) return;
    setIsScanningReport(true);
    try {
      const base64Data = medicalReportImage.split(',')[1];
      const mimeType = medicalReportImage.split(';')[0].split(':')[1];
      const result = await analyzeMedicalReport(base64Data, mimeType);
      setMedicalReportResult(result);

      // Save to Firestore
      if (user) {
        try {
          await addDoc(collection(db, `users/${user.uid}/health_reports`), {
            ...result,
            createdAt: serverTimestamp()
          });
        } catch (dbError) {
          handleFirestoreError(dbError, OperationType.CREATE, `users/${user.uid}/health_reports`);
        }
      }
    } catch (error) {
      console.error("Error scanning report:", error);
      setMedicalReportResult("Failed to analyze the report. Please try again.");
    } finally {
      setIsScanningReport(false);
    }
  };

  // Live Reminder Logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      healthData.healthEvents?.forEach(event => {
        if (event.date === todayStr && event.time === currentTime) {
          const notificationId = `reminder-${event.id}-${todayStr}-${currentTime}`;
          setNotifications(prev => {
            if (prev.some(n => n.id === notificationId)) return prev;
            return [{
              id: notificationId,
              title: 'Live Reminder',
              description: `${event.title} is starting now!`,
              timestamp: new Date(),
              type: 'alarm',
              status: 'pending',
              read: false
            }, ...prev];
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [healthData.healthEvents]);

  // Redirect if logged in
  React.useEffect(() => {
    const activeUser = user || isLoggedInUI;
    if (activeUser) {
      if ((justRegistered || isLoggedInUI) && !blueprintCompleted) {
        if (view !== 'blueprint') setView('blueprint');
      } else if (blueprintCompleted) {
        if (view !== 'dashboard') setView('dashboard');
      } else {
        // Default for login
        if (view !== 'dashboard' && view !== 'blueprint') setView('dashboard');
      }
    } else if (view === 'dashboard' || view === 'blueprint') {
      // In UI-First mode, we don't force redirect to welcome if not logged in via Firebase
      // unless we explicitly want to reset.
    }
  }, [user, isLoggedInUI, justRegistered, blueprintCompleted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="space-y-12 text-center">
          <AyurSyncLoader size="large" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-serif font-bold text-sage-primary tracking-tight">AyurSync</h1>
            <p className="text-sm text-gray-400 font-medium tracking-[0.2em] uppercase">Architecting Your Vitality</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const baseNotices: any[] = [
    {
      id: 'main-list',
      type: 'pinned-paper',
      title: 'Your Day 3 Dharma',
      content: (
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">Your Day 3 Dharma</h3>
          <ul className="space-y-3 font-handwriting text-lg text-gray-700">
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Wake (6:00 AM)</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Yoga (6:30 AM)</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Breakfast (8:00 AM)</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Hydration Check (10:00 AM)</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Lunch (1:00 PM)</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Walk (5:00 PM)</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Dinner (7:30 PM)</li>
            <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-400 rounded-sm" /> Sleep (10:00 PM)</li>
          </ul>
        </div>
      ),
      position: { top: '5%', left: '35%' },
      rotate: -2,
      zIndex: 10,
      className: 'bg-[#fdfbf7] w-80 min-h-[400px] p-8 shadow-[10px_10px_20px_rgba(0,0,0,0.2)] bg-[linear-gradient(transparent_95%,#e5e5e5_95%)] bg-[length:100%_2rem]',
      pinColor: 'bg-red-500'
    },
    {
      id: 'meal-card',
      type: 'index-card',
      title: 'Meal Card',
      content: (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rohini&backgroundColor=e6f2ff" alt="Rohini" className="w-full h-full object-cover" />
          </div>
          <p className="font-medium text-blue-900 font-handwriting text-xl leading-relaxed">Skip White Rice today. Try Ragi Chilla instead.</p>
        </div>
      ),
      position: { bottom: '15%', right: '10%' },
      rotate: 15,
      zIndex: 20,
      className: 'bg-[#e6f2ff] w-64 p-6 border-t-[12px] border-blue-300 shadow-[15px_15px_25px_rgba(0,0,0,0.25)]',
      pinColor: 'bg-blue-500'
    },
    {
      id: 'workout-memo',
      type: 'torn-notebook',
      title: 'Workout Memo',
      content: (
        <div className="space-y-2">
          <p className="font-handwriting text-xl text-gray-800 font-bold">Ishaan says:</p>
          <p className="font-handwriting text-2xl text-red-600">2,000 steps by noon.</p>
          <p className="font-handwriting text-xl text-gray-800 underline decoration-wavy decoration-red-400">No excuses.</p>
        </div>
      ),
      position: { top: '30%', left: '10%' },
      rotate: -8,
      zIndex: 15,
      className: 'bg-white w-64 p-6 border-l-4 border-red-200 shadow-[12px_12px_22px_rgba(0,0,0,0.22)]',
      pinColor: 'bg-red-600'
    },
    {
      id: 'red-alert',
      type: 'sos',
      title: 'Red Alert',
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <ShieldAlert className="w-10 h-10 text-white" />
          <p className="font-bold text-white text-center text-lg uppercase tracking-wider">D3 Level is Critical (18ng/mL).</p>
          <p className="text-white text-center font-medium">Take your supplement.</p>
        </div>
      ),
      position: { bottom: '25%', left: '15%' },
      rotate: 5,
      zIndex: 30,
      className: 'bg-rose-600 w-56 h-56 p-6 shadow-[20px_20px_30px_rgba(0,0,0,0.3)] border-2 border-rose-700',
      pinColor: 'bg-yellow-400'
    },
    {
      id: 'quote',
      type: 'sticky-note',
      title: 'Quote',
      content: (
        <p className="font-handwriting text-2xl text-gray-800 leading-relaxed">"Health is a state of body. Wellness is a state of being."</p>
      ),
      position: { top: '15%', right: '15%' },
      rotate: -15,
      zIndex: 12,
      className: 'bg-yellow-200 w-52 p-6 shadow-[8px_8px_15px_rgba(0,0,0,0.15)]'
    }
  ];

  const notices = [...baseNotices];

  if (healthData.vitality.stress >= 80) {
    notices.push({
      id: 'mira-stress-alert',
      type: 'sticky-note',
      title: 'A note from Dr. Mira',
      content: (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <img src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_0000000059f871fa93c90f24cd47aeda.png" alt="Dr. Mira" className="w-full h-full object-cover object-top" />
          </div>
          <p className="font-medium text-purple-900 font-handwriting text-xl leading-relaxed">
            Swami, I sense a heavy cloud today. Spend a moment with me?
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSpecialist(specialists.find(s => s.id === 'behavioral') || null);
              setActiveTab('consult');
              setIsChatOpen(true);
            }}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-purple-700 transition-colors"
          >
            Talk to Dr. Mira
          </button>
        </div>
      ),
      position: { top: '45%', right: '25%' },
      rotate: 8,
      zIndex: 25,
      className: 'bg-purple-50 w-64 p-6 shadow-[10px_10px_20px_rgba(0,0,0,0.15)] border-t-[12px] border-purple-300',
      pinColor: 'bg-purple-500'
    });
  }

  const protocolsData: Protocol[] = [
    {
      id: 'meta-shred',
      title: 'METABOLIC OVERHAUL',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80',
      description: 'A high-intensity metabolic reset focusing on insulin sensitivity and explosive Agni energy.',
      whyLabel: 'Optimizes Insulin, Ignites Metabolic Agni',
      doshaImpact: { vata: 20, pitta: 80, kapha: 40 },
      architectNote: 'By spiking Agni during the Kapha window (6-10 AM), we force the body to mobilize stored adipose tissue while stabilizing blood glucose levels.',
      getTimeline: (healthData: HealthData) => {
        const isHypertensive = healthData.vitality.bloodPressure && parseInt(healthData.vitality.bloodPressure.split('/')[0]) > 130;
        return [
          { 
            time: '05:00 AM', 
            specialistId: 'behavioral', 
            category: 'Rest',
            instruction: 'Brahma Muhurta Wake-up: 500ml warm water with ginger to ignite digestive fire.' 
          },
          { 
            time: '06:30 AM', 
            specialistId: 'veer', 
            category: 'Workout',
            linkedPageId: 'meta-shred-morning-agni',
            instruction: isHypertensive ? 'Steady-State Agni Flow: 40 mins of controlled yoga-cardio to manage pressure.' : 'Explosive Agni HIIT: 30 mins of high-intensity intervals to maximize insulin sensitivity.',
            sessionDetails: {
              phases: {
                mobilize: {
                  title: "Mobilize",
                  description: "Joint lubrication and breath prep",
                  duration: 5,
                  bioImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
                  instructions: ["Deep belly breathing", "Neck and shoulder rolls", "Cat-Cow stretch"]
                },
                perform: {
                  title: "Perform",
                  description: "Peak metabolic work",
                  duration: 20,
                  videoId: "fSaYfvSpAMI",
                  bioImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80",
                  instructions: ["Phase 2: Your metabolic engine is now at peak heat. Maintain the rhythm.", "Focus on core engagement", "Explosive movements"]
                },
                restore: {
                  title: "Restore",
                  description: "Dosha balancing cool-down",
                  duration: 5,
                  bioImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80",
                  instructions: ["Savasana", "Alternate nostril breathing", "Child's pose"]
                }
              }
            }
          },
          { 
            time: '08:30 AM', 
            specialistId: 'diet', 
            category: 'Diet',
            instruction: 'Post-Metabolic Fuel: High-protein, low-carb break-fast with cinnamon to regulate blood sugar.' 
          },
          { 
            time: '01:00 PM', 
            specialistId: 'diet', 
            category: 'Diet',
            instruction: 'Pitta Peak Lunch: Largest meal of the day. Bitter greens and lean protein to support liver metabolism.' 
          },
          { 
            time: '05:00 PM', 
            specialistId: 'exercise', 
            category: 'Workout',
            instruction: 'Metabolic Walk: 20-minute brisk walk to prevent evening Kapha accumulation.' 
          },
          { 
            time: '07:30 PM', 
            specialistId: 'diet', 
            category: 'Diet',
            instruction: 'Light Synthesis Dinner: Easily digestible protein and steamed non-starchy vegetables.' 
          },
          { 
            time: '10:00 PM', 
            specialistId: 'sleep', 
            category: 'Rest',
            instruction: 'Neural Recovery: Digital detox and 15 mins of deep relaxation to lower cortisol before rest.' 
          }
        ];
      }
    },
    {
      id: 'oblivion',
      title: 'OBLIVION',
      image: 'https://images.unsplash.com/photo-1511295742362-92c96b12a366?auto=format&fit=crop&q=80',
      description: 'Deep sleep and nervous system recovery protocol for total mental reset.',
      whyLabel: 'Extinguishes Cortisol, Restores Neural Equilibrium',
      doshaImpact: { vata: 90, pitta: 30, kapha: 20 },
      architectNote: 'Vata-pacifying rituals before 10 PM ensure the nervous system enters the parasympathetic state required for deep REM cycles.',
      getTimeline: (healthData: HealthData) => {
        const isHighStress = healthData.vitality.stress > 70;
        return [
          { time: '06:30 AM', specialistId: 'sleep', category: 'Rest', instruction: 'Gentle awakening with natural light. Avoid screens for the first hour.' },
          { time: '08:00 AM', specialistId: 'diet', category: 'Diet', instruction: 'Grounding Breakfast: Warm oatmeal with ghee, cinnamon, and stewed apples.' },
          { time: '12:00 PM', specialistId: 'behavioral', category: 'Rest', instruction: isHighStress ? 'Midday Reset: 15-minute Yoga Nidra session to drastically lower cortisol.' : 'Mindful Pause: 5 minutes of deep belly breathing before lunch.' },
          { time: '01:30 PM', specialistId: 'diet', category: 'Diet', instruction: 'Nourishing Lunch: Kitchari (mung dal and rice) with digestive spices for easy assimilation.' },
          { time: '06:00 PM', specialistId: 'exercise', category: 'Workout', instruction: 'Evening Wind-down: Restorative yoga focusing on forward folds and gentle twists.' },
          { time: '08:00 PM', specialistId: 'diet', category: 'Diet', instruction: 'Dinner: Very light meal, finished at least 2 hours before bed. Chamomile or Ashwagandha tea.' },
          { time: '09:30 PM', specialistId: 'sleep', category: 'Rest', instruction: 'Pre-sleep Ritual: Warm bath, essential oils (lavender/sandalwood), and reading a physical book.' }
        ];
      }
    },
    {
      id: 'vital-armor',
      title: 'LONGEVITY SHIELD',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80',
      description: 'A longevity and immunity shield focusing on Ojas (vitality), bone density, and lymphatic drainage.',
      whyLabel: 'Fortifies Ojas, Enhances Lymphatic Drainage',
      doshaImpact: { vata: 40, pitta: 30, kapha: 70 },
      architectNote: 'By stimulating lymphatic flow through specific morning movements, we enhance the body’s natural defense mechanisms and cellular longevity.',
      getTimeline: (healthData: HealthData) => {
        const isLowOxygen = healthData.vitality.oxygen < 95;
        return [
          { time: '05:30 AM', specialistId: 'diet', category: 'Diet', instruction: 'Ojas Elixir: Warm water with lemon, ginger, and raw honey (added when warm, not hot).' },
          { time: '07:00 AM', specialistId: 'exercise', category: 'Workout', instruction: 'Lymphatic Strength: Resistance training focused on bone density and rhythmic movement for lymph flow.' },
          { time: '08:30 AM', specialistId: 'diet', category: 'Diet', instruction: isLowOxygen ? 'Cellular Breakfast: Antioxidant-rich smoothie with spirulina and healthy fats to optimize oxygenation.' : 'Vitality Breakfast: Protein-rich meal with fermented foods to support gut-based immunity.' },
          { time: '01:00 PM', specialistId: 'diet', category: 'Diet', instruction: 'Immune Synthesis Lunch: Nutrient-dense stew with turmeric, black pepper, and seasonal vegetables.' },
          { time: '04:00 PM', specialistId: 'pharmacology', category: 'Rest', instruction: 'Adaptogen Protocol: Take prescribed Ashwagandha or Tulsi to modulate stress response.' },
          { time: '07:00 PM', specialistId: 'diet', category: 'Diet', instruction: 'Grounding Dinner: Warm, cooked meal with root vegetables to support Prithvi (earth) element.' },
          { time: '09:30 PM', specialistId: 'behavioral', category: 'Rest', instruction: 'Ojas Meditation: 10 minutes of visualization focusing on cellular vitality and resilience.' }
        ];
      }
    },
    {
      id: 'art-of-living',
      title: 'ART OF LIVING',
      image: 'https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/3325030e231b402009861b04d8ee0e442602cc77/images.webp',
      description: 'Wisdom and techniques for a stress-free, violence-free society.',
      whyLabel: 'Stress-Free Mind, Violence-Free World',
      doshaImpact: { vata: 100, pitta: 100, kapha: 100 },
      architectNote: 'The breath is the link between the body and the mind. Mastering the breath is mastering the self.'
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-0 sm:p-0">
      <AnimatePresence>
      </AnimatePresence>

      <div className="w-full max-w-[1200px] mx-auto">
        <AnimatePresence mode="wait">
          {view === 'welcome' && (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center text-center space-y-8 max-w-md w-full mx-auto p-6 sm:p-8"
            >
              <AyurSyncBranding className="mb-8" />

              {/* Medical Disclaimer */}
              <div className="w-full bg-sage-light/50 border border-sage-primary/10 rounded-xl p-5 text-left space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-sage-primary">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm uppercase tracking-wider">Medical Disclaimer</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The information provided by AyurSync is for educational and informational purposes only and is not intended as medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
                <div className="flex gap-4 pt-2">
                  <a href="#" className="text-[10px] font-bold text-sage-primary uppercase tracking-widest hover:underline">Privacy Policy</a>
                  <a href="#" className="text-[10px] font-bold text-sage-primary uppercase tracking-widest hover:underline">Terms of Service</a>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group w-full text-left">
                <div className="relative flex items-center pt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-sage-primary/30 rounded peer-checked:bg-sage-primary peer-checked:border-sage-primary transition-all duration-200 group-hover:border-sage-primary/50" />
                  <CheckCircle2 className="absolute w-5 h-5 text-white scale-0 peer-checked:scale-75 transition-transform duration-200" />
                </div>
                <span className="text-sm text-gray-600 select-none">
                  I agree to the terms and medical disclaimer
                </span>
              </label>

              {/* Join Button */}
              <button
                disabled={!agreed}
                onClick={() => setView('login')}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg",
                  agreed 
                    ? "bg-sage-primary text-white hover:bg-sage-accent shadow-sage-primary/20" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                )}
              >
                Join AyurSync
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8 max-w-md w-full mx-auto p-6 sm:p-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <AyurSyncBranding />
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-sage-primary">Welcome Back</h2>
                  <p className="text-gray-500">Sign in to continue your journey</p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-xs font-bold text-sage-primary hover:underline">Forgot Password?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sage-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-sage-primary text-white rounded-xl font-bold text-lg hover:bg-sage-accent transition-all shadow-lg shadow-sage-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold tracking-widest">Or continue with</span></div>
                </div>

                <button 
                  type="button"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      console.error("Google login error", error);
                    }
                  }}
                  className="w-full py-4 bg-white border border-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Google
                </button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setView('register')}
                    className="text-sage-primary font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
                <button 
                  onClick={() => setView('welcome')}
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-sage-primary transition-colors mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Welcome
                </button>
              </div>
            </motion.div>
          )}

          {view === 'register' && (
            <motion.div
              key="register"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-8 max-w-md w-full mx-auto p-6 sm:p-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <AyurSyncBranding />
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-sage-primary">Create Account</h2>
                  <p className="text-gray-500">Begin your personalized Ayurvedic journey</p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleRegister}>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswordRegister ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sage-primary"
                    >
                      {showPasswordRegister ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswordRegister ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sage-primary"
                    >
                      {showPasswordRegister ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-sage-primary text-white rounded-xl font-bold text-lg hover:bg-sage-accent transition-all shadow-lg shadow-sage-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create My Journey'}
                </button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button 
                    onClick={() => setView('login')}
                    className="text-sage-primary font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
                <button 
                  onClick={() => setView('welcome')}
                  className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-sage-primary transition-colors mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Welcome
                </button>
              </div>
            </motion.div>
          )}

          {view === 'blueprint' && (
            <motion.div
              key="blueprint"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-10 max-w-md w-full mx-auto p-6 sm:p-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <AyurSyncBranding />
                <div className="space-y-1">
                  <h2 className="text-3xl font-serif font-bold text-sage-primary">Your Ayurvedic Blueprint</h2>
                  <p className="text-gray-500">Let's map your unique path to wellness</p>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Status Selector */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Health Status</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveCard(activeCard === 'conditions' ? null : 'conditions')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-left space-y-3",
                      activeCard === 'conditions' 
                        ? "bg-sage-primary/5 border-sage-primary shadow-md" 
                        : "bg-white border-gray-100 hover:border-sage-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      activeCard === 'conditions' ? "bg-sage-primary text-white" : "bg-red-50 text-red-500"
                    )}>
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm leading-tight">Acute & Chronic Conditions</h3>
                  </button>

                  <button
                    onClick={() => setActiveCard(activeCard === 'goals' ? null : 'goals')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-left space-y-3",
                      activeCard === 'goals' 
                        ? "bg-sage-primary/5 border-sage-primary shadow-md" 
                        : "bg-white border-gray-100 hover:border-sage-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      activeCard === 'goals' ? "bg-sage-primary text-white" : "bg-blue-50 text-blue-500"
                    )}>
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm leading-tight">Self-Care & Aesthetic Goals</h3>
                  </button>
                </div>

                {/* Expanded Checklists */}
                <AnimatePresence>
                  {activeCard && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 grid grid-cols-2 gap-3">
                        {(activeCard === 'conditions' 
                          ? ['Diabetes', 'Hypertension', 'Thyroid', 'PCOS/PCOD', 'Digestive Issues', 'Joint Pain', 'Insomnia']
                          : [
                              'Skin Health', 
                              'Hair Growth', 
                              'Weight Management', 
                              'Stress Relief', 
                              'Better Sleep', 
                              'Energy Boost',
                              ...(gender === 'Female' ? ['Menstrual Cycle Support'] : [])
                            ]
                        ).map((item) => (
                          <label key={item} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={activeCard === 'conditions' ? selectedConditions.includes(item) : selectedGoals.includes(item)}
                                onChange={(e) => {
                                  const list = activeCard === 'conditions' ? selectedConditions : selectedGoals;
                                  const setList = activeCard === 'conditions' ? setSelectedConditions : setSelectedGoals;
                                  if (e.target.checked) {
                                    setList([...list, item]);
                                  } else {
                                    setList(list.filter(i => i !== item));
                                  }
                                }}
                                className="peer sr-only"
                              />
                              <div className="w-5 h-5 border-2 border-sage-primary/20 rounded peer-checked:bg-sage-primary peer-checked:border-sage-primary transition-all" />
                              <CheckCircle2 className="absolute w-5 h-5 text-white scale-0 peer-checked:scale-75 transition-transform" />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-sage-primary transition-colors">{item}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Narrative Inputs */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Primary Health Challenge & Goal</label>
                  <textarea
                    value={primaryChallenge}
                    onChange={(e) => setPrimaryChallenge(e.target.value)}
                    placeholder="Describe your primary health challenge and your goal for AyurSync..."
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all min-h-[120px] resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Medical History (Optional)</label>
                  <textarea
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="List any past surgeries, serious diagnoses, or current prescriptions..."
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all min-h-[100px] resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">How did you hear about us?</label>
                  <input
                    type="text"
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    placeholder="Social Media, Friend, Search..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-sage-primary/20 focus:border-sage-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <button 
                disabled={!fullName || !age || !gender}
                onClick={async () => {
                  const data = {
                    display_name: fullName,
                    age: parseInt(age) || 25,
                    gender: gender,
                    primaryGoal: selectedGoals[0] || 'Wellness',
                    account_status: 'active'
                  };
                  
                  try {
                    await updateProfileData(data);
                  } catch (e) {
                    console.error("Failed to save profile to database:", e);
                  }
                  
                  setHealthData(prev => ({
                    ...prev,
                    name: fullName,
                    age: parseInt(age) || 25,
                    gender: gender,
                    primaryGoal: selectedGoals[0] || 'Wellness'
                  }));
                  setBlueprintCompleted(true);
                  setView('dashboard');
                }}
                className="w-full py-5 bg-sage-primary text-white rounded-xl font-bold text-xl hover:bg-sage-accent transition-all shadow-xl shadow-sage-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="w-6 h-6" />
                Discover My Dosha
              </button>
            </motion.div>
          )}
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex h-[100dvh] w-full bg-white overflow-hidden relative"
            >
              {/* Mobile Bottom Nav */}
              {activePage !== 'meta-shred' && activePage !== 'meta-shred-active' && (
                <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-50 flex justify-around items-center">
                  {[
                    { id: 'home', icon: Home, label: 'Home' },
                    { id: 'specialists', icon: MessageSquare, label: 'Consult' },
                    { id: 'explorer', icon: Compass, label: 'Explorer' },
                    { id: 'profile', icon: Settings, label: 'Settings' },
                    { id: 'sos', icon: ShieldAlert, label: 'SOS' }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'sos') return;
                        handleTabChange(tab.id as Tab);
                      }}
                      onMouseDown={tab.id === 'sos' ? startSosTimer : undefined}
                      onMouseUp={tab.id === 'sos' ? stopSosTimer : undefined}
                      onMouseLeave={tab.id === 'sos' ? stopSosTimer : undefined}
                      onTouchStart={tab.id === 'sos' ? startSosTimer : undefined}
                      onTouchEnd={tab.id === 'sos' ? stopSosTimer : undefined}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300",
                        activeTab === tab.id ? "text-sage-primary opacity-100" : "text-gray-400 opacity-40 hover:opacity-80 hover:text-sage-primary",
                        tab.id === 'sos' && "text-red-500 hover:text-red-600"
                      )}
                    >
                      <tab.icon className={cn("w-6 h-6", activeTab === tab.id && "drop-shadow-[0_0_8px_rgba(113,142,118,0.4)]")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sidebar / Drawer */}
              {!(activePage === 'meta-shred' || activePage === 'meta-shred-active' || (exploreView === 'protocol-detail' && selectedProtocolId === 'meta-shred')) && (
                <>
                  {/* Mobile Backdrop */}
                  <AnimatePresence>
                    {!isSidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarCollapsed(true)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150] md:hidden"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div 
                    initial={false}
                    animate={{ 
                      width: isSidebarCollapsed ? 0 : (window.innerWidth < 768 ? 280 : 112),
                      opacity: isSidebarCollapsed ? 0 : 1,
                      x: isSidebarCollapsed ? (window.innerWidth < 768 ? -280 : -112) : 0
                    }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(
                      "fixed md:relative flex flex-col bg-white border-r border-gray-100 py-10 items-center space-y-12 z-[200] overflow-hidden shrink-0 h-full",
                      isSidebarCollapsed ? "pointer-events-none" : "pointer-events-auto"
                    )}
                  >
                    <nav className="flex flex-col space-y-12 mt-4">
                      {[
                        { id: 'dashboard', icon: Home, label: 'Home', tabId: 'home' },
                        { id: 'specialists', icon: MessageSquare, label: 'Consult', tabId: 'specialists' },
                        { id: 'explorer', icon: Compass, label: 'Explorer', tabId: 'explorer' },
                        { id: 'profile', icon: Settings, label: 'Settings', tabId: 'profile' },
                        { id: 'sos', icon: ShieldAlert, label: 'SOS' }
                      ].map((tab) => (
                        <button 
                          key={tab.id}
                          onClick={() => {
                            if (tab.id === 'sos') return;
                            if (tab.tabId) {
                              setActivePage('dashboard');
                              handleTabChange(tab.tabId as Tab);
                            } else {
                              setActivePage(tab.id);
                            }
                            if (window.innerWidth < 768) setIsSidebarCollapsed(true);
                          }}
                          onMouseDown={tab.id === 'sos' ? startSosTimer : undefined}
                          onMouseUp={tab.id === 'sos' ? stopSosTimer : undefined}
                          onMouseLeave={tab.id === 'sos' ? stopSosTimer : undefined}
                          onTouchStart={tab.id === 'sos' ? startSosTimer : undefined}
                          onTouchEnd={tab.id === 'sos' ? stopSosTimer : undefined}
                          className={cn(
                            "group relative p-4 rounded-2xl transition-all duration-300 flex items-center gap-4",
                            (activePage === tab.id || (activePage === 'dashboard' && activeTab === tab.tabId)) ? "text-sage-primary opacity-100" : "text-gray-400 opacity-40 hover:opacity-80 hover:text-sage-primary",
                            tab.id === 'sos' && "text-red-500 hover:text-red-600"
                          )}
                        >
                          <tab.icon className={cn("w-6 h-6 shrink-0", (activePage === tab.id || (activePage === 'dashboard' && activeTab === tab.tabId)) && "drop-shadow-[0_0_8px_rgba(113,142,118,0.4)]")} />
                          <span className="md:hidden font-bold text-lg">{tab.label}</span>
                        </button>
                      ))}
                    </nav>

                    <div className="mt-auto flex flex-col space-y-6 items-center">
                      <button 
                        onClick={() => {
                          setIsLoggedInUI(false);
                          setBlueprintCompleted(false);
                          setJustRegistered(false);
                          signOut();
                        }}
                        className="p-4 text-gray-400 hover:text-red-500 transition-colors flex items-center gap-4"
                      >
                        <LogOut className="w-6 h-6 shrink-0" />
                        <span className="md:hidden font-bold text-lg">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F0F4F8]">
                {!(activePage === 'meta-shred' || activePage === 'meta-shred-active' || (exploreView === 'protocol-detail' && selectedProtocolId === 'meta-shred')) && (
                  <div className="sticky top-0 z-[100] flex items-center justify-between px-6 md:px-8 pt-4 md:pt-8 pb-2 shrink-0 w-full max-w-[1200px] mx-auto bg-[#F0F4F8]/80 backdrop-blur-md">
                    <button 
                      onClick={() => {
                        if (activeTab === 'profile') {
                          setProfileView('main');
                          setActiveTab('home');
                          setIsScrolled(false);
                        } else {
                          setIsSidebarCollapsed(!isSidebarCollapsed);
                        }
                      }}
                      className="flex w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl items-center justify-center text-gray-400 hover:text-sage-primary hover:bg-sage-light/30 transition-all shadow-sm border border-gray-100"
                    >
                      {activeTab === 'profile' ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {activeTab === 'profile' && (
                      <div className="flex-1 ml-4">
                        <h1 className="text-xl font-serif font-bold text-sage-primary">Update Profile</h1>
                        <p className="text-[10px] font-bold text-sage-primary/40 uppercase tracking-widest">Personal Health Essence</p>
                      </div>
                    )}

                    <div className="flex items-center gap-[15px] ml-auto">
                      <AnimatePresence>
                        {(isScrolled || activePage !== 'dashboard' || activeTab === 'profile' || exploreView === 'voice-wellness') && (
                          <motion.div
                            layoutId="user-profile-star"
                            initial={activePage === 'dashboard' && activeTab !== 'profile' && exploreView !== 'voice-wellness' ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{
                              duration: 0.8,
                              ease: [0.4, 0, 0.2, 1]
                            }}
                            className="w-[40px] h-[40px] rounded-full border-2 border-white shadow-lg overflow-hidden bg-white shrink-0 cursor-pointer z-[9999] relative flex items-center justify-center font-bold font-serif"
                            onClick={() => {
                              if (activeTab === 'profile') {
                                setProfileView('main');
                                setActiveTab('home');
                                setIsScrolled(false);
                              } else {
                                handleProfileClick();
                              }
                            }}
                          >
                            {healthData.profileImage ? (
                              <img 
                                src={healthData.profileImage} 
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
                                "w-full h-full flex items-center justify-center bg-sage-primary text-white text-xs",
                                healthData.profileImage && "hidden"
                              )}
                            >
                              {(healthData.name || user?.displayName || 'S').charAt(0).toUpperCase()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button 
                        onClick={() => setIsNotificationCenterOpen(true)}
                        className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-400 hover:text-sage-primary hover:bg-sage-light/30 transition-all shadow-sm border border-gray-100 relative"
                      >
                        <Bell className="w-6 h-6" />
                        {notifications.some(n => !n.read) && (
                          <span className="absolute top-3 right-3 w-3 h-3 bg-[#FF0000] rounded-full border-2 border-white shadow-sm animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-View Content */}
                <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 md:p-8 md:pt-4 pb-32 flex flex-col">
                  {activePage === 'dashboard' && (
                    <div className="w-full max-w-[1200px] mx-auto h-full flex flex-col">
                      <AnimatePresence mode="wait">
                        {activeTab === 'home' && (
                          <motion.div
                            key="view-home"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12 pt-0"
                          >
                            {/* Dashboard Header */}
                            <motion.div 
                              animate={{ 
                                opacity: (isScrolled || exploreView === 'voice-wellness') ? 0 : 1,
                                y: (isScrolled || exploreView === 'voice-wellness') ? -20 : 0,
                                pointerEvents: (isScrolled || exploreView === 'voice-wellness') ? 'none' : 'auto'
                              }}
                              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                              className="flex items-center justify-between w-full"
                            >
                              <div className="flex items-center gap-6">
                                {!(isScrolled || exploreView === 'voice-wellness') && activePage === 'dashboard' && (
                                  <motion.div
                                    layoutId="user-profile-star"
                                    transition={{
                                      duration: 0.8,
                                      ease: [0.4, 0, 0.2, 1]
                                    }}
                                    className="w-16 h-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white shrink-0 cursor-pointer z-[9999] relative flex items-center justify-center font-bold font-serif"
                                    onClick={handleProfileClick}
                                  >
                                    {healthData.profileImage ? (
                                      <img 
                                        src={healthData.profileImage} 
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
                                        "w-full h-full flex items-center justify-center bg-sage-primary text-white text-xl",
                                        healthData.profileImage && "hidden"
                                      )}
                                    >
                                      {(healthData.name || user?.displayName || 'S').charAt(0).toUpperCase()}
                                    </div>
                                  </motion.div>
                                )}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-serif font-bold text-sage-primary tracking-tight">Namaste, {healthData.name || 'Seeker'}</h1>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    <span>{healthData.gender || 'Male'}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span>{healthData.age || '25'} Years</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {(() => {
                                  const today = new Date().toISOString().split('T')[0];
                                  const hasFeverToday = healthData.healthEvents?.some(e => e.date === today && e.type === 'Fever');
                                  if (hasFeverToday) {
                                    return (
                                      <motion.div 
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100 shadow-sm"
                                      >
                                        <Thermometer className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Fever Alert</span>
                                      </motion.div>
                                    );
                                  }
                                  return null;
                                })()}
                                <button 
                                  onClick={() => setIsQuestionnaireOpen(true)}
                                  className="flex items-center gap-2 bg-sage-primary text-white px-5 py-3 rounded-2xl shadow-sm hover:bg-sage-dark transition-all"
                                >
                                  <span className="font-bold text-sm hidden sm:inline">Update Health Root</span>
                                  <span className="font-bold text-sm sm:hidden">Update</span>
                                </button>
                                <button 
                                  onClick={() => setActiveTab('health-calendar')}
                                  className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-sage-primary transition-all shadow-sm"
                                >
                                  <Calendar className="w-6 h-6" />
                                </button>
                              </div>
                            </motion.div>

                        {/* Real-Time Health Alerts */}
                        <div className="space-y-4">
                          {parseInt(String(healthData.vitality.bloodPressure).split('/')[0]) > 130 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => setActiveIntervention('bp')}
                              className="bg-rose-50 border border-rose-100 rounded-[32px] p-8 flex items-center gap-6 shadow-sm cursor-pointer hover:bg-rose-100 transition-colors group"
                            >
                              <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                                <ShieldAlert className="w-8 h-8" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Urgent Advisory</span>
                                  <span className="w-1 h-1 bg-rose-300 rounded-full" />
                                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Dr. Kavya</span>
                                </div>
                                <h4 className="text-xl font-bold text-rose-900">Elevated Blood Pressure Detected</h4>
                                <p className="text-sm text-rose-700 leading-relaxed">Your wearable indicates a systolic reading of {String(healthData.vitality.bloodPressure).split('/')[0]}. Tap to start the Respiratory Reset loop.</p>
                              </div>
                              <ArrowUpRight className="w-6 h-6 text-rose-300 group-hover:text-rose-500 transition-colors" />
                            </motion.div>
                          )}

                          {healthData.vitality.hydration < 1200 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => setActiveIntervention('hydration')}
                              className="bg-cyan-50 border border-cyan-100 rounded-[32px] p-8 flex items-center gap-6 shadow-sm cursor-pointer hover:bg-cyan-100 transition-colors group"
                            >
                              <div className="w-16 h-16 bg-cyan-500 text-white rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                                <Droplets className="w-8 h-8" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Urgent Advisory</span>
                                  <span className="w-1 h-1 bg-cyan-300 rounded-full" />
                                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Dr. Kavya</span>
                                </div>
                                <h4 className="text-xl font-bold text-cyan-900">Hydration Level Critical</h4>
                                <p className="text-sm text-cyan-700 leading-relaxed">Your hydration is below 40%. Tap to start the Hydration Recovery loop.</p>
                              </div>
                              <ArrowUpRight className="w-6 h-6 text-cyan-300 group-hover:text-cyan-500 transition-colors" />
                            </motion.div>
                          )}

                          {healthData.vitality.bloodSugar > 140 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => setActiveIntervention('sugar')}
                              className="bg-orange-50 border border-orange-100 rounded-[32px] p-8 flex items-center gap-6 shadow-sm cursor-pointer hover:bg-orange-100 transition-colors group"
                            >
                              <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                <Thermometer className="w-8 h-8" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Urgent Advisory</span>
                                  <span className="w-1 h-1 bg-orange-300 rounded-full" />
                                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Specialist Rohini</span>
                                </div>
                                <h4 className="text-xl font-bold text-orange-900">High Blood Sugar Alert</h4>
                                <p className="text-sm text-orange-700 leading-relaxed">Glucose levels are elevated. Tap to start the Glucose Stabilizer loop.</p>
                              </div>
                              <ArrowUpRight className="w-6 h-6 text-orange-300 group-hover:text-orange-500 transition-colors" />
                            </motion.div>
                          )}
                        </div>

                        {/* Vitality Scoreboard */}
                        <motion.div 
                          animate={{ 
                            opacity: isScrolled ? 0 : 1,
                            y: isScrolled ? -20 : 0,
                            pointerEvents: isScrolled ? 'none' : 'auto'
                          }}
                          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                          <div 
                            onClick={() => setView('vitality-breakdown')}
                            className="md:col-span-1 bg-white border border-gray-100 rounded-[40px] p-10 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-sage-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-48 h-48 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="96"
                                  cy="96"
                                  r="88"
                                  stroke="currentColor"
                                  strokeWidth="12"
                                  fill="transparent"
                                  className="text-gray-50"
                                />
                                <circle
                                  cx="96"
                                  cy="96"
                                  r="88"
                                  stroke="currentColor"
                                  strokeWidth="12"
                                  fill="transparent"
                                  strokeDasharray={552.9}
                                  strokeDashoffset={552.9 - (552.9 * vitalityScore) / 100}
                                  className="text-sage-primary transition-all duration-1000 ease-out"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <motion.div 
                                animate={isVitalityPulse ? { scale: [1, 1.1, 1], transition: { duration: 0.5 } } : {}}
                                onAnimationComplete={() => setIsVitalityPulse(false)}
                                className="absolute inset-0 flex flex-col items-center justify-center"
                              >
                                <span className="text-5xl font-serif font-bold text-sage-primary">{vitalityScore}%</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vitality Score</span>
                              </motion.div>
                            </div>
                          </div>

                          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {[
                              { label: 'Steps', value: healthData.vitality.steps, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', max: 10000, unit: '' },
                              { label: 'Hydration', value: healthData.vitality.hydration, icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50', max: 3000, unit: 'ml' },
                              { label: 'Oxygen', value: healthData.vitality.oxygen, icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50', max: 100, unit: '%' },
                              { label: 'Heart Rate', value: healthData.vitality.heartRate, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', max: 150, unit: 'bpm' },
                              { label: 'Blood Sugar', value: healthData.vitality.bloodSugar, icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50', max: 200, unit: 'mg/dL' },
                              { label: 'Blood Pressure', value: healthData.vitality.bloodPressure, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50', max: 1, unit: '' },
                            ].map((metric) => (
                              <button 
                                key={metric.label} 
                                onClick={() => {
                                  setActiveMetric(metric.label);
                                  setActiveTab('metric-detail');
                                }}
                                className="bg-white border border-gray-100 rounded-[32px] p-6 flex flex-col items-center justify-center space-y-4 shadow-sm hover:shadow-md hover:scale-105 transition-all text-center"
                              >
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", metric.bg, metric.color)}>
                                  <metric.icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="text-xl font-bold text-gray-800">{metric.value}{metric.unit}</div>
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full transition-all duration-1000", metric.color.replace('text', 'bg'))}
                                    style={{ width: metric.label === 'Blood Pressure' ? '100%' : `${Math.min((Number(metric.value) / metric.max) * 100, 100)}%` }}
                                  />
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>

                        {/* Quick-Log Habit Prediction Engine */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="text-2xl font-serif font-bold text-gray-900">Quick-Log</h3>
                              <p className="text-gray-500 text-sm">Suggested items based on your habits</p>
                            </div>
                            <Clock className="w-5 h-5 text-sage-primary opacity-50" />
                          </div>

                          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                            {getQuickLogItems().length > 0 ? (
                              getQuickLogItems().map((item) => (
                                <motion.button
                                  key={item.id}
                                  whileHover={{ y: -4, scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleQuickLogClick(item)}
                                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-3xl p-4 pr-6 shadow-sm min-w-[200px] hover:border-sage-primary/30 transition-all text-left group"
                                >
                                  <div className="w-12 h-12 bg-sage-light/30 rounded-2xl flex items-center justify-center text-sage-primary group-hover:bg-sage-primary group-hover:text-white transition-colors">
                                    {item.type === 'FOOD' ? <Utensils className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                  </div>
                                  <div className="space-y-0.5">
                                    <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Often at this time</span>
                                  </div>
                                </motion.button>
                              ))
                            ) : (
                              <div className="w-full bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-8 text-center">
                                <p className="text-sm text-gray-400 font-medium italic">Start scanning to build your Habit Engine.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Your Daily Dharma */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="text-2xl font-serif font-bold text-gray-900">Your Daily Dharma</h3>
                              <p className="text-gray-500 text-sm">Personalized tasks to boost your vitality</p>
                            </div>
                            <div className="text-[10px] font-bold text-sage-primary uppercase tracking-widest bg-sage-light/30 px-3 py-1 rounded-full">
                              {dailyDharmaTasks.filter(t => t.completed).length}/3 Completed
                            </div>
                          </div>

                          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                            {dailyDharmaTasks.map((task) => (
                              <motion.div
                                key={task.id}
                                whileHover={{ y: -5 }}
                                className={cn(
                                  "min-w-[280px] md:min-w-[320px] bg-white border rounded-[32px] p-6 flex flex-col justify-between space-y-4 shadow-sm transition-all relative overflow-hidden",
                                  task.completed ? "border-sage-primary/20 bg-sage-light/5" : "border-gray-100"
                                )}
                              >
                                {task.completed && (
                                  <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute top-0 right-0 p-4"
                                  >
                                    <div className="w-8 h-8 bg-sage-primary text-white rounded-full flex items-center justify-center">
                                      <Check className="w-5 h-5" />
                                    </div>
                                  </motion.div>
                                )}
                                
                                <div className="space-y-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    task.type === 'activity' ? "bg-blue-50 text-blue-500" :
                                    task.type === 'hydration' ? "bg-cyan-50 text-cyan-500" :
                                    "bg-orange-50 text-orange-500"
                                  )}>
                                    {task.type === 'activity' ? <Activity className="w-5 h-5" /> :
                                     task.type === 'hydration' ? <Droplets className="w-5 h-5" /> :
                                     <Thermometer className="w-5 h-5" />}
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900">{task.title}</h4>
                                    <div className="markdown-body text-xs text-gray-500 leading-relaxed">
                                      <Markdown
                                        components={{
                                          p: ({node, children, ...props}) => {
                                            const content = React.Children.toArray(children).join('');
                                            const videoMatch = content.match(/\[VIDEO:([a-zA-Z0-9_-]{11})\]/);
                                            if (videoMatch) {
                                              const videoId = videoMatch[1];
                                              return (
                                                <div className="my-4 aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-black max-w-md">
                                                  <iframe 
                                                    className="w-full h-full"
                                                    src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1`}
                                                    title="Task Video"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                  ></iframe>
                                                </div>
                                              );
                                            }
                                            return <p {...props}>{children}</p>;
                                          }
                                        }}
                                      >
                                        {task.description}
                                      </Markdown>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    if (task.completed) return;
                                    
                                    // Trigger coin animation
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const newCoin = { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top };
                                    setCoinAnimations(prev => [...prev, newCoin]);
                                    
                                    // Update task
                                    setDailyDharmaTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
                                    
                                    // Update coins
                                    setAyurCoins(prev => prev + 50);
                                    
                                    // Update vitality score pulse
                                    setIsVitalityPulse(true);
                                    setVitalityScore(prev => Math.min(prev + 2, 100));
                                    
                                    // Check if all completed for streak
                                    const allCompleted = dailyDharmaTasks.every(t => t.id === task.id ? true : t.completed);
                                    if (allCompleted) {
                                      setStreak(prev => prev + 1);
                                      showToast("Streak Increased! 🔥");
                                    }
                                  }}
                                  className={cn(
                                    "w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                    task.completed 
                                      ? "bg-sage-light/50 text-sage-primary cursor-default" 
                                      : "bg-sage-primary text-white hover:bg-sage-accent shadow-lg shadow-sage-primary/20"
                                  )}
                                >
                                  {task.completed ? (
                                    <>
                                      <Check className="w-4 h-4" />
                                      Completed
                                    </>
                                  ) : "Complete Task"}
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Coin Animation Overlay */}
                        <AnimatePresence>
                          {coinAnimations.map(coin => (
                            <motion.div
                              key={coin.id}
                              initial={{ x: coin.x, y: coin.y, opacity: 1, scale: 1 }}
                              animate={{ 
                                x: window.innerWidth - 100, 
                                y: 40, 
                                opacity: 0, 
                                scale: 0.5 
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.8, ease: "easeIn" }}
                              onAnimationComplete={() => {
                                setCoinAnimations(prev => prev.filter(c => c.id !== coin.id));
                              }}
                              className="fixed z-[100] pointer-events-none"
                            >
                              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-200">
                                <Coins className="w-5 h-5 text-amber-800" />
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Real-Time Health & Sleep Quality */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Sleep Quality Card */}
                          <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-serif font-bold text-gray-900">Sleep Quality</h3>
                                <p className="text-gray-500 text-sm">Last night's restorative cycle</p>
                              </div>
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                <Moon className="w-6 h-6" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gray-50 rounded-3xl p-6 text-center">
                                <div className="text-2xl font-bold text-gray-800">{healthData.vitality.sleep?.total}h</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</div>
                              </div>
                              <div className="bg-indigo-50/50 rounded-3xl p-6 text-center">
                                <div className="text-2xl font-bold text-indigo-600">{healthData.vitality.sleep?.deep}h</div>
                                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Deep</div>
                              </div>
                              <div className="bg-purple-50/50 rounded-3xl p-6 text-center">
                                <div className="text-2xl font-bold text-purple-600">{healthData.vitality.sleep?.rem}h</div>
                                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">REM</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Sleep Efficiency</span>
                                <span className="font-bold text-sage-primary">92%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-sage-primary w-[92%] rounded-full" />
                              </div>
                            </div>

                            <button 
                              onClick={() => setActiveTab('sleep-analytics')}
                              className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-3xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                            >
                              View Sleep Horizon <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Real-Time Health Section */}
                          <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-8 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-serif font-bold text-gray-900">Real-Time Health</h3>
                                <p className="text-gray-500 text-sm">Live hardware data stream</p>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Live</span>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                                    <Activity className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-800">Blood Pressure</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Systolic / Diastolic</div>
                                  </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-800">{healthData.vitality.bloodPressure}</div>
                              </div>

                              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                                    <Thermometer className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-800">Blood Sugar</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live CGM Stream</div>
                                  </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-800">{healthData.vitality.bloodSugar} mg/dL</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Daily Ayurvedic Tips Carousel */}
                        {activeTips.length > 0 && (
                          <div className="space-y-6">
                            <h3 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
                              <Leaf className="w-6 h-6 text-sage-primary" />
                              Daily Ayurvedic Wisdom
                            </h3>
                            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 gap-6 snap-x snap-mandatory hide-scrollbar">
                              <AnimatePresence>
                                {activeTips.map((tip) => (
                                  <motion.div
                                    key={tip.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, width: 0, marginRight: 0, padding: 0 }}
                                    className="min-w-[300px] md:min-w-[340px] max-w-[340px] bg-sage-light/30 border border-sage-primary/10 rounded-[32px] p-8 snap-start shrink-0 relative group shadow-sm hover:shadow-md transition-all"
                                  >
                                    <button 
                                      onClick={() => dismissTip(tip.id)}
                                      className="absolute top-6 right-6 p-2 bg-white/80 hover:bg-white text-gray-400 hover:text-gray-600 rounded-full transition-colors opacity-0 group-hover:opacity-100 md:opacity-100 shadow-sm"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-sage-primary shadow-sm mb-6">
                                      <tip.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-3">{tip.title}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-6">{tip.content}</p>
                                    <button 
                                      onClick={() => setActiveTab('explorer')}
                                      className="text-sm font-bold text-sage-primary hover:text-sage-accent transition-colors flex items-center gap-2"
                                    >
                                      Learn more <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                        </motion.div>
                      )}

                    {activeTab === 'protocol-maker' && (
                      <motion.div
                        key="view-protocol-maker"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="h-full"
                      >
                        <ProtocolMaker 
                          onBack={() => setActiveTab('home')}
                          onComplete={(protocol) => {
                            const newProtocol: Protocol = {
                              id: `custom-${Date.now()}`,
                              title: protocol.title,
                              image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80',
                              description: protocol.description,
                              whyLabel: protocol.whyLabel,
                              doshaImpact: protocol.doshaImpact,
                              architectNote: protocol.architectNote,
                              days: protocol.days,
                              getTimeline: () => {
                                // Map day 1 to the timeline for now
                                return protocol.days[0].activities.map((a: any) => ({
                                  time: a.time,
                                  specialistId: a.category === 'Workout' ? 'veer' : a.category === 'Diet' ? 'diet' : 'behavioral',
                                  category: a.category || 'Rest',
                                  instruction: `${a.activity}: ${a.note || ''}`,
                                  sessionDetails: a.sessionDetails,
                                  linkedPageId: a.linkedPageId
                                }));
                              }
                            };
                            setCustomProtocols(prev => [newProtocol, ...prev]);
                            setActiveTab('explorer');
                            setExploreView('protocols');
                            showToast("Bio-Blueprint Activated! 🔥");
                          }}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'specialist-chat' && selectedSpecialist && (
                      <motion.div 
                        key="view-specialist-chat"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-white flex flex-col overflow-hidden"
                      >
                        <SpecialistChat 
                          specialist={selectedSpecialist} 
                          healthData={healthData} 
                          onBack={() => {
                            setIsChatOpen(false);
                            setActiveTab('specialists');
                          }} 
                        />
                      </motion.div>
                    )}



                    {activeTab === 'journeys' && (
                      <motion.div
                        key="view-journeys"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-16 pt-12 min-h-full relative"
                      >
                        {/* Subtle textured background */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4A5D4E 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                        
                        <AnimatePresence mode="wait">
                          {selectedJourneyId ? (
                            <JourneyDetailView 
                              key="journey-detail"
                              journey={journeys.find(j => j.id === selectedJourneyId)!} 
                              onBack={() => setSelectedJourneyId(null)} 
                            />
                          ) : isCreatingCustomJourney ? (
                            <CustomJourneyOnboarding 
                              key="journey-onboarding"
                              onBack={() => setIsCreatingCustomJourney(false)}
                              onComplete={(answers) => {
                                const newJourney: Journey = {
                                  id: `custom-${Date.now()}`,
                                  title: `${answers.focus} Transformation`,
                                  description: `A personalized ${answers.commitment}-day journey focused on ${answers.focus.toLowerCase()} and energy optimization.`,
                                  duration: parseInt(answers.commitment),
                                  currentDay: 1,
                                  icon: Sparkles,
                                  color: 'text-sage-primary',
                                  gradient: 'from-sage-50 to-white',
                                  tags: [answers.focus.toUpperCase(), 'CUSTOM', 'AI-GEN'],
                                  dietaryBlueprint: [
                                    { time: '8:30 AM', meal: 'Custom Morning Elixir', recommendation: 'Based on your energy profile' },
                                    { time: '1:00 PM', meal: 'Balanced Sattvic Lunch', recommendation: 'Optimized for digestion' }
                                  ],
                                  movementPlan: [
                                    { type: 'Personalized Flow', duration: '25 Mins', time: 'Morning' }
                                  ],
                                  avoidList: ['Processed foods', 'Late night snacking']
                                };
                                setJourneys(prev => [...prev, newJourney]);
                                setIsCreatingCustomJourney(false);
                                setSelectedJourneyId(newJourney.id);
                              }}
                            />
                          ) : (
                            <motion.div
                              key="journey-list"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-16 relative z-10"
                            >
                              <div className="text-center space-y-6">
                                <h2 className="text-5xl font-serif font-bold text-sage-primary tracking-tight">Health Journeys</h2>
                                <p className="text-gray-500 text-xl max-w-2xl mx-auto">Pick a goal, and your AI team will guide you step-by-step for 10-15 days to achieve it.</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto px-4">
                                {journeys.map((journey) => (
                                  <motion.button
                                    key={journey.id}
                                    whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                    onClick={() => !journey.isLocked && setSelectedJourneyId(journey.id)}
                                    className={cn(
                                      "group p-10 bg-gradient-to-br border rounded-[56px] text-left transition-all shadow-sm hover:shadow-xl relative overflow-hidden",
                                      journey.gradient,
                                      journey.isLocked ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                                    )}
                                  >
                                    {journey.isLocked && (
                                      <div className="absolute top-6 right-6 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                                        <Lock className="w-5 h-5" />
                                      </div>
                                    )}
                                    
                                    <div className="flex justify-between items-start mb-8">
                                      <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform", journey.color.replace('text-', 'bg-').replace('600', '100'), journey.color)}>
                                        <journey.icon className="w-10 h-10" />
                                      </div>
                                      <div className={cn("px-4 py-2 text-xs font-bold rounded-full uppercase tracking-widest", journey.color.replace('text-', 'bg-').replace('600', '200/50'), journey.color.replace('text-', 'text-').replace('600', '700'))}>
                                        {journey.duration} Days
                                      </div>
                                    </div>
                                    
                                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{journey.title}</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed mb-8">{journey.description}</p>
                                    
                                    {!journey.isLocked && (
                                      <div className="space-y-3 mb-8">
                                        <div className={cn("flex justify-between text-sm font-medium", journey.color.replace('text-', 'text-').replace('600', '700'))}>
                                          <span>Day {journey.currentDay} of {journey.duration}</span>
                                          <span>{Math.round((journey.currentDay / journey.duration) * 100)}% Complete</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                          {[...Array(journey.duration)].map((_, i) => (
                                            <div key={`dot-${journey.id}-${i}`} className={cn("h-2 flex-1 rounded-full", i < journey.currentDay ? journey.color.replace('text-', 'bg-').replace('600', '500') : journey.color.replace('text-', 'bg-').replace('600', '200/50'))} />
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                      {journey.tags.map(tag => (
                                        <span key={tag} className={cn("px-3 py-1 bg-white/50 border text-[10px] font-bold rounded-lg tracking-tighter", journey.color.replace('text-', 'border-').replace('600', '100'), journey.color)}>
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </motion.button>
                                ))}

                                <motion.button
                                  whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                  onClick={() => setIsCreatingCustomJourney(true)}
                                  className="group p-10 bg-white border-2 border-dashed border-stone-200 rounded-[56px] text-center transition-all hover:border-sage-primary hover:bg-sage-primary/5 flex flex-col items-center justify-center space-y-6"
                                >
                                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 group-hover:bg-sage-primary group-hover:text-white transition-all">
                                    <Plus className="w-10 h-10" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-stone-800">Design Your Custom Journey</h3>
                                    <p className="text-stone-500 mt-2">Let Dr. Kavya craft a unique roadmap based on your specific needs.</p>
                                  </div>
                                </motion.button>
                            </div>
                          </motion.div>
                        )}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {activeTab === 'specialists' && (
                      <motion.div
                        key="view-specialists"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12 pt-0 pb-20"
                      >
                        <div className="flex flex-col md:flex-row items-center justify-between px-8 gap-4">
                          <div className="space-y-1 text-center md:text-left">
                            <h2 className="text-4xl font-serif font-bold text-sage-primary">Consultant Hub</h2>
                            <p className="text-gray-500 text-sm">Access the Council of 8 Specialists for personalized Ayurvedic guidance.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
                          {specialists.map((specialist) => (
                            <motion.div
                              key={specialist.id}
                              whileHover={{ y: -8 }}
                              className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group flex flex-col h-full transition-all hover:shadow-xl"
                            >
                              <div className="h-64 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                                <img 
                                  src={specialist.avatar} 
                                  className="w-full h-full object-cover object-top transition-all duration-700 scale-105 group-hover:scale-110" 
                                  alt={specialist.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://picsum.photos/seed/${specialist.name}/400/600`;
                                  }}
                                />
                                <div className="absolute bottom-6 left-6 z-20">
                                  <div 
                                    className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/50 shadow-sm"
                                    style={{ color: specialist.color }}
                                  >
                                    {specialist.designation}
                                  </div>
                                </div>
                              </div>
                              <div className="p-8 flex flex-col flex-1 space-y-6">
                                <div className="space-y-2">
                                  <h3 className="text-2xl font-bold text-gray-900">{specialist.name}</h3>
                                  <p className="text-gray-500 leading-relaxed line-clamp-3 text-sm">{specialist.intro}</p>
                                </div>
                                
                                <div className="pt-4 mt-auto">
                                  <motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      console.log("Consulting specialist:", specialist.name);
                                      setSelectedSpecialist(specialist);
                                      setActiveTab('specialist-chat');
                                      setIsChatOpen(true);
                                    }}
                                    className="w-full py-5 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 group/btn shadow-lg shadow-black/5"
                                    style={{ 
                                      '--hover-bg': specialist.color 
                                    } as any}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = specialist.color}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'black'}
                                  >
                                    Consult Now
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'notice-board' && (
                      <motion.div
                        key="view-notice-board"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full"
                      >
                        <NoticeBoard zoomedNotice={zoomedNotice} setZoomedNotice={setZoomedNotice} />
                      </motion.div>
                    )}

                    {activeTab === 'explorer' && (
                      <motion.div
                        key="view-explore"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-12 pt-0"
                      >
                        {exploreView === 'launcher' && (
                          <div className="space-y-12">
                            <div className="flex justify-between items-center px-8">
                              <h2 className="text-4xl font-serif font-bold text-sage-primary">Explorer</h2>
                            </div>

                            {/* AyurSync AI Search Bar */}
                            <div className="px-8">
                              <div className="relative group">
                                <div className="absolute inset-0 bg-sage-primary/5 rounded-[32px] blur-xl group-hover:bg-sage-primary/10 transition-all" />
                                <div className="relative bg-white border border-gray-100 rounded-[32px] p-2 flex items-center shadow-sm hover:shadow-md transition-all">
                                  <div className="w-12 h-12 flex items-center justify-center text-sage-primary">
                                    <Search className="w-6 h-6" />
                                  </div>
                                  <input 
                                    type="text" 
                                    placeholder="Ask anything about your health or lifestyle..."
                                    className="flex-1 bg-transparent border-none outline-none px-2 text-lg font-medium text-gray-700 placeholder:text-gray-400"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUniversalSearch((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => setExploreView('universal-search')}
                                    className="px-6 py-3 bg-sage-primary text-white rounded-2xl font-bold text-sm hover:bg-sage-secondary transition-all"
                                  >
                                    Search AI
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pb-16">
                              {/* Notice Board Card - Prominent */}
                              <motion.button
                                whileHover={{ y: -4 }}
                                onClick={() => setActiveTab('notice-board')}
                                className="md:col-span-2 group relative overflow-hidden bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all text-left"
                              >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-100/50 transition-colors" />
                                <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shrink-0">
                                    <ClipboardList className="w-10 h-10" />
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                      <h3 className="text-2xl font-bold text-gray-900">Notice Board</h3>
                                      <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full">Live Updates</span>
                                    </div>
                                    <p className="text-gray-500 text-lg">Ayurvedic tips, global health updates, and community insights from our experts.</p>
                                    <div className="flex gap-4 pt-2">
                                      <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                        New Tip: Skip White Rice today
                                      </div>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-8 h-8 text-gray-300 group-hover:text-blue-600 transition-colors hidden md:block" />
                                </div>
                              </motion.button>

                              {[
                                { id: 'protocols', title: 'AyurSync Protocols', description: 'Precision-timed Ayurvedic journeys to transform your Sleep, Weight, and Vitality.', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', locked: false },
                                { id: 'ayurvault', title: 'AyurVault Library', description: 'Faceless video library for workouts, yoga, and meditation.', icon: PlaySquare, color: 'text-indigo-500', bg: 'bg-indigo-50', locked: false },
                                { id: 'food-scanner', title: 'Food & Barcode Scanner', description: 'Instantly audit meals and packaged foods for Ayurvedic compatibility.', icon: Scan, color: 'text-amber-500', bg: 'bg-amber-50', locked: false },
                                { id: 'voice-wellness', title: 'Ayurveda Sangam', description: 'Multi-agent AI council of historical Ayurvedic sages.', icon: Library, color: 'text-emerald-500', bg: 'bg-emerald-50', locked: false },
                                { id: 'medical-scanner', title: 'Scan Health Report', description: 'AI analysis of your health reports.', icon: FileText, color: 'text-teal-500', bg: 'bg-teal-50', locked: false },
                                { id: 'body-pain-mapper', title: 'Body Pain Mapper', description: 'Log and track physical discomfort on a 3D silhouette.', icon: Accessibility, color: 'text-rose-500', bg: 'bg-rose-50', locked: false },
                                { id: 'daily-tasks', title: 'Daily Vitality Tasks', description: 'Your personalized Ayurvedic lifestyle schedule.', icon: Calendar, color: 'text-sage-primary', bg: 'bg-sage-light/20', locked: false },
                                { id: 'happiness-program', title: 'Happiness Program', description: 'Transformative breathing and stress-reduction techniques.', icon: Heart, color: 'text-sky-500', bg: 'bg-sky-50', locked: false },
                                { id: 'intuition-process', title: 'Intuition Process', description: 'Awaken latent faculties in children and teenagers.', icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-50', locked: false }
                              ].map((item) => (
                                <motion.button
                                  key={item.id}
                                  whileHover={{ y: -4 }}
                                  onClick={() => {
                                    if (!item.locked) {
                                      if ('url' in item && item.url) {
                                        window.open(item.url as string, '_self');
                                      } else {
                                        setExploreView(item.id as any);
                                      }
                                    }
                                  }}
                                  className={cn(
                                    "group relative overflow-hidden bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-6",
                                    item.locked && "opacity-60 grayscale cursor-not-allowed"
                                  )}
                                >
                                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                                    <item.icon className="w-8 h-8" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                      {item.locked && <Lock className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                                  </div>
                                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-sage-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open Tool <ChevronRight className="w-4 h-4" />
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}

                        {exploreView === 'food-scanner' && (
                          <SmartNutrition onBack={() => setExploreView('launcher')} />
                        )}

                        {exploreView === 'protocols' && (
                          <div className="space-y-12">
                            <div className="flex items-center gap-4 px-8">
                              <button 
                                onClick={() => setExploreView('launcher')}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <h2 className="text-4xl font-serif font-bold text-sage-primary">AyurSync Protocols</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:gap-8 px-4 md:px-8 pb-16">
                              {[...customProtocols, ...protocolsData].map((protocol) => (
                                <button
                                  key={protocol.id}
                                  onClick={() => {
                                    if (protocol.id === 'meta-shred') {
                                      setActivePage('meta-shred');
                                    } else if (protocol.id === 'art-of-living') {
                                      setExploreView('art-of-living');
                                    } else {
                                      setSelectedProtocolId(protocol.id);
                                      setExploreView('protocol-detail');
                                    }
                                  }}
                                  className="relative h-64 md:h-80 rounded-[32px] md:rounded-[48px] overflow-hidden group text-left shadow-sm hover:shadow-xl transition-all hover:scale-[1.02]"
                                >
                                  <img 
                                    src={protocol.image} 
                                    alt={protocol.title} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                  
                                  {/* Watermark for custom protocols */}
                                  {protocol.id.startsWith('custom-') && (
                                    <div className="absolute top-4 right-4 pointer-events-none opacity-40 select-none text-right">
                                      <p className="text-white font-black text-[8px] uppercase tracking-[0.2em]">Designed for</p>
                                      <p className="text-white font-serif italic text-sm">User</p>
                                    </div>
                                  )}

                                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end">
                                    <div className="mb-auto">
                                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                                        {protocol.whyLabel.split(',')[0]}
                                      </span>
                                    </div>
                                    <h3 className="text-xl md:text-4xl font-black text-white tracking-widest uppercase mb-2 md:mb-4">{protocol.title}</h3>
                                    <p className="text-white/90 text-xs md:text-lg font-medium leading-tight md:leading-relaxed">{protocol.description}</p>
                                  </div>
                                </button>
                              ))}
                              
                              {/* Architect Consultation Card */}
                              <button
                                onClick={() => handleTabChange('protocol-maker')}
                                className="relative h-64 md:h-80 rounded-[32px] md:rounded-[48px] overflow-hidden group text-left shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4"
                              >
                                <div className="w-16 h-16 rounded-full bg-sage-primary/10 flex items-center justify-center text-sage-primary group-hover:scale-110 transition-transform">
                                  <Plus className="w-8 h-8" />
                                </div>
                                <div className="text-center px-6">
                                  <h3 className="text-xl font-bold text-gray-900">Architect Consultation</h3>
                                  <p className="text-gray-400 text-sm mt-1">Design your custom 21-day evolution.</p>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}

                        {exploreView === 'protocol-detail' && selectedProtocolId && (
                          <div className="space-y-12">
                            <div className="flex items-center gap-4 px-8">
                              <button 
                                onClick={() => setExploreView('launcher')}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <div>
                                <h2 className="text-4xl font-serif font-bold text-sage-primary">
                                  {[...customProtocols, ...protocolsData].find(p => p.id === selectedProtocolId)?.title}
                                </h2>
                                <p className="text-sage-primary/60 font-black uppercase tracking-[0.2em] text-[10px] mt-1">
                                  {[...customProtocols, ...protocolsData].find(p => p.id === selectedProtocolId)?.whyLabel}
                                </p>
                              </div>
                            </div>

                            <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Main Timeline */}
                              <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm">
                                  <h3 className="text-2xl font-bold text-gray-800 mb-8">Precision Timeline</h3>
                                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                    {(() => {
                                      const protocol = [...customProtocols, ...protocolsData].find(p => p.id === selectedProtocolId);
                                      if (!protocol) return null;
                                      
                                      const timeline = protocol.getTimeline ? protocol.getTimeline(healthData) : 
                                        (protocol.days?.[0]?.sessions.map((s: any) => ({
                                          time: s.time,
                                          specialistName: s.specialist,
                                          category: s.type || 'Rest',
                                          instruction: `${s.title}: ${s.details?.note || ''}`,
                                          sessionDetails: s.sessionDetails,
                                          linkedPageId: s.id
                                        })) || []);

                                      return timeline.map((item: any, index: number) => {
                                        const specialist = specialists.find(s => s.name.toLowerCase().includes(item.specialistName?.toLowerCase() || ''));
                                        return (
                                          <div 
                                            key={index} 
                                            onClick={() => {
                                              if (item.sessionDetails) {
                                                setSelectedSession(item);
                                                setExploreView('session-blueprint');
                                              }
                                            }}
                                            className={cn(
                                              "relative flex items-center justify-between md:justify-center group cursor-pointer transition-all hover:scale-[1.02]", 
                                              index % 2 !== 0 && "md:flex-row-reverse"
                                            )}
                                          >
                                              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-white shadow shrink-0 z-10 overflow-hidden md:absolute md:left-1/2 md:-translate-x-1/2">
                                                {specialist?.avatar ? (
                                                  <img src={specialist.avatar} alt={specialist.name} className="w-full h-full object-cover object-top" />
                                                ) : (
                                                  <div className="w-full h-full bg-sage-light flex items-center justify-center text-sage-primary font-bold">
                                                    {(item.specialistName || 'A').charAt(0).toUpperCase()}
                                                  </div>
                                                )}
                                              </div>
                                            <div className={cn("w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm", index % 2 === 0 ? "md:mr-auto" : "md:ml-auto")}>
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-sage-primary">{item.time}</span>
                                                {specialist && <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{specialist.name}</span>}
                                              </div>
                                              <p className="text-gray-700 leading-relaxed">{item.instruction}</p>
                                            </div>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* Architect's Sidebar */}
                              <div className="space-y-8">
                                {/* Power Meter */}
                                <div className="bg-black rounded-[40px] p-8 text-white shadow-xl">
                                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    Vitality Impact
                                  </h3>
                                  <div className="space-y-6">
                                    {Object.entries([...customProtocols, ...protocolsData].find(p => p.id === selectedProtocolId)?.doshaImpact || {}).map(([dosha, value]) => (
                                      <div key={dosha} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                          <span>{dosha}</span>
                                          <span className="text-white/60">{value}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            className={cn(
                                              "h-full rounded-full",
                                              dosha === 'vata' ? "bg-blue-400" : dosha === 'pitta' ? "bg-orange-500" : "bg-sage-primary"
                                            )}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Architect's Note */}
                                <div className="bg-sage-light/30 border border-sage-primary/10 rounded-[40px] p-8 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Stethoscope className="w-12 h-12 text-sage-primary" />
                                  </div>
                                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-sage-primary mb-4">Architect's Note</h3>
                                  <p className="text-gray-800 font-serif italic text-lg leading-relaxed">
                                    "{[...customProtocols, ...protocolsData].find(p => p.id === selectedProtocolId)?.architectNote}"
                                  </p>
                                  <div className="mt-6 pt-6 border-t border-sage-primary/10">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-sage-primary text-white rounded-xl flex items-center justify-center font-bold">AA</div>
                                      <div>
                                        <p className="text-xs font-bold text-gray-900">Chief Architect</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">30+ Years Experience</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {exploreView === 'session-blueprint' && selectedSession && (
                          <div className="space-y-12">
                            <div className="flex items-center gap-4 px-8">
                              <button 
                                onClick={() => setExploreView('protocol-detail')}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <div>
                                <h2 className="text-4xl font-serif font-bold text-sage-primary">Session Blueprint</h2>
                                <p className="text-sage-primary/60 font-black uppercase tracking-[0.2em] text-[10px] mt-1">
                                  {selectedSession.time} • {selectedSession.category}
                                </p>
                              </div>
                            </div>

                            <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
                              {/* Phase Breakdown */}
                              <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white border border-gray-100 rounded-[48px] p-8 md:p-12 shadow-sm space-y-12">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-gray-800">The "Body Profit" System</h3>
                                    <div className="px-4 py-2 bg-sage-light/30 rounded-full text-sage-primary text-xs font-bold uppercase tracking-widest">
                                      3-Phase Protocol
                                    </div>
                                  </div>

                                  <div className="space-y-12">
                                    {selectedSession.sessionDetails && Object.entries(selectedSession.sessionDetails.phases).map(([key, phase]) => (
                                      <div key={key} className="group">
                                        <div className="flex flex-col md:flex-row gap-8">
                                          <div className="w-full md:w-48 h-48 rounded-[32px] overflow-hidden shrink-0 relative">
                                            <img src={phase.bioImage} alt={phase.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/20" />
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-bold text-white uppercase tracking-widest border border-white/20">
                                              {phase.duration} MIN
                                            </div>
                                          </div>
                                          <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                              <span className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                key === 'mobilize' ? "bg-blue-100 text-blue-600" : 
                                                key === 'perform' ? "bg-orange-100 text-orange-600" : 
                                                "bg-sage-light text-sage-primary"
                                              )}>
                                                {key === 'mobilize' ? '01' : key === 'perform' ? '02' : '03'}
                                              </span>
                                              <h4 className="text-xl font-bold text-gray-900 uppercase tracking-wider">{phase.title}</h4>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed font-medium">{phase.description}</p>
                                            <ul className="space-y-2">
                                              {phase.instructions.map((inst, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-sage-primary mt-1.5 shrink-0" />
                                                  {inst}
                                                </li>
                                              ))}
                                            </ul>
                                            {phase.videoId && (
                                              <button 
                                                onClick={() => setPreviewVideoId(phase.videoId || null)}
                                                className="flex items-center gap-2 text-xs font-bold text-sage-primary hover:underline mt-4"
                                              >
                                                <Play className="w-4 h-4" />
                                                Preview Movement
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Action Sidebar */}
                              <div className="space-y-8">
                                <div className="bg-black rounded-[40px] p-8 text-white shadow-xl space-y-8">
                                  <div className="space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Status</h3>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-sage-primary" />
                                      <span className="text-lg font-bold">Scheduled for {selectedSession.time}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <button 
                                      disabled={!(() => {
                                        const now = new Date();
                                        const [time, modifier] = selectedSession.time.split(' ');
                                        let [hours, minutes] = time.split(':').map(Number);
                                        if (modifier === 'PM' && hours < 12) hours += 12;
                                        if (modifier === 'AM' && hours === 12) hours = 0;
                                        const scheduledDate = new Date();
                                        scheduledDate.setHours(hours, minutes, 0, 0);
                                        return now >= scheduledDate;
                                      })()}
                                      className="w-full py-6 bg-sage-primary disabled:bg-white/10 disabled:text-white/20 rounded-3xl font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                      Start Session
                                    </button>
                                    <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest">
                                      Discipline is the bridge to vitality.
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-sage-light/30 border border-sage-primary/10 rounded-[40px] p-8">
                                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-sage-primary mb-4">Bio-Mechanical Goal</h3>
                                  <p className="text-gray-800 font-serif italic text-lg leading-relaxed">
                                    "This session is architected to optimize your {selectedSession.category.toLowerCase()} through targeted physiological stressors followed by deep neural integration."
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {exploreView === 'universal-search' && (
                          <div className="bg-white min-h-[80vh] rounded-[48px] flex flex-col relative overflow-hidden">
                            <div className="absolute top-8 left-8 z-10">
                              <button 
                                onClick={() => {
                                  setExploreView('launcher');
                                  setCurrentSERP(null);
                                  setCurrentSearchTerm('');
                                }}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                            </div>

                            {!currentSERP && !isSearching ? (
                              <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
                                <h2 className="text-xl font-medium text-gray-400 mb-6">Search</h2>
                                <div className="relative w-full group">
                                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-sage-primary transition-colors" />
                                  <input 
                                    autoFocus
                                    type="text"
                                    value={universalSearchQuery}
                                    onChange={(e) => setUniversalSearchQuery(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full bg-white border border-gray-200 rounded-[32px] py-6 pl-16 pr-16 outline-none focus:ring-4 focus:ring-sage-primary/10 shadow-sm hover:shadow-md transition-all text-lg"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUniversalSearch(universalSearchQuery);
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                                      if (SpeechRecognition) {
                                        const recognition = new SpeechRecognition();
                                        recognition.onresult = (event: any) => {
                                          setUniversalSearchQuery(event.results[0][0].transcript);
                                        };
                                        recognition.start();
                                      } else {
                                        setUniversalSearchQuery("Suggest a dental doctor");
                                      }
                                    }}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-sage-primary transition-colors"
                                  >
                                    <Mic className="w-6 h-6" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col h-full pt-24">
                                <div className="px-8 pb-4 border-b border-gray-100">
                                  <div className="flex gap-6 overflow-x-auto no-scrollbar">
                                    {[
                                      { id: 'all', label: 'All' },
                                      { id: 'places', label: 'Local Places' },
                                      { id: 'web', label: 'Web Links' },
                                      { id: 'video', label: 'Video' },
                                      { id: 'store', label: 'Store' }
                                    ].map(tab => (
                                      <button
                                        key={tab.id}
                                        onClick={() => setSerpTab(tab.id as any)}
                                        className={cn(
                                          "pb-4 px-2 text-sm font-medium whitespace-nowrap transition-colors relative",
                                          serpTab === tab.id ? "text-sage-primary" : "text-gray-500 hover:text-gray-800"
                                        )}
                                      >
                                        {tab.label}
                                        {serpTab === tab.id && (
                                          <motion.div layoutId="serpTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-primary rounded-t-full" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                                  {isSearching ? (
                                    <div className="flex justify-center items-center h-40">
                                      <div className="bg-white p-6 rounded-full shadow-sm flex gap-2">
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-sage-primary rounded-full" />
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-sage-primary rounded-full" />
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-sage-primary rounded-full" />
                                      </div>
                                    </div>
                                  ) : currentSERP ? (
                                    <div className="max-w-3xl mx-auto space-y-8">
                                      {serpTab === 'all' && (
                                        <div className="space-y-8">
                                          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                                            <div className="flex items-center gap-3 text-sage-primary mb-2">
                                              <Sparkles className="w-5 h-5" />
                                              <h3 className="font-medium">AI Overview</h3>
                                            </div>
                                            <div className="markdown-body text-gray-800 leading-relaxed">
                                              <Markdown>{currentSERP.all}</Markdown>
                                            </div>
                                          </div>
                                          
                                          {currentSERP.places && currentSERP.places.length > 0 && (
                                            <div className="space-y-4">
                                              <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-gray-900">Local Places</h3>
                                                <button onClick={() => setSerpTab('places')} className="text-sm font-medium text-sage-primary hover:text-sage-secondary">View all</button>
                                              </div>
                                              <div className="grid grid-cols-1 gap-4">
                                                {currentSERP.places.slice(0, 3).map((place) => (
                                                  <div key={`${place.name}-${place.address}`} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-all">
                                                    <div className="flex-1 space-y-3">
                                                      <div className="flex items-start justify-between">
                                                        <div>
                                                          <h4 className="text-lg font-bold text-gray-900">{place.name}</h4>
                                                          <p className="text-sm font-medium text-sage-primary mt-1">{place.rating} • {place.specialization}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                                          <MapPin className="w-4 h-4" />
                                                          {place.distance}
                                                        </div>
                                                      </div>
                                                      <p className="text-sm text-gray-600 flex items-start gap-2">
                                                        <span className="mt-0.5">•</span> {place.address}
                                                      </p>
                                                    </div>
                                                    <div className="flex flex-row sm:flex-col gap-3 justify-center sm:justify-start sm:w-40">
                                                      <a href={place.directionsUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sage-primary text-white rounded-xl text-sm font-medium hover:bg-sage-secondary transition-colors">
                                                        <Navigation className="w-4 h-4" />
                                                        Directions
                                                      </a>
                                                      <a href={place.shareUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200">
                                                        <Share2 className="w-4 h-4" />
                                                        Share
                                                      </a>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {currentSERP.mapQuery && (
                                            <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                                              <iframe 
                                                width="100%" 
                                                height="300" 
                                                frameBorder="0" 
                                                scrolling="no" 
                                                marginHeight={0} 
                                                marginWidth={0} 
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(currentSERP.mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                                className="rounded-[24px]"
                                              ></iframe>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {serpTab === 'places' && (
                                        <div className="grid grid-cols-1 gap-4">
                                          {currentSERP.mapQuery && (
                                            <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-4">
                                              <iframe 
                                                width="100%" 
                                                height="300" 
                                                frameBorder="0" 
                                                scrolling="no" 
                                                marginHeight={0} 
                                                marginWidth={0} 
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(currentSERP.mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                                className="rounded-[24px]"
                                              ></iframe>
                                            </div>
                                          )}
                                          {currentSERP.places && currentSERP.places.length > 0 ? (
                                            currentSERP.places.map((place) => (
                                              <div key={`full-${place.name}-${place.address}`} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-all">
                                                <div className="flex-1 space-y-3">
                                                  <div className="flex items-start justify-between">
                                                    <div>
                                                      <h4 className="text-lg font-bold text-gray-900">{place.name}</h4>
                                                      <p className="text-sm font-medium text-sage-primary mt-1">{place.rating} • {place.specialization}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                                      <MapPin className="w-4 h-4" />
                                                      {place.distance}
                                                    </div>
                                                  </div>
                                                  <p className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="mt-0.5">•</span> {place.address}
                                                  </p>
                                                </div>
                                                <div className="flex flex-row sm:flex-col gap-3 justify-center sm:justify-start sm:w-40">
                                                  <a href={place.directionsUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sage-primary text-white rounded-xl text-sm font-medium hover:bg-sage-secondary transition-colors">
                                                    <Navigation className="w-4 h-4" />
                                                    Directions
                                                  </a>
                                                  <a href={place.shareUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200">
                                                    <Share2 className="w-4 h-4" />
                                                    Share
                                                  </a>
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-center py-12 bg-white rounded-[24px] border border-gray-100">
                                              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                              <h3 className="text-lg font-medium text-gray-900 mb-2">No local places found</h3>
                                              <p className="text-gray-500">Try adjusting your search or ensuring your GPS is turned on.</p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {serpTab === 'web' && (
                                        <div className="space-y-4">
                                          {currentSERP.webLinks?.map((link) => (
                                            <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="block bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                              <h4 className="text-lg font-medium text-blue-600 group-hover:underline mb-1">{link.title}</h4>
                                              <p className="text-sm text-green-700 mb-2 truncate">{link.url}</p>
                                              <p className="text-sm text-gray-600 line-clamp-2">{link.snippet}</p>
                                            </a>
                                          ))}
                                        </div>
                                      )}

                                      {serpTab === 'video' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                          {currentSERP.videos?.map((video) => (
                                            <a key={video.videoUrl} href={video.videoUrl} target="_blank" rel="noreferrer" className="block bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                                              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                              </div>
                                              <div className="p-5 space-y-1">
                                                <h4 className="font-medium text-gray-900 line-clamp-2">{video.title}</h4>
                                                <p className="text-sm text-gray-500">{video.creator}</p>
                                              </div>
                                            </a>
                                          ))}
                                        </div>
                                      )}

                                      {serpTab === 'store' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                          {currentSERP.store?.map((item) => (
                                            <div key={item.buyUrl} className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
                                              <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden p-4 flex items-center justify-center">
                                                <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                                              </div>
                                              <div className="flex-1 space-y-2">
                                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.platform}</p>
                                                <h4 className="font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                                                <p className="text-lg font-bold text-sage-primary">{item.price}</p>
                                              </div>
                                              <a href={item.buyUrl} target="_blank" rel="noreferrer" className="mt-4 w-full py-3 bg-gray-900 text-white text-center rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                                                Buy Now
                                              </a>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </div>

                                <div className="p-6 bg-white border-t border-gray-100 flex gap-4 mt-auto">
                                  <div className="relative flex-1">
                                    <input 
                                      type="text"
                                      placeholder="Ask a follow-up..."
                                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-6 pr-24 outline-none focus:ring-2 focus:ring-sage-primary/20 transition-all text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUniversalSearch((e.target as HTMLInputElement).value);
                                          (e.target as HTMLInputElement).value = '';
                                        }
                                      }}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                      <button 
                                        onClick={(e) => {
                                          const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                                          if (input) {
                                            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                                            if (SpeechRecognition) {
                                              const recognition = new SpeechRecognition();
                                              recognition.onresult = (event: any) => {
                                                input.value = event.results[0][0].transcript;
                                              };
                                              recognition.start();
                                            } else {
                                              input.value = "Suggest a dental doctor";
                                            }
                                          }
                                        }}
                                        className="p-2 text-gray-400 hover:text-sage-primary rounded-xl transition-colors"
                                      >
                                        <Mic className="w-5 h-5" />
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                                          if (input) {
                                            handleUniversalSearch(input.value);
                                            input.value = '';
                                          }
                                        }}
                                        className="p-2 text-sage-primary hover:bg-sage-primary/10 rounded-xl transition-colors"
                                      >
                                        <Search className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {exploreView === 'voice-wellness' && (
                          <AyurvedaSangam 
                            onBack={() => setExploreView('launcher')}
                            healthData={healthData}
                          />
                        )}

                        {exploreView === 'full-analysis' && (
                          <FullAnalysis 
                            data={fullAnalysisData}
                            onBack={() => setExploreView('voice-wellness')}
                          />
                        )}

                        {exploreView === 'ayurvault' && (
                          <AyurVaultLibrary onBack={() => setExploreView('launcher')} />
                        )}

                        {exploreView === 'medical-scanner' && (
                          <Suspense fallback={<div className="flex items-center justify-center h-64"><AyurSyncLoader size="medium" /></div>}>
                            <MedicalScanner 
                              medicalReportImage={medicalReportImage}
                              setMedicalReportImage={setMedicalReportImage}
                              medicalReportResult={medicalReportResult}
                              setMedicalReportResult={setMedicalReportResult}
                              setExploreView={setExploreView}
                              reportInputRef={reportInputRef}
                              handleMedicalReportUpload={handleMedicalReportUpload}
                              handleMedicalReportScan={handleMedicalReportScan}
                              isScanningReport={isScanningReport}
                              scanProgressText={scanProgressText}
                            />
                          </Suspense>
                        )}

                        {exploreView === 'body-pain-mapper' && (
                          <BodyPainMapper 
                            onBack={() => setExploreView('launcher')}
                            onSave={handlePainSave}
                            existingEntries={healthData.painMap}
                            onDelete={handlePainDelete}
                          />
                        )}

                        {exploreView === 'daily-tasks' && (
                          <div className="space-y-12">
                             <div className="flex items-center gap-4">
                              <button 
                                onClick={() => setExploreView('launcher')}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <h2 className="text-3xl font-serif font-bold text-sage-primary">Daily Vitality Tasks</h2>
                            </div>

                            {/* AI Voice Note from Ishaan */}
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gradient-to-br from-sage-primary to-sage-accent p-8 rounded-[40px] text-white shadow-xl shadow-sage-primary/20 relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                              <div className="relative flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                  <Mic className="w-8 h-8 text-white" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Voice Note from Ishaan</span>
                                    <div className="flex gap-1">
                                      {[1, 2, 3].map(i => (
                                        <motion.div 
                                          key={i}
                                          animate={{ height: [4, 12, 4] }}
                                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                          className="w-1 bg-white/60 rounded-full"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-lg font-medium italic">
                                    "Day {activeJourneys.find(j => j.title.toLowerCase().includes('weight loss'))?.currentDay || 3} of your journey is about metabolic intensity. Focus on your breathing during the Metabolism Flow."
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm space-y-12 relative overflow-hidden">
                              <div className="flex justify-between items-center relative z-10">
                                <div className="space-y-1">
                                  <h3 className="text-xl font-bold text-gray-800">Your Lifestyle OS</h3>
                                  <p className="text-sm text-gray-400">AI-optimized schedule for your {healthData.primaryGoal} goal.</p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-sage-light/30 text-sage-primary font-bold rounded-2xl text-xs uppercase tracking-widest">
                                  <Sparkles className="w-4 h-4" />
                                  Context Aware
                                </div>
                              </div>

                              <div className="relative pl-4 sm:pl-8">
                                {/* Timeline Rail */}
                                <div className="absolute left-0 top-4 bottom-4 w-1 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(() => {
                                      const now = new Date();
                                      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
                                      const startOfDay = 5 * 60 + 30; // 5:30 AM
                                      const endOfDay = 22 * 60; // 10:00 PM
                                      const progress = ((currentTimeMinutes - startOfDay) / (endOfDay - startOfDay)) * 100;
                                      return Math.min(Math.max(progress, 0), 100);
                                    })()}%` }}
                                    className="w-full bg-sage-primary"
                                  />
                                </div>

                                <div className="space-y-8">
                                  {tasks.map((task) => {
                                    const isNext = (() => {
                                      const now = new Date();
                                      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
                                      const [time, modifier] = task.time.split(' ');
                                      const [hours, minutes] = time.split(':').map(Number);
                                      let h = hours;
                                      if (modifier === 'PM' && h < 12) h += 12;
                                      if (modifier === 'AM' && h === 12) h = 0;
                                      const taskTimeMinutes = h * 60 + minutes;
                                      return taskTimeMinutes > currentTimeMinutes && !task.completed;
                                    })();

                                    return (
                                      <motion.div 
                                        key={task.id} 
                                        layout
                                        className={cn(
                                          "relative pl-12 group transition-all duration-500",
                                          isNext && "scale-[1.02]"
                                        )}
                                      >
                                        {/* Timeline Dot */}
                                        <div className={cn(
                                          "absolute -left-[18px] top-6 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-20 transition-all duration-500",
                                          task.completed ? "bg-sage-primary text-white" : "bg-white border-gray-100 text-gray-300 shadow-sm",
                                          isNext && "ring-4 ring-sage-primary/20"
                                        )}>
                                          {task.completed ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                        </div>
                                        
                                        <div className={cn(
                                          "p-8 rounded-[40px] border backdrop-blur-xl transition-all duration-500 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8",
                                          task.completed 
                                            ? "bg-white/40 border-gray-100 opacity-60" 
                                            : isNext 
                                              ? "bg-white border-sage-primary/30 shadow-2xl shadow-sage-primary/10 ring-1 ring-sage-primary/20" 
                                              : "bg-white/60 border-gray-50 hover:border-gray-200 shadow-sm"
                                        )}>
                                          <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                              <span className="text-xs font-bold text-sage-primary uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {task.time}
                                              </span>
                                              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">{task.category}</span>
                                              {(task.category === 'Wake-up' || task.category === 'Sleep-prep') && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/5 rounded-full border border-slate-900/10">
                                                  <img src="https://raw.githubusercontent.com/rocketb665-debug/ayursync-assets/refs/heads/main/file_00000000633871fa83cefae6688ca347.png" alt="Kabir" className="w-4 h-4 rounded-full" />
                                                  <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Kabir</span>
                                                </div>
                                              )}
                                              {isNext && (
                                                <div className="flex items-center gap-2">
                                                  <span className="px-3 py-1 bg-sage-primary/10 text-sage-primary rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                                    Up Next
                                                  </span>
                                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    In {(() => {
                                                      const diff = (() => {
                                                        const now = new Date();
                                                        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
                                                        const [time, modifier] = task.time.split(' ');
                                                        const [hours, minutes] = time.split(':').map(Number);
                                                        let h = hours;
                                                        if (modifier === 'PM' && h < 12) h += 12;
                                                        if (modifier === 'AM' && h === 12) h = 0;
                                                        const taskTimeMinutes = h * 60 + minutes;
                                                        return taskTimeMinutes - currentTimeMinutes;
                                                      })();
                                                      return diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`;
                                                    })()}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            <div className="space-y-1">
                                              <h4 className={cn(
                                                "text-2xl font-bold transition-all duration-500", 
                                                task.completed ? "text-gray-400 line-through" : "text-gray-800"
                                              )}>
                                                {task.title}
                                              </h4>
                                              <div className="markdown-body text-sm text-gray-500 max-w-xl leading-relaxed">
                                                <Markdown
                                                  components={{
                                                    p: ({node, children, ...props}) => {
                                                      const content = React.Children.toArray(children).join('');
                                                      const videoMatch = content.match(/\[VIDEO:([a-zA-Z0-9_-]{11})\]/);
                                                      if (videoMatch) {
                                                        const videoId = videoMatch[1];
                                                        return (
                                                          <div className="my-6 aspect-video rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-black max-w-md">
                                                            <iframe 
                                                              className="w-full h-full"
                                                              src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1`}
                                                              title="Task Video"
                                                              frameBorder="0"
                                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                              allowFullScreen
                                                            ></iframe>
                                                          </div>
                                                        );
                                                      }
                                                      return <p {...props}>{children}</p>;
                                                    }
                                                  }}
                                                >
                                                  {task.description}
                                                </Markdown>
                                              </div>
                                            </div>

                                            {task.resourceLink && (
                                              <button 
                                                onClick={() => {
                                                  if (task.resourceLink === 'journey-detail') {
                                                    const wlj = activeJourneys.find(j => j.title.toLowerCase().includes('weight loss'));
                                                    if (wlj) {
                                                      setSelectedJourneyId(wlj.id);
                                                      setActiveTab('journeys');
                                                    }
                                                  }
                                                }}
                                                className="flex items-center gap-2 text-xs font-bold text-sage-primary hover:underline group/link"
                                              >
                                                <ExternalLink className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                                View Plan Details
                                              </button>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-4 w-full lg:w-auto">
                                            {!task.completed && (
                                              <button 
                                                onClick={() => {
                                                  const newTasks = tasks.map(t => t.id === task.id ? { ...t, isSnoozed: true } : t);
                                                  setTasks(newTasks);
                                                  // In a real app, we'd handle the timer here
                                                }}
                                                className="flex-1 lg:flex-none px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                              >
                                                <History className="w-4 h-4" />
                                                Snooze 10m
                                              </button>
                                            )}
                                            <button 
                                              onClick={() => {
                                                const newTasks = tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                                                setTasks(newTasks);
                                                if (!task.completed) {
                                                  setCoinAnimations(prev => [...prev, { id: Date.now(), x: window.innerWidth / 2, y: window.innerHeight / 2 }]);
                                                  
                                                  // Kabir's Brahma Muhurta Sync
                                                  if (task.title === 'Brahma Muhurta Wakeup') {
                                                    setVitalityScore(prev => Math.min(100, prev + 5));
                                                    setIsVitalityPulse(true);
                                                    showToast("Kabir: Excellent. +5 Vitality for aligning with the sun.");
                                                  }
                                                  
                                                  // Dr. Zara's Evening Glow Ritual
                                                  if (task.title === 'Evening Glow Ritual') {
                                                    showToast("Dr. Zara: Your inner light is starting to reflect on your skin. Keep it up!");
                                                  }
                                                  
                                                  // Veer's Nudges
                                                  if (task.title === 'High Protein Meal' || task.title === 'Deep Recovery Session') {
                                                    showToast("Veer: Building a stronger you, one rep at a time. Excellent work!");
                                                  }
                                                }
                                              }}
                                              className={cn(
                                                "flex-1 lg:flex-none px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2",
                                                task.completed 
                                                  ? "bg-sage-light/20 text-sage-primary shadow-none" 
                                                  : "bg-sage-primary text-white shadow-sage-primary/20 hover:bg-sage-accent"
                                              )}
                                            >
                                              {task.completed ? (
                                                <>
                                                  <CheckCircle className="w-5 h-5" />
                                                  Done
                                                </>
                                              ) : (
                                                'Mark Done'
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {exploreView === 'art-of-living' && (
                          <ArtOfLivingView 
                            onBack={() => setExploreView('launcher')} 
                            onNavigateToHappiness={() => setExploreView('happiness-program')}
                            onNavigateToIntuition={() => setExploreView('intuition-process')}
                            profileImage={healthData.profileImage}
                            onProfileClick={handleProfileClick}
                          />
                        )}

                        {exploreView === 'happiness-program' && (
                          <HappinessProgramView 
                            onBack={() => setExploreView('launcher')} 
                            profileImage={healthData.profileImage}
                            onProfileClick={handleProfileClick}
                          />
                        )}

                        {exploreView === 'intuition-process' && (
                          <IntuitionProcessView 
                            onBack={() => setExploreView('launcher')} 
                            profileImage={healthData.profileImage}
                            onProfileClick={handleProfileClick}
                          />
                        )}

                        {exploreView === 'notification-center' && (
                          <div className="space-y-12">
                             <div className="flex items-center gap-4">
                              <button 
                                onClick={() => setExploreView('launcher')}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <h2 className="text-3xl font-serif font-bold text-sage-primary">Notification Center</h2>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm space-y-8">
                              <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800">Alarms & Updates</h3>
                                <div className="flex gap-4">
                                  <button 
                                    onClick={() => {
                                      const testNotif: AppNotification = {
                                        id: Date.now().toString(),
                                        title: 'Test Alarm',
                                        description: `It is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: Time for your scheduled ritual.`,
                                        timestamp: new Date(),
                                        type: 'alarm',
                                        status: 'pending',
                                        read: false
                                      };
                                      setNotifications([testNotif, ...notifications]);
                                      setActiveSystemNotification(testNotif);
                                      setTimeout(() => setActiveSystemNotification(null), 5000);
                                    }}
                                    className="px-4 py-2 bg-sage-light/30 text-sage-primary font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-sage-light/50 transition-all"
                                  >
                                    Test Alarm
                                  </button>
                                  <button 
                                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                                    className="text-xs font-bold text-sage-primary uppercase tracking-widest hover:underline"
                                  >
                                    Mark all as read
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {notifications.map((notif) => (
                                  <div 
                                    key={notif.id} 
                                    className={cn(
                                      "p-6 rounded-3xl border transition-all flex gap-6 items-start",
                                      notif.read ? "bg-gray-50 border-transparent" : "bg-sage-light/5 border-sage-primary/20 shadow-sm"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                      notif.type === 'alarm' ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                                    )}>
                                      {notif.type === 'alarm' ? <Clock className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                      <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-gray-800">{notif.title}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="text-sm text-gray-500">{notif.description}</p>
                                    </div>
                                    {!notif.read && (
                                      <div className="w-2 h-2 bg-sage-primary rounded-full mt-2" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'sleep-analytics' && (
                      <SleepAnalyticsView 
                        onBack={() => setActiveTab('home')}
                        sleepHistory={healthData.sleepHistory || []}
                      />
                    )}

                    {activeTab === 'health-calendar' && (
                      <HealthCalendarView 
                        onBack={() => setActiveTab('home')}
                        gender={healthData.gender}
                        menstrualData={healthData.menstrualData}
                        events={healthData.healthEvents || []}
                        onUpdateEvents={(newEvents) => setHealthData(prev => ({ ...prev, healthEvents: newEvents }))}
                        painLogs={healthData.painMap.map(p => ({
                          date: new Date(p.timestamp).toISOString().split('T')[0],
                          intensity: p.intensity
                        }))}
                      />
                    )}

                    {activeTab === 'profile' && (
                      <motion.div
                        key="view-profile"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl mx-auto space-y-12 pt-8 md:pt-4"
                      >
                        {profileView === 'main' ? (
                          <>
                            {/* Goal Setting */}
                        <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm space-y-8">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-serif font-bold text-sage-primary">Primary Health Goal</h3>
                            <p className="text-gray-500">What is your main focus right now?</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {['Weight Loss', 'Sugar Control', 'Stress Relief', 'Better Sleep', 'Energy Boost', 'Skin Health'].map((goal) => (
                              <button
                                key={goal}
                                onClick={() => setHealthData(prev => ({ ...prev, primaryGoal: goal }))}
                                className={cn(
                                  "p-4 rounded-2xl border-2 font-bold text-sm transition-all",
                                  healthData.primaryGoal === goal 
                                    ? "bg-sage-primary/5 border-sage-primary text-sage-primary" 
                                    : "bg-white border-gray-100 text-gray-400 hover:border-sage-primary/30"
                                )}
                              >
                                {goal}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Feedback Hub */}
                        <div className="bg-sage-primary rounded-[48px] p-12 text-white space-y-8 shadow-2xl shadow-sage-primary/20">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-serif font-bold">Connect with Founders</h3>
                            <p className="text-sage-light/60">We are here to support your journey 24/7.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <a 
                              href="https://wa.me/9165459791" 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-4 p-5 bg-white/10 hover:bg-white/20 active:bg-sage-accent rounded-3xl transition-all"
                            >
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><MessageCircle className="w-6 h-6" /></div>
                              <span className="font-bold">WhatsApp</span>
                            </a>
                            <a 
                              href="mailto:ayursync.ai.help@gmail.com"
                              className="flex items-center gap-4 p-5 bg-white/10 hover:bg-white/20 active:bg-sage-accent rounded-3xl transition-all"
                            >
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Mail className="w-6 h-6" /></div>
                              <span className="font-bold">Email Support</span>
                            </a>
                            <a 
                              href="tel:+9165459791"
                              className="flex items-center gap-4 p-5 bg-white/10 hover:bg-white/20 active:bg-sage-accent rounded-3xl transition-all"
                            >
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Phone className="w-6 h-6" /></div>
                              <span className="font-bold">Call Us</span>
                            </a>
                            <a 
                              href="https://forms.gle/ayursync-bug-report"
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-4 p-5 bg-red-500/20 hover:bg-red-500/30 active:bg-red-600 rounded-3xl transition-all border border-red-500/30"
                            >
                              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-200" /></div>
                              <span className="font-bold">Report a Bug</span>
                            </a>
                          </div>
                        </div>

                        {/* Device Connectivity Hub */}
                        <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm space-y-8">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="text-2xl font-serif font-bold text-sage-primary">Device Connect Hub</h3>
                              <p className="text-gray-500">Sync your wearable data for real-time vitality tracking.</p>
                            </div>
                            {(isScanning || bluetoothDevice) && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                  {isScanning ? 'Scanning...' : 'Live Syncing'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center justify-center py-10 space-y-8">
                            {!isScanning && !bluetoothDevice && discoveredDevices.length === 0 && (
                              <div className="w-full max-w-md space-y-6">
                                <button
                                  onClick={() => setShowBluetoothInstructions(true)}
                                  className="group relative flex flex-col items-center gap-4 p-12 rounded-[40px] border-2 border-dashed border-gray-200 hover:border-sage-primary hover:bg-sage-primary/5 transition-all w-full"
                                >
                                  <div className="w-20 h-20 bg-sage-primary/10 text-sage-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Bluetooth className="w-10 h-10" />
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-gray-800">Search for Nearby Devices</div>
                                    <p className="text-sm text-gray-400">Ensure your fitness band is in pairing mode.</p>
                                  </div>
                                </button>

                                {isManualInputMode ? (
                                  <div className="p-6 bg-gray-50 rounded-[32px] space-y-4 border border-gray-100">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manual Device Sync</div>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text"
                                        value={manualDeviceId}
                                        onChange={(e) => setManualDeviceId(e.target.value)}
                                        placeholder="Enter Device ID (e.g. FIT-99)"
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sage-primary/20"
                                      />
                                      <button 
                                        onClick={handleManualConnect}
                                        className="px-6 py-3 bg-sage-primary text-white font-bold rounded-xl hover:bg-sage-accent transition-all"
                                      >
                                        Sync
                                      </button>
                                    </div>
                                    <button 
                                      onClick={() => setIsManualInputMode(false)}
                                      className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setIsManualInputMode(true)}
                                    className="w-full text-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-sage-primary transition-all"
                                  >
                                    Browser blocking Bluetooth? Click here to manually input Device ID
                                  </button>
                                )}
                              </div>
                            )}

                            {isScanning && (
                              <div className="relative w-64 h-64 flex items-center justify-center">
                                {/* Radar Animation */}
                                {[...Array(3)].map((_, i) => (
                                  <motion.div
                                    key={`radar-${i}`}
                                    initial={{ scale: 0.5, opacity: 0.5 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: i * 0.6,
                                      ease: "easeOut"
                                    }}
                                    className="absolute inset-0 border-2 border-sage-primary rounded-full"
                                  />
                                ))}
                                <div className="relative z-10 w-24 h-24 bg-sage-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-sage-primary/20">
                                  <Radio className="w-10 h-10 animate-pulse" />
                                </div>
                              </div>
                            )}

                            {(discoveredDevices.length > 0 || bluetoothDevice) && (
                              <div className="w-full max-w-md space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
                                  {bluetoothDevice ? 'Connected Device' : 'Discovered Devices'}
                                </h4>
                                <div className="space-y-3">
                                  {bluetoothDevice ? (
                                    <div className="p-6 rounded-[32px] border-2 border-sage-primary/20 bg-sage-primary/5 flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-sage-primary text-white rounded-2xl flex items-center justify-center">
                                          <Bluetooth className="w-6 h-6" />
                                        </div>
                                        <div>
                                          <div className="font-bold text-gray-800">{bluetoothDevice.name}</div>
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Synced</span>
                                          </div>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          if (bluetoothDevice.gatt?.connected) {
                                            bluetoothDevice.gatt.disconnect();
                                          } else {
                                            setBluetoothDevice(null);
                                          }
                                        }}
                                        className="text-xs font-bold text-rose-500 hover:underline"
                                      >
                                        Disconnect
                                      </button>
                                    </div>
                                  ) : (
                                    discoveredDevices.map((device) => (
                                      <div 
                                        key={device.id}
                                        className="p-6 rounded-[32px] border-2 border-gray-50 bg-white flex items-center justify-between hover:border-sage-primary/20 transition-all"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center">
                                            <Bluetooth className="w-6 h-6" />
                                          </div>
                                          <div>
                                            <div className="font-bold text-gray-800">{device.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ready to pair</div>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleConnectDevice(device)}
                                          className="px-6 py-2 bg-sage-primary text-white rounded-full text-xs font-bold hover:bg-sage-accent transition-all"
                                        >
                                          Connect
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>
                                {!bluetoothDevice && (
                                  <button 
                                    onClick={handleSearchDevices}
                                    className="w-full py-4 text-sage-primary font-bold text-sm hover:underline"
                                  >
                                    Search Again
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Account Management */}
                        <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm space-y-8">
                          <h3 className="text-xl font-bold text-gray-800">Account Management</h3>
                          <div className="space-y-4">
                            <button 
                              onClick={() => setIsVitalityModalOpen(true)}
                              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-3xl transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-sage-primary/10 group-hover:text-sage-primary transition-all"><Plus className="w-6 h-6" /></div>
                                <span className="font-bold text-gray-700">Update Vitality Stats</span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-300" />
                            </button>
                            <button 
                              onClick={() => setProfileView('update-profile')}
                              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-3xl transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-sage-primary/10 group-hover:text-sage-primary transition-all"><User className="w-6 h-6" /></div>
                                <span className="font-bold text-gray-700">Update Profile</span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-300" />
                            </button>
                            <button 
                              onClick={() => setProfileView('privacy-security')}
                              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-3xl transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-sage-primary/10 group-hover:text-sage-primary transition-all"><Lock className="w-6 h-6" /></div>
                                <span className="font-bold text-gray-700">Privacy & Security</span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-300" />
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await signOut();
                                  setIsLoggedInUI(false);
                                  setView('welcome');
                                } catch (error) {
                                  console.error("Logout error", error);
                                }
                              }}
                              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-3xl transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-sage-primary/10 group-hover:text-sage-primary transition-all"><LogOut className="w-6 h-6" /></div>
                                <span className="font-bold text-gray-700">Logout</span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-300" />
                            </button>
                            <button 
                              onClick={handlePermanentAccountDeletion}
                              className="w-full flex items-center justify-between p-6 hover:bg-red-50 rounded-3xl transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-red-100 transition-all"><Trash2 className="w-6 h-6 text-red-500" /></div>
                                <span className="font-bold text-red-500">Delete My Account</span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-red-300" />
                            </button>
                          </div>
                        </div>

                        {/* Legal & Info Footer */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 px-12 pb-6">
                          {[
                            { label: 'Privacy Policy', type: 'privacy' },
                            { label: 'Terms of Service', type: 'terms' },
                            { label: 'Cookie Policy', type: 'cookie' },
                            { label: 'Help & Support', type: 'help' },
                            { label: 'About Us', type: 'about' },
                          ].map((link) => (
                            <button
                              key={link.label}
                              onClick={() => setIsLegalModalOpen({ type: link.type as any })}
                              className="text-xs font-medium text-gray-400 hover:text-sage-primary active:text-sage-accent transition-colors"
                            >
                              {link.label}
                            </button>
                          ))}
                        </div>

                        {/* Medical Disclaimer */}
                        <div className="px-12 pb-12 text-center">
                          <p className="text-[10px] text-gray-400 leading-relaxed max-w-2xl mx-auto italic">
                            Medical Disclaimer: AyurSync is a wellness platform and is not intended to diagnose, treat, or cure any medical condition. Always consult with a qualified healthcare professional before making changes to your diet, exercise, or health routine.
                          </p>
                        </div>
                          </>
                        ) : profileView === 'privacy-security' ? (
                          <PrivacySecurityView 
                            onBack={() => setProfileView('main')}
                            userEmail={user?.email || null}
                            onUpdateEmail={async (newEmail) => {
                              await updateProfileData({ email: newEmail });
                            }}
                            onUpdatePassword={async (current, newPass) => {
                              console.log('Password update requested', { current, newPass });
                            }}
                            onDownloadData={() => {
                              const data = JSON.stringify(healthData, null, 2);
                              const blob = new Blob([data], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'ayursync_health_data.json';
                              a.click();
                            }}
                          />
                        ) : (
                          <UpdateProfileView 
                            onBack={() => setProfileView('main')}
                            userData={{
                              ...user,
                              ...healthData,
                              displayName: healthData.name || user?.displayName || ''
                            }}
                            onSave={async (updatedData) => {
                              setHealthData(prev => ({
                                ...prev,
                                ...updatedData,
                                name: updatedData.displayName
                              }));
                              await updateProfileData(updatedData);
                              setProfileView('main');
                            }}
                          />
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'metric-detail' && (
                      <motion.div
                        key="view-metric-detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12 pt-8 md:pt-4"
                      >
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setActiveTab('home')}
                            className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <h2 className="text-3xl font-serif font-bold text-sage-primary">{activeMetric} Analysis</h2>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-[48px] p-12 shadow-sm space-y-8">
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <h3 className="text-xl font-bold text-gray-800">7-Day Historical Trend</h3>
                              <p className="text-sm text-gray-400">Detailed breakdown of your {activeMetric?.toLowerCase()} progress.</p>
                            </div>
                            <div className="px-4 py-2 bg-sage-light/30 text-sage-primary font-bold rounded-2xl text-xs uppercase tracking-widest">
                              Weekly View
                            </div>
                          </div>

                          <div className="h-96 w-full">
                            <Suspense fallback={<div className="h-full w-full bg-gray-50 animate-pulse rounded-[32px]" />}>
                              <VitalityChart 
                                activeMetric={activeMetric || ''}
                                getMetricData={getMetricData}
                                getMetricGoal={getMetricGoal}
                              />
                            </Suspense>
                          </div>
                        </div>

                        {/* AI Insight Card */}
                        {(() => {
                          const goal = getMetricGoal(activeMetric || '');
                          const isNegativeMetric = activeMetric === 'Blood Sugar' || activeMetric === 'Blood Pressure' || activeMetric === 'Heart Rate';
                          let value: number;
                          if (activeMetric === 'Blood Pressure') {
                            value = parseInt(String(healthData.vitality.bloodPressure).split('/')[0]) || 120;
                          } else {
                            const keyMap: Record<string, string> = {
                              'Steps': 'steps',
                              'Hydration': 'hydration',
                              'Oxygen': 'oxygen',
                              'Heart Rate': 'heartRate',
                              'Blood Sugar': 'bloodSugar'
                            };
                            value = healthData.vitality[keyMap[activeMetric || ''] as keyof typeof healthData.vitality] as number || 0;
                          }
                          const isSuccess = isNegativeMetric ? value <= goal : value >= goal;

                          return (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "p-10 rounded-[48px] border flex flex-col sm:flex-row gap-8 items-center",
                                isSuccess ? "bg-sage-light/20 border-sage-primary/20" : "bg-red-50 border-red-100"
                              )}
                            >
                              <div className={cn(
                                "w-20 h-20 rounded-[28px] flex items-center justify-center shrink-0 shadow-sm",
                                isSuccess ? "bg-sage-primary text-white" : "bg-red-500 text-white"
                              )}>
                                {isSuccess ? <Sparkles className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                              </div>
                              <div className="space-y-3 text-center sm:text-left">
                                <h4 className={cn(
                                  "text-xl font-bold",
                                  isSuccess ? "text-sage-primary" : "text-red-600"
                                )}>
                                  {isSuccess ? 'Vitality Fact' : 'Medical Warning'}
                                </h4>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                  {getAIInsight(activeMetric || '', value, goal)}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {activePage === 'profile' && (
                <SettingsPage 
                  onBack={() => setActivePage('dashboard')}
                  userData={{
                    ...user,
                    ...healthData,
                    name: healthData.name || user?.displayName || ''
                  }}
                  onLogout={async () => {
                    try {
                      await signOut();
                      setIsLoggedInUI(false);
                      setView('welcome');
                    } catch (error) {
                      console.error("Logout error", error);
                    }
                  }}
                  onUpdateProfile={() => {
                    setActivePage('dashboard');
                    setActiveTab('profile');
                    setProfileView('update-profile');
                  }}
                />
              )}
              {activePage === 'health-calendar' && <HealthCalendarView onBack={() => setActivePage('dashboard')} />}
              {activePage === 'meta-shred' && (
                <MetaShredShowcase 
                  onBack={() => {
                    setActivePage('dashboard');
                    setActiveTab('explorer');
                    setExploreView('protocols');
                  }} 
                  onStart={handleStartMetaShred}
                />
              )}
              {activePage === 'meta-shred-active' && (
                <MetaShredActiveZone onBack={() => setActivePage('dashboard')} />
              )}
            </main>
          </div>

              {/* Vitality Input Modal */}
              <AnimatePresence>
                {isVitalityModalOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsVitalityModalOpen(false)}
                      className="fixed inset-0 bg-black/20 backdrop-blur-md z-[60]"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[90vh] bg-white rounded-[48px] shadow-2xl z-[70] overflow-hidden flex flex-col"
                    >
                      <div className="p-10 space-y-8 overflow-y-auto">
                        <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-serif font-bold text-sage-primary">Update Vitality</h2>
                          <button onClick={() => setIsVitalityModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {[
                            { label: 'Steps', key: 'steps', icon: Activity, unit: 'steps' },
                            { label: 'Hydration', key: 'hydration', icon: Droplets, unit: 'ml' },
                            { label: 'Oxygen (SpO2)', key: 'oxygen', icon: Wind, unit: '%' },
                            { label: 'Heart Rate', key: 'heartRate', icon: Heart, unit: 'bpm' },
                            { label: 'Blood Sugar', key: 'bloodSugar', key2: 'bloodSugar', icon: Thermometer, unit: 'mg/dL' },
                          ].map((field) => (
                            <div key={field.key} className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-primary/40">
                                  <field.icon className="w-5 h-5" />
                                </div>
                                <input 
                                  type="number"
                                  value={healthData.vitality[field.key as keyof typeof healthData.vitality] as number}
                                  onChange={(e) => setHealthData({ 
                                    ...healthData, 
                                    vitality: { 
                                      ...healthData.vitality, 
                                      [field.key]: parseInt(e.target.value) || 0 
                                    } 
                                  })}
                                  className="w-full py-4 pl-12 pr-16 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sage-primary/20 outline-none transition-all font-bold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">{field.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => setIsVitalityModalOpen(false)}
                          className="w-full py-5 bg-sage-primary text-white rounded-[24px] font-bold text-lg shadow-xl shadow-sage-primary/20 hover:bg-sage-accent transition-all"
                        >
                          Sync Vitality Stats
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Delete Account Modal */}
              <AnimatePresence>
                {isDeleteModalOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
                      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-[32px] shadow-2xl z-[70] overflow-hidden flex flex-col"
                    >
                      <div className="p-8 space-y-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">Delete Account?</h2>
                        <p className="text-gray-600 leading-relaxed">
                          Are you sure you want to permanently delete your account? This action cannot be undone and will erase all your wellness data.
                        </p>
                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeletingAccount}
                            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={confirmAndDelete}
                            disabled={isDeletingAccount}
                            className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isDeletingAccount ? (
                              <>
                                <AyurSyncLoader size="small" />
                                Deleting...
                              </>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* SOS Modal */}
              <AnimatePresence>
                {isSosModalOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSosModalOpen(false)}
                      className="fixed inset-0 bg-red-500/20 backdrop-blur-xl z-[110]"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-[48px] shadow-2xl z-[120] overflow-hidden"
                    >
                      <div className="p-10 text-center space-y-8">
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/30 animate-pulse">
                          <ShieldAlert className="w-12 h-12 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-3xl font-serif font-bold text-red-600">SOS Triggered</h2>
                          <p className="text-gray-500">Emergency services have been notified.</p>
                        </div>
                        
                        <div className="bg-red-50 p-6 rounded-3xl space-y-4 text-left">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Ambulance Status</span>
                            <span className="font-bold text-red-600">Dispatched</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Emergency Contacts</span>
                            <span className="font-bold text-red-600">Notified</span>
                          </div>
                          <div className="pt-4 border-t border-red-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Vitals Sent</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white p-2 rounded-xl text-xs font-bold text-gray-700">BP: {healthData.vitality.bloodPressure}</div>
                              <div className="bg-white p-2 rounded-xl text-xs font-bold text-gray-700">HR: {healthData.vitality.heartRate} bpm</div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setIsSosModalOpen(false)}
                          className="w-full py-5 bg-gray-100 text-gray-600 rounded-[24px] font-bold hover:bg-gray-200 transition-all"
                        >
                          Cancel SOS
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Legal Modals */}
              <AnimatePresence>
                {isLegalModalOpen.type && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsLegalModalOpen({ type: null })}
                      className="fixed inset-0 bg-black/20 backdrop-blur-md z-[130]"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[80vh] bg-white rounded-[48px] shadow-2xl z-[140] overflow-hidden flex flex-col"
                    >
                      <div className="p-10 space-y-8 overflow-y-auto">
                        <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-serif font-bold text-sage-primary">
                            {isLegalModalOpen.type === 'privacy' && 'Privacy Policy'}
                            {isLegalModalOpen.type === 'terms' && 'Terms of Service'}
                            {isLegalModalOpen.type === 'cookie' && 'Cookie Policy'}
                            {isLegalModalOpen.type === 'help' && 'Help & Support'}
                            {isLegalModalOpen.type === 'about' && 'About Us'}
                          </h2>
                          <button onClick={() => setIsLegalModalOpen({ type: null })} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                          </button>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
                          {isLegalModalOpen.type === 'privacy' && (
                            <div className="space-y-4">
                              <p className="font-bold text-sage-primary">Effective Date: 16/03/2026</p>
                              <p>At AyurSync, we prioritize your privacy. This policy outlines how we handle your health data with the utmost care and security.</p>
                              <h4 className="font-bold text-gray-800">1. Data Storage & Security</h4>
                              <p>All user data is stored securely using Firebase (a Google Cloud platform). We employ industry-standard encryption (AES-256) to protect your sensitive health metrics and personal information.</p>
                              <h4 className="font-bold text-gray-800">2. Non-Commercial Use</h4>
                              <p>AyurSync is committed to a non-commercial data model. We do NOT sell, trade, or rent your personal health data to third-party advertisers or data brokers. Your information is used solely to provide personalized Ayurvedic insights and improve your health journey.</p>
                              <h4 className="font-bold text-gray-800">3. Data Ownership</h4>
                              <p>You retain full ownership of your data. You can request a data export or permanent deletion of your account and all associated records at any time through the Account Management section.</p>
                            </div>
                          )}

                          {isLegalModalOpen.type === 'terms' && (
                            <div className="space-y-4">
                              <h4 className="font-bold text-gray-800">1. Eligibility</h4>
                              <p>By using AyurSync, you confirm that you are at least 13 years of age. Users under 18 should use the platform under parental supervision.</p>
                              <h4 className="font-bold text-gray-800">2. Medical Disclaimer</h4>
                              <p className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 italic">
                                AyurSync is a wellness platform and is not intended to diagnose, treat, or cure any medical condition. The insights provided are based on Ayurvedic principles and modern data analysis but should NOT replace professional medical advice. Always consult with a qualified healthcare professional before making changes to your health routine.
                              </p>
                              <h4 className="font-bold text-gray-800">3. User Responsibility</h4>
                              <p>Users are responsible for the accuracy of the data they input. AyurSync is not liable for any health outcomes resulting from the use of the platform's suggestions.</p>
                            </div>
                          )}

                          {isLegalModalOpen.type === 'about' && (
                            <div className="space-y-6">
                              <div className="bg-sage-light/10 p-8 rounded-[32px] border border-sage-light/20 text-center space-y-6">
                                <div className="space-y-3">
                                  <h3 className="text-2xl font-serif font-bold text-sage-primary">Our Vision</h3>
                                  <p className="text-lg font-medium text-gray-800 leading-tight">
                                    AyurSync: Wellness Guided by Ancient Wisdom, Powered by Modern Intelligence.
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                                  <h4 className="font-bold text-sage-primary">Ancient Wisdom</h4>
                                  <p className="text-sm text-gray-600">We draw from thousands of years of Ayurvedic tradition to understand the unique constitution (Dosha) of every individual.</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                                  <h4 className="font-bold text-sage-primary">Modern Intelligence</h4>
                                  <p className="text-sm text-gray-600">Our AI-driven platform analyzes real-time health data to provide actionable, personalized wellness recommendations.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {isLegalModalOpen.type === 'cookie' && (
                            <div className="space-y-6">
                              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                                <h4 className="text-lg font-bold text-sage-primary">How We Use Cookies</h4>
                                <p className="text-sm leading-relaxed">
                                  AyurSync uses cookies and similar technologies to enhance your experience, ensure security, and analyze how our platform is used.
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <Lock className="w-5 h-5 text-sage-primary" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-gray-800 text-sm">Essential Cookies</h5>
                                    <p className="text-xs text-gray-500">Necessary for the website to function, such as keeping you logged in and secure.</p>
                                  </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <Activity className="w-5 h-5 text-sage-primary" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-gray-800 text-sm">Performance Cookies</h5>
                                    <p className="text-xs text-gray-500">Help us understand how visitors interact with the app by collecting information anonymously.</p>
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-400 text-center italic">
                                You can manage your cookie preferences through your browser settings at any time.
                              </p>
                            </div>
                          )}

                          {isLegalModalOpen.type === 'help' && (
                            <div className="space-y-6">
                              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                                <h4 className="text-lg font-bold text-sage-primary">Get in Touch</h4>
                                <p className="text-sm leading-relaxed">
                                  Our support team is dedicated to helping you achieve your wellness goals. Whether you have a technical issue or a question about your Ayurvedic profile, we're here for you.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                <a 
                                  href="mailto:ayursync.ai.help@gmail.com" 
                                  className="p-6 bg-gray-50 rounded-[24px] flex items-center justify-between group hover:bg-sage-light/10 transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                      <Mail className="w-6 h-6 text-sage-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Support</p>
                                      <p className="font-bold text-gray-700">ayursync.ai.help@gmail.com</p>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-sage-primary transition-colors" />
                                </a>

                                <a 
                                  href="tel:+9165459791" 
                                  className="p-6 bg-gray-50 rounded-[24px] flex items-center justify-between group hover:bg-sage-light/10 transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                      <Phone className="w-6 h-6 text-sage-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Call Us</p>
                                      <p className="font-bold text-gray-700">+91 65459791</p>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-sage-primary transition-colors" />
                                </a>

                                <a 
                                  href="https://wa.me/9165459791" 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-6 bg-gray-50 rounded-[24px] flex items-center justify-between group hover:bg-sage-light/10 transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                      <MessageCircle className="w-6 h-6 text-sage-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">WhatsApp Support</p>
                                      <p className="font-bold text-gray-700">+91 65459791</p>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-sage-primary transition-colors" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => setIsLegalModalOpen({ type: null })}
                          className="w-full py-5 bg-sage-primary text-white rounded-[24px] font-bold text-lg shadow-xl shadow-sage-primary/20 hover:bg-sage-accent transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Journey Builder Modal */}
              <AnimatePresence>
                {isJourneyBuilderOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsJourneyBuilderOpen(false)}
                      className="fixed inset-0 bg-black/20 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[90vh] bg-white rounded-[48px] shadow-2xl z-[160] overflow-hidden flex flex-col"
                    >
                      <div className="p-10 space-y-8 overflow-y-auto">
                        <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-serif font-bold text-sage-primary">Create Custom Journey</h2>
                          <button onClick={() => setIsJourneyBuilderOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                          </button>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Name Your Goal</label>
                            <input 
                              type="text"
                              value={customJourney.name}
                              onChange={(e) => setCustomJourney({ ...customJourney, name: e.target.value })}
                              placeholder="e.g. Marathon Prep"
                              className="w-full py-4 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-sage-primary/20 outline-none transition-all font-bold"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Timeline</label>
                            <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
                              {[10, 15, 30].map((days) => (
                                <button
                                  key={days}
                                  onClick={() => setCustomJourney({ ...customJourney, duration: days })}
                                  className={cn(
                                    "flex-1 py-3 rounded-xl font-bold transition-all",
                                    customJourney.duration === days 
                                      ? "bg-white text-sage-primary shadow-sm" 
                                      : "text-gray-400 hover:text-gray-600"
                                  )}
                                >
                                  {days} Days
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Choose Vitals to Monitor</label>
                            <div className="grid grid-cols-2 gap-3">
                              {['Steps', 'Heart Rate', 'Hydration', 'Sleep', 'Stress'].map((vital) => (
                                <button
                                  key={vital}
                                  onClick={() => {
                                    const vitals = customJourney.vitals.includes(vital)
                                      ? customJourney.vitals.filter(v => v !== vital)
                                      : [...customJourney.vitals, vital];
                                    setCustomJourney({ ...customJourney, vitals });
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                                    customJourney.vitals.includes(vital)
                                      ? "bg-sage-light/10 border-sage-primary/20 text-sage-primary"
                                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                  )}
                                >
                                  <div className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center",
                                    customJourney.vitals.includes(vital)
                                      ? "bg-sage-primary border-sage-primary text-white"
                                      : "border-gray-200"
                                  )}>
                                    {customJourney.vitals.includes(vital) && <Check className="w-3 h-3" />}
                                  </div>
                                  <span className="font-bold text-sm">{vital}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            if (!customJourney.name) return;
                            const newJourney: Journey = {
                              id: Date.now().toString(),
                              title: customJourney.name,
                              duration: customJourney.duration,
                              currentDay: 1,
                              vitals: customJourney.vitals,
                              status: 'active',
                              progress: Array(customJourney.duration).fill(-1),
                              category: 'Weight'
                            };
                            setActiveJourneys([...activeJourneys, newJourney]);
                            setIsJourneyBuilderOpen(false);
                            setCustomJourney({ name: '', duration: 15, vitals: [] });
                            
                            // AI Confirmation
                            setMessages(prev => ({
                              ...prev,
                              nutrition: [...(prev.nutrition || []), {
                                id: Date.now().toString(),
                                sender: 'ai',
                                text: `Great choice! I will now monitor these specific vitals for the next ${customJourney.duration} days to ensure you hit your goal.`,
                                timestamp: new Date()
                              }]
                            }));
                            setActiveTab('consult');
                            setSelectedSpecialist(specialists.find(s => s.id === 'nutrition') || null);
                            setIsChatOpen(true);
                          }}
                          className="w-full py-5 bg-sage-primary text-white rounded-[24px] font-bold text-lg shadow-xl shadow-sage-primary/20 hover:bg-sage-accent transition-all"
                        >
                          Start Custom Journey
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {view === 'vitality-breakdown' && (
            <motion.div
              key="vitality-breakdown"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto p-8 pb-32"
            >
              {/* Header */}
              <div className="max-w-4xl mx-auto flex items-center gap-6 mb-12">
                <button 
                  onClick={() => setView('dashboard')}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-4xl font-serif font-bold text-sage-primary">Vitality Breakdown</h1>
              </div>

              {/* Status Header */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className={cn(
                  "p-8 rounded-[40px] shadow-sm flex items-center gap-6",
                  vitalityScore >= 85 ? "bg-green-50 border border-green-100" :
                  vitalityScore >= 70 ? "bg-amber-50 border border-amber-100" :
                  "bg-red-50 border border-red-100"
                )}>
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shrink-0",
                    vitalityScore >= 85 ? "bg-green-100 text-green-600" :
                    vitalityScore >= 70 ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {vitalityScore >= 85 ? "Optimal Vitality" :
                       vitalityScore >= 70 ? "Good Vitality" :
                       "Needs Attention"}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {vitalityScore >= 85 ? "Your body is performing at its peak. Keep up the great work!" :
                       vitalityScore >= 70 ? "You're doing well, but there's room for improvement in some areas." :
                       "Your vitality is low. Focus on the insights below to improve your health."}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3D Donut Chart */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center relative">
                  <h3 className="text-xl font-bold text-gray-800 mb-8 self-start">Vitality Factors</h3>
                  <div className="w-full max-w-md aspect-square relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Steps', value: Math.min(healthData.vitality.steps / 10000 * 100, 100), color: '#10b981' },
                            { name: 'Glucose', value: Math.max(0, 100 - Math.abs(healthData.vitality.bloodSugar - 100)), color: '#3b82f6' },
                            { name: 'Hydration', value: Math.min(healthData.vitality.hydration / 3000 * 100, 100), color: '#0ea5e9' },
                            { name: 'Sleep', value: Math.min((healthData.vitality.sleep?.total || 0) / 8 * 100, 100), color: '#8b5cf6' },
                            { name: 'Stress', value: Math.max(0, 100 - healthData.vitality.stress), color: '#f59e0b' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius="60%"
                          outerRadius="80%"
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {[
                            { name: 'Steps', value: Math.min(healthData.vitality.steps / 10000 * 100, 100), color: '#10b981' },
                            { name: 'Glucose', value: Math.max(0, 100 - Math.abs(healthData.vitality.bloodSugar - 100)), color: '#3b82f6' },
                            { name: 'Hydration', value: Math.min(healthData.vitality.hydration / 3000 * 100, 100), color: '#0ea5e9' },
                            { name: 'Sleep', value: Math.min((healthData.vitality.sleep?.total || 0) / 8 * 100, 100), color: '#8b5cf6' },
                            { name: 'Stress', value: Math.max(0, 100 - healthData.vitality.stress), color: '#f59e0b' }
                          ].map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              style={{
                                filter: entry.value >= 80 ? `drop-shadow(0 0 8px ${entry.color}80)` : 'none',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-5xl font-bold text-gray-800">{vitalityScore}%</span>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Total Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Key Insights</h3>
                <div className="grid gap-4">
                  {[
                    { 
                      label: 'Steps', 
                      impact: healthData.vitality.steps < 10000 ? `-${Math.round((1 - healthData.vitality.steps/10000) * 10)}%` : '+10%',
                      text: healthData.vitality.steps < 10000 
                        ? `You are ${10000 - healthData.vitality.steps} steps away from your daily goal. A short walk could boost your score.`
                        : "Excellent step count! Your cardiovascular system is thanking you.",
                      type: healthData.vitality.steps < 10000 ? 'negative' : 'positive'
                    },
                    { 
                      label: 'Glucose', 
                      impact: healthData.vitality.bloodSugar > 110 ? '-15%' : '+5%',
                      text: healthData.vitality.bloodSugar > 110
                        ? "Your glucose levels are slightly elevated. Consider a low-carb meal next."
                        : "Glucose levels are stable and within the optimal range.",
                      type: healthData.vitality.bloodSugar > 110 ? 'negative' : 'positive'
                    },
                    { 
                      label: 'Hydration', 
                      impact: healthData.vitality.hydration < 3000 ? `-${Math.round((1 - healthData.vitality.hydration/3000) * 10)}%` : '+10%',
                      text: healthData.vitality.hydration < 3000
                        ? `Drink ${3000 - healthData.vitality.hydration}ml more water to optimize your cellular hydration.`
                        : "Hydration levels are perfect. Your body is well-flushed and energized.",
                      type: healthData.vitality.hydration < 3000 ? 'negative' : 'positive'
                    }
                  ].map((insight) => (
                    <div key={insight.label} className="flex gap-4 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold",
                        insight.type === 'positive' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {insight.impact}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">{insight.label}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{insight.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
        {/* Bluetooth Instructions Modal */}
        <AnimatePresence>
          {showBluetoothInstructions && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBluetoothInstructions(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white rounded-[40px] shadow-2xl z-[101] p-10 space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-sage-primary/10 text-sage-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bluetooth className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-sage-primary">Pairing Instructions</h3>
                  <p className="text-sm text-gray-500">Follow these steps to sync your device.</p>
                </div>

                <div className="space-y-6">
                  {[
                    { step: 1, text: "Enable Bluetooth on your Tablet/Phone." },
                    { step: 2, text: "Put your Fitband in 'Pairing Mode'." },
                    { step: 3, text: "Look for the browser pop-up in the top-left corner." }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className="w-6 h-6 bg-sage-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={handleSearchDevices}
                    className="w-full py-4 bg-sage-primary text-white rounded-2xl font-bold shadow-lg shadow-sage-primary/20 hover:bg-sage-accent transition-all"
                  >
                    Start Scanning
                  </button>
                  <button 
                    onClick={() => setShowBluetoothInstructions(false)}
                    className="w-full py-4 text-gray-400 font-bold text-sm hover:underline"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-24 left-1/2 px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-full shadow-2xl z-[100]"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isGuidedResetActive && (
            <GuidedReset onClose={() => setIsGuidedResetActive(false)} />
          )}
        </AnimatePresence>

        {/* Mira Notification */}
        <AnimatePresence>
          {showMiraNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -50, x: 50 }}
              className="fixed top-6 right-6 z-[100] max-w-sm bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden"
            >
              <div className="p-4 flex gap-4">
                <img 
                  src={specialists.find(s => s.id === 'behavioral')?.avatar} 
                  alt="Dr. Mira" 
                  className="w-12 h-12 rounded-full object-cover object-top border-2 border-purple-100 shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900">Dr. Mira</h4>
                    <button onClick={() => setShowMiraNotification(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    I notice your Vata is a little high right now. Would you like a 1-minute guided breath exercise to reset?
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowMiraNotification(false);
                        setIsGuidedResetActive(true);
                      }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full text-sm font-bold transition-colors"
                    >
                      Start Reset
                    </button>
                    <button 
                      onClick={() => setShowMiraNotification(false)}
                      className="px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium transition-colors"
                    >
                      Not Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isNotificationCenterOpen && (
            <NotificationCenter
              onClose={() => setIsNotificationCenterOpen(false)}
              notifications={notifications}
              onComplete={(id) => {
                if (id === 'routine-checkup') {
                  setIsNotificationCenterOpen(false);
                  setIsQuickPulseOpen(true);
                } else if (id === 'high-bp-alert') {
                  setIsNotificationCenterOpen(false);
                  setActiveIntervention('bp');
                  setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'completed' } : n));
                } else {
                  setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'completed' } : n));
                }
              }}
              onDelete={(id) => {
                setNotifications(prev => prev.filter(n => n.id !== id));
              }}
              onClearAll={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              onNavigate={(id) => {
                setIsNotificationCenterOpen(false);
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                if (id === 'routine-checkup') {
                  setActiveTab('metric-detail');
                } else if (id.startsWith('reminder-') || id.startsWith('notif-event-')) {
                  setActiveTab('health-calendar');
                } else if (id === 'high-bp-alert') {
                  setActiveIntervention('bp');
                } else if (id === 'notif-lunar-cycle') {
                  setActiveTab('health-calendar');
                }
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isQuickPulseOpen && (
            <QuickPulse
              onClose={() => setIsQuickPulseOpen(false)}
              onComplete={(updates) => {
                setIsQuickPulseOpen(false);
                completeRoutineCheckup(updates);
              }}
              pollingState={pollingState}
              healthData={healthData}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {activeIntervention && (
            <InterventionModule
              type={activeIntervention}
              onClose={() => setActiveIntervention(null)}
              onStabilized={handleInterventionComplete}
              healthData={healthData}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isQuestionnaireOpen && (
            <HealthQuestionnaire
              initialData={questionnaireData}
              onComplete={(data) => {
                setQuestionnaireData(data);
                setIsQuestionnaireOpen(false);
                
                // Update sleep history if daily sleep was logged
                if (data.daily_sleep) {
                  const today = new Date();
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  
                  const sleepVal = parseFloat(data.daily_sleep);
                  const newRecord: SleepRecord = {
                    day: dayNames[today.getDay()],
                    date: `${monthNames[today.getMonth()]} ${today.getDate().toString().padStart(2, '0')}`,
                    total: sleepVal,
                    deep: parseFloat((sleepVal * 0.3).toFixed(1)), // Estimated
                    rem: parseFloat((sleepVal * 0.25).toFixed(1)), // Estimated
                    bedtime: data.sleep_times?.val1 || '11:00 PM',
                    wakeup: data.sleep_times?.val2 || '7:00 AM',
                    quality: Math.min(100, Math.round((sleepVal / 8) * 100))
                  };
                  
                  setHealthData(prev => {
                    const history = prev.sleepHistory || [];
                    // Replace today's record if it exists, or add new one
                    const existingIndex = history.findIndex(r => r.day === newRecord.day);
                    let newHistory;
                    if (existingIndex !== -1) {
                      newHistory = [...history];
                      newHistory[existingIndex] = newRecord;
                    } else {
                      newHistory = [...history, newRecord].slice(-7); // Keep last 7 days
                    }
                    
                    return {
                      ...prev,
                      lifestyleFocus: data.primary_goal || prev.lifestyleFocus,
                      sleepHistory: newHistory,
                      vitality: {
                        ...prev.vitality,
                        sleep: {
                          total: newRecord.total,
                          deep: newRecord.deep,
                          rem: newRecord.rem
                        }
                      }
                    };
                  });
                } else {
                  setHealthData(prev => ({
                    ...prev,
                    lifestyleFocus: data.primary_goal || prev.lifestyleFocus,
                  }));
                }
              }}
              onCancel={() => setIsQuestionnaireOpen(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {previewVideoId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <div className="w-full max-w-4xl aspect-video bg-black rounded-[32px] overflow-hidden relative shadow-2xl">
                <button 
                  onClick={() => setPreviewVideoId(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideoId}?autoplay=1&modestbranding=1&rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
