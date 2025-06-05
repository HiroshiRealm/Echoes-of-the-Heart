// ===== 对话系统管理器 =====
class DialogueManager {
    constructor() {
        this.chatArea = null;
        this.chatInput = null;
        this.sendButton = null;
        this.clearChatBtn = null;
        this.toggleDialogueBtn = null;
        this.dialogueContainer = null;
        this.dialogueControls = null;
        this.particleSystem = null;
        this.isDialogueHidden = false;
        
        // 粒子效果控制相关
        this.particleControlBtn = null;
        this.particleControlPanel = null;
        this.isParticleControlVisible = false;
        
        // API配置
        this.apiBaseUrl = 'http://localhost:3000';
        
        this.init();
    }

    init() {
        // 获取DOM元素
        this.chatArea = document.getElementById('chat-area');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-btn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.toggleDialogueBtn = document.getElementById('toggleDialogueBtn');
        this.dialogueContainer = document.querySelector('.dialogue-container');
        this.dialogueControls = document.querySelector('.dialogue-controls');
        
        // 粒子效果控制元素
        this.particleControlBtn = document.getElementById('particleControlBtn');
        this.particleControlPanel = document.getElementById('particleControlPanel');

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

        // 清空聊天历史按钮
        if (this.clearChatBtn) {
            this.clearChatBtn.addEventListener('click', () => {
                this.confirmAndClearChat();
            });
        }

        // 隐藏/显示对话框按钮
        if (this.toggleDialogueBtn) {
            this.toggleDialogueBtn.addEventListener('click', () => {
                this.toggleDialogueVisibility();
            });
        }

        // 粒子效果控制按钮
        if (this.particleControlBtn) {
            this.particleControlBtn.addEventListener('click', () => {
                this.toggleParticleControlPanel();
            });
        }

        // 粒子效果控制面板事件
        this.bindParticleControlEvents();

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
            
            // 立即尝试播放背景音乐
            setTimeout(() => {
                if (window.GlobalAudio && !window.GlobalAudio.isBackgroundMusicPlaying()) {
                    window.GlobalAudio.playBackgroundMusic();
                }
            }, 200);
            
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
    async handleUserInput() {
        const message = this.chatInput.value.trim();
        
        if (message) {
            // 添加用户消息
            this.addMessage(message, true);
            this.chatInput.value = '';
            
            // 禁用输入框和发送按钮，防止重复发送
            this.chatInput.disabled = true;
            this.sendButton.disabled = true;
            this.sendButton.textContent = '发送中...';
            
            try {
                // 调用真实的AI回复
                await this.generateAIResponse(message);
            } catch (error) {
                console.error('生成AI回复时出错:', error);
                this.addMessage('抱歉，我现在无法回应你的话语。请稍后再试...', false);
            } finally {
                // 重新启用输入框和发送按钮
                this.chatInput.disabled = false;
                this.sendButton.disabled = false;
                this.sendButton.textContent = '发送';
                this.chatInput.focus();
            }
        }
    }

    // 生成AI回复 - 调用后端API
    async generateAIResponse(userMessage) {
        try {
            // 显示typing指示器
            this.showTypingIndicator();
            
            // 首先调用memory接口检查记忆点
            await this.checkMemoryPoints(userMessage);
            
            // 然后调用chat接口获取AI回复
            const chatResponse = await fetch(`${this.apiBaseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage
                })
            });

            if (!chatResponse.ok) {
                throw new Error(`HTTP error! status: ${chatResponse.status}`);
            }

            const chatData = await chatResponse.json();
            
            // 隐藏typing指示器
            this.hideTypingIndicator();
            
            // 添加AI回复
            if (chatData.reply) {
                this.addMessage(chatData.reply, false);
            } else {
                throw new Error('AI回复为空');
            }

        } catch (error) {
            console.error('AI回复生成失败:', error);
            this.hideTypingIndicator();
            
            // 显示友好的错误消息
            this.addMessage('网络连接似乎有些不稳定，请检查服务器是否正在运行...', false);
        }
    }

    // 检查记忆点
    async checkMemoryPoints(userMessage) {
        try {
            const memoryResponse = await fetch(`${this.apiBaseUrl}/memory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_dialogue: userMessage
                })
            });

            if (memoryResponse.ok) {
                const memoryData = await memoryResponse.json();
                
                // 如果有新的记忆点被触发
                if (memoryData.memoryPoints && memoryData.memoryPoints.length > 0) {
                    const triggeredMemories = memoryData.memoryPoints.filter(point => point.isTriggered);
                    
                    if (triggeredMemories.length > 0) {
                        // 延迟显示记忆解锁消息
                        setTimeout(() => {
                            const memoryCount = triggeredMemories.length;
                            this.addMessage(`🌟 你的话语触发了 ${memoryCount} 个记忆碎片的共鸣！`, false);
                            
                            // 显示触发的记忆标题
                            triggeredMemories.forEach(memory => {
                                this.addMessage(`✨ 解锁记忆：「${memory.title}」`, false);
                            });
                            
                            this.addMessage('📷 记忆碎片已添加到你的记忆拼图中，可以在左上角查看进度！', false);
                            
                            // 更新记忆进度页面的计数器（如果存在的话）
                            this.updateMemoryProgressNotification(triggeredMemories.length);
                            
                        }, 1500);
                    }
                }
            }
        } catch (error) {
            console.warn('记忆点检查失败:', error);
            // 记忆点检查失败不影响正常对话，只是记录警告
        }
    }

    // 更新记忆进度通知
    updateMemoryProgressNotification(newMemoryCount) {
        const memoryEntrance = document.querySelector('.memory-progress-entrance');
        if (memoryEntrance) {
            // 添加闪烁效果提示有新记忆
            memoryEntrance.classList.add('has-new-memory');
            
            // 创建通知数字
            let notification = memoryEntrance.querySelector('.memory-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.className = 'memory-notification';
                memoryEntrance.appendChild(notification);
            }
            
            // 更新通知数字
            const currentCount = parseInt(notification.textContent || '0');
            notification.textContent = currentCount + newMemoryCount;
            notification.style.display = 'block';
            
            // 5秒后移除闪烁效果，但保留通知数字
            setTimeout(() => {
                memoryEntrance.classList.remove('has-new-memory');
            }, 5000);
        }
    }

    // 显示typing指示器
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message system typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
        
        typingDiv.appendChild(bubbleDiv);
        this.chatArea.appendChild(typingDiv);
        
        // 滚动到底部
        this.chatArea.scrollTop = this.chatArea.scrollHeight;
    }

    // 隐藏typing指示器
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // 清空聊天历史
    async clearChatHistory() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // 清空前端显示
                this.chatArea.innerHTML = '';
                // 重新添加欢迎消息
                this.addWelcomeMessage();
                this.addMessage('记忆和聊天历史已被清空。', false);
            } else {
                throw new Error('清空失败');
            }
        } catch (error) {
            console.error('清空聊天历史失败:', error);
            this.addMessage('清空操作失败，请稍后重试。', false);
        }
    }

    // 确认并清空聊天历史
    confirmAndClearChat() {
        // 简单的确认对话框
        if (confirm('确定要清空所有聊天历史和记忆吗？此操作无法撤销。')) {
            this.clearChatHistory();
        }
    }

    // 切换对话框显示/隐藏
    toggleDialogueVisibility() {
        if (!this.dialogueContainer || !this.toggleDialogueBtn) return;

        this.isDialogueHidden = !this.isDialogueHidden;

        if (this.isDialogueHidden) {
            // 隐藏对话框
            this.dialogueContainer.classList.add('hidden');
            if (this.dialogueControls) {
                this.dialogueControls.classList.add('dialogue-hidden');
            }
            this.toggleDialogueBtn.classList.add('dialogue-hidden');
            this.toggleDialogueBtn.textContent = '👁️‍🗨️'; // 显示对话框图标
            this.toggleDialogueBtn.title = '显示对话框';
        } else {
            // 显示对话框
            this.dialogueContainer.classList.remove('hidden');
            if (this.dialogueControls) {
                this.dialogueControls.classList.remove('dialogue-hidden');
            }
            this.toggleDialogueBtn.classList.remove('dialogue-hidden');
            this.toggleDialogueBtn.textContent = '👁️'; // 隐藏对话框图标
            this.toggleDialogueBtn.title = '隐藏对话框';
        }
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

    // ===== 粒子效果控制方法 =====
    bindParticleControlEvents() {
        // 关闭面板按钮
        const closeBtn = document.getElementById('closeParticlePanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideParticleControlPanel();
            });
        }

        // 颜色控制
        const baseColor1 = document.getElementById('baseColor1');
        const baseColor2 = document.getElementById('baseColor2');
        if (baseColor1) {
            baseColor1.addEventListener('input', (e) => {
                this.updateParticleConfig({ baseColor1: parseInt(e.target.value.replace('#', '0x')) });
            });
        }
        if (baseColor2) {
            baseColor2.addEventListener('input', (e) => {
                this.updateParticleConfig({ baseColor2: parseInt(e.target.value.replace('#', '0x')) });
            });
        }

        // 滑块控制
        const flowSpeed = document.getElementById('flowSpeed');
        const turbulence = document.getElementById('turbulence');
        const flowSpeedValue = document.getElementById('flowSpeedValue');
        const turbulenceValue = document.getElementById('turbulenceValue');

        if (flowSpeed) {
            flowSpeed.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (flowSpeedValue) flowSpeedValue.textContent = value.toFixed(1);
                this.updateParticleConfig({ flowSpeed: value });
            });
        }

        if (turbulence) {
            turbulence.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (turbulenceValue) turbulenceValue.textContent = value.toFixed(1);
                this.updateParticleConfig({ turbulence: value });
            });
        }

        // 重置按钮
        const resetBtn = document.getElementById('resetParticles');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetParticleSettings();
            });
        }

        // 随机按钮
        const randomBtn = document.getElementById('randomizeParticles');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.randomizeParticleSettings();
            });
        }
    }

    toggleParticleControlPanel() {
        if (this.isParticleControlVisible) {
            this.hideParticleControlPanel();
        } else {
            this.showParticleControlPanel();
        }
    }

    showParticleControlPanel() {
        if (this.particleControlPanel) {
            this.particleControlPanel.classList.add('show');
            this.isParticleControlVisible = true;
        }
    }

    hideParticleControlPanel() {
        if (this.particleControlPanel) {
            this.particleControlPanel.classList.remove('show');
            this.isParticleControlVisible = false;
        }
    }

    updateParticleConfig(config) {
        if (this.particleSystem && this.particleSystem.updateConfig) {
            this.particleSystem.updateConfig(config);
        }
    }

    recreateParticles() {
        if (this.particleSystem) {
            // 保存当前配置
            const currentConfig = Object.assign({}, this.particleSystem.CONFIG);
            
            // 销毁现有系统
            this.particleSystem.destroy();
            
            // 重新创建
            setTimeout(() => {
                this.particleSystem = new ParticleSystem('particle-background', currentConfig);
            }, 100);
        }
    }

    resetParticleSettings() {
        const defaultConfig = ParticlePresets.dialogue;
        
        // 更新UI控件
        const baseColor1 = document.getElementById('baseColor1');
        const baseColor2 = document.getElementById('baseColor2');
        const flowSpeed = document.getElementById('flowSpeed');
        const turbulence = document.getElementById('turbulence');
        const flowSpeedValue = document.getElementById('flowSpeedValue');
        const turbulenceValue = document.getElementById('turbulenceValue');

        if (baseColor1) baseColor1.value = '#' + defaultConfig.baseColor1.toString(16).padStart(6, '0');
        if (baseColor2) baseColor2.value = '#' + defaultConfig.baseColor2.toString(16).padStart(6, '0');
        if (flowSpeed) flowSpeed.value = defaultConfig.flowSpeed;
        if (turbulence) turbulence.value = defaultConfig.turbulence;
        if (flowSpeedValue) flowSpeedValue.textContent = defaultConfig.flowSpeed.toFixed(1);
        if (turbulenceValue) turbulenceValue.textContent = defaultConfig.turbulence.toFixed(1);

        // 应用配置
        this.updateParticleConfig(defaultConfig);
    }

    randomizeParticleSettings() {
        // 随机生成颜色
        const hue1 = Math.random() * 360;
        const hue2 = (hue1 + 60 + Math.random() * 60) % 360;
        
        const color1 = this.hslToHex(hue1, 70 + Math.random() * 30, 30 + Math.random() * 40);
        const color2 = this.hslToHex(hue2, 70 + Math.random() * 30, 30 + Math.random() * 40);
        
        const flowSpeed = 0.1 + Math.random() * 1.5;
        const turbulence = 0.3 + Math.random() * 2.0;

        // 更新UI
        const baseColor1 = document.getElementById('baseColor1');
        const baseColor2 = document.getElementById('baseColor2');
        const flowSpeedSlider = document.getElementById('flowSpeed');
        const turbulenceSlider = document.getElementById('turbulence');
        const flowSpeedValue = document.getElementById('flowSpeedValue');
        const turbulenceValue = document.getElementById('turbulenceValue');

        if (baseColor1) baseColor1.value = color1;
        if (baseColor2) baseColor2.value = color2;
        if (flowSpeedSlider) flowSpeedSlider.value = flowSpeed;
        if (turbulenceSlider) turbulenceSlider.value = turbulence;
        if (flowSpeedValue) flowSpeedValue.textContent = flowSpeed.toFixed(1);
        if (turbulenceValue) turbulenceValue.textContent = turbulence.toFixed(1);

        // 应用配置
        const config = {
            baseColor1: parseInt(color1.replace('#', '0x')),
            baseColor2: parseInt(color2.replace('#', '0x')),
            flowSpeed: flowSpeed,
            turbulence: turbulence
        };
        
        this.updateParticleConfig(config);
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // ===== 清理方法 =====
    destroy() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
    }

    // 加载聊天历史
    async loadChatHistory() {
        try {
            console.log('Attempting to fetch from:', `${this.apiBaseUrl}/chat-history`);
            const response = await fetch(`${this.apiBaseUrl}/chat-history`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.history && Array.isArray(data.history)) {
                // 清空当前聊天区域
                this.chatArea.innerHTML = '';
                
                // 显示历史消息
                data.history.forEach(msg => {
                    // 根据消息的role判断是否为用户消息
                    const isUser = msg.role === 'user';
                    // 移除消息中的"[开拓者对三月七说]："前缀
                    const content = msg.content.replace('[开拓者对三月七说]：', '');
                    this.addMessage(content, isUser);
                });
            }
        } catch (error) {
            console.error('加载聊天历史失败:', error);
            this.addMessage('加载历史对话时出现了一些问题...', false);
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