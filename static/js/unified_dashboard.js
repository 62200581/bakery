// Global chart objects
let employeeSalesChart = null;
let productOrdersChart = null;
let ratingsChart = null;
let sentimentChart = null;
let lowStockChart = null;
let supplierChart = null;

// Dashboard refresh interval (60 seconds)
const REFRESH_INTERVAL = 60 * 1000;

// Format numbers with commas
function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format currency
function formatCurrency(value) {
    return '$' + parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
    });
}

// Load all dashboard data
function loadAllDashboardData() {
    Promise.all([
        fetch('/api/dashboard-data').then(res => res.json()),
        fetch('/api/crm-dashboard-data').then(res => res.json()),
        fetch('/api/inventory-dashboard-data').then(res => res.json())
    ])
    .then(([salesData, crmData, inventoryData]) => {
        updateSalesSection(salesData);
        updateCRMSection(crmData);
        updateInventorySection(inventoryData);
    })
    .catch(error => {
        console.error('Error loading dashboard data:', error);
    });
}

// Update Sales Section
function updateSalesSection(data) {
    document.getElementById('orders-count').textContent = formatNumber(data.kpi.orders_count);
    document.getElementById('total-sales').textContent = formatCurrency(data.kpi.total_sales);
    document.getElementById('products-count').textContent = formatNumber(data.kpi.products_count);
    document.getElementById('staff-count').textContent = formatNumber(data.kpi.staff_count);
    
    // Update employee sales chart
    updateEmployeeSalesChart(data.employee_sales);
    
    // Update product orders chart
    updateProductOrdersChart(data.product_orders);
}

// Update CRM Section
function updateCRMSection(data) {
    document.getElementById('repeat-customers').textContent = formatNumber(data.context.repeat_customers.count);
    document.getElementById('avg-rating').textContent = data.context.average_rating.toFixed(1);
    document.getElementById('pending-orders').textContent = formatNumber(data.context.pending_orders.pending);
    document.getElementById('top-product').textContent = data.context.top_selling_product.name;
    
    // Update charts
    updateRatingsChart(data.main_charts.rating_counts);
    updateSentimentChart(data.main_charts.sentiment);
}

// Update Inventory Section
function updateInventorySection(data) {
    document.getElementById('total-inventory').textContent = formatNumber(data.metrics.total_products);
    document.getElementById('categories-count').textContent = formatNumber(data.metrics.categories_count);
    
    // Count low stock items (stock <= 15)
    const lowStockItems = data.inventory_items.filter(item => item.stock_level <= 15);
    document.getElementById('low-stock-count').textContent = formatNumber(lowStockItems.length);
    
    // Next restock
    if (data.metrics.next_restock) {
        document.getElementById('next-restock').textContent = formatDate(data.metrics.next_restock.date);
    } else {
        document.getElementById('next-restock').textContent = 'All Good';
    }
    
    // Update charts
    updateLowStockChart(data.low_stock_products);
    updateSupplierChart(data.supplier_contributions);
    
    // Update inventory table
    updateInventoryTable(data.inventory_items);
}

// Employee Sales Chart
function updateEmployeeSalesChart(employeeData) {
    const ctx = document.getElementById('employee-sales-chart').getContext('2d');
    
    if (employeeSalesChart) {
        employeeSalesChart.destroy();
    }
    
    employeeSalesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: employeeData.map(emp => emp.employee),
            datasets: [{
                label: 'Sales ($)',
                data: employeeData.map(emp => emp.sales),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Product Orders Chart
function updateProductOrdersChart(productData) {
    const ctx = document.getElementById('product-orders-chart').getContext('2d');
    
    if (productOrdersChart) {
        productOrdersChart.destroy();
    }
    
    productOrdersChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: productData.map(prod => prod.product_id),
            datasets: [{
                data: productData.map(prod => prod.order_count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Ratings Chart
function updateRatingsChart(ratingData) {
    const ctx = document.getElementById('ratings-chart').getContext('2d');
    
    if (ratingsChart) {
        ratingsChart.destroy();
    }
    
    const ratings = Object.keys(ratingData);
    const counts = ratings.map(rating => ratingData[rating]);
    
    ratingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ratings.map(r => `${r} Star${r === '1' ? '' : 's'}`),
            datasets: [{
                label: 'Count',
                data: counts,
                backgroundColor: [
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(253, 126, 20, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(25, 135, 84, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Sentiment Chart
function updateSentimentChart(sentimentData) {
    const ctx = document.getElementById('sentiment-chart').getContext('2d');
    
    if (sentimentChart) {
        sentimentChart.destroy();
    }
    
    sentimentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Low Stock Chart
function updateLowStockChart(lowStockData) {
    const ctx = document.getElementById('low-stock-chart').getContext('2d');
    
    if (lowStockChart) {
        lowStockChart.destroy();
    }
    
    lowStockChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: lowStockData.map(item => item.product_name),
            datasets: [{
                label: 'Stock Level',
                data: lowStockData.map(item => item.stock_level),
                backgroundColor: lowStockData.map(item => {
                    if (item.stock_level <= 5) return 'rgba(220, 53, 69, 0.8)';
                    if (item.stock_level <= 15) return 'rgba(255, 193, 7, 0.8)';
                    return 'rgba(40, 167, 69, 0.8)';
                })
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// Supplier Chart
function updateSupplierChart(supplierData) {
    const ctx = document.getElementById('supplier-chart').getContext('2d');
    
    if (supplierChart) {
        supplierChart.destroy();
    }
    
    supplierChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: supplierData.map(item => item.supplier_name),
            datasets: [{
                data: supplierData.map(item => item.product_count),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Update Inventory Table
function updateInventoryTable(inventoryItems) {
    const tableBody = document.getElementById('inventory-table-body');
    tableBody.innerHTML = '';
    
    // Show only first 10 items to keep table manageable
    const displayItems = inventoryItems.slice(0, 10);
    
    displayItems.forEach(item => {
        const row = document.createElement('tr');
        
        let statusClass = '';
        let statusText = '';
        
        if (item.stock_level <= 5) {
            statusClass = 'tag-low';
            statusText = 'Low';
        } else if (item.stock_level <= 15) {
            statusClass = 'tag-medium';
            statusText = 'Medium';
        } else {
            statusClass = 'tag-good';
            statusText = 'Good';
        }
        
        row.innerHTML = `
            <td><strong>${item.product_name}</strong></td>
            <td>${item.category}</td>
            <td class="text-center">${formatNumber(item.stock_level)}</td>
            <td class="text-end">${formatCurrency(item.price)}</td>
            <td class="text-center">${formatDate(item.restock_date)}</td>
            <td class="text-center"><span class="status-tag ${statusClass}">${statusText}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date();
    document.getElementById('today-date').textContent = today.toISOString().split('T')[0];
    
    // Load initial data
    loadAllDashboardData();
    
    // Set up refresh button
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadAllDashboardData();
        this.classList.add('disabled');
        
        const icon = this.querySelector('i');
        icon.classList.add('fa-spin');
        
        setTimeout(() => {
            this.classList.remove('disabled');
            icon.classList.remove('fa-spin');
        }, 1000);
    });
    
    // Set up automatic refresh
    setInterval(loadAllDashboardData, REFRESH_INTERVAL);
}); 