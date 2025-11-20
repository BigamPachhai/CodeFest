import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Clock, Mail, Shield } from "lucide-react";

const VerificationPending = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-yellow-500 px-6 py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">
                Account Verification
              </h1>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-6">
              <Clock className="w-12 h-12 text-yellow-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Verification in Progress
                </h2>
                <p className="text-gray-600">
                  Your account is currently being reviewed by our team
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="shrink-0">
                  <Mail className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Current Status
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Status:{" "}
                      <span className="font-semibold capitalize">
                        {user.verificationStatus}
                      </span>
                    </p>
                    <p className="mt-1">
                      We'll notify you via email once your account is verified.
                      This usually takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  What you can do now
                </h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Browse reported problems</li>
                  <li>• View community issues</li>
                  <li>• Explore the interactive map</li>
                  <li>• Read problem details</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  After verification
                </h3>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Report new problems</li>
                  <li>• Upvote important issues</li>
                  <li>• Comment on problems</li>
                  <li>• Earn community points</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Need help?</h3>
              <p className="text-gray-600 text-sm">
                If you have questions about the verification process, please
                contact our support team at
                <a
                  href="mailto:support@rupandehisamadhan.gov.np"
                  className="text-blue-600 hover:underline ml-1"
                >
                  support@rupandehisamadhan.gov.np
                </a>
              </p>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => window.history.back()}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-nepali-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
