import sqlite3
import json

def test_database_queries():
    conn = sqlite3.connect('bakery.db')
    conn.row_factory = sqlite3.Row
    
    print("=== TESTING DATABASE QUERIES ===\n")
    
    # Test 1: Check if tables exist and have data
    print("1. Table row counts:")
    tables = ['bakery_orders', 'sales', 'bakery_products', 'bakery_feedback', 'bakery_inventory']
    for table in tables:
        try:
            result = conn.execute(f"SELECT COUNT(*) as count FROM {table}").fetchone()
            print(f"   {table}: {result['count']} rows")
        except Exception as e:
            print(f"   {table}: ERROR - {e}")
    
    print("\n2. Sales Dashboard - Employee Sales Query:")
    try:
        employees_result = conn.execute("""
            SELECT sold_by_employee_id as employee_name, SUM(total_amount) as sales
            FROM bakery_orders 
            WHERE sold_by_employee_id IS NOT NULL
            GROUP BY sold_by_employee_id
            ORDER BY sales DESC
            LIMIT 5
        """).fetchall()
        
        print(f"   Found {len(employees_result)} employees")
        for row in employees_result:
            print(f"   Employee: {row['employee_name']}, Sales: {row['sales']}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print("\n3. Sales Dashboard - Product Orders Query:")
    try:
        products_result = conn.execute("""
            SELECT s.product_id, COUNT(*) as order_count
            FROM sales s
            GROUP BY s.product_id
            ORDER BY order_count DESC
            LIMIT 5
        """).fetchall()
        
        print(f"   Found {len(products_result)} products")
        for row in products_result:
            print(f"   Product: {row['product_id']}, Orders: {row['order_count']}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print("\n4. CRM Dashboard - Rating Distribution:")
    try:
        ratings_result = conn.execute("""
            SELECT rating, COUNT(*) as count 
            FROM bakery_feedback 
            GROUP BY rating 
            ORDER BY rating
        """).fetchall()
        
        print(f"   Found {len(ratings_result)} rating levels")
        for row in ratings_result:
            print(f"   Rating: {row['rating']}, Count: {row['count']}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print("\n5. Inventory Dashboard - Products with Stock:")
    try:
        inventory_result = conn.execute("""
            SELECT p.ProductName as product_name, p.Category as category, 
                   i.StockLeft as stock_level, p.Price as price
            FROM bakery_products p
            LEFT JOIN bakery_inventory i ON p.ProductID = i.ProductID
            ORDER BY i.StockLeft ASC
            LIMIT 5
        """).fetchall()
        
        print(f"   Found {len(inventory_result)} inventory items")
        for row in inventory_result:
            print(f"   Product: {row['product_name']}, Stock: {row['stock_level']}, Category: {row['category']}")
    except Exception as e:
        print(f"   ERROR: {e}")
    
    conn.close()

if __name__ == "__main__":
    test_database_queries() 