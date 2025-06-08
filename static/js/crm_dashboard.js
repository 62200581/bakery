// Simple CRM Dashboard JavaScript - Clean Version

// Global chart objects
let ratingsChart = null;
let sentimentChart = null;

// Load dashboard data
function loadDashboardData() {
    fetch('/api/crm-dashboard-data')
        .then(response => response.json())
        .then(data => {
            console.log('CRM Data received:', data); // Debug log
            updateDashboard(data);
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
}

// Update dashboard with data
function updateDashboard(data) {
    // Update date
    document.getElementById('today-date').textContent = data.date;
    
    // Update metric cards with better handling for zero values
    
    // Repeat customers
    const repeatElement = document.getElementById('repeat-customers');
    repeatElement.textContent = data.context.repeat_customers.count || '0';
    if (data.context.repeat_customers.count === 0) {
        repeatElement.parentNode.style.opacity = '0.6';
        repeatElement.parentNode.title = 'No repeat customers data available';
    } else {
        repeatElement.parentNode.style.opacity = '1';
        repeatElement.parentNode.title = '';
    }
    
    // Average rating
    const ratingElement = document.getElementById('avg-rating');
    ratingElement.textContent = data.context.average_rating ? data.context.average_rating.toFixed(1) : '0.0';
    if (data.context.average_rating === 0) {
        ratingElement.parentNode.style.opacity = '0.6';
        ratingElement.parentNode.title = 'No rating data available';
    } else {
        ratingElement.parentNode.style.opacity = '1';
        ratingElement.parentNode.title = '';
    }
    
    // Pending orders
    const pendingElement = document.getElementById('pending-orders');
    pendingElement.textContent = data.context.pending_orders.pending || '0';
    if (data.context.pending_orders.pending === 0) {
        pendingElement.parentNode.style.opacity = '0.6';
        pendingElement.parentNode.title = 'No pending orders data available';
    } else {
        pendingElement.parentNode.style.opacity = '1';
        pendingElement.parentNode.title = '';
    }
    
    // Top product
    const productElement = document.getElementById('top-product');
    productElement.textContent = data.context.top_selling_product.name || 'No data available';
    if (data.context.top_selling_product.name === 'No data available' || data.context.top_selling_product.name === 'No data') {
        productElement.parentNode.style.opacity = '0.6';
        productElement.parentNode.title = 'No product data available';
    } else {
        productElement.parentNode.style.opacity = '1';
        productElement.parentNode.title = '';
    }
    
    // Update charts
    createRatingsChart(data.main_charts.rating_counts);
    createSentimentChart(data.main_charts.sentiment);
}

// Create Customer Ratings Chart
function createRatingsChart(ratingCounts) {
    const ctx = document.getElementById('ratings-chart').getContext('2d');
    
    if (ratingsChart) {
        ratingsChart.destroy();
    }
    
    // Check if data is empty
    if (!ratingCounts || Object.keys(ratingCounts).length === 0) {
        // Display "No data" message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No customer ratings data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const labels = Object.keys(ratingCounts).map(star => star + ' Stars');
    const data = Object.values(ratingCounts);
    
    ratingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Ratings',
                data: data,
                backgroundColor: [
                    'rgba(220, 53, 69, 0.8)',   // 1 star - red
                    'rgba(253, 126, 20, 0.8)',  // 2 stars - orange
                    'rgba(255, 193, 7, 0.8)',   // 3 stars - yellow
                    'rgba(40, 167, 69, 0.8)',   // 4 stars - light green
                    'rgba(25, 135, 84, 0.8)'    // 5 stars - green
                ],
                borderColor: [
                    'rgba(220, 53, 69, 1)',
                    'rgba(253, 126, 20, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(25, 135, 84, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create Sentiment Chart
function createSentimentChart(sentimentData) {
    const ctx = document.getElementById('sentiment-chart').getContext('2d');
    
    if (sentimentChart) {
        sentimentChart.destroy();
    }
    
    // Check if data is empty (all values are 0)
    const totalSentiment = (sentimentData.positive || 0) + (sentimentData.neutral || 0) + (sentimentData.negative || 0);
    if (!sentimentData || totalSentiment === 0) {
        // Display "No data" message
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No sentiment data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const labels = ['Positive', 'Neutral', 'Negative'];
    const data = [sentimentData.positive, sentimentData.neutral, sentimentData.negative];
    
    sentimentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',   // Positive - green
                    'rgba(255, 193, 7, 0.8)',   // Neutral - yellow
                    'rgba(220, 53, 69, 0.8)'    // Negative - red
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('CRM Dashboard loading...'); // Debug log
    loadDashboardData();
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadDashboardData();
        });
    }
    
    // Auto refresh every 60 seconds
    setInterval(loadDashboardData, 60000);
}); 