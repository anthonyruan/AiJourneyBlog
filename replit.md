# I'm AI Man - Personal AI Learning Blog

## Overview

This is a full-stack web application for a personal AI learning blog called "I'm AI Man". The project is built with a modern tech stack featuring React with TypeScript on the frontend, Express.js on the backend, and PostgreSQL for data persistence. The application serves as a platform for documenting AI learning journeys, showcasing AI projects, and sharing insights with the community.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with JSON responses

### Database Design
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM for type-safe database operations
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Connection pooling with postgres.js

## Key Components

### Authentication System
- Session-based authentication using Passport.js
- Role-based access control (admin vs regular users)
- Password hashing with Node.js crypto module
- Protected routes for admin-only functionality

### Content Management
- **Blog Posts**: Full CRUD operations with markdown support
- **Projects**: Showcase AI projects with Hugging Face integration
- **Comments**: Nested commenting system for blog posts
- **About Page**: Customizable about section with social links

### UI/UX Features
- Responsive design with mobile-first approach
- Professional theme with customizable color scheme
- Timeline-based blog post layout
- Interactive Hugging Face model embeds
- Newsletter subscription functionality
- Contact form with message handling

### Admin Features
- Content creation and editing interfaces
- User management and settings
- Message and comment moderation
- Project portfolio management

## Data Flow

### Client-Server Communication
1. Frontend makes API requests using fetch with credentials
2. Express server handles requests with middleware chain
3. Passport.js manages authentication state
4. Drizzle ORM queries PostgreSQL database
5. Responses sent back as JSON with appropriate status codes

### State Management
- TanStack Query handles server state caching and synchronization
- React Context for authentication state
- Form state managed locally with React Hook Form
- UI state managed with React hooks

### Authentication Flow
1. User submits login credentials
2. Passport.js validates against database
3. Session created and stored in PostgreSQL
4. Client receives user data and admin status
5. Protected routes check authentication state

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware
- **express-session**: Session management
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation

### UI Libraries
- **@radix-ui**: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production bundling

## Deployment Strategy

### Build Process
1. Frontend built with Vite to `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Static files copied to `server/public` for production serving
4. Database migrations applied with Drizzle Kit

### Production Setup
- Environment variables for database connection
- Static file serving from Express
- Session store configured for production
- Error handling and logging middleware

### Development Environment
- Hot module replacement with Vite
- TypeScript compilation checking
- Development-specific middleware and error overlays
- Database connection with local PostgreSQL or Neon

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- `NODE_ENV` for environment-specific behavior
- Session secrets and security configurations
- Build and runtime script configurations in package.json