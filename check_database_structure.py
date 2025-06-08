import sqlite3

def check_database():
    conn = sqlite3.connect('bakery.db')
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("=== DATABASE STRUCTURE ANALYSIS ===\n")
    
    for table in tables:
        table_name = table[0]
        print(f"Table: {table_name}")
        print("-" * 50)
        
        # Get table structure
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        print("Columns:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"Row count: {count}")
        
        # Get sample data (first 2 rows)
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 2")
        sample_data = cursor.fetchall()
        
        if sample_data:
            print("Sample data:")
            for i, row in enumerate(sample_data):
                print(f"  Row {i+1}: {row}")
        
        print("\n")
    
    conn.close()

if __name__ == "__main__":
    check_database() 