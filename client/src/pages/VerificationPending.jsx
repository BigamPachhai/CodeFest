import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Clock,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Home,
  User,
  MapPin,
  Calendar,
  RefreshCw,
  MessageCircle,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const VerificationPending = () => {
  const { user, logout, isVerified, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Calculate time since account creation
  useEffect(() => {
    if (user?.createdAt) {
      const created = new Date(user.createdAt);
      const now = new Date();
      const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
      setTimeElapsed(diffHours);
    }
  }, [user]);

  // Redirect if user is already verified
  useEffect(() => {
    if (isVerified) {
      navigate("/dashboard");
    }
  }, [isVerified, navigate]);

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      await refreshUser();
      if (user?.verificationStatus === "verified") {
        toast.success("Your account has been verified!");
        navigate("/dashboard");
      } else {
        toast("Verification is still pending. Please check back later.", {
          icon: "⏳",
        });
      }
    } catch (error) {
      toast.error("Failed to check verification status");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getVerificationTimeframe = () => {
    if (timeElapsed < 1) return "less than an hour";
    if (timeElapsed < 24)
      return `${timeElapsed} hour${timeElapsed > 1 ? "s" : ""}`;
    return `${Math.floor(timeElapsed / 24)} day${
      Math.floor(timeElapsed / 24) > 1 ? "s" : ""
    }`;
  };

  const getNextSteps = () => {
    if (timeElapsed < 2) {
      return [
        "Our team is reviewing your registration details",
        "Verification usually takes 2-24 hours",
        "You will receive an email notification once verified",
      ];
    } else if (timeElapsed < 24) {
      return [
        "Your application is in the verification queue",
        "Our team is working through pending verifications",
        "You should hear back within the next few hours",
      ];
    } else {
      return [
        "Your verification is taking longer than usual",
        "Our team might need additional information",
        "Please contact support if not resolved within 48 hours",
      ];
    }
  };

  const getSupportContactInfo = () => ({
    email: "verification@rupandehisamadhan.gov.np",
    phone: "+977 71-XXXXXX",
    hours: "9:00 AM - 5:00 PM (Sunday-Friday)",
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className="bg-linear-to-r from-yellow-400 to-orange-500 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Account Verification Pending
                  </h1>
                  <p className="text-yellow-100 mt-1">
                    Your account is under review by our verification team
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-yellow-100">Waiting for</div>
                <div className="text-xl font-bold">
                  {getVerificationTimeframe()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Your Registration Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {user.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Email Address
                    </label>
                    <p className="mt-1 text-gray-900 font-medium">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Location
                    </label>
                    <p className="mt-1 text-gray-900 font-medium flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {user.location?.municipality || "Not specified"}
                        {user.location?.ward && `, Ward ${user.location.ward}`}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Registration Date
                    </label>
                    <p className="mt-1 text-gray-900 font-medium flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verification Process
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600 mt-1 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">
                        Under Review
                      </h3>
                      <p className="text-yellow-700 mt-1">
                        Your account information is being verified by our
                        administration team. This process ensures the integrity
                        and security of our community platform.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        Email Notification
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        You'll receive an email once verified
                      </p>
                    </div>

                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        Full Access
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Report problems and engage with community
                      </p>
                    </div>

                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        Community Features
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Upvote, comment, and earn points
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  What's Happening Now?
                </h3>
                <ul className="space-y-3">
                  {getNextSteps().map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                      <span className="text-blue-800">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleCheckStatus}
                    disabled={checkingStatus}
                    className="w-full flex items-center justify-center space-x-2 bg-nepali-blue text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingStatus ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                    <span>
                      {checkingStatus
                        ? "Checking..."
                        : "Check Verification Status"}
                    </span>
                  </button>

                  <Link
                    to="/"
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span>Browse Public Content</span>
                  </Link>
                </div>
              </div>

              {/* What You Can Do */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Available Features
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Browse reported problems</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>View problem details and updates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Explore interactive map</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Read community discussions</span>
                  </li>
                </ul>
              </div>

              {/* After Verification */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-900 mb-3">
                  After Verification
                </h3>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Report new problems with photos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Upvote important community issues</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Comment and provide suggestions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Earn points and climb leaderboard</span>
                  </li>
                </ul>
              </div>

              {/* Support Information */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Need Help?
                </h3>
                <div className="space-y-2 text-sm text-orange-800">
                  <div>
                    <strong>Email:</strong>
                    <div className="mt-1">{getSupportContactInfo().email}</div>
                  </div>
                  <div>
                    <strong>Phone:</strong>
                    <div className="mt-1">{getSupportContactInfo().phone}</div>
                  </div>
                  <div>
                    <strong>Hours:</strong>
                    <div className="mt-1">{getSupportContactInfo().hours}</div>
                  </div>
                </div>
                <button className="w-full mt-4 text-orange-700 hover:text-orange-800 text-sm font-medium">
                  Contact Support Team
                </button>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Important Information
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • Verification ensures the quality and authenticity of
                    community reports
                  </li>
                  <li>
                    • You can still browse all public content while waiting for
                    verification
                  </li>
                  <li>• Most verifications are completed within 24 hours</li>
                  <li>
                    • If verification takes longer than 48 hours, please contact
                    support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Why is verification required?
                </h3>
                <p className="text-gray-600 text-sm">
                  Verification helps maintain the integrity of our platform by
                  ensuring that all reporters are genuine community members.
                  This reduces spam and false reports.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What information is verified?
                </h3>
                <p className="text-gray-600 text-sm">
                  We verify your identity and location information to confirm
                  you're a resident of Rupandehi District. This helps us
                  prioritize local community issues.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I speed up the process?
                </h3>
                <p className="text-gray-600 text-sm">
                  The verification process is handled in the order received. For
                  urgent matters, you can contact our support team with your
                  registration details.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What if my verification is rejected?
                </h3>
                <p className="text-gray-600 text-sm">
                  If verification fails, you'll receive an email explaining the
                  reason and instructions on how to correct the information and
                  reapply.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I use the app while waiting?
                </h3>
                <p className="text-gray-600 text-sm">
                  Yes! You can browse problems, view maps, and read updates.
                  Only reporting new problems and interactive features require
                  verification.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is my data secure during verification?
                </h3>
                <p className="text-gray-600 text-sm">
                  Absolutely. We follow strict data protection protocols and
                  your information is only used for verification purposes in
                  accordance with our privacy policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
