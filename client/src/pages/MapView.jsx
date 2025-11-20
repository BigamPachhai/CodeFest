import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { problemsAPI } from '../services/api';
import {
  MapPin,
  Filter,
  Search,
  Layers,
  Navigation,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Satellite,
  Map as MapIcon,
  Thermometer
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different problem statuses
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M16 2C10.477 2 6 6.477 6 12c0 10 10 18 10 18s10-8 10-18c0-5.523-4.477-10-10-10z"/>
        <circle cx="16" cy="12" r="4" fill="#ffffff"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const statusIcons = {
  pending: createCustomIcon('#F59E0B'), // Yellow
  in_progress: createCustomIcon('#3B82F6'), // Blue
  resolved: createCustomIcon('#10B981'), // Green
  rejected: createCustomIcon('#EF4444'), // Red
};

const priorityColors = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#6B7280'
};

const MapView = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    municipality: '',
    priority: '',
    showHeatmap: false,
    showClusters: true
  });
  const [mapView, setMapView] = useState('standard'); // standard, satellite, hybrid
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [mapCenter] = useState([27.7172, 83.4850]); // Rupandehi District coordinates
  const [mapZoom, setMapZoom] = useState(11);
  const mapRef = useRef();

  const statusOptions = ['pending', 'in_progress', 'resolved'];
  const categoryOptions = ['waste', 'electrical', 'water', 'street', 'other'];
  const priorityOptions = ['low', 'medium', 'high', 'critical'];
  const municipalityOptions = [
    'Butwal', 'Siddharthanagar', 'Lumbini Sanskritik', 'Tillottama', 'Devdaha',
    'Sainamaina', 'Om Satiya', 'Rohini', 'Sammarimai', 'Kotahimai',
    'Marchawari', 'Mayadevi', 'Omsatiya', 'Siyari', 'Suddodhan'
  ];

  // Rupandehi municipalities with approximate coordinates
  const municipalityCoordinates = {
    'Butwal': [27.7000, 83.4500],
    'Siddharthanagar': [27.5000, 83.4500],
    'Lumbini Sanskritik': [27.4833, 83.2833],
    'Tillottama': [27.6333, 83.4833],
    'Devdaha': [27.5833, 83.4333],
    'Sainamaina': [27.5500, 83.3833],
    'Om Satiya': [27.5167, 83.3667],
    'Rohini': [27.6667, 83.4167],
    'Sammarimai': [27.6000, 83.3667],
    'Kotahimai': [27.5500, 83.3167],
    'Marchawari': [27.5333, 83.3333],
    'Mayadevi': [27.4667, 83.2667],
    'Omsatiya': [27.5167, 83.3500],
    'Siyari': [27.5833, 83.3333],
    'Suddodhan': [27.6167, 83.3500]
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, filters]);

  const fetchProblems = async () => {
    try {
      const response = await problemsAPI.getAll({ limit: 200 });
      // Add mock coordinates for demonstration
      const problemsWithCoords = response.data.data.problems.map(problem => ({
        ...problem,
        location: {
          ...problem.location,
          coordinates: municipalityCoordinates[problem.location?.municipality] || [
            mapCenter[0] + (Math.random() - 0.5) * 0.1,
            mapCenter[1] + (Math.random() - 0.5) * 0.1
          ]
        }
      }));
      setProblems(problemsWithCoords);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      toast.error('Failed to load problems map');
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = [...problems];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchLower) ||
        problem.description.toLowerCase().includes(searchLower) ||
        problem.location?.municipality.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(problem => problem.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(problem => problem.category === filters.category);
    }

    if (filters.municipality) {
      filtered = filtered.filter(problem => problem.location?.municipality === filters.municipality);
    }

    if (filters.priority) {
      filtered = filtered.filter(problem => problem.priority === filters.priority);
    }

    setFilteredProblems(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'text-green-700 bg-green-100';
      case 'in_progress':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-yellow-700 bg-yellow-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      waste: '🗑️',
      electrical: '⚡',
      water: '💧',
      street: '🛣️',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  const flyToLocation = (coordinates) => {
    if (mapRef.current) {
      mapRef.current.flyTo(coordinates, 14);
    }
  };

  const flyToMunicipality = (municipality) => {
    const coords = municipalityCoordinates[municipality];
    if (coords) {
      flyToLocation(coords);
    }
  };

  const generateHeatmapData = () => {
    // Simple heatmap simulation based on problem density
    const heatmapData = {};
    problems.forEach(problem => {
      const key = `${problem.location?.coordinates[0].toFixed(3)},${problem.location?.coordinates[1].toFixed(3)}`;
      heatmapData[key] = (heatmapData[key] || 0) + 1;
    });
    return heatmapData;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nepali-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-nepali-red" />
                Problems Map
              </h1>
              <p className="text-gray-600 mt-1">
                Explore and track community problems across Rupandehi District
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredProblems.length} problems
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                />
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={filters.municipality}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, municipality: e.target.value }));
                  if (e.target.value) {
                    flyToMunicipality(e.target.value);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
              >
                <option value="">All Municipalities</option>
                {municipalityOptions.map(municipality => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-nepali-blue focus:border-transparent"
              >
                <option value="">All Priorities</option>
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Map Controls */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Map Layers
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setMapView('standard')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  mapView === 'standard' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>Standard Map</span>
              </button>
              <button
                onClick={() => setMapView('satellite')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  mapView === 'satellite' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <Satellite className="w-4 h-4" />
                <span>Satellite View</span>
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, showHeatmap: !prev.showHeatmap }))}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  filters.showHeatmap ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <Thermometer className="w-4 h-4" />
                <span>Problem Heatmap</span>
              </button>
            </div>
          </div>

          {/* Problems List */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Problems ({filteredProblems.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProblems.length > 0 ? (
                filteredProblems.map(problem => (
                  <div
                    key={problem._id}
                    className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      selectedProblem?._id === problem._id ? 'border-nepali-blue bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedProblem(problem);
                      flyToLocation(problem.location.coordinates);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="shrink-0">
                        <span className="text-lg">{getCategoryIcon(problem.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {problem.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(problem.status)}`}>
                            {getStatusIcon(problem.status)}
                            <span className="ml-1 capitalize">{problem.status.replace('_', ' ')}</span>
                          </span>
                          {problem.priority && (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(problem.priority)}`}>
                              {problem.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {problem.location?.municipality}, Ward {problem.location?.ward}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No problems found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <LayersControl position="topright">
              {/* Standard Map */}
              <LayersControl.BaseLayer checked={mapView === 'standard'} name="Standard Map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              </LayersControl.BaseLayer>

              {/* Satellite View */}
              <LayersControl.BaseLayer checked={mapView === 'satellite'} name="Satellite View">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
              </LayersControl.BaseLayer>

              {/* Markers for problems */}
              {filteredProblems.map(problem => (
                <Marker
                  key={problem._id}
                  position={problem.location.coordinates}
                  icon={statusIcons[problem.status]}
                  eventHandlers={{
                    click: () => setSelectedProblem(problem),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-64">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(problem.category)}</span>
                        <h3 className="font-semibold text-gray-900">{problem.title}</h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(problem.status)}`}>
                          {getStatusIcon(problem.status)}
                          <span className="ml-1 capitalize">{problem.status.replace('_', ' ')}</span>
                        </span>
                        {problem.priority && (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(problem.priority)}`}>
                            {problem.priority}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{problem.description}</p>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{problem.location?.municipality}, Ward {problem.location?.ward}</span>
                        </div>
                        {problem.location?.exactLocation && (
                          <div>{problem.location.exactLocation}</div>
                        )}
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <Link
                          to={`/problems/${problem._id}`}
                          className="flex-1 bg-nepali-blue text-white text-center py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Heatmap Circles */}
              {filters.showHeatmap && Object.entries(generateHeatmapData()).map(([coords, count]) => {
                const [lat, lng] = coords.split(',').map(Number);
                const radius = Math.min(count * 200, 1000); // Scale radius based on density
                const intensity = Math.min(count / 10, 1); // Normalize intensity

                return (
                  <Circle
                    key={coords}
                    center={[lat, lng]}
                    radius={radius}
                    pathOptions={{
                      fillColor: `rgba(220, 20, 60, ${intensity})`, // Nepali red with intensity
                      color: `rgba(220, 20, 60, ${intensity * 0.8})`,
                      weight: 1,
                      opacity: 0.5,
                      fillOpacity: 0.3
                    }}
                  />
                );
              })}
            </LayersControl>
          </MapContainer>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 space-y-2">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => flyToLocation(mapCenter)}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              title="Reset View"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Problem Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Resolved</span>
              </div>
            </div>
            {filters.showHeatmap && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Problem Density</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 rounded-full"></div>
                  <span className="text-sm text-gray-600">Low</span>
                  <div className="w-6 h-6 bg-red-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">High</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;