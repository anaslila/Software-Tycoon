// Software Tycoon - Complete Game Logic
// Author: AI Assistant | Date: August 30, 2025

class SoftwareTycoon {
    constructor() {
        this.gameState = {
            money: 1000,
            reputation: 0,
            totalRevenue: 0,
            companyName: "Garage Soft",
            workplace: {
                level: 0,
                name: "Garage",
                capacity: 1,
                speed: 1.0,
                cost: 10000
            },
            hardware: {
                level: 0,
                name: "Old PC",
                speed: 1.0,
                cost: 5000
            },
            skills: {
                coding: { level: 1, xp: 0 },
                marketing: { level: 1, xp: 0 },
                design: { level: 1, xp: 0 },
                networking: { level: 1, xp: 0 },
                aiResearch: { level: 1, xp: 0 }
            },
            employees: {
                programmers: 0,
                designers: 0,
                marketers: 0,
                testers: 0
            },
            projects: [],
            achievements: [],
            settings: {
                autoSave: true,
                soundEffects: true,
                notifications: true
            },
            statistics: {
                projectsCompleted: 0,
                successfulProjects: 0,
                passiveIncome: 0
            }
        };

        this.workplaces = [
            { name: "Garage", capacity: 1, speed: 1.0, cost: 0 },
            { name: "Small Office", capacity: 3, speed: 1.2, cost: 10000 },
            { name: "Startup Hub", capacity: 8, speed: 1.5, cost: 50000 },
            { name: "Corporate HQ", capacity: 20, speed: 2.0, cost: 200000 },
            { name: "Global Tech Campus", capacity: 50, speed: 3.0, cost: 1000000 }
        ];

        this.hardwareTypes = [
            { name: "Old PC", speed: 1.0, cost: 0 },
            { name: "Gaming Rig", speed: 1.3, cost: 5000 },
            { name: "Workstation", speed: 1.7, cost: 15000 },
            { name: "Server Rack", speed: 2.2, cost: 50000 },
            { name: "Supercomputer", speed: 3.0, cost: 200000 }
        ];

        this.softwareTypes = {
            app: {
                name: "Mobile App",
                baseCost: 500,
                baseTime: 2,
                baseRevenue: 1000,
                marketDemand: 1.2,
                unlockLevel: 0
            },
            game: {
                name: "Game",
                baseCost: 2000,
                baseTime: 8,
                baseRevenue: 5000,
                marketDemand: 1.0,
                unlockLevel: 0
            },
            tool: {
                name: "Utility Tool",
                baseCost: 1500,
                baseTime: 5,
                baseRevenue: 3000,
                marketDemand: 0.8,
                unlockLevel: 0
            },
            os: {
                name: "Operating System",
                baseCost: 100000,
                baseTime: 50,
                baseRevenue: 500000,
                marketDemand: 0.3,
                unlockLevel: 3
            }
        };

        this.marketTrends = [
            { name: "Mobile Apps", demand: 1.2, trend: "hot" },
            { name: "AI Tools", demand: 1.4, trend: "rising" },
            { name: "VR Games", demand: 0.9, trend: "stable" },
            { name: "Security Tools", demand: 0.7, trend: "declining" }
        ];

        this.achievementsList = [
            { id: "first_project", name: "Hello World", description: "Complete your first project", condition: () => this.gameState.statistics.projectsCompleted >= 1 },
            { id: "first_million", name: "First Million", description: "Earn $1,000,000", condition: () => this.gameState.totalRevenue >= 1000000 },
            { id: "hire_10", name: "Growing Team", description: "Hire 10 employees", condition: () => this.getTotalEmployees() >= 10 },
            { id: "upgrade_workplace", name: "Moving Up", description: "Upgrade your workplace", condition: () => this.gameState.workplace.level >= 1 },
            { id: "tech_empire", name: "Tech Empire", description: "Reach Global Tech Campus", condition: () => this.gameState.workplace.level >= 4 }
        ];

        this.init();
    }

    init() {
        this.loadGame();
        this.bindEvents();
        this.updateUI();
        this.startGameLoop();
        this.showNotification("Welcome to Software Tycoon!", "success");
    }

    // Game Loop
    startGameLoop() {
        setInterval(() => {
            this.updateProjects();
            this.generatePassiveIncome();
            this.updateMarketTrends();
            this.checkAchievements();
            this.updateUI();
            
            if (this.gameState.settings.autoSave) {
                this.saveGame();
            }
        }, 1000); // Update every second
    }

    // Event Binding
    bindEvents() {
        // Main action buttons
        document.getElementById('develop-software-btn').addEventListener('click', () => this.showSoftwareModal());
        document.getElementById('upgrade-workplace-btn').addEventListener('click', () => this.upgradeWorkplace());
        document.getElementById('hire-employee-btn').addEventListener('click', () => this.showHireModal());
        document.getElementById('marketing-campaign-btn').addEventListener('click', () => this.runMarketingCampaign());
        document.getElementById('upgrade-hardware-btn').addEventListener('click', () => this.upgradeHardware());

        // Modal controls
        document.getElementById('close-software-modal').addEventListener('click', () => this.hideSoftwareModal());
        document.getElementById('close-settings-modal').addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('start-development-btn').addEventListener('click', () => this.startDevelopment());

        // Software type selection
        document.querySelectorAll('.type-btn:not(.locked)').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectSoftwareType(e.target.closest('.type-btn').dataset.type));
        });

        // Footer actions
        document.getElementById('save-game-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('reset-game-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettingsModal());

        // Settings
        document.getElementById('save-settings-btn').addEventListener('click', () => this.saveSettings());
    }

    // Software Development
    showSoftwareModal() {
        document.getElementById('software-modal').classList.remove('hidden');
        this.updateSoftwareTypes();
    }

    hideSoftwareModal() {
        document.getElementById('software-modal').classList.add('hidden');
        document.getElementById('software-customization').classList.add('hidden');
    }

    updateSoftwareTypes() {
        const typeButtons = document.querySelectorAll('.type-btn');
        typeButtons.forEach(btn => {
            const type = btn.dataset.type;
            const softwareType = this.softwareTypes[type];
            
            if (softwareType && this.gameState.workplace.level >= softwareType.unlockLevel) {
                btn.classList.remove('locked');
            } else {
                btn.classList.add('locked');
            }
        });
    }

    selectSoftwareType(type) {
        this.selectedSoftwareType = type;
        document.getElementById('software-customization').classList.remove('hidden');
        this.updateDevelopmentCost();
    }

    updateDevelopmentCost() {
        if (!this.selectedSoftwareType) return;

        const softwareType = this.softwareTypes[this.selectedSoftwareType];
        const features = document.querySelectorAll('.feature-checkboxes input:checked');
        
        const baseCost = softwareType.baseCost;
        const featureCost = features.length * 200;
        const totalCost = baseCost + featureCost;
        
        const baseTime = softwareType.baseTime;
        const featureTime = features.length * 0.5;
        const totalTime = Math.max(1, baseTime + featureTime - (this.gameState.skills.coding.level * 0.2));

        document.getElementById('dev-cost').textContent = totalCost;
        document.getElementById('dev-time').textContent = `${totalTime.toFixed(1)} hours`;
    }

    startDevelopment() {
        if (!this.selectedSoftwareType) return;

        const softwareType = this.softwareTypes[this.selectedSoftwareType];
        const features = Array.from(document.querySelectorAll('.feature-checkboxes input:checked')).map(cb => cb.value);
        const name = document.getElementById('software-name').value || `${softwareType.name} Pro`;
        
        const baseCost = softwareType.baseCost;
        const featureCost = features.length * 200;
        const totalCost = baseCost + featureCost;

        if (this.gameState.money < totalCost) {
            this.showNotification("Not enough money!", "error");
            return;
        }

        if (this.gameState.projects.length >= this.gameState.workplace.capacity) {
            this.showNotification("Workplace at capacity! Upgrade or wait for projects to finish.", "error");
            return;
        }

        this.gameState.money -= totalCost;
        
        const project = {
            id: Date.now(),
            name: name,
            type: this.selectedSoftwareType,
            features: features,
            cost: totalCost,
            progress: 0,
            timeRemaining: (softwareType.baseTime + features.length * 0.5) * 60, // Convert to seconds
            quality: this.calculateQuality(features),
            expectedRevenue: this.calculateExpectedRevenue(softwareType, features)
        };

        this.gameState.projects.push(project);
        this.hideSoftwareModal();
        this.showNotification(`Started developing ${name}!`, "success");
        this.updateUI();
    }

    calculateQuality(features) {
        const baseQuality = 0.5;
        const featureBonus = features.length * 0.1;
        const skillBonus = (this.gameState.skills.coding.level + this.gameState.skills.design.level) * 0.05;
        return Math.min(1.0, baseQuality + featureBonus + skillBonus);
    }

    calculateExpectedRevenue(softwareType, features) {
        const baseRevenue = softwareType.baseRevenue;
        const featureMultiplier = 1 + (features.length * 0.2);
        const qualityMultiplier = this.calculateQuality(features);
        const marketMultiplier = softwareType.marketDemand;
        
        return Math.floor(baseRevenue * featureMultiplier * qualityMultiplier * marketMultiplier);
    }

    // Project Management
    updateProjects() {
        this.gameState.projects.forEach((project, index) => {
            if (project.timeRemaining > 0) {
                const speed = this.gameState.hardware.speed * this.gameState.workplace.speed;
                const employeeBonus = 1 + (this.getTotalEmployees() * 0.1);
                
                project.timeRemaining -= speed * employeeBonus;
                project.progress = Math.min(100, ((project.timeRemaining <= 0) ? 100 : 
                    (1 - project.timeRemaining / (this.softwareTypes[project.type].baseTime * 60)) * 100));
                
                if (project.timeRemaining <= 0) {
                    this.completeProject(project, index);
                }
            }
        });
    }

    completeProject(project, index) {
        const success = Math.random() < project.quality;
        
        if (success) {
            const revenue = project.expectedRevenue + (Math.random() * 0.4 - 0.2) * project.expectedRevenue;
            this.gameState.money += revenue;
            this.gameState.totalRevenue += revenue;
            this.gameState.reputation += Math.floor(project.quality * 10);
            this.gameState.statistics.successfulProjects++;
            
            // Add to passive income
            this.gameState.statistics.passiveIncome += Math.floor(revenue * 0.01);
            
            this.showNotification(`${project.name} launched successfully! Earned $${this.formatNumber(revenue)}`, "success");
            
            // Gain XP
            this.gainSkillXP('coding', 10 + project.features.length * 2);
            this.gainSkillXP('design', 5 + project.features.length);
        } else {
            this.showNotification(`${project.name} failed to launch. Better luck next time!`, "error");
            this.gainSkillXP('coding', 5);
        }
        
        this.gameState.statistics.projectsCompleted++;
        this.gameState.projects.splice(index, 1);
    }

    // Skill System
    gainSkillXP(skill, amount) {
        if (!this.gameState.skills[skill]) return;
        
        this.gameState.skills[skill].xp += amount;
        const requiredXP = this.gameState.skills[skill].level * 100;
        
        if (this.gameState.skills[skill].xp >= requiredXP) {
            this.gameState.skills[skill].level++;
            this.gameState.skills[skill].xp -= requiredXP;
            this.showNotification(`${skill.charAt(0).toUpperCase() + skill.slice(1)} skill increased to level ${this.gameState.skills[skill].level}!`, "success");
        }
    }

    // Workplace Management
    upgradeWorkplace() {
        const nextLevel = this.gameState.workplace.level + 1;
        if (nextLevel >= this.workplaces.length) {
            this.showNotification("Already at maximum workplace level!", "info");
            return;
        }

        const nextWorkplace = this.workplaces[nextLevel];
        if (this.gameState.money < nextWorkplace.cost) {
            this.showNotification(`Need $${this.formatNumber(nextWorkplace.cost)} to upgrade!`, "error");
            return;
        }

        this.gameState.money -= nextWorkplace.cost;
        this.gameState.workplace.level = nextLevel;
        this.gameState.workplace.name = nextWorkplace.name;
        this.gameState.workplace.capacity = nextWorkplace.capacity;
        this.gameState.workplace.speed = nextWorkplace.speed;
        this.gameState.workplace.cost = this.workplaces[nextLevel + 1]?.cost || 0;

        this.showNotification(`Upgraded to ${nextWorkplace.name}!`, "success");
        this.updateUI();
    }

    // Hardware Management
    upgradeHardware() {
        const nextLevel = this.gameState.hardware.level + 1;
        if (nextLevel >= this.hardwareTypes.length) {
            this.showNotification("Already have the best hardware!", "info");
            return;
        }

        const nextHardware = this.hardwareTypes[nextLevel];
        if (this.gameState.money < nextHardware.cost) {
            this.showNotification(`Need $${this.formatNumber(nextHardware.cost)} to upgrade!`, "error");
            return;
        }

        this.gameState.money -= nextHardware.cost;
        this.gameState.hardware.level = nextLevel;
        this.gameState.hardware.name = nextHardware.name;
        this.gameState.hardware.speed = nextHardware.speed;
        this.gameState.hardware.cost = this.hardwareTypes[nextLevel + 1]?.cost || 0;

        this.showNotification(`Upgraded to ${nextHardware.name}!`, "success");
        this.updateUI();
    }

    // Employee Management
    showHireModal() {
        // Simple hiring for now - can be expanded to full modal
        const cost = 2000 + (this.getTotalEmployees() * 500);
        
        if (this.gameState.money < cost) {
            this.showNotification(`Need $${this.formatNumber(cost)} to hire an employee!`, "error");
            return;
        }

        this.gameState.money -= cost;
        
        // Randomly hire different types
        const types = ['programmers', 'designers', 'marketers', 'testers'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.gameState.employees[randomType]++;
        
        this.showNotification(`Hired a ${randomType.slice(0, -1)}!`, "success");
        this.updateUI();
    }

    getTotalEmployees() {
        return Object.values(this.gameState.employees).reduce((sum, count) => sum + count, 0) + 1; // +1 for player
    }

    // Marketing
    runMarketingCampaign() {
        const cost = 1000;
        
        if (this.gameState.money < cost) {
            this.showNotification("Need $1,000 for marketing campaign!", "error");
            return;
        }

        this.gameState.money -= cost;
        
        // Random marketing success
        const success = Math.random() < 0.7;
        if (success) {
            const reputationGain = Math.floor(Math.random() * 20) + 10;
            this.gameState.reputation += reputationGain;
            this.showNotification(`Marketing campaign successful! Gained ${reputationGain} reputation.`, "success");
            this.gainSkillXP('marketing', 15);
        } else {
            this.showNotification("Marketing campaign had mixed results.", "info");
            this.gainSkillXP('marketing', 5);
        }
        
        this.updateUI();
    }

    // Passive Income
    generatePassiveIncome() {
        if (this.gameState.statistics.passiveIncome > 0) {
            const income = Math.floor(this.gameState.statistics.passiveIncome / 60); // Per second
            this.gameState.money += income;
            this.gameState.totalRevenue += income;
        }
    }

    // Market Trends
    updateMarketTrends() {
        // Randomly update market trends every 30 seconds
        if (Math.random() < 0.01) {
            this.marketTrends.forEach(trend => {
                const change = (Math.random() - 0.5) * 0.2;
                trend.demand = Math.max(0.3, Math.min(2.0, trend.demand + change));
                
                if (trend.demand > 1.3) trend.trend = "hot";
                else if (trend.demand > 1.1) trend.trend = "rising";
                else if (trend.demand > 0.8) trend.trend = "stable";
                else trend.trend = "declining";
            });
        }
    }

    // Achievements
    checkAchievements() {
        this.achievementsList.forEach(achievement => {
            if (!this.gameState.achievements.includes(achievement.id) && achievement.condition()) {
                this.gameState.achievements.push(achievement.id);
                this.showNotification(`Achievement unlocked: ${achievement.name}!`, "achievement");
            }
        });
    }

    // UI Updates
    updateUI() {
        // Money and reputation
        document.getElementById('money-amount').textContent = `$${this.formatNumber(this.gameState.money)}`;
        document.getElementById('reputation-amount').textContent = this.formatNumber(this.gameState.reputation);

        // Player info
        document.getElementById('company-name').textContent = this.gameState.companyName;
        document.getElementById('workplace-level').textContent = this.gameState.workplace.name;
        document.getElementById('employee-count').textContent = this.getTotalEmployees();
        document.getElementById('project-count').textContent = this.gameState.projects.length;

        // Skills
        this.updateSkillDisplay('coding');
        this.updateSkillDisplay('marketing');
        this.updateSkillDisplay('design');

        // Hardware
        document.getElementById('hardware-type').textContent = this.gameState.hardware.name;
        const hardwareBtn = document.getElementById('upgrade-hardware-btn');
        if (this.gameState.hardware.level < this.hardwareTypes.length - 1) {
            hardwareBtn.textContent = `Upgrade ($${this.formatNumber(this.gameState.hardware.cost)})`;
            hardwareBtn.disabled = this.gameState.money < this.gameState.hardware.cost;
        } else {
            hardwareBtn.textContent = "Max Level";
            hardwareBtn.disabled = true;
        }

        // Workplace upgrade button
        const workplaceBtn = document.getElementById('upgrade-workplace-btn');
        if (this.gameState.workplace.level < this.workplaces.length - 1) {
            workplaceBtn.textContent = `Upgrade Workplace ($${this.formatNumber(this.gameState.workplace.cost)})`;
            workplaceBtn.disabled = this.gameState.money < this.gameState.workplace.cost;
        } else {
            workplaceBtn.textContent = "Max Level";
            workplaceBtn.disabled = true;
        }

        // Employee hire button
        const hireBtn = document.getElementById('hire-employee-btn');
        const hireCost = 2000 + (this.getTotalEmployees() * 500);
        hireBtn.innerHTML = `<span class="btn-icon">👥</span><span class="btn-text">Hire Employee</span><span class="btn-cost">$${this.formatNumber(hireCost)}</span>`;
        hireBtn.disabled = this.gameState.money < hireCost;

        // Projects list
        this.updateProjectsList();

        // Footer stats
        document.getElementById('passive-income').textContent = `$${this.formatNumber(this.gameState.statistics.passiveIncome)}/min`;
        document.getElementById('total-revenue').textContent = `$${this.formatNumber(this.gameState.totalRevenue)}`;
        const successRate = this.gameState.statistics.projectsCompleted > 0 ? 
            Math.floor((this.gameState.statistics.successfulProjects / this.gameState.statistics.projectsCompleted) * 100) : 0;
        document.getElementById('success-rate').textContent = `${successRate}%`;

        // Leaderboard position
        const playerWorth = this.gameState.totalRevenue;
        let rank = 999;
        if (playerWorth >= 50000000) rank = 1;
        else if (playerWorth >= 35000000) rank = 2;
        else if (playerWorth >= 28000000) rank = 3;
        else if (playerWorth >= 1000000) rank = Math.floor(Math.random() * 50) + 10;
        else if (playerWorth >= 100000) rank = Math.floor(Math.random() * 200) + 100;
        
        document.getElementById('player-rank').textContent = `${rank}.`;
        document.getElementById('player-company').textContent = this.gameState.companyName;
        document.getElementById('player-worth').textContent = `$${this.formatNumber(playerWorth)}`;

        // Update achievements display
        this.updateAchievementsDisplay();
    }

    updateSkillDisplay(skillName) {
        const skill = this.gameState.skills[skillName];
        const progressPercent = (skill.xp / (skill.level * 100)) * 100;
        
        document.getElementById(`${skillName}-skill`).style.width = `${progressPercent}%`;
        document.getElementById(`${skillName}-level`).textContent = skill.level;
    }

    updateProjectsList() {
        const projectsList = document.getElementById('projects-list');
        
        if (this.gameState.projects.length === 0) {
            projectsList.innerHTML = '<div class="no-projects">No active projects. Start developing!</div>';
            return;
        }

        projectsList.innerHTML = this.gameState.projects.map(project => `
            <div class="project-item">
                <div class="project-header">
                    <span class="project-name">${project.name}</span>
                    <span class="project-type">${this.softwareTypes[project.type].name}</span>
                </div>
                <div class="project-progress-bar">
                    <div class="project-progress" style="width: ${project.progress}%"></div>
                </div>
                <div class="project-details">
                    <span>Progress: ${Math.floor(project.progress)}%</span>
                    <span>Expected: $${this.formatNumber(project.expectedRevenue)}</span>
                </div>
            </div>
        `).join('');
    }

    updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievements-list');
        
        achievementsList.innerHTML = this.achievementsList.map(achievement => {
            const unlocked = this.gameState.achievements.includes(achievement.id);
            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                    <span class="achievement-icon">${unlocked ? '🏆' : '🔒'}</span>
                    <span class="achievement-name">${achievement.name}</span>
                </div>
            `;
        }).join('');
    }

    // Settings
    showSettingsModal() {
        document.getElementById('settings-modal').classList.remove('hidden');
        document.getElementById('company-name-input').value = this.gameState.companyName;
        document.getElementById('auto-save').checked = this.gameState.settings.autoSave;
        document.getElementById('sound-effects').checked = this.gameState.settings.soundEffects;
        document.getElementById('notifications').checked = this.gameState.settings.notifications;
    }

    hideSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    saveSettings() {
        this.gameState.companyName = document.getElementById('company-name-input').value;
        this.gameState.settings.autoSave = document.getElementById('auto-save').checked;
        this.gameState.settings.soundEffects = document.getElementById('sound-effects').checked;
        this.gameState.settings.notifications = document.getElementById('notifications').checked;
        
        this.hideSettingsModal();
        this.saveGame();
        this.showNotification("Settings saved!", "success");
        this.updateUI();
    }

    // Notifications
    showNotification(message, type = 'info') {
        if (!this.gameState.settings.notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        `;
        
        document.getElementById('notifications').appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            achievement: '🏆'
        };
        return icons[type] || icons.info;
    }

    // Save/Load System
    saveGame() {
        try {
            localStorage.setItem('softwareTycoonSave', JSON.stringify(this.gameState));
            this.showNotification("Game saved!", "success");
        } catch (error) {
            this.showNotification("Failed to save game!", "error");
        }
    }

    loadGame() {
        try {
            const savedGame = localStorage.getItem('softwareTycoonSave');
            if (savedGame) {
                const loadedState = JSON.parse(savedGame);
                
                // Merge saved state with default state to handle new properties
                this.gameState = { ...this.gameState, ...loadedState };
                
                // Ensure all nested objects exist
                this.gameState.skills = { ...this.gameState.skills, ...loadedState.skills };
                this.gameState.employees = { ...this.gameState.employees, ...loadedState.employees };
                this.gameState.settings = { ...this.gameState.settings, ...loadedState.settings };
                this.gameState.statistics = { ...this.gameState.statistics, ...loadedState.statistics };
                
                this.showNotification("Game loaded!", "success");
            }
        } catch (error) {
            this.showNotification("Failed to load game!", "error");
        }
    }

    resetGame() {
        if (confirm("Are you sure you want to reset your progress? This cannot be undone!")) {
            localStorage.removeItem('softwareTycoonSave');
            location.reload();
        }
    }

    // Utility Functions
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }

    // Mini-games (expandable)
    startDebugGame() {
        // Debug mini-game implementation
        this.showNotification("Debug challenge coming soon!", "info");
    }

    startMarketingGame() {
        // Marketing choice mini-game implementation
        this.showNotification("Marketing challenge coming soon!", "info");
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SoftwareTycoon();
    
    // Feature selection update listener
    document.addEventListener('change', (e) => {
        if (e.target.matches('.feature-checkboxes input')) {
            window.game.updateDevelopmentCost();
        }
    });
    
    // Prevent context menu on long press (mobile)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Handle visibility change for idle calculations
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.game) {
            // Calculate offline earnings when returning to game
            const offlineTime = Date.now() - (window.game.lastSaveTime || Date.now());
            if (offlineTime > 60000) { // More than 1 minute offline
                const offlineEarnings = Math.floor((offlineTime / 60000) * window.game.gameState.statistics.passiveIncome);
                if (offlineEarnings > 0) {
                    window.game.gameState.money += offlineEarnings;
                    window.game.gameState.totalRevenue += offlineEarnings;
                    window.game.showNotification(`Welcome back! Earned $${window.game.formatNumber(offlineEarnings)} while away.`, "success");
                }
            }
        } else if (window.game) {
            window.game.lastSaveTime = Date.now();
            window.game.saveGame();
        }
    });
});

// PWA offline detection
window.addEventListener('online', () => {
    if (window.game) {
        window.game.showNotification("Back online!", "success");
    }
});

window.addEventListener('offline', () => {
    if (window.game) {
        window.game.showNotification("Playing offline", "info");
    }
});
