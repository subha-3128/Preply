<div align="center">

  # 🎓 Preply — Personal Study Planner & Tracker

  <p align="center">
    <b>Plan. Study. Finish.</b><br />
    A modern, high-performance web app designed for students to track daily subject completion, maintain study streaks, focus with Pomodoro timers, and finish syllabus before exam day.
  </p>

  <p align="center">
    <a href="https://preply-caaa7.web.app">
      <img src="https://img.shields.io/badge/🌐_Live_Demo-preply--caaa7.web.app-7C3AED?style=for-the-badge" alt="Live Demo" />
    </a>
    <a href="https://github.com/subha-3128/Preply">
      <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repo" />
    </a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v3.4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
  </p>

</div>

---

## 🚀 Live Demo & Links

- 🌐 **Live Web Application**: [https://preply-caaa7.web.app](https://preply-caaa7.web.app)
- 🔗 **Alternative Mirror**: [https://preply-caaa7.firebaseapp.com](https://preply-caaa7.firebaseapp.com)
- 🐙 **GitHub Repository**: [https://github.com/subha-3128/Preply](https://github.com/subha-3128/Preply)

---

## 💡 Overview

Students often struggle to track whether they are completing enough subject revision before exam day. **Preply** solves this by providing an intuitive, rule-based daily subject tracker that tells you exactly what to study today and ensures 100% syllabus readiness before your exams.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 📚 **Subject Tracker** | Clean daily completion tracker (**Today's Work: YES ✅ / NO ⏳**) with Exam Date, Time, Daily Target Hours, and Priority. |
| ⏱️ **Focus Timer (Pomodoro)** | Built-in 25m focus study, 5m short break, and 15m long break modes with sound chime alerts & auto-completion. |
| 🔥 **Study Streaks & Analytics** | Automatic consecutive daily study streak calculator with overall syllabus progress bars and total hours studied. |
| 📅 **Monthly Study Calendar** | Visual monthly calendar displaying daily study sessions and exam countdown badges. |
| ☁️ **Firebase Cloud Sync & Auth** | Real-time Firestore cloud database synchronization with secure Email & Password Authentication and local storage fallback. |
| 🌙 **Light & Dark Modes** | Rich Claymorphism design system with 1-click theme switcher in the top navigation header. |
| 💾 **Data Backup & Restore** | 1-click JSON export and import for full study data backup and multi-device transfer. |
| 🔍 **SEO & Social Share Ready** | Complete Open Graph cards, Twitter metadata, dynamic page titles, `robots.txt`, `sitemap.xml`, and Schema.org JSON-LD data. |

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + Custom Claymorphic Design System
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistent middleware)
- **Cloud Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore Database)
- **Deployment**: [Firebase Hosting](https://firebase.google.com/docs/hosting)
- **Icons & UI**: [Phosphor Icons](https://phosphoricons.com/)

---

## 💻 Local Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your system.

### 2. Clone Repository
```bash
git clone https://github.com/subha-3128/Preply.git
cd Preply
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables (Optional for Cloud Sync)
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🚀 Building & Deploying

### Production Build
```bash
npm run build
```

### Deploying to Firebase Hosting
```bash
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

---

## 📁 Project Architecture

```
Preply/
├── public/
│   ├── favicon.svg           # App favicon
│   ├── robots.txt            # Search engine crawler permissions
│   └── sitemap.xml           # XML sitemap for SEO indexing
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AuthModal.tsx     # Email & Password Authentication modal
│   │   ├── PomodoroTimer.tsx # 25m/5m/15m Focus Study Timer
│   │   ├── Layout.tsx        # App shell with Header & Sidebar
│   │   ├── Sidebar.tsx       # Navigation drawer & streak stats
│   │   └── ProgressBar.tsx   # Claymorphic progress bar
│   ├── lib/                  # Utilities & Firebase configuration
│   │   ├── firebase.ts       # Firebase Auth & Firestore sync
│   │   ├── planner.ts        # Study schedule algorithm
│   │   └── utils.ts          # Date helpers & streak calculators
│   ├── pages/                # Application views
│   │   ├── Dashboard/        # Today's overview & streak counters
│   │   ├── Subjects/         # Daily Subject Tracker (Yes/No)
│   │   ├── Planner/          # Rule-based study schedule generator
│   │   ├── Calendar/         # Interactive monthly calendar
│   │   ├── Progress/         # Syllabus analytics & breakdowns
│   │   └── Settings/         # Profile, schedule, & JSON backups
│   ├── store/                # Zustand global state (`useStore.ts`)
│   ├── types/                # TypeScript interfaces (`index.ts`)
│   ├── App.tsx               # App router, theme switcher & dynamic titles
│   └── index.css             # Tailwind base & Claymorphic CSS tokens
├── firebase.json             # Firebase Hosting rewrite rules
├── .firebaserc               # Firebase project mapping
├── index.html                # Main entry HTML with Open Graph & SEO tags
└── README.md                 # Professional documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [Issues page](https://github.com/subha-3128/Preply/issues).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/subha-3128">Subhajit Bepari</a></sub>
</div>
