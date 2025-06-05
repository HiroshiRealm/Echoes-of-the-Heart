// ===== 对话系统管理器 =====
class DialogueManager {
    constructor() {
        this.chatArea = null;
        this.chatInput = null;
        this.sendButton = null;
        this.clearChatBtn = null;
        this.particleSystem = null;
        
        // API配置
        this.apiBaseUrl = 'http://172.26.82.133:3000';
        
        this.init();
    }

    init() {
        // 获取DOM元素
        this.chatArea = document.getElementById('chat-area');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-btn');
        this.clearChatBtn = document.getElementById('clearChatBtn');

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