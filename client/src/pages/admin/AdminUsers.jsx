import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { adminAPI } from "../../services/api";
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  User,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Edit,
  Eye,
  Send,
  Download,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    verificationStatus: "",
    municipality: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [actionMenu, setActionMenu] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const roleOptions = ["user", "admin", "department"];
  const verificationOptions = ["pending", "verified", "rejected"];
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
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, filters, sortConfig]);

  const fetchUsers = async () => {
    try {
      // Since we don't have a specific users API, we'll simulate the data
      // In a real app, you would have an API endpoint like adminAPI.getUsers()
      const mockUsers = [
        {
          _id: "1",
          name: "Ram Bahadur",
          email: "ram.bahadur@example.com",
          phone: "+977 9841234567",
          role: "user",
          verificationStatus: "verified",
          points: 150,
          location: {
            municipality: "Butwal",
            ward: 5,
          },
          createdAt: "2024-01-15T10:30:00Z",
          reportsCount: 12,
        },
        {
          _id: "2",
          name: "Sita Kumari",
          email: "sita.kumari@example.com",
          phone: "+977 9851234567",
          role: "user",
          verificationStatus: "pending",
          points: 80,
          location: {
            municipality: "Siddharthanagar",
            ward: 3,
          },
          createdAt: "2024-02-01T14:20:00Z",
          reportsCount: 8,
        },
        {
          _id: "3",
          name: "Waste Management Dept",
          email: "waste@rupandehi.gov.np",
          phone: "+977 71-123456",
          role: "department",
          verificationStatus: "verified",
          points: 0,
          department: "waste",
          location: {
            municipality: "Butwal",
            ward: 1,
          },
          createdAt: "2024-01-10T09:00:00Z",
          reportsCount: 0,
        },
        {
          _id: "4",
          name: "Admin User",
          email: "admin@rupandehi.gov.np",
          phone: "+977 71-654321",
          role: "admin",
          verificationStatus: "verified",
          points: 0,
          location: {
            municipality: "Butwal",
            ward: 1,
          },
          createdAt: "2024-01-01T08:00:00Z",
          reportsCount: 0,
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    if (filters.verificationStatus) {
      filtered = filtered.filter(
        (user) => user.verificationStatus === filters.verificationStatus
      );
    }

    if (filters.municipality) {
      filtered = filtered.filter(
        (user) => user.location?.municipality === filters.municipality
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
        } else if (sortConfig.key === "points") {
          aValue = a.points || 0;
          bValue = b.points || 0;
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

    setFilteredUsers(filtered);
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

  const handleVerificationUpdate = async (userId, newStatus) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, verificationStatus: newStatus }
            : user
        )
      );

      toast.success(`User verification status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update verification status");
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) {
      toast.error("Please select users to perform this action");
      return;
    }

    try {
      switch (action) {
        case "verify":
          // Bulk verify users
          setUsers((prev) =>
            prev.map((user) =>
              selectedUsers.has(user._id)
                ? { ...user, verificationStatus: "verified" }
                : user
            )
          );
          toast.success(`Verified ${selectedUsers.size} user(s)`);
          break;
        case "export":
          toast.success(`Exporting ${selectedUsers.size} users`);
          break;
        case "message":
          toast.success(`Preparing to message ${selectedUsers.size} users`);
          break;
        default:
          break;
      }
      setSelectedUsers(new Set());
    } catch (error) {
      toast.error("Failed to perform bulk action");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(currentUsers.map((u) => u._id));
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getVerificationColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "department":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "department":
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage user accounts, roles, and verification status
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Add User</span>
              </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
            >
              <option value="">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            {/* Verification Filter */}
            <select
              value={filters.verificationStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  verificationStatus: e.target.value,
                }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
            >
              <option value="">All Status</option>
              {verificationOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-700 font-medium">
                {selectedUsers.size} user(s) selected
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBulkAction("verify")}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Selected</span>
                </button>
                <button
                  onClick={() => handleBulkAction("message")}
                  className="flex items-center space-x-2 bg-white text-blue-700 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => handleBulkAction("export")}
                  className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
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
                        selectedUsers.size === currentUsers.length &&
                        currentUsers.length > 0
                      }
                      className="rounded border-gray-300 text-nepali-blue focus:ring-nepali-blue"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>User</span>
                      {sortConfig.key === "name" && (
                        <span>
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("points")}
                  >
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-gray-300 text-nepali-blue focus:ring-nepali-blue"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name
                            )}&background=003893&color=fff`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.reportsCount || 0} reports
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center space-x-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.location?.municipality}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.location?.ward
                            ? `Ward ${user.location.ward}`
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleUpdate(user._id, e.target.value)
                          }
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-nepali-blue ${getRoleColor(
                            user.role
                          )}`}
                          disabled={user._id === user._id} // Don't allow changing own role
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.verificationStatus}
                          onChange={(e) =>
                            handleVerificationUpdate(user._id, e.target.value)
                          }
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-nepali-blue ${getVerificationColor(
                            user.verificationStatus
                          )}`}
                        >
                          {verificationOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.points || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-gray-400 hover:text-nepali-blue transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              // View user details
                              toast.success(`Viewing ${user.name}'s profile`);
                            }}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActionMenu(
                                  actionMenu === user._id ? null : user._id
                                )
                              }
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {actionMenu === user._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      // Send message
                                      setActionMenu(null);
                                      toast.success(
                                        `Preparing to message ${user.name}`
                                      );
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Send Message
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Reset password
                                      setActionMenu(null);
                                      toast.success(
                                        `Password reset initiated for ${user.name}`
                                      );
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Reset Password
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Deactivate account
                                      setActionMenu(null);
                                      toast.success(
                                        `Account deactivated for ${user.name}`
                                      );
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    Deactivate Account
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
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        No users found matching your filters
                      </p>
                      <button
                        onClick={() =>
                          setFilters({
                            search: "",
                            role: "",
                            verificationStatus: "",
                            municipality: "",
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
                  Showing {indexOfFirstUser + 1} to{" "}
                  {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                  {filteredUsers.length} users
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {users.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Verified Users
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {
                    users.filter((u) => u.verificationStatus === "verified")
                      .length
                  }
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Verification
                </p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {
                    users.filter((u) => u.verificationStatus === "pending")
                      .length
                  }
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Department Users
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {users.filter((u) => u.role === "department").length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-nepali-blue focus:border-nepali-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-nepali-blue focus:border-nepali-blue"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save changes
                    setShowUserModal(false);
                    toast.success("User updated successfully");
                  }}
                  className="flex-1 bg-nepali-blue text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
