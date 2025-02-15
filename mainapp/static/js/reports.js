export class ReportManager {
  constructor() {
    this.dailyChart = null;
    this.weeklyChart = null;
    this.monthlyChart = null;
  }

  updateCharts() {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    
    this.updateDailyChart(sales);
    this.updateWeeklyChart(sales);
    this.updateMonthlyChart(sales);
  }

  updateDailyChart(sales) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailySales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= today;
    });

    const hourlyData = new Array(24).fill(0);
    dailySales.forEach(sale => {
      const hour = new Date(sale.timestamp).getHours();
      hourlyData[hour] += sale.total;
    });

    const ctx = document.getElementById('dailyChart');
    if (this.dailyChart) {
      this.dailyChart.destroy();
    }

    this.dailyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Sales ($)',
          data: hourlyData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateWeeklyChart(sales) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weeklySales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= weekStart;
    });

    const dailyData = new Array(7).fill(0);
    weeklySales.forEach(sale => {
      const day = new Date(sale.timestamp).getDay();
      dailyData[day] += sale.total;
    });

    const ctx = document.getElementById('weeklyChart');
    if (this.weeklyChart) {
      this.weeklyChart.destroy();
    }

    this.weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Sales ($)',
          data: dailyData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateMonthlyChart(sales) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthlySales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= monthStart;
    });

    const daysInMonth = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    ).getDate();
    
    const dailyData = new Array(daysInMonth).fill(0);
    monthlySales.forEach(sale => {
      const day = new Date(sale.timestamp).getDate() - 1;
      dailyData[day] += sale.total;
    });

    const ctx = document.getElementById('monthlyChart');
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length: daysInMonth}, (_, i) => i + 1),
        datasets: [{
          label: 'Sales ($)',
          data: dailyData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}