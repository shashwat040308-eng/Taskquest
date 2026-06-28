/**
 * TaskQuest — Gamified Productivity Dashboard Core Logic
 * State management, local storage, gamification engine, custom SVG charting,
 * sound synthesiser, and confetti mechanics.
 */

// --- 1. STATE & STORAGE MANAGEMENT ---
const DEFAULT_STATE = {
  user: {
    name: "Adventurer",
    level: 1,
    xp: 0,
    totalScore: 0,
    streak: 0,
    lastActiveDate: ""
  },
  tasks: [],
  archives: [],
  settings: {
    soundEnabled: true,
    confettiEnabled: true
  },
  unlockedBadges: [] // List of badge IDs
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Save state to localStorage
function saveState() {
  localStorage.setItem('taskquest_save_data', JSON.stringify(state));
  updateUI();
}

// Load state from localStorage
function loadState() {
  const savedData = localStorage.getItem('taskquest_save_data');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      // Deep merge parsed details to handle schema upgrades
      state.user = { ...DEFAULT_STATE.user, ...parsed.user };
      state.settings = { ...DEFAULT_STATE.settings, ...parsed.settings };
      state.tasks = parsed.tasks || [];
      state.archives = parsed.archives || [];
      state.unlockedBadges = parsed.unlockedBadges || [];
    } catch (e) {
      console.error("Error loading saved data, resetting...", e);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    // Insert mock tasks for first-time onboarding experience
    state.tasks = getOnboardingQuests();
    state.user.streak = calculateStreak(state.tasks);
  }
}

// Default onboarding tasks
function getOnboardingQuests() {
  return [
    {
      id: "mock-1",
      title: "Run 2 km",
      desc: "Lace up and head outside for a 2 km run. Pace yourself — consistency beats speed!",
      category: "Health",
      difficulty: "easy",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    },
    {
      id: "mock-2",
      title: "Do 30 Push-ups",
      desc: "Drop and give 30! Break them into sets if needed — 3×10 works great.",
      category: "Health",
      difficulty: "easy",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    },
    {
      id: "mock-3",
      title: "Drink 8 Glasses of Water",
      desc: "Stay hydrated throughout the day. Keep a bottle on your desk as a reminder.",
      category: "Health",
      difficulty: "easy",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    },
    {
      id: "mock-4",
      title: "Complete a 20-min Workout",
      desc: "Squats, lunges, planks — mix it up! 20 minutes of focused movement counts.",
      category: "Health",
      difficulty: "medium",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    },
    {
      id: "mock-5",
      title: "Read for 30 Minutes",
      desc: "Pick up a book, article, or documentation and spend 30 uninterrupted minutes reading.",
      category: "Personal",
      difficulty: "easy",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    },
    {
      id: "mock-6",
      title: "Meditate for 10 Minutes",
      desc: "Find a quiet spot, close your eyes, and focus on your breath. Clear your mind.",
      category: "Personal",
      difficulty: "easy",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    },
    {
      id: "mock-7",
      title: "Run 5 km",
      desc: "Challenge yourself with a full 5 km run. Track your time and try to beat it next week!",
      category: "Health",
      difficulty: "hard",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    },
    {
      id: "mock-8",
      title: "100 Push-ups Challenge",
      desc: "The ultimate upper-body test. Spread across the day or go all in — 100 total push-ups.",
      category: "Health",
      difficulty: "epic",
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    }
  ];
}

// --- 2. SOUND EFFECTS SYNTHESISER ---
const AudioEngine = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playChime() {
    if (!state.settings.soundEnabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    // Nice double beep chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.35);
  },

  playLevelUp() {
    if (!state.settings.soundEnabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    // Ascending arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
      
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.3);
    });
  },

  playBadgeUnlock() {
    if (!state.settings.soundEnabled) return;
    this.init();
    
    const now = this.ctx.currentTime;
    // Shimmer effect
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2); // Slide up to A6
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }
};

// --- 3. CONFETTI PARTICLE SYSTEM ---
const ConfettiEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  active: false,

  init() {
    this.canvas = document.getElementById('confettiCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  },

  blast() {
    if (!state.settings.confettiEnabled) return;
    this.init();
    
    const colors = ['#a78bfa', '#60a5fa', '#34d399', '#f43f5e', '#fbbf24', '#e879f9'];
    const pCount = 120;
    
    // Spawns particles shooting upward from the center bottom
    for (let i = 0; i < pCount; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height + 20,
        vx: (Math.random() - 0.5) * 22,
        vy: -Math.random() * 22 - 10,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (!this.active) {
      this.active = true;
      this.animate();
    }
  },

  animate() {
    if (this.particles.length === 0) {
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5; // Gravity
      p.vx *= 0.98; // Friction
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.015; // Fade out

      if (p.y > this.canvas.height + 50 || p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      
      // Draw rectangular confetti piece
      this.ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.5);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
};

// --- 4. GAMIFICATION METRICS ENGINE ---

// XP Required cumulative calculations
// Level 1: 0 XP
// Level 2: 100 XP
// Level 3: 300 XP
// Level 4: 600 XP
// Level 5: 1000 XP
function getXPRequiredForLevel(level) {
  if (level <= 1) return 0;
  return 50 * level * (level - 1);
}

// Calculate level given current total XP
function getLevelFromXP(xp) {
  let level = 1;
  while (getXPRequiredForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

// Badge definitions
const ACHIEVEMENTS = [
  {
    id: "first_quest",
    title: "First Blood",
    desc: "Complete your very first Quest",
    icon: "fa-shield-halved",
    check: (tasks) => tasks.some(t => t.completed)
  },
  {
    id: "easy_cleared",
    title: "Quick Gains",
    desc: "Complete 5 Easy difficulty quests",
    icon: "fa-feather",
    check: (tasks) => tasks.filter(t => t.completed && t.difficulty === "easy").length >= 5
  },
  {
    id: "epic_slayer",
    title: "Epic Slayer",
    desc: "Vanquish an Epic difficulty quest",
    icon: "fa-dragon",
    check: (tasks) => tasks.some(t => t.completed && t.difficulty === "epic")
  },
  {
    id: "streak_3",
    title: "Triple Threat",
    desc: "Reach a 3-day quest streak",
    icon: "fa-fire-burner",
    check: (tasks) => calculateStreak(tasks) >= 3
  },
  {
    id: "streak_7",
    title: "Unstoppable",
    desc: "Reach a 7-day quest streak",
    icon: "fa-fire",
    check: (tasks) => calculateStreak(tasks) >= 7
  },
  {
    id: "level_5",
    title: "Veteran Hero",
    desc: "Reach Level 5",
    icon: "fa-medal",
    check: (tasks) => getLevelFromXP(state.user.xp) >= 5
  },
  {
    id: "level_10",
    title: "Grandmaster",
    desc: "Reach Level 10",
    icon: "fa-crown",
    check: (tasks) => getLevelFromXP(state.user.xp) >= 10
  },
  {
    id: "historian",
    title: "Historian",
    desc: "Archive your first month's reports",
    icon: "fa-book-archive",
    check: () => state.archives.length >= 1
  }
];

// Returns level class based on level number
function getLevelTierName(level) {
  if (level < 3) return "Novice Adventurer";
  if (level < 5) return "Apprentice Scout";
  if (level < 8) return "Vanguard Warrior";
  if (level < 10) return "Master Champion";
  return "Legendary Mythic";
}

// Calculate streak from history
function calculateStreak(tasks) {
  const completedDates = [...new Set(tasks
    .filter(t => t.completed && t.dateCompleted)
    .map(t => t.dateCompleted.substring(0, 10))
  )].sort((a, b) => b.localeCompare(a));
  
  if (completedDates.length === 0) return 0;
  
  const todayStr = new Date().toISOString().substring(0, 10);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().substring(0, 10);
  
  let currentCheckDate = null;
  if (completedDates.includes(todayStr)) {
    currentCheckDate = new Date();
  } else if (completedDates.includes(yesterdayStr)) {
    currentCheckDate = yesterday;
  } else {
    return 0;
  }
  
  let streak = 0;
  while (true) {
    const dateStr = currentCheckDate.toISOString().substring(0, 10);
    if (completedDates.includes(dateStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Check and award achievements
function checkAchievements() {
  let newlyUnlocked = false;
  ACHIEVEMENTS.forEach(badge => {
    if (!state.unlockedBadges.includes(badge.id)) {
      if (badge.check(state.tasks)) {
        state.unlockedBadges.push(badge.id);
        newlyUnlocked = true;
        
        // Trigger sound & notification toast
        setTimeout(() => {
          AudioEngine.playBadgeUnlock();
          showToast("Achievement Unlocked!", `You've earned the "${badge.title}" badge.`);
        }, 1200);
      }
    }
  });
  if (newlyUnlocked) {
    saveState();
  }
}

// Get XP points based on task difficulty
function getXpReward(difficulty) {
  switch (difficulty) {
    case "easy": return 10;
    case "medium": return 20;
    case "hard": return 45;
    case "epic": return 80;
    default: return 10;
  }
}

// --- 5. UI VIEW & UPDATER LOGIC ---

// Switch view panels
function switchView(viewId) {
  // Hide all panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Show target panel
  const targetPanel = document.getElementById(`view-${viewId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Update sidebar links
  document.querySelectorAll('.menu-item').forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Render view-specific content
  if (viewId === 'analytics') {
    renderCharts();
  } else if (viewId === 'reports') {
    renderReports();
  }

  // Close mobile sidebar if open
  document.getElementById('sidebar').classList.remove('mobile-open');
}

// Show notification toast
function showToast(title, message, isXp = false) {
  const toast = document.getElementById('toastNotification');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  if (isXp) {
    toast.classList.add('xp-gain');
  } else {
    toast.classList.remove('xp-gain');
  }

  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

// Core UI Refresher
function updateUI() {
  // Re-compute active user metrics
  const currentXP = state.user.xp;
  const calculatedLevel = getLevelFromXP(currentXP);
  
  // Check for Level Up!
  if (calculatedLevel > state.user.level) {
    triggerLevelUpModal(calculatedLevel);
  }
  
  state.user.level = calculatedLevel;
  state.user.streak = calculateStreak(state.tasks);
  
  // 1. Sidebar values
  document.getElementById('sidebarProfileName').textContent = state.user.name;
  document.getElementById('sidebarLevelBadge').textContent = `Lvl ${state.user.level}`;
  
  const currentLevelMinXp = getXPRequiredForLevel(state.user.level);
  const nextLevelMinXp = getXPRequiredForLevel(state.user.level + 1);
  const levelProgressXp = currentXP - currentLevelMinXp;
  const levelTotalNeeded = nextLevelMinXp - currentLevelMinXp;
  const xpPercentage = Math.min(100, Math.max(0, (levelProgressXp / levelTotalNeeded) * 100));
  
  document.getElementById('sidebarXpRatio').textContent = `${levelProgressXp} / ${levelTotalNeeded} XP`;
  document.getElementById('sidebarXpFill').style.width = `${xpPercentage}%`;
  document.getElementById('sidebarTotalScore').textContent = state.user.totalScore;
  document.getElementById('sidebarStreakCount').textContent = `${state.user.streak} ${state.user.streak === 1 ? 'Day' : 'Days'}`;

  // Settings values
  document.getElementById('settingsProfileName').value = state.user.name;
  document.getElementById('settingsSoundToggle').checked = state.settings.soundEnabled;
  document.getElementById('settingsConfettiToggle').checked = state.settings.confettiEnabled;

  // 2. Dashboard View values
  document.getElementById('dashLevel').textContent = `Lvl ${state.user.level}`;
  document.getElementById('dashLevelTier').textContent = getLevelTierName(state.user.level);
  document.getElementById('dashStreak').textContent = `${state.user.streak} ${state.user.streak === 1 ? 'Day' : 'Days'}`;

  // Today's stats
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayTasks = state.tasks.filter(t => t.dateCreated.substring(0, 10) === todayStr);
  const todayCompleted = todayTasks.filter(t => t.completed);
  
  const todayProgressPercent = todayTasks.length > 0 
    ? Math.round((todayCompleted.length / todayTasks.length) * 100) 
    : 0;
  
  document.getElementById('dashTodayProgress').textContent = `${todayProgressPercent}%`;
  document.getElementById('dashTodayProgressRatio').textContent = `${todayCompleted.length} of ${todayTasks.length} quests completed`;
  
  // Today's XP gain calculation
  const todayXpGain = todayCompleted.reduce((sum, t) => sum + getXpReward(t.difficulty), 0);
  document.getElementById('dashTodayXp').textContent = todayXpGain;

  // Render Dashboard active tasks list
  renderDashboardTasks(todayTasks);
  
  // Render achievements showcase
  renderDashboardBadges();

  // 3. Quests view values
  renderQuestsList();

  // 4. Reports View Header Values
  const activeMonthName = getMonthName(new Date());
  document.getElementById('currentMonthName').textContent = activeMonthName;
  
  const monthCompletedTasks = state.tasks.filter(t => t.completed);
  const monthXpEarned = monthCompletedTasks.reduce((sum, t) => sum + getXpReward(t.difficulty), 0);
  const monthCompletionRate = state.tasks.length > 0
    ? Math.round((monthCompletedTasks.length / state.tasks.length) * 100)
    : 0;

  document.getElementById('reportCurrentCompleted').textContent = monthCompletedTasks.length;
  document.getElementById('reportCurrentXp').textContent = `${monthXpEarned} XP`;
  document.getElementById('reportCurrentRate').textContent = `${monthCompletionRate}%`;
}

// Trigger Level Up Ceremony Modal
function triggerLevelUpModal(newLevel) {
  document.getElementById('modalLevelNumber').innerHTML = `${newLevel}
    <i class="fa-solid fa-star level-star s1"></i>
    <i class="fa-solid fa-star level-star s2"></i>`;
  document.getElementById('modalLevelMessage').textContent = `Your power has grown! You've ascended to Level ${newLevel}.`;
  document.getElementById('modalUnlockItem').innerHTML = `
    <i class="fa-solid fa-award" style="color: var(--accent-amber);"></i>
    <span>"${getLevelTierName(newLevel)}" Title unlocked!</span>
  `;
  
  document.getElementById('levelUpModal').classList.add('active');
  
  // Trigger particle celebrations and level sound
  setTimeout(() => {
    AudioEngine.playLevelUp();
    ConfettiEngine.blast();
  }, 150);
}

// Helper to get month name
function getMonthName(date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// Render tasks on the dashboard list
function renderDashboardTasks(todayTasks) {
  const container = document.getElementById('dashTasksList');
  if (todayTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-sun"></i>
        <h3>A Clean Slate</h3>
        <p>No quests scheduled for today. Add a task using the bar above or create detailed quests in the Quests page.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  todayTasks.forEach(task => {
    const item = createTaskRow(task);
    container.appendChild(item);
  });
}

// Render badges in dashboard badge grid
function renderDashboardBadges() {
  const container = document.getElementById('dashBadgesShowcase');
  container.innerHTML = '';

  ACHIEVEMENTS.forEach(badge => {
    const isUnlocked = state.unlockedBadges.includes(badge.id);
    const item = document.createElement('div');
    item.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
    
    item.innerHTML = `
      <div class="badge-icon-wrap">
        <i class="fa-solid ${badge.icon}"></i>
      </div>
      <span class="badge-title">${badge.title}</span>
      <div class="badge-tooltip">
        <strong>${badge.title}</strong><br>
        ${badge.desc}<br>
        <span style="font-size: 0.65rem; color: ${isUnlocked ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
          ${isUnlocked ? 'Completed' : 'Locked'}
        </span>
      </div>
    `;
    container.appendChild(item);
  });
}

// Create a single task row item
function createTaskRow(task) {
  const div = document.createElement('div');
  div.className = `task-item ${task.completed ? 'completed' : ''}`;
  div.setAttribute('data-id', task.id);

  div.innerHTML = `
    <div class="checkbox-wrapper">
      <input type="checkbox" id="check-${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
      <label for="check-${task.id}" class="checkbox-visual"></label>
    </div>
    <div class="task-content">
      <div class="task-title">${escapeHTML(task.title)}</div>
      ${task.desc ? `<div class="task-desc">${escapeHTML(task.desc)}</div>` : ''}
      <div class="task-meta-row">
        <span class="task-badge ${task.difficulty}">${task.difficulty}</span>
        <span class="task-badge tag">${escapeHTML(task.category)}</span>
        <span class="task-xp-value">+${getXpReward(task.difficulty)} XP</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn edit" title="Edit Quest"><i class="fa-solid fa-pen"></i></button>
      <button class="task-action-btn delete" title="Delete Quest"><i class="fa-solid fa-trash-can"></i></button>
    </div>
  `;

  // Bind checkbox change event
  const checkbox = div.querySelector('.task-checkbox');
  checkbox.addEventListener('change', (e) => {
    toggleTaskCompletion(task.id, e.target.checked);
  });

  // Bind edit task event
  div.querySelector('.task-action-btn.edit').addEventListener('click', () => {
    openEditQuestForm(task);
  });

  // Bind delete task event
  div.querySelector('.task-action-btn.delete').addEventListener('click', () => {
    openConfirmDeleteModal(task.id);
  });

  return div;
}

// HTML escape helper
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Toggle completion of a task
function toggleTaskCompletion(id, completed) {
  const taskIndex = state.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return;

  const task = state.tasks[taskIndex];
  task.completed = completed;
  task.dateCompleted = completed ? new Date().toISOString() : null;

  const xpAmount = getXpReward(task.difficulty);

  if (completed) {
    state.user.xp += xpAmount;
    state.user.totalScore += xpAmount;
    
    // Audio trigger and confetti blast
    AudioEngine.playChime();
    ConfettiEngine.blast();
    
    showToast("+ " + xpAmount + " XP", `Quest Completed: "${task.title}"`, true);
  } else {
    // Undo completion - deduct XP
    state.user.xp = Math.max(0, state.user.xp - xpAmount);
    state.user.totalScore = Math.max(0, state.user.totalScore - xpAmount);
    showToast("- " + xpAmount + " XP", `Quest Undo: "${task.title}"`);
  }

  // Recalculate streak
  state.user.streak = calculateStreak(state.tasks);
  
  saveState();
  checkAchievements();
}

// Render tasks list in Quests tab
function renderQuestsList() {
  const container = document.getElementById('fullTasksList');
  const activeFilterBtn = document.querySelector('.filter-group .filter-btn.active');
  const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

  let filteredTasks = [...state.tasks];
  if (filter === 'active') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  } else if (filter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  }

  if (filteredTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-list"></i>
        <h3>No Quests Found</h3>
        <p>No tasks match the active filters. Create a new quest to begin.</p>
      </div>
    `;
    return;
  }

  // Sort: Active tasks first, then sorted by dateCreated descending
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return b.dateCreated.localeCompare(a.dateCreated);
  });

  container.innerHTML = '';
  filteredTasks.forEach(task => {
    const item = createTaskRow(task);
    container.appendChild(item);
  });
}

// --- 6. ADVANCED SVG ANALYTICS GENERATOR ---

function renderCharts() {
  // 1. Calculate historical metrics
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.completed);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  document.getElementById('statsCompletionRate').textContent = `${completionRate}%`;
  document.getElementById('statsRatioText').textContent = `${completedTasks.length} of ${totalTasks} lifetime quests`;

  // Compute daily average XP
  const completionDates = state.tasks
    .filter(t => t.completed && t.dateCompleted)
    .map(t => t.dateCompleted.substring(0, 10));
  
  let dailyAverage = 0;
  let bestDay = "No data";
  let bestDayXp = 0;
  let worstDay = "No data";
  let worstDayXp = Infinity;

  if (completionDates.length > 0) {
    // Group XP by date
    const xpByDate = {};
    state.tasks.forEach(t => {
      if (t.completed && t.dateCompleted) {
        const dStr = t.dateCompleted.substring(0, 10);
        const reward = getXpReward(t.difficulty);
        xpByDate[dStr] = (xpByDate[dStr] || 0) + reward;
      }
    });

    const dates = Object.keys(xpByDate);
    const xps = Object.values(xpByDate);
    const sumXp = xps.reduce((sum, v) => sum + v, 0);
    
    // We average over either actual days active or a default range
    dailyAverage = Math.round(sumXp / dates.length);

    // Best / Worst days calculations
    dates.forEach(d => {
      const xp = xpByDate[d];
      if (xp > bestDayXp) {
        bestDayXp = xp;
        bestDay = formatDateLabel(d);
      }
      if (xp < worstDayXp) {
        worstDayXp = xp;
        worstDay = formatDateLabel(d);
      }
    });
    
    if (worstDayXp === Infinity) {
      worstDayXp = 0;
      worstDay = "No data";
    }
  }

  document.getElementById('statsDailyAverage').textContent = dailyAverage;
  document.getElementById('statsBestDay').textContent = bestDay;
  document.getElementById('statsBestDayXp').textContent = `${bestDayXp} XP gained`;
  document.getElementById('statsWorstDay').textContent = worstDay === "No data" ? "No data" : worstDay;
  document.getElementById('statsWorstDayXp').textContent = `${worstDay === "No data" ? 0 : worstDayXp} XP gained`;

  // 2. Render Weekly SVG Column Chart
  renderWeeklyChart();

  // 3. Render Monthly SVG Area Chart
  renderMonthlyChart();

  // 4. Render Category Donut Chart
  renderCategoryChart(completedTasks);
}

// Format YYYY-MM-DD to Short readable string (e.g. Jun 24)
function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
}

// Weekly Chart Generator
function renderWeeklyChart() {
  const container = document.getElementById('weeklyChartContainer');
  
  // Compile last 7 days arrays
  const last7Days = [];
  const daysLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().substring(0, 10);
    last7Days.push(dStr);
    daysLabels.push(d.toLocaleDateString('default', { weekday: 'short' }));
  }

  // Calculate XP per day
  const dailyXps = last7Days.map(date => {
    return state.tasks
      .filter(t => t.completed && t.dateCompleted && t.dateCompleted.substring(0, 10) === date)
      .reduce((sum, t) => sum + getXpReward(t.difficulty), 0);
  });

  const maxXp = Math.max(...dailyXps, 50); // Set minimum height scale of 50 XP

  // Construct SVG
  let barsSvg = '';
  const chartHeight = 150;
  const chartWidth = 320;
  const paddingX = 40;
  const spacingX = (chartWidth - paddingX * 2) / 6;

  dailyXps.forEach((xp, i) => {
    const colHeight = (xp / maxXp) * chartHeight;
    const x = paddingX + i * spacingX - 10; // offset center
    const y = 180 - colHeight; // 180 is the floor coordinate

    barsSvg += `
      <g>
        <rect x="${x}" y="${y}" width="20" height="${colHeight}" rx="4" class="chart-bar">
          <title>${xp} XP Earned</title>
        </rect>
        <text x="${x + 10}" y="196" text-anchor="middle" class="chart-text">${daysLabels[i]}</text>
        ${xp > 0 ? `<text x="${x + 10}" y="${y - 6}" text-anchor="middle" class="chart-text" style="fill: var(--text-primary); font-size: 8px;">${xp}</text>` : ''}
      </g>
    `;
  });

  container.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 350 220">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
        <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d8b4fe" />
          <stop offset="100%" stop-color="#818cf8" />
        </linearGradient>
      </defs>
      
      <!-- Axis Lines -->
      <line x1="30" y1="180" x2="330" y2="180" class="chart-axis-line" />
      
      <!-- Grid guide lines -->
      <line x1="30" y1="105" x2="330" y2="105" class="chart-grid-line" />
      <line x1="30" y1="30" x2="330" y2="30" class="chart-grid-line" />
      
      <!-- Y-Axis labels -->
      <text x="22" y="183" text-anchor="end" class="chart-text">0</text>
      <text x="22" y="108" text-anchor="end" class="chart-text">${Math.round(maxXp / 2)}</text>
      <text x="22" y="33" text-anchor="end" class="chart-text">${maxXp}</text>

      ${barsSvg}
    </svg>
  `;
}

// Monthly Area Line Chart
function renderMonthlyChart() {
  const container = document.getElementById('monthlyChartContainer');
  
  // Calculate active month days
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const totalDays = new Date(year, month + 1, 0).getDate();
  const dailyCumulativeXps = [];
  
  // Group tasks completed this month
  const currentMonthTasks = state.tasks.filter(t => {
    if (!t.completed || !t.dateCompleted) return false;
    const tcDate = new Date(t.dateCompleted);
    return tcDate.getFullYear() === year && tcDate.getMonth() === month;
  });

  let runningXpSum = 0;
  for (let day = 1; day <= totalDays; day++) {
    const dayXp = currentMonthTasks
      .filter(t => new Date(t.dateCompleted).getDate() === day)
      .reduce((sum, t) => sum + getXpReward(t.difficulty), 0);
    runningXpSum += dayXp;
    dailyCumulativeXps.push(runningXpSum);
  }

  const maxXp = Math.max(...dailyCumulativeXps, 100);

  const chartWidth = 320;
  const chartHeight = 150;
  const paddingX = 40;
  const stepX = (chartWidth - paddingX * 2) / (totalDays - 1);
  
  // Build SVG path coordinate vectors
  let pathPoints = '';
  let areaPoints = `40,180 `; // Bottom left corner for area fill

  dailyCumulativeXps.forEach((xp, idx) => {
    const x = paddingX + idx * stepX;
    const y = 180 - (xp / maxXp) * chartHeight;
    pathPoints += `${idx === 0 ? 'M' : 'L'} ${x} ${y} `;
    areaPoints += `${x},${y} `;
  });

  areaPoints += `${paddingX + (totalDays - 1) * stepX},180`; // Close bottom right path

  // Build dots markers
  let dotsSvg = '';
  // Highlight markers at intervals to avoid cluttering
  const stepInterval = Math.max(1, Math.round(totalDays / 8));
  for (let idx = 0; idx < totalDays; idx += stepInterval) {
    const x = paddingX + idx * stepX;
    const y = 180 - (dailyCumulativeXps[idx] / maxXp) * chartHeight;
    dotsSvg += `
      <circle cx="${x}" cy="${y}" r="4" class="chart-dot">
        <title>Day ${idx + 1}: ${dailyCumulativeXps[idx]} XP</title>
      </circle>
    `;
  }
  // Always include last day dot
  const lastX = paddingX + (totalDays - 1) * stepX;
  const lastY = 180 - (dailyCumulativeXps[totalDays - 1] / maxXp) * chartHeight;
  dotsSvg += `
    <circle cx="${lastX}" cy="${lastY}" r="4" class="chart-dot">
      <title>Final Day ${totalDays}: ${dailyCumulativeXps[totalDays - 1]} XP</title>
    </circle>
  `;

  container.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 350 220">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.0"/>
        </linearGradient>
      </defs>

      <!-- Axis lines -->
      <line x1="30" y1="180" x2="330" y2="180" class="chart-axis-line" />
      
      <!-- Grid lines -->
      <line x1="30" y1="105" x2="330" y2="105" class="chart-grid-line" />
      <line x1="30" y1="30" x2="330" y2="30" class="chart-grid-line" />

      <!-- Y Axis Label labels -->
      <text x="22" y="183" text-anchor="end" class="chart-text">0</text>
      <text x="22" y="108" text-anchor="end" class="chart-text">${Math.round(maxXp / 2)}</text>
      <text x="22" y="33" text-anchor="end" class="chart-text">${maxXp}</text>

      <!-- Area and Line Paths -->
      <polyline points="${areaPoints}" class="chart-area-path" />
      <path d="${pathPoints}" class="chart-line-path" />

      <!-- Points markers -->
      ${dotsSvg}

      <!-- Day boundary markers -->
      <text x="40" y="196" text-anchor="middle" class="chart-text">Day 1</text>
      <text x="${paddingX + (totalDays - 1) * stepX}" y="196" text-anchor="middle" class="chart-text">Day ${totalDays}</text>
    </svg>
  `;
}

// Category Distribution Donut Chart
function renderCategoryChart(completedTasks) {
  const container = document.getElementById('categoryChartContainer');
  const legend = document.getElementById('categoryLegend');
  
  if (completedTasks.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; margin-top: 4.5rem;">
        No completed quests data.
      </div>
    `;
    legend.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-muted); grid-column: span 2; text-align: center;">
        Complete tasks to see category distribution.
      </div>
    `;
    return;
  }

  // Count completions per category
  const counts = { Personal: 0, Work: 0, Health: 0, Coding: 0, Other: 0 };
  completedTasks.forEach(t => {
    if (counts[t.category] !== undefined) {
      counts[t.category]++;
    } else {
      counts.Other++;
    }
  });

  const categories = Object.keys(counts);
  const colors = {
    Personal: '#3b82f6', // Blue
    Work: '#a855f7',     // Purple
    Health: '#10b981',   // Emerald
    Coding: '#06b6d4',   // Cyan
    Other: '#64748b'     // Slate
  };

  const total = completedTasks.length;
  
  // Calculate SVG stroke segments
  let donutSegmentsSvg = '';
  let accumulatedPercent = 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius; // ~188.5

  categories.forEach(cat => {
    const count = counts[cat];
    if (count === 0) return;
    
    const percentage = count / total;
    const segmentDash = strokeDashHelper(percentage, circumference);
    const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
    
    donutSegmentsSvg += `
      <circle cx="50" cy="50" r="${radius}"
        class="donut-segment"
        stroke="${colors[cat]}"
        stroke-dasharray="${segmentDash}"
        stroke-dashoffset="${strokeOffset}"
        transform="rotate(-90, 50, 50)">
        <title>${cat}: ${count} completed (${Math.round(percentage * 100)}%)</title>
      </circle>
    `;
    
    accumulatedPercent += percentage * 100;
  });

  container.innerHTML = `
    <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
      <!-- Inner text -->
      <circle cx="50" cy="50" r="23" fill="var(--bg-secondary)"></circle>
      <text x="50" y="47" text-anchor="middle" font-family="var(--font-heading)" font-weight="700" font-size="12" fill="var(--text-primary)">
        ${total}
      </text>
      <text x="50" y="60" text-anchor="middle" font-family="var(--font-body)" font-size="7" fill="var(--text-secondary)">
        Quests
      </text>
      ${donutSegmentsSvg}
    </svg>
  `;

  // Update legends panel
  legend.innerHTML = '';
  categories.forEach(cat => {
    const count = counts[cat];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-color" style="background-color: ${colors[cat]};"></div>
      <span style="flex: 1;">${cat} (${count})</span>
      <strong>${percentage}%</strong>
    `;
    legend.appendChild(item);
  });
}

function strokeDashHelper(percent, circumference) {
  const strokeVal = percent * circumference;
  return `${strokeVal} ${circumference - strokeVal}`;
}

// --- 7. ARCHIVING & HISTORIES SYSTEM ---

function archiveCurrentMonth() {
  const activeTasks = [...state.tasks];
  if (activeTasks.length === 0) {
    showToast("Archival Cancelled", "No active tasks in current month to archive.");
    return;
  }

  const completed = activeTasks.filter(t => t.completed);
  const completionRate = Math.round((completed.length / activeTasks.length) * 100);
  const xpEarned = completed.reduce((sum, t) => sum + getXpReward(t.difficulty), 0);

  const archive = {
    id: Date.now(),
    name: getMonthName(new Date()),
    stats: {
      completed: completed.length,
      total: activeTasks.length,
      rate: completionRate,
      xp: xpEarned
    },
    tasks: activeTasks
  };

  // Add to archives array
  state.archives.unshift(archive);

  // Clear completed tasks, carry forward active incomplete tasks to next month!
  state.tasks = activeTasks.filter(t => !t.completed);
  
  // Show toast notification
  AudioEngine.playBadgeUnlock();
  showToast("Month Archived", `Operational logs sealed for ${archive.name}.`);
  
  saveState();
  checkAchievements();
  switchView('dashboard');
}

// Render Archived logs in timeline accordion list
function renderReports() {
  const container = document.getElementById('archivesTimeline');
  if (state.archives.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-folder-open"></i>
        <h3>No Archives Found</h3>
        <p>Once you archive a month's logs, they will show up here as detailed reports.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  state.archives.forEach(arc => {
    const card = document.createElement('div');
    card.className = 'archive-card';
    card.setAttribute('data-id', arc.id);
    
    card.innerHTML = `
      <div class="archive-card-header">
        <span class="archive-name">
          <i class="fa-solid fa-file-invoice" style="color: var(--accent-purple);"></i>
          ${escapeHTML(arc.name)}
        </span>
        <div class="archive-header-stats">
          <span>Success: <strong>${arc.stats.rate}%</strong></span>
          <span>XP: <strong>+${arc.stats.xp}</strong></span>
          <i class="fa-solid fa-chevron-down archive-arrow"></i>
        </div>
      </div>
      <div class="archive-card-content">
        <div class="archive-details-grid">
          <div class="archive-detail-block">
            <span class="archive-detail-label">Completion Ratio</span>
            <span class="archive-detail-value">${arc.stats.completed} / ${arc.stats.total} Quests</span>
          </div>
          <div class="archive-detail-block">
            <span class="archive-detail-label">Total XP Claimed</span>
            <span class="archive-detail-value">${arc.stats.xp} XP</span>
          </div>
          <div class="archive-detail-block">
            <span class="archive-detail-label">Archive Timestamp</span>
            <span class="archive-detail-value" style="font-size: 0.75rem;">${new Date(arc.id).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="archive-tasks-summary">
          ${arc.tasks.map(t => `
            <div class="archived-task-row ${t.completed ? 'completed' : 'pending'}">
              <span class="archived-task-left">
                <i class="fa-solid ${t.completed ? 'fa-circle-check' : 'fa-circle-notch'}"></i>
                <span>${escapeHTML(t.title)}</span>
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${t.category} | ${t.difficulty}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind Accordion expandable toggle click
    card.querySelector('.archive-card-header').addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    container.appendChild(card);
  });
}

// --- 8. TASK FORM OPERATIONS (CRUD) ---

// Opens new task form panel
function openAddTaskForm() {
  document.getElementById('taskForm').reset();
  document.getElementById('formTaskId').value = '';
  document.getElementById('formPanelTitle').textContent = 'Create New Quest';
  document.getElementById('taskFormPanel').classList.add('active');
  // Scroll to form panel smoothly
  document.getElementById('taskFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// Populates form to edit existing task details
function openEditQuestForm(task) {
  switchView('tasks');
  document.getElementById('formTaskId').value = task.id;
  document.getElementById('formTaskTitle').value = task.title;
  document.getElementById('formTaskDesc').value = task.desc || '';
  document.getElementById('formTaskCategory').value = task.category;
  document.getElementById('formTaskDifficulty').value = task.difficulty;
  document.getElementById('formPanelTitle').textContent = 'Modify Quest Parameters';
  
  document.getElementById('taskFormPanel').classList.add('active');
  document.getElementById('taskFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// Handle Form submissions (Add/Save edits)
function handleTaskFormSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('formTaskId').value;
  const title = document.getElementById('formTaskTitle').value.trim();
  const desc = document.getElementById('formTaskDesc').value.trim();
  const category = document.getElementById('formTaskCategory').value;
  const difficulty = document.getElementById('formTaskDifficulty').value;

  if (!title) return;

  if (id) {
    // Modify existing Task
    const tIndex = state.tasks.findIndex(t => t.id === id);
    if (tIndex !== -1) {
      // If difficulty changed, handle completed XP updates accordingly
      const prevTask = state.tasks[tIndex];
      if (prevTask.completed && prevTask.difficulty !== difficulty) {
        const prevXp = getXpReward(prevTask.difficulty);
        const newXp = getXpReward(difficulty);
        state.user.xp = Math.max(0, state.user.xp - prevXp + newXp);
        state.user.totalScore = Math.max(0, state.user.totalScore - prevXp + newXp);
      }
      
      state.tasks[tIndex] = {
        ...prevTask,
        title,
        desc,
        category,
        difficulty
      };
      showToast("Quest Updated", `"${title}" has been modified.`);
    }
  } else {
    // Add New Task
    const newTask = {
      id: 'task-' + Date.now(),
      title,
      desc,
      category,
      difficulty,
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    };
    state.tasks.unshift(newTask);
    showToast("Quest Drafted", `"${title}" added to active logs.`);
  }

  document.getElementById('taskFormPanel').classList.remove('active');
  document.getElementById('taskForm').reset();
  
  saveState();
  checkAchievements();
}

// --- 9. DIALOGS & DATA PORTABILITY (BACKUP/RESTORE) ---

let activeDeleteTaskId = null;

function openConfirmDeleteModal(id) {
  activeDeleteTaskId = id;
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('confirmModalTitle').textContent = "Delete Quest?";
  document.getElementById('confirmModalDesc').textContent = `Are you sure you want to delete "${task.title}"? Historical XP metrics for completed items will be retained.`;
  document.getElementById('confirmModal').classList.add('active');
}

function handleConfirmModalAction() {
  if (activeDeleteTaskId) {
    const task = state.tasks.find(t => t.id === activeDeleteTaskId);
    if (task) {
      state.tasks = state.tasks.filter(t => t.id !== activeDeleteTaskId);
      showToast("Quest Removed", `"${task.title}" deleted.`);
      saveState();
    }
    activeDeleteTaskId = null;
  }
  document.getElementById('confirmModal').classList.remove('active');
}

// Reset entire profile data
function resetSaveData() {
  localStorage.removeItem('taskquest_save_data');
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  // Onboarding mock tasks
  state.tasks = getOnboardingQuests();
  
  saveState();
  showToast("Data Erased", "System storage has been factory reset.");
  switchView('dashboard');
}

// Data Export JSON Save file
function exportSaveFile() {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `taskquest_backup_${new Date().toISOString().substring(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("Save Exported", "Configuration file successfully downloaded.");
}

// Data Import JSON Save file
function handleSaveFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (parsed && parsed.user && parsed.tasks) {
        state = parsed;
        saveState();
        showToast("Save Restored", "State backup parsed and loaded successfully.");
        switchView('dashboard');
      } else {
        showToast("Import Failed", "Invalid backup schema definition.", false);
      }
    } catch (err) {
      showToast("Parse Error", "Failed to decode backup document structure.", false);
    }
  };
  reader.readAsText(file);
}

// --- 10. CONTROLLERS INITIALIZATION & EVENTS BINDING ---

document.addEventListener('DOMContentLoaded', () => {
  // Load state and startup triggers
  loadState();
  ConfettiEngine.init();
  updateUI();
  checkAchievements();

  // Sidebar link view swappers
  document.querySelectorAll('.sidebar-menu .menu-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = link.getAttribute('data-view');
      switchView(viewId);
    });
  });

  // Mobile menu sidebar toggle
  document.getElementById('sidebarToggleBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('mobile-open');
  });

  // Tap outside mobile sidebar to dismiss it
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebar.classList.contains('mobile-open') && 
        !sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });

  // Dashboard Quick-Add handlers
  const quickInput = document.getElementById('quickAddInput');
  const quickBtn = document.getElementById('quickAddBtn');

  function triggerQuickAdd() {
    const val = quickInput.value.trim();
    if (!val) return;
    
    const newTask = {
      id: 'task-' + Date.now(),
      title: val,
      desc: '',
      category: 'Personal',
      difficulty: 'medium', // Default to medium
      dateCreated: new Date().toISOString(),
      completed: false,
      dateCompleted: null
    };
    state.tasks.unshift(newTask);
    quickInput.value = '';
    
    showToast("Quest Drafted", `"${val}" added as Medium.`);
    saveState();
    checkAchievements();
  }

  quickInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerQuickAdd();
  });
  quickBtn.addEventListener('click', triggerQuickAdd);

  // Quests View Form controllers
  document.getElementById('addTaskTriggerBtn').addEventListener('click', openAddTaskForm);
  document.getElementById('cancelFormBtn').addEventListener('click', () => {
    document.getElementById('taskFormPanel').classList.remove('active');
  });
  document.getElementById('taskForm').addEventListener('submit', handleTaskFormSubmit);

  // Quests View Filters swappers
  document.querySelectorAll('.filter-group .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderQuestsList();
    });
  });

  // Reports Views controllers
  document.getElementById('archiveMonthBtn').addEventListener('click', () => {
    // Open a confirmation modal styled for archiver
    document.getElementById('confirmModalTitle').textContent = "Seal Archive Log?";
    document.getElementById('confirmModalDesc').textContent = "This will compile all current completed tasks into a report history, clearing active records for next month. Active incomplete items will carry forward.";
    // Set specialized click callback
    const confirmBtn = document.getElementById('confirmModalAction');
    confirmBtn.onclick = function() {
      archiveCurrentMonth();
      document.getElementById('confirmModal').classList.remove('active');
    };
    document.getElementById('confirmModal').classList.add('active');
  });

  // Settings Controllers
  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const val = document.getElementById('settingsProfileName').value.trim();
    if (val) {
      state.user.name = val;
      showToast("Profile Updated", `Adventurer ID changed to: "${val}"`);
      saveState();
    }
  });

  document.getElementById('settingsSoundToggle').addEventListener('change', (e) => {
    state.settings.soundEnabled = e.target.checked;
    saveState();
  });

  document.getElementById('settingsConfettiToggle').addEventListener('change', (e) => {
    state.settings.confettiEnabled = e.target.checked;
    saveState();
  });

  // Settings Data port controllers
  document.getElementById('exportDataBtn').addEventListener('click', exportSaveFile);
  
  const fileInput = document.getElementById('importFileInput');
  document.getElementById('importTriggerBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleSaveFileImport);

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    document.getElementById('confirmModalTitle').textContent = "Erase Profile Storage?";
    document.getElementById('confirmModalDesc').textContent = "This will wipe all active tasks, badges, and archived histories. The app will return to a clean default state.";
    const confirmBtn = document.getElementById('confirmModalAction');
    confirmBtn.onclick = function() {
      resetSaveData();
      document.getElementById('confirmModal').classList.remove('active');
    };
    document.getElementById('confirmModal').classList.add('active');
  });

  // Confirmation modal close buttons
  document.getElementById('confirmModalCancel').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.remove('active');
  });
  
  // Set default action reset back to standard handler
  const confirmBtn = document.getElementById('confirmModalAction');
  document.getElementById('confirmModal').addEventListener('transitionend', () => {
    if (!document.getElementById('confirmModal').classList.contains('active')) {
      // Revert action binding back to delete quest
      confirmBtn.onclick = handleConfirmModalAction;
    }
  });
  confirmBtn.onclick = handleConfirmModalAction;

  // Level up claim button
  document.getElementById('claimRewardsBtn').addEventListener('click', () => {
    document.getElementById('levelUpModal').classList.remove('active');
  });
});
