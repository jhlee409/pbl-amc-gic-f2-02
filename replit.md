# AMC GI Upper F2 PBL Application

## Overview

This is a full-stack educational application designed for medical Problem-Based Learning (PBL) focused on refractory GERD (Gastroesophageal Reflux Disease) patient diagnosis and treatment. The application presents an interactive medical case study with step-by-step guidance, image display capabilities, and user interaction tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: In-memory storage with extensible interface for database persistence
- **API Design**: RESTful endpoints with typed responses

### Data Storage
- **Primary Database**: PostgreSQL via Neon Database (@neondatabase/serverless) 
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Image Storage**: Object Storage (PBLGIC02 bucket) integration for medical images
- **Session Storage**: PostgreSQL database with Drizzle ORM (production) / In-memory (development)

## Key Components

### Core Application Structure
- **Monorepo Layout**: Client, server, and shared code separation
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Component Library**: Comprehensive UI component system using Shadcn/ui

### Medical Education Features
- **Interactive Case Studies**: Step-by-step medical case presentation
- **Image Integration**: Medical imaging display via object storage proxy
- **Progress Tracking**: User session management for learning progress
- **Korean Language Support**: UTF-8 encoding with Korean medical terminology

### Key Frontend Components
- **ConversationFlow**: Main PBL interaction component managing step progression
- **ImageDisplay**: Medical image rendering with loading states and error handling
- **UI Components**: Complete set of accessible components (buttons, cards, dialogs, etc.)

### Backend Services
- **Image Proxy**: Secure image serving from object storage (PBLGIC02 bucket)
- **Session Management**: PBL progress tracking and user state persistence
- **API Routes**: Type-safe endpoints for session management and image serving

## Data Flow

### User Interaction Flow
1. User accesses PBL application through React frontend
2. ConversationFlow component manages step-by-step case presentation
3. User responses trigger API calls to update session state
4. Medical images loaded on-demand via Supabase proxy
5. Progress automatically saved to maintain learning continuity

### Image Handling
1. Frontend requests images via custom hook (useObjectStorageImage)
2. Express server proxies requests to object storage
3. Images cached with appropriate headers for performance
4. Error states handled gracefully with fallback UI

### Session Persistence
1. User actions stored in PBL sessions with step tracking in PostgreSQL database
2. Responses array maintains user choice history with database persistence
3. Dual storage implementation: PostgreSQL for production, in-memory for development
4. Database migrations automatically applied for schema updates

## External Dependencies

### Core Technologies
- **Database**: Neon Database (serverless PostgreSQL)
- **Image Storage**: Supabase Storage for medical images
- **UI Framework**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS for utility-first styling

### Development Tools
- **Build**: Vite for fast development and optimized builds
- **Type Checking**: TypeScript with strict configuration
- **Database Management**: Drizzle Kit for schema migrations
- **Code Quality**: ESBuild for production bundling

### Medical Content Integration
- **Image Assets**: Medical imaging files stored in Supabase
- **Educational Content**: Korean medical terminology and case studies
- **User Progress**: Session-based learning state management

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon Database with environment-based configuration
- **Asset Serving**: Local proxy for Supabase images during development
- **Type Safety**: Shared types ensure frontend/backend compatibility

### Production Build
- **Frontend**: Vite build optimization with code splitting
- **Backend**: ESBuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema deployment
- **Environment**: Environment variable configuration for secrets

### Scalability Considerations
- **Database**: Neon Database auto-scaling for PostgreSQL with full persistence
- **Images**: Object storage CDN for global image delivery
- **Session Storage**: PostgreSQL database storage with automatic scaling
- **Caching**: Browser caching for images and static assets

The application is designed as an educational tool for medical professionals, specifically targeting gastroenterology fellows learning about refractory GERD diagnosis and treatment approaches. The architecture supports both the current educational use case and future expansion to additional medical cases and user management features.