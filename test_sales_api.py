import requests
import json

def test_sales_api():
    try:
        response = requests.get('http://127.0.0.1:8080/api/dashboard-data')
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n=== SALES API RESPONSE ===")
            print(f"Date: {data.get('date')}")
            print(f"KPI: {data.get('kpi')}")
            print(f"Employee Sales: {data.get('employee_sales')}")
            print(f"Product Orders: {data.get('product_orders')}")
        else:
            print("Error:", response.text)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_sales_api() 