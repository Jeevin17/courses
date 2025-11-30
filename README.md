### 🧠 Neural Network Graph
This is the heart of the app. I designed a layered, force-directed graph where:
- **Nodes** represent courses.
- **Edges** show prerequisites and flow.
- **Layers** represent the progression from Intro -> Core -> Advanced.
- It glows and animates as I complete courses!

### 🎯 Focus Mode
To help me actually study, I built a distraction-free Focus Mode:
- **Brown Noise Generator**: Built-in audio to mask distractions.
- **Study Timer**: Customizable Pomodoro-style timer.
- **Auto-Progress**: It automatically tracks how long I study and updates the course progress bar.

### 📊 Progress Tracking
- **Automatic**: Time spent in Focus Mode is automatically logged.
- **Manual**: I can manually add "offline" study time or fix mistakes with the **Undo** feature.
- **Prerequisites**: The app enforces course order but allows me to **Force Start** a course if I need to skip ahead.

### 💾 Data Persistence
Everything is saved automatically to my browser's Local Storage. I can close the tab and come back right where I left off.

## Tech Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphism
- **Animations**: Framer Motion
- **Icons**: Lucide React

## How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

---
*Built with ❤️ for the love of learning.*
