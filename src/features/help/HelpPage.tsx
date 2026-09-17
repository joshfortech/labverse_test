import React from 'react';
import { 
  LifeBuoy, BookOpen, Shield, AlertTriangle, Mail, 
  ChevronDown, ChevronUp, Search, CheckCircle, 
  FlaskConical, Microscope, Zap, Heart, Download, Video
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Get Started" in the top right corner or go to /register. Fill in your details including full name, email, password, and optionally your school name. You\'ll receive a verification email to activate your account.',
      },
      {
        q: 'Is Labverse free to use?',
        a: 'Yes! Labverse is completely free for all students preparing for WAEC practical exams. All simulators, past questions, and study materials are accessible without any subscription.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No installation required. Labverse runs entirely in your web browser. Just visit the website and start practicing. We recommend using Chrome, Firefox, or Edge for the best experience.',
      },
      {
        q: 'Can I use Labverse offline?',
        a: 'Currently, Labverse requires an internet connection for authentication and syncing progress. However, your simulation data is saved locally in your browser, so you won\'t lose your work if connection drops temporarily.',
      },
    ],
  },
  {
    category: 'Simulators',
    questions: [
      {
        q: 'How accurate are the physics simulations?',
        a: 'Our physics simulations use real-time numerical integration (Euler method) with proper physics equations. The pendulum uses θ\'\' = -(g/L)sin(θ) for accurate large-angle motion. Results match theoretical predictions within 1-2%.',
      },
      {
        q: 'Why does the titration color change at specific volumes?',
        a: 'The color changes are based on real chemistry: Methyl Orange transitions from yellow (pH > 4.4) to orange (pH 3.1-4.4) to pink (pH < 3.1). The equivalence point for 0.1M HCl vs 0.1M Na₂CO₃ is at 21.5 mL with ±0.3 mL endpoint tolerance.',
      },
      {
        q: 'Can I zoom and pan in the microscope viewer?',
        a: 'Yes! Use mouse wheel to zoom (Ctrl+wheel for finer control), click and drag to pan. There are also zoom buttons in the top-left of the viewer. Double-click to reset view.',
      },
      {
        q: 'How do I label structures in the microscope?',
        a: 'Click on a structure name in the "Identify Structures" panel, then click on the corresponding location in the microscope image. The label will be placed with a marker. You can switch slides to practice different specimens.',
      },
      {
        q: 'Are the WAEC codes (PHY-PR-01, etc.) official?',
        a: 'These codes follow WAEC\'s practical numbering convention but are Labverse-specific identifiers. They help you track which practicals correspond to WAEC syllabus topics.',
      },
    ],
  },
  {
    category: 'Progress & Account',
    questions: [
      {
        q: 'How is my progress saved?',
        a: 'Your simulation data (pendulum lengths, titration trials, microscope labels) is saved automatically to your browser\'s localStorage. When logged in, it also syncs to your Supabase account for cross-device access.',
      },
      {
        q: 'Can I reset my progress for a practical?',
        a: 'Yes! Each simulator has a "Reset" button that clears all recorded data for that practical. Your account progress (completed practicals, scores) remains intact.',
      },
      {
        q: 'How are scores calculated?',
        a: 'Scores are based on accuracy of measurements, correct calculations, proper graph plotting, and adherence to WAEC marking schemes. The simulator provides instant feedback on each step.',
      },
      {
        q: 'Can I download my worksheet data?',
        a: 'Yes! Each simulator has a "Submit Worksheet" button (currently being implemented) that will generate a PDF with your data, calculations, graphs, and score. You can also export past question attempts.',
      },
      {
        q: 'How do I change my password?',
        a: 'Go to Profile → Settings. Currently, password change requires signing out and using the "Forgot Password" link on the login page. We\'re adding direct password change in the next update.',
      },
    ],
  },
  {
    category: 'WAEC Exam Prep',
    questions: [
      {
        q: 'Does Labverse cover the entire WAEC practical syllabus?',
        a: 'We cover the most frequently examined practicals (8 Physics, 8 Chemistry, 10 Biology). The syllabus page shows all topics with WAEC frequency ratings (Very High to Low) based on past exam analysis.',
      },
      {
        q: 'Are the past questions from real WAEC exams?',
        a: 'Yes, our past questions are based on actual WAEC practical papers from 2022-2024. We\'ve recreated the exact scenarios, mark allocations, and time limits.',
      },
      {
        q: 'What\'s the best way to prepare using Labverse?',
        a: '1) Start with the Syllabus to see high-priority practicals. 2) Practice each simulator multiple times. 3) Attempt past questions under timed conditions. 4) Review solutions and marking schemes. 5) Track progress in your dashboard.',
      },
      {
        q: 'Do you provide marking schemes?',
        a: 'Yes! Each past question has a detailed solution with marking points. The simulators also show WAEC-specific tips (e.g., "Concordant titers within ±0.20 cm³", "Small angles <15° for SHM").',
      },
      {
        q: 'Can teachers use Labverse in class?',
        a: 'Absolutely! Labverse is great for classroom demonstrations. Teachers can project simulators, use them for virtual labs when equipment is limited, and assign practice as homework.',
      },
    ],
  },
  {
    category: 'Technical Issues',
    questions: [
      {
        q: 'The simulator is lagging/freezing. What should I do?',
        a: 'Try: 1) Close other browser tabs. 2) Disable browser extensions. 3) Update your browser. 4) Clear cache (Ctrl+Shift+R). 5) Reduce browser zoom to 100%. The canvas animations work best on modern browsers with hardware acceleration.',
      },
      {
        q: 'My data disappeared after refreshing.',
        a: 'Simulation data is saved to localStorage automatically. If data is lost, check: 1) You\'re using the same browser/device. 2) Browser isn\'t in incognito/private mode. 3) localStorage isn\'t cleared on exit. Logged-in users have cloud backup.',
      },
      {
        q: 'I can\'t log in / verification email not received.',
        a: 'Check spam/junk folder. Ensure you entered the correct email. If using a school email, the domain might block external emails. Try a personal Gmail/Outlook. Contact support if issue persists.',
      },
      {
        q: 'The microscope images won\'t load.',
        a: 'This is usually a network issue. Refresh the page. If persistent, check your internet connection. The images are SVGs loaded from our CDN - they should load within 1-2 seconds.',
      },
      {
        q: 'How do I report a bug or suggest a feature?',
        a: 'Use the "Contact Support" button below or email support@labverse.app. Include: browser version, device, steps to reproduce, and screenshots if possible. We respond within 24-48 hours.',
      },
    ],
  },
];

const safetyGuidelines = [
  {
    subject: 'Physics',
    title: 'Physics Laboratory Safety',
    icon: FlaskConical,
    color: 'blue',
    points: [
      'Always wear safety goggles during experiments',
      'Secure pendulum bob firmly before release',
      'Handle glass blocks and lenses by edges only',
      'Check electrical connections before powering circuits',
      'Use appropriate voltage/current ratings for components',
      'Keep water away from electrical equipment',
      'Allow hot equipment to cool before handling',
      'Report broken glass or damaged equipment immediately',
    ],
  },
  {
    subject: 'Chemistry',
    title: 'Chemistry Laboratory Safety',
    icon: FlaskConical,
    color: 'orange',
    points: [
      'Wear lab coat, goggles, and closed shoes at all times',
      'Never pipette by mouth - use pipette fillers',
      'Add acid to water, never water to acid',
      'Know location of eyewash station and safety shower',
      'Label all containers clearly',
      'Dispose of chemicals in designated waste containers',
      'Never return unused chemicals to stock bottles',
      'Keep flammable materials away from open flames',
      'Use fume hood for volatile/toxic substances',
      'Wash hands thoroughly after lab work',
    ],
  },
  {
    subject: 'Biology',
    title: 'Biology Laboratory Safety',
    icon: Microscope,
    color: 'green',
    points: [
      'Wear gloves when handling biological specimens',
      'Sterilize equipment before and after use',
      'Handle microscopes with two hands (base and arm)',
      'Use coverslips at an angle to avoid air bubbles',
      'Dispose of biological waste in biohazard containers',
      'Never eat, drink, or apply cosmetics in the lab',
      'Report cuts or needle sticks immediately',
      'Decontaminate work surfaces after each session',
      'Store cultures in labeled, sealed containers',
      'Wash hands with antimicrobial soap after handling specimens',
    ],
  },
];

const contactInfo = {
  email: 'support@labverse.app',
  github: 'github.com/labverse',
  twitter: '@labverse_app',
  responseTime: '24-48 hours',
};

export const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'faq' | 'safety' | 'contact'>('faq');
  const [expandedFaq, setExpandedFaq] = React.useState<string | null>(null);

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  const toggleFaq = (question: string) => {
    setExpandedFaq(prev => prev === question ? null : question);
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
          <p className="mt-1 text-slate-600">Find answers to common questions, safety guidelines, and contact information.</p>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'faq' | 'safety' | 'contact')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq"><LifeBuoy className="h-4 w-4 mr-2" /> FAQ</TabsTrigger>
              <TabsTrigger value="safety"><Shield className="h-4 w-4 mr-2" /> Safety Guidelines</TabsTrigger>
              <TabsTrigger value="contact"><Mail className="h-4 w-4 mr-2" /> Contact Us</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredFaqs.map((category) => (
              <Card key={category.category} className="overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">{category.category}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {category.questions.map((faq) => {
                    const isOpen = expandedFaq === faq.q;
                    return (
                      <div key={faq.q} className="px-6 py-4">
                        <button
                          onClick={() => toggleFaq(faq.q)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
                          {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                        </button>
                        {isOpen && (
                          <p className="mt-4 text-slate-600 leading-relaxed">{faq.a}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}

            {filteredFaqs.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-500">Try different search terms or browse categories</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">Important Safety Notice</h3>
                  <p className="text-sm text-amber-800">
                    These are general safety guidelines for WAEC practical examinations. 
                    Always follow your school\'s specific safety protocols and your teacher\'s instructions. 
                    In a real laboratory, additional precautions may apply.
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="physics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="physics"><FlaskConical className="h-4 w-4 mr-2" /> Physics</TabsTrigger>
                <TabsTrigger value="chemistry"><FlaskConical className="h-4 w-4 mr-2" /> Chemistry</TabsTrigger>
                <TabsTrigger value="biology"><Microscope className="h-4 w-4 mr-2" /> Biology</TabsTrigger>
              </TabsList>

              {safetyGuidelines.map((guide) => (
                <TabsContent key={guide.subject} value={guide.subject} className="mt-4">
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', `bg-${guide.color}-100`)}>
                          <guide.icon className={cn('h-6 w-6', `text-${guide.color}-600`)} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{guide.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {guide.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                            <CheckCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', `text-${guide.color}-600`)} />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">General Lab Rules (All Subjects)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  'Know emergency exits and assembly points',
                  'Never work alone in the laboratory',
                  'Read all instructions before starting',
                  'Keep work area clean and organized',
                  'Report all accidents immediately',
                  'No unauthorized experiments',
                  'Clean up spills immediately',
                  'Return equipment to proper storage',
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{rule}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Contact Support</h3>
              <p className="text-slate-600 mb-6">Can\'t find what you\'re looking for? We\'re here to help!</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Email Support</h4>
                    <p className="text-sm text-slate-600">{contactInfo.email}</p>
                    <p className="text-xs text-slate-500 mt-1">Response time: {contactInfo.responseTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Bug Reports</h4>
                    <p className="text-sm text-slate-600">Include browser, device, steps to reproduce</p>
                    <p className="text-xs text-slate-500 mt-1">We prioritize critical bugs</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Feature Requests</h4>
                    <p className="text-sm text-slate-600">Suggest new practicals or improvements</p>
                    <p className="text-xs text-slate-500 mt-1">Community-voted features get priority</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <Video className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Video Tutorials</h4>
                    <p className="text-sm text-slate-600">Coming soon to our YouTube channel</p>
                    <p className="text-xs text-slate-500 mt-1">Subscribe for updates</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'WAEC Official Syllabus', href: 'https://waecnigeria.org', icon: BookOpen },
                  { label: 'Labverse GitHub', href: contactInfo.github, icon: Download },
                  { label: 'Follow on Twitter', href: `https://twitter.com/${contactInfo.twitter.replace('@', '')}`, icon: Video },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <link.icon className="h-6 w-6 text-lab-green" />
                    <span className="font-medium text-slate-900">{link.label}</span>
                  </a>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-lab-green-light border-lab-green/50">
              <h3 className="font-bold text-slate-900 mb-2">Still need help?</h3>
              <p className="text-slate-600 mb-4">Our team is ready to assist you with any questions about Labverse, WAEC preparation, or technical issues.</p>
              <Button asChild className="bg-lab-green hover:bg-lab-green/90">
                <a href={`mailto:${contactInfo.email}?subject=Labverse Support Request`}>
                  <Mail className="h-4 w-4 mr-2" /> Email Support Team
                </a>
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};