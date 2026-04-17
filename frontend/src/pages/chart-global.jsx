import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API_URL;
const panelClass = "bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl";
const chartFrameClass = "h-[300px] md:h-[380px] bg-black/20 rounded-xl p-3 md:p-4 border border-white/10";

const commonPlugins = {
  legend: {
    position: "top",
    labels: {
      color: "#cbd5e1",
      font: {
        family: "'Outfit', sans-serif",
        weight: 600,
      },
      padding: 16,
      usePointStyle: true,
      pointStyle: "circle",
    },
  },
  tooltip: {
    backgroundColor: "#0f172a",
    titleColor: "#f8fafc",
    bodyColor: "#e2e8f0",
    borderColor: "#334155",
    borderWidth: 1,
    padding: 12,
    boxPadding: 6,
    usePointStyle: true,
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: commonPlugins,
  scales: {
    x: {
      grid: {
        color: "rgba(51, 65, 85, 0.55)",
        drawBorder: false,
      },
      ticks: {
        color: "#94a3b8",
        font: {
          family: "'Outfit', sans-serif",
        },
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      grid: {
        color: "rgba(51, 65, 85, 0.55)",
        drawBorder: false,
      },
      ticks: {
        color: "#94a3b8",
        font: {
          family: "'Outfit', sans-serif",
        },
      },
    },
  },
};

const mobilePlugins = {
  ...commonPlugins,
  legend: {
    ...commonPlugins.legend,
    position: "bottom",
    labels: {
      ...commonPlugins.legend.labels,
      padding: 12,
      boxWidth: 12,
    },
  },
};

const mobileBarChartOptions = {
  ...barChartOptions,
  plugins: {
    ...mobilePlugins,
  },
  scales: {
    ...barChartOptions.scales,
    x: {
      ...barChartOptions.scales.x,
      ticks: {
        ...barChartOptions.scales.x.ticks,
        maxRotation: 0,
        minRotation: 0,
      },
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    ...commonPlugins,
    legend: {
      ...commonPlugins.legend,
      labels: {
        ...commonPlugins.legend.labels,
        padding: 14,
      },
    },
  },
};

const mobilePieChartOptions = {
  ...pieChartOptions,
  plugins: {
    ...mobilePlugins,
  },
};

const IncidentAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const hasChartContent = (chartData) =>
    Array.isArray(chartData?.labels) &&
    chartData.labels.length > 0 &&
    Array.isArray(chartData?.datasets) &&
    chartData.datasets.some(
      (dataset) => Array.isArray(dataset.data) && dataset.data.length > 0
    );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

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
        setError(null);
        const response = await fetch(`${API_URL}/api/advanced-incident-analysis/`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
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
  }, [API_URL]);

  const overallStats = data?.overall_statistics || {};
  const hourlyDistribution = data?.hourly_distribution || [];
  const incidentTypeAnalysis = data?.incident_type_analysis || [];
  const weeklyPattern = data?.weekly_pattern || [];
  const emergencyServicesSummary = data?.emergency_services_summary || [];

  const weekdayMap = {
    1: "Sunday",
    2: "Monday",
    3: "Tuesday",
    4: "Wednesday",
    5: "Thursday",
    6: "Friday",
    7: "Saturday",
  };

  const hourlyDistributionData = {
    labels: hourlyDistribution.map((item) => `${item.hour}:00`),
    datasets: [
      {
        label: "Incidents",
        data: hourlyDistribution.map((item) => item.incident_count),
        backgroundColor: "rgba(56, 189, 248, 0.36)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "High Severity",
        data: hourlyDistribution.map((item) => item.high_severity_count),
        backgroundColor: "rgba(248, 113, 113, 0.32)",
        borderColor: "#f87171",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const incidentTypeData = {
    labels: incidentTypeAnalysis.map((item) => item.incidentType),
    datasets: [
      {
        data: incidentTypeAnalysis.map((item) => item.total_count),
        backgroundColor: [
          "rgba(56, 189, 248, 0.55)",
          "rgba(96, 165, 250, 0.55)",
          "rgba(52, 211, 153, 0.55)",
          "rgba(251, 191, 36, 0.55)",
          "rgba(249, 115, 22, 0.55)",
          "rgba(167, 139, 250, 0.55)",
        ],
        borderColor: [
          "#38bdf8",
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f97316",
          "#a78bfa",
        ],
        borderWidth: 2,
      },
    ],
  };

  const weeklyPatternData = {
    labels: weeklyPattern.map((item) => weekdayMap[item.weekday] || "Unknown"),
    datasets: [
      {
        label: "Total Incidents",
        data: weeklyPattern.map((item) => item.total_incidents),
        backgroundColor: "rgba(56, 189, 248, 0.36)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Resolution Rate",
        data: weeklyPattern.map((item) => item.resolution_rate),
        backgroundColor: "rgba(167, 139, 250, 0.35)",
        borderColor: "#a78bfa",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const emergencyServicesData = {
    labels: emergencyServicesSummary.map((item) => item.incidentType),
    datasets: [
      {
        label: "Police",
        data: emergencyServicesSummary.map((item) => item.police_involved),
        backgroundColor: "rgba(56, 189, 248, 0.36)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Fire Dept",
        data: emergencyServicesSummary.map((item) => item.fire_involved),
        backgroundColor: "rgba(248, 113, 113, 0.32)",
        borderColor: "#f87171",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Hospital",
        data: emergencyServicesSummary.map((item) => item.hospital_involved),
        backgroundColor: "rgba(52, 211, 153, 0.32)",
        borderColor: "#34d399",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const stats = [
    {
      title: "Resolution Rate",
      value:
        overallStats.resolution_rate != null
          ? `${Number(overallStats.resolution_rate).toFixed(1)}%`
          : "N/A",
      accent: "text-sky-400",
    },
    {
      title: "Average Response Score",
      value:
        overallStats.avg_response_score != null
          ? Number(overallStats.avg_response_score).toFixed(1)
          : "N/A",
      accent: "text-emerald-400",
    },
    {
      title: "Total Incidents",
      value:
        overallStats.total_incidents != null
          ? overallStats.total_incidents
          : "N/A",
      accent: "text-amber-400",
    },
  ];

  const chartSections = [
    {
      title: "Hourly Distribution",
      data: hourlyDistributionData,
      chart: (
        <Bar
          options={isMobile ? mobileBarChartOptions : barChartOptions}
          data={hourlyDistributionData}
        />
      ),
    },
    {
      title: "Incident Type Distribution",
      data: incidentTypeData,
      chart: (
        <Pie
          options={isMobile ? mobilePieChartOptions : pieChartOptions}
          data={incidentTypeData}
        />
      ),
    },
    {
      title: "Weekly Pattern",
      data: weeklyPatternData,
      chart: (
        <Bar
          options={isMobile ? mobileBarChartOptions : barChartOptions}
          data={weeklyPatternData}
        />
      ),
    },
    {
      title: "Emergency Services Response",
      data: emergencyServicesData,
      chart: (
        <Bar
          options={isMobile ? mobileBarChartOptions : barChartOptions}
          data={emergencyServicesData}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 pb-8">
        <div className={`${panelClass} min-h-[320px] md:min-h-[420px] flex flex-col items-center justify-center gap-4`}>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-400 border-t-transparent"></div>
          <p className="text-gray-300 text-sm md:text-base">Loading advanced analytics...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 pb-8">
        <div className={`${panelClass} min-h-[320px] md:min-h-[420px] flex items-center justify-center`}>
          <div className="text-center max-w-xl p-6 md:p-8 bg-slate-900/60 border border-rose-300/30 rounded-xl shadow-2xl">
            <h2 className="text-xl md:text-2xl font-semibold text-rose-200 mb-2">Unable to load analytics</h2>
            <p className="text-sm md:text-base text-gray-300">Error: {error}</p>
            <p className="text-xs md:text-sm text-gray-400 mt-3">
              This view is still functional and will render automatically once the API is reachable.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 pb-8">
        <div className={`${panelClass} min-h-[320px] md:min-h-[420px] flex items-center justify-center`}>
          <p className="text-gray-300 text-sm md:text-base">No analytics data available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 pb-8">
      <div className={`${panelClass} p-4 md:p-6 mb-6 md:mb-8`}>
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
          Incident Analytics Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          City-wide trend snapshots from incident submissions and emergency service responses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`${panelClass} p-4 md:p-6`}>
            <h3 className={`text-sm md:text-base font-semibold mb-1 ${stat.accent}`}>
              {stat.title}
            </h3>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {chartSections.map((section, index) => (
          <div key={index} className={`${panelClass} p-4 md:p-6`}>
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-5 text-center md:text-left">
              {section.title}
            </h3>
            <div className={chartFrameClass}>
              {hasChartContent(section.data) ? (
                section.chart
              ) : (
                <div className="h-full flex items-center justify-center rounded-md border border-white/10 bg-slate-900/50 text-gray-400 text-sm text-center px-4">
                  No data available for this visualization right now.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default IncidentAnalyticsDashboard;
