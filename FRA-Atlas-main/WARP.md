# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The Rural Empowerment Atlas is a comprehensive Decision Support System for Forest Rights Act (FRA) implementation in India. It combines GIS mapping, AI-powered asset detection, scheme recommendation engine, and multilingual support to empower rural communities and government officials.

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/ui + Tailwind CSS + Framer Motion
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Maps**: Leaflet + React-Leaflet
- **State Management**: React Query + Context API
- **Internationalization**: react-i18next
- **Backend Services**: Docker-composed microservices (Node.js, Python OCR, MQTT)

## Development Commands

### Primary Development
```bash
# Start development server (main frontend)
npm run dev

# Start development server (user frontend)
cd drishti-gis-user && npm run dev

# Build for production
npm run build

# Build development version
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Docker Services
```bash
# Start all services (from drishti-gis-admin/)
docker-compose up -d

# View service logs
docker-compose logs -f backend
docker-compose logs -f ocr-service

# Restart specific service
docker-compose restart backend

# Stop all services
docker-compose down
```

### Supabase Management
```bash
# Setup DSS sample data
./setup_dss_data.ps1

# Push database migrations
supabase db push --file "supabase/migrations/add_dss_sample_data.sql"

# Connect to remote Supabase
supabase link --project-ref yabhcilwgtcwozfaikez
```

## Architecture Overview

### Frontend Structure
The application follows a modular component-based architecture:

- **`src/pages/`**: Route-level components (Landing, Atlas, Village, DSS, Admin, Login)
- **`src/components/`**: Reusable UI components organized by functionality
- **`src/contexts/`**: React Context providers (AuthContext for session management)
- **`src/integrations/supabase/`**: Database client and type definitions

### Key Components

**Core Application Components:**
- `SmartFRAAtlas.tsx`: Interactive GIS mapping with satellite imagery and FRA patta visualization
- `DecisionSupportEngine.tsx`: AI-powered scheme recommendation system with eligibility analysis
- `AIAssetMapper.tsx`: Computer vision asset detection from satellite imagery
- `UnifiedDashboard.tsx`: Consolidated analytics and monitoring dashboard
- `MapViewer.tsx`: Leaflet-based mapping component with layer controls

**UI Enhancement Components:**
- `QuickActions.tsx`: Animated action cards with Framer Motion
- `InteractiveStats.tsx`: Real-time statistics display with animations
- `LanguageSelector.tsx`: i18n language switching (Hindi/English)

**Utility Components:**
- `ProtectedRoute.tsx`: Route-level authentication guards
- `IoTDashboard.tsx`: Real-time IoT sensor data visualization
- `CommunityFeedbackLoop.tsx`: User feedback collection and display

### Database Schema (Supabase)

**Core Tables:**
- `pattas`: FRA patta holder records with geographic data
- `assets`: AI-detected land assets (farmland, water bodies, forest)
- `schemes`: Government scheme definitions with eligibility criteria
- `scheme_recommendations`: AI-generated beneficiary recommendations
- `user_profiles`: Authentication and role management
- `community_feedback`: User feedback and ratings

### Microservices Architecture (drishti-gis-admin)

The system includes containerized backend services:

- **Backend API** (Node.js): Main application server with database operations
- **OCR Service** (Python): Document digitization and NER processing
- **MQTT Consumer**: IoT sensor data ingestion
- **PostgreSQL + PostGIS**: Spatial database for geographic data
- **MongoDB**: Time-series IoT data storage
- **Redis**: Session management and caching
- **Nginx**: Reverse proxy and load balancing

## Development Guidelines

### Component Development
- All components use TypeScript with proper interface definitions
- Follow Shadcn/ui patterns for consistent styling
- Use Framer Motion for animations (see `QuickActions.tsx` for reference)
- Implement proper loading states and error handling
- Use React Query for data fetching with proper cache management

### Styling Conventions
- Tailwind CSS utility classes for styling
- Dark/light theme support via `next-themes`
- Responsive design with mobile-first approach
- Use Shadcn/ui components for consistent design system
- Color scheme: Primary (blue), Success (green), Warning (amber)

### State Management
- React Context for global state (auth, theme)
- React Query for server state management
- Local component state for UI interactions
- Persist auth state in localStorage with 24-hour expiration

### Database Operations
- Use Supabase client with proper error handling
- Implement proper TypeScript types for database tables
- Use Row Level Security (RLS) for data access control
- Follow proper migration patterns for schema changes

### Authentication Flow
- Phone number-based authentication (Indian mobile numbers)
- Session persistence with automatic logout after 24 hours
- Protected routes using `ProtectedRoute` component
- Role-based access control (admin, officer, user)

### GIS and Mapping
- Use PostGIS for spatial queries and operations
- Leaflet for interactive maps with satellite imagery
- Support for multiple map layers (pattas, assets, terrain)
- Coordinate system: WGS84 (EPSG:4326)
- Asset coordinates stored as `{x, y}` in database

### AI/ML Integration
- Asset detection using CNN + Random Forest pipeline
- Confidence scoring for all ML predictions
- User verification system for ML results
- Scheme recommendation engine with eligibility scoring

## Common Development Tasks

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation in relevant components
4. Add translations in i18n files if needed

### Adding New Schemes
1. Insert scheme data in `schemes` table
2. Update eligibility logic in `DecisionSupportEngine.tsx`
3. Add new criteria checks in analysis function
4. Test with sample beneficiary profiles

### Extending Asset Detection
1. Add new asset type to database enum
2. Update ML model to detect new asset type
3. Modify `AIAssetMapper.tsx` to handle new type
4. Update visualization in mapping components

### Adding New Languages
1. Add language option in `LanguageSelector.tsx`
2. Create new translation files in i18n structure
3. Update language detection logic
4. Test with RTL languages if applicable

## Testing and Quality

### Code Quality
- ESLint configuration with React and TypeScript rules
- Disabled strict null checks for rapid development
- Component-level error boundaries recommended
- Use TypeScript `noImplicitAny: false` for flexibility

### Testing Strategy
- Manual testing with diverse FRA holder profiles
- Database operations testing with sample data
- Cross-browser testing for map functionality
- Mobile responsiveness testing on various devices

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Additional API keys (if needed)
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### Development vs Production
- Use `npm run build:dev` for development builds with debugging
- Production builds enable optimizations and minification
- Docker services required for full-stack development
- Supabase project ID: `yabhcilwgtcwozfaikez`

## Deployment Notes

### Frontend Deployment
- Vite builds to `dist/` directory
- Requires static file serving with SPA fallback
- Environment variables must be prefixed with `VITE_`

### Backend Services
- Use Docker Compose for consistent deployment
- Requires PostgreSQL with PostGIS extension
- MQTT broker for IoT data ingestion
- Python environment for OCR services

### Database Migrations
- Use Supabase CLI for schema management
- Run `setup_dss_data.ps1` for sample data setup
- Maintain migration files in `supabase/migrations/`

## Performance Considerations

### Frontend Optimization
- Lazy loading for large components
- Image optimization for satellite imagery
- Efficient re-renders with proper React patterns
- Bundle splitting for code optimization

### Backend Optimization
- Database indexing for spatial queries
- Redis caching for frequently accessed data
- MQTT message queuing for IoT data
- Connection pooling for database operations

## Security Guidelines

### Data Protection
- RLS policies for multi-tenant data access
- Sanitize user inputs for database queries
- Secure file upload handling in OCR service
- Rate limiting on API endpoints

### Authentication Security
- Secure session management with proper expiration
- Phone number validation for Indian mobile numbers
- Role-based access control implementation
- Audit logging for sensitive operations

---

This Rural Empowerment Atlas combines cutting-edge technology with grassroots empowerment, ensuring FRA implementation reaches every eligible beneficiary through intelligent automation and community engagement.
