const axios = require('axios');

// 测试服务器地址
const BASE_URL = 'http://localhost:3000';

// 模拟不同IP地址的请求
const testIPs = [
    '192.168.1.1',
    '192.168.1.2',
    '192.168.1.3'
];

// 测试消息
const testMessages = [
    "你好，三月七！",
    "你还记得丹恒吗？",
    "姬子阿姨的咖啡怎么样？",
    "杨叔是个什么样的人？"
];

// 测试记忆点触发
const testMemoryDialogues = [
    "丹恒是个很可靠的伙伴呢",
    "姬子阿姨的咖啡真的很难喝",
    "杨叔总是很冷静",
    "我们在空间站遇到了末日兽"
];

// 模拟请求头
function getHeaders(ip) {
    return {
        'X-Forwarded-For': ip,
        'Content-Type': 'application/json'
    };
}

// 测试聊天功能
async function testChat(ip, message) {
    try {
        console.log(`\n测试IP ${ip} 的聊天功能:`);
        console.log(`发送消息: "${message}"`);
        
        const response = await axios.post(
            `${BASE_URL}/chat`,
            { message },
            { headers: getHeaders(ip) }
        );
        
        console.log('收到回复:', response.data.reply);
        return response.data;
    } catch (error) {
        console.error('聊天测试失败:', error.message);
    }
}

// 测试记忆点功能
async function testMemory(ip, dialogue) {
    try {
        console.log(`\n测试IP ${ip} 的记忆点功能:`);
        console.log(`当前对话: "${dialogue}"`);
        
        const response = await axios.post(
            `${BASE_URL}/memory`,
            { current_dialogue: dialogue },
            { headers: getHeaders(ip) }
        );
        
        console.log('触发的记忆点:', response.data.memoryPoints.filter(m => m.isTriggered));
        return response.data;
    } catch (error) {
        console.error('记忆点测试失败:', error.message);
    }
}

// 测试清除功能
async function testClear(ip) {
    try {
        console.log(`\n测试IP ${ip} 的清除功能:`);
        
        const response = await axios.post(
            `${BASE_URL}/clear`,
            {},
            { headers: getHeaders(ip) }
        );
        
        console.log('清除结果:', response.data.message);
        return response.data;
    } catch (error) {
        console.error('清除测试失败:', error.message);
    }
}

// 运行完整测试
async function runTests() {
    console.log('开始测试...\n');
    
    for (const ip of testIPs) {
        console.log(`\n=== 测试IP: ${ip} ===`);
        
        // 测试聊天
        // for (const message of testMessages) {
        //     await testChat(ip, message);
        // }
        
        // 测试记忆点
        for (const dialogue of testMemoryDialogues) {
            await testMemory(ip, dialogue);
        }
        
        // 测试清除
        await testClear(ip);
        
        // 清除后再次测试聊天
        await testChat(ip, "清除后测试消息");
    }
    
    console.log('\n测试完成！');
}

// 运行测试
runTests().catch(console.error); 