import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { problemsAPI } from "../services/api";
import {
  Trophy,
  Award,
  Star,
  Medal,
  Crown,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Filter,
  Search,
  Eye,
  Share2,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // all, monthly, weekly
  const [category, setCategory] = useState("all"); // all, waste, electrical, water, street
  const [municipality, setMunicipality] = useState("all");

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
    fetchLeaderboardData();
  }, [timeRange, category, municipality]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);

      // Mock data for demonstration - in real app, you'd have a leaderboard API
      const mockLeaderboard = [
        {
          _id: "1",
          name: "Ram Bahadur",
          points: 1250,
          problemsReported: 28,
          problemsResolved: 22,
          municipality: "Butwal",
          joinDate: "2024-01-15",
          avatar:
            "https://ui-avatars.com/api/?name=Ram+Bahadur&background=DC143C&color=fff",
          rank: 1,
          streak: 15,
        },
        {
          _id: "2",
          name: "Sita Kumari",
          points: 980,
          problemsReported: 22,
          problemsResolved: 18,
          municipality: "Siddharthanagar",
          joinDate: "2024-02-01",
          avatar:
            "https://ui-avatars.com/api/?name=Sita+Kumari&background=003893&color=fff",
          rank: 2,
          streak: 8,
        },
        {
          _id: "3",
          name: "Hari Prasad",
          points: 750,
          problemsReported: 18,
          problemsResolved: 15,
          municipality: "Butwal",
          joinDate: "2024-01-20",
          avatar:
            "https://ui-avatars.com/api/?name=Hari+Prasad&background=87CEEB&color=fff",
          rank: 3,
          streak: 12,
        },
        {
          _id: "4",
          name: "Gita Devi",
          points: 620,
          problemsReported: 15,
          problemsResolved: 12,
          municipality: "Tillottama",
          joinDate: "2024-02-15",
          avatar:
            "https://ui-avatars.com/api/?name=Gita+Devi&background=FF8C00&color=fff",
          rank: 4,
          streak: 5,
        },
        {
          _id: "5",
          name: "Shyam Kumar",
          points: 580,
          problemsReported: 14,
          problemsResolved: 11,
          municipality: "Devdaha",
          joinDate: "2024-01-25",
          avatar:
            "https://ui-avatars.com/api/?name=Shyam+Kumar&background=10B981&color=fff",
          rank: 5,
          streak: 7,
        },
        {
          _id: "6",
          name: "User Current",
          points: user?.points || 320,
          problemsReported: 8,
          problemsResolved: 6,
          municipality: user?.location?.municipality || "Butwal",
          joinDate: user?.createdAt || "2024-02-10",
          avatar:
            user?.avatar ||
            "https://ui-avatars.com/api/?name=Current+User&background=6B7280&color=fff",
          rank: 12,
          streak: 3,
        },
      ];

      // Filter data based on selections
      let filteredData = [...mockLeaderboard];

      if (municipality !== "all") {
        filteredData = filteredData.filter(
          (user) => user.municipality === municipality
        );
      }

      // Re-rank after filtering
      filteredData.sort((a, b) => b.points - a.points);
      filteredData = filteredData.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

      setLeaderboard(filteredData);
      setTopContributors(filteredData.slice(0, 3));

      // Department stats
      const deptStats = [
        {
          name: "Waste Management",
          resolved: 45,
          efficiency: 92,
          color: "#DC143C",
        },
        {
          name: "Electrical Dept",
          resolved: 38,
          efficiency: 88,
          color: "#003893",
        },
        {
          name: "Water Supply",
          resolved: 32,
          efficiency: 85,
          color: "#87CEEB",
        },
        {
          name: "Public Works",
          resolved: 28,
          efficiency: 82,
          color: "#FF8C00",
        },
      ];
      setDepartmentStats(deptStats);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return <Award className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 border-yellow-300";
      case 2:
        return "bg-gray-100 border-gray-300";
      case 3:
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return { color: "bg-yellow-500 text-white", label: "Gold" };
      case 2:
        return { color: "bg-gray-500 text-white", label: "Silver" };
      case 3:
        return { color: "bg-orange-500 text-white", label: "Bronze" };
      default:
        return { color: "bg-blue-500 text-white", label: `#${rank}` };
    }
  };

  const shareLeaderboard = () => {
    if (navigator.share) {
      navigator.share({
        title: "Rupandehi Samadhan Leaderboard",
        text: "Check out the top contributors making a difference in Rupandehi District!",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Leaderboard link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const currentUserRank = leaderboard.find((u) => u._id === "6")?.rank || 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-nepali-blue to-nepali-darkblue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <Trophy className="w-12 h-12 text-yellow-300" />
              <h1 className="text-4xl font-bold">Community Leaderboard</h1>
              <Star className="w-12 h-12 text-yellow-300" />
            </div>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Celebrating the most active contributors making Rupandehi District
              a better place
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Top 3 Contributors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {topContributors.map((contributor, index) => (
            <div
              key={contributor._id}
              className={`relative rounded-2xl border-2 p-6 text-center transform transition-all duration-300 hover:scale-105 ${getRankColor(
                contributor.rank
              )}`}
              style={{
                marginTop: index === 0 ? "0" : index === 1 ? "2rem" : "1rem",
              }}
            >
              {/* Rank Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div
                  className={`px-4 py-2 rounded-full font-bold text-sm ${
                    getRankBadge(contributor.rank).color
                  }`}
                >
                  {getRankBadge(contributor.rank).label}
                </div>
              </div>

              {/* Contributor Info */}
              <div className="mt-4">
                <img
                  src={contributor.avatar}
                  alt={contributor.name}
                  className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg"
                />
                <h3 className="text-xl font-bold text-gray-900 mt-4">
                  {contributor.name}
                </h3>
                <p className="text-gray-600 flex items-center justify-center space-x-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{contributor.municipality}</span>
                </p>

                {/* Points */}
                <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg mt-4">
                  <div className="text-3xl font-bold">{contributor.points}</div>
                  <div className="text-sm">Points</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {contributor.problemsReported}
                    </div>
                    <div className="text-gray-600">Reported</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {contributor.problemsResolved}
                    </div>
                    <div className="text-gray-600">Resolved</div>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center justify-center space-x-1 mt-3 text-orange-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {contributor.streak} day streak
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Leaderboard Filters
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Time Range */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
              </select>

              {/* Category */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="waste">Waste Management</option>
                <option value="electrical">Electrical</option>
                <option value="water">Water Supply</option>
                <option value="street">Street Issues</option>
              </select>

              {/* Municipality */}
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
              >
                <option value="all">All Municipalities</option>
                {municipalityOptions.map((muni) => (
                  <option key={muni} value={muni}>
                    {muni}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={shareLeaderboard}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => toast.success("Exporting leaderboard data...")}
                  className="flex items-center space-x-2 bg-nepali-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-linear-to-r from-nepali-blue to-nepali-darkblue px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Top Contributors
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {leaderboard.map((contributor) => (
                  <div
                    key={contributor._id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      contributor._id === "6"
                        ? "bg-blue-50 border-l-4 border-nepali-blue"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {contributor.rank <= 3 ? (
                          getRankIcon(contributor.rank)
                        ) : (
                          <div className="text-lg font-bold text-gray-600">
                            #{contributor.rank}
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <img
                        src={contributor.avatar}
                        alt={contributor.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {contributor.name}
                          </h3>
                          {contributor._id === "6" && (
                            <span className="bg-nepali-blue text-white px-2 py-1 rounded text-xs font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{contributor.municipality}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Joined{" "}
                              {new Date(
                                contributor.joinDate
                              ).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Points and Stats */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-nepali-blue">
                          {contributor.points}
                        </div>
                        <div className="text-sm text-gray-600">points</div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{contributor.problemsReported} reported</span>
                          <span>{contributor.problemsResolved} resolved</span>
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center space-x-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-sm font-semibold">
                          {contributor.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Earn Points */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                How to Earn Points
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">+10</span>
                    </div>
                    <span className="text-gray-700">Report a new problem</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">+5</span>
                    </div>
                    <span className="text-gray-700">
                      Your reported problem gets resolved
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">+2</span>
                    </div>
                    <span className="text-gray-700">
                      Upvote important problems
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold">+3</span>
                    </div>
                    <span className="text-gray-700">
                      Provide helpful comments
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold">+15</span>
                    </div>
                    <span className="text-gray-700">
                      Daily activity streak bonus
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold">+25</span>
                    </div>
                    <span className="text-gray-700">
                      Monthly top contributor bonus
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current User Stats */}
            {user && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Ranking
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-nepali-blue mb-2">
                    #{currentUserRank}
                  </div>
                  <p className="text-gray-600 mb-4">
                    out of {leaderboard.length} contributors
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Points:</span>
                      <span className="font-semibold">{user.points || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Problems Reported:</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Problems Resolved:</span>
                      <span className="font-semibold">6</span>
                    </div>
                  </div>

                  <Link
                    to="/report"
                    className="btn-primary w-full mt-4 flex items-center justify-center space-x-2"
                  >
                    <span>Report New Problem</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Department Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Department Performance
              </h3>
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {dept.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {dept.resolved} resolved
                      </div>
                      <div className="text-xs text-gray-500">
                        {dept.efficiency}% efficiency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Badges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold">First Report</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Star className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold">10 Reports</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold">7 Day Streak</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Crown className="w-8 h-8 text-purple-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold">Top 10</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
