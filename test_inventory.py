import requests

# Test if the inventory route is working
try:
    response = requests.get("http://localhost:8080/inventory")
    
    print(f"Status code: {response.status_code}")
    if response.status_code == 200:
        print("Inventory route is working!")
        print("First 200 characters of response:")
        print(response.text[:200])
    else:
        print("Error accessing inventory route")
        print("Response text:")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")

# Also test the API endpoint
try:
    api_response = requests.get("http://localhost:8080/api/inventory-dashboard-data")
    
    print("\nAPI Status code:", api_response.status_code)
    if api_response.status_code == 200:
        print("API endpoint is working!")
        data = api_response.json()
        print("API returned data with these keys:", list(data.keys()))
    else:
        print("Error accessing API endpoint")
except Exception as e:
    print(f"API Error: {e}") 