// Calendar Dashboard JavaScript
let calendar;
let dailySalesChart;
let weeklyChart;
let productCategoryChart;
let employeeProductivityChart;
let monthlyTrendsChart;
let shiftDistributionChart;
let currentData = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
});

// Initialize the calendar dashboard
function initializeDashboard() {
    initializeCalendar();
    loadDashboardData();
    
    // Auto-refresh every 5 minutes
    setInterval(loadDashboardData, 300000);
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('refresh-btn').addEventListener('click', loadDashboardData);
    
    // Calendar navigation buttons
    document.getElementById('prev-month').addEventListener('click', () => calendar.prev());
    document.getElementById('next-month').addEventListener('click', () => calendar.next());
    document.getElementById('today-btn').addEventListener('click', () => calendar.today());
    
    // Quick action buttons
    document.getElementById('add-shift-btn').addEventListener('click', showAddShiftModal);
    document.getElementById('manage-staff-btn').addEventListener('click', showManageStaffModal);
    document.getElementById('view-reports-btn').addEventListener('click', showReportsModal);
}

// Initialize FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
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
            showScheduleDetails(info.event);
        },
        dateClick: function(info) {
            // Show day details when clicking on a date
            showDayDetails(info.dateStr);
        },
        events: [], // Will be populated from API
        eventDidMount: function(info) {
            // Add tooltip to events
            info.el.setAttribute('title', 
                `${info.event.title}\n${info.event.extendedProps.shift_type} Shift`
            );
        }
    });
    
    calendar.render();
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        showLoading(true);
        const response = await fetch('/api/calendar-dashboard-data');
        const data = await response.json();
        
        if (response.ok) {
            currentData = data;
            updateDashboard(data);
        } else {
            showError('Failed to load calendar data');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Error connecting to server');
    } finally {
        showLoading(false);
    }
}

// Update dashboard with new data
function updateDashboard(data) {
    // Update date
    document.getElementById('today-date').textContent = data.date;
    
    // Update metric cards
    updateMetricCards(data);
    
    // Update today's summary
    updateTodaySummary(data);
    
    // Update calendar events
    updateCalendarEvents(data.schedule_events);
    
    // Update employee list (top performers)
    updateEmployeeList(data.employees);
    
    // Update upcoming shifts
    updateUpcomingShifts(data.upcoming_shifts);
    
    // Update all charts
    updateDailySalesChart(data.daily_sales);
    updateWeeklyPerformanceChart(data.weekly_performance);
    updateProductCategoryChart(data.product_categories || []);
    updateEmployeeProductivityChart(data.employees || []);
    updateMonthlyTrendsChart(data.monthly_trends || []);
    updateShiftDistributionChart(data.shift_distribution || []);
    
    // Update today's staff count
    updateTodayStaffCount(data);
}

// Update metric cards
function updateMetricCards(data) {
    document.getElementById('total-employees').textContent = data.stats.total_employees || '0';
    document.getElementById('avg-daily-sales').textContent = `$${(data.stats.avg_daily_sales || 0).toLocaleString()}`;
    document.getElementById('scheduled-shifts').textContent = data.stats.total_scheduled_shifts || '0';
}

// Update today's summary section
function updateTodaySummary(data) {
    document.getElementById('today-active-staff').textContent = data.stats.today_active_staff || '0';
    document.getElementById('today-sales').textContent = `$${(data.stats.today_sales || 0).toLocaleString()}`;
    
    // Find next shift
    const nextShift = data.upcoming_shifts && data.upcoming_shifts.length > 0 
        ? data.upcoming_shifts[0] 
        : null;
    
    if (nextShift) {
        const shiftTime = new Date(nextShift.start_time).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
        document.getElementById('next-shift').textContent = `${nextShift.employee_name} at ${shiftTime}`;
    } else {
        document.getElementById('next-shift').textContent = 'No upcoming shifts';
    }
}

// Update upcoming shifts section
function updateUpcomingShifts(shifts) {
    const container = document.getElementById('upcoming-shifts');
    
    if (!shifts || shifts.length === 0) {
        container.innerHTML = '<p class="text-muted small">No upcoming shifts</p>';
        return;
    }
    
    let html = '';
    shifts.slice(0, 5).forEach(shift => {
        const date = new Date(shift.start_time);
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        html += `
            <div class="shift-item mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong class="small">${shift.employee_name}</strong>
                        <div class="text-muted small">${shift.shift_type} Shift</div>
                    </div>
                    <div class="text-end">
                        <div class="small">${dateStr}</div>
                        <div class="text-muted small">${timeStr}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Update weekly performance chart
function updateWeeklyPerformanceChart(weeklyData) {
    const ctx = document.getElementById('weekly-performance-chart').getContext('2d');
    
    if (window.weeklyChart) {
        window.weeklyChart.destroy();
    }
    
    if (!weeklyData || weeklyData.length === 0) {
        // Show "No data" message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No weekly performance data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const labels = weeklyData.map(week => week.week_label);
    const salesData = weeklyData.map(week => week.total_sales);
    const ordersData = weeklyData.map(week => week.total_orders);
    
    window.weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weekly Sales ($)',
                data: salesData,
                backgroundColor: 'rgba(139, 69, 19, 0.7)',
                borderColor: 'rgba(139, 69, 19, 1)',
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'Orders Count',
                data: ordersData,
                type: 'line',
                borderColor: 'rgba(255, 140, 66, 1)',
                backgroundColor: 'rgba(255, 140, 66, 0.2)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Sales ($)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Orders'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Update calendar with schedule events
function updateCalendarEvents(events) {
    if (!calendar || !events) return;
    
    // Remove existing events
    calendar.removeAllEvents();
    
    // Add new events
    events.forEach(event => {
        calendar.addEvent({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.backgroundColor,
            borderColor: event.backgroundColor,
            extendedProps: {
                employee_id: event.employee_id,
                employee_name: event.employee_name,
                shift_type: event.shift_type
            }
        });
    });
}

// Update employee list
function updateEmployeeList(employees) {
    const employeesList = document.getElementById('employees-list');
    
    if (!employees || employees.length === 0) {
        employeesList.innerHTML = '<p class="text-muted small">No employee data available</p>';
        return;
    }
    
    // Sort employees by total sales and take top 3
    employees.sort((a, b) => b.total_sales - a.total_sales);
    const topEmployees = employees.slice(0, 3);
    
    let html = '';
    topEmployees.forEach((employee, index) => {
        const badges = ['🥇', '🥈', '🥉'];
        const badgeColors = ['text-warning', 'text-secondary', 'text-dark'];
        
        html += `
            <div class="employee-item mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="${badgeColors[index]} me-1">${badges[index]}</span>
                        <strong class="small">${employee.name}</strong>
                        <div class="text-muted small">
                            <i class="fas fa-receipt me-1"></i>${employee.total_orders} orders
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold text-success small">$${employee.total_sales.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    employeesList.innerHTML = html;
}

// Update daily sales chart
function updateDailySalesChart(dailySales) {
    const ctx = document.getElementById('daily-sales-chart').getContext('2d');
    
    if (dailySalesChart) {
        dailySalesChart.destroy();
    }
    
    if (!dailySales || dailySales.length === 0) {
        // Show "No data" message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No sales data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    // Prepare chart data
    const labels = dailySales.slice(0, 14).reverse().map(day => {
        const date = new Date(day.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const salesData = dailySales.slice(0, 14).reverse().map(day => day.daily_total);
    const ordersData = dailySales.slice(0, 14).reverse().map(day => day.orders_count);
    
    dailySalesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Sales ($)',
                data: salesData,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Orders Count',
                data: ordersData,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Sales ($)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Orders'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Update today's staff count
function updateTodayStaffCount(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = data.schedule_events.filter(event => 
        event.start.startsWith(today)
    );
    
    const uniqueEmployees = new Set(todayEvents.map(event => event.employee_id));
    document.getElementById('today-staff').textContent = uniqueEmployees.size;
}

// Show schedule details modal
function showScheduleDetails(event) {
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    const detailsContainer = document.getElementById('schedule-details');
    
    const startTime = new Date(event.start).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const endTime = new Date(event.end).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const shiftClass = `shift-${event.extendedProps.shift_type.toLowerCase()}`;
    
    detailsContainer.innerHTML = `
        <div class="schedule-detail-item">
            <h6><i class="fas fa-user me-2"></i>${event.extendedProps.employee_name}</h6>
            <p class="mb-2">
                <i class="fas fa-clock me-2"></i>
                <strong>Time:</strong> ${startTime} - ${endTime}
            </p>
            <p class="mb-2">
                <i class="fas fa-calendar me-2"></i>
                <strong>Date:</strong> ${new Date(event.start).toLocaleDateString()}
            </p>
            <p class="mb-0">
                <i class="fas fa-tag me-2"></i>
                <strong>Shift:</strong> 
                <span class="shift-badge ${shiftClass}">${event.extendedProps.shift_type}</span>
            </p>
        </div>
    `;
    
    modal.show();
}

// Show day details
function showDayDetails(dateStr) {
    if (!currentData) return;
    
    const dayEvents = currentData.schedule_events.filter(event => 
        event.start.startsWith(dateStr)
    );
    
    const daySales = currentData.daily_sales.find(day => day.date === dateStr);
    
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    const detailsContainer = document.getElementById('schedule-details');
    
    let html = `<h6><i class="fas fa-calendar-day me-2"></i>Schedule for ${new Date(dateStr).toLocaleDateString()}</h6>`;
    
    if (daySales) {
        html += `
            <div class="schedule-detail-item">
                <h6><i class="fas fa-chart-line me-2"></i>Sales Summary</h6>
                <p class="mb-1"><strong>Total Sales:</strong> $${daySales.daily_total.toLocaleString()}</p>
                <p class="mb-1"><strong>Orders:</strong> ${daySales.orders_count}</p>
                <p class="mb-0"><strong>Staff Working:</strong> ${daySales.employees_working}</p>
            </div>
        `;
    }
    
    if (dayEvents.length > 0) {
        html += '<h6 class="mt-3"><i class="fas fa-users me-2"></i>Scheduled Staff</h6>';
        dayEvents.forEach(event => {
            const startTime = new Date(event.start).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const endTime = new Date(event.end).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const shiftClass = `shift-${event.shift_type.toLowerCase()}`;
            
            html += `
                <div class="schedule-detail-item">
                    <p class="mb-1"><strong>${event.employee_name}</strong></p>
                    <p class="mb-1">${startTime} - ${endTime}</p>
                    <span class="shift-badge ${shiftClass}">${event.shift_type}</span>
                </div>
            `;
        });
    } else {
        html += '<p class="text-muted">No staff scheduled for this day</p>';
    }
    
    detailsContainer.innerHTML = html;
    modal.show();
}

// Utility functions
function showLoading(show) {
    const dashboard = document.querySelector('.container-fluid');
    if (show) {
        dashboard.classList.add('loading');
    } else {
        dashboard.classList.remove('loading');
    }
}

function showError(message) {
    console.error(message);
    // You could add a toast notification here
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Quick action functions
function showAddShiftModal() {
    alert('Add Shift functionality - This would open a modal to add new shifts');
}

function showManageStaffModal() {
    alert('Manage Staff functionality - This would open a staff management interface');
}

function showReportsModal() {
    alert('View Reports functionality - This would show detailed analytics and reports');
}

// New Chart: Product Categories Pie Chart
function updateProductCategoryChart(categoryData) {
    const ctx = document.getElementById('product-category-chart')?.getContext('2d');
    if (!ctx) return;
    
    if (productCategoryChart) {
        productCategoryChart.destroy();
    }
    
    if (!categoryData || categoryData.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No category data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    
    productCategoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryData.map(cat => cat.category_name),
            datasets: [{
                data: categoryData.map(cat => cat.total_sales),
                backgroundColor: colors.slice(0, categoryData.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// New Chart: Employee Productivity Bar Chart
function updateEmployeeProductivityChart(employees) {
    const ctx = document.getElementById('employee-productivity-chart')?.getContext('2d');
    if (!ctx) return;
    
    if (employeeProductivityChart) {
        employeeProductivityChart.destroy();
    }
    
    if (!employees || employees.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No employee data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    // Sort by productivity and take top 8
    const topEmployees = employees.slice(0, 8);
    
    employeeProductivityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topEmployees.map(emp => emp.name.split(' ')[0]), // First name only
            datasets: [{
                label: 'Sales ($)',
                data: topEmployees.map(emp => emp.total_sales),
                backgroundColor: 'rgba(139, 69, 19, 0.8)',
                borderColor: 'rgba(139, 69, 19, 1)',
                borderWidth: 1
            }, {
                label: 'Orders Count',
                data: topEmployees.map(emp => emp.total_orders),
                backgroundColor: 'rgba(255, 140, 66, 0.8)',
                borderColor: 'rgba(255, 140, 66, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Employees'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// New Chart: Monthly Trends Area Chart
function updateMonthlyTrendsChart(monthlyData) {
    const ctx = document.getElementById('monthly-trends-chart')?.getContext('2d');
    if (!ctx) return;
    
    if (monthlyTrendsChart) {
        monthlyTrendsChart.destroy();
    }
    
    if (!monthlyData || monthlyData.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No monthly data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    monthlyTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.map(month => month.month_label),
            datasets: [{
                label: 'Revenue ($)',
                data: monthlyData.map(month => month.total_revenue),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Orders',
                data: monthlyData.map(month => month.total_orders),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Customers',
                data: monthlyData.map(month => month.unique_customers),
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    });
}

// New Chart: Shift Distribution Donut Chart
function updateShiftDistributionChart(shiftData) {
    const ctx = document.getElementById('shift-distribution-chart')?.getContext('2d');
    if (!ctx) return;
    
    if (shiftDistributionChart) {
        shiftDistributionChart.destroy();
    }
    
    if (!shiftData || shiftData.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No shift data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const shiftColors = {
        'Morning': '#FFD700',
        'Afternoon': '#FF8C00', 
        'Evening': '#FF4500',
        'Night': '#8B0000'
    };
    
    shiftDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: shiftData.map(shift => shift.shift_type),
            datasets: [{
                data: shiftData.map(shift => shift.count),
                backgroundColor: shiftData.map(shift => shiftColors[shift.shift_type] || '#6c757d'),
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} shifts (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
} 