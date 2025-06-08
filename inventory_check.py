import sqlite3
import pandas as pd

def check_inventory_relationships():
    try:
        conn = sqlite3.connect('bakery.db')
        
        # Get products data
        print("PRODUCT DATA:")
        print("=============")
        products_df = pd.read_sql_query("SELECT * FROM bakery_products LIMIT 10", conn)
        print(products_df)
        print("\n")
        
        # Get inventory data
        print("INVENTORY DATA:")
        print("===============")
        inventory_df = pd.read_sql_query("SELECT * FROM bakery_inventory LIMIT 10", conn)
        print(inventory_df)
        print("\n")
        
        # Get supplier data
        print("SUPPLIER DATA:")
        print("==============")
        supplier_df = pd.read_sql_query("SELECT * FROM bakery_suppliers LIMIT 10", conn)
        print(supplier_df)
        print("\n")
        
        # Try to join inventory and products
        print("INVENTORY WITH PRODUCT NAMES:")
        print("=============================")
        inventory_products_df = pd.read_sql_query("""
            SELECT i.InventoryID, i.ProductID, p.ProductName, p.Category, p.Price, 
                   i.StockLeft, i.RestockDate
            FROM bakery_inventory i
            JOIN bakery_products p ON i.ProductID = p.ProductID
            LIMIT 10
        """, conn)
        print(inventory_products_df)
        print("\n")
        
        # Try to join inventory, products, and suppliers
        print("PRODUCTS WITH SUPPLIER INFO:")
        print("============================")
        try:
            # First check if there's a direct relationship between products and suppliers
            product_supplier_df = pd.read_sql_query("""
                SELECT p.ProductID, p.ProductName, s.SupplierID, s.Name as SupplierName, s.ProductSupplied
                FROM bakery_products p
                JOIN bakery_suppliers s ON p.ProductName LIKE '%' || s.ProductSupplied || '%'
                LIMIT 10
            """, conn)
            print(product_supplier_df)
        except Exception as e:
            print(f"Could not join products and suppliers directly: {e}")
            print("No direct relationship between products and suppliers found in schema.")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_inventory_relationships() 