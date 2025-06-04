### 安装步骤

1. 克隆仓库
```bash
git clone [repository-url]
cd Echoes-of-Heart
```

2. 安装依赖
```bash
# 安装 Node.js 依赖
npm install

# 安装 Python 依赖
pip install -r requirements.txt
```

### 启动服务

```bash
# 启动服务器
npm start
```

服务器将在 http://localhost:3000 运行

## API 接口

### 1. 对话接口
```http
POST /chat
Content-Type: application/json

{
    "message": "你好，三月七"
}
```

### 2. 记忆点更新与检查（按照游戏的逻辑应该先调用这个接口）
```http
POST /memory
Content-Type: application/json

{
    "current_dialogue": "杨叔总是很冷静"
}
```

### 3. 清空历史
```http
POST /clear
```
