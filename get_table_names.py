import sqlite3

conn = sqlite3.connect('bakery.db')
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
tables = [row[0] for row in cursor.fetchall()]

print("ALL 9 TABLES:")
for i, table in enumerate(tables, 1):
    print(f"{i}. {table}")
    
    # Get basic column info
    cursor.execute(f"PRAGMA table_info({table})")
    columns = cursor.fetchall()
    print(f"   Columns: {len(columns)}")
    for col in columns[:3]:  # Show first 3 columns
        print(f"   - {col[1]} ({col[2]})")
    if len(columns) > 3:
        print(f"   - ... and {len(columns)-3} more")
    print()

conn.close() 