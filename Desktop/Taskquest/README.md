# 🎮 TaskQuest — Gamified Productivity Dashboard

> Turn your daily tasks into epic quests. Level up, earn XP, unlock badges, and stay productive with TaskQuest.

---

## 📖 Overview

**TaskQuest** is a browser-based, gamified productivity dashboard that transforms your to-do list into an RPG-style adventure. Complete tasks to earn XP, level up your character, maintain daily streaks, and unlock achievements — all without leaving your browser.

Built with **pure HTML, CSS, and vanilla JavaScript** — no frameworks, no dependencies, no installation required.

---

## ✨ Features

### ⚔️ Quest Management
- **Create Quests** — Add tasks with a title, description, category, and difficulty level
- **Difficulty Tiers** — Easy, Medium, Hard, and Epic — each rewarding different XP amounts
- **Categories** — Organize quests by type: Health, Personal, Work, Coding, and more
- **Complete & Archive** — Tick off quests to earn rewards; past quests are automatically archived
- **Starter Quests** — First-time users get 8 real-world fitness & wellness quests to kick things off

### 📊 Gamification Engine
- **XP & Leveling System** — Earn XP by completing quests; accumulate enough to level up
- **Level Tiers** — Progress from *Novice Adventurer* all the way to *Legendary Champion*
- **Score Tracking** — Accumulate a total score based on difficulty and performance
- **Daily Streak** — Complete at least one quest every day to maintain and grow your streak

### 🏆 Achievements & Badges
Unlock badges by hitting milestones:

| Badge | Description |
|---|---|
| 🛡️ First Blood | Complete your very first Quest |
| 🪶 Quick Gains | Complete 5 Easy difficulty quests |
| 🐉 Epic Slayer | Vanquish an Epic difficulty quest |
| 🔥 Triple Threat | Reach a 3-day quest streak |
| 🔥 Unstoppable | Reach a 7-day quest streak |
| 🥇 Veteran Hero | Reach Level 5 |
| 👑 Grandmaster | Reach Level 10 |
| 📚 Historian | Archive your first month's reports |

### 📈 Analytics & Reports
- **Interactive SVG Charts** — Visualize XP earned, tasks completed, and productivity trends
- **Monthly Reports** — Review archived monthly performance summaries
- **Progress Stats** — See today's XP, daily progress %, streak, and level at a glance

### 🎉 Celebration Effects
- **Confetti Burst** — A particle confetti cannon fires every time you complete a quest
- **Level-Up Fanfare** — Animated ascending arpeggio plays on level-up
- **Badge Unlock Shimmer** — Audio and visual effect when a new badge is earned
- **Sound Synthesiser** — All audio is generated programmatically via the Web Audio API (no audio files needed)

### ⚙️ Settings & Persistence
- **Persistent Save** — All progress is saved to `localStorage`; your data survives page refreshes
- **Toggle Sound** — Enable or disable sound effects
- **Toggle Confetti** — Enable or disable the confetti particle system
- **Profile Name** — Set a custom adventurer name displayed throughout the dashboard

---

## 🗂️ Project Structure

```
TaskQuest/
├── index.html      # Application markup — all views, panels, and modals
├── styles.css      # Full design system — dark theme, glassmorphism, animations
├── app.js          # Core logic — state management, gamification, charts, audio, confetti
└── README.md       # You are here
```

---

## 🚀 Getting Started

TaskQuest is a **zero-dependency, zero-build** project. No npm, no bundler, no server required.

### Run Locally

1. **Clone or download** this repository
2. Open `index.html` directly in your browser

```bash
# Or serve with any local file server, e.g.:
npx serve .
```

That's it. The app runs entirely in the browser.

### 🏃 Default Starter Quests

First-time users are greeted with **8 ready-to-go real-world quests** across fitness and wellness:

| Quest | Category | Difficulty |
|---|---|---|
| Run 2 km | Health | Easy |
| Do 30 Push-ups | Health | Easy |
| Drink 8 Glasses of Water | Health | Easy |
| Read for 30 Minutes | Personal | Easy |
| Meditate for 10 Minutes | Personal | Easy |
| Complete a 20-min Workout | Health | Medium |
| Run 5 km | Health | Hard |
| 100 Push-ups Challenge | Health | Epic |

> **Note:** These quests load only on first launch. If the app has been opened before, open it in a private/incognito window or clear `localStorage` to see them.

---

## 🎮 How to Play

1. **Open the Dashboard** — View your stats: XP today, daily progress, streak, and level
2. **Navigate to Quests** — Click *Quests* in the sidebar to see your task list
3. **Add a Quest** — Hit the ➕ button, fill in the title, description, category, and difficulty, then save
4. **Complete a Quest** — Tick the checkbox on a quest card to earn XP and trigger confetti 🎉
5. **Check Analytics** — Visit *Analytics* to see charts of your productivity over time
6. **Review Reports** — *Monthly Reports* shows archived quest summaries by month
7. **Adjust Settings** — Head to *Settings* to change your name, toggle sound, or toggle confetti

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS (dark theme, glassmorphism, CSS animations) |
| Logic | Vanilla JavaScript (ES6+) |
| Icons | [Font Awesome 6](https://fontawesome.com/) |
| Audio | Web Audio API (no external audio files) |
| Charts | Custom SVG rendering (no chart library) |
| Storage | Browser `localStorage` |

---

## 🎨 Design Highlights

- **Dark glassmorphism UI** — Frosted glass panels with depth and blur effects
- **Vibrant accent palette** — Emerald, violet, amber, rose, and sky colour tokens
- **Micro-animations** — Hover lifts, XP bar transitions, confetti particles, badge pop-ins
- **Responsive layout** — Collapsible sidebar with mobile hamburger navigation
- **Custom SVG charts** — Hand-drawn bar and line charts with animated fills

---

## 💾 Data & Privacy

All data is stored **locally in your browser** via `localStorage`. Nothing is sent to any server. Clearing your browser's site data will reset your progress.

---

## 📜 License

This project is open source. Feel free to use, modify, and distribute it.

---

<p align="center">Made with ❤️ and a lot of questing.</p>
