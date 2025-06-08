import sqlite3

def check_all_tables():
    conn = sqlite3.connect('bakery.db')
    cursor = conn.cursor()
    
    print("🔍 CHECKING ALL TABLES IN BAKERY DATABASE")
    print("=" * 50)
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]
    
    print(f"📊 TOTAL TABLES FOUND: {len(tables)}")
    print("\n📋 TABLE LIST:")
    for i, table in enumerate(tables, 1):
        print(f"  {i}. {table}")
    
    print("\n" + "=" * 50)
    
    # Check structure of each table
    for table_name in tables:
        print(f"\n🗂️  TABLE: {table_name.upper()}")
        print("-" * 30)
        
        # Get table structure
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        print("📋 COLUMNS:")
        for col in columns:
            col_name = col[1]
            col_type = col[2]
            is_pk = " (PRIMARY KEY)" if col[5] else ""
            not_null = " NOT NULL" if col[3] else ""
            print(f"  • {col_name}: {col_type}{is_pk}{not_null}")
        
        # Get row count
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"📊 TOTAL RECORDS: {count}")
        except Exception as e:
            print(f"❌ Error counting records: {e}")
        
        # Show sample data
        try:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            sample_data = cursor.fetchall()
            if sample_data:
                print("📄 SAMPLE DATA:")
                for row in sample_data:
                    print(f"  {row}")
            else:
                print("📄 NO DATA FOUND")
        except Exception as e:
            print(f"❌ Error getting sample data: {e}")
    
    conn.close()
    print("\n✅ DATABASE CHECK COMPLETE!")

if __name__ == "__main__":
    check_all_tables() 