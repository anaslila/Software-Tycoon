// Software Tycoon v2.1.0 - Complete Game Engine
// Developer: AL Software Studio | Last Updated: 30 August, 2025
// 🚀 Complete rebuild with bug fixes and new features

class SoftwareTycoon {
    constructor() {
        this.version = '2.1.0';
        this.lastUpdated = '30 August 2025';
        
        // Game State
        this.gameState = {
            // Company Information
            company: {
                name: '',
                founder: '',
                vision: '',
                logo: '🚀',
                specialization: '',
                location: '',
                founded: new Date().getFullYear()
            },
            
            // Core Resources
            money: 5000,
            reputation: 0,
            legacyPoints: 0,
            totalRevenue: 0,
            
            // Game Progress
            dayCount: 1,
            gameSpeed: 1,
            
            // Company Status
            workplace: {
                level: 0,
                name: 'Garage',
                capacity: 1,
                efficiency: 1.0,
                upgradeCost: 10000
            },
            
            // Skills System
            skills: {
                coding: { level: 1, xp: 0, maxXp: 100 },
                design: { level: 1, xp: 0, maxXp: 100 },
                marketing: { level: 1, xp: 0, maxXp: 100 },
                leadership: { level: 1, xp: 0, maxXp: 100 },
                research: { level: 1, xp: 0, maxXp: 100 }
            },
            
            // Team Management
            employees: {
                developers: 0,
                designers: 0,
                marketers: 0,
                researchers: 0
            },
            
            // Projects
            activeProjects: [],
            completedProjects: [],
            
            // Market Data
            marketTrends: {
                mobile: { demand: 1.2, trend: 'up' },
                web: { demand: 1.0, trend: 'stable' },
                desktop: { demand: 0.8, trend: 'down' },
                ai: { demand: 1.5, trend: 'up' },
                game: { demand: 1.1, trend: 'stable' }
            },
            
            // Achievements
            achievements: [],
            
            // Settings
            settings: {
                autoSave: true,
                notifications: true,
                gameSpeed: 1
            }
        };

        // Company Creation State
        this.creationState = {
            currentStep: 1,
            maxSteps: 5,
            isValid: false
        };

        // Game Data
        this.softwareTypes = {
            mobile: {
                name: 'Mobile App',
                icon: '📱',
                baseCost: 1000,
                baseTime: 3,
                baseRevenue: 3000,
                features: ['UI/UX Design', 'Push Notifications', 'In-App Purchases', 'Social Integration', 'Analytics']
            },
            web: {
                name: 'Web Application',
                icon: '🌐',
                baseCost: 1500,
                baseTime: 5,
                baseRevenue: 5000,
                features: ['Responsive Design', 'Database Integration', 'User Authentication', 'API Development', 'SEO Optimization']
            },
            desktop: {
                name: 'Desktop Software',
                icon: '💻',
                baseCost: 2000,
                baseTime: 7,
                baseRevenue: 7000,
                features: ['Cross-Platform', 'File Management', 'System Integration', 'Auto-Updates', 'Plugin System']
            },
            game: {
                name: 'Video Game',
                icon: '🎮',
                baseCost: 3000,
                baseTime: 10,
                baseRevenue: 10000,
                features: ['3D Graphics', 'Multiplayer', 'Achievement System', 'Sound Design', 'Level Editor']
            },
            ai: {
                name: 'AI Software',
                icon: '🤖',
                baseCost: 5000,
                baseTime: 15,
                baseRevenue: 20000,
                features: ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Neural Networks', 'Data Analytics']
            }
        };

        this.achievementsList = [
            {
                id: 'first_project',
                name: 'Hello World',
                description: 'Complete your first project',
                icon: '🏆',
                condition: () => this.gameState.completedProjects.length >= 1,
                reward: { money: 1000, reputation: 10 }
            },
            {
                id: 'first_employee',
                name: 'Growing Team',
                description: 'Hire your first employee',
                icon: '👥',
                condition: () => this.getTotalEmployees() > 1,
                reward: { money: 500, reputation: 5 }
            },
            {
                id: 'first_million',
                name: 'Millionaire',
                description: 'Earn $1,000,000 in total revenue',
                icon: '💎',
                condition: () => this.gameState.totalRevenue >= 1000000,
                reward: { money: 10000, reputation: 50 }
            }
        ];

        this.gameLoopInterval = null;
        this.lastSaveTime = 0;
        
        this.init();
    }

    // ===============================
    // INITIALIZATION
    // ===============================
    
    init() {
        console.log('🚀 Software Tycoon v2.1.0 initializing...');
        
        // Load saved game
        this.loadGame();
        
        // Setup loading screen
        this.setupLoadingScreen();
        
        // Bind all events
        this.bindEvents();
        
        // Check if company exists
        const savedCompany = localStorage.getItem('softwareTycoon_company');
        
        if (savedCompany) {
            // Load existing company
            try {
                this.gameState.company = { ...this.gameState.company, ...JSON.parse(savedCompany) };
                this.startGame();
            } catch (error) {
                console.error('Error loading company:', error);
                this.showCompanyCreation();
            }
        } else {
            // Show company creation
            this.showCompanyCreation();
        }
    }

    setupLoadingScreen() {
        const loadingProgress = document.querySelector('.loading-progress');
        const loadingStatus = document.querySelector('.loading-status');
        
        const steps = [
            'Initializing game engine...',
            'Loading assets...',
            'Setting up workspace...',
            'Preparing UI...',
            'Ready to launch!'
        ];
        
        let currentStep = 0;
        
        const progressInterval = setInterval(() => {
            const progress = ((currentStep + 1) / steps.length) * 100;
            loadingProgress.style.width = `${progress}%`;
            loadingStatus.textContent = steps[currentStep];
            
            currentStep++;
            
            if (currentStep >= steps.length) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 500);
            }
        }, 400);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
    }

    showCompanyCreation() {
        this.hideLoadingScreen();
        const companyCreation = document.getElementById('company-creation');
        companyCreation.classList.remove('hidden');
        this.updateCreationStep();
    }

    startGame() {
        this.hideLoadingScreen();
        const gameContainer = document.getElementById('game-container');
        gameContainer.classList.remove('hidden');
        
        this.initializeGameUI();
        this.startGameLoop();
        this.showNotification(`Welcome back to ${this.gameState.company.name}!`, 'success');
    }

    // ===============================
    // EVENT BINDING
    // ===============================
    
    bindEvents() {
        console.log('Binding event listeners...');
        
        // Company Creation Events
        this.bindCreationEvents();
        
        // Game Events
        this.bindGameEvents();
        
        // Modal Events
        this.bindModalEvents();
        
        // Settings Events
        this.bindSettingsEvents();
        
        console.log('✅ All events bound successfully');
    }

    bindCreationEvents() {
        // Navigation buttons
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const launchBtn = document.getElementById('launch-company');
        
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (launchBtn) launchBtn.addEventListener('click', () => this.launchCompany());
        
        // Form inputs
        const founderInput = document.getElementById('founder-name');
        const companyInput = document.getElementById('company-name');
        const visionInput = document.getElementById('company-vision');
        
        if (founderInput) founderInput.addEventListener('input', (e) => this.updateCompanyData('founder', e.target.value));
        if (companyInput) companyInput.addEventListener('input', (e) => this.updateCompanyData('name', e.target.value));
        if (visionInput) visionInput.addEventListener('input', (e) => this.updateCompanyData('vision', e.target.value));
        
        // Logo selection
        const logoFile = document.getElementById('logo-file');
        const logoUpload = document.getElementById('logo-upload');
        
        if (logoFile) logoFile.addEventListener('change', (e) => this.handleLogoUpload(e));
        if (logoUpload) logoUpload.addEventListener('click', () => logoFile?.click());
        
        // Preset logos
        document.querySelectorAll('.preset-logo').forEach(logo => {
            logo.addEventListener('click', (e) => {
                const logoValue = e.target.dataset.logo;
                if (logoValue) this.selectLogo(logoValue);
            });
        });
        
        // Specialization selection
        document.querySelectorAll('.spec-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const spec = e.currentTarget.dataset.spec;
                if (spec) this.selectSpecialization(spec);
            });
        });
        
        // Location selection
        document.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const location = e.currentTarget.dataset.location;
                if (location) this.selectLocation(location);
            });
        });
    }

    bindGameEvents() {
        // Header actions
        const saveBtn = document.getElementById('save-game');
        const settingsBtn = document.getElementById('settings-btn');
        const helpBtn = document.getElementById('help-btn');
        
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveGame(true));
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showModal('settings-modal'));
        if (helpBtn) helpBtn.addEventListener('click', () => this.showHelp());
        
        // Quick actions
        const developBtn = document.getElementById('develop-software');
        const hireBtn = document.getElementById('hire-employee');
        const upgradeBtn = document.getElementById('upgrade-office');
        const marketingBtn = document.getElementById('marketing-campaign');
        
        if (developBtn) developBtn.addEventListener('click', () => this.showModal('software-modal'));
        if (hireBtn) hireBtn.addEventListener('click', () => this.hireEmployee());
        if (upgradeBtn) upgradeBtn.addEventListener('click', () => this.upgradeOffice());
        if (marketingBtn) marketingBtn.addEventListener('click', () => this.runMarketingCampaign());
        
        // Alternative project creation buttons
        const startDevelopingBtn = document.getElementById('start-developing');
        const newProjectBtn = document.getElementById('new-project-btn');
        const startProjectBtn = document.querySelector('.start-project-btn');
        
        if (startDevelopingBtn) startDevelopingBtn.addEventListener('click', () => this.showModal('software-modal'));
        if (newProjectBtn) newProjectBtn.addEventListener('click', () => this.showModal('software-modal'));
        if (startProjectBtn) startProjectBtn.addEventListener('click', () => this.showModal('software-modal'));
    }

    bindModalEvents() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });
        
        // Modal backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.hideModal(modal.id);
            });
        });
        
        // Software modal events
        const startDevBtn = document.getElementById('start-development');
        if (startDevBtn) startDevBtn.addEventListener('click', () => this.startDevelopment());
    }

    bindSettingsEvents() {
        // Settings toggles
        const autoSaveToggle = document.getElementById('auto-save');
        const notificationsToggle = document.getElementById('notifications');
        const gameSpeedSelect = document.getElementById('game-speed');
        
        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                this.gameState.settings.autoSave = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.gameState.settings.notifications = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (gameSpeedSelect) {
            gameSpeedSelect.addEventListener('change', (e) => {
                this.gameState.settings.gameSpeed = parseFloat(e.target.value);
                this.gameState.gameSpeed = this.gameState.settings.gameSpeed;
                this.saveSettings();
                this.restartGameLoop();
            });
        }
        
        // Data management
        const exportBtn = document.getElementById('export-save');
        const importBtn = document.getElementById('import-save');
        const resetBtn = document.getElementById('reset-game');
        
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSave());
        if (importBtn) importBtn.addEventListener('click', () => this.importSave());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetGame());
    }

    // ===============================
    // COMPANY CREATION
    // ===============================
    
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.creationState.currentStep < this.creationState.maxSteps) {
                this.creationState.currentStep++;
                this.updateCreationStep();
            }
        }
    }

    prevStep() {
        if (this.creationState.currentStep > 1) {
            this.creationState.currentStep--;
            this.updateCreationStep();
        }
    }

    validateCurrentStep() {
        const step = this.creationState.currentStep;
        
        switch (step) {
            case 1:
                if (!this.gameState.company.founder?.trim()) {
                    this.showNotification('Please enter your name', 'error');
                    return false;
                }
                if (!this.gameState.company.name?.trim()) {
                    this.showNotification('Please enter a company name', 'error');
                    return false;
                }
                break;
                
            case 2:
                // Logo is optional, default is set
                break;
                
            case 3:
                if (!this.gameState.company.specialization) {
                    this.showNotification('Please select a specialization', 'error');
                    return false;
                }
                break;
                
            case 4:
                if (!this.gameState.company.location) {
                    this.showNotification('Please select a location', 'error');
                    return false;
                }
                break;
        }
        
        return true;
    }

    updateCreationStep() {
        // Update step visibility
        document.querySelectorAll('.creation-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.creationState.currentStep);
        });
        
        // Update progress indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.toggle('active', stepNum === this.creationState.currentStep);
            indicator.classList.toggle('completed', stepNum < this.creationState.currentStep);
        });
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progress = (this.creationState.currentStep / this.creationState.maxSteps) * 100;
        if (progressFill) progressFill.style.width = `${progress}%`;
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        
        if (prevBtn) prevBtn.disabled = this.creationState.currentStep === 1;
        if (nextBtn) nextBtn.style.display = this.creationState.currentStep === this.creationState.maxSteps ? 'none' : 'block';
        
        // Update previews and summary
        this.updatePreviews();
        if (this.creationState.currentStep === 5) {
            this.updateFinalSummary();
        }
    }

    updateCompanyData(field, value) {
        this.gameState.company[field] = value;
        this.updatePreviews();
    }

    selectLogo(logo) {
        this.gameState.company.logo = logo;
        
        // Update visual selection
        document.querySelectorAll('.preset-logo').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.logo === logo);
        });
        
        this.updatePreviews();
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                this.showNotification('Image too large. Please choose a file under 2MB.', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.gameState.company.logo = e.target.result;
                this.updatePreviews();
            };
            reader.readAsDataURL(file);
        } else {
            this.showNotification('Please select a valid image file.', 'error');
        }
    }

    selectSpecialization(spec) {
        this.gameState.company.specialization = spec;
        
        // Update visual selection
        document.querySelectorAll('.spec-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.spec === spec);
        });
        
        this.updatePreviews();
    }

    selectLocation(location) {
        this.gameState.company.location = location;
        
        // Update visual selection
        document.querySelectorAll('.location-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.location === location);
        });
        
        this.updatePreviews();
    }

    updatePreviews() {
        // Update logo preview
        const logoPreview = document.getElementById('logo-preview');
        if (logoPreview) {
            if (this.gameState.company.logo.startsWith('data:image')) {
                logoPreview.innerHTML = `<img src="${this.gameState.company.logo}" alt="Logo">`;
            } else {
                logoPreview.textContent = this.gameState.company.logo;
            }
        }
        
        // Update company name preview
        const namePreview = document.getElementById('company-name-preview');
        if (namePreview) {
            namePreview.textContent = this.gameState.company.name || 'Your Company';
        }
        
        // Update founder preview
        const founderPreview = document.getElementById('founder-preview');
        if (founderPreview) {
            founderPreview.textContent = (this.gameState.company.founder || 'Founder') + ' & CEO';
        }
    }

    updateFinalSummary() {
        // Update final logo
        const finalLogo = document.getElementById('final-logo-preview');
        if (finalLogo) {
            if (this.gameState.company.logo.startsWith('data:image')) {
                finalLogo.innerHTML = `<img src="${this.gameState.company.logo}" alt="Logo">`;
            } else {
                finalLogo.textContent = this.gameState.company.logo;
            }
        }
        
        // Update text fields
        this.updateElement('final-company-name', this.gameState.company.name);
        this.updateElement('final-founder-name', this.gameState.company.founder + ', Founder & CEO');
        
        const visionElement = document.getElementById('final-company-vision');
        if (visionElement) {
            if (this.gameState.company.vision) {
                visionElement.textContent = `"${this.gameState.company.vision}"`;
                visionElement.style.display = 'block';
            } else {
                visionElement.style.display = 'none';
            }
        }
        
        // Update specialization
        const specNames = {
            mobile: 'Mobile App Development',
            gaming: 'Game Development',
            enterprise: 'Enterprise Software',
            ai: 'AI & Machine Learning'
        };
        this.updateElement('final-specialization', specNames[this.gameState.company.specialization] || 'Not Selected');
        
        // Update location
        const locationNames = {
            'silicon-valley': 'Silicon Valley, CA',
            'austin': 'Austin, Texas',
            'bangalore': 'Bangalore, India',
            'hometown': 'Your Hometown'
        };
        this.updateElement('final-location', locationNames[this.gameState.company.location] || 'Not Selected');
        
        // Update starting capital
        const capitalAmounts = {
            'silicon-valley': 15000,
            'austin': 10000,
            'bangalore': 8000,
            'hometown': 5000
        };
        const capital = capitalAmounts[this.gameState.company.location] || 5000;
        this.updateElement('final-capital', this.formatMoney(capital));
    }

    launchCompany() {
        if (!this.validateAllSteps()) return;
        
        // Set starting capital based on location
        const capitalAmounts = {
            'silicon-valley': 15000,
            'austin': 10000,
            'bangalore': 8000,
            'hometown': 5000
        };
        
        this.gameState.money = capitalAmounts[this.gameState.company.location] || 5000;
        
        // Apply specialization bonuses
        this.applySpecializationBonuses();
        
        // Save company data
        this.saveCompany();
        
        // Hide creation and show game
        const companyCreation = document.getElementById('company-creation');
        const gameContainer = document.getElementById('game-container');
        
        companyCreation.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        
        // Initialize game
        this.initializeGameUI();
        this.startGameLoop();
        
        this.showNotification(`Welcome to ${this.gameState.company.name}! Your journey begins now.`, 'success');
    }

    validateAllSteps() {
        const errors = [];
        
        if (!this.gameState.company.founder?.trim()) errors.push('Founder name required');
        if (!this.gameState.company.name?.trim()) errors.push('Company name required');
        if (!this.gameState.company.specialization) errors.push('Specialization required');
        if (!this.gameState.company.location) errors.push('Location required');
        
        if (errors.length > 0) {
            this.showNotification(`Please complete: ${errors.join(', ')}`, 'error');
            return false;
        }
        
        return true;
    }

    applySpecializationBonuses() {
        const bonuses = {
            mobile: { skill: 'design', bonus: 0.2 },
            gaming: { skill: 'design', bonus: 0.3 },
            enterprise: { skill: 'marketing', bonus: 0.2 },
            ai: { skill: 'research', bonus: 0.4 }
        };
        
        const bonus = bonuses[this.gameState.company.specialization];
        if (bonus) {
            // Apply skill bonus
            this.gameState.skills[bonus.skill].level += Math.floor(bonus.bonus * 10);
        }
    }

    // ===============================
    // GAME UI INITIALIZATION
    // ===============================
    
    initializeGameUI() {
        // Update header with company info
        this.updateElement('game-company-name', this.gameState.company.name);
        this.updateElement('game-founder-title', this.gameState.company.founder + ', CEO');
        
        const gameLogo = document.getElementById('game-company-logo');
        if (gameLogo) {
            if (this.gameState.company.logo.startsWith('data:image')) {
                gameLogo.innerHTML = `<img src="${this.gameState.company.logo}" alt="Logo">`;
            } else {
                gameLogo.textContent = this.gameState.company.logo;
            }
        }
        
        // Initialize skills display
        this.initializeSkillsDisplay();
        
        // Initialize software modal
        this.initializeSoftwareModal();
        
        // Initialize market trends
        this.updateMarketTrends();
        
        // Initialize achievements
        this.updateAchievements();
        
        // Update all UI elements
        this.updateGameUI();
    }

    initializeSkillsDisplay() {
        const skillsContainer = document.getElementById('skills-container');
        if (!skillsContainer) return;
        
        skillsContainer.innerHTML = '';
        
        Object.entries(this.gameState.skills).forEach(([skillName, skill]) => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-item';
            skillElement.innerHTML = `
                <div class="skill-header">
                    <span class="skill-name">${this.capitalizeFirst(skillName)}</span>
                    <span class="skill-level">Lv ${skill.level}</span>
                </div>
                <div class="skill-progress">
                    <div class="skill-progress-bar" style="width: ${(skill.xp / skill.maxXp) * 100}%"></div>
                </div>
                <div class="skill-xp">${skill.xp}/${skill.maxXp} XP</div>
            `;
            skillsContainer.appendChild(skillElement);
        });
    }

    initializeSoftwareModal() {
        const modal = document.getElementById('software-modal');
        if (!modal) return;
        
        const softwareTypesContainer = modal.querySelector('.software-types');
        if (!softwareTypesContainer) return;
        
        softwareTypesContainer.innerHTML = '';
        
        Object.entries(this.softwareTypes).forEach(([typeId, type]) => {
            const typeElement = document.createElement('div');
            typeElement.className = 'software-type-card';
            typeElement.dataset.type = typeId;
            
            typeElement.innerHTML = `
                <div class="type-icon">${type.icon}</div>
                <h3>${type.name}</h3>
                <div class="type-stats">
                    <div class="type-stat">
                        <span class="stat-label">Cost</span>
                        <span class="stat-value">${this.formatMoney(type.baseCost)}</span>
                    </div>
                    <div class="type-stat">
                        <span class="stat-label">Time</span>
                        <span class="stat-value">${type.baseTime} days</span>
                    </div>
                    <div class="type-stat">
                        <span class="stat-label">Revenue</span>
                        <span class="stat-value">${this.formatMoney(type.baseRevenue)}</span>
                    </div>
                </div>
            `;
            
            typeElement.addEventListener('click', () => this.selectSoftwareType(typeId));
            softwareTypesContainer.appendChild(typeElement);
        });
    }

    // ===============================
    // GAME MECHANICS
    // ===============================
    
    startGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        
        this.gameLoopInterval = setInterval(() => {
            this.gameLoop();
        }, 1000 / this.gameState.gameSpeed);
    }

    restartGameLoop() {
        this.startGameLoop();
    }

    gameLoop() {
        // Update active projects
        this.updateActiveProjects();
        
        // Update day counter (every 60 seconds in real time)
        if (Math.random() < 0.017) { // Roughly 1% chance per second = 1 day per minute
            this.gameState.dayCount++;
            this.updateGameUI();
        }
        
        // Auto-save periodically
        const now = Date.now();
        if (this.gameState.settings.autoSave && (now - this.lastSaveTime) > 30000) { // 30 seconds
            this.saveGame(false); // Silent save
            this.lastSaveTime = now;
        }
        
        // Check for achievements
        this.checkAchievements();
        
        // Update UI
        this.updateGameUI();
    }

    updateActiveProjects() {
        this.gameState.activeProjects.forEach((project, index) => {
            if (project.timeRemaining > 0) {
                project.timeRemaining -= this.gameState.gameSpeed;
                project.progress = Math.min(100, ((project.totalTime - project.timeRemaining) / project.totalTime) * 100);
                
                if (project.timeRemaining <= 0) {
                    this.completeProject(project, index);
                }
            }
        });
        
        this.updateProjectsDisplay();
    }

    completeProject(project, index) {
        // Calculate final revenue
        const baseRevenue = project.expectedRevenue;
        const skillMultiplier = this.getSkillMultiplier(project.type);
        const marketMultiplier = this.gameState.marketTrends[project.type]?.demand || 1;
        const finalRevenue = Math.floor(baseRevenue * skillMultiplier * marketMultiplier * (0.8 + Math.random() * 0.4));
        
        // Add money and update stats
        this.gameState.money += finalRevenue;
        this.gameState.totalRevenue += finalRevenue;
        this.gameState.reputation += Math.floor(finalRevenue / 1000);
        
        // Add to completed projects
        const completedProject = {
            ...project,
            completedAt: new Date(),
            finalRevenue: finalRevenue
        };
        this.gameState.completedProjects.push(completedProject);
        
        // Remove from active projects
        this.gameState.activeProjects.splice(index, 1);
        
        // Gain skill XP
        this.gainSkillXP(project.type, 20);
        
        // Show notification
        this.showNotification(
            `${project.name} completed! Earned ${this.formatMoney(finalRevenue)}`,
            'success'
        );
    }

    getSkillMultiplier(projectType) {
        const relevantSkills = {
            mobile: ['coding', 'design'],
            web: ['coding', 'design'],
            desktop: ['coding'],
            game: ['coding', 'design'],
            ai: ['coding', 'research']
        };
        
        const skills = relevantSkills[projectType] || ['coding'];
        const avgLevel = skills.reduce((sum, skill) => sum + this.gameState.skills[skill].level, 0) / skills.length;
        
        return 1 + (avgLevel - 1) * 0.1; // 10% bonus per skill level
    }

    gainSkillXP(projectType, baseXP) {
        const relevantSkills = {
            mobile: ['coding', 'design'],
            web: ['coding', 'design'],
            desktop: ['coding'],
            game: ['coding', 'design'],
            ai: ['coding', 'research']
        };
        
        const skills = relevantSkills[projectType] || ['coding'];
        
        skills.forEach(skillName => {
            const skill = this.gameState.skills[skillName];
            skill.xp += baseXP;
            
            // Level up if enough XP
            while (skill.xp >= skill.maxXp) {
                skill.xp -= skill.maxXp;
                skill.level++;
                skill.maxXp = Math.floor(skill.maxXp * 1.2); // Increase XP requirement
                
                this.showNotification(
                    `${this.capitalizeFirst(skillName)} leveled up to ${skill.level}!`,
                    'achievement'
                );
            }
        });
        
        this.initializeSkillsDisplay();
    }

    // ===============================
    // GAME ACTIONS
    // ===============================
    
    selectSoftwareType(typeId) {
        const type = this.softwareTypes[typeId];
        if (!type) return;
        
        // Update visual selection
        document.querySelectorAll('.software-type-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.type === typeId);
        });
        
        // Show project details
        const projectDetails = document.getElementById('project-details');
        if (projectDetails) {
            projectDetails.classList.remove('hidden');
            
            // Initialize features
            this.initializeFeatures(type);
            
            // Update project summary
            this.updateProjectSummary(typeId);
        }
        
        // Store selected type
        this.selectedSoftwareType = typeId;
    }

    initializeFeatures(type) {
        const featuresGrid = document.getElementById('features-grid');
        if (!featuresGrid) return;
        
        featuresGrid.innerHTML = '';
        
        type.features.forEach(feature => {
            const featureElement = document.createElement('div');
            featureElement.className = 'feature-item';
            featureElement.innerHTML = `
                <input type="checkbox" id="feature-${feature.replace(/\s+/g, '-').toLowerCase()}" value="${feature}">
                <label for="feature-${feature.replace(/\s+/g, '-').toLowerCase()}">${feature}</label>
            `;
            
            const checkbox = featureElement.querySelector('input');
            checkbox.addEventListener('change', () => this.updateProjectSummary(this.selectedSoftwareType));
            
            featuresGrid.appendChild(featureElement);
        });
    }

    updateProjectSummary(typeId) {
        const type = this.softwareTypes[typeId];
        if (!type) return;
        
        // Get selected features
        const selectedFeatures = Array.from(document.querySelectorAll('#features-grid input:checked')).length;
        
        // Calculate costs and time
        const featureMultiplier = 1 + (selectedFeatures * 0.2);
        const devTime = Math.ceil(type.baseTime * featureMultiplier);
        const devCost = Math.floor(type.baseCost * featureMultiplier);
        const expectedRevenue = Math.floor(type.baseRevenue * featureMultiplier);
        
        // Update display
        this.updateElement('dev-time', devTime + ' days');
        this.updateElement('dev-cost', this.formatMoney(devCost));
        this.updateElement('expected-revenue', this.formatMoney(expectedRevenue));
        
        // Store values for project creation
        this.projectSummary = {
            type: typeId,
            devTime,
            devCost,
            expectedRevenue
        };
    }

    startDevelopment() {
        if (!this.selectedSoftwareType || !this.projectSummary) {
            this.showNotification('Please select a software type and configure features', 'error');
            return;
        }
        
        const projectName = document.getElementById('project-name')?.value.trim();
        if (!projectName) {
            this.showNotification('Please enter a project name', 'error');
            return;
        }
        
        if (this.gameState.money < this.projectSummary.devCost) {
            this.showNotification('Not enough money to start development', 'error');
            return;
        }
        
        // Deduct cost
        this.gameState.money -= this.projectSummary.devCost;
        
        // Create project
        const project = {
            id: Date.now(),
            name: projectName,
            type: this.selectedSoftwareType,
            totalTime: this.projectSummary.devTime,
            timeRemaining: this.projectSummary.devTime,
            progress: 0,
            expectedRevenue: this.projectSummary.expectedRevenue,
            features: Array.from(document.querySelectorAll('#features-grid input:checked')).map(cb => cb.value),
            startedAt: new Date()
        };
        
        this.gameState.activeProjects.push(project);
        
        // Hide modal
        this.hideModal('software-modal');
        
        // Show notification
        this.showNotification(`Started development of ${projectName}!`, 'success');
        
        // Switch to projects view
        this.showProjectsScreen();
        
        // Update UI
        this.updateGameUI();
    }

    hireEmployee() {
        const cost = 2000;
        if (this.gameState.money < cost) {
            this.showNotification('Need $2,000 to hire an employee', 'error');
            return;
        }
        
        this.gameState.money -= cost;
        this.gameState.employees.developers++;
        
        this.showNotification('Hired a developer! Your team is growing.', 'success');
        this.updateGameUI();
    }

    upgradeOffice() {
        const cost = this.gameState.workplace.upgradeCost;
        if (this.gameState.money < cost) {
            this.showNotification(`Need ${this.formatMoney(cost)} to upgrade office`, 'error');
            return;
        }
        
        const workplaces = [
            { name: 'Garage', capacity: 1, efficiency: 1.0, upgradeCost: 10000 },
            { name: 'Small Office', capacity: 5, efficiency: 1.2, upgradeCost: 50000 },
            { name: 'Startup Hub', capacity: 15, efficiency: 1.5, upgradeCost: 200000 },
            { name: 'Corporate HQ', capacity: 50, efficiency: 2.0, upgradeCost: 1000000 },
            { name: 'Global Campus', capacity: 200, efficiency: 3.0, upgradeCost: 0 }
        ];
        
        if (this.gameState.workplace.level < workplaces.length - 1) {
            this.gameState.money -= cost;
            this.gameState.workplace.level++;
            this.gameState.workspace = workplaces[this.gameState.workplace.level];
            
            this.showNotification(`Upgraded to ${this.gameState.workplace.name}!`, 'success');
            this.updateGameUI();
        } else {
            this.showNotification('Already at maximum office level!', 'info');
        }
    }

    runMarketingCampaign() {
        const cost = 1000;
        if (this.gameState.money < cost) {
            this.showNotification('Need $1,000 for marketing campaign', 'error');
            return;
        }
        
        this.gameState.money -= cost;
        const reputationGain = Math.floor(Math.random() * 30) + 15;
        this.gameState.reputation += reputationGain;
        
        this.gainSkillXP('marketing', 10);
        
        this.showNotification(`Marketing campaign successful! Gained ${reputationGain} reputation.`, 'success');
        this.updateGameUI();
    }

    // ===============================
    // UI UPDATES
    // ===============================
    
    updateGameUI() {
        // Update resources
        this.updateElement('money-display', this.formatMoney(this.gameState.money));
        this.updateElement('reputation-display', this.formatNumber(this.gameState.reputation));
        this.updateElement('legacy-display', this.formatNumber(this.gameState.legacyPoints));
        
        // Update game stats
        this.updateElement('game-day', `Day ${this.gameState.dayCount}`);
        
        // Update company stats
        this.updateElement('workplace-level', this.gameState.workplace.name);
        this.updateElement('employee-count', this.getTotalEmployees());
        this.updateElement('active-projects', this.gameState.activeProjects.length);
        this.updateElement('completed-projects', this.gameState.completedProjects.length);
        
        // Update footer stats
        this.updateElement('total-revenue', this.formatMoney(this.gameState.totalRevenue));
        this.updateElement('team-size', this.getTotalEmployees());
        
        const successRate = this.gameState.completedProjects.length > 0 
            ? Math.floor((this.gameState.completedProjects.length / (this.gameState.completedProjects.length + this.gameState.activeProjects.length)) * 100)
            : 100;
        this.updateElement('success-rate', successRate + '%');
    }

    updateProjectsDisplay() {
        const projectsList = document.getElementById('projects-list');
        if (!projectsList) return;
        
        if (this.gameState.activeProjects.length === 0) {
            projectsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📂</div>
                    <h3>No Active Projects</h3>
                    <p>Start developing your first software to begin your empire!</p>
                    <button class="start-project-btn" onclick="game.showModal('software-modal')">Create Your First Project</button>
                </div>
            `;
        } else {
            projectsList.innerHTML = '';
            
            this.gameState.activeProjects.forEach(project => {
                const projectElement = document.createElement('div');
                projectElement.className = 'project-card';
                projectElement.innerHTML = `
                    <div class="project-header">
                        <div class="project-icon">${this.softwareTypes[project.type]?.icon || '💻'}</div>
                        <div class="project-info">
                            <h3>${project.name}</h3>
                            <p>${this.softwareTypes[project.type]?.name || 'Software'}</p>
                        </div>
                    </div>
                    <div class="project-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                        </div>
                        <div class="progress-text">${Math.floor(project.progress)}% Complete</div>
                    </div>
                    <div class="project-stats">
                        <div class="project-stat">
                            <span class="stat-label">Time Remaining</span>
                            <span class="stat-value">${Math.ceil(project.timeRemaining)} days</span>
                        </div>
                        <div class="project-stat">
                            <span class="stat-label">Expected Revenue</span>
                            <span class="stat-value">${this.formatMoney(project.expectedRevenue)}</span>
                        </div>
                    </div>
                `;
                projectsList.appendChild(projectElement);
            });
        }
    }

    updateMarketTrends() {
        const trendsContainer = document.getElementById('market-trends');
        if (!trendsContainer) return;
        
        trendsContainer.innerHTML = '';
        
        Object.entries(this.gameState.marketTrends).forEach(([market, data]) => {
            const trendElement = document.createElement('div');
            trendElement.className = 'market-trend-item';
            
            const trendIcon = data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️';
            const trendClass = data.trend === 'up' ? 'positive' : data.trend === 'down' ? 'negative' : 'neutral';
            
            trendElement.innerHTML = `
                <div class="trend-info">
                    <span class="trend-name">${this.capitalizeFirst(market)}</span>
                    <span class="trend-indicator ${trendClass}">${trendIcon}</span>
                </div>
                <div class="trend-demand">Demand: ${data.demand.toFixed(1)}x</div>
            `;
            
            trendsContainer.appendChild(trendElement);
        });
    }

    checkAchievements() {
        this.achievementsList.forEach(achievement => {
            if (!this.gameState.achievements.includes(achievement.id) && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        this.gameState.achievements.push(achievement.id);
        
        // Apply rewards
        if (achievement.reward.money) {
            this.gameState.money += achievement.reward.money;
        }
        if (achievement.reward.reputation) {
            this.gameState.reputation += achievement.reward.reputation;
        }
        
        // Show notification
        this.showNotification(
            `🏆 Achievement Unlocked: ${achievement.name}! ${achievement.reward.money ? '+$' + achievement.reward.money : ''}`,
            'achievement'
        );
        
        this.updateAchievements();
    }

    updateAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = '';
        
        this.achievementsList.slice(0, 5).forEach(achievement => {
            const isUnlocked = this.gameState.achievements.includes(achievement.id);
            
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <span class="achievement-name">${achievement.name}</span>
                    <span class="achievement-desc">${achievement.description}</span>
                </div>
                ${isUnlocked ? '<span class="achievement-status">✓</span>' : ''}
            `;
            
            achievementsList.appendChild(achievementElement);
        });
    }

    showProjectsScreen() {
        // Hide all panels
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Show projects panel
        const projectsScreen = document.getElementById('projects-screen');
        if (projectsScreen) {
            projectsScreen.classList.add('active');
        }
        
        this.updateProjectsDisplay();
    }

    // ===============================
    // MODAL MANAGEMENT
    // ===============================
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            // Focus trap for accessibility
            const focusableElements = modal.querySelectorAll('button, input, select, textarea');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            
            // Reset software modal state
            if (modalId === 'software-modal') {
                this.selectedSoftwareType = null;
                this.projectSummary = null;
                
                const projectDetails = document.getElementById('project-details');
                if (projectDetails) {
                    projectDetails.classList.add('hidden');
                }
                
                const projectNameInput = document.getElementById('project-name');
                if (projectNameInput) {
                    projectNameInput.value = '';
                }
                
                document.querySelectorAll('.software-type-card').forEach(card => {
                    card.classList.remove('selected');
                });
            }
        }
    }

    // ===============================
    // DATA MANAGEMENT
    // ===============================
    
    saveGame(showNotification = false) {
        try {
            const saveData = {
                ...this.gameState,
                version: this.version,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('softwareTycoon_save', JSON.stringify(saveData));
            
            if (showNotification) {
                this.showNotification('Game saved successfully!', 'success');
            }
            
            console.log('Game saved' + (showNotification ? ' (with notification)' : ' (silently)'));
        } catch (error) {
            console.error('Save failed:', error);
            this.showNotification('Failed to save game!', 'error');
        }
    }

    loadGame() {
        try {
            const savedData = localStorage.getItem('softwareTycoon_save');
            if (savedData) {
                const loadedState = JSON.parse(savedData);
                this.gameState = { ...this.gameState, ...loadedState };
                console.log('Game loaded successfully');
            }
        } catch (error) {
            console.error('Load failed:', error);
            console.log('Starting fresh game...');
        }
    }

    saveCompany() {
        try {
            localStorage.setItem('softwareTycoon_company', JSON.stringify(this.gameState.company));
        } catch (error) {
            console.error('Failed to save company:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('softwareTycoon_settings', JSON.stringify(this.gameState.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    exportSave() {
        try {
            const saveData = {
                ...this.gameState,
                version: this.version,
                exportedAt: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(saveData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `software-tycoon-save-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Save file exported!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export save!', 'error');
        }
    }

    importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const saveData = JSON.parse(e.target.result);
                        this.gameState = { ...this.gameState, ...saveData };
                        this.saveGame();
                        this.updateGameUI();
                        this.showNotification('Save file imported!', 'success');
                    } catch (error) {
                        console.error('Import failed:', error);
                        this.showNotification('Invalid save file!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    resetGame() {
        if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
            localStorage.removeItem('softwareTycoon_save');
            localStorage.removeItem('softwareTycoon_company');
            localStorage.removeItem('softwareTycoon_settings');
            
            this.showNotification('Game reset! Refreshing page...', 'info');
            
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }

    // ===============================
    // UTILITIES
    // ===============================
    
    showNotification(message, type = 'info') {
        if (!this.gameState.settings.notifications && type === 'info') return;
        
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            achievement: '🏆',
            warning: '⚠️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove
        const delay = type === 'achievement' ? 6000 : type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, delay);
    }

    showHelp() {
        this.showNotification('Help system coming soon! For now, explore and experiment!', 'info');
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    formatMoney(amount) {
        if (amount >= 1000000000) {
            return '$' + (amount / 1000000000).toFixed(1) + 'B';
        } else if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '$' + (amount / 1000).toFixed(1) + 'K';
        }
        return '$' + Math.floor(amount).toLocaleString();
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getTotalEmployees() {
        return Object.values(this.gameState.employees).reduce((sum, count) => sum + count, 0) + 1; // +1 for founder
    }
}

// ===============================
// INITIALIZATION
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Software Tycoon v2.1.0 - AL Software Studio');
    console.log('Last Updated: 30 August 2025');
    console.log('🔧 Complete rebuild with bug fixes and new features');
    
    // Initialize game
    window.game = new SoftwareTycoon();
    
    // PWA Install Prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installPrompt = document.getElementById('install-prompt');
        if (installPrompt) {
            installPrompt.classList.remove('hidden');
            
            const installBtn = document.getElementById('install-app');
            const dismissBtn = document.getElementById('dismiss-install');
            
            if (installBtn) {
                installBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        
                        if (outcome === 'accepted') {
                            window.game.showNotification('App installed successfully!', 'success');
                        }
                        
                        deferredPrompt = null;
                        installPrompt.classList.add('hidden');
                    }
                });
            }
            
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => {
                    installPrompt.classList.add('hidden');
                });
            }
        }
    });
    
    // Global debug functions for development
    window.debugAddMoney = (amount = 10000) => {
        if (window.game) {
            window.game.gameState.money += amount;
            window.game.updateGameUI();
            console.log(`Added $${amount} to balance`);
        }
    };
    
    window.debugCompleteProject = () => {
        if (window.game && window.game.gameState.activeProjects.length > 0) {
            const project = window.game.gameState.activeProjects[0];
            project.timeRemaining = 0;
            console.log('Project completion forced');
        }
    };
    
    window.debugShowCreation = () => {
        if (window.game) {
            document.getElementById('game-container').classList.add('hidden');
            document.getElementById('company-creation').classList.remove('hidden');
        }
    };
    
    console.log('✅ Game initialized successfully!');
    console.log('🎮 Debug functions available: debugAddMoney(), debugCompleteProject(), debugShowCreation()');
});

// ===============================
// SERVICE WORKER REGISTRATION
// ===============================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (window.game) {
                            window.game.showNotification('New version available! Refresh to update.', 'info');
                        }
                    }
                });
            });
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    });
}

console.log('✅ Software Tycoon v2.1.0 script loaded successfully!');
