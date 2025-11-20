import Problem from "../models/Problem.js";
import User from "../models/User.js";
import axios from "axios";

// Existing functions from previous code...
export const analyzeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const aiAnalysis = await analyzeImageWithAI(imageUrl);

    res.status(200).json({
      success: true,
      data: { analysis: aiAnalysis },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error analyzing image",
      error: error.message,
    });
  }
};

export const generateDescription = async (req, res) => {
  try {
    const { imageAnalysis, category, location } = req.body;
    const generatedDescription = await generateDescriptionWithAI({
      imageAnalysis,
      category,
      location,
    });

    res.status(200).json({
      success: true,
      data: { description: generatedDescription },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating description",
      error: error.message,
    });
  }
};

export const checkDuplicates = async (req, res) => {
  try {
    const { title, description, location, category } = req.body;
    const similarProblems = await Problem.find({
      category,
      "location.municipality": location.municipality,
      status: { $in: ["pending", "in_progress"] },
    });

    const duplicates = similarProblems.filter((problem) => {
      const titleSimilarity = calculateSimilarity(title, problem.title);
      const descSimilarity = calculateSimilarity(
        description,
        problem.description
      );
      return titleSimilarity > 0.7 || descSimilarity > 0.6;
    });

    res.status(200).json({
      success: true,
      data: {
        isDuplicate: duplicates.length > 0,
        similarProblems: duplicates.slice(0, 3),
        similarityScore: duplicates.length > 0 ? 0.8 : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking for duplicates",
      error: error.message,
    });
  }
};

// NEW AI FEATURE 1: Smart Problem Prioritization
export const prioritizeProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ status: "pending" });

    const prioritized = problems
      .map((problem) => {
        const priorityScore = calculatePriorityScore(problem);
        return {
          ...problem.toObject(),
          priorityScore,
          priorityLevel: getPriorityLevel(priorityScore),
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);

    res.status(200).json({
      success: true,
      data: {
        prioritizedProblems: prioritized.slice(0, 10), // Top 10 prioritized
        totalCount: prioritized.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error prioritizing problems",
      error: error.message,
    });
  }
};

// NEW AI FEATURE 2: Sentiment Analysis for Comments
export const analyzeCommentSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    const sentiment = await analyzeSentimentWithAI(text);

    res.status(200).json({
      success: true,
      data: {
        sentiment: sentiment.sentiment,
        score: sentiment.score,
        isPositive: sentiment.score > 0.3,
        isNegative: sentiment.score < -0.3,
        isNeutral: sentiment.score >= -0.3 && sentiment.score <= 0.3,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error analyzing sentiment",
      error: error.message,
    });
  }
};

// NEW AI FEATURE 3: Predictive Resolution Time
export const predictResolutionTime = async (req, res) => {
  try {
    const { category, location, priority } = req.body;

    const similarResolved = await Problem.find({
      category,
      "location.municipality": location.municipality,
      status: "resolved",
    });

    const avgResolutionTime = calculateAverageResolution(similarResolved);
    const predictedTime = adjustForPriority(avgResolutionTime, priority);

    res.status(200).json({
      success: true,
      data: {
        predictedDays: predictedTime,
        confidence: calculateConfidence(similarResolved.length),
        basedOnPastCases: similarResolved.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error predicting resolution time",
      error: error.message,
    });
  }
};

// NEW AI FEATURE 4: Smart Department Assignment
export const suggestDepartmentAssignment = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    const departments = await User.find({
      role: "department",
      department: problem.category,
      "location.municipality": problem.location.municipality,
    }).populate("workload");

    if (departments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No departments found for this category and location",
      });
    }

    const suggestedDept = departments.reduce((best, current) => {
      const currentScore = calculateWorkloadScore(current);
      const bestScore = calculateWorkloadScore(best);
      return currentScore > bestScore ? current : best;
    });

    res.status(200).json({
      success: true,
      data: {
        suggestedDepartment: {
          id: suggestedDept._id,
          name: suggestedDept.name,
          department: suggestedDept.department,
          contact: suggestedDept.contact,
          workload: suggestedDept.workload,
        },
        assignmentScore: calculateWorkloadScore(suggestedDept),
        alternativeDepartments: departments.slice(0, 3).map((dept) => ({
          id: dept._id,
          name: dept.name,
          score: calculateWorkloadScore(dept),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error suggesting department",
      error: error.message,
    });
  }
};

// NEW AI FEATURE 5: Automated Progress Updates
export const generateProgressUpdate = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate("reporter", "name")
      .populate("assignedTo", "name department");

    const updateTemplate = await generateUpdateWithAI(problem);

    res.status(200).json({
      success: true,
      data: {
        progressUpdate: updateTemplate,
        suggestedActions: getSuggestedActions(problem.status),
        estimatedTimeline: problem.estimatedResolutionTime
          ? `Expected resolution: ${problem.estimatedResolutionTime.toDateString()}`
          : "Timeline being assessed",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating progress update",
      error: error.message,
    });
  }
};

// Helper functions for AI features
const calculatePriorityScore = (problem) => {
  let score = 0;

  // Upvotes weight
  score += problem.upvoteCount * 2;

  // Category weights (based on urgency)
  const categoryWeights = {
    electrical: 10, // High risk
    water: 8, // Essential service
    waste: 6, // Health concern
    street: 5, // Safety issue
    other: 3, // General
  };
  score += categoryWeights[problem.category] || 0;

  // Time decay (older problems get higher priority)
  const daysOld = (new Date() - problem.createdAt) / (1000 * 60 * 60 * 24);
  score += Math.min(daysOld * 0.5, 10);

  // Comment activity
  score += problem.comments.length * 0.5;

  return Math.round(score * 100) / 100;
};

const getPriorityLevel = (score) => {
  if (score >= 20) return "critical";
  if (score >= 15) return "high";
  if (score >= 10) return "medium";
  return "low";
};

const analyzeSentimentWithAI = async (text) => {
  // Mock sentiment analysis - replace with actual AI service
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "thanks",
    "appreciate",
    "helpful",
    "quick",
    "efficient",
  ];
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "slow",
    "useless",
    "waste",
    "never",
    "failed",
  ];

  const words = text.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  const score = total > 0 ? (positiveCount - negativeCount) / total : 0;

  return {
    sentiment: score > 0 ? "positive" : score < 0 ? "negative" : "neutral",
    score: score,
    positiveWords: positiveCount,
    negativeWords: negativeCount,
  };
};

const calculateAverageResolution = (problems) => {
  if (problems.length === 0) return 7; // Default 7 days

  const totalDays = problems.reduce((sum, problem) => {
    if (problem.resolutionDetails?.resolvedAt) {
      const resolutionTime =
        problem.resolutionDetails.resolvedAt - problem.createdAt;
      return sum + resolutionTime / (1000 * 60 * 60 * 24);
    }
    return sum;
  }, 0);

  return Math.round(totalDays / problems.length);
};

const adjustForPriority = (avgDays, priority) => {
  const multipliers = {
    critical: 0.5, // 50% faster
    high: 0.7, // 30% faster
    medium: 1, // No change
    low: 1.3, // 30% slower
  };

  return Math.round(avgDays * (multipliers[priority] || 1));
};

const calculateConfidence = (sampleSize) => {
  return Math.min(0.3 + sampleSize * 0.07, 0.95); // Increases with sample size
};

const calculateWorkloadScore = (department) => {
  const baseScore = 100;
  const workloadPenalty = department.workload?.activeCases * 5 || 0;
  const completionRateBonus = department.workload?.completionRate * 20 || 0;

  return Math.max(0, baseScore - workloadPenalty + completionRateBonus);
};

const generateUpdateWithAI = async (problem) => {
  // Mock AI generation - replace with actual GPT integration
  const templates = {
    pending: `We've received your report about ${problem.title} in ${problem.location.municipality}. Our team is currently reviewing the issue and will assign it to the appropriate department shortly.`,
    in_progress: `Good news! Your reported issue "${problem.title}" has been assigned to the ${problem.assignedTo?.department} department. Our team is actively working on a solution.`,
    resolved: `We're pleased to inform you that the issue "${problem.title}" has been successfully resolved. Thank you for helping us improve ${problem.location.municipality}.`,
  };

  return (
    templates[problem.status] ||
    `Update on your reported issue: ${problem.title}. Current status: ${problem.status}.`
  );
};

const getSuggestedActions = (status) => {
  const actions = {
    pending: [
      "Review problem details",
      "Assign to department",
      "Estimate timeline",
    ],
    in_progress: ["Monitor progress", "Update reporter", "Allocate resources"],
    resolved: ["Verify resolution", "Close case", "Request feedback"],
  };

  return actions[status] || ["Review case"];
};

// Mock AI functions (replace with actual AI service integration)
const analyzeImageWithAI = async (imageUrl) => {
  // Integration with Google Vision AI or custom ML model
  return {
    category: "waste",
    confidence: 0.89,
    tags: ["garbage", "overflow", "public", "bin", "waste", "litter"],
    description:
      "Overflowing garbage bin with scattered waste around the public area",
    severity: "high",
    estimatedUrgency: "48 hours",
  };
};

const generateDescriptionWithAI = async (data) => {
  // Integration with GPT-4 or similar
  return `I'm reporting a ${data.category} issue in ${
    data.location.municipality
  }, Ward ${
    data.location.ward
  }. The problem appears to involve ${data.imageAnalysis.tags.join(
    ", "
  )} and requires attention from the local authorities. This issue is affecting the community and needs to be addressed promptly.`;
};

const calculateSimilarity = (text1, text2) => {
  const words1 = new Set(text1.toLowerCase().split(/\W+/));
  const words2 = new Set(text2.toLowerCase().split(/\W+/));
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
};
