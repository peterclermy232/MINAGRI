import { Component, OnInit, OnDestroy } from '@angular/core';
import { FarmerService } from 'src/app/shared/farmer.service';
import { ProductInsuranceService } from 'src/app/shared/product-insurance.service';
import { AdvisoryService } from 'src/app/shared/advisory.service';
import { WeatherService } from 'src/app/shared/weather.service';
import { Subscription, forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';

interface DashboardStats {
  totalFarmers: number;
  activePolicies: number;
  pendingClaims: number;
  totalRevenue: number;
  farmerGrowth: number;
  policyGrowth: number;
  claimGrowth: number;
  revenueGrowth: number;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Loading states
  isLoading = true;
  statsLoading = true;
  chartsLoading = true;

  // Dashboard statistics
  stats: DashboardStats = {
    totalFarmers: 0,
    activePolicies: 0,
    pendingClaims: 0,
    totalRevenue: 0,
    farmerGrowth: 0,
    policyGrowth: 0,
    claimGrowth: 0,
    revenueGrowth: 0
  };

  // Chart data
  farmersByMonthChart: ChartData = { labels: [], datasets: [] };
  policiesByStatusChart: ChartData = { labels: [], datasets: [] };
  claimsByStatusChart: ChartData = { labels: [], datasets: [] };
  revenueByMonthChart: ChartData = { labels: [], datasets: [] };
  cropDistributionChart: ChartData = { labels: [], datasets: [] };
  weatherTrendsChart: ChartData = { labels: [], datasets: [] };

  // Recent activities
  recentActivities: any[] = [];
  recentClaims: any[] = [];
  topProducts: any[] = [];

  // Subscriptions
  private subscriptions: Subscription = new Subscription();

  constructor(
    private farmerService: FarmerService,
    private productService: ProductInsuranceService,
    private advisoryService: AdvisoryService,
    private weatherService: WeatherService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    // Refresh data every 5 minutes
    const refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 300000);

    this.subscriptions.add(() => clearInterval(refreshInterval));
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  private initializeCharts(): void {
    // Import Chart.js dynamically if needed
    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded');
      return;
    }

    // Farmers Growth Chart (Line)
    const farmersCtx = document.getElementById('farmersChart') as HTMLCanvasElement;
    if (farmersCtx) {
      new Chart(farmersCtx, {
        type: 'line',
        data: this.farmersByMonthChart,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Policies Distribution (Doughnut)
    const policiesCtx = document.getElementById('policiesChart') as HTMLCanvasElement;
    if (policiesCtx) {
      new Chart(policiesCtx, {
        type: 'doughnut',
        data: this.policiesByStatusChart,
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

    // Revenue Chart (Bar)
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'bar',
        data: this.revenueByMonthChart,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Claims Distribution (Pie)
    const claimsCtx = document.getElementById('claimsChart') as HTMLCanvasElement;
    if (claimsCtx) {
      new Chart(claimsCtx, {
        type: 'pie',
        data: this.claimsByStatusChart,
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

    // Crop Distribution (Doughnut)
    const cropCtx = document.getElementById('cropChart') as HTMLCanvasElement;
    if (cropCtx) {
      new Chart(cropCtx, {
        type: 'doughnut',
        data: this.cropDistributionChart,
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.statsLoading = true;
    this.chartsLoading = true;

    // Load all data in parallel
    forkJoin({
      farmers: this.farmerService.getFarmer(''),
      products: this.productService.getAllProducts(),
      advisories: this.advisoryService.getAdvisories(),
      weather: this.weatherService.getHistoricalData()
    }).subscribe({
      next: (data) => {
        this.processFarmersData(data.farmers);
        this.processProductsData(data.products);
        this.processAdvisoriesData(data.advisories);
        this.processWeatherData(data.weather);

        this.calculateStatistics();
        this.prepareChartData();

        this.statsLoading = false;
        this.chartsLoading = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
        this.statsLoading = false;
        this.chartsLoading = false;
      }
    });
  }

  private processFarmersData(response: any): void {
    const farmers = Array.isArray(response) ? response : response.results || [];
    this.stats.totalFarmers = farmers.length;

    // Calculate farmer growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentFarmers = farmers.filter((f: any) =>
      new Date(f.date_time_added) > thirtyDaysAgo
    );

    this.stats.farmerGrowth = farmers.length > 0
      ? (recentFarmers.length / farmers.length) * 100
      : 0;
  }

  private processProductsData(response: any): void {
    const products = Array.isArray(response) ? response : response.results || [];
    this.topProducts = products.slice(0, 5);

    // Count active policies (simplified - you'd get this from quotations/policies)
    this.stats.activePolicies = products.filter((p: any) =>
      p.status === 'ACTIVE'
    ).length;
  }

  private processAdvisoriesData(response: any): void {
    const advisories = Array.isArray(response) ? response : response.results || [];

    // Create recent activities from advisories
    this.recentActivities = advisories.slice(0, 5).map((adv: any) => ({
      id: adv.id,
      type: 'advisory',
      title: 'Advisory Sent',
      description: `${adv.recipients_count} farmers received advisory`,
      time: adv.date_time_added,
      icon: 'bi-megaphone'
    }));
  }

  private processWeatherData(response: any): void {
    const weatherData = Array.isArray(response) ? response : response.results || [];
    // Process weather trends for chart
  }

  private calculateStatistics(): void {
    // Mock calculations - replace with actual data
    this.stats.pendingClaims = 12;
    this.stats.totalRevenue = 450000;
    this.stats.policyGrowth = 8.5;
    this.stats.claimGrowth = -2.3;
    this.stats.revenueGrowth = 12.7;
  }

  private prepareChartData(): void {
    // Farmers by Month
    this.farmersByMonthChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'New Farmers',
        data: [45, 52, 68, 73, 89, 95],
        backgroundColor: 'rgba(65, 84, 241, 0.1)',
        borderColor: 'rgba(65, 84, 241, 1)',
        borderWidth: 2,
        tension: 0.4
      }]
    };

    // Policies by Status
    this.policiesByStatusChart = {
      labels: ['Active', 'Pending', 'Expired', 'Cancelled'],
      datasets: [{
        data: [65, 15, 12, 8],
        backgroundColor: [
          'rgba(25, 135, 84, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(108, 117, 125, 0.8)'
        ]
      }]
    };

    // Claims by Status
    this.claimsByStatusChart = {
      labels: ['Open', 'Pending Assessment', 'Approved', 'Paid', 'Rejected'],
      datasets: [{
        data: [12, 8, 15, 45, 5],
        backgroundColor: [
          'rgba(13, 110, 253, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(25, 135, 84, 0.8)',
          'rgba(32, 201, 151, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ]
      }]
    };

    // Revenue by Month
    this.revenueByMonthChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue (KES)',
        data: [65000, 72000, 68000, 85000, 92000, 98000],
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        borderColor: 'rgba(25, 135, 84, 1)',
        borderWidth: 2,
        tension: 0.4
      }]
    };

    // Crop Distribution
    this.cropDistributionChart = {
      labels: ['Maize', 'Rice', 'Wheat', 'Beans', 'Potatoes'],
      datasets: [{
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',
          'rgba(13, 202, 240, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ]
      }]
    };
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatPercentage(num: number): string {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  }

  getGrowthClass(value: number): string {
    return value >= 0 ? 'text-success' : 'text-danger';
  }

  getGrowthIcon(value: number): string {
    return value >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
  }
}
