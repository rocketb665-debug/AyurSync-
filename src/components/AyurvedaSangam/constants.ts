import { LucideIcon, BookOpen, Stethoscope, Sparkles, HeartPulse, Baby, Brain, Leaf, Sprout } from 'lucide-react';

export interface Rishi {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  icon: LucideIcon;
  specialty: string;
}

export const RISHIS: Rishi[] = [
  {
    id: 'charaka',
    name: 'Maharishi Charaka',
    title: 'The Great Physician',
    description: 'Specialist in internal medicine (Kayachikitsa) and dietary wisdom. Focuses on the root cause and holistic diet.',
    color: 'bg-amber-50 text-amber-900',
    borderColor: 'border-amber-200',
    icon: BookOpen,
    specialty: 'Diet & Internal Medicine'
  },
  {
    id: 'sushruta',
    name: 'Maharishi Sushruta',
    title: 'Father of Surgery',
    description: 'Clinical, precise, and practical. Specialist in anatomy and surgical procedures (Shalya Tantra).',
    color: 'bg-rose-50 text-rose-900',
    borderColor: 'border-rose-200',
    icon: Stethoscope,
    specialty: 'Clinical & Anatomy'
  },
  {
    id: 'dhanvantari',
    name: 'Lord Dhanvantari',
    title: 'Divine Healer',
    description: 'The supreme source of healing. Provides divine, peaceful, and all-encompassing wellness guidance.',
    color: 'bg-sky-50 text-sky-900',
    borderColor: 'border-sky-200',
    icon: Sparkles,
    specialty: 'Divine Healing'
  },
  {
    id: 'vagbhata',
    name: 'Maharishi Vagbhata',
    title: 'The Synthesizer',
    description: 'Practical and concise. Bridges the ancient texts of Charaka and Sushruta for modern daily application.',
    color: 'bg-emerald-50 text-emerald-900',
    borderColor: 'border-emerald-200',
    icon: HeartPulse,
    specialty: 'Daily Practice (Dinacharya)'
  },
  {
    id: 'kashyapa',
    name: 'Maharishi Kashyapa',
    title: 'Protector of Generations',
    description: 'Caring and nurturing. Specialist in pediatrics (Kaumarabhritya) and healthy growth.',
    color: 'bg-orange-50 text-orange-900',
    borderColor: 'border-orange-200',
    icon: Baby,
    specialty: 'Growth & Pediatrics'
  },
  {
    id: 'patanjali',
    name: 'Maharishi Patanjali',
    title: 'Master of Mind',
    description: 'Specialist in the connection between mind, breath, and body. Focuses on mental clarity and Yoga.',
    color: 'bg-violet-50 text-violet-900',
    borderColor: 'border-violet-200',
    icon: Brain,
    specialty: 'Mind & Yoga'
  },
  {
    id: 'bhrigu',
    name: 'Maharishi Bhrigu',
    title: 'The Seer',
    description: 'Specialist in cosmic rhythms and their impact on human biology. Expert in life cycles.',
    color: 'bg-teal-50 text-teal-900',
    borderColor: 'border-teal-200',
    icon: Sprout,
    specialty: 'Life Cycles'
  },
  {
    id: 'agastya',
    name: 'Maharishi Agastya',
    title: 'Southern Sage',
    description: 'Bridges the Siddha and Ayurveda traditions. Expert in herbal formulations and pulse reading.',
    color: 'bg-sage-50 text-sage-900',
    borderColor: 'border-sage-200',
    icon: Leaf,
    specialty: 'Herbal Alchemy'
  }
];
