// Game functionality and interactions
let backgroundMusic;
let isMusicPlaying = false;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio
    setupAudioControls();
    
    // Add entrance animations
    animateOnLoad();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
    
    // Try to start music (may be blocked by browser policy)
    setTimeout(() => {
        tryPlayMusic();
    }, 1000);
});

// Animate elements on page load
function animateOnLoad() {
    const title = document.querySelector('.game-title');
    const buttons = document.querySelectorAll('.menu-btn');
    const character = document.querySelector('.character-image');
    
    // Animate title
    title.style.opacity = '0';
    title.style.transform = 'translateY(-50px)';
    
    setTimeout(() => {
        title.style.transition = 'all 1s ease-out';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
    }, 500);
    
    // Animate buttons with stagger
    buttons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
            button.style.transition = 'all 0.8s ease-out';
            button.style.opacity = '1';
            button.style.transform = 'translateX(0)';
        }, 1000 + (index * 200));
    });
    
    // Animate character
    character.style.opacity = '0';
    character.style.transform = 'scale(0.8) translateX(-50px)';
    
    setTimeout(() => {
        character.style.transition = 'all 1.2s ease-out';
        character.style.opacity = '1';
        character.style.transform = 'scale(1) translateX(0)';
    }, 300);
}

// Audio controls setup
function setupAudioControls() {
    backgroundMusic = document.getElementById('background-music');
    
    if (backgroundMusic) {
        // Set initial volume
        backgroundMusic.volume = 0.5;
        
        // Add event listeners
        backgroundMusic.addEventListener('loadstart', () => {
            console.log('Music loading started');
        });
        
        backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('Music can play through');
        });
        
        backgroundMusic.addEventListener('error', (e) => {
            console.log('Music loading error:', e);
        });
        
        backgroundMusic.addEventListener('play', () => {
            isMusicPlaying = true;
            updateAudioIcon();
        });
        
        backgroundMusic.addEventListener('pause', () => {
            isMusicPlaying = false;
            updateAudioIcon();
        });
    }
}

// Try to play background music
function tryPlayMusic() {
    if (backgroundMusic) {
        backgroundMusic.play().then(() => {
            console.log('Background music started successfully');
            isMusicPlaying = true;
            updateAudioIcon();
        }).catch((error) => {
            console.log('Auto-play blocked by browser. User interaction required:', error);
            isMusicPlaying = false;
            updateAudioIcon();
            
            // Show a subtle notification that music is available
            showMusicNotification();
        });
    }
}

// Show music notification when autoplay is blocked
function showMusicNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = '🎵 Click anywhere to enable music';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(30, 60, 150, 0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        border: 2px solid rgba(100, 200, 255, 0.8);
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        z-index: 1002;
        backdrop-filter: blur(10px);
        animation: slideInRight 0.5s ease-out;
        cursor: pointer;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Click to play music and remove notification
    notification.addEventListener('click', () => {
        tryPlayMusic();
        notification.remove();
    });
    
    // Also enable music on any click on the page
    const enableMusicOnClick = () => {
        tryPlayMusic();
        notification.remove();
        document.removeEventListener('click', enableMusicOnClick);
    };
    
    document.addEventListener('click', enableMusicOnClick);
}

// Toggle audio on/off
function toggleAudio() {
    if (!backgroundMusic) return;
    
    if (isMusicPlaying) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play().catch((error) => {
            console.log('Could not play music:', error);
        });
    }
}

// Update audio control icon
function updateAudioIcon() {
    const audioIcon = document.getElementById('audio-icon');
    if (audioIcon) {
        audioIcon.textContent = isMusicPlaying ? '🔊' : '🔇';
    }
}

// Start Journey function
function startJourney() {
    showLoading();
    
    // Add sound effect (if available)
    playSound('start');
    
    // Simulate loading and transition to intro page
    setTimeout(() => {
        hideLoading();
        // Navigate to the intro-to-dialogue page
        window.location.href = 'intro-to-dialogue.html';
    }, 2000);
}

// Open Options modal
function openOptions() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 1.5rem; color: #ffffff; font-size: clamp(1.8rem, 5vw, 2.5rem); text-shadow: 0 0 20px rgba(100, 200, 255, 0.6);">Game Options</h2>
        
        <div style="display: grid; gap: 1.2rem;">
            <div class="option-group">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: rgba(100, 200, 255, 0.9); font-size: clamp(0.9rem, 2.5vw, 1rem);">Music Volume</label>
                <input type="range" min="0" max="100" value="${Math.round((backgroundMusic?.volume || 0.5) * 100)}" 
                       onchange="setMusicVolume(this.value)" 
                       style="
                    width: 100%; 
                    height: 8px; 
                    border-radius: 5px; 
                    background: rgba(30, 60, 150, 0.5); 
                    outline: none;
                    -webkit-appearance: none;
                ">
            </div>
            
            <div class="option-group">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: rgba(100, 200, 255, 0.9); font-size: clamp(0.9rem, 2.5vw, 1rem);">Audio Volume</label>
                <input type="range" min="0" max="100" value="75" style="
                    width: 100%; 
                    height: 8px; 
                    border-radius: 5px; 
                    background: rgba(30, 60, 150, 0.5); 
                    outline: none;
                    -webkit-appearance: none;
                " onchange="this.style.background = 'linear-gradient(to right, rgba(100, 200, 255, 0.8) 0%, rgba(100, 200, 255, 0.8) ' + this.value + '%, rgba(30, 60, 150, 0.5) ' + this.value + '%, rgba(30, 60, 150, 0.5) 100%)'">
            </div>
            
            <div class="option-group">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: rgba(100, 200, 255, 0.9); font-size: clamp(0.9rem, 2.5vw, 1rem);">Difficulty</label>
                <select style="
                    width: 100%; 
                    padding: clamp(0.6rem, 2vw, 0.8rem); 
                    border: 2px solid rgba(100, 200, 255, 0.6); 
                    border-radius: 8px; 
                    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
                    background: rgba(20, 30, 60, 0.8);
                    color: #ffffff;
                    outline: none;
                ">
                    <option style="background: rgba(20, 30, 60, 0.9); color: #ffffff;">Easy</option>
                    <option selected style="background: rgba(20, 30, 60, 0.9); color: #ffffff;">Normal</option>
                    <option style="background: rgba(20, 30, 60, 0.9); color: #ffffff;">Hard</option>
                    <option style="background: rgba(20, 30, 60, 0.9); color: #ffffff;">Expert</option>
                </select>
            </div>
            
            <div class="option-group">
                <label style="display: flex; align-items: center; font-weight: 600; color: rgba(100, 200, 255, 0.9); cursor: pointer; font-size: clamp(0.9rem, 2.5vw, 1rem);">
                    <input type="checkbox" checked style="
                        margin-right: 0.8rem; 
                        transform: scale(1.2);
                        accent-color: rgba(100, 200, 255, 0.8);
                    ">
                    Enable Fullscreen Mode
                </label>
            </div>
            
            <div class="option-group">
                <label style="display: flex; align-items: center; font-weight: 600; color: rgba(100, 200, 255, 0.9); cursor: pointer; font-size: clamp(0.9rem, 2.5vw, 1rem);">
                    <input type="checkbox" ${isMusicPlaying ? 'checked' : ''} 
                           onchange="toggleAudio()" style="
                        margin-right: 0.8rem; 
                        transform: scale(1.2);
                        accent-color: rgba(100, 200, 255, 0.8);
                    ">
                    Enable Background Music
                </label>
            </div>
            
            <button onclick="saveOptions()" style="
                background: linear-gradient(135deg, rgba(50, 100, 200, 0.8) 0%, rgba(70, 130, 230, 0.8) 100%);
                border: 2px solid rgba(100, 200, 255, 0.8);
                color: white;
                padding: clamp(0.8rem, 2.5vw, 1rem) clamp(1.5rem, 4vw, 2rem);
                border-radius: 8px;
                font-size: clamp(1rem, 3vw, 1.2rem);
                font-weight: 600;
                cursor: pointer;
                margin-top: 1rem;
                transition: all 0.3s ease;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                width: 100%;
            " onmouseover="
                this.style.transform='translateY(-2px)';
                this.style.boxShadow='0 8px 25px rgba(30, 60, 150, 0.6), 0 0 20px rgba(100, 200, 255, 0.4)';
                this.style.borderColor='rgba(150, 220, 255, 1)';
            " onmouseout="
                this.style.transform='translateY(0)';
                this.style.boxShadow='none';
                this.style.borderColor='rgba(100, 200, 255, 0.8)';
            ">
                Save Settings
            </button>
        </div>
    `;
    
    modal.classList.add('show');
    playSound('menu');
}

// Set music volume
function setMusicVolume(value) {
    if (backgroundMusic) {
        backgroundMusic.volume = value / 100;
    }
}

// Show Credits modal
function showCredits() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 1.5rem; color: #ffffff; font-size: clamp(1.8rem, 5vw, 2.5rem); text-align: center; text-shadow: 0 0 20px rgba(100, 200, 255, 0.6);">Credits</h2>
        
        <div style="text-align: center; line-height: 1.6; color: rgba(255, 255, 255, 0.9); font-size: clamp(0.9rem, 2.5vw, 1.1rem);">
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 0.8rem; font-size: clamp(1.2rem, 3.5vw, 1.6rem); text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">🎮 Game Development</h3>
                <p style="font-size: clamp(1rem, 2.8vw, 1.2rem); margin-bottom: 0.5rem;"><strong>Created by:</strong> Haoran Ni and Xiaoyuan Xu</p>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem);">Game loop is mostly designed and implemented by Xiaoyuan Xu</p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 0.8rem; font-size: clamp(1.2rem, 3.5vw, 1.6rem); text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">🎨 Art & Design</h3>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem); margin-bottom: 0.3rem;">Character Art & UI Design: Haoran Ni</p>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem);">With the help of Photoshop, Figma and cursor</p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 0.8rem; font-size: clamp(1.2rem, 3.5vw, 1.6rem); text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">🎵 Audio</h3>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem); margin-bottom: 0.3rem;"><strong>Background Music:</strong> "当原野的风拥抱我"</p>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem);">Sound Effects & Audio Design</p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 0.8rem; font-size: clamp(1.2rem, 3.5vw, 1.6rem); text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">💻 Technology</h3>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem); margin-bottom: 0.3rem;">Frontend: HTML5, CSS3, JavaScript, Three.js</p>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem);">Web Audio API & Responsive Design</p>
            </div>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid rgba(100, 200, 255, 0.3);">
                <p style="font-size: clamp(1.1rem, 3vw, 1.3rem); font-weight: 600; color: #ffffff; text-shadow: 0 0 15px rgba(100, 200, 255, 0.6);">Thank you for playing!</p>
                <p style="font-size: clamp(0.9rem, 2.5vw, 1.1rem); margin-top: 0.8rem;">✨ Made with ❤️ for an amazing gaming experience</p>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    playSound('menu');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
    playSound('close');
}

// Save options function
function saveOptions() {
    // Here you would typically save to localStorage or send to server
    alert('Settings saved successfully! ✅');
    closeModal();
}

// Show loading overlay
function showLoading() {
    const loading = document.getElementById('loading-overlay');
    loading.classList.add('show');
}

// Hide loading overlay
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    loading.classList.remove('show');
}

// Play sound effects
function playSound(soundType) {
    // Placeholder for sound effects
    // In a real game, you would load and play actual audio files
    console.log(`Playing sound: ${soundType}`);
    
    // You can replace this with actual Web Audio API implementation
    // Example:
    // const audio = new Audio(`sounds/${soundType}.mp3`);
    // audio.play().catch(e => console.log('Audio play failed:', e));
}

// Keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Enter':
                // Start journey on Enter
                if (!document.querySelector('.modal.show')) {
                    startJourney();
                }
                break;
            case 'Escape':
                // Close modal on Escape
                closeModal();
                break;
            case '1':
                // Hotkey for Start Journey
                if (!document.querySelector('.modal.show')) {
                    startJourney();
                }
                break;
            case '2':
                // Hotkey for Options
                if (!document.querySelector('.modal.show')) {
                    openOptions();
                }
                break;
            case '3':
                // Hotkey for Credits
                if (!document.querySelector('.modal.show')) {
                    showCredits();
                }
                break;
            case 'm':
            case 'M':
                // Toggle music with M key
                toggleAudio();
                break;
        }
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Add particle effect (optional enhancement)
function createParticles() {
    const container = document.querySelector('.game-container');
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255,255,255,0.6);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        container.appendChild(particle);
    }
}

// Initialize particles on load (optional)
// createParticles(); 

// ===== 全局音频管理系统 =====
class GlobalAudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.currentNarration = null;
        this.musicVolume = 0.5;
        this.isBackgroundMusicPlaying = false;
        this.isNarrationPlaying = false;
        
        // 音乐状态持久化键名
        this.STORAGE_KEYS = {
            musicTime: 'audioManager_musicTime',
            musicVolume: 'audioManager_musicVolume',
            musicPlaying: 'audioManager_musicPlaying'
        };
        
        this.init();
    }
    
    init() {
        // 加载保存的音频状态
        this.loadAudioState();
        
        // 页面卸载时保存状态
        window.addEventListener('beforeunload', () => {
            this.saveAudioState();
        });
        
        // 页面可见性变化时处理音频
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    // ===== 背景音乐管理 =====
    async initBackgroundMusic(audioPath) {
        if (this.backgroundMusic) {
            return; // 已经初始化过了
        }
        
        this.backgroundMusic = new Audio(audioPath);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.musicVolume;
        
        // 事件监听器
        this.backgroundMusic.addEventListener('loadeddata', () => {
            console.log('背景音乐加载完成');
            
            // 恢复之前的播放位置
            const savedTime = this.getSavedMusicTime();
            if (savedTime > 0) {
                this.backgroundMusic.currentTime = savedTime;
            }
            
            // 如果之前在播放，继续播放
            if (this.getSavedMusicPlayingState()) {
                this.playBackgroundMusic();
            }
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('背景音乐加载失败:', e);
        });
        
        this.backgroundMusic.addEventListener('timeupdate', () => {
            // 定期保存播放位置
            if (this.backgroundMusic && !this.backgroundMusic.paused) {
                this.saveMusicTime(this.backgroundMusic.currentTime);
            }
        });
    }
    
    async playBackgroundMusic() {
        if (!this.backgroundMusic) return;
        
        try {
            await this.backgroundMusic.play();
            this.isBackgroundMusicPlaying = true;
            this.saveMusicPlayingState(true);
            console.log('背景音乐开始播放');
        } catch (error) {
            console.log('背景音乐自动播放被阻止:', error);
            this.isBackgroundMusicPlaying = false;
        }
    }
    
    pauseBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
            this.isBackgroundMusicPlaying = false;
            this.saveMusicPlayingState(false);
        }
    }
    
    toggleBackgroundMusic() {
        if (this.isBackgroundMusicPlaying) {
            this.pauseBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume / 100;
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
        this.saveMusicVolume(this.musicVolume);
    }
    
    // ===== 叙述音频管理 =====
    async initNarration(audioPath, autoPlay = true) {
        // 如果有正在播放的叙述，先停止
        if (this.currentNarration) {
            this.stopNarration();
        }
        
        this.currentNarration = new Audio(audioPath);
        
        this.currentNarration.addEventListener('loadeddata', () => {
            console.log('叙述音频加载完成');
            if (autoPlay) {
                this.playNarration();
            }
        });
        
        this.currentNarration.addEventListener('error', (e) => {
            console.error('叙述音频加载失败:', e);
        });
        
        this.currentNarration.addEventListener('ended', () => {
            console.log('叙述播放完成');
            this.isNarrationPlaying = false;
        });
    }
    
    async playNarration() {
        if (!this.currentNarration) return;
        
        try {
            await this.currentNarration.play();
            this.isNarrationPlaying = true;
            console.log('叙述开始播放');
        } catch (error) {
            console.log('叙述自动播放被阻止，等待用户交互');
            this.setupNarrationUserInteraction();
        }
    }
    
    setupNarrationUserInteraction() {
        const playOnInteraction = async () => {
            if (this.currentNarration) {
                try {
                    await this.currentNarration.play();
                    this.isNarrationPlaying = true;
                    console.log('用户交互后开始播放叙述');
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                } catch (e) {
                    console.error('叙述播放失败:', e);
                }
            }
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
    }
    
    stopNarration() {
        if (this.currentNarration) {
            this.currentNarration.pause();
            this.currentNarration.currentTime = 0;
            this.isNarrationPlaying = false;
        }
    }
    
    // ===== 状态持久化 =====
    saveAudioState() {
        if (this.backgroundMusic) {
            this.saveMusicTime(this.backgroundMusic.currentTime);
            this.saveMusicPlayingState(this.isBackgroundMusicPlaying);
        }
        this.saveMusicVolume(this.musicVolume);
    }
    
    loadAudioState() {
        this.musicVolume = this.getSavedMusicVolume();
    }
    
    saveMusicTime(time) {
        localStorage.setItem(this.STORAGE_KEYS.musicTime, time.toString());
    }
    
    getSavedMusicTime() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.musicTime);
        return saved ? parseFloat(saved) : 0;
    }
    
    saveMusicVolume(volume) {
        localStorage.setItem(this.STORAGE_KEYS.musicVolume, volume.toString());
    }
    
    getSavedMusicVolume() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.musicVolume);
        return saved ? parseFloat(saved) : 0.5;
    }
    
    saveMusicPlayingState(isPlaying) {
        localStorage.setItem(this.STORAGE_KEYS.musicPlaying, isPlaying.toString());
    }
    
    getSavedMusicPlayingState() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.musicPlaying);
        return saved === 'true';
    }
    
    // ===== 页面可见性处理 =====
    handleVisibilityChange() {
        if (document.hidden) {
            // 页面不可见时暂停音频（可选）
            // this.pauseBackgroundMusic();
        } else {
            // 页面恢复可见时继续播放
            if (this.getSavedMusicPlayingState() && this.backgroundMusic) {
                this.playBackgroundMusic();
            }
        }
    }
    
    // ===== 清理方法 =====
    cleanup() {
        this.saveAudioState();
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        if (this.currentNarration) {
            this.currentNarration.pause();
        }
    }
}

// ===== 全局实例 =====
window.GlobalAudio = new GlobalAudioManager();

// ===== 音频UI控制器 =====
class AudioUIController {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.audioToggle = null;
        this.volumeSlider = null;
        this.volumeText = null;
        this.volumeControl = null;
    }
    
    init() {
        this.audioToggle = document.getElementById('audio-toggle');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeText = document.getElementById('volume-text');
        this.volumeControl = document.getElementById('volume-control');
        
        if (!this.audioToggle) return;
        
        this.bindEvents();
        this.updateUI();
    }
    
    bindEvents() {
        // 播放/暂停按钮
        this.audioToggle.addEventListener('click', () => {
            this.audioManager.toggleBackgroundMusic();
            this.updateIcon();
        });
        
        // 音量控制
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.audioManager.setMusicVolume(e.target.value);
                this.updateVolumeText(e.target.value);
            });
        }
        
        // 显示/隐藏音量控制
        if (this.volumeControl) {
            this.audioToggle.addEventListener('mouseenter', () => {
                this.volumeControl.classList.add('show');
            });
            
            document.querySelector('.audio-control').addEventListener('mouseleave', () => {
                this.volumeControl.classList.remove('show');
            });
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                this.audioManager.toggleBackgroundMusic();
                this.updateIcon();
            }
        });
    }
    
    updateUI() {
        this.updateIcon();
        this.updateVolumeSlider();
    }
    
    updateIcon() {
        if (this.audioToggle) {
            const icon = this.audioToggle.querySelector('#audio-icon');
            if (icon) {
                icon.textContent = this.audioManager.isBackgroundMusicPlaying ? '🔊' : '🔇';
            }
        }
    }
    
    updateVolumeSlider() {
        if (this.volumeSlider) {
            const volume = this.audioManager.musicVolume * 100;
            this.volumeSlider.value = volume;
            this.updateVolumeText(volume);
        }
    }
    
    updateVolumeText(volume) {
        if (this.volumeText) {
            this.volumeText.textContent = Math.round(volume) + '%';
        }
    }
}

// ===== 全局UI控制器实例 =====
window.AudioUI = new AudioUIController(window.GlobalAudio); 