# Preply — Plan. Study. Finish. 🎓

> **Preply** is a modern, high-performance personal study planner & subject tracker designed to help students organize their exam syllabus, maintain daily study streaks, stay focused with Pomodoro timers, and finish before exam day.

---

## ✨ Features

- 📚 **Subject Tracker**:
  - Direct daily study tracker (**Today's Work: YES ✅ / NO ⏳**).
  - Track Exam Date, Exam Time, Daily Study Hours, and Priority per subject.
- ⏱️ **Interactive Pomodoro Focus Timer**:
  - Built-in 25-minute focus session, 5-minute short break, and 15-minute long break modes.
  - Sound alert chime on session completion.
  - Automatically marks subject work done today when focus timer completes.
- 🔥 **Daily Study Streaks & Analytics**:
  - Automatically calculates consecutive daily study streaks.
  - Syllabus completion progress bar and total hours studied.
- 📅 **Monthly Study Calendar**:
  - Interactive grid displaying daily study sessions and exam dates.
- ☁️ **Firebase Cloud Sync & Auth**:
  - Real-time Firestore cloud database sync.
  - Secure Email & Password Authentication with localStorage fallback.
- 🌙 **Claymorphic Light & Dark Modes**:
  - Premium Claymorphism aesthetic with 1-click theme switcher in the top navigation bar.
- 💾 **Data Backup & Migration**:
  - 1-click JSON export and import for full study data backup and device transfer.
- 📱 **100% Mobile Responsive**:
  - Optimized for mobile, tablet, and desktop screens with min-44px touch targets.
- 🔍 **Search Engine Optimized (SEO)**:
  - Meta tags, Open Graph cards, dynamic route titles, `robots.txt`, `sitemap.xml`, and Schema.org structured data.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Claymorphism Tokens
- **State Management**: Zustand with persistent storage
- **Backend & Database**: Firebase Authentication & Firestore Cloud Database
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Date Handling**: `date-fns`

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your system.

### 2. Installation
Clone the repository and install dependencies:

```bash
cd Preply
npm install
```

### 3. Firebase Configuration (Optional for Cloud Sync)
Create a `.env` file in the project root and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
Preply/
├── public/
│   ├── robots.txt            # Search engine crawler permissions
│   └── sitemap.xml           # XML sitemap for SEO indexing
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AuthModal.tsx     # Email & Password Auth Modal
│   │   ├── PomodoroTimer.tsx # Focus Timer Modal
│   │   ├── Layout.tsx        # App Shell with Header & Sidebar
│   │   ├── Sidebar.tsx       # Navigation drawer & stats
│   │   └── ProgressBar.tsx   # Claymorphic progress bar
│   ├── lib/                  # Utilities & Firebase configuration
│   │   ├── firebase.ts       # Firebase Auth & Firestore sync
│   │   ├── planner.ts        # Study plan generator algorithm
│   │   └── utils.ts          # Date helpers & streak calculators
│   ├── pages/                # App views
│   │   ├── Dashboard/        # Today's overview & streak stats
│   │   ├── Subjects/         # Daily Subject Tracker (Yes/No)
│   │   ├── Planner/          # Rule-based study schedule
│   │   ├── Calendar/         # Monthly study calendar
│   │   ├── Progress/         # Syllabus analytics & breakdowns
│   │   └── Settings/         # Profile, schedule, & JSON backups
│   ├── store/                # Zustand global store (`useStore.ts`)
│   ├── types/                # TypeScript interfaces (`index.ts`)
│   ├── App.tsx               # App routing & theme controller
│   └── index.css             # Tailwind base & Claymorphism tokens
├── index.html                # Main HTML entry with SEO & OpenGraph tags
└── README.md
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
