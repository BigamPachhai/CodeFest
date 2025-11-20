import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { problemsAPI, adminAPI } from "../../services/api";
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
  Edit,
  Building,
  Calendar,
  Award,
  MessageSquare,
  Filter,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [assignedProblems, setAssignedProblems] = useState([]);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Get department from user role or department field
  const userDepartment =
    user?.department || user?.role === "department" ? "waste" : "general";

  const departmentInfo = {
    waste: {
      name: "Waste Management Department",
      color: "#DC143C",
      icon: "🗑️",
      description:
        "Handling garbage collection, sanitation, and waste disposal issues",
    },
    electrical: {
      name: "Electrical Department",
      color: "#003893",
      icon: "⚡",
      description:
        "Managing electrical infrastructure, power outages, and street lighting",
    },
    water: {
      name: "Water Supply Department",
      color: "#87CEEB",
      icon: "💧",
      description: "Overseeing water supply, pipelines, and drainage systems",
    },
    street: {
      name: "Public Works Department",
      color: "#FF8C00",
      icon: "🛣️",
      description: "Maintaining roads, footpaths, and public infrastructure",
    },
    other: {
      name: "General Administration",
      color: "#6B7280",
      icon: "🏢",
      description: "Handling general civic issues and administrative matters",
    },
  };

  const currentDept = departmentInfo[userDepartment] || departmentInfo.other;

  useEffect(() => {
    fetchDepartmentData();
  }, [userDepartment]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);

      // Fetch problems assigned to this department
      const problemsResponse = await problemsAPI.getAll({
        category: userDepartment,
        limit: 50,
      });

      const deptProblems = problemsResponse.data.data.problems;
      setAssignedProblems(deptProblems);

      // Calculate department statistics
      const stats = {
        total: deptProblems.length,
        pending: deptProblems.filter((p) => p.status === "pending").length,
        inProgress: deptProblems.filter((p) => p.status === "in_progress")
          .length,
        resolved: deptProblems.filter((p) => p.status === "resolved").length,
        critical: deptProblems.filter((p) => p.priority === "critical").length,
        high: deptProblems.filter((p) => p.priority === "high").length,
      };

      setDepartmentStats(stats);

      // Simulate recent activity
      const activity = deptProblems.slice(0, 5).map((problem) => ({
        id: problem._id,
        action: problem.status === "resolved" ? "resolved" : "updated",
        problemTitle: problem.title,
        timestamp: problem.updatedAt,
        user: problem.assignedTo?.name || "System",
      }));

      setRecentActivity(activity);
    } catch (error) {
      console.error("Failed to fetch department data:", error);
      toast.error("Failed to load department data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (problemId, newStatus) => {
    try {
      await adminAPI.updateStatus(problemId, { status: newStatus });
      toast.success(`Problem status updated to ${newStatus}`);
      fetchDepartmentData(); // Refresh data
    } catch (error) {
      toast.error("Failed to update problem status");
    }
  };

  const handleAssignToSelf = async (problemId) => {
    try {
      await adminAPI.updateStatus(problemId, {
        assignedTo: user._id,
        status: "in_progress",
      });
      toast.success("Problem assigned to you");
      fetchDepartmentData(); // Refresh data
    } catch (error) {
      toast.error("Failed to assign problem");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Chart data for department analytics
  const statusChartData = [
    {
      name: "Resolved",
      value: departmentStats?.resolved || 0,
      color: "#10B981",
    },
    {
      name: "In Progress",
      value: departmentStats?.inProgress || 0,
      color: "#3B82F6",
    },
    { name: "Pending", value: departmentStats?.pending || 0, color: "#F59E0B" },
  ];

  const priorityChartData = [
    {
      name: "Critical",
      value: departmentStats?.critical || 0,
      color: "#DC2626",
    },
    { name: "High", value: departmentStats?.high || 0, color: "#EA580C" },
    {
      name: "Medium",
      value:
        (departmentStats?.total || 0) -
        (departmentStats?.critical || 0) -
        (departmentStats?.high || 0),
      color: "#D97706",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading department dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: currentDept.color }}
              >
                {currentDept.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentDept.name}
                </h1>
                <p className="text-gray-600 mt-1">{currentDept.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: currentDept.color }}
              >
                Department Staff
              </span>
              <Building className="w-6 h-6 text-gray-400" />
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
                  Total Assigned
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {departmentStats?.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Problems in your department
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
                  {departmentStats?.resolved || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {departmentStats?.total
                    ? Math.round(
                        (departmentStats.resolved / departmentStats.total) * 100
                      )
                    : 0}
                  % completion rate
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {departmentStats?.inProgress || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Currently being addressed
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {(departmentStats?.critical || 0) +
                    (departmentStats?.high || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Require immediate attention
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Status Overview Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Problem Status Overview
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Number of Problems"
                    fill={currentDept.color}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Priority Distribution
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Assigned Problems */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Assigned Problems
              </h2>

              {/* Tabs */}
              <div className="flex space-x-1 mt-4 sm:mt-0">
                {[
                  {
                    key: "all",
                    label: "All",
                    count: departmentStats?.total || 0,
                  },
                  {
                    key: "pending",
                    label: "Pending",
                    count: departmentStats?.pending || 0,
                  },
                  {
                    key: "in_progress",
                    label: "In Progress",
                    count: departmentStats?.inProgress || 0,
                  },
                  {
                    key: "resolved",
                    label: "Resolved",
                    count: departmentStats?.resolved || 0,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-nepali-blue text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {assignedProblems.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Problems Assigned
                </h3>
                <p className="text-gray-500">
                  There are currently no problems assigned to your department.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedProblems
                  .filter(
                    (problem) =>
                      activeTab === "all" || problem.status === activeTab
                  )
                  .map((problem) => (
                    <div
                      key={problem._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {problem.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                problem.status
                              )}`}
                            >
                              {getStatusIcon(problem.status)}
                              <span className="ml-1 capitalize">
                                {problem.status.replace("_", " ")}
                              </span>
                            </span>
                            {problem.priority && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                  problem.priority
                                )}`}
                              >
                                {problem.priority} priority
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {problem.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {problem.location?.municipality}, Ward{" "}
                                {problem.location?.ward}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Reported{" "}
                                {new Date(
                                  problem.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>
                                {problem.comments?.length || 0} comments
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{problem.upvoteCount || 0} upvotes</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                          <Link
                            to={`/problems/${problem._id}`}
                            className="btn-primary flex items-center space-x-2 px-4 py-2 text-center justify-center"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </Link>

                          {problem.status === "pending" && (
                            <button
                              onClick={() => handleAssignToSelf(problem._id)}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <span>Assign to Me</span>
                            </button>
                          )}

                          {problem.status !== "resolved" && (
                            <select
                              value={problem.status}
                              onChange={(e) =>
                                handleStatusUpdate(problem._id, e.target.value)
                              }
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Resolution form for in-progress problems */}
                      {problem.status === "in_progress" && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">
                            Update Resolution Progress
                          </h4>
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              placeholder="Brief update on progress..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                            />
                            <button
                              onClick={() =>
                                handleStatusUpdate(problem._id, "resolved")
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Mark Resolved
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: currentDept.color }}
                    >
                      {activity.action === "resolved" ? "✓" : "↻"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        {activity.action} problem{" "}
                        <span className="font-medium">
                          "{activity.problemTitle}"
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No recent activity</p>
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
              <button
                onClick={() => toast.success("Opening problem assignment")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nepali-blue hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Assign New Problems
                    </h3>
                    <p className="text-sm text-gray-600">
                      Take on new pending issues
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => toast.success("Generating department report")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nepali-blue hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Generate Report
                    </h3>
                    <p className="text-sm text-gray-600">
                      Export department performance
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => toast.success("Opening resource management")}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nepali-blue hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Resource Management
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage team and equipment
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={fetchDepartmentData}
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
                      Update dashboard information
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

export default DepartmentDashboard;
