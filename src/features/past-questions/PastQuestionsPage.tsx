import React from 'react';
import { FileText, Clock, CheckCircle, ArrowDown, ArrowUp, Search, Download, Eye, Edit } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

const pastQuestions = [
  {
    id: 'pq-1',
    year: 2024,
    subject: 'Physics',
    paper: 'Paper 3 (Practical)',
    question: 'Simple Pendulum Experiment',
    description: 'A student sets up a simple pendulum and measures the time for 20 oscillations at different lengths. Plot T² against L and determine g.',
    marks: 25,
    timeLimit: '2h 30m',
    type: 'Mechanics',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-2',
    year: 2024,
    subject: 'Physics',
    paper: 'Paper 3 (Practical)',
    question: 'Refraction through Glass Block',
    description: 'Trace rays through a rectangular glass block. Measure angles of incidence and refraction. Plot sin i against sin r to find refractive index.',
    marks: 20,
    timeLimit: '1h 30m',
    type: 'Optics',
    hasSolution: true,
    hasVideo: true,
  },
  {
    id: 'pq-3',
    year: 2024,
    subject: 'Physics',
    paper: 'Paper 3 (Practical)',
    question: 'Ohm\'s Law Verification',
    description: 'Set up a circuit with a resistor, ammeter, voltmeter, and rheostat. Vary current and measure voltage. Plot V against I.',
    marks: 25,
    timeLimit: '2h',
    type: 'Electricity',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-4',
    year: 2023,
    subject: 'Physics',
    paper: 'Paper 3 (Practical)',
    question: 'Focal Length of Convex Lens',
    description: 'Use the u-v method (no parallax) to determine the focal length of a convex lens. Plot 1/v against 1/u.',
    marks: 20,
    timeLimit: '2h',
    type: 'Optics',
    hasSolution: true,
    hasVideo: true,
  },
  {
    id: 'pq-5',
    year: 2023,
    subject: 'Physics',
    paper: 'Paper 3 (Practical)',
    question: 'Speed of Sound in Air',
    description: 'Use resonance tube method. Find first and second resonance positions. Calculate speed of sound and end correction.',
    marks: 20,
    timeLimit: '2h',
    type: 'Waves',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-6',
    year: 2024,
    subject: 'Chemistry',
    paper: 'Paper 3 (Practical)',
    question: 'Acid-Base Titration',
    description: 'Standardize 0.1M HCl against standard Na₂CO₃ solution using Methyl Orange indicator. Calculate exact molarity.',
    marks: 30,
    timeLimit: '2h 30m',
    type: 'Volumetric Analysis',
    hasSolution: true,
    hasVideo: true,
  },
  {
    id: 'pq-7',
    year: 2024,
    subject: 'Chemistry',
    paper: 'Paper 3 (Practical)',
    question: 'Qualitative Analysis - Cations',
    description: 'Identify the cations in an unknown mixture. Perform systematic analysis: Group I, II, III, IV, V separation and confirmatory tests.',
    marks: 35,
    timeLimit: '3h',
    type: 'Qualitative Analysis',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-8',
    year: 2024,
    subject: 'Chemistry',
    paper: 'Paper 3 (Practical)',
    question: 'Enthalpy of Neutralization',
    description: 'Determine the heat of neutralization of HCl and NaOH. Use a polystyrene cup calorimeter. Calculate ΔH in kJ/mol.',
    marks: 25,
    timeLimit: '2h',
    type: 'Thermochemistry',
    hasSolution: true,
    hasVideo: true,
  },
  {
    id: 'pq-9',
    year: 2023,
    subject: 'Chemistry',
    paper: 'Paper 3 (Practical)',
    question: 'Rate of Reaction',
    description: 'Study the effect of concentration on the rate of reaction between HCl and Na₂S₂O₃. Plot 1/time against concentration.',
    marks: 25,
    timeLimit: '2h',
    type: 'Chemical Kinetics',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-10',
    year: 2024,
    subject: 'Biology',
    paper: 'Paper 3 (Practical)',
    question: 'Onion Epidermal Cell',
    description: 'Prepare a temporary mount of onion epidermis. Observe under microscope. Draw and label 3-4 cells. Apply iodine stain.',
    marks: 20,
    timeLimit: '1h 30m',
    type: 'Microscopy',
    hasSolution: true,
    hasVideo: true,
  },
  {
    id: 'pq-11',
    year: 2024,
    subject: 'Biology',
    paper: 'Paper 3 (Practical)',
    question: 'Food Tests',
    description: 'Test for starch (iodine), reducing sugar (Benedict\'s), protein (Biuret), and fat (ethanol emulsion) in food samples.',
    marks: 25,
    timeLimit: '2h',
    type: 'Biochemical Tests',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-12',
    year: 2024,
    subject: 'Biology',
    paper: 'Paper 3 (Practical)',
    question: 'Leaf Stomata Observation',
    description: 'Prepare epidermal peel of a leaf. Observe stomata under microscope. Draw and label. Calculate stomatal index.',
    marks: 20,
    timeLimit: '2h',
    type: 'Microscopy',
    hasSolution: true,
    hasVideo: true,
  },
  {
    id: 'pq-13',
    year: 2023,
    subject: 'Biology',
    paper: 'Paper 3 (Practical)',
    question: 'Transpiration Rate (Potometer)',
    description: 'Set up a potometer. Measure water uptake under different conditions (light, wind, humidity). Calculate transpiration rate.',
    marks: 25,
    timeLimit: '2h 30m',
    type: 'Plant Physiology',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-14',
    year: 2023,
    subject: 'Biology',
    paper: 'Paper 3 (Practical)',
    question: 'Enzyme Activity',
    description: 'Investigate the effect of temperature on catalase activity using hydrogen peroxide and potato extract. Measure oxygen evolution.',
    marks: 25,
    timeLimit: '2h',
    type: 'Biochemistry',
    hasSolution: true,
    hasVideo: true,
  },
  {
    id: 'pq-15',
    year: 2022,
    subject: 'Physics',
    paper: 'Paper 3 (Practical)',
    question: 'Specific Heat Capacity (Method of Mixtures)',
    description: 'Determine specific heat capacity of a metal block using the method of mixtures. Account for heat losses.',
    marks: 20,
    timeLimit: '2h',
    type: 'Thermal Physics',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-16',
    year: 2022,
    subject: 'Chemistry',
    paper: 'Paper 3 (Practical)',
    question: 'Electrolysis of CuSO₄',
    description: 'Electrolyze CuSO₄ solution using copper electrodes. Measure mass change at cathode. Verify Faraday\'s first law.',
    marks: 25,
    timeLimit: '2h 30m',
    type: 'Electrochemistry',
    hasSolution: true,
    hasVideo: false,
  },
  {
    id: 'pq-17',
    year: 2022,
    subject: 'Biology',
    paper: 'Paper 3 (Practical)',
    question: 'Dissection - Flower',
    description: 'Dissect a hibiscus flower. Identify and label all floral parts. Describe the function of each part.',
    marks: 20,
    timeLimit: '2h',
    type: 'Plant Anatomy',
    hasSolution: true,
    hasVideo: true,
  },
];

const subjectColors = {
  Physics: 'bg-blue-100 text-blue-700',
  Chemistry: 'bg-orange-100 text-orange-700',
  Biology: 'bg-green-100 text-green-700',
};

export const PastQuestionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'physics' | 'chemistry' | 'biology'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'year' | 'marks' | 'type'>('year');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const filteredQuestions = pastQuestions
    .filter(q => {
      if (activeTab !== 'all' && q.subject.toLowerCase() !== activeTab) return false;
      if (searchTerm && !q.question.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !q.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !q.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'year') {
        valA = a.year;
        valB = b.year;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  const stats = [
    { label: 'Total Questions', value: pastQuestions.length },
    { label: 'With Solutions', value: pastQuestions.filter(q => q.hasSolution).length },
    { label: 'With Video', value: pastQuestions.filter(q => q.hasVideo).length },
    { label: 'Years Covered', value: [...new Set(pastQuestions.map(q => q.year))].length },
  ];

  const handleSort = (field: 'year' | 'marks' | 'type') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">WAEC Past Questions</h1>
          <p className="mt-1 text-slate-600">Practice with real WAEC practical questions from previous years.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 hover:shadow-md transition-shadow">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'all' | 'physics' | 'chemistry' | 'biology')} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Subjects</TabsTrigger>
              <TabsTrigger value="physics">Physics</TabsTrigger>
              <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
              <TabsTrigger value="biology">Biology</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={(v) => handleSort(v as 'year' | 'marks' | 'type')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="marks">Marks</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1">
            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export All
          </Button>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl', subjectColors[q.subject as keyof typeof subjectColors])}>
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{q.question}</h3>
                        <Badge variant="outline" className={cn(subjectColors[q.subject as keyof typeof subjectColors])}>
                          {q.subject}
                        </Badge>
                        <Badge variant="outline" className="bg-slate-100 text-slate-700">
                          {q.year}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700">
                          {q.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 max-w-2xl">{q.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {q.marks} marks</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {q.timeLimit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {q.hasSolution && (
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> Solution
                        </Button>
                      )}
                      {q.hasVideo && (
                        <Button variant="outline" size="sm" className="flex items-center gap-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          Video
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" /> PDF
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" /> Practice
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No questions found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms</p>
          </Card>
        )}

        <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
          <h3 className="font-bold text-slate-900 mb-4">Study Tips for WAEC Practicals</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, title: 'Time Management', desc: 'Practice completing each practical within the time limit. Allocate time for setup, data collection, calculations, and cleanup.' },
              { icon: CheckCircle, title: 'Master Key Skills', desc: 'Focus on graph plotting, tabulation, error analysis, and precautions - these carry significant marks across all subjects.' },
              { icon: Eye, title: 'Review Marking Schemes', desc: 'Study official WAEC marking schemes to understand exactly what examiners look for in each practical.' },
              { icon: Download, title: 'Simulate Real Conditions', desc: 'Use our simulators to practice under exam conditions. Record data manually to build muscle memory.' },
            ].map((tip, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lab-green-light mb-3">
                  <tip.icon className="h-5 w-5 text-lab-green" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">{tip.title}</h4>
                <p className="text-sm text-slate-600">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};