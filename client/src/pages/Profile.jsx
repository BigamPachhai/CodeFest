import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { problemsAPI } from "../services/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Award,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [userProblems, setUserProblems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    upvotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: {
      municipality: "",
      ward: "",
    },
  });
  const [activeTab, setActiveTab] = useState("overview");

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
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: {
          municipality: user.location?.municipality || "",
          ward: user.location?.ward?.toString() || "",
        },
      });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await problemsAPI.getAll();
      const userProblemsData = response.data.data.problems.filter(
        (problem) => problem.reporter?._id === user?._id
      );

      setUserProblems(userProblemsData);

      // Calculate stats
      const userStats = {
        total: userProblemsData.length,
        pending: userProblemsData.filter((p) => p.status === "pending").length,
        inProgress: userProblemsData.filter((p) => p.status === "in_progress")
          .length,
        resolved: userProblemsData.filter((p) => p.status === "resolved")
          .length,
        upvotes: userProblemsData.reduce(
          (sum, problem) => sum + (problem.upvoteCount || 0),
          0
        ),
      };

      setStats(userStats);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Simulate API call to update user
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedUser = {
        ...user,
        ...editForm,
        location: {
          municipality: editForm.location.municipality,
          ward: parseInt(editForm.location.ward),
        },
      };

      updateUser(updatedUser);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: {
        municipality: user.location?.municipality || "",
        ward: user.location?.ward?.toString() || "",
      },
    });
    setEditing(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate avatar upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedUser = { ...user, avatar: e.target.result };
        updateUser(updatedUser);
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const getVerificationStatus = () => {
    switch (user?.verificationStatus) {
      case "verified":
        return {
          color: "text-green-600 bg-green-100",
          icon: CheckCircle,
          label: "Verified",
        };
      case "pending":
        return {
          color: "text-yellow-600 bg-yellow-100",
          icon: Clock,
          label: "Pending Verification",
        };
      default:
        return {
          color: "text-red-600 bg-red-100",
          icon: AlertTriangle,
          label: "Not Verified",
        };
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case "admin":
        return {
          color: "bg-purple-100 text-purple-800",
          icon: Shield,
          label: "Administrator",
        };
      case "department":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: User,
          label: "Department Staff",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: User,
          label: "Community Member",
        };
    }
  };

  const exportUserData = () => {
    const userData = {
      profile: user,
      statistics: stats,
      problems: userProblems,
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rupandehi-samadhan-profile-${user?.name}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Profile data exported successfully!");
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.name}'s Rupandehi Samadhan Profile`,
        text: `Check out my community contributions on Rupandehi Samadhan!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const verificationStatus = getVerificationStatus();
  const roleBadge = getRoleBadge();
  const VerificationIcon = verificationStatus.icon;
  const RoleIcon = roleBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account and track your contributions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportUserData}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <button
                onClick={shareProfile}
                className="flex items-center space-x-2 bg-nepali-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name
                      )}&background=003893&color=fff`
                    }
                    alt={user?.name}
                    className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg"
                  />
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-nepali-blue text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {user?.name}
                </h2>
                <p className="text-gray-600">{user?.email}</p>

                {/* Verification Status */}
                <div
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${verificationStatus.color}`}
                >
                  <VerificationIcon className="w-4 h-4" />
                  <span>{verificationStatus.label}</span>
                </div>

                {/* Role Badge */}
                <div
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${roleBadge.color}`}
                >
                  <RoleIcon className="w-4 h-4" />
                  <span>{roleBadge.label}</span>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-center space-x-1 text-gray-500 text-sm mt-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Member since{" "}
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full mt-6 flex items-center justify-center space-x-2 bg-nepali-blue text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Points Earned</span>
                  <span className="font-semibold text-nepali-blue">
                    {user?.points || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Problems Reported</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Problems Resolved</span>
                  <span className="font-semibold text-green-600">
                    {stats.resolved}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Upvotes</span>
                  <span className="font-semibold text-orange-600">
                    {stats.upvotes}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {[
                  { key: "overview", label: "Overview", icon: BarChart3 },
                  {
                    key: "problems",
                    label: "My Problems",
                    icon: AlertTriangle,
                  },
                  { key: "settings", label: "Settings", icon: User },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? "border-nepali-blue text-nepali-blue"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.total}
                        </div>
                        <div className="text-sm text-blue-800">
                          Total Reports
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.resolved}
                        </div>
                        <div className="text-sm text-green-800">Resolved</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {stats.pending}
                        </div>
                        <div className="text-sm text-yellow-800">Pending</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.upvotes}
                        </div>
                        <div className="text-sm text-orange-800">Upvotes</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {userProblems.slice(0, 5).map((problem) => (
                          <div
                            key={problem._id}
                            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                problem.status === "resolved"
                                  ? "bg-green-500"
                                  : problem.status === "in_progress"
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {problem.title}
                              </h4>
                              <p className="text-sm text-gray-500 capitalize">
                                {problem.status.replace("_", " ")} •{" "}
                                {new Date(
                                  problem.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">
                                {problem.upvoteCount || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                upvotes
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* My Problems Tab */}
                {activeTab === "problems" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      My Reported Problems
                    </h3>
                    {userProblems.length > 0 ? (
                      <div className="space-y-4">
                        {userProblems.map((problem) => (
                          <div
                            key={problem._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {problem.title}
                                </h4>
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                  {problem.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                      {problem.location?.municipality}, Ward{" "}
                                      {problem.location?.ward}
                                    </span>
                                  </span>
                                  <span className="capitalize">
                                    {problem.category}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      problem.status === "resolved"
                                        ? "bg-green-100 text-green-800"
                                        : problem.status === "in_progress"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {problem.status.replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-nepali-blue">
                                  {problem.upvoteCount || 0}
                                </div>
                                <div className="text-sm text-gray-500">
                                  upvotes
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          You haven't reported any problems yet.
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Start by reporting a problem in your community!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                            placeholder="+977 98XXXXXXXX"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Municipality
                            </label>
                            <select
                              value={editForm.location.municipality}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  location: {
                                    ...prev.location,
                                    municipality: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                            >
                              <option value="">Select Municipality</option>
                              {municipalityOptions.map((municipality) => (
                                <option key={municipality} value={municipality}>
                                  {municipality}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ward Number
                            </label>
                            <select
                              value={editForm.location.ward}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  location: {
                                    ...prev.location,
                                    ward: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                            >
                              <option value="">Select Ward</option>
                              {Array.from({ length: 16 }, (_, i) => i + 1).map(
                                (ward) => (
                                  <option key={ward} value={ward}>
                                    Ward {ward}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={handleSaveProfile}
                            className="flex items-center space-x-2 bg-nepali-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              {user?.name}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              {user?.email}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                            {user?.phone || "Not provided"}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Municipality
                            </label>
                            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              {user?.location?.municipality || "Not specified"}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ward Number
                            </label>
                            <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                              {user?.location?.ward
                                ? `Ward ${user.location.ward}`
                                : "Not specified"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Account Actions */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Account Actions
                      </h4>
                      <div className="space-y-3">
                        <button className="w-full text-left text-red-600 hover:text-red-700 py-2">
                          Deactivate Account
                        </button>
                        <button className="w-full text-left text-red-600 hover:text-red-700 py-2">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
