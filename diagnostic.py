import sqlite3
import pandas as pd

def print_db_structure():
    try:
        conn = sqlite3.connect('bakery.db')
        cursor = conn.cursor()
        
        # Get list of all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        print("BAKERY DATABASE STRUCTURE:")
        print("==========================")
        
        for table in tables:
            table_name = table[0]
            print(f"\n\nTABLE: {table_name}")
            print("=" * (len(table_name) + 7))
            
            # Get column info for this table
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            print("\nCOLUMNS:")
            print("-" * 50)
            for col in columns:
                col_id, col_name, col_type, not_null, default_val, pk = col
                pk_str = "PRIMARY KEY" if pk else ""
                print(f"- {col_name} ({col_type}) {pk_str}")
            
            # Count rows in table
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cursor.fetchone()[0]
            print(f"\nTotal rows: {row_count}")
            
            # Get sample data if table has data
            if row_count > 0:
                print("\nSAMPLE DATA (up to 5 rows):")
                print("-" * 50)
                
                # Use pandas for nicer display
                df = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT 5", conn)
                print(df.to_string())
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print_db_structure() 