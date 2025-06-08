from flask import Flask, render_template, jsonify
import sqlite3
import pandas as pd
import numpy as np
from datetime import date, datetime
import random

app = Flask(__name__)

# Function to get data from database
def get_data(query):
    conn = sqlite3.connect('bakery.db')
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

@app.route('/')
def index():
    return render_template('crm_dashboard.html')

@app.route('/api/crm-dashboard-data')
def crm_dashboard_data():
    # Get today's date
    today = date.today().strftime("%Y-%m-%d")
    
    try:
        # Generate sample data since we don't have actual CRM data
        # In a real application, these would be fetched from the database
        
        # Context metrics
        repeat_customers = {
            "count": random.randint(80, 120),
            "total_customers": random.randint(200, 250),
            "percentage": random.uniform(0.3, 0.5)  # 30-50% repeat rate
        }
        
        low_stock_products = {
            "count": random.randint(5, 15),
            "total_products": random.randint(50, 100),
            "percentage": random.uniform(0.1, 0.3)  # 10-30% low stock
        }
        
        pending_orders = {
            "pending": random.randint(10, 30),
            "completed": random.randint(70, 120),
            "total": 0  # Will be calculated
        }
        pending_orders["total"] = pending_orders["pending"] + pending_orders["completed"]
        
        # Generate top selling products
        top_products = [
            {"name": "Chocolate Croissant", "sales": random.randint(150, 300), "revenue": random.uniform(500, 1200)},
            {"name": "Sourdough Bread", "sales": random.randint(100, 200), "revenue": random.uniform(400, 800)},
            {"name": "Blueberry Muffin", "sales": random.randint(80, 150), "revenue": random.uniform(300, 600)},
            {"name": "Almond Danish", "sales": random.randint(60, 120), "revenue": random.uniform(240, 480)},
            {"name": "Cinnamon Roll", "sales": random.randint(40, 100), "revenue": random.uniform(160, 400)}
        ]
        
        # Sort top products by sales
        top_products = sorted(top_products, key=lambda x: x["sales"], reverse=True)
        top_selling_product = top_products[0]
        
        # Customer ratings
        average_rating = round(random.uniform(3.8, 4.9), 1)
        rating_counts = {
            "1": random.randint(0, 5),
            "2": random.randint(2, 10),
            "3": random.randint(5, 20),
            "4": random.randint(20, 50),
            "5": random.randint(30, 80)
        }
        
        # Calculate total ratings
        total_ratings = sum(rating_counts.values())
        
        # Feedback sentiment
        sentiment = {
            "positive": random.randint(60, 85),
            "neutral": random.randint(10, 30),
            "negative": random.randint(1, 10)
        }
        
        # Adjust to ensure they sum to 100%
        total_sentiment = sum(sentiment.values())
        sentiment = {k: round((v / total_sentiment) * 100) for k, v in sentiment.items()}
        
        # Hourly orders data (from 7 AM to 7 PM - typical bakery hours)
        hours = list(range(7, 20))  # 7 AM to 7 PM
        hourly_orders = []
        
        # Create a realistic order pattern with morning and lunch peaks
        for hour in hours:
            if hour < 9:  # Early morning (moderate)
                count = random.randint(10, 25)
            elif 9 <= hour < 11:  # Morning peak
                count = random.randint(30, 50)
            elif 11 <= hour < 14:  # Lunch peak
                count = random.randint(40, 70)
            elif 14 <= hour < 17:  # Afternoon (moderate)
                count = random.randint(15, 30)
            else:  # Evening (lower)
                count = random.randint(5, 20)
                
            hourly_orders.append({
                "hour": f"{hour}:00",
                "count": count
            })
        
        # Product sales detail table
        product_sales = []
        product_names = [
            "Chocolate Croissant", "Sourdough Bread", "Blueberry Muffin", 
            "Almond Danish", "Cinnamon Roll", "Plain Bagel", "French Baguette",
            "Strawberry Tart", "Apple Turnover", "Chocolate Chip Cookie",
            "Carrot Cake", "Cheese Danish", "Pumpkin Bread", "Rye Bread"
        ]
        
        for product in product_names:
            quantity = random.randint(10, 200)
            price = random.uniform(2.5, 12.99)
            revenue = round(quantity * price, 2)
            stock_left = random.randint(0, 50)
            
            product_sales.append({
                "product": product,
                "quantity": quantity,
                "price": price,
                "revenue": revenue,
                "stock_left": stock_left
            })
        
        # Sort product sales by revenue (highest first)
        product_sales = sorted(product_sales, key=lambda x: x["revenue"], reverse=True)
        
        # Prepare the response
        response = {
            "date": today,
            "context": {
                "repeat_customers": repeat_customers,
                "low_stock_products": low_stock_products,
                "pending_orders": pending_orders,
                "top_selling_product": top_selling_product,
                "average_rating": average_rating
            },
            "main_charts": {
                "hourly_orders": hourly_orders,
                "rating_counts": rating_counts,
                "sentiment": sentiment
            },
            "product_sales": product_sales
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"CRM Dashboard data error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8090) 