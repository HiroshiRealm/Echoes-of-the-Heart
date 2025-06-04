// ===== 结局页面管理器 =====
class EndingManager {
    constructor() {
        this.init();
    }

    init() {
        // 等待DOM加载完成
        document.addEventListener('DOMContentLoaded', this.initPage.bind(this));
    }

    initPage() {
        // 初始化结局音效（修正路径）
        if (window.GlobalAudio) {
            window.GlobalAudio.initNarration('../assets/audio/MoppySound.mp3', true);
            
            // 额外尝试确保播放
            setTimeout(() => {
                if (window.GlobalAudio && !window.GlobalAudio.isNarrationPlaying) {
                    window.GlobalAudio.playNarration();
                }
            }, 300);
        }
        
        // 获取按钮元素
        const menuBtn = document.getElementById('menu-btn');

        // 绑定事件
        this.bindEvents(menuBtn);
        
        // 启动动态效果
        this.startDynamicEffects();
        
        // 增强加载动画
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    }

    bindEvents(menuBtn) {
        // 返回主菜单按钮
        menuBtn.addEventListener('click', () => {
            this.returnToMainMenu();
        });

        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                menuBtn.click();
            }
        });
    }

    returnToMainMenu() {
        // 停止结局音效
        if (window.GlobalAudio) {
            window.GlobalAudio.stopNarration();
        }
        
        // 添加淡出效果
        document.body.style.transition = 'opacity 1s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            // 跳转到主菜单页面（修正路径）
            window.location.href = '../index.html';
        }, 1000);
    }

    startDynamicEffects() {
        // 每隔一段时间创建新的漂浮粒子
        setInterval(() => {
            this.createFloatingParticle();
        }, 3000);
    }

    // 动态光效增强
    createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (3 + Math.random() * 3) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        const lightParticles = document.querySelector('.light-particles');
        if (lightParticles) {
            lightParticles.appendChild(particle);
            
            // 8秒后移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 8000);
        }
    }
}

// ===== 全局实例 =====
const endingManager = new EndingManager(); 