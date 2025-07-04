# 🌌 心之回响 (Echoes of the Heart)

**一款以情感交互为核心的AI驱动Web叙事体验。**

在这个项目中，你将进入一个名为“琉璃忆境”的意识深层空间，通过与一位AI角色对话，逐步揭开她尘封的记忆。每一次深入的交流都可能解锁一片记忆碎片，最终拼凑出完整的故事。

---

## ✨ 核心特性

- **动态AI交互**：与一个拥有独特个性的AI角色进行有深度、有情感的对话。
- **记忆解锁系统**：对话会触发关键记忆点，解锁精美的记忆碎片。
- **沉浸式视觉体验**：两大核心场景均采用高级动态视觉效果，营造出梦幻般的氛围。
- **可定制的粒子宇宙**：在对话空间中，你可以实时调整背景的WebGL粒子效果，创造属于你自己的“心象宇宙”。
- **意象化UI设计**：界面元素充满隐喻，如“迷雾笼罩”的未解锁记忆，强化了叙事体验。

---

## 🛠️ 技术栈

- **前端**:
  - **核心**: HTML5, CSS3, JavaScript (ES6+ Class-based)
  - **视觉特效**:
    - **Three.js**: 用于构建对话界面的实时、可交互的WebGL粒子背景。
    - **SVG Filters**: 用于实现记忆拼图界面的动态“迷雾”和“水波纹”效果。
- **后端**:
  - **API服务**: Node.js (Express)
  - **AI集成**: 大语言模型 (LLM) 接口
  - **数据持久化**: JSON文件

---

## 🚀 前端亮点与架构

前端采用原生三件套精心构建，以面向对象的方式组织代码，确保了代码的可读性和可维护性，同时在视觉表现上追求极致。

### 1. **架构设计**

- **模块化**: 通过JavaScript Class (`DialogueManager`, `MemoryPuzzleManager`, `ParticleSystem`) 将不同功能模块解耦。
- **事件驱动**: 清晰的事件处理逻辑，响应用户交互和后端数据。
- **关注点分离**: HTML负责结构，CSS负责表现，JavaScript负责逻辑，职责分明。

### 2. **视觉特效深度解析**

#### a. 对话空间：动态WebGL粒子宇宙

- **技术核心**: 利用**Three.js**构建了一个实时渲染的3D粒子系统。
- **动态行为**: 粒子并非简单的随机漂浮，而是通过自定义的噪声算法（`Noise`和`Curl Noise`）模拟出复杂的流体和湍流效果，营造出星云流动的宏大感。
- **高度可定制化**:
  - 项目在UI中暴露了四个核心参数：`baseColor1`, `baseColor2`, `flowSpeed`, `turbulence`。
  - 用户可以通过控制面板实时修改这些参数，即时预览效果，创造出从宁静星海到混乱风暴等各种视觉风格。
  - **优化**: 颜色更新采用了高效的缓冲区属性（BufferAttribute）直接重写方式，避免了重新创建整个系统的开销，保证了流畅的交互体验。

#### b. 记忆拼图：会呼吸的“迷雾”效果

为了替代传统单调的“锁”图标，我们为未解锁的记忆设计了充满意境的动态迷雾效果。

- **技术核心**: 创新的多层**SVG滤镜**和**CSS动画**结合。
- **实现细节**:
  - **背景层**: 每个未解锁的拼图块都隐藏着对应的记忆图片（默认`opacity: 0`）。
  - **迷雾层**: 使用`<feTurbulence>`滤镜生成动态的、无序的噪声，模拟流动的雾气。
  - **涟漪层**: 另一层`<feTurbulence>`滤镜模拟水面波光粼粼的效果。
  - **动态控制**: 通过JavaScript的`requestAnimationFrame`循环，我们持续改变滤镜的`baseFrequency`和`seed`属性，让迷雾和水波的形态永不重复，实现了“会呼吸”的动态感。
- **交互升华**:
  - **悬停交互**: 当鼠标悬停在未解锁的记忆上时，滤镜效果会动态变化，迷雾和涟漪逐渐散开，隐藏的记忆图片以更高的透明度浮现，给予用户“拨开迷雾”的反馈。
  - **解锁动画**: 解锁时，迷雾和涟漪层会优雅地消失，最终被相机拼图块替代。

#### c. 完成动画：记忆的聚拢与升华

- **技术核心**: 精心编排的**CSS Transition**与**CSS Animation**。
- **实现细节**: 当9个记忆碎片全部集齐后，所有拼图块会通过CSS `transition`平滑地移动到网格中心，同时应用`@keyframes`动画，让它们在聚拢的过程中旋转、缩小并最终消失。这个过程结束后，一张代表完整记忆的图片浮现，并将用户引导至最终的结局。

---

## 🔧 后端服务与结构

后端采用Node.js + Express构建，作为一个轻量级、职责单一的服务，专注于提供AI能力和管理用户状态。

### 1. **架构**
- **Web框架**: 使用Express.js框架来快速搭建RESTful API。
- **关注点**:
  - **AI代理**: 作为前端和大型语言模型之间的桥梁。
  - **状态管理器**: 负责追踪和持久化用户的记忆解锁进度。

### 2. **API端点**
- `POST /chat`:
  - 接收前端发送的用户消息。
  - 将消息转发给LLM进行处理。
  - 在返回AI回复的同时，检查对话内容是否触发了新的记忆点。
- `GET /memories`:
  - 允许前端在加载时获取当前所有记忆碎片的解锁状态。
- `POST /clear`:
  - 提供一个重置用户进度的接口，清空聊天记录和所有已解锁的记忆。

### 3. **数据持久化**
- **方式**: 采用简单的**JSON文件** (`server/data/memories.json`) 来存储9个记忆碎片的`id`和`isUnlocked`状态。
- **优点**: 无需数据库，轻量且易于部署，非常适合本项目体量。

---

## ⚙️ 安装与运行

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/Echoes-of-the-Heart.git
    cd Echoes-of-the-Heart
    ```

2.  **安装服务器依赖**
    ```bash
    cd server
    npm install
    ```

3.  **启动Node.js服务器**
    ```bash
    # 在 server 目录下
    node server.js
    # 或者使用 npm start
    npm start
    ```
    服务器将在 http://localhost:3000 运行


4.  **开始体验**
    在浏览器中打开http://localhost:3000/index.html即可开始。



---

## 📂 项目结构

```
Echoes-of-the-Heart/
├── client/                     # 前端资源
│   ├── assets/                 # 图片、音频等静态资源
│   │   ├── images/
│   │   │   ├── camera/         # 相机拼图
│   │   │   └── memories/       # 记忆图片
│   │   └── audio/
│   ├── css/                    # 样式表
│   │   ├── dialogue.css
│   │   └── memory-progress.css
│   ├── js/                     # JavaScript逻辑
│   │   ├── dialogue.js         # 对话页面管理器
│   │   ├── memory-progress.js  # 记忆拼图管理器
│   │   ├── particles.js        # WebGL粒子系统
│   │   └── script.js           # 全局脚本 (如音频控制)
│   └── pages/                  # HTML页面
│       ├── dialogue.html
│       └── memory-progress.html
│
└── server/                     # 后端服务
    ├── server.js               # Node.js Express 应用
    ├── package.json            # Node.js 依赖配置
    ├── python/                 # Python 脚本 (可选)
    ├── data/                   # 数据存储
    │   └── memories.json
    └── requirements.txt        # Python 依赖 (可选)
``` 