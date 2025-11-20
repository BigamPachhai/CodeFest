import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Sparkles,
  X 
} from 'lucide-react';

const RUPANDEHI_LOCATIONS = [
  { municipality: 'Butwal', wards: Array.from({length: 16}, (_, i) => i + 1) },
  { municipality: 'Siddharthanagar', wards: Array.from({length: 12}, (_, i) => i + 1) },
  { municipality: 'Lumbini Sanskritik', wards: Array.from({length: 12}, (_, i) => i + 1) },
  { municipality: 'Tillottama', wards: Array.from({length: 14}, (_, i) => i + 1) },
  { municipality: 'Devdaha', wards: Array.from({length: 9}, (_, i) => i + 1) },
  { municipality: 'Sainamaina', wards: Array.from({length: 11}, (_, i) => i + 1) },
  { municipality: 'Om Satiya', wards: Array.from({length: 7}, (_, i) => i + 1) },
  { municipality: 'Rohini', wards: Array.from({length: 9}, (_, i) => i + 1) },
  { municipality: 'Sammarimai', wards: Array.from({length: 9}, (_, i) => i + 1) },
  { municipality: 'Kotahimai', wards: Array.from({length: 9}, (_, i) => i + 1) },
  { municipality: 'Marchawari', wards: Array.from({length: 9}, (_, i) => i + 1) },
  { municipality: 'Mayadevi', wards: Array.from({length: 9}, (_, i) => i + 1) },
  { municipality: 'Omsatiya', wards: Array.from({length: 7}, (_, i) => i + 1) },
  { municipality: 'Siyari', wards: Array.from({length: 9}, (_, i) => i + 1) },
  { municipality: 'Suddodhan', wards: Array.from({length: 9}, (_, i) => i + 1) }
];

const CATEGORIES = [
  { value: 'waste', label: 'Waste Management', icon: '🗑️' },
  { value: 'electrical', label: 'Electrical Issues', icon: '⚡' },
  { value: 'water', label: 'Water Supply', icon: '💧' },
  { value: 'street', label: 'Street Problems', icon: '🛣️' },
  { value: 'other', label: 'Other Issues', icon: '📋' }
];

const ReportProblem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState(null);

  const selectedMunicipality = watch('municipality');

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeWithAI = async () => {
    if (images.length === 0) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', images[0].file);

      const response = await axios.post('/api/ai/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAiGeneratedData(response.data.data.analysis);
      setValue('category', response.data.data.analysis.category);
      setShowAIOptions(true);
      
      toast.success('AI analysis completed!');
    } catch (error) {
      toast.error('AI analysis failed. Please try again.');
    }
  };

  const generateDescription = async () => {
    if (!aiGeneratedData) return;

    try {
      const response = await axios.post('/api/ai/generate-description', {
        imageAnalysis: aiGeneratedData,
        category: watch('category'),
        location: {
          municipality: watch('municipality'),
          ward: watch('ward')
        }
      });

      setValue('description', response.data.data.description);
      toast.success('Description generated!');
    } catch (error) {
      toast.error('Failed to generate description');
    }
  };

  const checkDuplicates = async () => {
    const formData = {
      title: watch('title'),
      description: watch('description'),
      location: {
        municipality: watch('municipality'),
        ward: watch('ward')
      },
      category: watch('category')
    };

    try {
      const response = await axios.post('/api/ai/check-duplicates', formData);
      
      if (response.data.data.isDuplicate) {
        toast.error('Similar problem already reported!', {
          duration: 6000,
          action: {
            label: 'View',
            onClick: () => navigate(`/problems/${response.data.data.similarProblems[0]._id}`)
          }
        });
      } else {
        toast.success('No duplicates found!');
      }
    } catch (error) {
      console.error('Duplicate check failed:', error);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append image files
      images.forEach(image => {
        formData.append('images', image.file);
      });

      // Append problem data
      const problemData = {
        ...data,
        location: {
          municipality: data.municipality,
          ward: parseInt(data.ward),
          exactLocation: data.exactLocation,
          coordinates: { lat: 0, lng: 0 } // Would come from map integration
        },
        isAnonymous: data.isAnonymous || false
      };

      formData.append('data', JSON.stringify(problemData));

      await axios.post('/api/problems', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Problem reported successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to report problem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Problem</h1>
          <p className="text-gray-600 mb-6">
            Help improve your community by reporting local issues
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Problem Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                  placeholder="Brief description of the problem"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Location Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-nepali-blue" />
                Location Details
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipality *
                  </label>
                  <select
                    {...register('municipality', { required: 'Municipality is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                  >
                    <option value="">Select Municipality</option>
                    {RUPANDEHI_LOCATIONS.map(loc => (
                      <option key={loc.municipality} value={loc.municipality}>
                        {loc.municipality}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ward Number *
                  </label>
                  <select
                    {...register('ward', { required: 'Ward is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                    disabled={!selectedMunicipality}
                  >
                    <option value="">Select Ward</option>
                    {selectedMunicipality && 
                      RUPANDEHI_LOCATIONS
                        .find(loc => loc.municipality === selectedMunicipality)
                        ?.wards.map(ward => (
                          <option key={ward} value={ward}>
                            Ward {ward}
                          </option>
                        ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exact Location
                  </label>
                  <input
                    type="text"
                    {...register('exactLocation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                    placeholder="Nearby landmark or exact address"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h3>
              
              <div className="flex flex-wrap gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-nepali-blue transition-colors">
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* AI Features */}
              {images.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Assistant
                    </h4>
                    <button
                      type="button"
                      onClick={analyzeWithAI}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Analyze Image
                    </button>
                  </div>

                  {showAIOptions && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={generateDescription}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors mr-2"
                      >
                        Generate Description
                      </button>
                      <button
                        type="button"
                        onClick={checkDuplicates}
                        className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                      >
                        Check Duplicates
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                {...register('description', { required: 'Description is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                placeholder="Provide detailed information about the problem..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Privacy Options */}
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isAnonymous')}
                className="w-4 h-4 text-nepali-blue border-gray-300 rounded focus:ring-nepali-blue"
              />
              <label className="ml-2 text-sm text-gray-700">
                Report anonymously (your identity will be hidden)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-nepali-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportProblem;