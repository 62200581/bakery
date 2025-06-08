import sqlite3

conn = sqlite3.connect('bakery.db')
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
tables = [row[0] for row in cursor.fetchall()]

print(f"TOTAL TABLES: {len(tables)}")
print("\nTABLE LIST:")
for i, table in enumerate(tables, 1):
    print(f"{i}. {table}")

conn.close() 