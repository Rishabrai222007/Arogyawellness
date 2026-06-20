import React, { useState, useEffect } from 'react';
import { 
  Heart, Phone, User, Mail, Calendar, Weight, Ruler, ChevronDown, ChevronLeft, ChevronRight,
  Sparkles, ShieldCheck, CheckCircle2, Users, Check, Trash2, Clock, 
  ArrowRight, Lock, MessageCircle, AlertCircle, TrendingDown, 
  CheckSquare, Award, Flame, Settings, ClipboardList, Activity, MapPin, 
  BookOpen, Smile, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HEALTH_CONDITIONS, HEAR_ABOUT_SOURCES } from './data';
import { ConsultationLead } from './types';

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const formItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 14
    }
  }
};

export default function App() {
  // Database state (retrieved from and saved to localStorage)
  const [submissions, setSubmissions] = useState<ConsultationLead[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load submissions on mount
  useEffect(() => {
    const saved = localStorage.getItem('arogya_wellness_leads');
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing leads', e);
      }
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    age: '',
    emailAddress: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    goal: '' as 'lose_weight' | 'gain_weight' | 'maintain_weight' | '',
    currentWeight: '',
    height: '',
    healthConditions: 'none',
    healthConcerns: '',
    howHeard: '',
    agreed: false
  });

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<ConsultationLead | null>(null);

  // Interactive schedule slot choice in success modal
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [currentCalMonth, setCurrentCalMonth] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  const getAvailableTimeSlots = (dateObj: Date) => {
    const isSun = dateObj.getDay() === 0;
    const startHour = isSun ? 4 : 6;
    const endHour = 20; // 8:00 PM
    
    const slots: string[] = [];
    for (let hr = startHour; hr < endHour; hr++) {
      const formattedStart = hr === 12 
        ? '12:00 PM' 
        : hr > 12 
          ? `${String(hr - 12).padStart(2, '0')}:00 PM` 
          : `${String(hr).padStart(2, '0')}:00 AM`;
          
      const nextHr = hr + 1;
      const formattedEnd = nextHr === 12 
        ? '12:00 PM' 
        : nextHr > 12 
          ? `${String(nextHr - 12).padStart(2, '0')}:00 PM` 
          : `${String(nextHr).padStart(2, '0')}:00 AM`;
          
      slots.push(`${formattedStart} - ${formattedEnd}`);
    }
    return slots;
  };

  // Automatically update the readable date representation string and check hour slots
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setSelectedDate(calendarDate.toLocaleDateString('en-US', options));
  }, [calendarDate]);

  // Sync / validate selected time slot with the current date rules
  useEffect(() => {
    const slots = getAvailableTimeSlots(calendarDate);
    if (!slots.includes(selectedTimeSlot)) {
      const midday = slots.find(s => s.startsWith('10:00 AM') || s.startsWith('11:00 AM')) || slots[0];
      setSelectedTimeSlot(midday);
    }
  }, [calendarDate]);

  // Calculated Real-Time Metrics (BMI Tracker)
  const [liveBmi, setLiveBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');

  // Interactive Live Calorie & Metabolic Age Calculator State
  const [calcWeight, setCalcWeight] = useState('70');
  const [calcHeight, setCalcHeight] = useState('172');
  const [calcAge, setCalcAge] = useState('28');
  const [calcGender, setCalcGender] = useState<'male' | 'female'>('male');
  const [calcActivity, setCalcActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'extreme'>('moderate');
  const [calcGoal, setCalcGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  // Daily Offline Water Hydration Tracker
  const [waterCups, setWaterCups] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('arogya_water_cups');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleAddWater = () => {
    if (waterCups < 16) {
      const next = waterCups + 1;
      setWaterCups(next);
      localStorage.setItem('arogya_water_cups', String(next));
    }
  };

  const handleResetWater = () => {
    setWaterCups(0);
    localStorage.setItem('arogya_water_cups', '0');
  };

  // Interactive Programs Tab State
  const [activeProgramTab, setActiveProgramTab] = useState<'weight_management' | 'pcos_pcod' | 'thyroid' | 'diabetes'>('weight_management');

  // FAQ Expanded index state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const weight = parseFloat(formData.currentWeight);
    const heightCm = parseFloat(formData.height);
    if (!isNaN(weight) && !isNaN(heightCm) && heightCm > 0) {
      const heightM = heightCm / 100;
      const computedBmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
      setLiveBmi(computedBmi);

      if (computedBmi < 18.5) {
        setBmiCategory('Underweight');
      } else if (computedBmi >= 18.5 && computedBmi < 25) {
        setBmiCategory('Ideal / Normal Weight');
      } else if (computedBmi >= 25 && computedBmi < 30) {
        setBmiCategory('Overweight');
      } else {
        setBmiCategory('Obese Class');
      }
    } else {
      setLiveBmi(null);
      setBmiCategory('');
    }
  }, [formData.currentWeight, formData.height]);

  // Handle Form Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on interact
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle goals button grid selection
  const handleSelectGoal = (goalType: 'lose_weight' | 'gain_weight' | 'maintain_weight') => {
    setFormData(prev => ({ ...prev, goal: goalType }));
    if (errors.goal) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated['goal'];
        return updated;
      });
    }
  };

  // Handle Checkbox Change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, agreed: e.target.checked }));
    if (errors.agreed) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated['agreed'];
        return updated;
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim().replace(/[-\s]/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Enter a realistic age';
    }
    if (!formData.gender) newErrors.gender = 'Gender select is required';
    if (!formData.goal) newErrors.goal = 'Please select your wellness goal';
    if (!formData.agreed) newErrors.agreed = 'You must agree to join nutrition analysis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top of form or focus
      const formEl = document.getElementById('consultation-form');
      formEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Set submitting spinner
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedLead: ConsultationLead = {
        id: 'L-' + Math.floor(100000 + Math.random() * 900000),
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        age: formData.age,
        emailAddress: formData.emailAddress || 'Not provided',
        gender: formData.gender as any,
        goal: formData.goal as any,
        currentWeight: formData.currentWeight || 'N/A',
        height: formData.height || 'N/A',
        healthConditions: formData.healthConditions,
        healthConcerns: formData.healthConcerns || 'None specified',
        howHeard: formData.howHeard || 'Direct search',
        agreed: formData.agreed,
        createdAt: new Date().toLocaleString(),
        bmi: liveBmi || undefined
      };

      // Save to React State and LocalStorage
      const updatedSubmissions = [generatedLead, ...submissions];
      setSubmissions(updatedSubmissions);
      localStorage.setItem('arogya_wellness_leads', JSON.stringify(updatedSubmissions));

      setSubmittedLead(generatedLead);
      setIsSubmitting(false);
      setShowSuccessModal(true);

      // Clean the form
      setFormData({
        fullName: '',
        mobileNumber: '',
        age: '',
        emailAddress: '',
        gender: '',
        goal: '',
        currentWeight: '',
        height: '',
        healthConditions: 'none',
        healthConcerns: '',
        howHeard: '',
        agreed: false
      });
      setLiveBmi(null);
      setBmiCategory('');
    }, 900);
  };

  // Quick Action: Delete Submission
  const handleDeleteSubmission = (id: string) => {
    const updated = submissions.filter(s => s.id !== id);
    setSubmissions(updated);
    localStorage.setItem('arogya_wellness_leads', JSON.stringify(updated));
  };

  // Clear Database
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear the logs?')) {
      setSubmissions([]);
      localStorage.removeItem('arogya_wellness_leads');
    }
  };

  // --- INLINE COMPUTATIONS FOR INTERACTIVE METABOLIC BMR & CALORIES CALCULATOR ---
  const cw = parseFloat(calcWeight) || 0;
  const ch = parseFloat(calcHeight) || 0;
  const ca = parseFloat(calcAge) || 0;

  let computedBmrVal = 0;
  if (cw > 0 && ch > 0 && ca > 0) {
    if (calcGender === 'male') {
      computedBmrVal = Math.round(10 * cw + 6.25 * ch - 5 * ca + 5);
    } else {
      computedBmrVal = Math.round(10 * cw + 6.25 * ch - 5 * ca - 161);
    }
  }

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  };

  const computedTdeeVal = Math.round(computedBmrVal * multipliers[calcActivity]);

  let finalTargetCalories = computedTdeeVal;
  if (calcGoal === 'lose') {
    finalTargetCalories = Math.max(1200, Math.round(computedTdeeVal - 500));
  } else if (calcGoal === 'gain') {
    finalTargetCalories = Math.round(computedTdeeVal + 350);
  }

  // Grams recommendation: Protein 1.8g per kg, fats 0.85g per kg, remainder carbs
  const protGrams = Math.round(cw * 1.8);
  const fatGrams = Math.round(cw * 0.85);
  const protCalories = protGrams * 4;
  const fatCalories = fatGrams * 9;
  const carbCalories = Math.max(200, finalTargetCalories - (protCalories + fatCalories));
  const carbGrams = Math.round(carbCalories / 4);

  // Metabolic Age estimator:
  let estMetabolicAge = ca;
  if (cw > 0 && ch > 0 && ca > 0) {
    const hM = ch / 100;
    const bmiVal = cw / (hM * hM);
    let shift = 0;
    if (bmiVal > 24.9) {
      shift += (bmiVal - 24.9) * 0.55;
    } else if (bmiVal < 18.5) {
      shift += (18.5 - bmiVal) * 0.35;
    } else {
      shift -= 1.5;
    }
    if (calcActivity === 'sedentary') {
      shift += 2.2;
    } else if (calcActivity === 'active') {
      shift -= 1.8;
    } else if (calcActivity === 'extreme') {
      shift -= 3.2;
    }
    estMetabolicAge = Math.max(18, Math.round(ca + shift));
  }

  // Quick Action: Apply values to registration state
  const handleApplyCalculatorToForm = () => {
    setFormData(prev => ({
      ...prev,
      currentWeight: calcWeight,
      height: calcHeight,
      age: calcAge,
      gender: calcGender,
      goal: calcGoal === 'lose' ? 'lose_weight' : calcGoal === 'gain' ? 'gain_weight' : 'maintain_weight'
    }));
    setShowAppliedToast(true);
    setTimeout(() => {
      setShowAppliedToast(false);
    }, 4500);

    // Scroll smoothly to form
    const el = document.getElementById('consultation-form');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-[#f7fcf9] selection:bg-brand-medium selection:text-white relative overflow-x-hidden">
      
      {/* 🔮 BACKGROUND GLOWING ORBS FOR PREMIUM GLASS EFFECT */}
      <div className="absolute top-[8%] left-[-10%] w-[550px] h-[550px] bg-emerald-200/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[25%] right-[-5%] w-[450px] h-[450px] bg-orange-200/20 rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-[50%] left-[25%] w-[600px] h-[600px] bg-teal-200/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-150/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ⚠️ TOP NOTIFICATION BAR */}
      <div className="bg-brand-dark/95 backdrop-blur-xs text-emerald-100 text-xs py-2 px-4 text-center border-b border-emerald-900/60 flex justify-center items-center gap-1.5 z-40 relative">
        <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse shrink-0" />
        <span>Get free access to our elite calorie and metabolic age calculator on booking!</span>
        <button 
          onClick={() => setIsAdminOpen(true)}
          className="ml-3 underline hover:text-white flex items-center gap-1.5 font-semibold text-[11px] bg-brand-medium/50 hover:bg-brand-medium/70 px-2.5 py-0.5 rounded-full transition-all cursor-pointer"
        >
          <ClipboardList className="w-3 h-3" /> View Leads Log ({submissions.length})
        </button>
      </div>

      {/* 🟢 GLASS HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md shadow-xs border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-xs border border-emerald-250/30">
              <div className="relative">
                <Heart className="w-5 h-5 text-brand-orange fill-brand-orange" />
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-brand-medium rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-xl tracking-tight text-brand-dark">AROGYA</span>
                <span className="font-display font-semibold text-lg text-brand-orange tracking-wide">WELLNESS</span>
              </div>
              <p className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase -mt-1 block">Nutrition • Fitness • Healthy Lifestyle</p>
            </div>
          </div>

          {/* DESKTOP LINKS */}
          <nav className="hidden lg:flex items-center gap-8 text-stone-600 font-medium text-sm">
            <a href="#home" className="text-brand-medium hover:text-brand-dark transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-brand-medium/80">Home</a>
            <a href="#about" className="hover:text-brand-medium transition-colors">About Us</a>
            <a href="#services" className="hover:text-brand-medium transition-colors">Services</a>
            <a href="#programs" className="hover:text-brand-medium transition-colors">Programs</a>
            <a href="#contact" className="hover:text-brand-medium transition-colors">Contact Us</a>
          </nav>

          {/* PHONE ACTION */}
          <div className="flex items-center gap-3">
            <a 
              href="tel:+917674856208" 
              className="flex items-center gap-2 px-4.5 py-2.5 bg-brand-dark hover:bg-brand-medium text-white rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-emerald-900/10 group cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Call Expert: </span>
              <span className="font-mono text-emerald-100">7674856208</span>
            </a>
          </div>

        </div>
      </header>

      {/* 🚀 MAIN CONTENT HERO CONTAINER */}
      <main className="flex-grow">
        <section id="home" className="py-10 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: TITLE & HIGHLIGHTS */}
            <div className="lg:col-span-6 flex flex-col justify-between self-stretch">
              <div>
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur-md border border-white/50 rounded-full text-brand-medium text-xs font-semibold tracking-wide mb-5 shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-brand-orange" />
                  India&apos;s Premium Online Health Consultancy
                </motion.span>

                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] text-stone-900 tracking-tight">
                  Take the First Step Towards <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-medium to-emerald-600 relative">
                    A Healthier You!
                  </span>
                </h1>

                <p className="mt-5 text-stone-600 text-lg leading-relaxed max-w-xl">
                  Share your details and our wellness expert will guide you with the best nutrition & lifestyle plan just for you.
                </p>

                {/* HIGHLIGHT COMPONENT GRID AS PREMIUM GLASS CARDS */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Personalized Nutrition Plan",
                      desc: "Customized diet & lifestyle plan for your goals",
                      icon: <CheckCircle2 className="w-5 h-5 text-brand-medium" />
                    },
                    {
                      label: "Weight Loss / Gain / Maintain",
                      desc: "Programs details tailored to your body configuration",
                      icon: <TrendingDown className="w-5 h-5 text-teal-600" />
                    },
                    {
                      label: "Manage Chronic Conditions",
                      desc: "Supports PCOS/PCOD, Thyroid, Diabetes, BP & more",
                      icon: <Heart className="w-5 h-5 text-brand-orange" />
                    },
                    {
                      label: "Expert Guidance & Support",
                      desc: "One-to-one coaching & persistent support schedules",
                      icon: <Users className="w-5 h-5 text-brand-medium" />
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-white/40 backdrop-blur-md border border-white/60 p-4.5 rounded-2xl shadow-xs hover:shadow-md transition-all flex gap-3.5 group cursor-default"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-white/70 flex items-center justify-center border border-white/80 shadow-xs">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-stone-900 text-sm sm:text-base">{item.label}</h4>
                        <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* LOWER PORTION: RECONCILING WITH DELETED IMAGE CONSTRAINTS WITH DYNAMIC GLASS BANNER */}
              <div className="mt-10 p-5 rounded-2xl bg-white/35 backdrop-blur-md border border-white/50 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4.5">
                <div className="p-3 bg-brand-light/90 backdrop-blur-xs rounded-xl border border-emerald-100 flex items-center justify-center shrink-0">
                  <Activity className="w-7 h-7 text-brand-medium" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-orange tracking-wider uppercase mb-0.5">
                    <Sparkles className="w-3 h-3 text-brand-orange" />
                    <span>Real-time Metabolic BMI Consultation Insights</span>
                  </div>
                  <h4 className="font-display font-extrabold text-[#113a25] text-base leading-tight">
                    Sustainable Food Integrations Rooted in Science
                  </h4>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed max-w-lg">
                    No strict starvation or crash diet menus here. We calculate wholesome meals targeted uniquely for your personal metabolic capability.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: HIGH-FIDELITY GLASS CONSULTATION FORM CARD */}
            <div className="lg:col-span-6 bg-white/45 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(4,60,31,0.06)] border border-white/60 p-6 sm:p-8 relative overflow-hidden" id="consultation-form">
              
              {/* Decorative light reflection on card */}
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="text-center mb-6">
                <h3 className="font-display font-black text-xl sm:text-2xl text-brand-dark tracking-tight">
                  Book Your <span className="text-brand-orange">Free</span> Health Consultation
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  Fill the form below and our certified wellness expert will connect with you.
                </p>
              </div>

              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                variants={formContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                
                {/* GRID FORM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* FULL NAME */}
                  <motion.div variants={formItemVariants}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
                      <span>Full Name *</span>
                      {errors.fullName && <span className="text-red-500 lowercase font-medium italic">required</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 ${
                          errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-white/50 focus:bg-white/90 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* MOBILE NUMBER */}
                  <motion.div variants={formItemVariants}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
                      <span>Mobile Number *</span>
                      {errors.mobileNumber && <span className="text-red-500 lowercase font-medium italic">invalid</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input 
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="Enter your 10-digit number"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 ${
                          errors.mobileNumber ? 'border-red-400 focus:border-red-500' : 'border-white/50 focus:bg-white/90 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* AGE */}
                  <motion.div variants={formItemVariants}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center justify-between">
                      <span>Age *</span>
                      {errors.age && <span className="text-red-500 lowercase font-medium italic">invalid</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <input 
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Age"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 ${
                          errors.age ? 'border-red-400 focus:border-red-500' : 'border-white/50 focus:bg-white/90 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* EMAIL */}
                  <motion.div variants={formItemVariants}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      <span>Email Address <span className="text-stone-400 font-normal italic">(Optional)</span></span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input 
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:bg-white/90 focus:border-emerald-500"
                      />
                    </div>
                  </motion.div>

                </div>

                {/* GENDER REPLICATOR */}
                <motion.div variants={formItemVariants}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex justify-between">
                    <span>Gender *</span>
                    {errors.gender && <span className="text-red-500 lowercase font-medium italic">required</span>}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-xl border border-white/40 bg-white/20 backdrop-blur-xs">
                    {['male', 'female', 'other'].map((opt) => (
                      <label 
                        key={opt} 
                        className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all border ${
                          formData.gender === opt 
                            ? 'bg-brand-medium text-white border-brand-medium shadow-xs' 
                            : 'bg-white/30 text-stone-600 border-white/20 hover:bg-white/60'
                        }`}
                      >
                        <input 
                          type="radio"
                          name="gender"
                          value={opt}
                          checked={formData.gender === opt}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="capitalize">{opt}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>

                {/* GOALS SELECTION GRID AS GLASS CARDS */}
                <motion.div variants={formItemVariants}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex justify-between">
                    <span>What is your Goal? *</span>
                    {errors.goal && <span className="text-red-500 lowercase font-medium italic">required</span>}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { type: 'lose_weight', title: 'Lose Weight', icon: '🥑', subtitle: 'Slim' },
                      { type: 'gain_weight', title: 'Gain Weight', icon: '💪', subtitle: 'Strong' },
                      { type: 'maintain_weight', title: 'Maintain Weight', icon: '🛡️', subtitle: 'Health' }
                    ].map((item) => {
                      const isSelected = formData.goal === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => handleSelectGoal(item.type as any)}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
                            isSelected 
                              ? 'border-brand-medium bg-brand-medium text-white shadow-xs scale-[1.02]' 
                              : 'border-white/50 bg-white/30 hover:border-emerald-300 hover:bg-white/60'
                          }`}
                        >
                          <span className="text-xl mb-0.5">{item.icon}</span>
                          <span className={`font-display font-bold text-xs leading-tight ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                            {item.title}
                          </span>
                          <span className={`text-[9px] uppercase font-bold mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                            {item.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* WEIGHT & HEIGHT SIDE-BY-SIDE */}
                <motion.div variants={formItemVariants} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      <span>Current Weight (kg)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                        <Weight className="w-4 h-4" />
                      </span>
                      <input 
                        type="number"
                        name="currentWeight"
                        value={formData.currentWeight}
                        onChange={handleChange}
                        placeholder="Weight (e.g. 74)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:bg-white/90 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      <span>Height (cm)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                        <Ruler className="w-4 h-4" />
                      </span>
                      <input 
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Height (e.g. 172)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:bg-white/90 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* LIVE BMI PROGRESS TRACKER */}
                <AnimatePresence>
                  {liveBmi && (
                    <motion.div 
                      key="live-bmi-element"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="p-3 rounded-xl bg-white/55 backdrop-blur-md border border-white/80 flex items-center justify-between gap-3 text-stone-700 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-brand-dark text-white flex items-center justify-center text-xs font-bold font-mono">
                          {liveBmi}
                        </span>
                        <div>
                          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Metabolic BMI Estimate</p>
                          <p className="text-xs font-display font-extrabold text-[#08331a]">{bmiCategory}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md capitalize bg-[#ffecd8] text-brand-orange border border-orange-100/50">
                          {formData.goal ? formData.goal.replace('_', ' ') : 'Analysing'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* HEALTH CONDITION SELECT */}
                <motion.div variants={formItemVariants}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    <span>Existing Chronic Conditions / Diseases</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <select
                      name="healthConditions"
                      value={formData.healthConditions}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:bg-white/90 focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {HEALTH_CONDITIONS.map((cond) => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-400">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </div>
                </motion.div>

                {/* HEALTH CONCERNS OPTIONAL */}
                <motion.div variants={formItemVariants}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    <span>Describe your health concerns <span className="text-stone-400 font-normal italic">(Optional)</span></span>
                  </label>
                  <textarea
                    name="healthConcerns"
                    value={formData.healthConcerns}
                    onChange={handleChange}
                    rows={2}
                    placeholder="E.g. Fatigue, regular acidity, hair fall, thyroid symptoms, digestive problems."
                    className="w-full px-4 py-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:bg-white/90 focus:border-emerald-500 resize-none"
                  />
                </motion.div>

                {/* HOW REFERRAL */}
                <motion.div variants={formItemVariants}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                    <span>How did you hear about us?</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400">
                      <Users className="w-4 h-4" />
                    </span>
                    <select
                      name="howHeard"
                      value={formData.howHeard}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:bg-white/90 focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      <option value="">Select an option</option>
                      {HEAR_ABOUT_SOURCES.map((source) => (
                        <option key={source.value} value={source.value}>{source.label}</option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-400">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </div>
                </motion.div>

                {/* TERMS CHECKBOX */}
                <motion.div variants={formItemVariants} className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      name="agreed"
                      checked={formData.agreed}
                      onChange={handleCheckboxChange}
                      className="mt-1 rounded text-brand-medium focus:ring-brand-medium/50 border-emerald-300 w-4 h-4"
                    />
                    <span className={`text-[11px] leading-relaxed ${errors.agreed ? 'text-red-500 font-bold' : 'text-stone-500'}`}>
                      I agree to share my details and allow Arogya Wellness to contact me regarding my health & nutrition plan.
                    </span>
                  </label>
                </motion.div>

                {/* SUBMIT BUTTON */}
                <motion.div variants={formItemVariants}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-brand-dark to-[#09572d] text-white rounded-xl py-3 px-4 font-display font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-emerald-950/20 hover:from-brand-medium hover:to-brand-dark focus:ring-2 focus:ring-brand-light transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Submit & Request Free Consultation</span>
                        <ArrowRight className="w-4.5 h-4.5 text-emerald-300" />
                      </>
                    )}
                  </button>
                </motion.div>

                {/* CONFIDENTIAL TEXT */}
                <motion.p variants={formItemVariants} className="text-center text-[10px] text-stone-400 font-semibold flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-orange" />
                  Your information is 100% safe and confidential.
                </motion.p>

              </motion.form>
            </div>

          </div>
        </section>

        {/* 🏆 SECTION: "Why People Choose Arogya Wellness" (Converted into gorgeous interactive glass boxes) */}
        <section className="bg-white/30 backdrop-blur-md py-14 border-y border-white/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-brand-dark tracking-tight">
                Why People Choose Arogya Wellness
              </h2>
              <div className="w-12 h-0.5 bg-brand-orange mx-auto mt-3"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { number: "500+", title: "Happy Clients", desc: "Successfully custom diets", icon: <Users className="w-5.5 h-5.5 text-brand-medium" /> },
                { number: "100%", title: "Expert Coaches", desc: "Personalized follow-ups", icon: <Award className="w-5.5 h-5.5 text-emerald-700" /> },
                { number: "Dynamic BMI", title: "Target Tracking", desc: "No copy-paste plans", icon: <CheckSquare className="w-5.5 h-5.5 text-brand-orange" /> },
                { number: "Proven Result", title: "Sustainability", desc: "Long term metabolic balance", icon: <Flame className="w-5.5 h-5.5 text-brand-dark" /> }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/65 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:bg-white/80 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-medium transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3.5 shadow-xs border border-white/80">
                    {item.icon}
                  </div>
                  <span className="font-display font-extrabold text-[#113a25] text-base sm:text-lg block leading-none">{item.number}</span>
                  <span className="span font-bold text-stone-800 text-xs sm:text-sm mt-1">{item.title}</span>
                  <span className="text-stone-500 text-[11px] mt-0.5">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 📊 INTERACTIVE SECTION: METABOLIC CALORIE CALCULATOR & HYDRATION TRACKER (Bento-Grid layout) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden" id="services">
          
          {/* APPLIED TOAST FEEDBACK */}
          <AnimatePresence>
            {showAppliedToast && (
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 bg-[#113a25] text-white px-5 py-3.5 rounded-2xl border border-emerald-600 shadow-2xl flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-white shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm">Form Pre-Populated Successfully!</p>
                  <p className="text-[11px] text-emerald-200">Weight, Height, Age, Gender, and Goal synchronized.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur-md border border-white/50 rounded-full text-brand-orange text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Health Assessor
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark tracking-tight">
              Elite Calorie & Metabolic Explorer
            </h2>
            <p className="text-stone-500 text-sm mt-3 leading-relaxed">
              We don't believe in generic diets. Determine your Basal Metabolic Rate (BMR) and recommended custom nutrient allocation instantly using medical formulas.
            </p>
            <div className="w-12 h-0.5 bg-brand-orange mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* CALCULATOR PANEL */}
            <div className="lg:col-span-8 bg-white/45 backdrop-blur-xl rounded-3xl border border-white/60 p-6 sm:p-8 flex flex-col justify-between shadow-[0_12px_45px_rgba(4,60,31,0.03)] relative">
              <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-xs text-[10px] text-brand-medium border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Info className="w-3 h-3" /> Mifflin-St Jeor Formula
              </div>
              
              <div className="space-y-6">
                <div className="border-b border-stone-200/50 pb-4">
                  <h3 className="font-display font-bold text-lg text-brand-dark flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-orange" />
                    Step 1: Fill in your Body Dimensions
                  </h3>
                  <p className="text-stone-500 text-xs mt-0.5">Input parameters to compute custom thresholds</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* CALC GENDER */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Gender select</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['male', 'female'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCalcGender(g as any)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                            calcGender === g
                              ? 'border-brand-medium bg-[#ecf7f1] text-brand-medium'
                              : 'border-white/60 bg-white/30 text-stone-600 hover:bg-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CALC AGE */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex justify-between">
                      <span>Age (years)</span>
                      <span className="font-mono text-stone-700 font-bold">{calcAge} y</span>
                    </label>
                    <input 
                      type="range"
                      min="14"
                      max="90"
                      value={calcAge}
                      onChange={(e) => setCalcAge(e.target.value)}
                      className="w-full accent-brand-medium cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none mt-2"
                    />
                  </div>

                  {/* CALC WEIGHT */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex justify-between">
                      <span>Weight (kilograms)</span>
                      <span className="font-mono text-stone-700 font-bold">{calcWeight} kg</span>
                    </label>
                    <input 
                      type="range"
                      min="35"
                      max="150"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(e.target.value)}
                      className="w-full accent-brand-medium cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* CALC HEIGHT */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex justify-between">
                      <span>Height (cm)</span>
                      <span className="font-mono text-stone-700 font-bold">{calcHeight} cm</span>
                    </label>
                    <input 
                      type="range"
                      min="100"
                      max="220"
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(e.target.value)}
                      className="w-full accent-brand-medium cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none mt-2"
                    />
                  </div>

                  {/* CALC ACTIVITY */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Weekly Activity Level</label>
                    <select
                      value={calcActivity}
                      onChange={(e) => setCalcActivity(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-white/50 bg-white/40 backdrop-blur-md text-xs font-bold transition-all focus:outline-hidden focus:ring-1 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      <option value="sedentary">Sedentary (Little or no workout)</option>
                      <option value="light">Light Workout (1-2 days/week)</option>
                      <option value="moderate">Moderate Exercise (3-4 days/week)</option>
                      <option value="active">Very Active (5-6 days/week)</option>
                      <option value="extreme">Extreme Athletes (Daily extreme force)</option>
                    </select>
                  </div>

                  {/* CALC GOAL */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Desired Goal Focus</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { key: 'lose', label: 'Lose' },
                        { key: 'maintain', label: 'Maintain' },
                        { key: 'gain', label: 'Gain' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setCalcGoal(item.key as any)}
                          className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            calcGoal === item.key
                              ? 'bg-brand-orange text-white'
                              : 'border border-white/60 bg-white/30 text-stone-600 hover:bg-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VISUAL MACRO ESTIMATION BARS */}
                <div className="p-4 bg-white/50 rounded-2xl border border-white/80 space-y-3.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Recommended Meal Macros Allocation</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* PROTEIN BAR */}
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-stone-800">Proteins 💪</span>
                        <span className="text-[11px] text-stone-500 font-mono font-bold">{protGrams}g <span>({protCalories} kcal)</span></span>
                      </div>
                      <div className="w-full bg-stone-200/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-medium h-full rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-[9px] text-stone-400 mt-0.5 block italic">Supports muscle cells & satiety retention</span>
                    </div>

                    {/* CARB BAR */}
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-stone-800">Carbs 🌾</span>
                        <span className="text-[11px] text-stone-500 font-mono font-bold">{carbGrams}g <span>({carbCalories} kcal)</span></span>
                      </div>
                      <div className="w-full bg-stone-200/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-orange h-full rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-[9px] text-stone-400 mt-0.5 block italic">Provides cellular energy and gut fiber</span>
                    </div>

                    {/* FATS BAR */}
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-stone-800">Fats 🥑</span>
                        <span className="text-[11px] text-stone-500 font-mono font-bold">{fatGrams}g <span>({fatCalories} kcal)</span></span>
                      </div>
                      <div className="w-full bg-stone-200/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-[9px] text-stone-400 mt-0.5 block italic">Essential for metabolic hormone balance</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ACTION TO Prepopulate FORM */}
              <div className="mt-6 pt-4 border-t border-stone-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  <span className="text-xs text-stone-500 font-semibold">Done calculating? Set these straight into booking form in one tap!</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCalculatorToForm}
                  className="px-5 py-2.5 bg-brand-dark hover:bg-brand-medium text-white rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Sync to Booking Form</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </button>
              </div>

            </div>

            {/* ASSESSMENTS CARD */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* RESULTS CARD */}
              <div className="bg-gradient-to-br from-brand-dark to-[#04331a] rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-white/10 border border-white/20 text-emerald-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Live Assessment Outcome
                    </span>
                    <Heart className="w-4 h-4 text-brand-orange fill-brand-orange animate-pulse" />
                  </div>

                  {/* Main outputs */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-emerald-250 font-bold uppercase tracking-wider block">Estimated Metabolic Age</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-display font-black tracking-tight text-[#ffeedd]">
                          {estMetabolicAge} Years
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold font-mono">
                          (Physical Age: {ca})
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100/70 leading-relaxed mt-1">
                        {estMetabolicAge < ca 
                          ? '🎉 Awesome! Your physical activity renders your metadata younger than absolute age!'
                          : '⚠️ Notice: Increasing daily clean steps is suggested to restore metabolic youth.'}
                      </p>
                    </div>

                    <div className="h-0.5 bg-white/10"></div>

                    <div>
                      <span className="text-[10px] text-emerald-250 font-bold uppercase tracking-wider block">Basal Metabolic Rate (BMR)</span>
                      <span className="text-2xl font-display font-extrabold tracking-tight mt-0.5 block">{computedBmrVal} <span className="text-xs font-normal text-emerald-200">kcal/day</span></span>
                      <span className="text-[10px] text-emerald-200/60 block">Calories spent simply staying alive in rest</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-250 font-bold uppercase tracking-wider block">Daily Active Energy (TDEE)</span>
                      <span className="text-2xl font-display font-extrabold tracking-tight mt-0.5 block">{computedTdeeVal} <span className="text-xs font-normal text-emerald-200">kcal/day</span></span>
                      <span className="text-[10px] text-emerald-200/60 block">Reflects steps, workouts, and digestion energy</span>
                    </div>

                    <div className="h-0.5 bg-white/10"></div>

                    <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                      <span className="text-[10px] text-brand-orange font-black uppercase tracking-wider block">Recommended Calorie Intake limit</span>
                      <span className="text-3xl font-display font-black tracking-tight text-white mt-1 block font-mono">
                        {finalTargetCalories} <span className="text-xs font-bold text-stone-200">kcal/day</span>
                      </span>
                      <span className="text-[10px] text-emerald-200/70 block leading-tight mt-1">
                        Structured to reach your <strong>{calcGoal} weight</strong> target smoothly without muscle wasting.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 text-[10px] text-emerald-300 font-semibold border-t border-white/10 flex items-center gap-1.5 leading-snug">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>These models represent evidence-backed metabolic estimates. Talk to Dr. Arogya for exact planning schedules.</span>
                </div>
              </div>

              {/* SATISFYING DAILY WATER HYDRATION TRACKER */}
              <div className="bg-white/45 backdrop-blur-xl rounded-3xl border border-white/60 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-cyan-200/10 rounded-full blur-2xl"></div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-stone-800 text-sm flex items-center gap-2">
                      <span className="w-7 h-7 bg-cyan-50 text-cyan-500 rounded-lg flex items-center justify-center border border-cyan-100 shadow-xs">💧</span>
                      Daily Water Intake Tool
                    </h4>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Target: 3.0L</span>
                  </div>

                  {/* The Liquid Glass Container */}
                  <div className="relative h-14 bg-stone-100 rounded-2xl border border-stone-200/50 overflow-hidden flex items-center justify-center">
                    {/* Simulated Fluid Level */}
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-400/80 to-cyan-300/60 backdrop-blur-xs transition-all duration-500"
                      style={{ height: `${Math.min(100, (waterCups / 12) * 100)}%` }}
                    />
                    <div className="z-10 text-center">
                      <span className="text-stone-800 font-display font-black text-sm tracking-tight block">
                        {(waterCups * 0.25).toFixed(2)} Liters Logged
                      </span>
                      <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider block">
                        {waterCups} out of 12 Glasses (250ml each)
                      </span>
                    </div>
                  </div>

                  {/* Motivational taglines */}
                  <p className="text-[11px] text-stone-500 leading-snug text-center">
                    {waterCups === 0 && '👇 Click the button to log your water cup progress!'}
                    {waterCups > 0 && waterCups < 4 && '🌿 Good start. Proper hydration starts clean metabolic pathways.'}
                    {waterCups >= 4 && waterCups < 8 && '✨ Getting there! Headaches and fatigue disappear with hydration.'}
                    {waterCups >= 8 && waterCups < 12 && '🎯 Excellent hydration! Metabolism is running efficiently.'}
                    {waterCups >= 12 && '🏆 Phenomenal! You have fully satisfied your recommended target today!'}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddWater}
                      className="flex-grow py-2.5 bg-cyan-500 hover:bg-cyan-600 active:scale-95 transition-all text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm shadow-cyan-300/20"
                    >
                      + Add 1 Glass
                    </button>
                    <button
                      type="button"
                      onClick={handleResetWater}
                      className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all text-stone-500 rounded-xl text-xs font-semibold cursor-pointer border border-stone-200/60"
                      title="Reset Hydration"
                    >
                      Reset
                    </button>
                  </div>
                </div>

              </div>
              
            </div>

          </div>
        </section>

        {/* 📚 SECTION: INTERACTIVE PERSONALIZED WELLNESS PROGRAMS SECTION */}
        <section className="bg-[#ecf7f1]/40 py-16 border-y border-white/60 relative overflow-hidden" id="programs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[9px] bg-brand-medium/10 border border-brand-medium/20 text-brand-medium font-bold px-3 py-1 rounded-full uppercase tracking-widest block w-fit mx-auto mb-3">
                Curated Specialized Care
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-brand-dark tracking-tight">
                Explore Specialized Wellness Plans
              </h2>
              <p className="text-stone-500 text-xs mt-2 leading-relaxed">
                Click a health program below to explore exactly how we personalize food habits and monitoring schedules for you.
              </p>
              <div className="w-12 h-0.5 bg-brand-orange mx-auto mt-3"></div>
            </div>

            {/* TAB TRIGGERS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8 max-w-4xl mx-auto">
              {[
                { id: 'weight_management', label: 'Weight & Muscle 🥑', desc: 'Sustainable adjustments' },
                { id: 'pcos_pcod', label: 'PCOS / PCOD Care 🌸', desc: 'Hormonal & cycle support' },
                { id: 'thyroid', label: 'Thyroid Support 🦋', desc: 'Active metabolic reset' },
                { id: 'diabetes', label: 'Diabetes Control 🛡️', desc: 'Glucoregulatory structure' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveProgramTab(tab.id as any)}
                  className={`p-4 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                    activeProgramTab === tab.id
                      ? 'bg-white border-brand-medium shadow-md shadow-emerald-950/5 relative'
                      : 'bg-white/40 border-white/50 hover:bg-white/80'
                  }`}
                >
                  <span className={`font-display font-bold text-xs sm:text-sm ${activeProgramTab === tab.id ? 'text-brand-dark' : 'text-stone-700'}`}>
                    {tab.label}
                  </span>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    {tab.desc}
                  </span>
                  {activeProgramTab === tab.id && (
                    <span className="absolute bottom-2 right-2 w-2 h-2 bg-brand-orange rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* EXPANDED TAB BODY */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/80 shadow-xs max-w-4xl mx-auto">
              {activeProgramTab === 'weight_management' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-150 pb-3">
                    <h3 className="font-display font-extrabold text-[#113a25] text-lg sm:text-xl">🥑 Healthy Weight & Metabolism Rebalance Plan</h3>
                    <span className="bg-[#ffeeda] text-brand-orange text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">Timeline: 12-16 Weeks</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Designed around natural scientific formulas of nutrition logic. No starvation regimes. We build high-density nourishing meals to feed the cell cytoplasm.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-3 bg-[#f3faf6] rounded-xl border border-emerald-50">
                      <p className="text-brand-medium font-bold uppercase text-[9px] tracking-wider mb-1">Diet Focus</p>
                      <p className="text-stone-700">Calorie thresholds paired with 1.6-2g Protein per Kg target</p>
                    </div>
                    <div className="p-3 bg-[#f3faf6] rounded-xl border border-emerald-50">
                      <p className="text-brand-medium font-bold uppercase text-[9px] tracking-wider mb-1">Check-Ins</p>
                      <p className="text-stone-700">Weekly weight logging + daily habit checklist on WhatsApp</p>
                    </div>
                    <div className="p-3 bg-[#f3faf6] rounded-xl border border-emerald-50">
                      <p className="text-brand-medium font-bold uppercase text-[9px] tracking-wider mb-1">Perfect For</p>
                      <p className="text-stone-700">Stuck weight plateaus, healthy muscle preservation, general energy resets</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeProgramTab === 'pcos_pcod' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-150 pb-3">
                    <h3 className="font-display font-extrabold text-[#113a25] text-lg sm:text-xl">🌸 Hormonal Balance & PCOS / PCOD Recovery Plan</h3>
                    <span className="bg-[#ffeeda] text-brand-orange text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">Timeline: 16-24 Weeks</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Instigating insulin sensitizer habits, healthy omega-3 seed cycles, and custom anti-inflammatory foods. We target root cause symptoms rather than temporary fixes.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-3 bg-[#f6f3fa] rounded-xl border border-purple-100">
                      <p className="text-[#644ea2] font-bold uppercase text-[9px] tracking-wider mb-1">Diet Focus</p>
                      <p className="text-stone-700">Low-GI complex carbohydrates + seed cycling + magnesium optimization</p>
                    </div>
                    <div className="p-3 bg-[#f6f3fa] rounded-xl border border-purple-100">
                      <p className="text-[#644ea2] font-bold uppercase text-[9px] tracking-wider mb-1">Check-Ins</p>
                      <p className="text-stone-700">Bimonthly cycle tracking + custom symptom checkups</p>
                    </div>
                    <div className="p-3 bg-[#f6f3fa] rounded-xl border border-purple-100">
                      <p className="text-[#644ea2] font-bold uppercase text-[9px] tracking-wider mb-1">Perfect For</p>
                      <p className="text-stone-700">Irregular period cycles, facial hair symptoms, hormonal weight blocks</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeProgramTab === 'thyroid' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-150 pb-3">
                    <h3 className="font-display font-extrabold text-[#113a25] text-lg sm:text-xl">🦋 Thyroid Hormone Optimization Plan</h3>
                    <span className="bg-[#ffeeda] text-brand-orange text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">Timeline: 12-18 Weeks</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Optimizing selenium, tyrosine, iodine-rich raw foods while avoiding goitrogens that block thyroid synthesis. Supports fat-burning state of T3/T4 conversion.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-3 bg-[#f6faf3]/70 rounded-xl border border-lime-100">
                      <p className="text-lime-700 font-bold uppercase text-[9px] tracking-wider mb-1">Diet Focus</p>
                      <p className="text-stone-700">Anti-inflammatory + crucial minerals (zinc, selenium) + thyroid enzyme protection</p>
                    </div>
                    <div className="p-3 bg-[#f6faf3]/70 rounded-xl border border-lime-100">
                      <p className="text-lime-700 font-bold uppercase text-[9px] tracking-wider mb-1">Check-Ins</p>
                      <p className="text-stone-700">Weekly fatigue indexes + metabolic rate tracker support</p>
                    </div>
                    <div className="p-3 bg-[#f6faf3]/70 rounded-xl border border-lime-100">
                      <p className="text-lime-700 font-bold uppercase text-[9px] tracking-wider mb-1">Perfect For</p>
                      <p className="text-stone-700">Hypothyroidism, dry skin patterns, sluggish morning fatigue</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeProgramTab === 'diabetes' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-150 pb-3">
                    <h3 className="font-display font-extrabold text-[#113a25] text-lg sm:text-xl">🛡️ Glucose Regulation & Insulin Management</h3>
                    <span className="bg-[#ffeeda] text-brand-orange text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">Timeline: 16-24 Weeks</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Designed to control fasting and post-meal glucose spikes. We structure exact food sequences (Fibers ➡️ Proteins ➡️ Carbs) to flatten the insulin response curve.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100">
                      <p className="text-cyan-700 font-bold uppercase text-[9px] tracking-wider mb-1">Diet Focus</p>
                      <p className="text-stone-700">Precision food sequencing + high hydration fiber + cellular insulin support</p>
                    </div>
                    <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100">
                      <p className="text-cyan-700 font-bold uppercase text-[9px] tracking-wider mb-1">Check-Ins</p>
                      <p className="text-stone-700">Glucose logs sync + metabolic recovery chart checkups</p>
                    </div>
                    <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100">
                      <p className="text-cyan-700 font-bold uppercase text-[9px] tracking-wider mb-1">Perfect For</p>
                      <p className="text-stone-700">High HbA1c readings, pre-diabetic thresholds, insulin blocks</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </section>

        {/* ❔ INTERACTIVE SECTION: GLASS ACCORDION FAQS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" id="about">
          <div className="text-center mb-10">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-brand-dark tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-500 text-xs mt-1 leading-relaxed">
              Have doubts about custom nutrition schedules and programs? We have transparent answers.
            </p>
            <div className="w-12 h-0.5 bg-brand-orange mx-auto mt-3"></div>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: 'Do you prescribe strict crash diets or starve programs?',
                a: 'Absolutely not! Crash dieting slows down the thyroid gland and destroys lean muscle mass. At Arogya Wellness, we customize eating habits that align with your calculated BMR calorie thresholds so that you burn fat efficiently while staying full and energetic.'
              },
              {
                q: 'What is the "Metabolic Calculator sync" about?',
                a: 'To make your booking effortless, you can input your body metrics into our live calculator on this page to view your metabolic age and calorie recommendations. Click "Sync" to automatically apply these stats directly into our free consultation registration form!'
              },
              {
                q: 'Can chronic conditions like PCOS and Hypothyroidism be support-managed by diet?',
                a: 'Yes, absolutely. Hormonal networks depend on lipid nutrients, insulin pathways, and selenium minerals. Introducing low-GI grains, anti-inflammatory herbs, and magnesium-rich ingredients helps manage cellular blocks, often promoting natural menstrual rhythm and energy recovery.'
              },
              {
                q: 'Is my personal health data kept safe?',
                a: '100% yes. We do not sell or lease patient profiles. Your registered phone numbers, BMI coordinates, and wellness concern logs are kept internally and are only accessed by your assigned Arogya core coaches.'
              },
              {
                q: 'How does the WhatsApp appointment slot confirmation function?',
                a: 'After you fill and submit our free consultation booking form, we calculate your BMI profile and trigger our success calendar popup. You select an ideal day and time. Clicking "Confirm" compiles a beautifully formatted medical intake log and opens WhatsApp directly to send it to our expert team for immediate approval!'
              }
            ].map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-xs hover:border-white transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between font-display font-bold text-stone-900 text-xs sm:text-sm cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-stone-200 text-stone-500 text-xs text-center font-extrabold font-mono">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-stone-600 text-[12px] leading-relaxed border-t border-stone-100/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* 🟢 FLOATING / FIXED CALL HELPER BANNER */}
        <section className="bg-brand-dark/95 backdrop-blur-md text-white py-6 border-t border-emerald-900/60 z-30 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="w-11 h-11 rounded-xl bg-emerald-800/80 backdrop-blur-xs border border-emerald-700/50 flex items-center justify-center shrink-0 shadow-sm">
                <Phone className="w-5 h-5 text-emerald-400 animate-bounce" />
              </div>
              <div>
                <h4 className="font-display font-bold text-[#fafefe] text-base leading-tight">Need Help? Speak to Our Expert</h4>
                <p className="text-emerald-200 text-sm mt-0.5 font-mono tracking-wide">
                  +91 7674856208 &nbsp;|&nbsp; +91 7842236001
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3.5 items-center justify-center">
              <a 
                href="https://wa.me/917674856208?text=Hello%20Arogya%20Wellness,%20I'd%20like%20to%20get%20expert%20guidance%20for%20my%20health%20and%20nutrition%20plan." 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-[#25d366] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#20ba5a] transition-all transform hover:scale-[1.03] select-none"
              >
                <MessageCircle className="w-4.5 h-4.5 fill-white" />
                <span>Chat on WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById('consultation-form');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="px-5 py-3 border border-emerald-700 hover:border-emerald-600 bg-brand-medium text-white rounded-full font-bold text-sm hover:bg-[#128a49] transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Book Consultation Now
              </button>
            </div>

          </div>
        </section>
      </main>

      {/* 🟢 FOOTER HIGHLIGHTS WITH GLASS EFFECTS */}
      <footer className="bg-white/40 backdrop-blur-md border-t border-white/50 py-10 text-xs text-stone-500 font-semibold relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left">
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 bg-white/30 p-4 rounded-xl border border-white/50">
            <div className="p-2 bg-white rounded-lg text-brand-medium shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-800">100% Personalized</p>
              <p className="text-stone-400 font-medium mt-0.5">Plans custom built around you</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 bg-white/30 p-4 rounded-xl border border-white/50">
            <div className="p-2 bg-white rounded-lg text-brand-medium shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Safe & Secure</p>
              <p className="text-stone-400 font-medium mt-0.5">Your Medical Data is Protected</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 bg-white/30 p-4 rounded-xl border border-white/50">
            <div className="p-2 bg-white rounded-lg text-brand-medium shadow-xs">
              <Heart className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Science Backed</p>
              <p className="text-stone-400 font-medium mt-0.5">Evidence based balance research</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 bg-white/30 p-4 rounded-xl border border-white/50">
            <div className="p-2 bg-white rounded-lg text-brand-medium shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-800">Ongoing Support</p>
              <p className="text-stone-400 font-medium mt-0.5">Every Single Step of the Way</p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-white/50 text-center text-stone-400 text-[11px] font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Arogya Wellness Inc. All rights reserved. &bull; Designed to help you live healthy energy naturally.
        </div>
      </footer>

      {/* 🟢 SUCCESS BOOKING CELEBRATION MODAL (Glass Design) */}
      <AnimatePresence>
        {showSuccessModal && submittedLead && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative overflow-y-auto max-h-[90vh] border border-white/60 scrollbar-thin"
            >
              {/* Dynamic light reflection color band */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-medium to-brand-orange"></div>

              {/* Celebration Icon */}
              <div className="mx-auto w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100/55">
                <Check className="w-7 h-7 text-brand-medium stroke-[3]" />
              </div>

              <h3 className="font-display font-black text-2xl text-center text-brand-dark leading-tight">
                Nutrition Request <span className="text-brand-orange">Received!</span>
              </h3>
              
              <p className="text-stone-500 text-sm text-center mt-2 px-1">
                Congratulations <span className="text-stone-800 font-extrabold">{submittedLead.fullName}</span>! Dr. Arogya has compiled your customized metabolic summary. Choose your immediate chat slot below:
              </p>

              {/* Dynamic Metabolic Diagnostics Box (Glass) */}
              <div className="mt-5 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-brand-medium tracking-wider">
                  <span>METABOLIC PROFILE DATA</span>
                  <span className="text-stone-450 font-mono">ID: {submittedLead.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-white/70 p-2 rounded-xl border border-white/80">
                    <span className="block text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-0.5">Goal</span>
                    <span className="text-xs font-bold text-stone-800 capitalize leading-none">{submittedLead.goal.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-white/70 p-2 rounded-xl border border-white/80">
                    <span className="block text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-0.5">Stats</span>
                    <span className="text-xs font-bold text-stone-800 font-mono leading-none">{submittedLead.currentWeight}kg / {submittedLead.height}cm</span>
                  </div>
                  <div className="bg-white/70 p-2 rounded-xl border border-white/80">
                    <span className="block text-[9px] text-stone-400 font-extrabold uppercase tracking-wider mb-0.5">BMI Outcome</span>
                    <span className={`text-xs font-bold leading-none ${submittedLead.bmi && submittedLead.bmi > 25 ? 'text-orange-500' : 'text-brand-medium'}`}>
                      {submittedLead.bmi ? `${submittedLead.bmi}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 bg-white/70 p-2.5 rounded-xl border border-white/60 leading-relaxed">
                  <strong>🧬 Dr. Arogya&apos;s Tip:</strong> Based on the wellness goal requested, we recommend focusing on custom hydration modeling (aim for 3.1L daily check) and reducing complex carbohydrate consumption to kickstart metabolic flexibility.
                </div>
              </div>

              {/* Interactive Calendar/Time Booking Inside modal */}
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black uppercase text-[#113a25] tracking-wider">
                    Select Consultation Day
                  </label>
                  <span className="text-[10px] font-bold text-brand-orange">
                    {calendarDate.getDay() === 0 ? '✨ Sunday Schedule (4 AM - 8 PM)' : '🌿 Mon - Sat Schedule (6 AM - 8 PM)'}
                  </span>
                </div>

                {/* Date quick picker + Option to trigger full calendar */}
                <div className="bg-white/50 border border-white/80 p-3 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-7 h-7 bg-emerald-50 text-brand-medium rounded-lg flex items-center justify-center shrink-0 border border-emerald-100">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-extrabold text-[#113a25] truncate">
                        {selectedDate}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFullCalendar(!showFullCalendar)}
                      className="text-[11px] bg-brand-medium hover:bg-brand-dark text-white font-bold py-1 px-2.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>{showFullCalendar ? 'Close Calendar' : 'Change Date'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showFullCalendar ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* FULL MONTH CALENDAR CONTAINER WITH ANIMATION */}
                  <AnimatePresence>
                    {showFullCalendar && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-stone-150 pt-2"
                      >
                        {/* Calendar Header with Month Toggle */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-stone-700 font-display">
                            {currentCalMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const prev = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() - 1, 1);
                                const todayVal = new Date();
                                if (prev.getFullYear() > todayVal.getFullYear() || 
                                    (prev.getFullYear() === todayVal.getFullYear() && prev.getMonth() >= todayVal.getMonth())) {
                                  setCurrentCalMonth(prev);
                                }
                              }}
                              className="w-6 h-6 rounded-lg border border-stone-200 hover:bg-stone-50 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + 1, 1);
                                setCurrentCalMonth(next);
                              }}
                              className="w-6 h-6 rounded-lg border border-stone-200 hover:bg-stone-50 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 mb-1.5">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="py-0.5">{day}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {/* Blank padding items */}
                          {Array.from({ length: new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth(), 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="py-1"></div>
                          ))}

                          {/* Day Numbers */}
                          {Array.from({ length: new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                            const dNum = i + 1;
                            const dDate = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth(), dNum);
                            const todayCheck = new Date();
                            todayCheck.setHours(0,0,0,0);
                            
                            const isPast = dDate < todayCheck;
                            const isSelected = calendarDate.getDate() === dNum && 
                                               calendarDate.getMonth() === currentCalMonth.getMonth() && 
                                               calendarDate.getFullYear() === currentCalMonth.getFullYear();

                            return (
                              <button
                                key={`day-${dNum}`}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  setCalendarDate(dDate);
                                }}
                                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all relative cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand-medium text-white shadow-xs'
                                    : isPast
                                      ? 'text-stone-300 cursor-not-allowed opacity-45'
                                      : 'text-stone-700 hover:bg-[#ecf7f1] hover:text-brand-medium'
                                }`}
                              >
                                {dNum}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Step 2: Choose Hourly Timing with Responsive Scrollable Grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      Select Timing Range (Hourly)
                    </label>
                    <span className="text-[10px] text-stone-500 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-orange" />
                      Active: {selectedTimeSlot}
                    </span>
                  </div>

                  {/* High Quality scrollable container for time slots, styled compact for both mobile and computer */}
                  <div className="max-h-[175px] overflow-y-auto border border-stone-200/60 bg-white/40 backdrop-blur-xs rounded-2xl p-2.5 space-y-2 scrollable-box shadow-inner">
                    <div className="grid grid-cols-2 gap-1.5">
                      {getAvailableTimeSlots(calendarDate).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTimeSlot(t)}
                          className={`py-2 px-1.5 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer text-center truncate ${
                            selectedTimeSlot === t 
                              ? 'border-brand-orange bg-[#ffeeda] text-brand-orange shadow-xs' 
                              : 'border-white/70 bg-white/70 text-stone-600 hover:bg-white hover:border-stone-300'
                          }`}
                          title={t}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1 block italic text-center">
                    Many users prefer morning 08:00 AM - 09:00 AM / evening 06:00 PM - 07:00 PM slots for quick chat.
                  </span>
                </div>
              </div>

              {/* Confirm Slot Action Button */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!submittedLead) return;

                    const goalMap: Record<string, string> = {
                      lose_weight: 'Lose Weight 🥑 (Slim & Lean)',
                      gain_weight: 'Gain Weight 💪 (Build Strength)',
                      maintain_weight: 'Maintain Weight 🛡️ (Healthy Lifestyle)'
                    };
                    const conditionMap: Record<string, string> = {
                      none: 'None / Preventive Care',
                      weight_loss_gain: 'Weight Management / General Fitness',
                      pcos_pcod: 'PCOS / PCOD',
                      thyroid: 'Thyroid (Hypo/Hyper)',
                      diabetes: 'Diabetes / Insulin Resistance',
                      hypertension: 'Hypertension / High BP',
                      cholesterol: 'High Cholesterol / Heart Health',
                      gut_health: 'Gut Health (Acidity, Bloating, IBS)',
                      fatty_liver: 'Fatty Liver',
                      uric_acid: 'High Uric Acid / Gout',
                      other: 'Other Chronic Conditions'
                    };
                    const referralMap: Record<string, string> = {
                      instagram: 'Instagram Ads / Posts',
                      facebook: 'Facebook Group / Ads',
                      google_search: 'Google Search',
                      youtube: 'YouTube Video',
                      friend_referral: 'Friend or Family Referral',
                      whatsapp_group: 'WhatsApp / Community Group',
                      other: 'Other'
                    };

                    const goalLabel = goalMap[submittedLead.goal] || submittedLead.goal;
                    const conditionLabel = conditionMap[submittedLead.healthConditions] || submittedLead.healthConditions;
                    const referralLabel = referralMap[submittedLead.howHeard] || submittedLead.howHeard;
                    
                    let bmiCategoryText = 'N/A';
                    if (submittedLead.bmi) {
                      if (submittedLead.bmi < 18.5) bmiCategoryText = 'Underweight';
                      else if (submittedLead.bmi < 25) bmiCategoryText = 'Ideal / Normal';
                      else if (submittedLead.bmi < 30) bmiCategoryText = 'Overweight';
                      else bmiCategoryText = 'Obese';
                    }
                    const bmiLabel = submittedLead.bmi ? `${submittedLead.bmi} (${bmiCategoryText})` : 'N/A';

                    const messageText = `🟢 *New Free Health Consultation Booking*
----------------------------------------
👤 *PATIENT PROFILE:*
• *Name:* ${submittedLead.fullName}
• *Mobile Number:* ${submittedLead.mobileNumber}
• *Age:* ${submittedLead.age} years
• *Gender:* ${submittedLead.gender ? submittedLead.gender.toUpperCase() : 'N/A'}
• *Email:* ${submittedLead.emailAddress}

🎯 *GOAL & PHYSICAL STATS:*
• *Wellness Goal:* ${goalLabel}
• *Current Weight:* ${submittedLead.currentWeight} kg
• *Height:* ${submittedLead.height} cm
• *Calculated BMI:* ${bmiLabel}

⚠️ *HEALTH STATUS:*
• *Chronic Conditions:* ${conditionLabel}
• *Additional Concerns/Symptoms:* ${submittedLead.healthConcerns || 'None specified'}

📅 *PROPOSED CONSULTATION SLOT:*
• *Date:* ${selectedDate}
• *Time:* ${selectedTimeSlot}

🔍 *REFERRAL INFO:*
• *Source:* ${referralLabel}
----------------------------------------
_Generated via Arogya Wellness Consultation Portal_`;

                    const waLink = `https://wa.me/917674856208?text=${encodeURIComponent(messageText)}`;
                    window.open(waLink, '_blank');
                    setShowSuccessModal(false);
                  }}
                  className="w-full bg-[#25d366] text-white py-3 rounded-xl font-display font-bold text-sm tracking-wide hover:bg-[#1db354] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-green-500/10 active:scale-[0.99] cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Confirm Slot & Chat on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-stone-100 text-stone-600 py-2.5 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Close & Back to Portal
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💻 ADMIN LEAD METRICS DRAWER (Glass panel overlay) */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white/80 backdrop-blur-xl shadow-2xl border-l border-white/50 flex flex-col transform">
            
            <div className="p-4 border-b border-white/50 bg-white/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center text-white">
                  <Settings className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-stone-900 text-sm sm:text-base leading-tight">Lead Database Console</h3>
                  <p className="text-stone-500 text-[10px] font-bold uppercase tracking-wider">Arogya Wellness CRM Logs</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAdminOpen(false)}
                className="w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center font-bold text-stone-500 text-sm cursor-pointer border border-white/50"
              >
                &times;
              </button>
            </div>

            {/* List lead body */}
            <div className="p-5 flex-grow overflow-y-auto space-y-4">
              
              {/* ANALYTICS PREVIEW BOX */}
              {submissions.length > 0 ? (
                <div className="p-4 bg-white/60 rounded-2xl border border-white/80 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Total Booked</span>
                    <span className="text-xl font-display font-extrabold text-brand-dark">{submissions.length} Leads</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Weight Management</span>
                    <span className="text-xl font-display font-extrabold text-brand-orange">
                      {submissions.filter(s => s.goal === 'lose_weight' || s.goal === 'gain_weight').length} Focus
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-stone-250 rounded-2xl text-stone-400 bg-white/30 backdrop-blur-md">
                  <ClipboardList className="w-10 h-10 mx-auto stroke-[1.5] mb-2 text-stone-450" />
                  <p className="font-bold text-sm">No lead submissions found.</p>
                  <p className="text-[11px] text-stone-500 mt-1">Submit the booking form on the main dashboard to generate live logs!</p>
                </div>
              )}

              {/* LIST ENTRIES */}
              {submissions.map((sub) => (
                <div key={sub.id} className="p-4 rounded-xl border border-white/60 bg-white/40 backdrop-blur-xs shadow-xs relative">
                  
                  {/* Delete log entry */}
                  <button 
                    onClick={() => handleDeleteSubmission(sub.id)}
                    className="absolute top-3.5 right-3.5 text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-white/80 font-bold text-brand-medium px-2 py-0.5 rounded-full border border-emerald-100">
                      {sub.id}
                    </span>
                    <span className="text-[10px] text-stone-450 font-semibold">{sub.createdAt}</span>
                  </div>

                  <div className="space-y-1.5 text-stone-700 text-xs leading-relaxed">
                    <p><strong>Name:</strong> <span className="font-bold text-stone-900">{sub.fullName}</span> &bull; Age {sub.age}</p>
                    <p><strong>Phone:</strong> <span className="font-mono text-stone-900 font-bold">{sub.mobileNumber}</span></p>
                    <p><strong>Email:</strong> <span className="text-stone-600">{sub.emailAddress}</span></p>
                    <p><strong>Conditions:</strong> <span className="text-brand-orange font-bold capitalize">{sub.healthConditions.replace('_', ' ')}</span></p>
                    {sub.healthConcerns && sub.healthConcerns !== 'None specified' && (
                      <p><strong>Concerns:</strong> <span className="italic text-stone-550 font-medium">&ldquo;{sub.healthConcerns}&rdquo;</span></p>
                    )}
                    <p className="pt-1 flex items-center gap-1">
                      <span className="bg-[#ffeeda] text-brand-orange px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                        {sub.goal.replace('_', ' ')}
                      </span>
                    </p>
                  </div>

                </div>
              ))}

            </div>

            {/* Clear Database logs */}
            {submissions.length > 0 && (
              <div className="p-4 border-t border-white/50 bg-white/40 flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-grow py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All CRM Logs</span>
                </button>
              </div>
            )}

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
