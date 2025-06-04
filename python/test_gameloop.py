import asyncio
from memory_points_service import check_all_memory_points, get_all_memory_points
from chat_service import add_memory, chat_with_march_seven, clear_memories, clear_chat_history

async def run_game_loop():
    # 初始化游戏状态
    activated_memories = set()
    total_memories = len(get_all_memory_points())
    
    # 清空之前的记忆和聊天历史
    clear_memories()
    clear_chat_history()
    
    print("欢迎来到记忆唤醒游戏！")
    print("请与三月七对话，帮助她找回记忆。")
    print("当所有9个记忆点都被激活时，游戏就会结束。")
    print("输入 'quit' 退出游戏。\n")
    
    while True:
        # 获取用户输入
        user_input = input("请输入你想对三月七说的话: ")
        
        if user_input.lower() == 'quit':
            print("游戏结束！")
            break
        
        # 检查记忆点
        memory_points = await check_all_memory_points(user_input)
        
        # 处理触发的记忆点
        for point in memory_points:
            if point['isTriggered'] and point['id'] not in activated_memories:
                print(f"\n[记忆被唤醒] {point['title']}")
                add_memory(point['content'], point['id'])
                activated_memories.add(point['id'])
        
        # 获取三月七的回复
        reply = chat_with_march_seven(user_input)
        print(f"\n三月七: {reply}\n")
        
        # 检查是否所有记忆都已激活
        if len(activated_memories) == total_memories:
            print("\n恭喜！你已经成功唤醒了三月七的所有记忆！")
            print("游戏胜利！")
            break
        
        # 显示当前进度
        print(f"当前已激活记忆: {len(activated_memories)}/{total_memories}")

def main():
    asyncio.run(run_game_loop())

if __name__ == "__main__":
    main()
