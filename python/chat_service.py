import json
import os
import requests

# DeepSeek API 配置
API_KEY = "sk-efe8817f744e417db101bd37c46fa3c4"

def ensure_data_files():
    """
    确保data目录下的必要文件存在
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, '..', 'data')
    
    # 确保data目录存在
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    # 检查并创建system_prompt.json
    system_prompt_path = os.path.join(data_dir, 'system_prompt.json')
    if not os.path.exists(system_prompt_path):
        default_prompt = {
            "base_prompt": "你是一个名为三月七的少女，你现在失忆了，开拓者正在与你对话试图唤醒你的记忆。随着对话的进行，你会不断触发新的记忆点，说话语气也会从恐惧逐渐变成活泼。",
            "memories": [],
            "system_prompt": "你是一个名为三月七的少女，你现在失忆了，开拓者正在与你对话试图唤醒你的记忆。随着对话的进行，你会不断触发新的记忆点，说话语气也会从恐惧逐渐变成活泼。"
        }
        with open(system_prompt_path, 'w', encoding='utf-8') as f:
            json.dump(default_prompt, f, ensure_ascii=False, indent=4)
    
    # 检查并创建chat_history.json
    history_path = os.path.join(data_dir, 'chat_history.json')
    if not os.path.exists(history_path):
        with open(history_path, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=4)

def update_system_prompt(prompt_data):
    """
    根据记忆更新系统提示词
    Args:
        prompt_data (dict): 包含base_prompt和memories的字典
    Returns:
        str: 更新后的系统提示词
    """
    # 从基础提示词开始
    system_prompt = prompt_data['base_prompt']
    
    # 如果有记忆，添加记忆部分
    if prompt_data['memories']:
        system_prompt += "\n\n已知记忆："
        for i, memory in enumerate(prompt_data['memories'], 1):
            system_prompt += f"\n{i}. {memory['content']}"
    
    return system_prompt

def save_prompt_data(prompt_data, file_path):
    """
    保存提示词数据到文件
    Args:
        prompt_data (dict): 提示词数据
        file_path (str): 文件路径
    """
    # 更新system_prompt
    prompt_data['system_prompt'] = update_system_prompt(prompt_data)
    
    # 保存到文件
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(prompt_data, f, ensure_ascii=False, indent=4)

def add_memory(memory_content, memory_id):
    """
    添加新的记忆
    Args:
        memory_content (str): 记忆内容
        memory_id (int): 记忆ID
    """
    # 确保文件存在
    ensure_data_files()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, '..', 'data', 'system_prompt.json')
    
    # 读取现有数据
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt_data = json.load(f)
    
    # 检查记忆是否已经存在
    if any(m['id'] == memory_id for m in prompt_data['memories']):
        return
    
    # 添加新记忆
    prompt_data['memories'].append({
        "id": memory_id,
        "content": memory_content
    })
    
    # 保存更新后的数据
    save_prompt_data(prompt_data, prompt_path)

def clear_memories():
    """
    清空所有记忆
    """
    # 确保文件存在
    ensure_data_files()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, '..', 'data', 'system_prompt.json')
    
    # 读取现有数据
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt_data = json.load(f)
    
    # 清空记忆数组
    prompt_data['memories'] = []
    
    # 保存更新后的数据
    save_prompt_data(prompt_data, prompt_path)

def chat_with_march_seven(user_message):
    """
    与三月七进行对话
    Args:
        user_message (str): 用户输入的消息
    Returns:
        str: 三月七的回复
    """
    try:
        # 确保文件存在
        ensure_data_files()
        
        # 获取当前文件所在目录
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 加载系统提示词
        system_prompt_path = os.path.join(current_dir, '..', 'data', 'system_prompt.json')
        with open(system_prompt_path, 'r', encoding='utf-8') as f:
            prompt_data = json.load(f)
            system_prompt = prompt_data['system_prompt']
        
        # 加载对话历史
        history_path = os.path.join(current_dir, '..', 'data', 'chat_history.json')
        try:
            with open(history_path, 'r', encoding='utf-8') as f:
                history = json.load(f)
        except FileNotFoundError:
            history = []
        
        # 构建消息列表
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # 添加历史对话（最多20条）
        if history:
            messages.extend(history[-20:])
        
        # 添加用户新消息
        messages.append({
            "role": "user",
            "content": f"[开拓者对三月七说]：{user_message}"
        })
        
        # 准备API请求
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        # 发送请求
        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers=headers,
            json=data
        )
        
        # 检查响应状态
        response.raise_for_status()
        
        # 获取回复
        reply = response.json()['choices'][0]['message']['content']
        
        # 更新历史记录
        history.append({
            "role": "user",
            "content": f"[开拓者对三月七说]：{user_message}"
        })
        history.append({
            "role": "assistant",
            "content": reply
        })
        
        # 确保历史不超过20条
        if len(history) > 20:
            history = history[-20:]
        
        # 保存更新后的历史记录
        with open(history_path, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        
        return reply
        
    except Exception as e:
        return f"哎呀，出了点小问题呢: {str(e)}"

def clear_chat_history():
    """
    清空聊天历史
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    history_path = os.path.join(current_dir, '..', 'data', 'chat_history.json')
    
    # 写入空数组
    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)

def main():
    # 示例：清空所有记忆
    clear_memories()
    
    # 示例：添加新记忆
    add_memory(
        "你记得自己是在列车上醒来的，周围都是陌生的面孔。",
        1
    )
    
    # 示例对话
    user_message = "你好，三月七！"
    response = chat_with_march_seven(user_message)
    print(response)

if __name__ == "__main__":
    main() 