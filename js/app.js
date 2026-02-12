// Ramadan Quests - Main Application Logic
// ==========================================

class RamadanQuestsApp {
    constructor() {
        this.currentDay = this.calculateCurrentDay();
        this.userProgress = this.loadProgress();
        this.init();
        this.saveProgress();

    }

    init() {
        this.setupEventListeners();
        this.renderCurrentQuest();
        this.renderQuestsGrid();
        this.updateProgressStats();
        this.renderBadges();
        this.startCountdown();
        this.updateParentDashboard();
        this.checkForNewBadges();
    }

    // Calculate current day of Ramadan
    calculateCurrentDay() {
        const ramadanStartDate = new Date('2026-02-18');
        const today = new Date();
        
        // If before Ramadan, return day 0
        if (today < ramadanStartDate) {
            return 0;
        }
        
        // Calculate days since Ramadan started
        const diffTime = Math.abs(today - ramadanStartDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Ramadan is 29 or 30 days
        return Math.min(diffDays, 30);
    }
 
    // Load user progress from localStorage
    loadProgress() {
        const savedProgress = localStorage.getItem('ramadanQuestsProgress');
        if (savedProgress) {
            const p = JSON.parse(savedProgress);

            // Ensure completedQuests is always an array of objects: { day: number, ... }
            p.completedQuests = (p.completedQuests || [])
            .map(it => {
                if (typeof it === 'number') return { day: it }; // migrate old numeric format
                if (it && typeof it.day !== 'undefined') return { ...it, day: Number(it.day) };
                return null;
            })
            .filter(Boolean);

            // Normalize basic fields
            p.points = Number(p.points || 0);
            p.badges = Array.isArray(p.badges) ? p.badges : [];
            p.streak = Number(p.streak || 0);
            p.lastCompletedDate = p.lastCompletedDate || null;

            return p;
        }

        return {
            completedQuests: [],
            points: 0,
            badges: [],
            streak: 0,
            lastCompletedDate: null
        };
        }

    // Save user progress to localStorage
    saveProgress() {
        localStorage.setItem('ramadanQuestsProgress', JSON.stringify(this.userProgress));
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation toggle for mobile
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Smooth scroll for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Start Quest button
        const startQuestBtn = document.getElementById('startQuestBtn');
        if (startQuestBtn) {
            startQuestBtn.addEventListener('click', () => {
                document.getElementById('quests').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Week tabs
        document.querySelectorAll('.week-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.week-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterQuestsByWeek(parseInt(tab.dataset.week));
            });
        });

        // Notification toggle
        const notificationToggle = document.getElementById('notificationToggle');
        if (notificationToggle) {
            notificationToggle.addEventListener('change', (e) => {
                this.toggleNotifications(e.target.checked);
            });
        }

        // Update active nav link on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNavLink();
        });
    }

    // Render current day's quest
    renderCurrentQuest() {
        const currentQuestCard = document.getElementById('currentQuestCard');
        if (!currentQuestCard) return;

        if (this.currentDay === 0) {
            // Before Ramadan starts
            currentQuestCard.innerHTML = `
                <div class="quest-emoji">🌙</div>
                <h3>Ramadan is Coming Soon!</h3>
                <p class="quest-description">Get ready for 30 amazing days of adventure! Check the countdown above to see when we start!</p>
                <button class="btn btn-primary"
                    style="position: relative; z-index: 2; pointer-events: auto;"
                    onclick="app.renderQuestsGrid(); document.getElementById('quests').scrollIntoView({ behavior: 'smooth' })">
                    <i class="fas fa-calendar"></i> View All Quests
                </button>

            `;
            this.renderQuestsGrid();
            return;
        }

        const quest = questsData[this.currentDay - 1];
        if (!quest) return;

        const isCompleted = this.userProgress.completedQuests.includes(quest.day);

        currentQuestCard.innerHTML = `
            <div class="quest-emoji">${quest.emoji}</div>
            <div style="position: relative; z-index: 1;">
                <h3>Day ${quest.day}: ${quest.title}</h3>
                <p class="quest-description">${quest.description}</p>
                <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 12px; margin: 1.5rem 0;">
                    <strong>🎯 Today's Quest:</strong>
                    <p style="margin-top: 0.5rem; font-size: 1.1rem;">${quest.quest}</p>
                </div>
                ${isCompleted ? `
                    <div style="background: rgba(76, 175, 80, 0.3); padding: 1rem; border-radius: 12px; margin-top: 1rem;">
                        <strong>✅ Quest Completed!</strong>
                        <p style="margin-top: 0.5rem;">Great job! You earned ${quest.points} points!</p>
                    </div>
                ` : `
                    <button class="btn btn-large" onclick="app.openQuestModal(${quest.day})" style="background: white; color: var(--primary-color); margin-top: 1rem;">
                        <i class="fas fa-info-circle"></i> View Quest Details
                    </button>
                `}
            </div>
        `;
    }

    // Render quests grid
    renderQuestsGrid() {
        const questsGrid = document.getElementById('questsGrid');
        if (!questsGrid) return;

        questsGrid.innerHTML = '';

        questsData.forEach(quest => {
            const isCompleted = this.userProgress.completedQuests.some(q => q.day === quest.day);
            const isLocked = quest.day > this.currentDay && this.currentDay !== 0;
            const isCurrent = quest.day === this.currentDay;

            const questCard = document.createElement('div');
            questCard.className = `quest-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
            questCard.dataset.week = quest.week;

            if (!isLocked) {
                questCard.style.cursor = 'pointer';
                questCard.addEventListener('click', () => this.openQuestModal(quest.day));
            }

            questCard.innerHTML = `
                <div class="quest-header">
                    <span class="quest-day">Day ${quest.day}</span>
                    <span class="quest-status">
                        ${isCompleted ? '✅' : isLocked ? '🔒' : isCurrent ? '⭐' : '📍'}
                    </span>
                </div>
                <div class="quest-emoji-badge">${quest.emoji}</div>
                <h3 class="quest-title">${quest.title.replace(/[🌙📖⭐📕❤️🤲🍽️🕌😊🎁📿🌟🎉🦸🙏🧹💚🤝🤫📝🏃🌍🎊]/g, '').trim()}</h3>
                <span class="quest-category">${quest.category}</span>
                <p class="quest-preview">${quest.quest}</p>
                ${isCompleted ? '<div style="margin-top: 1rem; color: var(--success-color); font-weight: 600;"><i class="fas fa-check-circle"></i> Completed!</div>' : ''}
                ${isLocked ? '<div style="margin-top: 1rem; color: var(--text-color); opacity: 0.6;"><i class="fas fa-lock"></i> Unlocks on Day ' + quest.day + '</div>' : ''}
            `;

            questsGrid.appendChild(questCard);
        });
    }

    // Filter quests by week
    filterQuestsByWeek(week) {
        const questCards = document.querySelectorAll('.quest-card');
        questCards.forEach(card => {
            if (parseInt(card.dataset.week) === week) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Open quest detail modal
    openQuestModal(day) {
        const quest = questsData[day - 1];
        if (!quest) return;

        const modal = document.getElementById('questModal');
        const modalContent = document.getElementById('questModalContent');
        
        const isCompleted = this.userProgress.completedQuests.some(q => q.day === quest.day);
        const isLocked = quest.day > this.currentDay && this.currentDay !== 0;

        modalContent.innerHTML = `
            <div class="quest-detail">
                <div class="quest-detail-header">
                    <span class="quest-detail-emoji">${quest.emoji}</span>
                    <h2 class="quest-detail-title">Day ${quest.day}: ${quest.title.replace(/[🌙📖⭐📕❤️🤲🍽️🕌😊🎁📿🌟🎉🦸🙏🧹💚🤝🤫📝🏃🌍🎊]/g, '').trim()}</h2>
                    <span class="quest-detail-category">${quest.category}</span>
                </div>

                <div class="quest-detail-section">
                    <h4><i class="fas fa-book-open"></i> About This Quest</h4>
                    <p>${quest.description}</p>
                </div>

                <div class="quest-detail-section">
                    <h4><i class="fas fa-bullseye"></i> Your Mission</h4>
                    <p><strong>${quest.quest}</strong></p>
                </div>

                <div class="quest-detail-section">
                    <h4><i class="fas fa-clipboard-check"></i> How to Complete</h4>
                    <p>${quest.howToComplete}</p>
                </div>

                <div class="quest-detail-section">
                    <h4><i class="fas fa-users"></i> Parent Tip</h4>
                    <p><em>${quest.parentTip}</em></p>
                </div>

                <div class="quest-detail-section">
                    <h4><i class="fas fa-star"></i> Rewards</h4>
                    <p>Complete this quest to earn <strong>${quest.points} points</strong>!</p>
                </div>

                ${!isLocked ? `
                    <button class="complete-quest-btn"  onclick="app.completeQuest(${quest.day})" 
                            ${isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? '✅ Quest Completed!' : '🎯 Mark as Complete'}
                    </button>
                ` : `
                    <div style="text-align: center; padding: 1rem; background: var(--light-gray); border-radius: 12px;">
                        <i class="fas fa-lock" style="font-size: 2rem; color: var(--border-color);"></i>
                        <p style="margin-top: 0.5rem; color: var(--text-color); opacity: 0.7;">This quest unlocks on Day ${quest.day}</p>
                    </div>
                `}
            </div>
        `;

        modal.classList.add('active');
    }

    completeQuest(day) {
        // Already completed?
        day = Number(day);
        if (this.userProgress.completedQuests.some(q => Number(q.day) === day)) return;
        const quest = questsData[day - 1];
        
        // Add full quest object to completedQuests
        this.userProgress.completedQuests.push({
            day: quest.day,
            title: quest.title,
            points: quest.points,
            completedAt: new Date().toLocaleString()
        });

        // Add points
        this.userProgress.points += quest.points;

        // Update streak
        this.updateStreak();

        // Save progress
        this.saveProgress();

        // Show celebration
        this.celebrate();

        // Check for new badges
        this.checkForNewBadges();

        // Update UI
        this.renderCurrentQuest();
        this.renderQuestsGrid();
        this.updateProgressStats();
        this.updateParentDashboard();

        // Close modal
        this.closeQuestModal();

        // Show success message
        this.showNotification(
            `🎉 Quest Completed! You earned ${quest.points} points!`,
            'success'
        );
    }

    // Update streak
    updateStreak() {
        const today = new Date().toDateString();
        const lastCompleted = this.userProgress.lastCompletedDate;

        if (!lastCompleted) {
            this.userProgress.streak = 1;
        } else {
            const lastDate = new Date(lastCompleted);
            const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day, don't change streak
            } else if (diffDays === 1) {
                // Consecutive day
                this.userProgress.streak += 1;
            } else {
                // Streak broken
                this.userProgress.streak = 1;
            }
        }

        this.userProgress.lastCompletedDate = today;
    }

    // Update progress stats
    updateProgressStats() {
        const completed = this.userProgress.completedQuests.length;
        const total = 30;
        const percentage = Math.round((completed / total) * 100);

        // Update overall progress
        document.getElementById('overallPercentage').textContent = `${percentage}%`;
        document.getElementById('overallProgressBar').style.width = `${percentage}%`;
        document.getElementById('completedQuests').textContent = completed;

        // Update stats
        document.getElementById('totalPoints').textContent = this.userProgress.points;
        document.getElementById('currentStreak').textContent = this.userProgress.streak;
        document.getElementById('badgesEarned').textContent = this.userProgress.badges.length;
        document.getElementById('daysActive').textContent = completed;
    }

    // Check for new badges
    checkForNewBadges() {
        badgesData.forEach(badge => {
            if (this.userProgress.badges.includes(badge.id)) {
                return; // Already earned
            }

            let earned = false;

            if (badge.requirement === 'odd-nights') {
                // Check if all odd night quests completed (21, 23, 25, 27, 29)
                const oddNights = [21, 23, 25, 27, 29];
                earned = oddNights.every(day => this.userProgress.completedQuests.includes(day));
            } else if (typeof badge.requirement === 'number') {
                earned = this.userProgress.completedQuests.length >= badge.requirement;
            }

            if (earned) {
                this.awardBadge(badge);
            }
        });
    }

    // Award a badge
    awardBadge(badge) {
        this.userProgress.badges.push(badge.id);
        this.saveProgress();
        this.renderBadges();
        
        // Show celebration
        this.celebrate();
        
        // Show badge notification
        this.showNotification(`🏆 New Badge Earned: ${badge.name}! ${badge.message}`, 'badge');
    }

    // Render badges
    renderBadges() {
        const badgesGrid = document.getElementById('badgesGrid');
        if (!badgesGrid) return;

        badgesGrid.innerHTML = '';

        badgesData.forEach(badge => {
            const earned = this.userProgress.badges.includes(badge.id);

            const badgeCard = document.createElement('div');
            badgeCard.className = `badge-card ${earned ? 'earned' : 'locked'}`;

            badgeCard.innerHTML = `
                <span class="badge-emoji">${badge.emoji}</span>
                <h3 class="badge-name">${badge.name}</h3>
                <p class="badge-description">${badge.description}</p>
                ${earned ? '<span class="badge-earned-label">✅ Earned!</span>' : '<span style="opacity: 0.6; font-size: 0.9rem;">🔒 Locked</span>'}
            `;

            badgesGrid.appendChild(badgeCard);
        });
    }

    // Update parent dashboard
    updateParentDashboard() {
        const completed = this.userProgress.completedQuests.length;
        const completedUpToToday = this.userProgress.completedQuests
        .map(e => (typeof e === 'number' ? e : e?.day))
        .map(Number)
        .filter(d => d && d <= this.currentDay).length;

        const possible = Math.max(1, this.currentDay);
        const successRate = Math.round((completedUpToToday / possible) * 100);


        document.getElementById('parentCompletedQuests').textContent = `${completed}/30`;
        document.getElementById('successRate').textContent = `${successRate}%`;
        
        // Calculate favorite category
        const categories = {};
        this.userProgress.completedQuests.forEach(entry => {
            const day = (typeof entry === 'number') ? entry : (entry && entry.day) ? Number(entry.day) : null;
            if (!day) return;
            const quest = questsData[day - 1];
            if (!quest) return;
            categories[quest.category] = (categories[quest.category] || 0) + 1;
        });
        
        const favoriteCategory = Object.keys(categories).length > 0 
            ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b)
            : '-';
        
        document.getElementById('favoriteCategory').textContent = favoriteCategory;
        
        // Longest streak (for now, same as current streak)
        document.getElementById('longestStreak').textContent = `${this.userProgress.streak} days`;
    }

    // Countdown timer
    startCountdown() {
        // Helper function to create a date in Toronto timezone
        const createTorontoDate = (dateString) => {
            // Parse as UTC first
            const utcDate = new Date(dateString + 'Z');
            // Convert to Toronto timezone representation
            const torontoStr = utcDate.toLocaleString('en-US', { 
                timeZone: 'America/Toronto',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            // Parse the Toronto time string and adjust
            const torontoDate = new Date(torontoStr);
            const offset = utcDate.getTime() - torontoDate.getTime();
            return new Date(utcDate.getTime() + offset);
        };

        // Ramadan 2026 starts February 18 at 00:00 Toronto time
        const ramadanStartDate = createTorontoDate('2026-02-18T00:00:00');
        
        const updateCountdown = () => {
            // Get current time in Toronto timezone
            const now = new Date();
            const torontoStr = now.toLocaleString('en-US', { 
                timeZone: 'America/Toronto',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const torontoNow = new Date(torontoStr);
            const offset = now.getTime() - torontoNow.getTime();
            const nowToronto = new Date(now.getTime() + offset);
            
            const diff = ramadanStartDate - nowToronto;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Always update the display (don't hide it)
            if (document.getElementById('days')) {
                document.getElementById('days').textContent = Math.max(0, days).toString().padStart(2, '0');
            }
            if (document.getElementById('hours')) {
                document.getElementById('hours').textContent = Math.max(0, hours).toString().padStart(2, '0');
            }
            if (document.getElementById('minutes')) {
                document.getElementById('minutes').textContent = Math.max(0, minutes).toString().padStart(2, '0');
            }
            if (document.getElementById('seconds')) {
                document.getElementById('seconds').textContent = Math.max(0, seconds).toString().padStart(2, '0');
            }

            // Keep countdown visible even after Ramadan starts
            const countdownEl = document.getElementById('ramadanCountdown');
            if (countdownEl && diff < 0) {
                // Optionally change label after Ramadan starts
                const label = countdownEl.querySelector('.countdown-label');
                if (label && diff < -86400000) { // More than 1 day past
                    label.textContent = 'Ramadan has started! 🌙';
                }
            }
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Close quest modal
    closeQuestModal() {
        document.getElementById('questModal').classList.remove('active')
    }

    // Celebration animation
    celebrate() {
        createConfetti();
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'badge' ? '#f4a259' : '#00a896'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
     }

      // Update active nav link based on scroll
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });}

    // Toggle notifications
    toggleNotifications(enabled) {
        if (enabled && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('🔔 Daily quest reminders enabled!', 'success');
                }
            });
        }
    }

    }


 // Global functions for inline onclick handlers
function closeQuestModal() {
  if (window.app && typeof window.app.closeQuestModal === 'function') {
    return window.app.closeQuestModal();
  }
  const modal = document.getElementById('questModal');
  if (modal) modal.classList.remove('active');
}


// Ensure the Ramadan countdown element is visible
function showRamadanCountdown(options = {}) {
    try {
        const el = document.getElementById('ramadanCountdown');
        if (!el) return;

        // Make element visible (override any CSS hiding)
        el.style.display = 'block';
        el.style.opacity = '0';
        el.style.transition = 'opacity 400ms ease';

        // Force reflow then fade in
        void el.offsetWidth;
        el.style.opacity = '1';

        // Optionally scroll into view
        if (options.scroll) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (e) {
        console.error('showRamadanCountdown error:', e);
    }
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;

document.head.appendChild(style);

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = window.app = new RamadanQuestsApp();

  if (typeof showRamadanCountdown === 'function') {
    showRamadanCountdown({ scroll: false });
  }
});
