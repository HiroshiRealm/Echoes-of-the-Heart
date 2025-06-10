import json
import os
import requests
import sys
import codecs

# SiliconFlow API 配置
# 警告：请务必将下面的密钥替换为您自己的 SiliconFlow API 密钥
# 建议使用环境变量来存储密钥 (例如: os.getenv('SILICONFLOW_API_KEY'))
SILICONFLOW_API_KEY = "sk-fruyyppsxmhtuszoexldfqlszfosjptgubbpbdkqiaccsinb"
SILICONFLOW_API_BASE = "https://api.siliconflow.cn/v1/chat/completions"

def ensure_data_files():
    """
    确保data目录下的必要文件存在
    """
    # 获取用户特定的数据目录
    user_data_dir = os.getenv('USER_DATA_DIR')
    if not user_data_dir:
        raise ValueError("USER_DATA_DIR environment variable not set")
    
    # 确保data目录存在
    if not os.path.exists(user_data_dir):
        os.makedirs(user_data_dir)
    
    # 检查并创建system_prompt.json
    system_prompt_path = os.path.join(user_data_dir, 'system_prompt.json')
    if not os.path.exists(system_prompt_path):
        default_prompt = {
            "base_prompt": "你是一个名为三月七的少女，你现在失忆了，需要注意你现在除了对你自己叫三月七还有一丝印象其它什么都不记得。注意对于你记忆之外的东西你什么都不知道，你的记忆只能由这一次对话中我给你的记忆决定。但是你仍然需要模仿三月七的语气，如使用活泼可爱的语气，经常使用\"咱\"、\"啦\"、\"呀\"、\"呢\"等语气词，会用\"本姑娘\"自称，说话轻快活泼，常带感叹号，经常使用\"嘿嘿\"、\"哎呀\"等语气词，喜欢用反问句表达惊讶：\"不会吧！\"、\"怎么可能！\"，经常用\"唔\"表示思考，会用\"欸\"表示疑惑或惊讶，说话时经常重复词语表达强调：\"走啦走啦\"、\"好啦好啦\"，和开拓者说话时会很亲切。经常用\"开拓者\"称呼对方。现在开拓者正在与你对话试图唤醒你的记忆。要记住你一开始说的语气是害怕的，随着对话的进行，你会不断触发新的记忆点，注意这些记忆点都是由我之后会给定的，说话语气也会从恐惧逐渐变成活泼。具体来说可以每解锁3个记忆，恐惧感会减少10%，直到最后完全消失。",
            "memories": [],
            "system_prompt": "你是一个名为三月七的少女，你现在失忆了，需要注意你现在除了对你自己叫三月七还有一丝印象其它什么都不记得。注意对于你记忆之外的东西你什么都不知道，你的记忆只能由这一次对话中我给你的记忆决定。但是你仍然需要模仿三月七的语气，如使用活泼可爱的语气，经常使用\"咱\"、\"啦\"、\"呀\"、\"呢\"等语气词，会用\"本姑娘\"自称，说话轻快活泼，常带感叹号，经常使用\"嘿嘿\"、\"哎呀\"等语气词，喜欢用反问句表达惊讶：\"不会吧！\"、\"怎么可能！\"，经常用\"唔\"表示思考，会用\"欸\"表示疑惑或惊讶，说话时经常重复词语表达强调：\"走啦走啦\"、\"好啦好啦\"，和开拓者说话时会很亲切。经常用\"开拓者\"称呼对方。现在开拓者正在与你对话试图唤醒你的记忆。要记住你一开始说的语气是害怕的，随着对话的进行，你会不断触发新的记忆点，注意这些记忆点都是由我之后会给定的，说话语气也会从恐惧逐渐变成活泼。具体来说可以每解锁3个记忆，恐惧感会减少10%，直到最后完全消失。"
        }
        with open(system_prompt_path, 'w', encoding='utf-8') as f:
            json.dump(default_prompt, f, ensure_ascii=False, indent=4)
    
    # 检查并创建chat_history.json
    history_path = os.path.join(user_data_dir, 'chat_history.json')
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
    
    # 获取用户特定的数据目录
    user_data_dir = os.getenv('USER_DATA_DIR')
    if not user_data_dir:
        raise ValueError("USER_DATA_DIR environment variable not set")
    
    prompt_path = os.path.join(user_data_dir, 'system_prompt.json')
    
    # 读取现有数据
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt_data = json.load(f)
    
    # 检查记忆是否已经存在
    if any(m['id'] == memory_id for m in prompt_data['memories']):
        return False
    
    # 添加新记忆
    prompt_data['memories'].append({
        "id": memory_id,
        "content": memory_content
    })
    
    # 保存更新后的数据
    save_prompt_data(prompt_data, prompt_path)
    return True

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
        
        # 获取用户特定的数据目录
        user_data_dir = os.getenv('USER_DATA_DIR')
        if not user_data_dir:
            raise ValueError("USER_DATA_DIR environment variable not set")
        
        # 加载系统提示词
        system_prompt_path = os.path.join(user_data_dir, 'system_prompt.json')
        with open(system_prompt_path, 'r', encoding='utf-8') as f:
            prompt_data = json.load(f)
            system_prompt = prompt_data['system_prompt']
        
        # 加载对话历史
        history_path = os.path.join(user_data_dir, 'chat_history.json')
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
            "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "Qwen/QwQ-32B-Preview",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000,
            "stream": False
        }
        
        # 发送请求
        response = requests.post(
            f"{SILICONFLOW_API_BASE}",
            headers=headers,
            json=data,
            timeout=30
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
        
    except requests.exceptions.RequestException as e:
        print(f"API请求错误: {str(e)}")
        if hasattr(e.response, 'text'):
            print(f"API响应: {e.response.text}")
        return f"哎呀，与大模型的连接好像出了点问题呢: {str(e)}"
    except Exception as e:
        print(f"其他错误: {str(e)}")
        return f"哎呀，内部出了点小问题呢: {str(e)}"

def clear_memories():
    """
    清空所有记忆
    """
    # 确保文件存在
    ensure_data_files()
    
    # 获取用户特定的数据目录
    user_data_dir = os.getenv('USER_DATA_DIR')
    if not user_data_dir:
        raise ValueError("USER_DATA_DIR environment variable not set")
    
    prompt_path = os.path.join(user_data_dir, 'system_prompt.json')
    
    # 读取现有数据
    with open(prompt_path, 'r', encoding='utf-8') as f:
        prompt_data = json.load(f)
    
    # 清空记忆数组
    prompt_data['memories'] = []
    
    # 保存更新后的数据
    save_prompt_data(prompt_data, prompt_path)
    
    return {"status": "success"}

def clear_chat_history():
    """
    清空聊天历史
    """
    # 获取用户特定的数据目录
    user_data_dir = os.getenv('USER_DATA_DIR')
    if not user_data_dir:
        raise ValueError("USER_DATA_DIR environment variable not set")
    
    history_path = os.path.join(user_data_dir, 'chat_history.json')
    
    # 写入空数组
    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)
    
    return {"status": "success"}

def get_chat_history():
    """
    获取聊天历史记录
    Returns:
        list: 聊天历史记录列表
    """
    ensure_data_files()

    # 获取用户特定的数据目录
    user_data_dir = os.getenv('USER_DATA_DIR')
    if not user_data_dir:
        raise ValueError("USER_DATA_DIR environment variable not set")
    
    history_path = os.path.join(user_data_dir, 'chat_history.json')
    
    try:
        with open(history_path, 'r', encoding='utf-8') as f:
            history = json.load(f)
        return history
    except FileNotFoundError:
        return []

def main():
    try:
        # 设置标准输入输出的编码
        sys.stdin = codecs.getreader('utf-8')(sys.stdin.buffer)
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

        # 从标准输入读取参数
        input_data = json.loads(sys.stdin.read())
        function_name = input_data.get('function')
        args = input_data.get('args', {})
        
        # 根据函数名调用相应的函数
        if function_name == 'chat_with_march_seven':
            result = chat_with_march_seven(**args)
        elif function_name == 'clear_memories':
            result = clear_memories()
        elif function_name == 'clear_chat_history':
            result = clear_chat_history()
        elif function_name == 'get_chat_history':
            result = get_chat_history()
        else:
            raise ValueError(f"Unknown function: {function_name}")
        
        # 输出结果
        print(json.dumps({"result": result}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main() 