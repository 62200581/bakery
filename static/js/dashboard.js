// Creative Bakery Dashboard JavaScript - Enhanced Version

// Global chart objects
let employeeSalesChart = null;
let productChart = null;
let salesCalendar = null;

// Bakery color scheme
const BAKERY_COLORS = {
    primary: ['#8B4513', '#D2691E', '#FFB347', '#FF8C42', '#DEB887'],
    gradients: [
        'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
        'linear-gradient(135deg, #D2691E 0%, #FFB347 100%)',
        'linear-gradient(135deg, #FFB347 0%, #FF8C42 100%)',
        'linear-gradient(135deg, #FF8C42 0%, #DEB887 100%)',
        'linear-gradient(135deg, #DEB887 0%, #F5E6D3 100%)'
    ],
    backgrounds: [
        'rgba(139, 69, 19, 0.8)',
        'rgba(210, 105, 30, 0.8)',
        'rgba(255, 179, 71, 0.8)',
        'rgba(255, 140, 66, 0.8)',
        'rgba(222, 184, 135, 0.8)'
    ]
};

// Load dashboard data with enhanced animations
function loadDashboardData() {
    // Add loading animation to refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    const originalContent = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<div class="loading"></div> Loading...';
    refreshBtn.disabled = true;

    fetch('/api/dashboard-data')
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data); // Debug log
            updateDashboard(data);
            
            // Success animation
            refreshBtn.classList.add('success-animation');
            setTimeout(() => {
                refreshBtn.classList.remove('success-animation');
                refreshBtn.innerHTML = originalContent;
                refreshBtn.disabled = false;
            }, 600);
        })
        .catch(error => {
            console.error('Error:', error);
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
            
            // Show error with creative notification
            showCreativeNotification('Failed to load data. Please try again.', 'error');
        });
}

// Creative notification system
function showCreativeNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `creative-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'linear-gradient(135deg, #dc3545, #c82333)' : 'linear-gradient(135deg, #28a745, #218838)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.5s ease-out;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => document.body.removeChild(notification), 500);
    }, 3000);
}

// Update dashboard with enhanced animations
function updateDashboard(data) {
    document.getElementById('today-date').textContent = data.date;
    
    // Animate KPI updates with stagger effect
    animateKPIUpdate('orders-count', data.kpi.orders_count || 0, '', 0);
    animateKPIUpdate('total-sales', data.kpi.total_sales || 0, '$', 200);
    animateKPIUpdate('products-count', data.kpi.products_count || 0, '', 400);
    animateKPIUpdate('staff-count', data.kpi.staff_count || 0, '', 600);
    
    // Update calendar and summary
    updateSalesCalendar(data.calendar_events || []);
    updateTodaySummary(data);
    updateWeeklyGoals(data);
    
    // Update charts with delays for visual appeal
    setTimeout(() => createEmployeeChart(data.employee_sales), 800);
    setTimeout(() => createProductChart(data.product_orders), 1000);
    setTimeout(() => updateRecentOrdersTable(data.recent_orders), 1200);
}

// Animated KPI update function
function animateKPIUpdate(elementId, value, prefix = '', delay = 0) {
    setTimeout(() => {
        const element = document.getElementById(elementId);
        const iconElement = element.querySelector('i');
        
        // Add pulse animation to icon
        if (iconElement) {
            iconElement.style.animation = 'pulse 0.6s ease-out';
        }
        
        // Animate the number counting up
        animateCountUp(element, value, prefix);
        
        // Handle zero value styling
        const card = element.closest('.metric-card');
        if (value === 0) {
            card.style.opacity = '0.7';
            card.title = 'No data available';
        } else {
            card.style.opacity = '1';
            card.title = '';
        }
    }, delay);
}

// Count up animation for numbers
function animateCountUp(element, targetValue, prefix = '') {
    const currentValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const increment = Math.ceil((targetValue - currentValue) / 20);
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        
        const icon = element.querySelector('i');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        
        if (prefix === '$') {
            element.innerHTML = iconHTML + prefix + current.toLocaleString();
        } else {
            element.innerHTML = iconHTML + current;
        }
    }, 50);
}

// Enhanced Employee Sales Chart with bakery theme
function createEmployeeChart(employeeData) {
    const ctx = document.getElementById('employee-sales-chart').getContext('2d');
    
    if (employeeSalesChart) {
        employeeSalesChart.destroy();
    }
    
    if (!employeeData || employeeData.length === 0) {
        drawNoDataMessage(ctx, 'No employee sales data available', '👥');
        return;
    }
    
    const labels = employeeData.map(item => item.employee);
    const data = employeeData.map(item => item.sales);
    
    employeeSalesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales ($)',
                data: data,
                backgroundColor: BAKERY_COLORS.backgrounds,
                borderColor: BAKERY_COLORS.primary,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeOutBounce'
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Poppins',
                            weight: '500'
                        },
                        color: '#5D4037'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(139, 69, 19, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: 'Poppins'
                        },
                        color: '#5D4037'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(139, 69, 19, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: 'Poppins'
                        },
                        color: '#5D4037'
                    }
                }
            }
        }
    });
}

// Enhanced Product Orders Chart with creative styling
function createProductChart(productData) {
    const ctx = document.getElementById('product-orders-chart').getContext('2d');
    
    if (productChart) {
        productChart.destroy();
    }
    
    if (!productData || productData.length === 0) {
        drawNoDataMessage(ctx, 'No product order data available', '🍰');
        return;
    }
    
    const labels = productData.map(item => item.product_id);
    const data = productData.map(item => item.order_count);
    
    productChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: BAKERY_COLORS.backgrounds,
                borderColor: BAKERY_COLORS.primary,
                borderWidth: 3,
                hoverBorderWidth: 5,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 2000
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Poppins',
                            weight: '500'
                        },
                        color: '#5D4037',
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Creative "No Data" message drawing
function drawNoDataMessage(ctx, message, emoji) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
    gradient.addColorStop(0, 'rgba(255, 248, 220, 0.3)');
    gradient.addColorStop(1, 'rgba(245, 230, 211, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw emoji
    ctx.fillStyle = '#DEB887';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);
    
    // Draw message
    ctx.fillStyle = '#8B4513';
    ctx.font = '16px Poppins, Arial, sans-serif';
    ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
}

// Enhanced Recent Orders Table with animations
function updateRecentOrdersTable(orders) {
    const tableBody = document.getElementById('orders-table-body');
    
    if (!tableBody) {
        console.error('Orders table body not found');
        return;
    }
    
    // Clear existing rows with fade out
    const existingRows = tableBody.querySelectorAll('tr');
    existingRows.forEach((row, index) => {
        setTimeout(() => {
            row.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (row.parentNode) row.parentNode.removeChild(row);
            }, 300);
        }, index * 50);
    });
    
    // Add new rows with stagger animation
    setTimeout(() => {
        if (!orders || orders.length === 0) {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-coffee me-2"></i>
                    No recent orders available
                </td>
            `;
            row.style.animation = 'fadeIn 0.5s ease-out';
            return;
        }
        
        orders.forEach((order, index) => {
            setTimeout(() => {
                const row = tableBody.insertRow();
                
                // Format timestamp properly
                let timeDisplay = 'Invalid Date';
                if (order.timestamp) {
                    try {
                        const date = new Date(order.timestamp);
                        if (!isNaN(date.getTime())) {
                            timeDisplay = date.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                        }
                    } catch (e) {
                        console.log('Error formatting timestamp:', order.timestamp);
                        timeDisplay = order.timestamp || 'Unknown';
                    }
                }
                
                // Format amount properly
                let amountDisplay = '$0.00';
                if (order.amount !== undefined && order.amount !== null) {
                    try {
                        const amount = parseFloat(order.amount);
                        if (!isNaN(amount)) {
                            amountDisplay = '$' + amount.toFixed(2);
                        }
                    } catch (e) {
                        console.log('Error formatting amount:', order.amount);
                        amountDisplay = '$' + (order.amount || '0.00');
                    }
                }
                
                row.innerHTML = `
                    <td><strong>#${order.id || 'N/A'}</strong></td>
                    <td>${order.customer_name || 'Unknown'}</td>
                    <td>${timeDisplay}</td>
                    <td><span class="badge bg-success">${amountDisplay}</span></td>
                    <td><i class="fas fa-user-circle me-1"></i>${order.employee_id || 'N/A'}</td>
                `;
                row.style.animation = 'fadeInUp 0.5s ease-out';
                row.style.animationDelay = `${index * 0.1}s`;
                
                // Add hover effect
                row.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.02)';
                    this.style.transition = 'transform 0.2s ease';
                });
                
                row.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            }, index * 100);
        });
    }, 400);
}

// Initialize dashboard with creative loading
document.addEventListener('DOMContentLoaded', function() {
    // Add creative CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        
        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            0% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Initial load with welcome animation
    showCreativeNotification('Welcome to Sweet Dreams Bakery Dashboard! 🍰', 'info');
    loadDashboardData();
    initializeSalesCalendar();
    
    // Enhanced refresh button
    document.getElementById('refresh-btn').addEventListener('click', loadDashboardData);
    
    // Calendar navigation buttons
    document.getElementById('prev-month')?.addEventListener('click', () => salesCalendar?.prev());
    document.getElementById('next-month')?.addEventListener('click', () => salesCalendar?.next());
    document.getElementById('today-btn')?.addEventListener('click', () => salesCalendar?.today());
    
    // Auto-refresh with visual indicator
    setInterval(() => {
        console.log('Auto-refreshing dashboard...');
        loadDashboardData();
    }, 60000); // Refresh every minute
});

// Initialize Sales Calendar
function initializeSalesCalendar() {
    const calendarEl = document.getElementById('sales-calendar');
    if (!calendarEl) return;
    
    salesCalendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: '',
            center: 'title',
            right: ''
        },
        height: 'auto',
        eventDisplay: 'block',
        dayMaxEvents: 3,
        moreLinkClick: 'popover',
        eventClick: function(info) {
            showSalesDetails(info.event);
        },
        dateClick: function(info) {
            showDaySalesDetails(info.dateStr);
        },
        events: [],
        eventDidMount: function(info) {
            info.el.setAttribute('title', 
                `${info.event.title}\n$${info.event.extendedProps.amount || '0'}`
            );
        }
    });
    
    salesCalendar.render();
}

// Update Sales Calendar
function updateSalesCalendar(events) {
    if (!salesCalendar || !events) return;
    
    // Remove existing events
    salesCalendar.removeAllEvents();
    
    // Add new events
    events.forEach(event => {
        salesCalendar.addEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.backgroundColor || '#28a745',
            borderColor: event.backgroundColor || '#28a745',
            extendedProps: {
                amount: event.amount,
                orders_count: event.orders_count,
                products: event.products
            }
        });
    });
}

// Update Today's Summary
function updateTodaySummary(data) {
    document.getElementById('today-revenue').textContent = `$${(data.today_revenue || 0).toLocaleString()}`;
    document.getElementById('today-orders').textContent = data.today_orders || '0';
    document.getElementById('top-product-today').textContent = data.top_product_today || '-';
}

// Update Weekly Goals
function updateWeeklyGoals(data) {
    const salesProgress = Math.min(((data.weekly_sales || 0) / (data.weekly_sales_target || 1)) * 100, 100);
    const ordersProgress = Math.min(((data.weekly_orders || 0) / (data.weekly_orders_target || 1)) * 100, 100);
    
    document.getElementById('sales-progress-text').textContent = `${Math.round(salesProgress)}%`;
    document.getElementById('sales-progress-bar').style.width = `${salesProgress}%`;
    
    document.getElementById('orders-progress-text').textContent = `${Math.round(ordersProgress)}%`;
    document.getElementById('orders-progress-bar').style.width = `${ordersProgress}%`;
}

// Show Sales Details Modal
function showSalesDetails(event) {
    const modal = new bootstrap.Modal(document.getElementById('salesModal'));
    const detailsContainer = document.getElementById('sales-details');
    
    const startTime = new Date(event.start).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    detailsContainer.innerHTML = `
        <div class="sales-detail-item">
            <h6><i class="fas fa-calendar-day me-2"></i>${event.title}</h6>
            <p class="mb-2">
                <i class="fas fa-clock me-2"></i>
                <strong>Time:</strong> ${startTime}
            </p>
            <p class="mb-2">
                <i class="fas fa-calendar me-2"></i>
                <strong>Date:</strong> ${new Date(event.start).toLocaleDateString()}
            </p>
            <p class="mb-2">
                <i class="fas fa-dollar-sign me-2"></i>
                <strong>Revenue:</strong> $${(event.extendedProps.amount || 0).toLocaleString()}
            </p>
            <p class="mb-0">
                <i class="fas fa-shopping-cart me-2"></i>
                <strong>Orders:</strong> ${event.extendedProps.orders_count || 0}
            </p>
        </div>
    `;
    
    modal.show();
}

// Show Day Sales Details
function showDaySalesDetails(dateStr) {
    const modal = new bootstrap.Modal(document.getElementById('salesModal'));
    const detailsContainer = document.getElementById('sales-details');
    
    // This would need to fetch day-specific data from the API
    detailsContainer.innerHTML = `
        <div class="sales-detail-item">
            <h6><i class="fas fa-calendar-day me-2"></i>Sales for ${new Date(dateStr).toLocaleDateString()}</h6>
            <p class="text-muted">Detailed sales data would be loaded here...</p>
            <div class="text-center mt-3">
                <button class="btn btn-primary btn-sm">View Full Report</button>
            </div>
        </div>
    `;
    
    modal.show();
} 