import sqlite3
import pandas as pd

# Connect to the database
print("Connecting to bakery.db...")
conn = sqlite3.connect('bakery.db')

# Query to get all table names
query = "SELECT name FROM sqlite_master WHERE type='table';"
tables = pd.read_sql_query(query, conn)

if tables.empty:
    print("No tables found in the database.")
else:
    print(f"Found {len(tables)} tables:")
    
    # Iterate through each table
    for table_name in tables['name']:
        print(f"\nTable: {table_name}")
        
        # Get table schema
        schema_query = f"PRAGMA table_info({table_name});"
        schema = pd.read_sql_query(schema_query, conn)
        
        print("Columns:")
        for _, row in schema.iterrows():
            print(f"  {row['name']} ({row['type']})")
        
        # Get row count
        count_query = f"SELECT COUNT(*) as count FROM {table_name};"
        count = pd.read_sql_query(count_query, conn)
        print(f"Row count: {count['count'].iloc[0]}")
        
        # Show sample data (first 3 rows)
        if count['count'].iloc[0] > 0:
            sample_query = f"SELECT * FROM {table_name} LIMIT 3;"
            sample = pd.read_sql_query(sample_query, conn)
            print("Sample data:")
            print(sample)

conn.close()
print("\nDatabase inspection complete.") 