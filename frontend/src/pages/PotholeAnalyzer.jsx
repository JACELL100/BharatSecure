import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Upload, AlertTriangle, FileText, TrendingUp, DollarSign, RefreshCw, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/pothole/api';

const PotholeAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [view, setView] = useState('upload');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('location', '');

    try {
      const response = await axios.post(`${API_BASE_URL}/analyses/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(response.data);
      fetchAnalyses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyses/`);
      setAnalyses(response.data);
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
    }
  };

  const deleteAnalysis = async (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await axios.delete(`${API_BASE_URL}/analyses/${id}/`);
        fetchAnalyses();
        if (analysis?.id === id) {
          setAnalysis(null);
        }
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'from-emerald-500 to-green-500',
      medium: 'from-amber-500 to-yellow-500',
      high: 'from-orange-500 to-red-500',
      critical: 'from-red-600 to-rose-600',
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityBadgeColor = (severity) => {
    const colors = {
      low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      medium: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      critical: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10 px-2"
        >
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-[0_0_10px_cyan]">
            Pothole Analysis System
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg max-w-lg sm:max-w-2xl mx-auto">
            AI-powered pothole detection and severity assessment for road safety
          </p>

          {/* View Toggle */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setView('upload')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                view === 'upload'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Upload & Analyze
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                view === 'history'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              History ({analyses.length})
            </button>
          </div>
        </motion.div>

        {view === 'upload' ? (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500 transition-all duration-300 hover:shadow-[0_0_20px_cyan]">
                <label className="text-gray-300 text-sm font-medium mb-3 block">
                  <Camera className="w-4 h-4 inline-block mr-2 text-cyan-400" />
                  Upload Pothole Image
                </label>
                
                <div className="mt-1 flex justify-center px-2 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-slate-700 border-dashed rounded-xl hover:border-cyan-400 transition-colors duration-200">
                  <div className="space-y-1 text-center w-full">
                    <Camera className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    <div className="flex flex-col sm:flex-row items-center justify-center text-xs sm:text-sm text-gray-400 gap-1 sm:gap-0">
                      <label className="relative cursor-pointer rounded-md font-medium text-cyan-400 hover:text-cyan-300">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                      </label>
                      <span className="hidden sm:inline pl-1">or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500 transition-all duration-300 hover:shadow-[0_0_20px_cyan]"
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg object-cover max-h-64 mb-4"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Pothole'}
                  </motion.button>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl"
                >
                  <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                  {error}
                </motion.div>
              )}
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500 transition-all duration-300 hover:shadow-[0_0_20px_cyan]"
            >
              {analysis ? (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Analysis Results</h2>

                  <div
                    className={`bg-gradient-to-r ${getSeverityColor(analysis.severity)} px-4 py-3 rounded-xl text-center font-bold text-lg text-white shadow-lg`}
                  >
                    <AlertTriangle className="w-5 h-5 inline-block mr-2" />
                    {analysis.severity?.toUpperCase()} SEVERITY
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Dimensions</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.width_cm} × {analysis.height_cm} cm
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Area</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.area_cm2} cm²
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Est. Depth</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        ~{analysis.depth_estimate} cm
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Perimeter</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.perimeter_cm} cm
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Impact Score</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.impact_score}/10
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Priority</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        Level {analysis.repair_priority}/5
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Repair Cost</span>
                      <span className="text-base sm:text-lg font-semibold text-green-400">
                        ${analysis.estimated_repair_cost}
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Confidence</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {(analysis.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {analysis.processed_image_url && (
                    <div className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Annotated Image</h3>
                      <img
                        src={analysis.processed_image_url}
                        alt="Processed"
                        className="w-full rounded-lg border border-cyan-500/30"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">Upload an image to see analysis results</p>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Analysis History
              </h2>
              <button
                onClick={fetchAnalyses}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium rounded-xl border border-slate-700 transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {analyses.length === 0 ? (
              <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-16 text-center border border-cyan-500">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No analyses yet. Upload your first pothole image!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {analyses.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900 rounded-xl overflow-hidden border border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                    onClick={() => {
                      setAnalysis(item);
                      setView('upload');
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={`Analysis ${item.id}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <div
                        className={`${getSeverityBadgeColor(item.severity)} px-3 py-1 rounded-full text-xs sm:text-sm font-semibold inline-block border`}
                      >
                        {item.severity?.toUpperCase()}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span className="text-gray-400">Size:</span>
                          <span className="font-semibold">{item.area_cm2} cm²</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span className="text-gray-400">Depth:</span>
                          <span className="font-semibold">~{item.depth_estimate} cm</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span className="text-gray-400">Cost:</span>
                          <span className="font-semibold text-green-400">
                            ${item.estimated_repair_cost}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnalysis(item.id);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PotholeAnalyzer;