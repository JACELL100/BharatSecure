import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#38bdf8",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f97316",
  "#a78bfa",
];

const panelClass = "bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl";
const tooltipContentStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "12px",
  color: "#f8fafc",
  fontSize: "12px",
};

const tooltipItemStyle = {
  color: "#e2e8f0",
};

const IncidentDashboardUser = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    incident_types: [],
    monthly_trend: [],
    severity_distribution: [],
    score_trend: [],
    total_incidents: 0,
    average_score: 0,
  });
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const API_URL = (import.meta.env.VITE_API_URL || "https://bharatsecure-backend.onrender.com").replace(/\/+$/, "");

  const hasData = (arr) => Array.isArray(arr) && arr.length > 0;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token || token === "null" || token === "undefined") {
          setLoading(false);
          navigate("/login");
          return;
        }

        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/incident-chart-user/`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userType");
            navigate("/login");
            return;
          }
          throw new Error(`Failed to fetch statistics: ${response.status}`);
        }

        const data = await response.json();
        setStats({
          incident_types: data.incident_types || [],
          monthly_trend: data.monthly_trend || [],
          severity_distribution: data.severity_distribution || [],
          score_trend: data.score_trend || [],
          total_incidents: data.total_incidents || 0,
          average_score: data.average_score || 0,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStats({
          incident_types: [],
          monthly_trend: [],
          severity_distribution: [],
          score_trend: [],
          total_incidents: 0,
          average_score: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL, navigate, timeRange]);

  if (loading) {
    return (
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 pb-10">
        <div className={`${panelClass} p-6 md:p-8 flex items-center justify-center min-h-48`}>
          <div className="text-base md:text-lg text-gray-300">Loading statistics...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 pb-10">
      {/* Header Section */}
      <div className={`${panelClass} p-4 md:p-6 mb-6 md:mb-8`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
              Your Analytics
            </h1>
            <p className="text-sm md:text-base text-gray-400">Track and analyze your incident data</p>
          </div>

          <select
            className="w-full md:w-auto px-3 md:px-4 py-2 bg-slate-900/70 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className={`${panelClass} p-4 md:p-6`}>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {stats.total_incidents}
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-400 mt-1">
            Total Incidents
          </div>
        </div>
        <div className={`${panelClass} p-4 md:p-6`}>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {stats.average_score?.toFixed(1) || "N/A"}
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-400 mt-1">
            Average Score
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Incident Types Distribution */}
        <div className={`${panelClass} p-4 md:p-6`}>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
            Incident Types Distribution
          </h2>
          <div className="w-full h-64 md:h-80">
            {hasData(stats.incident_types) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.incident_types}
                    dataKey="count"
                    nameKey="incidentType"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    labelLine={false}
                  >
                    {stats.incident_types.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-white/10 bg-black/20 text-gray-400 text-sm">
                No incident type data available.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Incident Trend */}
        <div className={`${panelClass} p-4 md:p-6`}>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
            Monthly Incident Trend
          </h2>
          <div className="w-full h-64 md:h-80">
            {hasData(stats.monthly_trend) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthly_trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    stroke="#94a3b8"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#38bdf8"
                    name="Incidents"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-white/10 bg-black/20 text-gray-400 text-sm">
                No monthly trend data available.
              </div>
            )}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className={`${panelClass} p-4 md:p-6`}>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
            Severity Distribution
          </h2>
          <div className="w-full h-64 md:h-80">
            {hasData(stats.severity_distribution) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.severity_distribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />
                  <XAxis dataKey="severity" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Bar dataKey="count">
                    {stats.severity_distribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-white/10 bg-black/20 text-gray-400 text-sm">
                No severity data available.
              </div>
            )}
          </div>
        </div>

        {/* Average Score Trend */}
        <div className={`${panelClass} p-4 md:p-6`}>
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
            Average Score Trend
          </h2>
          <div className="w-full h-64 md:h-80">
            {hasData(stats.score_trend) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.score_trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    stroke="#94a3b8"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
                  <Line
                    type="monotone"
                    dataKey="avg_score"
                    stroke="#38bdf8"
                    name="Average Score"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-white/10 bg-black/20 text-gray-400 text-sm">
                No score trend data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IncidentDashboardUser;