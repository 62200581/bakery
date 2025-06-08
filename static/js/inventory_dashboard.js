// Global chart objects
let lowStockChart = null;
let supplierChart = null;

// Dashboard refresh interval (60 seconds)
const REFRESH_INTERVAL = 60 * 1000;

// Format numbers with commas for thousands
function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format numbers as currency
function formatCurrency(value) {
    return '$' + parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date as MM/DD/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric' 
    });
}

// Load dashboard data from API
function loadDashboardData() {
    fetch('/api/inventory-dashboard-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update dashboard with the retrieved data
            updateDashboard(data);
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
}

// Update the dashboard with new data
function updateDashboard(data) {
    // Update date
    document.getElementById('today-date').textContent = data.date;
    
    // Update context metrics with better handling for zero values
    updateTotalProducts(data.metrics.total_products, data.metrics.categories_count);
    updateLowStockCount(data.low_stock_products);
    updateNextRestock(data.metrics.next_restock);
    
    // Update charts
    updateLowStockChart(data.low_stock_products);
    updateSupplierChart(data.supplier_contributions);
    
    // Update inventory table
    updateInventoryTable(data.inventory_items);
}

// Update the total products card
function updateTotalProducts(totalCount, categoriesCount) {
    const totalElement = document.getElementById('total-products-count');
    const categoriesElement = document.getElementById('categories-count');
    
    totalElement.textContent = formatNumber(totalCount || 0);
    categoriesElement.textContent = formatNumber(categoriesCount || 0);
    
    // Apply styling for zero values
    if (totalCount === 0) {
        totalElement.parentNode.style.opacity = '0.6';
        totalElement.parentNode.title = 'No products data available';
    } else {
        totalElement.parentNode.style.opacity = '1';
        totalElement.parentNode.title = '';
    }
    
    if (categoriesCount === 0) {
        categoriesElement.parentNode.style.opacity = '0.6';
        categoriesElement.parentNode.title = 'No categories data available';
    } else {
        categoriesElement.parentNode.style.opacity = '1';
        categoriesElement.parentNode.title = '';
    }
}

// Update the low stock count card
function updateLowStockCount(lowStockProducts) {
    const lowStockElement = document.getElementById('low-stock-count');
    const lowStockCount = lowStockProducts ? lowStockProducts.length : 0;
    
    lowStockElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${formatNumber(lowStockCount)}`;
    
    // Apply styling based on count
    const cardElement = lowStockElement.closest('.metric-card');
    if (lowStockCount === 0) {
        cardElement.style.opacity = '1';
        cardElement.title = 'All products have adequate stock levels';
        cardElement.classList.add('stock-good');
        cardElement.classList.remove('stock-warning', 'stock-critical');
    } else if (lowStockCount <= 5) {
        cardElement.style.opacity = '1';
        cardElement.title = `${lowStockCount} products need restocking`;
        cardElement.classList.add('stock-warning');
        cardElement.classList.remove('stock-good', 'stock-critical');
    } else {
        cardElement.style.opacity = '1';
        cardElement.title = `${lowStockCount} products are running low`;
        cardElement.classList.add('stock-critical');
        cardElement.classList.remove('stock-good', 'stock-warning');
    }
}

// Update the next restock card
function updateNextRestock(nextRestock) {
    const dateElement = document.getElementById('next-restock-date');
    const productElement = document.getElementById('restock-product');
    const cardElement = productElement.closest('.metric-card');
    
    if (nextRestock && nextRestock.date !== 'No data available' && nextRestock.date !== 'No upcoming restocks') {
        // Format the product name for better display
        const productName = nextRestock.product_name.length > 15 
            ? nextRestock.product_name.substring(0, 15) + '...' 
            : nextRestock.product_name;
        
        productElement.innerHTML = `<i class="fas fa-box"></i> ${productName}`;
        dateElement.textContent = formatDate(nextRestock.date);
        
        // Remove opacity and add success styling
        cardElement.style.opacity = '1';
        cardElement.title = `Next restock: ${nextRestock.product_name} on ${formatDate(nextRestock.date)}`;
    } else {
        productElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> No Data`;
        dateElement.textContent = 'No upcoming restocks';
        
        // Add reduced opacity for no data state
        cardElement.style.opacity = '0.7';
        cardElement.title = 'No restock data available';
    }
}

// Update the low stock products chart
function updateLowStockChart(lowStockProducts) {
    const ctx = document.getElementById('low-stock-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (lowStockChart) {
        lowStockChart.destroy();
    }
    
    // Check if data is empty
    if (!lowStockProducts || lowStockProducts.length === 0) {
        // Display "No data" message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No low stock products data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    // Extract data for the chart
    const labels = lowStockProducts.map(item => item.product_name);
    const data = lowStockProducts.map(item => item.stock_level);
    const backgroundColors = lowStockProducts.map(item => {
        if (item.stock_level <= 5) return 'rgba(220, 53, 69, 0.7)'; // Red for very low
        if (item.stock_level <= 15) return 'rgba(255, 193, 7, 0.7)'; // Yellow for medium low
        return 'rgba(40, 167, 69, 0.7)'; // Green for adequate
    });
    
    // Create new chart
    lowStockChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Level',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Stock: ${context.raw} units`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Units in Stock'
                    }
                },
                y: {
                    title: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update the supplier contribution chart
function updateSupplierChart(supplierData) {
    const ctx = document.getElementById('supplier-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (supplierChart) {
        supplierChart.destroy();
    }
    
    // Check if data is empty
    if (!supplierData || supplierData.length === 0) {
        // Display "No data" message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No supplier data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    // Extract data for the chart
    const labels = supplierData.map(item => item.supplier_name);
    const data = supplierData.map(item => item.product_count);
    
    // Generate a color palette for the chart
    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(210, 102, 255, 0.7)'
    ];
    
    // Create new chart
    supplierChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, data.length),
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')).slice(0, data.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} products (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update the inventory table
function updateInventoryTable(inventoryItems) {
    const tableBody = document.querySelector('#inventory-table tbody');
    
    if (!tableBody) {
        console.error('Inventory table body not found');
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (!inventoryItems || inventoryItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-info-circle me-2"></i>
                    No inventory data available
                </td>
            </tr>`;
        return;
    }
    
    inventoryItems.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Determine stock status
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
            <td><strong>${item.product_name || 'N/A'}</strong></td>
            <td>${item.category || 'N/A'}</td>
            <td class="text-center">${formatNumber(item.stock_level || 0)}</td>
            <td class="text-end">${formatCurrency(item.price || 0)}</td>
            <td class="text-center">${formatDate(item.restock_date || '')}</td>
            <td>${item.supplier_name || 'Unknown Supplier'}</td>
            <td class="text-center"><span class="status-tag ${statusClass}">${statusText}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Enable search functionality
    setupTableSearch();
}

// Setup table search functionality
function setupTableSearch() {
    const searchInput = document.getElementById('inventory-search');
    
    searchInput.addEventListener('keyup', function() {
        const searchText = this.value.toLowerCase();
        const tableRows = document.querySelectorAll('#inventory-table tbody tr');
        
        tableRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            if (rowText.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date();
    document.getElementById('today-date').textContent = today.toISOString().split('T')[0];
    
    // Load initial data
    loadDashboardData();
    
    // Set up refresh button
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadDashboardData();
        this.classList.add('disabled');
        
        // Show a refreshing animation
        const icon = this.querySelector('i');
        icon.classList.add('fa-spin');
        
        // Re-enable after 1 second
        setTimeout(() => {
            this.classList.remove('disabled');
            icon.classList.remove('fa-spin');
        }, 1000);
    });
    
    // Set up automatic refresh
    setInterval(loadDashboardData, REFRESH_INTERVAL);
}); 