// ===== 介绍页面管理器 =====
class IntroToDialogueManager {
    constructor() {
        // ===== 时间配置中心 =====
        this.TIMING_CONFIG = {
            // 文字动画配置
            textAnimation: {
                // 每行文字的延迟时间（秒），可以独立调整每行以匹配音频
                lineDelays: [
                    0.0,    // "三月七发现自己漂浮在一片广阔而混乱的意识空间中，"
                    5.0,    // "她的记忆如同破碎的镜子，"
                    7.2,    // "散落在未知的角落，"
                    9.3,    // "等待着被重新拾起与理解……"
                    12.5,   // "在这个梦幻般的空间里，"
                    14.7,   // "时间失去了意义，现实与幻想交织"
                    19.5    // "她必须通过对话来寻找真相。"
                ],
                
                // 每行文字显现的动画持续时间（秒）
                revealDuration: 1.0,
                
                // 最后一行完成后的等待时间（秒）
                endWaitTime: 3.0,
                
                // 按钮显示延迟时间（相对于最后一行文字完成）
                buttonDelay: 1.0
            },
            
            // 整体动画配置
            globalAnimation: {
                // 页面加载后开始动画的延迟（秒）
                startDelay: 0.5,
                
                // 页面跳转淡出时间（秒）
                fadeOutDuration: 1.0
            },
            
            // 调试和开发配置
            debug: {
                // 是否在控制台显示时间信息
                showTimingLogs: true,
                
                // 是否启用快速模式（缩短所有时间用于调试）
                fastMode: false,
                fastModeSpeedMultiplier: 0.3
            }
        };

        // ===== 全局状态管理 =====
        this.introCompleted = false;
        this.autoTransitionMode = false; // 设为 false 启用按钮模式

        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', this.initPage.bind(this));
    }

    initPage() {
        // 初始化音频系统（修正路径）
        if (window.GlobalAudio) {
            window.GlobalAudio.initNarration('../assets/audio/kafka.wav', true);
            
            // 额外尝试确保播放
            setTimeout(() => {
                if (window.GlobalAudio && !window.GlobalAudio.isNarrationPlaying) {
                    window.GlobalAudio.playNarration();
                }
            }, 500);
        }
        
        // 开始介绍动画
        const startDelay = this.TIMING_CONFIG.globalAnimation.startDelay;
        setTimeout(() => this.startIntroAnimation(), this.toMs(startDelay));
        
        // 继续按钮点击
        document.getElementById('continue-btn').addEventListener('click', () => {
            if (this.introCompleted) {
                this.goToDialogue();
            }
        });
        
        // 显示调试信息
        if (this.TIMING_CONFIG.debug.showTimingLogs) {
            console.log('=== 时间配置调试信息 ===');
            console.log('使用 window.introManager.TimingDebug.showConfig() 查看详细配置');
            console.log('使用 window.introManager.TimingDebug.toggleFastMode() 切换快速模式');
        }

        // 设置全局调试对象
        window.introManager = this;
    }

    // ===== 时间计算工具 =====
    // 获取实际延迟时间（考虑快速模式）
    getActualDelay(delay) {
        if (this.TIMING_CONFIG.debug.fastMode) {
            return delay * this.TIMING_CONFIG.debug.fastModeSpeedMultiplier;
        }
        return delay;
    }
    
    // 将秒转换为毫秒
    toMs(seconds) {
        return this.getActualDelay(seconds) * 1000;
    }
    
    // 计算文字动画的总时长
    getTotalTextDuration() {
        const lastLineDelay = Math.max(...this.TIMING_CONFIG.textAnimation.lineDelays);
        const revealDuration = this.TIMING_CONFIG.textAnimation.revealDuration;
        const endWait = this.TIMING_CONFIG.textAnimation.endWaitTime;
        return lastLineDelay + revealDuration + endWait;
    }
    
    // 打印时间调试信息
    logTiming(message, timeValue) {
        if (this.TIMING_CONFIG.debug.showTimingLogs) {
            const mode = this.TIMING_CONFIG.debug.fastMode ? '[快速模式]' : '[正常模式]';
            console.log(`${mode} ${message}: ${timeValue.toFixed(2)}秒`);
        }
    }

    // ===== 介绍界面动画控制 =====
    startIntroAnimation() {
        const textLines = document.querySelectorAll('.text-line');
        const continueBtn = document.getElementById('continue-btn');
        const config = this.TIMING_CONFIG.textAnimation;
        
        this.logTiming('开始文字动画', 0);
        this.logTiming('动画总时长', this.getTotalTextDuration());
        
        // 为每行文字设置独立的延迟时间
        textLines.forEach((line, index) => {
            const delay = config.lineDelays[index] || 0;
            const actualDelayMs = this.toMs(delay);
            
            this.logTiming(`第${index + 1}行文字`, delay);
            
            setTimeout(() => {
                line.style.animation = `textReveal ${this.getActualDelay(config.revealDuration)}s ease-out forwards`;
            }, actualDelayMs);
        });
        
        // 计算按钮显示时间
        const totalDuration = this.getTotalTextDuration();
        const buttonShowTime = totalDuration + config.buttonDelay;
        
        this.logTiming('按钮显示时间', buttonShowTime);
        
        setTimeout(() => {
            this.introCompleted = true;
            
            if (this.autoTransitionMode) {
                // 自动过渡模式
                setTimeout(() => {
                    this.goToDialogue();
                }, this.toMs(2));
            } else {
                // 按钮模式
                continueBtn.classList.add('show');
            }
        }, this.toMs(buttonShowTime));
    }

    // ===== 跳转到对话页面 =====
    goToDialogue() {
        // 停止音频
        if (window.GlobalAudio) {
            window.GlobalAudio.stopNarration();
        }
        
        // 页面淡出效果
        const fadeTime = this.TIMING_CONFIG.globalAnimation.fadeOutDuration;
        document.body.style.transition = `opacity ${this.getActualDelay(fadeTime)}s ease-out`;
        document.body.style.opacity = '0';
        
        // 跳转到对话页面（修正路径）
        setTimeout(() => {
            window.location.href = '../pages/dialogue.html';
        }, this.toMs(fadeTime));
    }

    // ===== 开发者工具函数 =====
    get TimingDebug() {
        return {
            // 切换快速模式
            toggleFastMode: () => {
                this.TIMING_CONFIG.debug.fastMode = !this.TIMING_CONFIG.debug.fastMode;
                console.log(`快速模式: ${this.TIMING_CONFIG.debug.fastMode ? '开启' : '关闭'}`);
                location.reload();
            },
            
            // 显示当前时间配置
            showConfig: () => {
                console.table(this.TIMING_CONFIG.textAnimation.lineDelays.map((delay, index) => ({
                    行号: index + 1,
                    延迟时间: delay + '秒',
                    实际延迟: this.getActualDelay(delay).toFixed(2) + '秒'
                })));
            },
            
            // 修改特定行的延迟时间
            setLineDelay: (lineIndex, delaySeconds) => {
                if (lineIndex >= 0 && lineIndex < this.TIMING_CONFIG.textAnimation.lineDelays.length) {
                    this.TIMING_CONFIG.textAnimation.lineDelays[lineIndex] = delaySeconds;
                    console.log(`第${lineIndex + 1}行延迟时间已设置为 ${delaySeconds} 秒`);
                } else {
                    console.error('行号超出范围');
                }
            },
            
            // 重新开始动画（用于测试）
            restart: () => {
                location.reload();
            },

            // 切换过渡模式
            toggleTransitionMode: () => {
                this.autoTransitionMode = !this.autoTransitionMode;
                console.log(`过渡模式已切换为: ${this.autoTransitionMode ? '自动' : '按钮'}`);
                location.reload();
            }
        };
    }
}

// ===== 全局实例 =====
const introToDialogueManager = new IntroToDialogueManager(); 