import sqlite3

def check_database():
    conn = sqlite3.connect('bakery.db')
    cursor = conn.cursor()
    
    # Check all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print("Tables in database:", tables)
    
    # Check for employee-related data
    print("\n--- Employee Data ---")
    try:
        cursor.execute("SELECT DISTINCT sold_by_employee_id FROM bakery_orders LIMIT 10")
        employee_ids = [row[0] for row in cursor.fetchall()]
        print("Employee IDs:", employee_ids)
    except Exception as e:
        print(f"Error getting employee IDs: {e}")
    
    # Check if there's an employees table
    if 'employees' in tables or 'bakery_employees' in tables:
        table_name = 'employees' if 'employees' in tables else 'bakery_employees'
        print(f"\n--- {table_name} table ---")
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
        employees = cursor.fetchall()
        print("Sample employees:")
        for emp in employees:
            print(emp)
    
    # Test the actual orders query
    print("\n--- Testing Orders Query ---")
    try:
        cursor.execute("""
            SELECT o.order_id, c.name, o.order_date, o.order_time, o.total_amount, o.sold_by_employee_id
            FROM bakery_orders o
            JOIN bakery_customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_date DESC, o.order_time DESC
            LIMIT 3
        """)
        orders = cursor.fetchall()
        for order in orders:
            print(order)
    except Exception as e:
        print(f"Error in orders query: {e}")
    
    conn.close()

if __name__ == "__main__":
    check_database() 