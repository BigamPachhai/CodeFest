import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Phone } from "lucide-react";

const RUPANDEHI_MUNICIPALITIES = [
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

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);

    const userData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      location: {
        municipality: data.municipality,
        ward: parseInt(data.ward),
        coordinates: { lat: 0, lng: 0 }, // Default coordinates
      },
    };

    const result = await registerUser(userData);

    if (result.success) {
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-nepali-red rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-nepali-blue hover:text-blue-700"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("name", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+\-\s()]{10,}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  type="tel"
                  className="input-field pl-10"
                  placeholder="98XXXXXXXX"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-nepali-blue" />
              Location Information
            </h3>

            <div>
              <label
                htmlFor="municipality"
                className="block text-sm font-medium text-gray-700"
              >
                Municipality *
              </label>
              <select
                {...register("municipality", {
                  required: "Please select your municipality",
                })}
                className="input-field"
              >
                <option value="">Select Municipality</option>
                {RUPANDEHI_MUNICIPALITIES.map((municipality) => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
              {errors.municipality && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.municipality.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ward"
                className="block text-sm font-medium text-gray-700"
              >
                Ward Number *
              </label>
              <select
                {...register("ward", {
                  required: "Please select your ward number",
                })}
                className="input-field"
              >
                <option value="">Select Ward</option>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((ward) => (
                  <option key={ward} value={ward}>
                    Ward {ward}
                  </option>
                ))}
              </select>
              {errors.ward && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ward.message}
                </p>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Security</h3>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-10 pr-10"
                  placeholder="Create a strong password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              {...register("terms", {
                required: "You must accept the terms and conditions",
              })}
              type="checkbox"
              className="w-4 h-4 text-nepali-blue border-gray-300 rounded focus:ring-nepali-blue"
            />
            <label className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-nepali-blue hover:text-blue-700"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-nepali-blue hover:text-blue-700"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-600">{errors.terms.message}</p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center py-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to help maintain the quality and
              integrity of reports. False reporting may lead to account
              suspension.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
