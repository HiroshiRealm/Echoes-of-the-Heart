# 心之回响 (Echoes of the Heart)

一款AI-driven的Web叙事游戏，玩家通过与一位失去记忆、被困在混乱"心象空间"中的少女进行对话，帮助她找回关键的记忆碎片。

## 项目结构

```
EchoFromTheHeart/
├── client/                 # 前端文件
│   ├── pages/             # HTML页面
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── assets/            # 静态资源
└── server/                # 后端文件
    ├── python/            # Python AI服务
    ├── data/              # 用户数据存储
    └── server.js          # Node.js服务器
```

## 安装和启动

### 1. 安装依赖

#### 安装Node.js依赖
```bash
cd server
npm install
```

#### 安装Python依赖
```bash
pip install -r requirements.txt
```

### 2. 启动服务

#### 方法一：使用Node.js服务器（推荐）
```bash
cd server
npm start
```
服务器将在 http://localhost:3000 运行，同时提供前端页面和API服务。

#### 方法二：分别启动前端和后端
```bash
# 启动后端API服务器
cd server
node server.js

# 在另一个终端中启动前端（如果需要单独的前端服务器）
cd client
# 使用任何静态文件服务器，例如：
python -m http.server 8080
```

### 3. 访问游戏

在浏览器中打开：
- 主页面：http://localhost:3000
- 对话页面：http://localhost:3000/pages/dialogue.html
- 记忆进度：http://localhost:3000/pages/memory-progress.html

## API接口

### 1. 聊天接口
```http
POST /chat
Content-Type: application/json

{
    "message": "你好"
}
```

### 2. 记忆检查接口
```http
POST /memory
Content-Type: application/json

{
    "current_dialogue": "当前对话内容"
}
```

### 3. 清空历史接口
```http
POST /clear
```

## 功能特性

- ✅ AI驱动的对话系统
- ✅ 记忆碎片收集机制
- ✅ 实时前后端通信
- ✅ 美观的琉璃忆境主题UI
- ✅ 响应式设计
- ✅ 音频控制系统
- ✅ 粒子背景效果

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **AI服务**: Python
- **UI效果**: Three.js (粒子系统)

## 开发说明

前端的对话功能已经与后端API完全集成：

1. 用户输入自动调用 `/memory` 接口检查记忆点
2. 然后调用 `/chat` 接口获取AI回复
3. 支持清空聊天历史功能
4. 包含完整的错误处理和用户反馈

如有问题，请检查：
- Node.js 和 Python 环境是否正确安装
- 服务器端口3000是否被占用
- Python依赖是否完整安装 