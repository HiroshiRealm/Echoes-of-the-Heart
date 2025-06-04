// ===== 对话系统管理器 =====
class DialogueManager {
    constructor() {
        this.chatArea = null;
        this.chatInput = null;
        this.sendButton = null;
        this.particleSystem = null;
        
        this.init();
    }

    init() {
        // 获取DOM元素
        this.chatArea = document.getElementById('chat-area');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-btn');

        // 绑定事件
        this.bindEvents();

        // 初始化粒子系统
        this.initParticleSystem();
        
        // 初始化音频和UI
        this.initAudioSystem();
        
        // 添加欢迎消息
        this.addWelcomeMessage();
    }

    // 绑定事件监听器
    bindEvents() {
        // 回车发送消息
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

        // 点击发送按钮
        this.sendButton.addEventListener('click', () => {
            this.handleUserInput();
        });

        // 窗口大小调整
        window.addEventListener('resize', () => {
            if (this.particleSystem && typeof this.particleSystem.handleResize === 'function') {
                this.particleSystem.handleResize();
            }
        });
    }

    // 初始化粒子系统
    initParticleSystem() {
        try {
            // 检查THREE.js是否已加载
            if (typeof THREE === 'undefined') {
                console.warn('THREE.js 未加载，跳过粒子系统初始化');
                return;
            }
            
            // 检查ParticleSystem类是否存在
            if (typeof ParticleSystem === 'undefined') {
                console.warn('ParticleSystem 类未定义，跳过粒子系统初始化');
                return;
            }
            
            this.particleSystem = new ParticleSystem('particle-background', ParticlePresets.dialogue);
        } catch (error) {
            console.warn('粒子系统初始化失败:', error);
            this.particleSystem = null; // 确保设置为null
        }
    }

    // 初始化音频系统
    initAudioSystem() {
        try {
            // 初始化全局音频系统
            window.GlobalAudio.initBackgroundMusic('../assets/audio/Brian Eno - An Ending (Ascent).mp3');
            
            // 初始化音频UI控制器
            if (window.AudioUI) {
                window.AudioUI.init();
                window.AudioUI.startUIUpdateLoop();
            }
        } catch (error) {
            console.warn('音频系统初始化失败:', error);
        }
    }

    // 添加欢迎消息
    addWelcomeMessage() {
        const welcomeMessages = [
            "欢迎来到琉璃忆境。在这个意识的深层空间中，你的每一个思绪都会凝结成记忆的碎片...",
            "这里是心灵的回声空间，让我们一起探索内在的声音。"
        ];
        
        welcomeMessages.forEach((message, index) => {
            setTimeout(() => {
                this.addMessage(message, false);
            }, (index + 1) * 1000);
        });
    }

    // 添加消息到聊天区域
    addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'system'}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = content;
        
        // 添加琉璃凝结动画的初始状态
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px) scale(0.8)';
        
        messageDiv.appendChild(bubbleDiv);
        this.chatArea.appendChild(messageDiv);
        
        // 触发琉璃凝结动画
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0) scale(1)';
        }, 50);
        
        // 添加边缘闪光效果
        if (Math.random() > 0.7) { // 30% 概率触发特殊闪光
            setTimeout(() => {
                const originalBoxShadow = bubbleDiv.style.boxShadow;
                bubbleDiv.style.boxShadow = originalBoxShadow + 
                    (originalBoxShadow ? ', ' : '') + 
                    '0 0 15px rgba(' + 
                    (isUser ? '100, 180, 255' : '180, 120, 200') + ', 0.8)';
                
                setTimeout(() => {
                    bubbleDiv.style.boxShadow = originalBoxShadow;
                }, 300);
            }, 200);
        }
        
        // 滚动到底部
        this.chatArea.scrollTop = this.chatArea.scrollHeight;
    }

    // 处理用户输入
    handleUserInput() {
        const message = this.chatInput.value.trim();
        
        if (message) {
            // 添加用户消息
            this.addMessage(message, true);
            this.chatInput.value = '';
            
            // 模拟AI回复
            this.generateAIResponse(message);
        }
    }

    // 生成AI回复
    generateAIResponse(userMessage) {
        const responses = [
            "你的话语在琉璃碎片中回响，激起了记忆的涟漪...",
            "思绪的结晶开始聚集，形成新的意识碎片。",
            "在这片忆境中，每个想法都化作闪烁的水晶光芒。",
            "琉璃深处传来微妙的共鸣，似乎在回应你的呼唤。",
            "记忆的碎片在你的声音中慢慢凝聚，散发着温柔的光辉。",
            "你的内心深处有什么在轻轻颤动，那是被唤醒的记忆吗？",
            "这些话语如同琉璃中的气泡，缓缓上升，带着深深的共鸣。",
            "在这个空间里，每一份真诚都会被倾听和理解。"
        ];
        
        // 根据用户输入进行简单的情感分析来选择回复
        let responseIndex;
        if (userMessage.includes('记忆') || userMessage.includes('回忆')) {
            responseIndex = Math.floor(Math.random() * 3); // 前3个回复更适合记忆相关
        } else if (userMessage.includes('心') || userMessage.includes('感觉') || userMessage.includes('情绪')) {
            responseIndex = 3 + Math.floor(Math.random() * 3); // 中间3个回复
        } else {
            responseIndex = 6 + Math.floor(Math.random() * 2); // 最后2个通用回复
        }
        
        const selectedResponse = responses[responseIndex];
        
        // 延迟回复，模拟思考时间
        setTimeout(() => {
            this.addMessage(selectedResponse);
            
            // 有时候解锁记忆（测试功能）
            if (Math.random() > 0.8 && window.MemoryPuzzleAPI) {
                setTimeout(() => {
                    this.addMessage("一片记忆碎片突然闪现，被添加到了你的记忆拼图中...");
                    // 这里可以调用解锁记忆的API
                    // MemoryPuzzleAPI.unlockMemory(Math.floor(Math.random() * 9));
                }, 1000);
            }
        }, 1000 + Math.random() * 2000);
    }

    // ===== 页面跳转 =====
    goToMemoryProgress() {
        // 创建淡出效果
        document.body.style.transition = 'opacity 0.8s ease-out';
        document.body.style.opacity = '0';
        
        // 等待淡出完成后跳转
        setTimeout(() => {
            window.location.href = '../memory-progress.html';
        }, 800);
    }

    // ===== 清理方法 =====
    destroy() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
    }
}

// ===== 音频UI控制器扩展 =====
class DialogueAudioUI {
    constructor() {
        this.audioToggle = null;
        this.volumeControl = null;
        this.volumeSlider = null;
        this.init();
    }

    init() {
        this.audioToggle = document.getElementById('audioToggle');
        this.volumeControl = document.getElementById('volumeControl');
        this.volumeSlider = document.getElementById('volumeSlider');

        if (this.audioToggle) {
            this.audioToggle.addEventListener('click', this.toggleAudio.bind(this));
            this.audioToggle.addEventListener('mouseenter', this.showVolumeControl.bind(this));
        }

        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', this.changeVolume.bind(this));
        }

        if (this.volumeControl) {
            this.volumeControl.addEventListener('mouseleave', this.hideVolumeControl.bind(this));
        }

        // 启动状态更新循环
        this.startUIUpdateLoop();
    }

    toggleAudio() {
        if (window.GlobalAudio) {
            window.GlobalAudio.toggleBackgroundMusic();
        }
    }

    showVolumeControl() {
        if (this.volumeControl) {
            this.volumeControl.classList.add('show');
        }
    }

    hideVolumeControl() {
        if (this.volumeControl) {
            this.volumeControl.classList.remove('show');
        }
    }

    changeVolume() {
        if (this.volumeSlider && window.GlobalAudio) {
            const volume = this.volumeSlider.value / 100;
            window.GlobalAudio.setBackgroundVolume(volume);
        }
    }

    updateUI() {
        if (!window.GlobalAudio || !this.audioToggle) return;

        const isPlaying = window.GlobalAudio.isBackgroundMusicPlaying;
        this.audioToggle.textContent = isPlaying ? '🔊' : '🔇';
        
        // 更新音量滑块
        if (this.volumeSlider) {
            const volume = window.GlobalAudio.getBackgroundVolume();
            this.volumeSlider.value = volume * 100;
        }
    }

    startUIUpdateLoop() {
        setInterval(() => {
            this.updateUI();
        }, 500);
    }
}

// ===== 页面初始化 =====
let dialogueManager;
let dialogueAudioUI;

document.addEventListener('DOMContentLoaded', () => {
    dialogueManager = new DialogueManager();
    dialogueAudioUI = new DialogueAudioUI();
});

// ===== 导出函数供外部调用 =====
window.DialogueManager = DialogueManager;

// ===== 全局函数（供HTML调用）=====
function goToMemoryProgress() {
    if (window.dialogueManager) {
        window.dialogueManager.goToMemoryProgress();
    }
} 