import pandas as pd
from openpyxl import load_workbook
import os
from datetime import datetime

def add_sales_to_excel():
    """Add sales data to an Excel file"""
    excel_file = 'new_bakery_sales.xlsx'  # Use a different filename
    sheet_name = 'bakery_sales'  
    
    # Current timestamp
    now = datetime.now()
    today = now.strftime('%Y-%m-%d')
    
    # Create new sales data
    new_sales_data = {
        'SaleID': [f'S{now.strftime("%y%m%d")}001', f'S{now.strftime("%y%m%d")}002', f'S{now.strftime("%y%m%d")}003'],
        'OrderID': ['ORD001', 'ORD002', 'ORD003'],
        'ProductID': ['P101', 'P102', 'P103'],
        'Quantity': [3, 2, 5],
        'TotalPrice': [14.97, 9.98, 24.95]
    }
    
    new_sales_df = pd.DataFrame(new_sales_data)
    
    # Create a new Excel file
    print(f"Creating Excel file: {excel_file}")
    new_sales_df.to_excel(excel_file, sheet_name=sheet_name, index=False)
    print(f"Created file with {len(new_sales_df)} sales records in '{sheet_name}' sheet")
    print("Sales data added successfully")

if __name__ == "__main__":
    add_sales_to_excel() 