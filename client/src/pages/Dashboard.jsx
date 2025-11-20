import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { problemsAPI } from "../services/api";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  MessageSquare,
  Plus,
  Eye,
  Award,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchUserProblems();
  }, []);

  const fetchUserProblems = async () => {
    try {
      const response = await problemsAPI.getAll();
      const userProblems = response.data.data.problems.filter(
        (problem) => problem.reporter?._id === user?._id
      );

      setProblems(userProblems);

      // Calculate stats
      const stats = {
        total: userProblems.length,
        pending: userProblems.filter((p) => p.status === "pending").length,
        inProgress: userProblems.filter((p) => p.status === "in_progress")
          .length,
        resolved: userProblems.filter((p) => p.status === "resolved").length,
      };
      setStats(stats);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((problem) => {
    if (activeTab === "all") return true;
    return problem.status === activeTab;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's an overview of your reported problems and community
                impact.
              </p>
            </div>
            <Link
              to="/report"
              className="btn-secondary mt-4 md:mt-0 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Report New Problem</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.pending}
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
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.resolved}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* User Points and Rank */}
        <div className="bg-linear-to-r from-nepali-blue to-nepali-darkblue text-white p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Your Community Impact
              </h3>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-2xl font-bold">{user?.points || 0}</p>
                  <p className="text-blue-200 text-sm">Points Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-blue-200 text-sm">Problems Solved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{problems.length}</p>
                  <p className="text-blue-200 text-sm">Total Reports</p>
                </div>
              </div>
            </div>
            <Award className="w-12 h-12 text-yellow-300" />
          </div>
        </div>

        {/* Problems Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Reported Problems
              </h2>

              {/* Tabs */}
              <div className="flex space-x-1 mt-4 sm:mt-0">
                {[
                  { key: "all", label: "All", count: stats.total },
                  { key: "pending", label: "Pending", count: stats.pending },
                  {
                    key: "in_progress",
                    label: "In Progress",
                    count: stats.inProgress,
                  },
                  { key: "resolved", label: "Resolved", count: stats.resolved },
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
            {filteredProblems.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "all"
                    ? "No problems reported yet"
                    : `No ${activeTab} problems`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "all"
                    ? "Start by reporting a problem in your community."
                    : `You don't have any ${activeTab.replace(
                        "_",
                        " "
                      )} problems.`}
                </p>
                {activeTab === "all" && (
                  <Link
                    to="/report"
                    className="btn-secondary inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Report Your First Problem</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProblems.map((problem) => (
                  <div
                    key={problem._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
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
                          {problem.priority &&
                            problem.priority !== "medium" && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                  problem.priority
                                )}`}
                              >
                                {problem.priority}
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
                            <AlertCircle className="w-4 h-4" />
                            <span className="capitalize">
                              {problem.category}
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

                      <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-3">
                        <Link
                          to={`/problems/${problem._id}`}
                          className="btn-primary flex items-center space-x-2 px-4 py-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>

                    {/* Resolution details if resolved */}
                    {problem.status === "resolved" &&
                      problem.resolutionDetails && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-800 mb-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold">Resolved</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            {problem.resolutionDetails.resolutionDescription}
                          </p>
                          {problem.resolutionDetails.resolvedAt && (
                            <p className="text-green-600 text-xs mt-1">
                              Resolved on{" "}
                              {new Date(
                                problem.resolutionDetails.resolvedAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/map"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <MapPin className="w-8 h-8 text-nepali-blue mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              View Problem Map
            </h3>
            <p className="text-gray-600 text-sm">
              See all reported problems in your area
            </p>
          </Link>

          <Link
            to="/leaderboard"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Community Leaderboard
            </h3>
            <p className="text-gray-600 text-sm">
              See top contributors in Rupandehi
            </p>
          </Link>

          <Link
            to="/profile"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Your Profile</h3>
            <p className="text-gray-600 text-sm">
              View and edit your profile information
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
