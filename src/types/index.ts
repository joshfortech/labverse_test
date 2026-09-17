export type Subject = 'physics' | 'chemistry' | 'biology';

export type PracticalStatus = 'in_progress' | 'completed';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  school_name?: string;
  target_waec_year: number;
  created_at: string;
}

export interface Practical {
  id: string;
  subject: Subject;
  title: string;
  description: string;
  slug: string;
  created_at: string;
}

export interface ExperimentSession {
  id: string;
  user_id: string;
  practical_id: string;
  status: PracticalStatus;
  state_data: Record<string, unknown>;
  score?: number;
  completed_at?: string;
  created_at: string;
}

export interface PendulumState {
  length: number;
  angle: number;
  amplitude: number;
  gravity: number;
  isRunning: boolean;
  oscillations: number;
  elapsedTime: number;
  history: PendulumDataPoint[];
  currentAngle: number;
  angularVelocity: number;
}

export interface PendulumDataPoint {
  length: number;
  time20: number;
  period: number;
  periodSquared: number;
}

export interface TitrationState {
  buretVolume: number;
  titrantAdded: number;
  conicalVolume: number;
  indicatorAdded: boolean;
  stopcockOpen: boolean;
  flowRate: number;
  pH: number;
  color: string;
  isEndpointReached: boolean;
  trials: TitrationTrial[];
  currentTrial: Partial<TitrationTrial>;
}

export interface TitrationTrial {
  initial: number;
  final: number;
  titer: number;
}

export type Magnification = '4x' | '10x' | '40x' | '100x';
export type SlideType = 'onion_epidermis' | 'leaf_stomata' | 'cheek_cell' | 'spirogyra';

export interface MicroscopeState {
  magnification: Magnification;
  coarseFocus: number;
  fineFocus: number;
  lightIntensity: number;
  stained: boolean;
  activeSlide: SlideType;
  identifiedParts: string[];
  availableLabels: MicroscopeLabel[];
  showLabels: boolean;
}

export interface MicroscopeLabel {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  isPlaced: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  session: unknown | null;
  loading: boolean;
}

export interface LabUIState {
  sidebarOpen: boolean;
  activeSubject: Subject | null;
  activePractical: string | null;
  isFullscreen: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface SafetyWarning {
  id: string;
  subject: Subject;
  title: string;
  points: string[];
}

export interface WorksheetSubmission {
  sessionId: string;
  practicalId: string;
  answers: Record<string, unknown>;
  score: number;
  feedback: string[];
  submittedAt: string;
}

export interface PhysicsConstants {
  g: number;
  pi: number;
}

export const PHYSICS_CONSTANTS: PhysicsConstants = {
  g: 9.81,
  pi: Math.PI,
};

export const TITRATION_CONSTANTS = {
  EQUIVALENCE_VOLUME: 21.5,
  ENDPOINT_TOLERANCE: 0.3,
  INITIAL_PH: 11.2,
  FINAL_PH: 2.5,
  CONCORDANT_TOLERANCE: 0.20,
} as const;

export const MICROSCOPE_SLIDES: Record<SlideType, MicroscopeSlideData> = {
  onion_epidermis: {
    id: 'onion_epidermis',
    name: 'Onion Epidermal Cell',
    magnification: '40x',
    labels: [
      { id: 'cell_wall', name: 'Cell Wall', x: 45, y: 25, description: 'Rigid outer layer made of cellulose', isPlaced: false },
      { id: 'cell_membrane', name: 'Cell Membrane', x: 48, y: 28, description: 'Semi-permeable membrane controlling movement', isPlaced: false },
      { id: 'cytoplasm', name: 'Cytoplasm', x: 50, y: 45, description: 'Jelly-like substance containing organelles', isPlaced: false },
      { id: 'nucleus', name: 'Nucleus', x: 55, y: 50, description: 'Controls cell activities, contains DNA', isPlaced: false },
      { id: 'vacuole', name: 'Vacuole', x: 60, y: 55, description: 'Large central vacuole with cell sap', isPlaced: false },
    ],
  },
  leaf_stomata: {
    id: 'leaf_stomata',
    name: 'Leaf Stomata',
    magnification: '400x',
    labels: [
      { id: 'guard_cells', name: 'Guard Cells', x: 50, y: 35, description: 'Bean-shaped cells that control stomatal opening', isPlaced: false },
      { id: 'stomatal_pore', name: 'Stomatal Pore', x: 50, y: 45, description: 'Opening for gas exchange', isPlaced: false },
      { id: 'epidermal_cells', name: 'Epidermal Cells', x: 30, y: 60, description: 'Protective outer layer of the leaf', isPlaced: false },
      { id: 'chloroplasts', name: 'Chloroplasts', x: 70, y: 55, description: 'Site of photosynthesis', isPlaced: false },
    ],
  },
  cheek_cell: {
    id: 'cheek_cell',
    name: 'Human Cheek Cell',
    magnification: '400x',
    labels: [
      { id: 'cell_membrane', name: 'Cell Membrane', x: 40, y: 30, description: 'Thin flexible boundary of the cell', isPlaced: false },
      { id: 'cytoplasm', name: 'Cytoplasm', x: 50, y: 45, description: 'Granular material filling the cell', isPlaced: false },
      { id: 'nucleus', name: 'Nucleus', x: 55, y: 40, description: 'Dark central body controlling the cell', isPlaced: false },
    ],
  },
  spirogyra: {
    id: 'spirogyra',
    name: 'Spirogyra Filament',
    magnification: '100x',
    labels: [
      { id: 'cell_wall', name: 'Cell Wall', x: 35, y: 30, description: 'Two-layered wall (pectin and cellulose)', isPlaced: false },
      { id: 'chloroplast', name: 'Spiral Chloroplast', x: 50, y: 40, description: 'Ribbon-shaped chloroplast with pyrenoids', isPlaced: false },
      { id: 'nucleus', name: 'Nucleus', x: 50, y: 55, description: 'Central nucleus suspended by cytoplasmic strands', isPlaced: false },
      { id: 'vacuole', name: 'Central Vacuole', x: 50, y: 65, description: 'Large vacuole with cell sap', isPlaced: false },
    ],
  },
};

export interface MicroscopeSlideData {
  id: SlideType;
  name: string;
  magnification: string;
  labels: MicroscopeLabel[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Omit<UserProfile, 'id' | 'created_at'>;
      };
      practicals: {
        Row: Practical;
        Insert: Omit<Practical, 'id' | 'created_at'>;
        Update: Omit<Practical, 'id' | 'created_at'>;
      };
      experiment_sessions: {
        Row: ExperimentSession;
        Insert: Omit<ExperimentSession, 'id' | 'created_at'>;
        Update: Omit<ExperimentSession, 'id' | 'created_at'>;
      };
    };
  };
}