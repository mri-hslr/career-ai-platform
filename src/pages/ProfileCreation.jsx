import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Loader2, User, BookOpen, 
  Heart, Compass, Star, DollarSign, X, Mail, 
  Briefcase, Zap, Trophy, Clock, Target, ShieldCheck, Users 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { getModuleQuestions, submitAssessment } from '../services/api/assessmentApi';
import { apiClient } from '../services/api/apiClient';
import { getCurrentUser, getUserDisplayName } from '../utils/jwt';

// ============================================================================
// CONSTANTS & CONFIGS
// ============================================================================

const MODULES = [
  { key: 'profile',   label: 'Basic Profile',      icon: User,       desc: 'Let’s start with the basics to establish your identity.' },
  { key: 'academic',  label: 'Academic Profile',   icon: BookOpen,   desc: 'Share your academic background and learning style.' },
  { key: 'lifestyle', label: 'Lifestyle & Habits', icon: Heart,      desc: 'Help us understand your daily routine and focus habits.' },
  { key: 'interests', label: 'Interests & Skills', icon: Compass,    desc: 'What drives you, excites you, and where your strengths lie.' },
  { key: 'aspiration',label: 'Aspirations',        icon: Star,       desc: 'Your vision for the future and ultimate career goals.' },
  { key: 'financial', label: 'Financial Context',  icon: DollarSign, desc: 'Context to help us recommend practical, tailored paths.' },
];

const QUESTION_CONFIGS = {
  full_name: { type: 'text', placeholder: 'e.g. John Doe' },
  dob: { type: 'date' },
  gender: { type: 'select', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  current_class: { type: 'select', options: ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College 1st Year', 'College 2nd Year', 'College 3rd Year'] },
  school_type: { type: 'select', options: ['Government', 'Private', 'International', 'Semi-Government'] },
  state: { type: 'text', placeholder: 'e.g., Maharashtra, Delhi' },
  area_type: { type: 'select', options: ['Urban', 'Semi-Urban', 'Rural'] },
  medium_of_learning: { type: 'select', options: ['English', 'Hindi', 'Regional Language', 'Mixed (English + Hindi)'] },
  overall_percentage_band: { type: 'select', options: ['Below 40%', '40–60%', '60–75%', '75–90%', 'Above 90%'] },
  strongest_subject: { type: 'text', placeholder: 'e.g., Mathematics, Physics' },
  weakest_subject: { type: 'text', placeholder: 'e.g., History, Geography' },
  favorite_subject: { type: 'text', placeholder: 'e.g., Computer Science (regardless of marks)' },
  learning_style: { type: 'select', options: ['Visual (Videos & Diagrams)', 'Auditory (Lectures & Podcasts)', 'Kinesthetic (Hands-on & Doing)'] },
  study_hours_home: { type: 'select', options: ['Less than 1 hour/day', '1–2 hours/day', '2–4 hours/day', 'More than 4 hours/day'] },
  homework_completion: { type: 'select', options: ['Always (90–100%)', 'Usually (70–90%)', 'Sometimes (50–70%)', 'Rarely (below 50%)'] },
  achievements: { type: 'textarea', placeholder: 'List any academic or co-curricular achievements, or type "None"' },
  screen_time: { type: 'select', options: ['Less than 1 hr/day', '1–2 hrs/day', '2–4 hrs/day', 'More than 4 hrs/day'] },
  sleep_quality: { type: 'select', options: ['Less than 6 hrs (poor)', '6–7 hrs (adequate)', '7–8 hrs (good)', 'More than 8 hrs (excellent)'] },
  study_hours: { type: 'select', options: ['Less than 1 hr', '1–2 hrs of deep work', '2–4 hrs of deep work', 'More than 4 hrs'] },
  routine_consistency: { type: 'scale10', label: 'Routine Strictness' },
  distraction_level: { type: 'select', options: ['Very easily distracted', 'Somewhat distracted', 'Rarely distracted', 'Completely focused'] },
  reaction_to_failure: { type: 'select', options: ['Get upset and give up', 'Feel bad, but try again later', 'Analyze what went wrong and fix it', 'Stay calm and bounce back immediately'] },
  pressure_handling: { type: 'select', options: ['Panic and freeze', 'Get anxious but eventually manage', 'Handle with moderate stress', 'Thrive under pressure'] },
  social_preference: { type: 'select', options: ['Group study (collaborative)', 'Solo focus (independent deep work)'] },
  focus_ability: { type: 'select', options: ['Less than 20 minutes', '20–45 minutes', '45–90 minutes', 'More than 2 hours'] },
  biggest_distraction: { type: 'text', placeholder: 'e.g., Social media, mobile games' },
  work_environment: { type: 'select', options: ['Indoor / Office / Lab setting', 'Outdoor / Field / On-site work'] },
  work_style: { type: 'select', options: ['Team-based & collaborative', 'Individual deep-work & independent'] },
  biggest_strength: { type: 'text', placeholder: 'e.g., Problem-solving, communication' },
  biggest_weakness: { type: 'text', placeholder: 'e.g., Procrastination, public speaking' },
  preferred_activity: { type: 'text', placeholder: 'e.g., Coding, drawing, writing, sports' },
  interest_domain: { type: 'select', options: ['Technology & Computers', 'Art, Design & Media', 'Business & Finance', 'Social Work & Education', 'Science & Research', 'Healthcare & Medicine', 'Law & Governance', 'Not Sure Yet'] },
  leadership: { type: 'select', options: ['Yes, I love leading and organizing', 'Sometimes, depends on the situation', 'Not really, I prefer to follow'] },
  helping_nature: { type: 'select', options: ['Yes, very fulfilling to me', 'Somewhat fulfilling', 'Not particularly my thing'] },
  data_orientation: { type: 'select', options: ['Yes, I love numbers & data', 'Somewhat comfortable with data', 'No, I prefer creative/verbal work'] },
  creativity: { type: 'select', options: ['Yes, very creative', 'Somewhat creative', 'Not particularly creative'] },
  research_inclination: { type: 'select', options: ['Yes, I love deep research', 'Sometimes', 'Not really'] },
  physical_activity: { type: 'select', options: ['Yes, active/moving work', 'No preference', 'No, desk/mental work'] },
  preferred_career_type: { type: 'select', options: ['Government / Public Sector', 'Private Company / Corporate', 'Own Business / Entrepreneurship', 'Freelance / Independent', 'Not Sure Yet'] },
  career_awareness: { type: 'select', options: ['High – I know exactly what I want', 'Medium – I have a general idea', 'Low – Still actively exploring'] },
  dream_career: { type: 'text', placeholder: 'e.g., Software Engineer, Doctor, Designer' },
  life_direction: { type: 'text', placeholder: 'e.g., Getting into an IIT, starting a business' },
  ten_year_vision: { type: 'textarea', placeholder: 'Where do you want to be in 10 years?' },
  why_this_career: { type: 'select', options: ['Passion', 'Money', 'Respect / Status', 'Family Expectation', 'Impact'] },
  what_matters_most: { type: 'select', options: ['Money & Financial Security', 'Happiness & Work-Life Balance', 'Impact & Making a Difference', 'Stability & Job Security', 'Recognition & Status'] },
  what_drives_you: { type: 'text', placeholder: 'e.g., Desire to prove myself, love of the subject' },
  what_stops_you: { type: 'text', placeholder: 'e.g., Lack of resources, uncertainty' },
  goal_clarity: { type: 'select', options: ['Very clear', 'Somewhat clear', 'Not clear'] },
  steps_taken: { type: 'select', options: ['Yes, actively working towards it', 'Just starting out', 'No, not yet'] },
  no_constraints_vision: { type: 'textarea', placeholder: 'If money and time were no barrier, what would you do?' },
  five_year_goal: { type: 'text', placeholder: 'Specific goal for the next 5 years' },
  family_structure: { type: 'select', options: ['Nuclear Family', 'Joint Family', 'Single Parent Household', 'Other'] },
  income_band: { type: 'select', options: ['Below ₹3 LPA', '₹3–5 LPA', '₹5–10 LPA', '₹10–20 LPA', 'Above ₹20 LPA'] },
  father_education: { type: 'select', options: ['Below 10th Standard', '10th / SSC', '12th / HSC', 'Diploma / ITI', 'Graduate', 'Post-Graduate or higher'] },
  mother_education: { type: 'select', options: ['Below 10th Standard', '10th / SSC', '12th / HSC', 'Diploma / ITI', 'Graduate', 'Post-Graduate or higher'] },
  affordability_level: { type: 'select', options: ['Need affordable options', 'Can stretch a little', 'Can invest in quality education'] },
  coaching_access: { type: 'select', options: ['Yes, in a coaching institute', 'No, but considering it', 'No, self-study', 'No, online resources'] },
};

// ============================================================================
// HELPER SUB-COMPONENTS
// ============================================================================

function QuestionField({ questionKey, value, onChange }) {
  const config = QUESTION_CONFIGS[questionKey] || { type: 'text', placeholder: 'Your answer...' };
  const baseInput = "w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm";

  if (config.type === 'select') {
    return (
      <select 
        value={value || ''} 
        onChange={e => onChange(questionKey, e.target.value)} 
        className={`${baseInput} ${!value ? 'text-slate-400' : 'text-slate-800'}`}
      >
        <option value="" disabled>Select an option...</option>
        {config.options.map(opt => <option key={opt} value={opt} className="text-slate-800">{opt}</option>)}
      </select>
    );
  }
  if (config.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(questionKey, e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className={`${baseInput} resize-none`}
      />
    );
  }
  if (config.type === 'date') {
    return (
      <input type="date" value={value || ''} onChange={e => onChange(questionKey, e.target.value)} className={baseInput} />
    );
  }
  if (config.type === 'scale10') {
    const num = parseInt(value);
    return (
      <div className="space-y-3">
        <div className="flex gap-1">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(questionKey, n.toString())}
              className={`flex-1 py-3 text-sm font-bold border transition-all ${
                n === 1 ? 'rounded-l-lg' : n === 10 ? 'rounded-r-lg' : ''
              } ${
                num === n 
                  ? 'bg-blue-600 border-blue-600 text-white z-10 relative shadow-md' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              } ${n !== 1 ? '-ml-px' : ''}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>1 — No Routine</span>
          <span>10 — Very Strict</span>
        </div>
      </div>
    );
  }
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(questionKey, e.target.value)}
      placeholder={config.placeholder || 'Your answer...'}
      className={baseInput}
    />
  );
}

// ============================================================================
// PROFILE VIEW COMPONENT (READ ONLY)
// ============================================================================

const ViewRow = ({ label, value, icon: Icon, iconBg = "bg-blue-100", iconColor = "text-blue-600" }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-all border border-transparent hover:border-blue-100">
    <div className={`mt-1 p-2 ${iconBg} ${iconColor} rounded-lg shadow-sm`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-extrabold text-slate-800 leading-tight">{value || "Not provided"}</p>
    </div>
  </div>
);

const ViewSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gradient-to-br from-white to-slate-50 rounded-[32px] border border-blue-100 shadow-md hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden mb-6">
    <div className="px-8 py-5 bg-white/50 border-b border-blue-50 flex items-center gap-3">
      <Icon size={18} className="text-blue-500" />
      <h3 className="font-black uppercase tracking-tight text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">
        {title}
      </h3>
    </div>
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
      {children}
    </div>
  </div>
);

function ProfileView({ userData, answers }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12 px-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-[40px] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 shadow-xl shadow-blue-200/50">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-inner border border-white/30">
            {userData.full_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{userData.full_name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-blue-50 font-bold">
              <span className="flex items-center gap-1.5"><Mail size={16} className="text-blue-200"/> {userData.email}</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs border border-white/20 backdrop-blur-sm">
                <ShieldCheck size={14} className="text-emerald-300"/> Verified Profile
              </span>
            </div>
          </div>
        </div>
      </div>

      <ViewSection title="Academic Profile" icon={BookOpen}>
        <ViewRow label="Favorite Subject" value={answers.favorite_subject} icon={Star} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <ViewRow label="Strongest Subject" value={answers.strongest_subject} icon={Zap} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <ViewRow label="Weakest Subject" value={answers.weakest_subject} icon={Target} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <ViewRow label="Learning Style" value={answers.learning_style} icon={BookOpen} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <ViewRow label="Perf. Band" value={answers.overall_percentage_band} icon={Trophy} iconBg="bg-blue-100" iconColor="text-blue-600" />
      </ViewSection>

      <ViewSection title="Lifestyle & Habits" icon={Heart}>
        <ViewRow label="Study Hours" value={answers.study_hours_home} icon={Clock} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <ViewRow label="Screen Time" value={answers.screen_time} icon={Zap} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <ViewRow label="Social Pref" value={answers.social_preference} icon={Users} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
      </ViewSection>

      <ViewSection title="Aspirations" icon={Target}>
        <ViewRow label="Dream Career" value={answers.dream_career} icon={Briefcase} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <ViewRow label="Vision" value={answers.ten_year_vision} icon={Compass} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <ViewRow label="Target Grade" value={answers.target_grade} icon={Trophy} iconBg="bg-purple-100" iconColor="text-purple-600" />
      </ViewSection>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ProfileCreation() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  const [userData, setUserData] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [allQuestions, setAllQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [loadingStep, setLoadingStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const mapBackendToFrontend = useCallback((data) => {
    return {
      full_name: data.full_name || "",
      email: data.email || "",
      favorite_subject: data.academic_data?.favorite_subject || "",
      strongest_subject: data.academic_data?.strongest_subject || "",
      weakest_subject: data.academic_data?.weakest_subject || "",
      overall_percentage_band: data.academic_data?.overall_percentage_band || "",
      learning_style: data.academic_data?.learning_style || "",
      study_hours_home: data.academic_data?.study_hours_home || "",
      screen_time: data.lifestyle_data?.screen_time || data.lifestyle_data?.daily_screen_time || "",
      social_preference: data.lifestyle_data?.social_preference || "",
      dream_career: data.aspiration_data?.dream_career || data.aspiration_data?.career_goal || "",
      ten_year_vision: data.aspiration_data?.ten_year_vision || "",
      target_grade: data.apti_data?.target_grade || data.apti_data?.scores?.target_grade || ""
    };
  }, []);

  useEffect(() => {
    async function fetchUserStatus() {
      try {
        const response = await apiClient.get('/api/v1/auth/users/me');
        setUserData(response);
        if (response.progress?.profile_done || response.academic_data) {
          setAnswers(mapBackendToFrontend(response));
        }
      } catch (err) {
        console.error("Fetch User Data Error:", err);
      } finally {
        setGlobalLoading(false);
      }
    }
    fetchUserStatus();
  }, [mapBackendToFrontend]);

  useEffect(() => {
    if (!done && userData && !userData.progress.profile_done) {
        loadQuestions(step);
    }
  }, [step, done, userData]);

  async function loadQuestions(stepIndex) {
    const mod = MODULES[stepIndex];
    if (allQuestions[mod.key]) return;
    setLoadingStep(true);
    try {
      const response = await getModuleQuestions(mod.key);
      const questionsObj = response?.data?.questions || response?.questions || {};
      const filtered = {};
      Object.entries(questionsObj).forEach(([k, v]) => {
        if (typeof v === 'string' && v.trim() !== '') filtered[k] = v;
      });
      setAllQuestions(prev => ({ ...prev, [mod.key]: filtered }));
    } catch (e) {
      toast.error(`Failed to load questions.`);
    } finally {
      setLoadingStep(false);
    }
  }

  const handleAnswer = (key, val) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    if (key === 'full_name' && val) localStorage.setItem('harmony_profile_name', val.split(' ')[0]);
  };

  const handleNext = async () => {
    const mod = MODULES[step];
    const questions = allQuestions[mod.key] || {};
    const requiredKeys = Object.keys(questions);
    const missingFields = requiredKeys.filter(k => !answers[k]?.toString().trim());

    if (missingFields.length > 0) {
      toast.error('All fields are mandatory.');
      return;
    }

    const payload = {};
    requiredKeys.forEach(k => { payload[k] = answers[k] || ''; });

    setSubmitting(true);
    try {
      if (user?.userId) await submitAssessment({ userId: user.userId, moduleKey: mod.key, payload });
      if (step < MODULES.length - 1) {
        setStep(s => s + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        localStorage.setItem('harmony_profile_done', 'true');
        setDone(true);
      }
    } catch (e) {
      toast.error('Save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (globalLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 size={40} className="animate-spin text-blue-600" />
      <p className="font-black text-slate-400 tracking-tighter uppercase text-xs">Syncing Engine...</p>
    </div>
  );

  if (userData?.progress?.profile_done && !done) return <ProfileView userData={userData} answers={answers} />;

  if (done) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-slate-200 shadow-xl p-12 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/50">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Profile Assembled</h2>
        <p className="text-slate-600 font-medium mb-10 leading-relaxed">Excellent work. Your core profile data has been securely saved.</p>
        <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">Return to Profile</button>
      </motion.div>
    </div>
  );

  const Icon = MODULES[step].icon;
  const progressPercent = Math.round((step / MODULES.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"><ArrowLeft size={18} /> Exit Builder</button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-sm"><User size={16} className="text-white" /></div>
          <span className="text-base font-black text-slate-900 tracking-tight">Profile Engine</span>
        </div>
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Mod {step + 1} / {MODULES.length}</div>
      </div>

      <div className="w-full h-1 bg-slate-200">
        <motion.div className="h-full bg-blue-600" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-12">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <div className="mb-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center shrink-0">
                <Icon size={28} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{MODULES[step].label}</h1>
                <p className="text-slate-500 font-medium text-lg">{MODULES[step].desc}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
              {loadingStep ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Syncing Schema...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(allQuestions[MODULES[step].key] || {}).map(([key, questionText]) => (
                    <div key={key} className="space-y-3">
                      <label className="block text-sm font-black text-slate-900 uppercase tracking-tighter">{questionText || key}</label>
                      <QuestionField questionKey={key} value={answers[key]} onChange={handleAnswer} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loadingStep && (
              <div className="flex gap-4 items-center">
                {step > 0 && <button onClick={() => { setStep(s => s - 1); window.scrollTo(0,0); }} className="px-8 py-4 bg-white border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors">Previous</button>}
                <button onClick={handleNext} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-4 font-black text-white rounded-2xl shadow-lg transition-all hover:bg-blue-700 disabled:opacity-70 bg-blue-600">
                  {submitting ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : step === MODULES.length - 1 ? "Finalize Profile" : "Save & Continue"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}