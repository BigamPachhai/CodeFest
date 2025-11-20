import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { problemsAPI, adminAPI, aiAPI } from "../../services/api";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  MessageSquare,
  TrendingUp,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminProblems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblems, setSelectedProblems] = useState(new Set());
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    municipality: "",
    priority: "",
    dateRange: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [problemsPerPage] = useState(10);
  const [actionMenu, setActionMenu] = useState(null);

  const statusOptions = ["pending", "in_progress", "resolved", "rejected"];
  const categoryOptions = ["waste", "electrical", "water", "street", "other"];
  const priorityOptions = ["low", "medium", "high", "critical"];
  const municipalityOptions = [
    "Butwal",
    "Siddharthanagar",
    "Lumbini Sanskritik",
    "Tillottama",
    "Devdaha",
    "Sainamaina",
    "Om Satiya",
    "Rohini",
    "Sammarimai",
    "Kotahimai",
    "Marchawari",
    "Mayadevi",
    "Omsatiya",
    "Siyari",
    "Suddodhan",
  ];

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterAndSortProblems();
  }, [problems, filters, sortConfig]);

  const fetchProblems = async () => {
    try {
      const response = await problemsAPI.getAll({ limit: 1000 });
      setProblems(response.data.data.problems);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProblems = () => {
    let filtered = [...problems];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchLower) ||
          problem.description.toLowerCase().includes(searchLower) ||
          problem.location?.municipality.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (problem) => problem.status === filters.status
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        (problem) => problem.category === filters.category
      );
    }

    if (filters.municipality) {
      filtered = filtered.filter(
        (problem) => problem.location?.municipality === filters.municipality
      );
    }

    if (filters.priority) {
      filtered = filtered.filter(
        (problem) => problem.priority === filters.priority
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "location.municipality") {
          aValue = a.location?.municipality;
          bValue = b.location?.municipality;
        } else if (sortConfig.key === "upvoteCount") {
          aValue = a.upvoteCount || 0;
          bValue = b.upvoteCount || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProblems(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const handleStatusUpdate = async (problemId, newStatus) => {
    try {
      await adminAPI.updateStatus(problemId, { status: newStatus });
      toast.success(`Problem status updated to ${newStatus}`);
      fetchProblems(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update problem status");
    }
  };

  const handleGenerateReport = async (problemId) => {
    try {
      const response = await adminAPI.generateReport(problemId);
      // Create a blob from the PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `problem-report-${problemId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProblems.size === 0) {
      toast.error("Please select problems to perform this action");
      return;
    }

    try {
      switch (action) {
        case "export":
          // Implement bulk export
          toast.success(`Exporting ${selectedProblems.size} problems`);
          break;
        case "assign":
          // Implement bulk assignment
          toast.success(`Assigning ${selectedProblems.size} problems`);
          break;
        default:
          break;
      }
      setSelectedProblems(new Set());
    } catch (error) {
      toast.error("Failed to perform bulk action");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(currentProblems.map((p) => p._id));
      setSelectedProblems(allIds);
    } else {
      setSelectedProblems(new Set());
    }
  };

  const handleSelectProblem = (problemId) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemId)) {
      newSelected.delete(problemId);
    } else {
      newSelected.add(problemId);
    }
    setSelectedProblems(newSelected);
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
      case "rejected":
        return "bg-red-100 text-red-800";
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

  // Pagination
  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(
    indexOfFirstProblem,
    indexOfLastProblem
  );
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problems...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Problem Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and monitor all reported problems in Rupandehi District
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Municipality Filter */}
            <select
              value={filters.municipality}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  municipality: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
            >
              <option value="">All Municipalities</option>
              {municipalityOptions.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedProblems.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-700 font-medium">
                {selectedProblems.size} problem(s) selected
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBulkAction("export")}
                  className="flex items-center space-x-2 bg-white text-blue-700 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Selected</span>
                </button>
                <button
                  onClick={() => handleBulkAction("assign")}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <span>Assign to Department</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Problems Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedProblems.size === currentProblems.length &&
                        currentProblems.length > 0
                      }
                      className="rounded border-gray-300 text-nepali-blue focus:ring-nepali-blue"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Problem</span>
                      {sortConfig.key === "title" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("location.municipality")}
                  >
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                      {sortConfig.key === "location.municipality" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("upvoteCount")}
                  >
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Upvotes</span>
                      {sortConfig.key === "upvoteCount" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Reported</span>
                      {sortConfig.key === "createdAt" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProblems.length > 0 ? (
                  currentProblems.map((problem) => (
                    <tr key={problem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProblems.has(problem._id)}
                          onChange={() => handleSelectProblem(problem._id)}
                          className="rounded border-gray-300 text-nepali-blue focus:ring-nepali-blue"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {problem.title}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                              {problem.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {problem.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{problem.reporter?.name || "Anonymous"}</span>
                            <MessageSquare className="w-3 h-3 ml-2" />
                            <span>{problem.comments?.length || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {problem.location?.municipality}
                        </div>
                        <div className="text-sm text-gray-500">
                          Ward {problem.location?.ward}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={problem.status}
                          onChange={(e) =>
                            handleStatusUpdate(problem._id, e.target.value)
                          }
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-nepali-blue ${getStatusColor(
                            problem.status
                          )}`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {problem.priority ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                              problem.priority
                            )}`}
                          >
                            {problem.priority}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{problem.upvoteCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/problems/${problem._id}`}
                            className="text-gray-400 hover:text-nepali-blue transition-colors"
                            title="View Problem"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleGenerateReport(problem._id)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Generate Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActionMenu(
                                  actionMenu === problem._id
                                    ? null
                                    : problem._id
                                )
                              }
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {actionMenu === problem._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleStatusUpdate(
                                        problem._id,
                                        "in_progress"
                                      );
                                      setActionMenu(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Mark In Progress
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleStatusUpdate(
                                        problem._id,
                                        "resolved"
                                      );
                                      setActionMenu(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Mark Resolved
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Implement assign functionality
                                      setActionMenu(null);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Assign to Department
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        No problems found matching your filters
                      </p>
                      <button
                        onClick={() =>
                          setFilters({
                            search: "",
                            status: "",
                            category: "",
                            municipality: "",
                            priority: "",
                            dateRange: "",
                          })
                        }
                        className="text-nepali-blue hover:text-blue-700 mt-2"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstProblem + 1} to{" "}
                  {Math.min(indexOfLastProblem, filteredProblems.length)} of{" "}
                  {filteredProblems.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border text-sm font-medium rounded-md ${
                          currentPage === page
                            ? "bg-nepali-blue text-white border-nepali-blue"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProblems;
