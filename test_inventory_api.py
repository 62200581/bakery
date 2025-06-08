import requests
import json

def test_inventory_api():
    try:
        response = requests.get('http://127.0.0.1:8080/api/inventory-dashboard-data')
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response structure:")
            print(f"Keys: {list(data.keys())}")
            
            # Check metrics
            if 'metrics' in data:
                print(f"\nMetrics: {data['metrics']}")
            
            # Check inventory items
            if 'inventory_items' in data:
                print(f"\nInventory items count: {len(data['inventory_items'])}")
                if data['inventory_items']:
                    print(f"Sample item: {data['inventory_items'][0]}")
            
            # Check low stock products
            if 'low_stock_products' in data:
                print(f"\nLow stock products count: {len(data['low_stock_products'])}")
                if data['low_stock_products']:
                    print(f"Sample low stock: {data['low_stock_products'][0]}")
            
            # Check supplier contributions
            if 'supplier_contributions' in data:
                print(f"\nSupplier contributions count: {len(data['supplier_contributions'])}")
                if data['supplier_contributions']:
                    print(f"Sample supplier: {data['supplier_contributions'][0]}")
            
            # Print full response for debugging
            print(f"\nFull response:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_inventory_api() 