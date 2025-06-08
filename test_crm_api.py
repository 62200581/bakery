import requests
import json

def test_crm_api():
    try:
        # Test the CRM API endpoint
        response = requests.get('http://127.0.0.1:8080/api/crm-dashboard-data')
        
        if response.status_code == 200:
            data = response.json()
            print("CRM API Response Status: SUCCESS")
            print("\n=== CRM METRICS ===")
            print(f"Repeat Customers: {data['context']['repeat_customers']['count']}")
            print(f"Average Rating: {data['context']['average_rating']}")
            print(f"Pending Orders: {data['context']['pending_orders']['pending']}")
            print(f"Top Selling Product: {data['context']['top_selling_product']['name']}")
            
            print("\n=== RATING DISTRIBUTION ===")
            if data['main_charts']['rating_counts']:
                for rating, count in data['main_charts']['rating_counts'].items():
                    print(f"Rating {rating}: {count} feedback entries")
            else:
                print("No rating data")
            
            print("\n=== SENTIMENT ANALYSIS ===")
            sentiment = data['main_charts']['sentiment']
            print(f"Positive: {sentiment['positive']}")
            print(f"Neutral: {sentiment['neutral']}")
            print(f"Negative: {sentiment['negative']}")
                
        else:
            print(f"CRM API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error testing CRM API: {e}")
        print("Make sure the Flask app is running on http://127.0.0.1:8080")

if __name__ == "__main__":
    test_crm_api() 