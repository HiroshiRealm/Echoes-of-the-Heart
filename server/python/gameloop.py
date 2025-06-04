import asyncio
from memory_points_service import check_all_memory_points
from chat_service import add_memory, chat_with_march_seven

async def process_dialogue(current_dialogue):
    """
    处理用户对话，检查记忆点，添加新记忆，获取回复
    Args:
        current_dialogue (str): 用户当前对话内容
    Returns:
        str: 三月七的回复
    """
    # 检查记忆点触发状态
    memory_points = await check_all_memory_points(current_dialogue)
    
    # 添加触发的记忆
    for point in memory_points:
        if point['isTriggered']:
            add_memory(point['content'], point['id'])
    
    # 获取三月七的回复
    reply = chat_with_march_seven(current_dialogue)
    
    return reply

def main():
    # 示例使用
    user_message = "你好，三月七！"
    reply = asyncio.run(process_dialogue(user_message))
    print(reply)

if __name__ == "__main__":
    main()
