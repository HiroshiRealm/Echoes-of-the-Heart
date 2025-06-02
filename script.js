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
    
    // Simulate loading and transition to game
    setTimeout(() => {
        hideLoading();
        // Here you would typically navigate to the actual game
        alert('Welcome to your journey! 🌟\n\nThis is where the game would begin. You can replace this with actual game logic or navigation to game screens.');
    }, 3000);
}

// Open Options modal
function openOptions() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 2rem; color: #ffffff; font-size: 2.5rem; text-shadow: 0 0 20px rgba(100, 200, 255, 0.6);">Game Options</h2>
        
        <div style="display: grid; gap: 1.5rem;">
            <div class="option-group">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: rgba(100, 200, 255, 0.9);">Music Volume</label>
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
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: rgba(100, 200, 255, 0.9);">Audio Volume</label>
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
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: rgba(100, 200, 255, 0.9);">Difficulty</label>
                <select style="
                    width: 100%; 
                    padding: 0.8rem; 
                    border: 2px solid rgba(100, 200, 255, 0.6); 
                    border-radius: 8px; 
                    font-size: 1.1rem;
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
                <label style="display: flex; align-items: center; font-weight: 600; color: rgba(100, 200, 255, 0.9); cursor: pointer;">
                    <input type="checkbox" checked style="
                        margin-right: 0.8rem; 
                        transform: scale(1.2);
                        accent-color: rgba(100, 200, 255, 0.8);
                    ">
                    Enable Fullscreen Mode
                </label>
            </div>
            
            <div class="option-group">
                <label style="display: flex; align-items: center; font-weight: 600; color: rgba(100, 200, 255, 0.9); cursor: pointer;">
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
                padding: 1rem 2rem;
                border-radius: 8px;
                font-size: 1.2rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 1rem;
                transition: all 0.3s ease;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
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
        <h2 style="margin-bottom: 2rem; color: #ffffff; font-size: 2.5rem; text-align: center; text-shadow: 0 0 20px rgba(100, 200, 255, 0.6);">Credits</h2>
        
        <div style="text-align: center; line-height: 1.8; color: rgba(255, 255, 255, 0.9);">
            <div style="margin-bottom: 2rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 1rem; font-size: 1.8rem; text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">🎮 Game Development</h3>
                <p style="font-size: 1.2rem;"><strong>Created by:</strong> Haoran Ni and Xiaoyuan Xu</p>
                <p style="font-size: 1.1rem;">Game loop is mostly designed and implemented by Xiaoyuan Xu</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 1rem; font-size: 1.8rem; text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">🎨 Art & Design</h3>
                <p style="font-size: 1.1rem;">Character Art & UI Design: Haoran Ni</p>
                <p style="font-size: 1.1rem;">With the help of Photoshop, Figma and cursor</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 1rem; font-size: 1.8rem; text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">🎵 Audio</h3>
                <p style="font-size: 1.1rem;"><strong>Background Music:</strong> "知晏"</p>
                <p style="font-size: 1.1rem;">Sound Effects & Audio Design</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: rgba(100, 200, 255, 0.9); margin-bottom: 1rem; font-size: 1.8rem; text-shadow: 0 0 10px rgba(100, 200, 255, 0.4);">💻 Technology</h3>
                <p style="font-size: 1.1rem;">Frontend : HTML5, CSS3, JavaScript, Three.js</p>
                <p style="font-size: 1.1rem;">Web Audio API & Responsive Design</p>
            </div>
            
            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid rgba(100, 200, 255, 0.3);">
                <p style="font-size: 1.3rem; font-weight: 600; color: #ffffff; text-shadow: 0 0 15px rgba(100, 200, 255, 0.6);">Thank you for playing!</p>
                <p style="font-size: 1.1rem; margin-top: 1rem;">✨ Made with ❤️ for an amazing gaming experience</p>
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