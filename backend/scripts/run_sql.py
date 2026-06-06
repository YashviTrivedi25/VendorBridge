import asyncio
import asyncpg
import os
import re

async def run_sql():
    sql_path = '../../SQL.txt'
    with open(sql_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.search(r'```sql(.*?)```', content, re.DOTALL)
    if match:
        sql_script = match.group(1).strip()
    else:
        sql_script = content
    
    conn = await asyncpg.connect('postgresql://postgres:Yash2510@localhost:5432/postgres')
    try:
        await conn.execute(sql_script)
        print('SUCCESS: Tables created from SQL.txt!')
    except Exception as e:
        print(f'FAILED: {e}')
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(run_sql())
