import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Eye, CheckCircle, X, Clock, 
  Calendar, Package, User, MapPin, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { useCropsStore } from '../../store/cropsStore';

export const CropSubmissions: React.FC = () => {
  const { crops, updateCropStatus } = useCropsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  // Apply filters
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || crop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort crops
  const sortedCrops = [...filteredCrops].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'harvest':
        return new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime();
      case 'newest':
      default:
        return 0; // In real app, would sort by submission date
    }
  });

  const getSubmissionStats = () => {
    return {
      total: crops.length,
      pending: crops.filter(c => c.status === 'pending').length,
      approved: crops.filter(c => c.status === 'approved').length,
      rejected: crops.filter(c => c.status === 'rejected').length,
      listed: crops.filter(c => c.status === 'listed').length,
    };
  };

  const stats = getSubmissionStats();

  const handleApprove = (cropId: string) => {
    updateCropStatus(cropId, 'approved');
  };

  const handleReject = (cropId: string) => {
    if (window.confirm('Are you sure you want to reject this crop submission?')) {
      updateCropStatus(cropId, 'rejected');
    }
  };

  const handleViewDetails = (cropId: string) => {
    setSelectedCrop(cropId);
  };

  const selectedCropData = selectedCrop ? crops.find(c => c.id === selectedCrop) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crop Submissions</h1>
        <p className="text-gray-600 mt-1">Review and manage farmer crop submissions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Submissions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending Review</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{stats.listed}</div>
              <div className="text-sm text-gray-500">Listed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                fullWidth
              />
            </div>

            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'listed', label: 'Listed' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            />

            <Select
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'name', label: 'Name A-Z' },
                { value: 'status', label: 'Status' },
                { value: 'harvest', label: 'Harvest Date' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {sortedCrops.length > 0 ? (
        <div className="space-y-4">
          {sortedCrops.map((crop, index) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Crop Image */}
                    <div className="w-full lg:w-24 h-48 lg:h-24 overflow-hidden rounded-lg flex-shrink-0">
                      <img
                        src={crop.images[0] || 'https://images.pexels.com/photos/601798/pexels-photo-601798.jpeg'}
                        alt={crop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Crop Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{crop.description}</p>
                        </div>
                        <StatusBadge status={crop.status} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-medium">{crop.quantity} {crop.unit}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-gray-500">Harvest Date</p>
                            <p className="font-medium">{new Date(crop.harvestDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {crop.price && (
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">$</span>
                            <div>
                              <p className="text-gray-500">Price</p>
                              <p className="font-medium">${crop.price} / {crop.unit}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-gray-500">Farmer ID</p>
                            <p className="font-medium">{crop.farmerId.substring(0, 8)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:w-32">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => handleViewDetails(crop.id)}
                        fullWidth
                      >
                        View Details
                      </Button>
                      
                      {crop.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            icon={<CheckCircle size={14} />}
                            onClick={() => handleApprove(crop.id)}
                            fullWidth
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<X size={14} />}
                            onClick={() => handleReject(crop.id)}
                            fullWidth
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : "No crop submissions available at the moment."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Crop Details Modal */}
      {selectedCrop && selectedCropData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Crop Submission Details</h2>
                  <p className="text-gray-600">{selectedCropData.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X size={16} />}
                  onClick={() => setSelectedCrop(null)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Crop Images</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCropData.images.map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`${selectedCropData.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Crop Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{selectedCropData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-medium">{selectedCropData.quantity} {selectedCropData.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Harvest Date:</span>
                        <span className="font-medium">{new Date(selectedCropData.harvestDate).toLocaleDateString()}</span>
                      </div>
                      {selectedCropData.price && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price:</span>
                          <span className="font-medium">${selectedCropData.price} / {selectedCropData.unit}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <StatusBadge status={selectedCropData.status} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600">{selectedCropData.description}</p>
                  </div>

                  {selectedCropData.tac && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Terms & Conditions</h3>
                      <p className="text-gray-600">{selectedCropData.tac}</p>
                    </div>
                  )}

                  {selectedCropData.status === 'pending' && (
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="success"
                        icon={<CheckCircle size={16} />}
                        onClick={() => {
                          handleApprove(selectedCropData.id);
                          setSelectedCrop(null);
                        }}
                        fullWidth
                      >
                        Approve Submission
                      </Button>
                      <Button
                        variant="danger"
                        icon={<X size={16} />}
                        onClick={() => {
                          handleReject(selectedCropData.id);
                          setSelectedCrop(null);
                        }}
                        fullWidth
                      >
                        Reject Submission
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
