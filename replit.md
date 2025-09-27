# Student Management Portal

## Overview

This is a modern student management portal built as a full-stack web application. The system provides students with access to their academic information including attendance records, homework assignments, fee status, and school announcements. The application features a clean, mobile-first design with a React frontend and Express.js backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **Authentication**: Simple credential-based authentication with session storage
- **API Design**: RESTful endpoints with consistent JSON responses and error handling
- **Development**: Hot reload and development server integration with Vite

### Data Storage Solutions
- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Connection**: Neon serverless PostgreSQL for cloud-based database hosting
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

### Authentication and Authorization
- **Login System**: Dual authentication supporting both Student ID and mobile number as credentials
- **Session Management**: Server-side session storage with PostgreSQL backend
- **Client Storage**: Local storage for user session persistence across browser sessions
- **Security**: Input validation using Zod schemas for both client and server-side validation

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production database
- **Drizzle ORM**: Type-safe database toolkit for schema definition and queries

### UI and Design System
- **Radix UI**: Headless UI components for accessibility and customization
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Build tool and development server with React plugin
- **TypeScript**: Type checking and enhanced development experience
- **PostCSS**: CSS processing with Tailwind CSS integration
- **ESBuild**: Fast bundling for production server builds

### State Management and Data Fetching
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library for runtime type checking

### Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx & tailwind-merge**: Conditional className utilities for Tailwind CSS
- **class-variance-authority**: Type-safe variant API for component styling