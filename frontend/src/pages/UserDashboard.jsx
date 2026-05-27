import React, { useMemo, useState, useEffect } from "react";

import { MessageCircle } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { Timer } from "lucide-react";
import { MapPin } from "lucide-react";
// import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import FloatingChatbot from "@/components/FloatingChatbot";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "@/lib/apiBase";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  console.log(`is logged in ${isLoggedIn}`);

  const [total, setTotal] = useState();
  const [resolved, setResolved] = useState(0);
  const [unresolved, setUnResolved] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const [analyticsRange, setAnalyticsRange] = useState(30);
  const API_URL = API_BASE_URL;

  const token = localStorage.getItem("accessToken");

  // Helper function to get a valid Google Maps URL from incident data
  const getLocationUrl = (incident) => {
    // First check if maps_link is valid
    if (incident.maps_link && incident.maps_link !== "None" && incident.maps_link.startsWith("http")) {
      return incident.maps_link;
    }
    
    // Try to parse location - it might be a string or object
    let location = incident.location;
    if (typeof location === "string") {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return "#";
      }
    }
    
    if (location?.latitude && location?.longitude) {
      return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    }
    
    return "#";
  };

  const getSeverityColor = (severity) => {
    if (severity === "low") return "text-blue-400 border-lime-300  border-2";
    if (severity === "medium")
      return "text-yellow-400 border-yellow-300  border-2";
    if (severity === "high") return "text-red-400 border-red-300  border-2";
  };

  const isImageEvidence = (fileUrl) => {
    if (!fileUrl) {
      return false;
    }
    return /\.(png|jpe?g|webp|gif)$/i.test(fileUrl);
  };

  // const getStatusColor = (status) => {
  //   if (status === "Resolved") return "bg-green-100 text-green-300";
  //   if (status === "submitted") return "bg-red-100 text-red-300";
  //   return "bg-yellow-100 text-yellow-300";
  // };

  const handleLogout = () => {
    localStorage.removeItem("userType");
    logout();
    navigate("/login");
  };

  useEffect(() => {
    let totalIncidents = 0;
    let resolvedIncidents = 0;
    let unresolvedIncidents = 0;

    incidents.forEach((inci) => {
      const statusValue = String(inci.status || "").toLowerCase();
      totalIncidents++;
      if (statusValue === "resolved") {
        resolvedIncidents++;
      } else {
        unresolvedIncidents++;
      }
    });

    setTotal(totalIncidents);
    setResolved(resolvedIncidents);
    setUnResolved(unresolvedIncidents);
  }, [incidents]);

  useEffect(() => {
    const fetchIncidents = async () => {
      if (!token || token === "null" || token === "undefined") {
        navigate("/login");
        return;
      }

      try {
        // console.log(`Access Token: ${token}`);
        const response = await fetch(
          `${API_URL}/api/all_user_incidents/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Replace with your actual token logic
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Incidents Response Data:", data);

          if (Array.isArray(data.incidents)) {
            setIncidents(data.incidents); // Set incidents state here
            setTotal(data.incidents.length);
            setResolved(
              data.incidents.filter(
                (inci) => String(inci.status || "").toLowerCase() === "resolved"
              ).length
            );
            setUnResolved(
              data.incidents.filter(
                (inci) => String(inci.status || "").toLowerCase() !== "resolved"
              ).length
            );
          } else {
            console.error("Unexpected data format:", data);
          }
        } else {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userType");
            navigate("/login");
            return;
          }
          console.error(
            `Error fetching incidents: ${response.statusText} (Status: ${response.status})`
          );
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();
  }, [API_URL, navigate, token]);

  const analyticsIncidents = useMemo(() => {
    if (!Array.isArray(incidents)) {
      return [];
    }

    if (!analyticsRange) {
      return incidents;
    }

    const now = Date.now();
    const cutoff = now - analyticsRange * 24 * 60 * 60 * 1000;
    return incidents.filter((incident) => {
      const reportedAt = incident.reported_at || incident.reportedAt;
      if (!reportedAt) {
        return true;
      }
      const parsedDate = new Date(reportedAt);
      if (Number.isNaN(parsedDate.getTime())) {
        return true;
      }
      return parsedDate.getTime() >= cutoff;
    });
  }, [analyticsRange, incidents]);

  const analyticsSummary = useMemo(() => {
    const totals = {
      total: analyticsIncidents.length,
      resolved: 0,
      active: 0,
      averageScore: 0,
      latestDate: null,
    };
    const severityCounts = { low: 0, medium: 0, high: 0 };
    const statusCounts = {
      submitted: 0,
      "under investigation": 0,
      resolved: 0,
      other: 0,
    };
    const typeCounts = {};
    const monthlyCounts = {};
    let scoreSum = 0;
    let scoreCount = 0;

    analyticsIncidents.forEach((incident) => {
      const severity = String(incident.severity || "").toLowerCase();
      if (severityCounts[severity] !== undefined) {
        severityCounts[severity] += 1;
      }

      const status = String(incident.status || "").toLowerCase();
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      } else {
        statusCounts.other += 1;
      }

      if (status === "resolved") {
        totals.resolved += 1;
      } else {
        totals.active += 1;
      }

      const incidentType = incident.incidentType || "Other";
      typeCounts[incidentType] = (typeCounts[incidentType] || 0) + 1;

      const scoreValue = Number(incident.score);
      if (Number.isFinite(scoreValue)) {
        scoreSum += scoreValue;
        scoreCount += 1;
      }

      const reportedAt = incident.reported_at || incident.reportedAt;
      if (reportedAt) {
        const parsedDate = new Date(reportedAt);
        if (!Number.isNaN(parsedDate.getTime())) {
          if (!totals.latestDate || parsedDate > totals.latestDate) {
            totals.latestDate = parsedDate;
          }
          const monthKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;
          monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
        }
      }
    });

    totals.averageScore = scoreCount > 0 ? scoreSum / scoreCount : 0;

    const topIncidentTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const monthlyTrend = Object.keys(monthlyCounts)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        const labelDate = new Date(Number(year), Number(month) - 1, 1);
        return {
          key,
          label: labelDate.toLocaleString("en-US", { month: "short", year: "numeric" }),
          count: monthlyCounts[key],
        };
      });

    return {
      totals,
      severityCounts,
      statusCounts,
      topIncidentTypes,
      monthlyTrend,
    };
  }, [analyticsIncidents]);

  const recentIncidents = useMemo(() => {
    return [...analyticsIncidents]
      .map((incident) => {
        const reportedAt = incident.reported_at || incident.reportedAt;
        const parsedDate = reportedAt ? new Date(reportedAt) : null;
        return {
          ...incident,
          parsedDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
        };
      })
      .sort((a, b) => {
        if (a.parsedDate && b.parsedDate) {
          return b.parsedDate - a.parsedDate;
        }
        if (a.parsedDate) {
          return -1;
        }
        if (b.parsedDate) {
          return 1;
        }
        return 0;
      })
      .slice(0, 5);
  }, [analyticsIncidents]);

  const getPercent = (count, totalValue) => {
    if (!totalValue) {
      return 0;
    }
    return Math.round((count / totalValue) * 100);
  };

  console.log("user data dashboard", incidents);
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-10 mt-4">
            <h1 className="text-xl text-left md:text-center md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600 [text-shadow:_0_0_30px_rgb(6_182_212_/_45%)]">
              Your Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 text-red-500 font-bold border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all absolute right-8 top-20 md:top-28"
            >
              Logout
            </button>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="flex flex-col md:flex-row  items-center gap-6  mb-8 justify-center ">
            {/* Total Incidents Card */}
            <div className="bg-white/5 p-6 rounded-2xl cursor-pointer border-red-400 shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] transition-all hover:scale-105 hover:shadow-[0px_10px_30px_rgba(255,255,255,0.15),0px_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between group w-64 md:w-80 border-2 border-red-500">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">
                  Total Incidents
                </h3>
                <p className="text-3xl font-bold text-white">{total}</p>
              </div>
              <AlertTriangle className="text-red-400 w-12 h-12 group-hover:scale-110 transition-transform" />
            </div>

            {/* Resolved Incidents Card */}

            <div className="bg-white/5 cursor-pointer border-2 border-emerald-400 p-6 rounded-2xl shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] transition-all hover:scale-105 hover:shadow-[0px_10px_30px_rgba(100,255,100,0.2),0px_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between group w-64 md:w-80 hover:border-green-500 ">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Resolved</h3>
                <p className="text-3xl font-bold text-white">{resolved}</p>
              </div>
              <CheckCircle2 className="text-emerald-400 w-12 h-12 group-hover:scale-110 transition-transform" />
            </div>

            {/* Unresolved Incidents Card */}
            <div className="bg-white/5  p-6 cursor-pointer rounded-2xl border-white/10 shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] transition-all hover:scale-105 hover:shadow-[0px_10px_30px_rgba(255,204,0,0.2),0px_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between group w-64 md:w-80 border-2 border-yellow-500">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Unresolved</h3>
                <p className="text-3xl font-bold text-white">{unresolved}</p>
              </div>
              <Timer className="text-yellow-400 w-12 h-12 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* User Analytics */}
          <section className="mt-6 md:mt-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Your Analytics
                  </h2>
                  <p className="text-sm md:text-base text-gray-400">
                    Real-time insights based on your reports
                  </p>
                </div>
                <select
                  className="w-full md:w-auto px-4 py-2 bg-slate-900/70 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  value={analyticsRange}
                  onChange={(e) => setAnalyticsRange(Number(e.target.value))}
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-gray-400">Total Reports</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsSummary.totals.total}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-gray-400">Resolution Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {getPercent(
                      analyticsSummary.totals.resolved,
                      analyticsSummary.totals.total
                    )}%
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-gray-400">Average Score</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsSummary.totals.averageScore.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-gray-400">Latest Report</p>
                  <p className="text-xl font-semibold text-white">
                    {analyticsSummary.totals.latestDate
                      ? analyticsSummary.totals.latestDate.toLocaleDateString()
                      : "No reports"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Severity Breakdown
                  </h3>
                  {[
                    { key: "high", label: "High", color: "bg-red-400" },
                    { key: "medium", label: "Medium", color: "bg-yellow-400" },
                    { key: "low", label: "Low", color: "bg-blue-400" },
                  ].map((item) => {
                    const count = analyticsSummary.severityCounts[item.key];
                    const percent = getPercent(count, analyticsSummary.totals.total);
                    return (
                      <div key={item.key} className="mb-4 last:mb-0">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>{item.label}</span>
                          <span>
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Status Overview
                  </h3>
                  {[
                    { key: "submitted", label: "Submitted", color: "bg-sky-400" },
                    {
                      key: "under investigation",
                      label: "Under Investigation",
                      color: "bg-amber-400",
                    },
                    { key: "resolved", label: "Resolved", color: "bg-emerald-400" },
                  ].map((item) => {
                    const count = analyticsSummary.statusCounts[item.key] || 0;
                    const percent = getPercent(count, analyticsSummary.totals.total);
                    return (
                      <div key={item.key} className="mb-4 last:mb-0">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>{item.label}</span>
                          <span>
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Monthly Trend
                  </h3>
                  {analyticsSummary.monthlyTrend.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsSummary.monthlyTrend.map((entry) => {
                        const maxCount = Math.max(
                          ...analyticsSummary.monthlyTrend.map((item) => item.count)
                        );
                        const width = maxCount
                          ? Math.round((entry.count / maxCount) * 100)
                          : 0;
                        return (
                          <div key={entry.key}>
                            <div className="flex justify-between text-sm text-gray-300 mb-1">
                              <span>{entry.label}</span>
                              <span>{entry.count}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/10">
                              <div
                                className="h-2 rounded-full bg-sky-400"
                                style={{ width: `${width}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No monthly data available.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Top Incident Types
                  </h3>
                  {analyticsSummary.topIncidentTypes.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsSummary.topIncidentTypes.map((entry) => (
                        <div
                          key={entry.type}
                          className="flex items-center justify-between text-sm text-gray-300"
                        >
                          <span className="truncate pr-2">{entry.type}</span>
                          <span className="text-white font-semibold">
                            {entry.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No incident type data available.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Activity
                </h3>
                {recentIncidents.length > 0 ? (
                  <div className="space-y-3">
                    {recentIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-300"
                      >
                        <div>
                          <span className="text-white font-semibold">
                            {incident.incidentType || "Incident"}
                          </span>
                          <span className="text-gray-500"> • </span>
                          <span className="capitalize">{incident.status}</span>
                        </div>
                        <span className="text-gray-400">
                          {incident.parsedDate
                            ? incident.parsedDate.toLocaleString()
                            : "Date unavailable"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No recent incidents yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* All Incidents - Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-white/10 overflow-hidden">
            <h2 className="text-xl font-semibold text-white p-6 border-b border-white/10 bg-white/5">
              All Incidents
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 text-center text-gray-400 font-medium">
                      ID
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Title
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Description
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Severity
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Status
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Location
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Evidence
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => {
                    let step = 0; // Default value

                    if (incident?.status?.toLowerCase() === "resolved") {
                      step = 2;
                    } else if (
                      incident?.status?.toLowerCase() === "under investigation"
                    ) {
                      step = 1;
                    }

                    return (
                      // Add return statement here
                      <tr
                        key={incident.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-color text-center"
                      >
                        <td className="p-4 text-gray-300">#{incident.id}</td>
                        <td className="p-4 text-white font-medium">
                          {incident.incidentType}
                        </td>
                        <td className="p-4 text-gray-300 max-w-xs">
                          <div className="line-clamp-2 overflow-y-auto">
                            {incident.description}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-lg px-4 py-2 bg-transparent w-28 text-center font-bold ${getSeverityColor(
                              incident.severity
                            )}`}
                          >
                            {incident.severity?.charAt(0).toUpperCase() +
                              incident.severity?.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center flex-col">
                            <div className="flex items-center space-x-2">
                              {/* Status Indicator */}
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  {/* Step 1 */}
                                  <div className={`w-3 h-3 rounded-full ${step >= 0 ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg shadow-blue-400/50' : 'bg-gray-600'}`}></div>
                                  <div className={`w-12 h-1 ${step >= 1 ? 'bg-gradient-to-r from-blue-400 to-yellow-400' : 'bg-gray-600'} rounded-full`}></div>
                                  
                                  {/* Step 2 */}
                                  <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-400/50' : 'bg-gray-600'}`}></div>
                                  <div className={`w-12 h-1 ${step >= 2 ? 'bg-gradient-to-r from-yellow-400 to-green-400' : 'bg-gray-600'} rounded-full`}></div>
                                  
                                  {/* Step 3 */}
                                  <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-400/50' : 'bg-gray-600'}`}></div>
                                </div>
                              </div>
                            </div>
                            {/* Current Status Label */}
                            <div className="mt-2">
                              <span className={`text-xs font-medium ${
                                step === 0 ? 'text-blue-400' : 
                                step === 1 ? 'text-yellow-400' : 
                                step === 2 ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                {step === 0 ? 'Reported' : 
                                 step === 1 ? 'Under Investigation' : 
                                 step === 2 ? 'Resolved' : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <a
                            href={getLocationUrl(incident)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors"
                          >
                            <MapPin className="text-xl" />
                          </a>
                        </td>
                        <td className="p-4">
                          {incident.file ? (
                            <div className="flex items-center justify-center gap-2">
                              {isImageEvidence(incident.file) && (
                                <img
                                  src={incident.file}
                                  alt={`Evidence for incident ${incident.id}`}
                                  className="h-10 w-10 rounded-lg object-cover border border-white/10"
                                />
                              )}
                              <a
                                href={incident.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-400 hover:text-sky-300 text-xs font-semibold"
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Popover>
                            <PopoverTrigger>
                             <button 
  className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors"
  onClick={() => navigate('/chat')}
>
  <MessageCircle className="text-xl" />
</button>
                            </PopoverTrigger>
                            <PopoverContent className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
                              <div className="p-4 bg-transparent rounded-xl border border-white/20">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  Chat with Authorities
                                </h3>
                                <p className="text-gray-300 mb-4 text-sm">
                                  Start a conversation with authorities to
                                  discuss this incident.
                                </p>
                                <button className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all">
                                  Start Chat
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Incidents - Mobile Card View */}
          <div className="md:hidden">
            <h2 className="text-xl font-semibold text-white mb-6">
              All Incidents
            </h2>
            <div className="space-y-4">
              {incidents.map((incident) => {
                let step = 0; // Default value

                if (incident?.status?.toLowerCase() === "resolved") {
                  step = 2;
                } else if (
                  incident?.status?.toLowerCase() === "under investigation"
                ) {
                  step = 1;
                }

                return (
                  <div
                    key={incident.id}
                    className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] hover:bg-white/10 transition-all"
                  >
                    {/* Header with ID and Title */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">#{incident.id}</span>
                        <h3 className="text-white font-semibold text-lg">
                          {incident.incidentType}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={getLocationUrl(incident)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors p-2 bg-sky-400/10 rounded-lg"
                        >
                          <MapPin className="w-5 h-5" />
                        </a>
                        <Popover>
                          <PopoverTrigger>
                            <button className="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors p-2 bg-sky-400/10 rounded-lg">
                              <MessageCircle className="w-5 h-5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
                            <div className="p-4 bg-transparent rounded-xl border border-white/20">
                              <h3 className="text-lg font-semibold text-white mb-2">
                                Chat with Authorities
                              </h3>
                              <p className="text-gray-300 mb-4 text-sm">
                                Start a conversation with authorities to
                                discuss this incident.
                              </p>
                              <button className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all">
                                Start Chat
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    {incident.file && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Evidence:</p>
                        <div className="flex items-center gap-3">
                          {isImageEvidence(incident.file) && (
                            <img
                              src={incident.file}
                              alt={`Evidence for incident ${incident.id}`}
                              className="h-12 w-12 rounded-lg object-cover border border-white/10"
                            />
                          )}
                          <a
                            href={incident.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 text-sm font-semibold hover:text-sky-300 transition-colors"
                          >
                            View Evidence
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Severity Badge */}
                    <div className="mb-4">
                      <span
                        className={`inline-block rounded-lg px-3 py-1 bg-transparent text-sm font-bold ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity?.charAt(0).toUpperCase() +
                          incident.severity?.slice(1)} Severity
                      </span>
                    </div>

                    {/* Status Progress */}
                    <div className="mb-2">
                      <p className="text-gray-400 text-sm mb-3">Status:</p>
                      <div className="flex items-center space-x-2">
                        {/* Modern Progress Bar */}
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex items-center space-x-2">
                            {/* Step 1 */}
                            <div className={`w-3 h-3 rounded-full ${step >= 0 ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg shadow-blue-400/50' : 'bg-gray-600'}`}></div>
                            <div className={`w-16 h-1 ${step >= 1 ? 'bg-gradient-to-r from-blue-400 to-yellow-400' : 'bg-gray-600'} rounded-full`}></div>
                            
                            {/* Step 2 */}
                            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-400/50' : 'bg-gray-600'}`}></div>
                            <div className={`w-16 h-1 ${step >= 2 ? 'bg-gradient-to-r from-yellow-400 to-green-400' : 'bg-gray-600'} rounded-full`}></div>
                            
                            {/* Step 3 */}
                            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg shadow-green-400/50' : 'bg-gray-600'}`}></div>
                          </div>
                        </div>
                      </div>
                      {/* Current Status Label */}
                      <div className="mt-3">
                        <span className={`text-sm font-medium ${
                          step === 0 ? 'text-blue-400' : 
                          step === 1 ? 'text-yellow-400' : 
                          step === 2 ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {step === 0 ? 'Reported' : 
                           step === 1 ? 'Under Investigation' : 
                           step === 2 ? 'Resolved' : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <FloatingChatbot />
    </>
  );
};

export default UserDashboard;