# Labverse - WAEC Practical Simulator

An interactive 2D practical simulator for WAEC Physics, Chemistry, and Biology practical examinations.

## Features

### Physics Simulators
- **Simple Pendulum Experiment** - Determine acceleration due to gravity (g) using T² vs L
- Real-time physics simulation with canvas rendering
- Interactive length and angle controls
- Automatic data recording and table generation
- WAEC-compliant calculation guidance

### Chemistry Simulators
- **Acid-Base Titration** - Standardize HCl against Na₂CO₃ using Methyl Orange
- Interactive burette and conical flask with realistic liquid simulation
- Color change detection (Yellow → Orange → Pink)
- Dropwise dispensing near endpoint
- Concordant titer calculation

### Biology Simulators
- **Microscopy** - Onion epidermis, leaf stomata, cheek cells, Spirogyra
- Virtual microscope with magnification controls (4x, 10x, 40x, 100x)
- Coarse/fine focus and light intensity adjustment
- Interactive labeling with drag-and-drop
- Iodine stain simulation

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 + Radix UI primitives
- **State Management**: Zustand + React Query
- **Backend**: Supabase (Auth, PostgreSQL, RLS)
- **Animation**: Framer Motion + HTML5 Canvas/SVG

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone and install dependencies
cd labverse
npm install

# Copy environment variables
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Run development server
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Enable Email/Password authentication in Supabase Auth settings

## Project Structure

```
labverse/
├── public/
│   ├── assets/
│   │   ├── lab/          # Apparatus SVGs, specimen textures
│   │   └── audio/        # Lab interaction SFX
├── src/
│   ├── components/
│   │   ├── common/       # Navbar, Sidebar, Modal, Toast
│   │   ├── lab/          # Reusable Apparatus: Burette, Stopwatch, Microscope
│   │   └── ui/           # Radix UI Base Components
│   ├── features/
│   │   ├── auth/         # Auth Forms, Session Provider
│   │   ├── dashboard/    # Subject Cards, Progress Rings
│   │   └── simulators/
│   │       ├── physics/      # Pendulum canvas engine
│   │       ├── chemistry/    # Titration SVG apparatus
│   │       └── biology/      # Microscope viewer
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client, utilities
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript definitions
│   ├── App.tsx
│   └── main.tsx
└── supabase/
    └── migrations/       # SQL schema & RLS policies
```

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

## WAEC Compliance

All simulators follow WAEC marking schemes:
- **Physics**: T² = (4π²/g)L, slope method for g calculation
- **Chemistry**: Concordant titers within ±0.20 cm³, proper endpoint detection
- **Biology**: Correct magnification labeling, anatomical accuracy

## License

MIT License - Built for WAEC students worldwide.