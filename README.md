# Project CNPM - Frontend

This repository contains the frontend application for the CNPM project. It is a modern Single Page Application (SPA) built with React, Vite, and TypeScript, offering a highly interactive and responsive user experience.

## 🚀 Technologies Used

- **Core Framework**: React 18, TypeScript
- **Build Tool**: Vite (for fast development and optimized builds)
- **Styling & UI Components**: 
  - Tailwind CSS (Utility-first styling)
  - Radix UI Primitives (Accessible UI components)
  - Framer Motion (Smooth animations and transitions)
  - Lucide React (Beautiful SVG icons)
- **State Management & Data Fetching**: 
  - Zustand (Lightweight global state)
  - TanStack React Query (Asynchronous state and API data fetching)
  - Axios (HTTP client)
- **Form Handling**: React Hook Form with Zod schema validation
- **Data Visualization**: Recharts
- **Testing**: Vitest, React Testing Library

## 📁 Project Structure

The main application code is located inside the `frontend` directory.
- `src/components`: Reusable UI components.
- `src/pages`: Application views and page components.
- `src/store`: Zustand state management stores.
- `src/services` or `src/api`: Axios instances and API endpoint definitions.

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager

### Installation & Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the root of the `frontend` folder and specify your backend API URL (e.g., `VITE_API_BASE_URL=http://localhost:8080/api`).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. To build for production:
   ```bash
   npm run build
   ```

The development server will typically start on `http://localhost:5173`.
