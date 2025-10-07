import { useState, useEffect } from "react";
import { TrendingUp, Brain, AlertTriangle, MapPin, Calendar, BarChart3, Activity, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Footer from "@/components/Footer";

const IncidentForecasting = () => {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/incident-forecast/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setForecast(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch forecast");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
      console.error("Error fetching forecast:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Format summary text into paragraphs
  const formatSummary = (text) => {
    if (!text) return [];
    
    // Split by double newlines (paragraphs) or single newlines
    const paragraphs = text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    return paragraphs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Analyzing incident data with AI...</p>
          <p className="text-gray-400 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Forecast</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={fetchForecast}
              className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  const summaryParagraphs = formatSummary(forecast.summary);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      <div className="p-4 md:p-8 pb-20 md:pb-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brain className="w-8 h-8 md:w-12 md:h-12 text-purple-400" />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              AI Incident Forecasting
            </h1>
          </div>
          <button
            onClick={fetchForecast}
            className="bg-sky-500/10 border border-sky-500 text-sky-400 px-4 py-2 rounded-lg hover:bg-sky-500/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {!isMobile && "Refresh"}
          </button>
        </div>

        {/* AI Summary Card - IMPROVED FORMATTING */}
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl">
          <div className="flex items-start gap-4 mb-4">
            <Brain className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">AI Analysis Summary</h2>
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-4 md:p-6 space-y-4">
            {summaryParagraphs.map((paragraph, index) => (
              <p key={index} className="text-white text-base md:text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white/5 p-6 rounded-2xl border-2 border-blue-500 shadow-lg hover:scale-105 transition-all">
            <Activity className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-gray-400 text-sm mb-1">Total Incidents</h3>
            <p className="text-3xl font-bold text-white">{forecast.total_incidents}</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border-2 border-green-500 shadow-lg hover:scale-105 transition-all">
            <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
            <h3 className="text-gray-400 text-sm mb-1">Predicted Next Week</h3>
            <p className="text-3xl font-bold text-white">{forecast.predictions?.next_week || "N/A"}</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border-2 border-yellow-500 shadow-lg hover:scale-105 transition-all">
            <AlertTriangle className="w-10 h-10 text-yellow-400 mb-3" />
            <h3 className="text-gray-400 text-sm mb-1">High Risk Areas</h3>
            <p className="text-3xl font-bold text-white">{forecast.high_risk_areas?.length || 0}</p>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border-2 border-red-500 shadow-lg hover:scale-105 transition-all">
            <BarChart3 className="w-10 h-10 text-red-400 mb-3" />
            <h3 className="text-gray-400 text-sm mb-1">Peak Hour</h3>
            <p className="text-3xl font-bold text-white">{forecast.peak_hour || "N/A"}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          {forecast.trend_data && forecast.trend_data.length > 0 && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-sky-400" />
                Incident Trend (Last 30 Days)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} name="Incidents" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Severity Distribution */}
          {forecast.severity_distribution && forecast.severity_distribution.length > 0 && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                Severity Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={forecast.severity_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {forecast.severity_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Incident Type Distribution */}
          {forecast.type_distribution && forecast.type_distribution.length > 0 && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg lg:col-span-2">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Top Incident Types
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecast.type_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#a78bfa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* High Risk Areas */}
        {forecast.high_risk_areas && forecast.high_risk_areas.length > 0 && (
          <div className="bg-white/5 p-6 rounded-2xl border border-red-500/50 shadow-lg mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              High Risk Locations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecast.high_risk_areas.map((area, index) => (
                <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 hover:bg-red-500/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{area.location}</h3>
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {area.risk_score}%
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{area.incident_count} incidents</p>
                  <p className="text-gray-400 text-xs">{area.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations - IMPROVED FORMATTING */}
        {forecast.recommendations && forecast.recommendations.length > 0 && (
          <div className="bg-white/5 p-6 rounded-2xl border border-green-500/50 shadow-lg mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              AI Recommendations
            </h2>
            <div className="space-y-3">
              {forecast.recommendations.map((rec, index) => (
                <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 hover:bg-green-500/20 transition-all flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-bold">{index + 1}</span>
                  </div>
                  <p className="text-white text-sm md:text-base flex-1 pt-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Analysis */}
        {forecast.time_analysis && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Time-Based Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h3 className="text-blue-400 font-semibold mb-2">Peak Hours</h3>
                <p className="text-white text-lg">{forecast.time_analysis.peak_hours || "N/A"}</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-purple-400 font-semibold mb-2">Peak Days</h3>
                <p className="text-white text-lg">{forecast.time_analysis.peak_days || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default IncidentForecasting;