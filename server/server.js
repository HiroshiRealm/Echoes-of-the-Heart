const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Store user data by IP
const userData = new Map();

// Helper function to get real IP address
function getRealIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.connection.socket?.remoteAddress;
}

// Helper function to get user data directory
function getUserDataDir(userIP) {
    // 确保IP地址是有效的字符串
    const sanitizedIP = userIP.replace(/[^0-9.]/g, '_');
    const userDataDir = path.join(__dirname, 'data', sanitizedIP);
    
    // 确保data目录存在
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 创建用户特定的数据目录
    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
        console.log(`Created data directory for IP: ${sanitizedIP}`);
    }
    
    return userDataDir;
}

// Helper function to run Python scripts
function runPythonScript(scriptPath, functionName, args) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [scriptPath]);
        let outputData = '';
        let errorData = '';

        // 写入参数到标准输入
        pythonProcess.stdin.write(JSON.stringify({
            function: functionName,
            args: args
        }));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script failed with code ${code}: ${errorData}`));
                return;
            }
            try {
                resolve(JSON.parse(outputData));
            } catch (e) {
                resolve(outputData.trim());
            }
        });
    });
}

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const userIP = getRealIP(req);
        console.log(`Chat request from IP: ${userIP}`);
        
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Set environment variable for user data directory
        const userDataDir = getUserDataDir(userIP);
        process.env.USER_DATA_DIR = userDataDir;

        // Run chat_with_march_seven function
        const reply = await runPythonScript(
            'python/chat_service.py',
            'chat_with_march_seven',
            { user_message: message }
        );
        res.json({ reply });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Memory endpoint
app.post('/memory', async (req, res) => {
    try {
        const userIP = getRealIP(req);
        console.log(`Memory request from IP: ${userIP}`);
        
        const { current_dialogue } = req.body;

        if (!current_dialogue) {
            return res.status(400).json({ error: 'Current dialogue is required' });
        }

        // Set environment variable for user data directory
        const userDataDir = getUserDataDir(userIP);
        process.env.USER_DATA_DIR = userDataDir;

        // Run check_all_memory_points function
        const response = await runPythonScript(
            'python/memory_service.py',
            'check_all_memory_points',
            { current_dialogue }
        );
        
        // 检查是否有错误
        if (response.error) {
            throw new Error(response.error);
        }
        
        // 确保返回的是数组
        const memoryPoints = Array.isArray(response.result) ? response.result : [];
        
        res.json({ memoryPoints });
    } catch (error) {
        console.error('Memory check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear endpoint
app.post('/clear', async (req, res) => {
    try {
        const userIP = getRealIP(req);
        console.log(`Clear request from IP: ${userIP}`);
        
        // Set environment variable for user data directory
        const userDataDir = getUserDataDir(userIP);
        process.env.USER_DATA_DIR = userDataDir;

        // Run clear functions
        await runPythonScript('python/chat_service.py', 'clear_memories', {});
        await runPythonScript('python/chat_service.py', 'clear_chat_history', {});

        res.json({ message: 'Successfully cleared memories and chat history' });
    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // 确保data目录存在
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Created main data directory');
    }
}); 