import React from 'react';
import { BookOpen, CheckCircle, Clock, Target, Download, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

const syllabusData = {
  physics: [
    { code: 'PHY-PR-01', slug: 'pendulum', title: 'Simple Pendulum Experiment', description: 'Determine acceleration due to gravity (g) using T² vs L graph', topics: ['Periodic motion', 'Simple harmonic motion', 'Graphical analysis'], duration: '2h', weight: 15, waecFrequency: 'Very High' },
    { code: 'PHY-PR-02', slug: 'refraction', title: 'Refraction through Glass Block', description: 'Verify Snell\'s law and determine refractive index', topics: ['Refraction', 'Snell\'s law', 'Refractive index'], duration: '1.5h', weight: 12, waecFrequency: 'High' },
    { code: 'PHY-PR-03', slug: 'ohms-law', title: 'Ohm\'s Law Verification', description: 'Determine resistance using V-I characteristics', topics: ['Ohm\'s law', 'Resistance', 'V-I graphs'], duration: '2h', weight: 15, waecFrequency: 'Very High' },
    { code: 'PHY-PR-04', slug: 'convex-lens', title: 'Focal Length of Convex Lens', description: 'Determine focal length using u-v method', topics: ['Lens formula', 'Real/virtual images', 'Magnification'], duration: '2h', weight: 12, waecFrequency: 'High' },
    { code: 'PHY-PR-05', slug: 'speed-of-sound', title: 'Speed of Sound in Air', description: 'Resonance tube method for determining speed of sound', topics: ['Resonance', 'Standing waves', 'End correction'], duration: '2h', weight: 10, waecFrequency: 'Medium' },
    { code: 'PHY-PR-06', slug: 'specific-heat-capacity', title: 'Specific Heat Capacity', description: 'Method of mixtures for determining specific heat capacity', topics: ['Calorimetry', 'Heat transfer', 'Specific heat'], duration: '2h', weight: 10, waecFrequency: 'Medium' },
    { code: 'PHY-PR-07', slug: 'force-constant-spring', title: 'Force Constant of a Spring', description: 'Determine spring constant using Hooke\'s law', topics: ['Hooke\'s law', 'Elastic limit', 'Oscillations'], duration: '1.5h', weight: 8, waecFrequency: 'Low' },
    { code: 'PHY-PR-08', slug: 'archimedes-principle', title: 'Archimedes\' Principle', description: 'Verify Archimedes\' principle and determine relative density', topics: ['Buoyancy', 'Upthrust', 'Relative density'], duration: '2h', weight: 8, waecFrequency: 'Medium' },
  ],
  chemistry: [
    { code: 'CHEM-PR-01', slug: 'titration', title: 'Acid-Base Titration', description: 'Standardize HCl against Na₂CO₃ using Methyl Orange', topics: ['Volumetric analysis', 'Concordant titers', 'Molarity calculation'], duration: '2.5h', weight: 20, waecFrequency: 'Very High' },
    { code: 'CHEM-PR-02', slug: 'qualitative-cations', title: 'Qualitative Analysis - Cations', description: 'Identify unknown cations using systematic analysis', topics: ['Group separation', 'Confirmatory tests', 'Flame tests'], duration: '3h', weight: 18, waecFrequency: 'Very High' },
    { code: 'CHEM-PR-03', slug: 'qualitative-anions', title: 'Qualitative Analysis - Anions', description: 'Identify unknown anions using confirmatory tests', topics: ['Gas evolution tests', 'Precipitation reactions', 'Oxidation states'], duration: '2.5h', weight: 15, waecFrequency: 'High' },
    { code: 'CHEM-PR-04', slug: 'enthalpy-neutralization', title: 'Enthalpy of Neutralization', description: 'Determine heat of neutralization of strong acid and base', topics: ['Thermochemistry', 'Calorimetry', 'Enthalpy change'], duration: '2h', weight: 12, waecFrequency: 'High' },
    { code: 'CHEM-PR-05', slug: 'rate-of-reaction', title: 'Rate of Reaction', description: 'Study effect of concentration on reaction rate', topics: ['Collision theory', 'Rate laws', 'Concentration vs time'], duration: '2h', weight: 10, waecFrequency: 'Medium' },
    { code: 'CHEM-PR-06', slug: 'electrolysis', title: 'Electrolysis', description: 'Determine Faraday\'s constant and electrochemical equivalent', topics: ['Faraday\'s laws', 'Electrochemical series', 'Electrode reactions'], duration: '2.5h', weight: 10, waecFrequency: 'Medium' },
    { code: 'CHEM-PR-07', slug: 'organic-qualitative', title: 'Organic Qualitative Analysis', description: 'Identify functional groups in organic compounds', topics: ['Functional group tests', 'Solubility', 'Derivative formation'], duration: '2h', weight: 8, waecFrequency: 'Low' },
    { code: 'CHEM-PR-08', slug: 'water-analysis', title: 'Water Analysis', description: 'Determine hardness, pH, and dissolved oxygen', topics: ['Water quality', 'EDTA titration', 'Winkler method'], duration: '2h', weight: 7, waecFrequency: 'Low' },
  ],
  biology: [
    { code: 'BIO-PR-01', slug: 'onion-epidermis', title: 'Onion Epidermal Cell', description: 'Observe and label plant cell structure under microscope', topics: ['Cell structure', 'Microscopy', 'Iodine staining'], duration: '1.5h', weight: 15, waecFrequency: 'Very High' },
    { code: 'BIO-PR-02', slug: 'leaf-stomata', title: 'Leaf Stomata Observation', description: 'Examine stomatal distribution and structure', topics: ['Leaf anatomy', 'Transpiration', 'Guard cells'], duration: '2h', weight: 15, waecFrequency: 'High' },
    { code: 'BIO-PR-03', slug: 'cheek-cell', title: 'Human Cheek Cell', description: 'Observe animal cell structure', topics: ['Animal cell', 'Methylene blue stain', 'Cell membrane'], duration: '1.5h', weight: 12, waecFrequency: 'High' },
    { code: 'BIO-PR-04', slug: 'spirogyra', title: 'Spirogyra Filament', description: 'Study algae cell structure and conjugation', topics: ['Algae structure', 'Chloroplasts', 'Reproduction'], duration: '2h', weight: 12, waecFrequency: 'High' },
    { code: 'BIO-PR-05', slug: 'transpiration', title: 'Transpiration Rate', description: 'Measure transpiration using potometer', topics: ['Transpiration', 'Environmental factors', 'Potometer setup'], duration: '2h', weight: 10, waecFrequency: 'Medium' },
    { code: 'BIO-PR-06', slug: 'food-tests', title: 'Food Tests', description: 'Test for starch, protein, reducing sugar, fat', topics: ['Biochemical tests', 'Iodine test', 'Benedict\'s test', 'Biuret test'], duration: '2.5h', weight: 15, waecFrequency: 'Very High' },
    { code: 'BIO-PR-07', slug: 'enzyme-activity', title: 'Enzyme Activity', description: 'Effect of temperature/pH on enzyme activity', topics: ['Enzymes', 'Denaturation', 'Optimum conditions'], duration: '2h', weight: 10, waecFrequency: 'Medium' },
    { code: 'BIO-PR-08', slug: 'photosynthesis', title: 'Photosynthesis Investigation', description: 'Test for starch production in leaves', topics: ['Photosynthesis', 'Chlorophyll', 'Light/dark conditions'], duration: '2h', weight: 8, waecFrequency: 'Medium' },
    { code: 'BIO-PR-09', title: 'Dissection - Flower', description: 'Observe and label floral parts', topics: ['Flower structure', 'Reproductive parts', 'Pollination types'], duration: '2h', weight: 8, waecFrequency: 'Medium' },
    { code: 'BIO-PR-10', title: 'Ecological Sampling', description: 'Quadrat and transect methods for population study', topics: ['Sampling techniques', 'Population density', 'Biodiversity index'], duration: '2.5h', weight: 8, waecFrequency: 'Low' },
  ],
};

const subjectColors = {
  physics: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: BookOpen },
  chemistry: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: BookOpen },
  biology: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: BookOpen },
};

const frequencyColors = {
  'Very High': 'bg-red-100 text-red-700',
  'High': 'bg-orange-100 text-orange-700',
  'Medium': 'bg-amber-100 text-amber-700',
  'Low': 'bg-green-100 text-green-700',
};

export const SyllabusPage: React.FC = () => {
  const [activeSubject, setActiveSubject] = React.useState<'physics' | 'chemistry' | 'biology'>('physics');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const filteredPracticals = syllabusData[activeSubject].filter((prac) =>
    prac.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prac.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prac.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (code: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const totalWeight = syllabusData[activeSubject].reduce((sum, p) => sum + p.weight, 0);
  const completedCount = syllabusData[activeSubject].filter(p => p.waecFrequency === 'Very High' || p.waecFrequency === 'High').length;

  const subjectLabels = { physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology' };
  const colors = subjectColors[activeSubject];

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">WAEC Practical Syllabus</h1>
          <p className="mt-1 text-slate-600">Complete breakdown of all practicals by subject with WAEC marking weights.</p>
        </div>

        <div className="flex gap-3 mb-6">
          {(['physics', 'chemistry', 'biology'] as const).map((subject) => {
            const c = subjectColors[subject];
            const count = syllabusData[subject].length;
            const Icon = c.icon;
            return (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={cn(
                  'flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  activeSubject === subject
                    ? `${c.border} ${c.bg} shadow-md`
                    : 'border-slate-200 hover:border-lab-green/50'
                )}
              >
                <Icon className={cn('h-6 w-6', activeSubject === subject ? c.text : 'text-slate-400')} />
                <div className="flex-1 text-left">
                  <p className={cn('font-semibold', activeSubject === subject ? c.text : 'text-slate-700')}>
                    {subjectLabels[subject]}
                  </p>
                  <p className={cn('text-xs', activeSubject === subject ? c.text : 'text-slate-500')}>
                    {count} practicals • {syllabusData[subject].reduce((s, p) => s + p.weight, 0)}% total weight
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search practicals, topics, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value="all" onValueChange={() => {}}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors.bg)}>
                <Target className={cn('h-5 w-5', colors.text)} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Weight</p>
                <p className="text-2xl font-bold text-slate-900">{totalWeight}%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">High Priority</p>
                <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Est. Total Time</p>
                <p className="text-2xl font-bold text-slate-900">
                  {syllabusData[activeSubject].reduce((sum, p) => sum + parseFloat(p.duration), 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {filteredPracticals.map((prac) => {
            const isExpanded = expandedItems.has(prac.code);
            return (
              <Card key={prac.code} className={cn('overflow-hidden transition-all', isExpanded && 'shadow-lg')}>
                <div
                  onClick={() => toggleExpand(prac.code)}
                  className="p-4 cursor-pointer hover:bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', colors.bg)}>
                      <span className={cn('font-mono text-sm font-bold', colors.text)}>{prac.code}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{prac.title}</h3>
                      <p className="text-sm text-slate-500">{prac.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className={cn(frequencyColors[prac.waecFrequency as keyof typeof frequencyColors])}>
                      {prac.waecFrequency}
                    </Badge>
                    <span className="font-mono text-slate-600">{prac.duration}</span>
                    <span className="font-mono text-slate-600">{prac.weight}%</span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50 animate-in">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Key Topics Covered</h4>
                        <ul className="space-y-1">
                          {prac.topics.map((topic, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle className={cn('h-4 w-4 flex-shrink-0', colors.text)} />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Exam Focus Areas</h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          <li>• Accurate data recording and tabulation</li>
                          <li>• Correct graph plotting (axes, scale, line of best fit)</li>
                          <li>• Proper calculation with units</li>
                          <li>• Error analysis and precautions</li>
                          <li>• Conclusion linked to theory</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <Button asChild variant="outline" className="flex items-center gap-2">
                        <a href={`/${activeSubject}/${prac.slug}`}>
                          <BookOpen className="h-4 w-4" /> Open Simulator
                        </a>
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" /> Download Worksheet
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredPracticals.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No practicals found</h3>
            <p className="text-slate-500">Try adjusting your search terms</p>
          </Card>
        )}
      </div>
    </div>
  );
};