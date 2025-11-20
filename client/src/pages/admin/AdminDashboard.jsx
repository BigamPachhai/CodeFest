import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { adminAPI, problemsAPI, aiAPI } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  MapPin,
  Download,
  Eye,
  Shield,
  BarChart3,
  Calendar,
  Award,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProblems, setRecentProblems] = useState([]);
  const [priorityProblems, setPriorityProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, problemsResponse, priorityResponse] =
        await Promise.all([
          adminAPI.getStats(),
          problemsAPI.getAll({
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
          aiAPI.prioritizeProblems(),
        ]);

      setStats(statsResponse.data.data);
      setRecentProblems(problemsResponse.data.data.problems);
      setPriorityProblems(
        priorityResponse.data.data.prioritizedProblems.slice(0, 5)
      );
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const categoryColors = {
    waste: "#DC143C",
    electrical: "#003893",
    water: "#87CEEB",
    street: "#FF8C00",
    other: "#6B7280",
  };

  const municipalityColors = [
    "#DC143C",
    "#003893",
    "#87CEEB",
    "#FF8C00",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#8B5CF6",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-nepali-blue text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-200 mt-2">
                Welcome back, {user?.name}. Here's your overview of Rupandehi
                problems.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-yellow-300" />
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Problems
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.overview?.total || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +12% from last week
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.overview?.resolved || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.overview?.resolutionRate || 0}% resolution rate
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats?.overview?.pending || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Need immediate attention
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.overview?.inProgress || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Being worked on</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Problems by Category */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Problems by Category
              </h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.byCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Total Reports" fill="#003893" />
                  <Bar dataKey="resolved" name="Resolved" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Problems by Municipality */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Problems by Municipality
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.byMunicipality || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats?.byMunicipality?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          municipalityColors[index % municipalityColors.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Monthly Trends
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.monthlyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    stroke="#003893"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Priority Problems */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                High Priority Problems
              </h2>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                AI Recommended
              </span>
            </div>

            <div className="space-y-4">
              {priorityProblems.length > 0 ? (
                priorityProblems.map((problem, index) => (
                  <div
                    key={problem._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {problem.title}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{problem.location?.municipality}</span>
                          </span>
                          <span className="capitalize">{problem.category}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              problem.status
                            )}`}
                          >
                            {problem.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                              problem.priority
                            )}`}
                          >
                            {problem.priority} priority
                          </span>
                          {problem.priorityScore && (
                            <span className="text-xs text-gray-500">
                              Score: {problem.priorityScore.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/problems/${problem._id}`}
                        className="ml-4 flex items-center space-x-1 text-nepali-blue hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No high priority problems found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Problems and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Problems */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Problems
              </h2>
              <Link
                to="/admin/problems"
                className="text-nepali-blue hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {recentProblems.length > 0 ? (
                recentProblems.map((problem) => (
                  <div
                    key={problem._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {problem.title}
                        </h3>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {problem.location?.municipality}, W
                              {problem.location?.ward}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{problem.reporter?.name || "Anonymous"}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{problem.comments?.length || 0}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              problem.status
                            )}`}
                          >
                            {problem.status}
                          </span>
                          <span className="capitalize text-sm text-gray-600">
                            {problem.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/problems/${problem._id}`}
                          className="p-2 text-gray-400 hover:text-nepali-blue transition-colors"
                          title="View Problem"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            // Generate report logic
                            toast.success("Report generation started");
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Generate Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No problems reported yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>

            <div className="space-y-4">
              <Link
                to="/admin/problems"
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nepali-blue hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Manage Problems
                    </h3>
                    <p className="text-sm text-gray-600">
                      View and manage all problems
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/users"
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nepali-blue hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      User Management
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage users and permissions
                    </p>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => toast.success("Export started")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nepali-blue hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Download className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Export Data</h3>
                    <p className="text-sm text-gray-600">
                      Export reports and analytics
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={fetchDashboardData}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nepali-blue hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Refresh Data
                    </h3>
                    <p className="text-sm text-gray-600">
                      Update dashboard statistics
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
