import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { problemsAPI, aiAPI } from "../services/api";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Sparkles,
  Send,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const ProblemDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      const response = await problemsAPI.getById(id);
      setProblem(response.data.data.problem);
    } catch (error) {
      console.error("Failed to fetch problem:", error);
      toast.error("Failed to load problem details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to upvote problems");
      navigate("/login");
      return;
    }

    setUpvoting(true);
    try {
      const response = await problemsAPI.upvote(id);
      setProblem((prev) => ({
        ...prev,
        upvoted: response.data.data.upvoted,
        upvoteCount: response.data.data.upvoteCount,
      }));

      if (response.data.data.upvoted) {
        toast.success("Upvoted problem!");
      } else {
        toast.success("Removed upvote");
      }
    } catch (error) {
      toast.error("Failed to upvote problem");
    } finally {
      setUpvoting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await problemsAPI.addComment(id, {
        text: commentText,
        isAnonymous: false, // You can add a toggle for this
      });

      setProblem((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data.data.comment],
      }));

      setCommentText("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAIAnalysis = async () => {
    try {
      setShowAIPanel(true);
      const response = await aiAPI.prioritizeProblems();
      // Find this problem in the prioritized list
      const problemAnalysis = response.data.data.prioritizedProblems.find(
        (p) => p._id === id
      );
      setAiAnalysis(problemAnalysis);
    } catch (error) {
      toast.error("Failed to get AI analysis");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

  const getCategoryIcon = (category) => {
    const icons = {
      waste: "🗑️",
      electrical: "⚡",
      water: "💧",
      street: "🛣️",
      other: "📋",
    };
    return icons[category] || "📋";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problem details...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Problem Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The problem you're looking for doesn't exist.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && problem.reporter?._id === user._id;
  const hasUpvoted = problem.upvotes?.includes(user?._id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">
                      {getCategoryIcon(problem.category)}
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {problem.title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        problem.status
                      )}`}
                    >
                      {getStatusIcon(problem.status)}
                      <span className="ml-1.5 capitalize">
                        {problem.status.replace("_", " ")}
                      </span>
                    </span>

                    {problem.priority && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                          problem.priority
                        )}`}
                      >
                        {problem.priority} priority
                      </span>
                    )}

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {getCategoryIcon(problem.category)} {problem.category}
                    </span>
                  </div>
                </div>

                {/* AI Analysis Button */}
                {(isOwner || user?.role === "admin") && (
                  <button
                    onClick={handleAIAnalysis}
                    className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors mb-4 sm:mb-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Analysis</span>
                  </button>
                )}
              </div>

              {/* Problem Description */}
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              {/* Problem Images */}
              {problem.images && problem.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Photos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {problem.images.map((image, index) => (
                      <div
                        key={index}
                        className="rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `Problem photo ${index + 1}`}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location and Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {problem.location?.municipality}, Ward{" "}
                    {problem.location?.ward}
                    {problem.location?.exactLocation &&
                      ` • ${problem.location.exactLocation}`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Reported {formatDistanceToNow(new Date(problem.createdAt))}{" "}
                    ago
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>
                    {problem.isAnonymous
                      ? "Anonymous User"
                      : problem.reporter?.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{problem.upvoteCount || 0} upvotes</span>
                </div>
              </div>
            </div>

            {/* Resolution Details */}
            {problem.status === "resolved" && problem.resolutionDetails && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-green-800">
                    Problem Resolved
                  </h2>
                </div>

                <div className="space-y-3">
                  <p className="text-green-700">
                    {problem.resolutionDetails.resolutionDescription}
                  </p>

                  {problem.resolutionDetails.resolvedAt && (
                    <p className="text-green-600 text-sm">
                      Resolved on{" "}
                      {format(
                        new Date(problem.resolutionDetails.resolvedAt),
                        "PPP"
                      )}
                    </p>
                  )}

                  {problem.resolutionDetails.resolutionImages &&
                    problem.resolutionDetails.resolutionImages.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-800 mb-2">
                          Resolution Photos:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {problem.resolutionDetails.resolutionImages.map(
                            (image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Resolution ${index + 1}`}
                                className="rounded-lg border border-green-200"
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Comments ({problem.comments?.length || 0})
                </h2>
              </div>

              {/* Add Comment Form */}
              {isAuthenticated && (
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="flex space-x-4">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add your comment... (Appreciate or provide suggestions)"
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent resize-none"
                        disabled={submittingComment}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">
                          Be respectful and constructive in your comments
                        </p>
                        <button
                          type="submit"
                          disabled={submittingComment || !commentText.trim()}
                          className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {submittingComment ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Comment</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {problem.comments && problem.comments.length > 0 ? (
                  problem.comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-4">
                      <img
                        src={comment.user?.avatar || "/default-avatar.png"}
                        alt={comment.user?.name}
                        className="w-10 h-10 rounded-full shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">
                                {comment.isAnonymous
                                  ? "Anonymous"
                                  : comment.user?.name}
                              </span>
                              {comment.user?.role === "admin" && (
                                <Shield className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt))}{" "}
                              ago
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={handleUpvote}
                  disabled={upvoting || !isAuthenticated}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                    hasUpvoted
                      ? "bg-nepali-blue text-white border-nepali-blue"
                      : "bg-white text-gray-700 border-gray-300 hover:border-nepali-blue"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>
                    {hasUpvoted ? "Upvoted" : "Upvote"} (
                    {problem.upvoteCount || 0})
                  </span>
                </button>

                {isOwner && (
                  <Link
                    to={`/report?edit=${problem._id}`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:border-nepali-blue transition-colors"
                  >
                    <span>Edit Problem</span>
                  </Link>
                )}

                {user?.role === "admin" && (
                  <Link
                    to={`/admin/problems/${problem._id}/report`}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:border-nepali-blue transition-colors"
                  >
                    <span>Generate Report</span>
                  </Link>
                )}
              </div>
            </div>

            {/* AI Analysis Panel */}
            {showAIPanel && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  AI Analysis
                </h3>

                {aiAnalysis ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Priority Score:
                      </span>
                      <span className="font-semibold text-purple-600">
                        {aiAnalysis.priorityScore?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Priority Level:
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          aiAnalysis.priorityLevel === "critical"
                            ? "bg-red-100 text-red-800"
                            : aiAnalysis.priorityLevel === "high"
                            ? "bg-orange-100 text-orange-800"
                            : aiAnalysis.priorityLevel === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {aiAnalysis.priorityLevel || "medium"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">
                      Analyzing problem...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Report Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Information
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reported:</span>
                  <span>
                    {format(new Date(problem.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="capitalize">{problem.category}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Municipality:</span>
                  <span>{problem.location?.municipality}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Ward:</span>
                  <span>{problem.location?.ward}</span>
                </div>

                {problem.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned To:</span>
                    <span>{problem.assignedTo?.name}</span>
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

export default ProblemDetail;
