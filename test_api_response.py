import requests
import json

def test_api_endpoints():
    base_url = "http://127.0.0.1:8080"
    
    print("=== TESTING API ENDPOINTS ===\n")
    
    endpoints = [
        ("/api/dashboard-data", "Sales Dashboard"),
        ("/api/crm-dashboard-data", "CRM Dashboard"), 
        ("/api/inventory-dashboard-data", "Inventory Dashboard")
    ]
    
    for endpoint, name in endpoints:
        print(f"Testing {name} ({endpoint}):")
        try:
            response = requests.get(f"{base_url}{endpoint}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Response keys: {list(data.keys())}")
                
                # Print specific details for each endpoint
                if "dashboard-data" in endpoint:
                    if 'employee_sales' in data:
                        print(f"   Employee sales count: {len(data['employee_sales'])}")
                        if data['employee_sales']:
                            print(f"   Sample employee: {data['employee_sales'][0]}")
                    
                    if 'product_orders' in data:
                        print(f"   Product orders count: {len(data['product_orders'])}")
                        if data['product_orders']:
                            print(f"   Sample product: {data['product_orders'][0]}")
                
                elif "crm-dashboard" in endpoint:
                    if 'main_charts' in data:
                        print(f"   Rating counts: {data['main_charts'].get('rating_counts', {})}")
                    
                elif "inventory-dashboard" in endpoint:
                    if 'inventory_items' in data:
                        print(f"   Inventory items count: {len(data['inventory_items'])}")
                        if data['inventory_items']:
                            print(f"   Sample item: {data['inventory_items'][0]}")
                
            else:
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"   Connection Error: {e}")
        
        print()

if __name__ == "__main__":
    test_api_endpoints() 