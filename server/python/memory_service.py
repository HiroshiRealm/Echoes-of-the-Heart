import aiohttp
import json
import sys
import asyncio
import os
import time
import random
import codecs
from chat_service import add_memory

# 预设记忆点
PRESET_MEMORY_POINTS = [
    {
        "id": 1,
        "title": "星穹列车的伙伴丹恒",
        "content": "丹恒清冷寡言的少年，持有名为「击云」的长枪，于列车漫长的开拓之旅中担任护卫，同时也是智库的管理员。他前世为罗浮龙尊丹枫，尊号饮月君。他个性认真，对时不时会乱来的三月七和开拓者来说是非常值得信赖的存在。三月七、开拓者、丹恒的三人小队已经历经过众多冒险，踏足过许多星球，如雅利洛六号、仙舟、匹诺康尼等。",
        "triggerCondition": "当对话内容提到丹恒、龙尊、饮月君等关键词时触发"
    },
    {
        "id": 2,
        "title": "星穹列车的家长姬子",
        "content": "姬子是个充满冒险精神的科学家，少女时代在故乡遭遇了搁浅的星穹列车。彼时，列车内的某种存在向她展示了身处的星球之外，名为「宇宙」的世界。若干年后，当姬子终于修复列车驶入群星时，她意识到这只是个开始。身为星穹列车的领航员，姬子特别关心三月七、开拓者、丹恒的安危，是个妈妈一样的存在，不过她冲的咖啡喝不了一点。",
        "triggerCondition": "当对话内容提到姬子、列车领航员等关键词时触发"
    },
    {
        "id": 3,
        "title": "星穹列车的家长瓦尔特",
        "content": "瓦尔特是老成持重的前逆熵盟主，继承了「世界」之名，曾屡次拯救世界于灭亡的边缘。星穹列车的小辈们，比如三月七、开拓者、丹恒都称他为杨叔。他遇事沉着冷静，值得信赖。",
        "triggerCondition": "当对话内容提到瓦尔特、杨叔等关键词时触发"
    },
    {
        "id": 4,
        "title": "空间站的BOSS末日兽",
        "content": "开拓者和三月七一起旅途的第一站就是黑塔空间站。在这里他们共同迎战了BOSS末日兽，那是由「反物质军团」以黄昏古兽的残片为基「战争熔炉」的万骸哀怨为引所铸炼而成的。在末日兽来临时，开拓者还受到了毁灭星神纳努克的瞥视，最终和三月七、丹恒、姬子一起击败了末日兽。",
        "triggerCondition": "当对话内容提到空间站的冒险经历、末日兽等关键词时触发"
    },
    {
        "id": 5,
        "title": "仙舟罗浮的将军景元",
        "content": "景元是位列帝弓七天将之一的「神策将军」，外表懒散、心思缜密。不以危局中力挽狂澜为智策，因此在常事上十分下功夫，以免节外生枝。因其细心谋划，仙舟承平日久，看似行事慵懒的景元反被送上绰号「闭目将军」。在仙舟的冒险中，三月七与开拓者也受到过将军的接待。",
        "triggerCondition": "当对话内容提到仙舟的将军、景元等关键词时触发"
    },
    {
        "id": 6,
        "title": "仙舟罗浮的BOSS幻胧",
        "content": "幻胧是反物质军团的绝灭大君，是自建木中生成的躯壳。兼具「毁灭」与「丰饶」之力，生灭循环的肉体。也是建木复生后结出的第一颗「果实」。她在现出真身之前曾附身在停云小姐的身上，并和我们有一段冒险的同行。并且最后停云的歪头杀的场景还是很吓人的。",
        "triggerCondition": "当对话内容提到仙舟的冒险经历、幻胧、停云等关键词时触发"
    },
    {
        "id": 7,
        "title": "匹诺康尼",
        "content": "匹诺康尼，位于阿斯德纳星系，是著名的盛会之星。现实中的匹诺康尼是一座悬于银河的星际酒店，你可以在这里办理入住，进入客房休息。而入睡后，你才会见到「匹诺康尼」真实的样子——一座金碧辉煌的欢乐之都。列车组的成员在这里历经了一次惊心动魄的冒险，邂逅了寰宇间许多人物，也体会到了梦想之地纸醉金迷的生活。",
        "triggerCondition": "当对话内容提到匹诺康尼、盛会之星、谐乐大典等关键词时触发"
    },
    {
        "id": 8,
        "title": "虚无令使黄泉",
        "content": "黄泉是我们在匹诺康尼冒险中结识的朋友之一，她一开始自称「巡海游侠」的旅人，本名不详，身佩一柄长刀，独行银河。后来我们在她一刀将砂金斩进虚无之后，我们才见识到她的真正实力。",
        "triggerCondition": "当对话内容提到黄泉、虚无令使等关键词时触发"
    },
    {
        "id": 9,
        "title": "匹诺康尼BOSS神主日",
        "content": "「齐响诗班」众愿之多米尼克斯，是为「同谐」希佩的众相化身之一，因「秩序」的干扰展现出不同以往的面貌，又叫神主日，是我们在匹诺康尼冒险的最终大BOSS。",
        "triggerCondition": "当对话内容提到匹诺康尼最终BOSS、神主日、齐响诗班等关键词时触发"
    }
]

# DeepSeek API 配置
API_KEY = "sk-efe8817f744e417db101bd37c46fa3c4"
API_URL = "https://api.deepseek.com/v1/chat/completions"

def get_memory_point_by_id(memory_point_id):
    """根据ID获取记忆点"""
    for point in PRESET_MEMORY_POINTS:
        if point["id"] == memory_point_id:
            return point
    return None

async def check_memory_point_trigger(memory_point, current_dialogue, chat_history):
    """检查记忆点是否应该被触发"""
    # 构建提示词
    # 将聊天历史转换为字符串
    chat_history_text = " ".join([msg["content"] for msg in chat_history])
    
    # 添加时间戳和随机数来防止 API 记忆
    timestamp = int(time.time())
    random_num = random.randint(1000, 9999)
    
    prompt = f"""
请分析以下对话内容，判断是否满足记忆点"{memory_point['title']}"的触发条件。
时间戳：{timestamp}-{random_num}

记忆点描述：{memory_point['content']}
触发条件：{memory_point['triggerCondition']}

当前对话：{current_dialogue}
历史对话：{chat_history_text}

请只回答"是"或"否"，判断这段对话是否满足触发条件。
"""

    # 准备请求数据
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": f"你是一个专门用于判断游戏记忆点是否触发的助手。你只需要回答'是'或'否'。当前时间戳：{timestamp}-{random_num}"
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.1,
        "max_tokens": 10,
        "stream": False
    }

    try:
        # 每次调用都创建新的 session
        async with aiohttp.ClientSession() as session:
            async with session.post(API_URL, headers=headers, json=data) as response:
                response.raise_for_status()
                result = await response.json()
                answer = result["choices"][0]["message"]["content"].strip().lower()
                print(f"[DEBUG] 记忆点ID: {memory_point['id']}, 标题: {memory_point['title']}, 触发结果: {answer}", file=sys.stderr)
                return answer == "是"
    except Exception as e:
        print(f"[ERROR] 检查记忆点触发时出错 (ID: {memory_point['id']}): {str(e)}", file=sys.stderr)
        return False

async def check_all_memory_points(current_dialogue):
    """
    检查所有记忆点的触发状态
    Args:
        current_dialogue (str): 当前对话内容
    Returns:
        list: 记忆点触发状态列表
    """
    try:
        print(f"[DEBUG] 开始检查记忆点，当前对话: {current_dialogue}", file=sys.stderr)
        
        # 获取用户特定的数据目录
        user_data_dir = os.getenv('USER_DATA_DIR')
        if not user_data_dir:
            raise ValueError("USER_DATA_DIR environment variable not set")
        
        history_path = os.path.join(user_data_dir, 'chat_history.json')
        
        # 读取对话历史
        try:
            with open(history_path, 'r', encoding='utf-8') as f:
                chat_history = json.load(f)
        except FileNotFoundError:
            chat_history = []
        
        # 创建所有记忆点的检查任务
        tasks = [
            check_memory_point_trigger(point, current_dialogue, chat_history)
            for point in PRESET_MEMORY_POINTS
        ]
        
        # 并发执行所有任务
        triggered_results = await asyncio.gather(*tasks)
        
        # 组合结果
        results = []
        for point, is_triggered in zip(PRESET_MEMORY_POINTS, triggered_results):
            results.append({
                "id": point["id"],
                "title": point["title"],
                "content": point["content"],
                "triggerCondition": point["triggerCondition"],
                "isTriggered": is_triggered
            })

        # 过滤掉 add_memory 返回 False 的记忆点
        results = [point for point in results if not point['isTriggered'] or add_memory(point['content'], point['id'])]
        
        # print(f"[DEBUG] 记忆点检查完成，触发数量: {sum(1 for r in results if r['isTriggered'])}", file=sys.stderr)
        return results
    except Exception as e:
        print(f"[ERROR] 检查记忆点时出错: {str(e)}", file=sys.stderr)
        return []

def get_all_memory_points():
    """获取所有预设记忆点"""
    return PRESET_MEMORY_POINTS 

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
        if function_name == 'check_all_memory_points':
            # 运行异步函数
            result = asyncio.run(check_all_memory_points(args.get('current_dialogue', '')))
        elif function_name == 'get_all_memory_points':
            result = get_all_memory_points()
        else:
            raise ValueError(f"Unknown function: {function_name}")
        
        # 输出结果
        print(json.dumps({"result": result}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main() 