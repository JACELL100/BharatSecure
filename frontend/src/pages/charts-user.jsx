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
  "#00ffff", // cyan
  "#00ccff", // light blue
  "#0099ff", // blue
  "#0066ff", // darker blue
  "#0033ff", // even darker blue
  "#00ff99", // mint
];

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
  const API_URL = import.meta.env.VITE_API_URL;

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
      <div className="flex items-center justify-center h-64 bg-[#001830] text-cyan-400">
        <div className="text-lg">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#001830] rounded-2xl border border-cyan-400/15 shadow-[0_20px_44px_rgba(3,7,16,0.55)]">
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 mb-2 p-3 md:p-4 rounded-xl shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.3),_inset_5px_5px_15px_rgba(0,255,255,0.1)] border border-cyan-400/20">
          Your Analytics
        </h1>
        <p className="text-sm md:text-base text-cyan-300/80">Track and analyze your incident data</p>
      </div>

      {/* Controls Section */}
      <div className="flex justify-center md:justify-end mb-6 md:mb-8">
        <select
          className="w-full md:w-auto px-3 md:px-4 py-2 bg-[#002345] text-cyan-400 border border-cyan-400/30 rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.3),_inset_2px_2px_8px_rgba(0,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[0_14px_28px_rgba(4,8,16,0.52)] border border-cyan-400/20 transform transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.24)]">
          <div className="text-2xl md:text-3xl font-bold text-cyan-400">
            {stats.total_incidents}
          </div>
          <div className="text-xs md:text-sm font-medium text-cyan-300/80">
            Total Incidents
          </div>
        </div>
        <div className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[0_14px_28px_rgba(4,8,16,0.52)] border border-cyan-400/20 transform transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.24)]">
          <div className="text-2xl md:text-3xl font-bold text-cyan-400">
            {stats.average_score?.toFixed(1) || "N/A"}
          </div>
          <div className="text-xs md:text-sm font-medium text-cyan-300/80">
            Average Score
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Incident Types Distribution */}
        <div className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(0,255,255,0.1)] border border-cyan-400/20">
          <h2 className="text-lg md:text-xl font-semibold text-cyan-400 mb-4 md:mb-6 p-2 rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.2),_inset_2px_2px_8px_rgba(0,255,255,0.1)]">
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
                    label
                  >
                    {stats.incident_types.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#002345",
                      border: "1px solid rgba(0,255,255,0.2)",
                      color: "cyan",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      color: "cyan",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-cyan-400/15 bg-[#001a33] text-cyan-300/80 text-sm">
                No incident type data available.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Incident Trend */}
        <div className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(0,255,255,0.1)] border border-cyan-400/20">
          <h2 className="text-lg md:text-xl font-semibold text-cyan-400 mb-4 md:mb-6 p-2 rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.2),_inset_2px_2px_8px_rgba(0,255,255,0.1)]">
            Monthly Incident Trend
          </h2>
          <div className="w-full h-64 md:h-80">
            {hasData(stats.monthly_trend) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthly_trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    stroke="#00ffff"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#00ffff" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#002345",
                      border: "1px solid rgba(0,255,255,0.2)",
                      color: "cyan",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      color: "cyan",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00ffff"
                    name="Incidents"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-cyan-400/15 bg-[#001a33] text-cyan-300/80 text-sm">
                No monthly trend data available.
              </div>
            )}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(0,255,255,0.1)] border border-cyan-400/20">
          <h2 className="text-lg md:text-xl font-semibold text-cyan-400 mb-4 md:mb-6 p-2 rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.2),_inset_2px_2px_8px_rgba(0,255,255,0.1)]">
            Severity Distribution
          </h2>
          <div className="w-full h-64 md:h-80">
            {hasData(stats.severity_distribution) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.severity_distribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,255,255,0.1)"
                  />
                  <XAxis dataKey="severity" stroke="#00ffff" fontSize={12} />
                  <YAxis stroke="#00ffff" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#002345",
                      border: "1px solid rgba(0,255,255,0.2)",
                      color: "cyan",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      color: "cyan",
                    }}
                  />
                  <Bar dataKey="count">
                    {stats.severity_distribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-cyan-400/15 bg-[#001a33] text-cyan-300/80 text-sm">
                No severity data available.
              </div>
            )}
          </div>
        </div>

        {/* Average Score Trend */}
        <div className="bg-[#002345] rounded-xl p-4 md:p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(0,255,255,0.1)] border border-cyan-400/20">
          <h2 className="text-lg md:text-xl font-semibold text-cyan-400 mb-4 md:mb-6 p-2 rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.2),_inset_2px_2px_8px_rgba(0,255,255,0.1)]">
            Average Score Trend
          </h2>
          <div className="w-full h-64 md:h-80">
            {hasData(stats.score_trend) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.score_trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    stroke="#00ffff"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={[0, 100]} stroke="#00ffff" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#002345",
                      border: "1px solid rgba(0,255,255,0.2)",
                      color: "cyan",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      color: "cyan",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="avg_score"
                    stroke="#00ffff"
                    name="Average Score"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-cyan-400/15 bg-[#001a33] text-cyan-300/80 text-sm">
                No score trend data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDashboardUser;