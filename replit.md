# GrowthTracker Personal Development App

## Overview

GrowthTracker is a comprehensive personal development application that helps users track their journey through various life aspects including diary entries, stories, mistakes, achievements, study sessions, relationships, and AI-powered assessments. The app provides a unified dashboard for monitoring personal growth with features like calendar management, mood tracking, and intelligent recommendations through OpenRouter AI integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark theme support
- **Authentication**: Context-based auth with JWT tokens stored in localStorage

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful API with structured route organization
- **Development**: Hot module replacement with Vite integration for seamless development experience

### Database Design
- **Primary Database**: PostgreSQL via Neon Database serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: 
  - Users with profile information
  - Diary entries with mood tracking
  - Stories for creative writing
  - Mistakes with lessons learned
  - Achievements and milestones
  - Study sessions with duration tracking
  - People relationships with sentiment analysis
  - Calendar events with categorization
  - AI assessments with growth scoring

### Authentication & Authorization
- **Strategy**: JWT-based stateless authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Token Management**: 24-hour expiration with authorization headers
- **Protected Routes**: Middleware-based route protection on both client and server
- **User Sessions**: Stateless design with token-based user identification

### Data Flow Architecture
- **Client-Server Communication**: Fetch API with centralized request handling
- **Error Handling**: Structured error responses with toast notifications
- **Data Validation**: Zod schemas for both client and server-side validation
- **Real-time Updates**: Optimistic updates with React Query cache invalidation

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (PostgreSQL serverless)
- **AI Service**: OpenRouter API for personal growth assessments using Mistral-7B-Instruct model
- **Development Platform**: Replit with custom Vite plugins for enhanced development experience

### Frontend Libraries
- **UI Framework**: React 18 with TypeScript
- **Component Library**: Radix UI primitives with shadcn/ui customizations
- **Form Management**: React Hook Form with Zod resolvers
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Libraries
- **Runtime**: Node.js with ES modules
- **Database**: Drizzle ORM with Neon serverless driver
- **Security**: bcrypt for password hashing, jsonwebtoken for JWT handling
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin and custom Replit integrations
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint configuration for code standards
- **Database Management**: Drizzle Kit for schema migrations and database operations