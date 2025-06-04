// ===== 记忆拼图系统管理器 =====
class MemoryPuzzleManager {
    constructor() {
        this.unlockedMemories = new Array(9).fill(false);
        this.currentProgress = 0;
        this.isAnimating = false;
        this.particleSystem = null;
        
        // API配置
        this.apiBaseUrl = 'http://localhost:3000';
        
        // DOM元素
        this.eventOverlay = null;
        this.eventImage = null;
        this.puzzleGrid = null;
        this.progressCount = null;
        this.progressFill = null;
        this.pieces = null;
        
        this.init();
    }

    async init() {
        // 获取DOM元素
        this.eventOverlay = document.getElementById('eventOverlay');
        this.eventImage = document.getElementById('eventImage');
        this.puzzleGrid = document.getElementById('puzzleGrid');
        this.progressCount = document.getElementById('progressCount');
        this.progressFill = document.getElementById('progressFill');
        this.pieces = document.querySelectorAll('.puzzle-piece');
        
        // 初始化全局音频系统（继续播放背景音乐）
        window.GlobalAudio.initBackgroundMusic('../assets/audio/Brian Eno - An Ending (Ascent).mp3');
        
        // 额外尝试确保背景音乐播放
        setTimeout(() => {
            if (window.GlobalAudio && !window.GlobalAudio.isBackgroundMusicPlaying()) {
                window.GlobalAudio.playBackgroundMusic();
            }
        }, 300);
        
        // 创建背景粒子效果
        this.createParticles();
        
        // 从后端加载真实的记忆状态
        await this.loadMemoriesFromServer();
        
        // 初始化拼图显示
        this.updatePuzzleDisplay();
        
        // 清除记忆进度通知（用户已查看）
        this.clearMemoryNotification();
    }

    // 从服务器加载记忆状态
    async loadMemoriesFromServer() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/memories`);
            if (response.ok) {
                const data = await response.json();
                console.log('加载的记忆状态:', data);
                
                // 更新解锁状态
                this.unlockedMemories = new Array(9).fill(false);
                this.currentProgress = 0;
                
                data.memories.forEach(memory => {
                    if (memory.isUnlocked && memory.id >= 1 && memory.id <= 9) {
                        this.unlockedMemories[memory.id - 1] = true;
                        this.currentProgress++;
                    }
                });
                
                console.log('解锁状态:', this.unlockedMemories);
                console.log('当前进度:', this.currentProgress);
                
                // 不需要保存到localStorage，因为数据来自服务器
                this.updateProgress();
                return true;
            } else {
                console.warn('无法加载记忆状态，使用本地保存的状态');
                this.loadProgress(); // 降级到本地存储
                return false;
            }
        } catch (error) {
            console.error('加载记忆状态失败:', error);
            this.loadProgress(); // 降级到本地存储
            return false;
        }
    }

    // 清除记忆进度通知
    clearMemoryNotification() {
        // 如果是从对话页面跳转过来的，清除通知
        const memoryEntrance = document.querySelector('.memory-progress-entrance');
        if (memoryEntrance) {
            const notification = memoryEntrance.querySelector('.memory-notification');
            if (notification) {
                notification.style.display = 'none';
                notification.textContent = '0';
            }
            memoryEntrance.classList.remove('has-new-memory');
        }
    }

    // 创建统一的背景粒子效果
    createParticles() {
        // 使用统一的粒子系统，但用CSS粒子来匹配原有设计
        const particlesContainer = document.getElementById('particles');
        const particleCount = 200; // 统一粒子数量

        // 动画类型数组
        const animationTypes = ['', 'float-slow', 'float-fast', 'drift'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // 随机分配动画类型
            const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
            particle.className = `particle ${animationType}`;
            
            // 随机位置
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // 多样化的大小（1px到4px）- 统一配置
            const size = 1 + Math.random() * 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // 多样化的透明度（0.2到0.8）- 统一配置
            const opacity = 0.2 + Math.random() * 0.6;
            particle.style.opacity = opacity;
            
            // 多样化的动画时间
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (3 + Math.random() * 6) + 's';
            
            // 统一的颜色变化（蓝色系到青色系）
            const hue = 200 + Math.random() * 60; // 200-260度，蓝色到青色
            const saturation = 60 + Math.random() * 40; // 60%-100%饱和度
            const lightness = 50 + Math.random() * 30; // 50%-80%亮度
            particle.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            particle.style.boxShadow = `0 0 ${size * 2}px hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
            
            particlesContainer.appendChild(particle);
        }
    }

    // 解锁指定记忆
    async unlockMemory(memoryIndex) {
        if (this.isAnimating || memoryIndex < 0 || memoryIndex >= 9) {
            return false;
        }

        if (this.unlockedMemories[memoryIndex]) {
            console.log(`记忆 ${memoryIndex + 1} 已经解锁`);
            return false;
        }

        this.isAnimating = true;

        try {
            // 阶段一：展示记忆事件图片
            await this.showMemoryEvent(memoryIndex);
            
            // 阶段二：激活对应的拼图块
            await this.activatePuzzlePiece(memoryIndex);
            
            // 更新状态
            this.unlockedMemories[memoryIndex] = true;
            this.currentProgress++;
            this.updateProgress();
            this.saveProgress();
            
            return true;
        } catch (error) {
            console.error('解锁记忆时出错:', error);
            return false;
        } finally {
            this.isAnimating = false;
        }
    }

    // 展示记忆事件图片
    showMemoryEvent(memoryIndex) {
        return new Promise((resolve) => {
            // 设置事件图片路径
            const eventImagePath = `../assets/images/memories/memory_${memoryIndex + 1}.jpg`;
            this.eventImage.src = eventImagePath;
            
            // 显示覆盖层
            this.eventOverlay.classList.add('active');
            
            // 设置图片加载错误处理
            this.eventImage.onerror = () => {
                console.warn(`记忆事件图片加载失败: ${eventImagePath}`);
                // 可以设置默认图片
                this.eventImage.src = '../assets/images/placeholder-memory.jpg';
            };
            
            // 延迟后隐藏
            setTimeout(() => {
                this.eventOverlay.classList.remove('active');
                setTimeout(resolve, 1000); // 等待淡出动画完成
            }, 4000); // 4秒展示时间
        });
    }

    // 激活拼图块
    activatePuzzlePiece(memoryIndex) {
        return new Promise((resolve) => {
            const piece = this.pieces[memoryIndex];
            
            // 设置相机拼图块图片
            const cameraImagePath = `../assets/images/camera/camera_piece_${memoryIndex + 1}.png`;
            
            // 添加激活动画类
            piece.classList.add('activating');
            
            // 设置背景图片
            piece.style.backgroundImage = `url('${cameraImagePath}')`;
            
            // 图片加载错误处理
            const img = new Image();
            img.onerror = () => {
                console.warn(`相机拼图块图片加载失败: ${cameraImagePath}`);
                // 使用渐变作为后备
                piece.style.background = `linear-gradient(135deg, 
                    rgba(100, 180, 255, 0.3) 0%, 
                    rgba(120, 200, 255, 0.2) 100%)`;
            };
            img.src = cameraImagePath;
            
            // 动画完成后更新状态
            setTimeout(() => {
                piece.classList.remove('activating', 'locked');
                piece.classList.add('unlocked');
                resolve();
            }, 1200); // 激活动画时长
        });
    }

    // 更新进度显示
    updateProgress() {
        this.progressCount.textContent = this.currentProgress;
        const percentage = (this.currentProgress / 9) * 100;
        this.progressFill.style.width = percentage + '%';
        
        // 完成所有拼图时的特殊效果
        if (this.currentProgress === 9) {
            this.onPuzzleComplete();
        }
    }

    // 拼图完成时的效果
    onPuzzleComplete() {
        setTimeout(() => {
            this.startConvergenceAnimation();
        }, 500);
    }

    // 开始聚拢动画
    async startConvergenceAnimation() {
        console.log('🎉 开始拼图聚拢动画...');
        
        // 添加完成状态类
        this.puzzleGrid.classList.add('completing');
        
        // 记录每个拼图块的原始位置，并设置为绝对定位
        this.pieces.forEach((piece, index) => {
            const rect = piece.getBoundingClientRect();
            const gridRect = this.puzzleGrid.getBoundingClientRect();
            
            piece.style.left = (rect.left - gridRect.left) + 'px';
            piece.style.top = (rect.top - gridRect.top) + 'px';
            piece.style.width = rect.width + 'px';
            piece.style.height = rect.height + 'px';
            
            // 添加聚拢类，触发CSS动画
            setTimeout(() => {
                piece.classList.add('converging');
            }, index * 100); // 错开每个块的启动时间
        });

        // 等待聚拢动画完成
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 隐藏拼图块并显示完整相机
        this.pieces.forEach(piece => {
            piece.style.opacity = '0';
        });
        
        // 创建并显示完整相机图片
        const completeCamera = document.createElement('div');
        completeCamera.className = 'complete-camera';
        this.puzzleGrid.appendChild(completeCamera);
        
        // 延迟显示完整相机
        setTimeout(() => {
            completeCamera.classList.add('revealed');
        }, 200);
        
        // 等待完整相机展示
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 开始原始相机过渡动画
        await this.transitionToOriginCamera(completeCamera);
        
        // 跳转到结局页面
        this.transitionToEnding();
    }

    // 过渡到原始相机图片
    async transitionToOriginCamera(cameraElement) {
        console.log('📸 切换到原始相机图片...');
        
        // 添加原始相机过渡类，触发图片切换和放大动画
        cameraElement.classList.add('origin-transition');
        
        // 等待过渡动画完成
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 额外展示时间
        await new Promise(resolve => setTimeout(resolve, 2500));
    }

    // 跳转到结局页面
    transitionToEnding() {
        console.log('🌟 跳转到结局页面...');
        
        // 创建淡出效果
        document.body.style.transition = 'opacity 1s ease-out';
        document.body.style.opacity = '0';
        
        // 等待淡出完成后跳转
        setTimeout(() => {
            window.location.href = './ending.html';
        }, 1000);
    }

    // 更新拼图显示
    updatePuzzleDisplay() {
        this.pieces.forEach((piece, index) => {
            if (this.unlockedMemories[index]) {
                piece.classList.remove('locked');
                piece.classList.add('unlocked');
                const cameraImagePath = `../assets/images/camera/camera_piece_${index + 1}.png`;
                piece.style.backgroundImage = `url('${cameraImagePath}')`;
            }
        });
        
        this.updateProgress();
    }

    // 保存进度到本地存储
    saveProgress() {
        const progressData = {
            unlockedMemories: this.unlockedMemories,
            currentProgress: this.currentProgress
        };
        localStorage.setItem('memoryPuzzleProgress', JSON.stringify(progressData));
    }

    // 从本地存储加载进度
    loadProgress() {
        const saved = localStorage.getItem('memoryPuzzleProgress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.unlockedMemories = data.unlockedMemories || new Array(9).fill(false);
                this.currentProgress = data.currentProgress || 0;
            } catch (error) {
                console.error('加载进度时出错:', error);
            }
        }
    }

    // 重置进度
    resetProgress() {
        this.unlockedMemories = new Array(9).fill(false);
        this.currentProgress = 0;
        
        this.pieces.forEach(piece => {
            piece.classList.remove('unlocked', 'activating');
            piece.classList.add('locked');
            piece.style.backgroundImage = '';
            piece.style.background = '';
        });
        
        this.puzzleGrid.style.boxShadow = '';
        this.updateProgress();
        this.saveProgress();
    }

    // 获取进度状态
    getProgress() {
        return {
            unlockedMemories: [...this.unlockedMemories],
            currentProgress: this.currentProgress,
            isComplete: this.currentProgress === 9
        };
    }
}

// ===== 页面初始化 =====
let memoryPuzzle;

document.addEventListener('DOMContentLoaded', async () => {
    memoryPuzzle = new MemoryPuzzleManager();
    // 不需要等待init()，因为构造函数中已经调用了init()
});

// ===== 测试函数 =====
// 测试函数：解锁下一个记忆
function unlockNextMemory() {
    const nextIndex = memoryPuzzle.unlockedMemories.findIndex(unlocked => !unlocked);
    if (nextIndex !== -1) {
        memoryPuzzle.unlockMemory(nextIndex);
    } else {
        alert('所有记忆都已解锁！');
    }
}

// 测试函数：重置进度
function resetProgress() {
    memoryPuzzle.resetProgress();
}

// 测试函数：解锁全部
async function unlockAll() {
    for (let i = 0; i < 9; i++) {
        if (!memoryPuzzle.unlockedMemories[i]) {
            await memoryPuzzle.unlockMemory(i);
            await new Promise(resolve => setTimeout(resolve, 500)); // 间隔0.5秒
        }
    }
}

// ===== 返回按钮功能 =====
function goBack() {
    // 创建淡出效果
    document.body.style.transition = 'opacity 0.8s ease-out';
    document.body.style.opacity = '0';
    
    // 等待淡出完成后跳转回对话界面
    setTimeout(() => {
        window.location.href = '../pages/dialogue.html';
    }, 800);
}

// ===== 导出API供其他页面调用 =====
window.MemoryPuzzleAPI = {
    unlockMemory: (index) => memoryPuzzle?.unlockMemory(index),
    getProgress: () => memoryPuzzle?.getProgress(),
    resetProgress: () => memoryPuzzle?.resetProgress()
}; 