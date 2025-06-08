import requests
import json

def test_dashboard_api():
    try:
        # Test the dashboard API endpoint
        response = requests.get('http://127.0.0.1:8080/api/dashboard-data')
        
        if response.status_code == 200:
            data = response.json()
            print("API Response Status: SUCCESS")
            print("\n--- KPI Data ---")
            print(f"Orders Count: {data['kpi']['orders_count']}")
            print(f"Total Sales: {data['kpi']['total_sales']}")
            print(f"Products Count: {data['kpi']['products_count']}")
            print(f"Staff Count: {data['kpi']['staff_count']}")
            
            print("\n--- Employee Sales ---")
            if data['employee_sales']:
                for emp in data['employee_sales']:
                    print(f"{emp['employee']}: ${emp['sales']}")
            else:
                print("No employee sales data")
            
            print("\n--- Recent Orders ---")
            if data['recent_orders']:
                for order in data['recent_orders'][:3]:  # Show first 3
                    print(f"Order {order['id']}: {order['customer_name']} - ${order['amount']} - {order['employee_id']} - {order['timestamp']}")
            else:
                print("No recent orders data")
                
        else:
            print(f"API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error testing API: {e}")
        print("Make sure the Flask app is running on http://127.0.0.1:8080")

if __name__ == "__main__":
    test_dashboard_api() 