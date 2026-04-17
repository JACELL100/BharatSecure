import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_HOST = import.meta.env.VITE_API_HOST;
const API_URL = import.meta.env.VITE_API_URL;
console.log("API Host:", API_HOST);
console.log("API_URL:", API_URL);

// Enhanced chart options with neuromorphic theme
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#94ecf7",
        font: {
          family: "'Inter', sans-serif",
          weight: 500,
        },
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 24, 48, 0.9)",
      titleColor: "#94ecf7",
      bodyColor: "#94ecf7",
      borderColor: "rgba(148, 236, 247, 0.2)",
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(148, 236, 247, 0.1)",
        drawBorder: false,
      },
      ticks: {
        color: "#94ecf7",
        font: {
          family: "'Inter', sans-serif",
        },
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      grid: {
        color: "rgba(148, 236, 247, 0.1)",
        drawBorder: false,
      },
      ticks: {
        color: "#94ecf7",
        font: {
          family: "'Inter', sans-serif",
        },
      },
    },
  },
};

// Mobile-specific chart options
const mobileChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      ...chartOptions.plugins.legend,
      position: "bottom",
    },
  },
};

const IncidentAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const hasChartContent = (chartData) =>
    Array.isArray(chartData?.labels) &&
    chartData.labels.length > 0 &&
    Array.isArray(chartData?.datasets) &&
    chartData.datasets.some(
      (dataset) => Array.isArray(dataset.data) && dataset.data.length > 0
    );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/advanced-incident-analysis/`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hourlyDistributionData = {
    labels: data?.hourly_distribution.map((item) => `${item.hour}:00`) || [],
    datasets: [
      {
        label: "Incidents",
        data:
          data?.hourly_distribution.map((item) => item.incident_count) || [],
        backgroundColor: "rgba(148, 236, 247, 0.5)",
        borderColor: "rgba(148, 236, 247, 0.8)",
        borderWidth: 2,
      },
      {
        label: "High Severity",
        data:
          data?.hourly_distribution.map((item) => item.high_severity_count) ||
          [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  const incidentTypeData = {
    labels: data?.incident_type_analysis.map((item) => item.incidentType) || [],
    datasets: [
      {
        data:
          data?.incident_type_analysis.map((item) => item.total_count) || [],
        backgroundColor: [
          "rgba(148, 236, 247, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(148, 236, 247, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const weeklyPatternData = {
    labels: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    datasets: [
      {
        label: "Total Incidents",
        data: data?.weekly_pattern.map((item) => item.total_incidents) || [],
        backgroundColor: "rgba(148, 236, 247, 0.5)",
        borderColor: "rgba(148, 236, 247, 0.8)",
        borderWidth: 2,
      },
      {
        label: "Resolution Rate",
        data: data?.weekly_pattern.map((item) => item.resolution_rate) || [],
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  const emergencyServicesData = {
    labels:
      data?.emergency_services_summary.map((item) => item.incidentType) || [],
    datasets: [
      {
        label: "Police",
        data:
          data?.emergency_services_summary.map(
            (item) => item.police_involved
          ) || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 0.8)",
        borderWidth: 2,
      },
      {
        label: "Fire Dept",
        data:
          data?.emergency_services_summary.map((item) => item.fire_involved) ||
          [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 0.8)",
        borderWidth: 2,
      },
      {
        label: "Hospital",
        data:
          data?.emergency_services_summary.map(
            (item) => item.hospital_involved
          ) || [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="min-h-[320px] md:min-h-[420px] flex flex-col items-center justify-center gap-4 rounded-2xl border border-cyan-400/20 bg-[#001830] shadow-[0_20px_44px_rgba(3,7,16,0.55)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
          <p className="text-cyan-300/85 text-sm md:text-base">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="min-h-[320px] md:min-h-[420px] flex items-center justify-center rounded-2xl border border-rose-300/25 bg-[#001830] shadow-[0_20px_44px_rgba(3,7,16,0.55)]">
          <div className="text-center max-w-xl p-6 md:p-8 bg-[#0d1828] border border-rose-300/30 rounded-xl shadow-[0_16px_36px_rgba(3,7,16,0.45)]">
            <h2 className="text-xl md:text-2xl font-semibold text-rose-200 mb-2">Unable to load analytics</h2>
            <p className="text-sm md:text-base text-cyan-100/80">Error: {error}</p>
            <p className="text-xs md:text-sm text-cyan-200/60 mt-3">
              This view is still functional and will render automatically once the API is reachable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 md:p-8">
        <div className="min-h-[320px] md:min-h-[420px] flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-[#001830]">
          <p className="text-cyan-200/80 text-sm md:text-base">No analytics data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-900 rounded-2xl border border-cyan-400/15 shadow-[0_20px_44px_rgba(3,7,16,0.55)]">
      {/* Title with enhanced glow effect */}
      <h1 className="text-3xl md:text-5xl font-bold text-cyan-400 mb-8 md:mb-12 text-center drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse">
        Incident Analytics Dashboard
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
        {[
          {
            title: "Resolution Rate",
            value: `${Number(data.overall_statistics.resolution_rate).toFixed(
              1
            )}%`,
            icon: "📈",
          },
          {
            title: "Average Response Score",
            value: Number(data.overall_statistics.avg_response_score).toFixed(
              1
            ),
            icon: "⭐",
          },
          {
            title: "Total Incidents",
            value: data.overall_statistics.total_incidents,
            icon: "🎯",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(0,255,255,0.1)] border border-cyan-400/20 transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-xl md:text-2xl">{stat.icon}</span>
              <div>
                <h3 className="text-sm md:text-lg font-semibold text-cyan-400 mb-1 md:mb-2">
                  {stat.title}
                </h3>
                <div className="text-xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {[
          {
            title: "Hourly Distribution",
            data: hourlyDistributionData,
            chart: (
              <Bar
                options={isMobile ? mobileChartOptions : chartOptions}
                data={hourlyDistributionData}
              />
            ),
          },
          {
            title: "Incident Type Distribution",
            data: incidentTypeData,
            chart: (
              <Pie
                options={isMobile ? mobileChartOptions : chartOptions}
                data={incidentTypeData}
              />
            ),
          },
          {
            title: "Weekly Pattern",
            data: weeklyPatternData,
            chart: (
              <Bar
                options={isMobile ? mobileChartOptions : chartOptions}
                data={weeklyPatternData}
              />
            ),
          },
          {
            title: "Emergency Services Response",
            data: emergencyServicesData,
            chart: (
              <Bar
                options={isMobile ? mobileChartOptions : chartOptions}
                data={emergencyServicesData}
              />
            ),
          },
        ].map((section, index) => (
          <div
            key={index}
            className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(0,255,255,0.1)] border border-cyan-400/20 transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            <h3 className="text-lg md:text-xl font-semibold text-cyan-400 mb-4 md:mb-6 p-2 md:p-3 rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.2),_inset_2px_2px_8px_rgba(0,255,255,0.1)] border border-cyan-400/20 text-center md:text-left">
              {section.title}
            </h3>
            <div className="h-[300px] md:h-[400px] bg-[#001830] rounded-lg p-2 md:p-4 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.3),inset_4px_4px_8px_rgba(0,255,255,0.1)] border border-cyan-400/10">
              {hasChartContent(section.data) ? (
                section.chart
              ) : (
                <div className="h-full flex items-center justify-center rounded-md border border-cyan-400/15 bg-[#001a33] text-cyan-300/80 text-sm text-center px-4">
                  No data available for this visualization right now.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentAnalyticsDashboard;