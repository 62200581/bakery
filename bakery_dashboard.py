import dash
from dash import dcc, html, dash_table
from dash.dependencies import Input, Output
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import sqlite3
from datetime import datetime, date
import dash_bootstrap_components as dbc

# Initialize the Dash app with a Bootstrap theme
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])

# Function to get data from database
def get_data(query):
    conn = sqlite3.connect('bakery.db')
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

# Get today's date
today = date.today().strftime("%Y-%m-%d")

# Dashboard layout
app.layout = html.Div([
    # Header
    dbc.Row([
        dbc.Col([
            html.H1("Bakery Sales Dashboard", className="text-center mb-4", 
                   style={"color": "#5C4033", "font-weight": "bold"}),
            html.H4(f"Today's Date: {today}", className="text-center mb-4")
        ])
    ]),
    
    # Context KPIs
    dbc.Row([
        # Orders Today
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Orders Today", className="text-white bg-primary"),
                dbc.CardBody([
                    html.H3(id="orders-today", className="card-title text-center"),
                    html.P("Number of orders placed today", className="card-text text-center")
                ])
            ], className="mb-4 h-100")
        ], width=3),
        
        # Products on Sale
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Products on Sale", className="text-white bg-success"),
                dbc.CardBody([
                    html.H3(id="products-count", className="card-title text-center"),
                    html.P("Total products available today", className="card-text text-center")
                ])
            ], className="mb-4 h-100")
        ], width=3),
        
        # Staff Working Today
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Staff Today", className="text-white bg-warning"),
                dbc.CardBody([
                    html.H3(id="staff-count", className="card-title text-center"),
                    html.P("Number of staff members working today", className="card-text text-center")
                ])
            ], className="mb-4 h-100")
        ], width=3),
        
        # Total Sales Today
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Total Sales Today", className="text-white bg-info"),
                dbc.CardBody([
                    html.H3(id="total-sales", className="card-title text-center"),
                    html.P("Total sales amount for today", className="card-text text-center")
                ])
            ], className="mb-4 h-100")
        ], width=3)
    ]),
    
    # Main Charts
    dbc.Row([
        # Employee Sales Chart
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Employee Sales Performance Today"),
                dbc.CardBody([
                    dcc.Graph(id="employee-sales-chart")
                ])
            ], className="mb-4 h-100")
        ], width=6),
        
        # Product Category vs Order Count
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Product Categories Ordered Today"),
                dbc.CardBody([
                    dcc.Graph(id="product-category-chart")
                ])
            ], className="mb-4 h-100")
        ], width=6)
    ]),
    
    # Orders Table
    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Today's Orders"),
                dbc.CardBody([
                    dash_table.DataTable(
                        id="orders-table",
                        style_header={
                            'backgroundColor': '#f8f9fa',
                            'fontWeight': 'bold',
                            'textAlign': 'center'
                        },
                        style_cell={
                            'textAlign': 'left',
                            'padding': '8px'
                        },
                        style_data_conditional=[
                            {
                                'if': {'row_index': 'odd'},
                                'backgroundColor': '#f8f9fa'
                            }
                        ],
                        page_size=10
                    )
                ])
            ], className="mb-4")
        ], width=12)
    ]),
    
    # Refresh interval
    dcc.Interval(
        id='interval-component',
        interval=60*1000,  # Refresh every minute (60 seconds)
        n_intervals=0
    )
])

# Callback to update all components
@app.callback(
    [Output("orders-today", "children"),
     Output("products-count", "children"),
     Output("staff-count", "children"),
     Output("total-sales", "children"),
     Output("employee-sales-chart", "figure"),
     Output("product-category-chart", "figure"),
     Output("orders-table", "data"),
     Output("orders-table", "columns")],
    [Input("interval-component", "n_intervals")]
)
def update_dashboard(n):
    try:
        # Get Orders Count Today
        orders_today_df = get_data(f"""
            SELECT COUNT(DISTINCT order_id) as order_count 
            FROM orders 
            WHERE order_date = '{today}'
        """)
        orders_count = orders_today_df['order_count'].iloc[0] if not orders_today_df.empty else 0
        
        # Get Products Count
        products_df = get_data("""
            SELECT COUNT(*) as product_count 
            FROM (
                SELECT DISTINCT product_id FROM sales
            )
        """)
        products_count = products_df['product_count'].iloc[0] if not products_df.empty else 0
        
        # Get Staff Count
        staff_df = get_data(f"""
            SELECT COUNT(DISTINCT sold_by_employee_id) as staff_count 
            FROM orders 
            WHERE order_date = '{today}'
        """)
        staff_count = staff_df['staff_count'].iloc[0] if not staff_df.empty else 0
        
        # Get Total Sales Today
        sales_df = get_data(f"""
            SELECT SUM(s.total_price) as total_sales
            FROM sales s
            JOIN orders o ON s.order_id = o.order_id
            WHERE o.order_date = '{today}'
        """)
        total_sales = sales_df['total_sales'].iloc[0] if not sales_df.empty and not pd.isna(sales_df['total_sales'].iloc[0]) else 0
        total_sales_formatted = f"${total_sales:.2f}"
        
        # Get Employee Sales Data
        employee_sales_df = get_data(f"""
            SELECT o.sold_by_employee_id as Employee, SUM(s.total_price) as Sales
            FROM orders o
            JOIN sales s ON o.order_id = s.order_id
            WHERE o.order_date = '{today}'
            GROUP BY o.sold_by_employee_id
            ORDER BY Sales DESC
        """)
        
        if employee_sales_df.empty:
            # Sample data if no data exists
            employee_sales_df = pd.DataFrame({
                'Employee': ['Staff1', 'Staff2', 'Staff3', 'Staff4'],
                'Sales': [120.50, 95.25, 150.00, 85.75]
            })
        
        employee_sales_fig = px.bar(
            employee_sales_df, 
            x='Employee', 
            y='Sales',
            title='Employee Sales Performance',
            color='Sales',
            color_continuous_scale='Viridis',
            text_auto='.2f'
        )
        employee_sales_fig.update_layout(
            xaxis_title="Employee ID",
            yaxis_title="Total Sales ($)",
            font=dict(family="Arial", size=12)
        )
        
        # Get Product Category Data
        # Since we don't have product categories in the DB, we'll simulate this
        # In a real scenario, you would join with a products table that has categories
        product_orders_df = get_data(f"""
            SELECT s.product_id, COUNT(*) as OrderCount
            FROM sales s
            JOIN orders o ON s.order_id = o.order_id
            WHERE o.order_date = '{today}'
            GROUP BY s.product_id
            ORDER BY OrderCount DESC
            LIMIT 10
        """)
        
        if product_orders_df.empty:
            # Sample data if no data exists
            product_orders_df = pd.DataFrame({
                'product_id': ['Bread', 'Pastry', 'Cake', 'Cookie', 'Muffin'],
                'OrderCount': [45, 38, 25, 30, 20]
            })
        
        product_category_fig = px.bar(
            product_orders_df, 
            x='product_id', 
            y='OrderCount',
            title='Product Orders Count',
            color='OrderCount',
            color_continuous_scale='Oranges',
            text_auto=True
        )
        product_category_fig.update_layout(
            xaxis_title="Product ID",
            yaxis_title="Number of Orders",
            font=dict(family="Arial", size=12)
        )
        
        # Get Today's Orders
        orders_df = get_data(f"""
            SELECT o.order_id as "Order ID", 
                   o.customer_id as "Customer ID", 
                   o.order_time as "Time", 
                   o.total_amount as "Total Amount",
                   o.sold_by_employee_id as "Staff ID"
            FROM orders o
            WHERE o.order_date = '{today}'
            ORDER BY o.order_time DESC
        """)
        
        if orders_df.empty:
            # Sample data if no data exists
            orders_df = pd.DataFrame({
                'Order ID': ['ORD001', 'ORD002', 'ORD003', 'ORD004', 'ORD005'],
                'Customer ID': ['CUST123', 'CUST456', 'CUST789', 'CUST101', 'CUST202'],
                'Time': ['09:30:00', '10:15:00', '11:20:00', '12:45:00', '14:10:00'],
                'Total Amount': [35.99, 42.50, 28.75, 55.25, 19.99],
                'Staff ID': ['EMP001', 'EMP002', 'EMP001', 'EMP003', 'EMP002']
            })
        
        # Format the orders dataframe for the table
        orders_df['Total Amount'] = orders_df['Total Amount'].apply(lambda x: f"${x:.2f}")
        
        # Create columns for the DataTable
        columns = [{"name": col, "id": col} for col in orders_df.columns]
        data = orders_df.to_dict('records')
        
        return orders_count, products_count, staff_count, total_sales_formatted, employee_sales_fig, product_category_fig, data, columns
    
    except Exception as e:
        print(f"Error updating dashboard: {e}")
        # Return default values in case of error
        default_fig = go.Figure()
        default_fig.add_annotation(text=f"No data available", showarrow=False)
        
        return 0, 0, 0, "$0.00", default_fig, default_fig, [], []

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=8050) 