// ===== WebGL粒子系统配置 =====
class ParticleSystem {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.CONFIG = {
            particleCount: options.particleCount || 5000,
            baseColor1: new THREE.Color(options.baseColor1 || 0x1a237e),
            baseColor2: new THREE.Color(options.baseColor2 || 0x4a148c),
            particleSize: options.particleSize || 2.0,
            flowSpeed: options.flowSpeed || 0.3,
            turbulence: options.turbulence || 1.0,
            vorticity: options.vorticity || 1.5,
            glowIntensity: options.glowIntensity || 0.2,
            glowRange: options.glowRange || 0.4,
            spaceSize: options.spaceSize || 80,
            cameraDistance: options.cameraDistance || 40
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.time = 0;
        this.animationId = null;

        this.init();
    }

    // ===== 数学工具函数 =====
    hash(n) {
        n = Math.sin(n) * 43758.5453;
        return n - Math.floor(n);
    }
    
    noise3D(x, y, z) {
        const p = Math.floor(x) + Math.floor(y) * 57 + Math.floor(z) * 113;
        const f = [x - Math.floor(x), y - Math.floor(y), z - Math.floor(z)];
        
        f[0] = f[0] * f[0] * (3 - 2 * f[0]);
        f[1] = f[1] * f[1] * (3 - 2 * f[1]);
        f[2] = f[2] * f[2] * (3 - 2 * f[2]);
        
        const n = p;
        return this.lerp(
            this.lerp(
                this.lerp(this.hash(n), this.hash(n + 1), f[0]),
                this.lerp(this.hash(n + 57), this.hash(n + 58), f[0]), f[1]
            ),
            this.lerp(
                this.lerp(this.hash(n + 113), this.hash(n + 114), f[0]),
                this.lerp(this.hash(n + 170), this.hash(n + 171), f[0]), f[1]
            ), f[2]
        );
    }
    
    lerp(a, b, t) {
        return a + t * (b - a);
    }
    
    turbulenceNoise(x, y, z, octaves = 3) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            value += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        
        return value / maxValue;
    }
    
    getVectorField(x, y, z, time) {
        const scale = 0.01;
        const timeScale = time * 0.001;
        
        const noise1 = this.turbulenceNoise(x * scale, y * scale, z * scale + timeScale, 2);
        const noise2 = this.turbulenceNoise(x * scale * 2, y * scale * 2, z * scale * 2 + timeScale * 1.3, 2);
        const noise3 = this.turbulenceNoise(x * scale * 0.5, y * scale * 0.5, z * scale * 0.5 + timeScale * 0.7, 3);
        
        const curlX = this.turbulenceNoise(y * scale, z * scale, timeScale) - this.turbulenceNoise(y * scale, z * scale + 0.01, timeScale);
        const curlY = this.turbulenceNoise(z * scale, x * scale, timeScale) - this.turbulenceNoise(z * scale + 0.01, x * scale, timeScale);
        const curlZ = this.turbulenceNoise(x * scale, y * scale, timeScale) - this.turbulenceNoise(x * scale + 0.01, y * scale, timeScale);
        
        return {
            x: (noise1 - 0.5) * 2 + curlX * this.CONFIG.vorticity,
            y: (noise2 - 0.5) * 2 + curlY * this.CONFIG.vorticity,
            z: (noise3 - 0.5) * 2 + curlZ * this.CONFIG.vorticity
        };
    }

    // ===== 初始化方法 =====
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = this.CONFIG.cameraDistance;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        this.createParticles();
        this.animate();

        // 监听窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.CONFIG.particleCount * 3);
        const colors = new Float32Array(this.CONFIG.particleCount * 3);
        const velocities = new Float32Array(this.CONFIG.particleCount * 3);
        const sizes = new Float32Array(this.CONFIG.particleCount);
        
        for (let i = 0; i < this.CONFIG.particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * this.CONFIG.spaceSize;
            positions[i3 + 1] = (Math.random() - 0.5) * this.CONFIG.spaceSize;
            positions[i3 + 2] = (Math.random() - 0.5) * this.CONFIG.spaceSize;
            
            const colorMix = Math.random();
            const color = this.CONFIG.baseColor1.clone().lerp(this.CONFIG.baseColor2, colorMix);
            
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            velocities[i3] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
            
            sizes[i] = this.CONFIG.particleSize * (0.5 + Math.random() * 0.5);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                glowIntensity: { value: this.CONFIG.glowIntensity },
                glowRange: { value: this.CONFIG.glowRange },
                pixelRatio: { value: this.renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                uniform float time;
                uniform float glowIntensity;
                uniform float glowRange;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    float coreSize = 0.2 * glowRange;
                    float edgeSize = 0.4 * glowRange;
                    
                    float alpha = 1.0 - smoothstep(coreSize, edgeSize, dist);
                    float pulse = 0.8 + 0.2 * sin(time * 0.003 + length(vColor) * 10.0);
                    
                    float glowFalloff = glowRange * 0.6;
                    float glow = glowIntensity * (1.0 - smoothstep(0.0, glowFalloff, dist));
                    
                    vec3 finalColor = vColor * (pulse + glow * 0.5);
                    float finalAlpha = alpha + glow * 0.3;
                    
                    gl_FragColor = vec4(finalColor, finalAlpha * 0.6);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    updateParticles() {
        if (!this.particles) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.geometry.attributes.velocity.array;
        
        this.particles.material.uniforms.time.value = this.time;
        
        for (let i = 0; i < this.CONFIG.particleCount; i++) {
            const i3 = i * 3;
            
            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];
            
            const field = this.getVectorField(x, y, z, this.time * this.CONFIG.flowSpeed);
            
            const turbulentForce = this.CONFIG.turbulence * 0.002;
            velocities[i3] += field.x * turbulentForce;
            velocities[i3 + 1] += field.y * turbulentForce;
            velocities[i3 + 2] += field.z * turbulentForce;
            
            const flowInfluence = this.CONFIG.flowSpeed * 0.002;
            velocities[i3] += flowInfluence;
            velocities[i3 + 1] += flowInfluence * 0.5;
            
            velocities[i3] *= 0.99;
            velocities[i3 + 1] *= 0.99;
            velocities[i3 + 2] *= 0.99;
            
            x += velocities[i3];
            y += velocities[i3 + 1];
            z += velocities[i3 + 2];
            
            const halfSpace = this.CONFIG.spaceSize / 2;
            
            if (x > halfSpace) x = -halfSpace;
            else if (x < -halfSpace) x = halfSpace;
            if (y > halfSpace) y = -halfSpace;
            else if (y < -halfSpace) y = halfSpace;
            if (z > halfSpace) z = -halfSpace;
            else if (z < -halfSpace) z = halfSpace;
            
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.time = Date.now();
        
        if (this.particles) {
            this.updateParticles();
            
            this.camera.position.x = Math.sin(this.time * 0.0001) * 2;
            this.camera.position.y = Math.cos(this.time * 0.0001) * 1;
            this.camera.lookAt(0, 0, 0);
            
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // ===== 公共方法 =====
    handleResize() {
        this.onWindowResize();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
    }

    updateConfig(newConfig) {
        Object.assign(this.CONFIG, newConfig);
        
        // 如果更新了颜色配置，需要转换为THREE.Color对象
        if (newConfig.baseColor1 !== undefined) {
            this.CONFIG.baseColor1 = new THREE.Color(newConfig.baseColor1);
        }
        if (newConfig.baseColor2 !== undefined) {
            this.CONFIG.baseColor2 = new THREE.Color(newConfig.baseColor2);
        }
    }
}

// ===== 预设配置 =====
const ParticlePresets = {
    dialogue: {
        particleCount: 5000,
        baseColor1: 0x1a237e,
        baseColor2: 0x4a148c,
        particleSize: 2.0,
        flowSpeed: 0.3,
        turbulence: 1.0,
        vorticity: 1.5,
        glowIntensity: 0.2,
        glowRange: 0.4,
        spaceSize: 80,
        cameraDistance: 40
    },
    
    // memory-progress 使用CSS粒子系统，这里提供配置参考
    memoryProgress: {
        particleCount: 200, // 统一的粒子数量
        useCSS: true, // 标记使用CSS粒子
        animationTypes: ['', 'float-slow', 'float-fast', 'drift'],
        size: { min: 1, max: 4 }, // 1-4px
        opacity: { min: 0.2, max: 0.8 }, // 0.2-0.8
        color: {
            hue: { min: 200, max: 260 }, // 蓝色到青色
            saturation: { min: 60, max: 100 },
            lightness: { min: 50, max: 80 }
        },
        animation: {
            delay: { min: 0, max: 8 }, // 0-8秒
            duration: { min: 3, max: 9 } // 3-9秒
        }
    },
    
    gentle: {
        particleCount: 2000,
        baseColor1: 0x3f51b5,
        baseColor2: 0x9c27b0,
        particleSize: 1.5,
        flowSpeed: 0.1,
        turbulence: 0.5,
        vorticity: 0.8,
        glowIntensity: 0.15,
        glowRange: 0.3,
        spaceSize: 60,
        cameraDistance: 35
    }
};

// 导出给全局使用
window.ParticleSystem = ParticleSystem;
window.ParticlePresets = ParticlePresets; 