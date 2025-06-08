import sqlite3
import os

print("Current working directory:", os.getcwd())
print("Files in current directory:", os.listdir("."))

db_path = 'bakery.db'
print(f"Checking if {db_path} exists:", os.path.exists(db_path))

if not os.path.exists(db_path):
    print(f"Error: {db_path} database file not found!")
else:
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get a list of all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("\nTables in bakery.db:")
        if tables:
            for table in tables:
                print(f"- {table[0]}")
                
                # Get schema for each table
                cursor.execute(f"PRAGMA table_info({table[0]})")
                columns = cursor.fetchall()
                print(f"  Columns in {table[0]}:")
                for col in columns:
                    print(f"    {col[1]} ({col[2]})")
                
                # Get row count for each table
                cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
                count = cursor.fetchone()[0]
                print(f"  Row count: {count}")
                print()
        else:
            print("No tables found in the database.")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
    except Exception as e:
        print(f"Error: {e}") 