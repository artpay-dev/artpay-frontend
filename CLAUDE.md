# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run wpbuild` - Build for WordPress using alternative config
- `npm run lint` - Run ESLint with TypeScript support
- `npm run preview` - Preview production build locally

## Project Architecture

**Frontend Framework**: React 18 with TypeScript, built with Vite
**Styling**: Material-UI v5 + Tailwind CSS v4 + Sass
**State Management**: Zustand for global state
**Routing**: React Router v6 with extensive route definitions
**Authentication**: Google OAuth, Facebook, Apple Sign-In integration

### Key Application Structure

- **HOC Providers**: The app uses multiple context providers layered in App.tsx:
  - `AuthProvider` - User authentication state
  - `DataProvider` - API data management  
  - `PaymentProvider` - Payment flow state
  - `DialogProvider` - Modal/dialog management
  - `SnackbarProvider` - Toast notifications

- **Feature-based Architecture**: Special features are organized in `src/features/`:
  - `cdspayments/` - External payment integration
  - `heylight/` - Heylight integration
  - `landingforcampaign/` - Campaign landing pages
  - `directpurchase/` - Direct purchase flow with payment method selection

- **Content Management**: Uses Contentful CMS with staging environment configuration
  - Client configured in `src/lib/contentful/contentful.ts`
  - Content fetching service in `src/services/contentful.ts`

### Key Directories

- `src/components/` - Reusable UI components and icons
- `src/pages/` - Route-level page components
- `src/types/` - TypeScript type definitions for domain models
- `src/hoc/` - Higher-order components and providers
- `src/themes/` - Material-UI theme configuration
- `public/fonts/` - Inter and InterTight font families

### Environment Variables

The app requires several environment variables:
- `VITE_SERVER_URL` - Backend API URL (proxied at `/wp-json`)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_GA_MEASUREMENT_ID` - Google Analytics tracking ID
- `VITE_CONTENTFUL_STAGING_SPACE_ID` - Contentful space ID
- `VITE_CONTENTFUL_STAGING_ACCESS_TOKEN` - Contentful access token

### WordPress Integration

- Alternative build config at `vite.config.wp.ts` for WordPress deployment
- PHP integration files in `wp/` directory
- Proxy configuration for `/wp-json` endpoints to backend server

### Direct Purchase Feature (`src/features/directpurchase/`)

**Payment Flow Architecture**: Modern payment system with method-specific handling

- **Components**:
  - `DirectPurchaseView.tsx` - Main purchase interface with conditional rendering
  - `PaymentsSelection.tsx` - Payment method selection with radio buttons
  - `PaymentRadioSelector.tsx` - Reusable radio button component for payment methods

- **State Management**:
  - `directPurchaseStore.ts` - Zustand store for purchase state
  - Supports payment methods: `card`, `klarna` (others can be added)
  - Conditional rendering based on `paymentMethod` state

- **Hooks**:
  - `useDirectPurchaseData.ts` - Data loading and payment intent creation
  - `useDirectPurchaseUtils.ts` - Payment method change handling and utilities
  - `createPaymentIntent()` function supports method-specific payment intents

- **Payment Method Flow**:
  1. User selects payment method from radio buttons
  2. `onChangePaymentMethod()` updates WooCommerce order
  3. `createPaymentIntent()` creates Stripe payment intent with specific method
  4. Backend calculates method-specific fees (e.g., Klarna commissions)
  5. Frontend renders appropriate Stripe Elements for selected method

- **Supported Payment Methods**:
  - `card` - Credit/debit cards via Stripe Elements
  - `klarna` - Buy now, pay later with automatic fee calculation
  - Extensible architecture for additional methods

### Code Standards

- TypeScript strict mode enabled with comprehensive linting rules
- ESLint configured with React hooks and TypeScript plugins
- Prettier formatting with 120 character line width and same-line brackets
- Path alias `@` configured for `src` directory imports