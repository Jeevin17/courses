# 🎓 Course Tracker (Liquid Mirror)

<div align="center">

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

A premium, privacy-focused learning tracker for self-taught developers and students. Track your progress through OSSU, Roadmap.sh, Physics, or any custom curriculum with a stunning "Liquid Mirror" interface.

<div align="center">

### 🌓 Dark & Light Mode

| Dark Mode | Light Mode |
|-----------|------------|
| ![Dark Mode](./assets/dark%20mode.png) | ![Light Mode](./assets/light%20mode.png) |

</div>

## ✨ Features

### 🎨 Liquid Mirror Design
- **Glassmorphism UI**: A modern, translucent interface with "iOS 26" inspired aesthetics.
- **Adaptive Themes**:
  - **Light Mode**: "Twilight Stone" - Warm grey/purple tint for a soft, paper-like feel.
  - **Dark Mode**: "Deep Onyx" - Rich charcoal backgrounds with glowing accents.
- **Responsive**: Fully optimized for Desktop, Tablet, and Mobile (with a dedicated mobile bottom nav).

### 🧠 Interactive Knowledge Graph
- **Neural Network View**: Visualize your learning path as a force-directed graph.
- **Dependency Tracking**: Clearly see prerequisites and unlockable courses.
- **Smart Filtering**: Toggle between List and Graph views.

### 📊 Advanced Analytics
- **Personalized Stats**: Track your completion rates, study hours, and streaks.
- **Skill Radar**: Visualize your proficiency across different subjects.
- **Progress Projection**: Estimate your completion date based on velocity.
- **Privacy First**: All analytics are calculated from your personal data.

### 🎯 Focus Mode
- **Distraction-Free**: A dedicated timer interface for deep work.
- **Brown Noise**: Integrated audio masking to boost concentration.
- **Session Tracking**: Automatically logs study time to your courses.

### ☁️ Cloud Sync (Supabase)
- **Cross-Device Sync**: Seamlessly sync your progress across devices.
- **Secure**: Row Level Security (RLS) ensures only YOU can access your data.
- **Offline Capable**: Works offline and syncs when back online.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **State Management**: Zustand, React Query
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase project (free tier)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeevin17/courses.git
   cd courses
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Create a `.env` file in the root directory.
   - You can copy the example: `cp .env.example .env`
   - Add your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Database Setup**
   - Go to your Supabase Dashboard -> SQL Editor.
   - Copy the contents of `supabase/setup.sql`.
   - Run the script to create the necessary tables and security policies.

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 to view it in the browser.

### Building for Production

1. **Create the Build**
   ```bash
   npm run build
   ```
   This generates a `dist` folder containing the optimized assets.

2. **Preview the Build Locally**
   ```bash
   npm run preview
   ```
   This spins up a local server to test the production build before deploying.

3. **Deploy**
   - Upload the `dist` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).
   - Ensure you add your Environment Variables (`VITE_SUPABASE_URL`, etc.) to your hosting provider's dashboard.

## � Docker Deployment

You can containerize the application for easy deployment.

1. **Build the Image**
   Pass your Supabase credentials as build arguments:
   ```bash
   docker build \
     --build-arg VITE_SUPABASE_URL=your_url \
     --build-arg VITE_SUPABASE_ANON_KEY=your_key \
     -t course-tracker .
   ```

2. **Run the Container**
   ```bash
   docker run -d -p 8080:80 course-tracker
   ```
   Access the app at http://localhost:8080.

## �📱 Mobile Experience
- **Bottom Navigation**: A thumb-friendly fixed navigation bar.
- **Floating Home**: Quick access to the dashboard.
- **Theme Toggle**: Easily switch themes from the top header.

## 🤝 Contributing
Contributions are welcome! Please fork the repo and submit a PR.

## 📄 License
MIT License. Built with ❤️ for the love of learning.
