import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { Sparkles, TrendingUp, Clock, Users, MessageSquare } from 'lucide-react';

const AIFeaturesPanel = ({ problemId, problemData }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const handlePrioritize = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.prioritizeProblems();
      setResults(prev => ({ ...prev, prioritize: response.data.data }));
      toast.success('Problems prioritized successfully');
    } catch (error) {
      toast.error('Failed to prioritize problems');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictResolution = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.predictResolution({
        category: problemData.category,
        location: problemData.location,
        priority: problemData.priority
      });
      setResults(prev => ({ ...prev, prediction: response.data.data }));
      toast.success('Resolution time predicted');
    } catch (error) {
      toast.error('Failed to predict resolution time');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestAssignment = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.suggestAssignment(problemId);
      setResults(prev => ({ ...prev, assignment: response.data.data }));
      toast.success('Department assignment suggested');
    } catch (error) {
      toast.error('Failed to suggest department assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateUpdate = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.generateProgressUpdate(problemId);
      setResults(prev => ({ ...prev, update: response.data.data }));
      toast.success('Progress update generated');
    } catch (error) {
      toast.error('Failed to generate progress update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
        AI Assistant Features
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handlePrioritize}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Prioritize Problems</span>
        </button>

        <button
          onClick={handlePredictResolution}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-green-100 text-green-700 px-4 py-3 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
        >
          <Clock className="w-4 h-4" />
          <span>Predict Resolution</span>
        </button>

        <button
          onClick={handleSuggestAssignment}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-purple-100 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
        >
          <Users className="w-4 h-4" />
          <span>Suggest Department</span>
        </button>

        <button
          onClick={handleGenerateUpdate}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-orange-100 text-orange-700 px-4 py-3 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Generate Update</span>
        </button>
      </div>

      {/* Display Results */}
      {results.prediction && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-2">Predicted Resolution</h4>
          <p className="text-green-700">
            {results.prediction.predictedDays} days (Confidence: {Math.round(results.prediction.confidence * 100)}%)
          </p>
        </div>
      )}

      {results.assignment && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-purple-800 mb-2">Suggested Department</h4>
          <p className="text-purple-700">
            {results.assignment.suggestedDepartment.name} 
            (Score: {Math.round(results.assignment.assignmentScore)})
          </p>
        </div>
      )}

      {results.update && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">Progress Update</h4>
          <p className="text-orange-700 mb-2">{results.update.progressUpdate}</p>
          <p className="text-orange-600 text-sm">{results.update.estimatedTimeline}</p>
        </div>
      )}
    </div>
  );
};

export default AIFeaturesPanel;