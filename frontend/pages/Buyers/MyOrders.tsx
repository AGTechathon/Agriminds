import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Clock, CheckCircle, Truck, DollarSign, 
  Eye, X, Calendar, MapPin, User, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';
import { useCropsStore } from '../../store/cropsStore';

export const MyOrders: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, updateOrderStatus } = useOrdersStore();
  const { crops } = useCropsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Get buyer's orders
  const buyerOrders = user ? orders.filter(order => order.buyerId === user.id) : [];

  // Apply filters
  const filteredOrders = buyerOrders.filter(order => {
    const crop = crops.find(c => c.id === order.cropId);
    const matchesSearch = crop?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.totalAmount - a.totalAmount;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getOrderStats = () => {
    return {
      total: buyerOrders.length,
      pending: buyerOrders.filter(o => o.status === 'pending').length,
      confirmed: buyerOrders.filter(o => o.status === 'confirmed').length,
      inTransit: buyerOrders.filter(o => o.status === 'in-transit').length,
      delivered: buyerOrders.filter(o => o.status === 'delivered').length,
      totalSpent: buyerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  };

  const stats = getOrderStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in-transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      // In a real app, this would call an API
      console.log('Cancelling order:', orderId);
    }
  };

  const selectedOrderData = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;
  const selectedCrop = selectedOrderData ? crops.find(c => c.id === selectedOrderData.cropId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">Track your crop orders and delivery status</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{stats.confirmed}</div>
              <div className="text-sm text-gray-500">Confirmed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{stats.inTransit}</div>
              <div className="text-sm text-gray-500">In Transit</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-700">{stats.delivered}</div>
              <div className="text-sm text-gray-500">Delivered</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-700">${stats.totalSpent.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Spent</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder="Search orders or crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              fullWidth
            />

            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'in-transit', label: 'In Transit' },
                { value: 'delivered', label: 'Delivered' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            />

            <Select
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'amount', label: 'Amount High-Low' },
                { value: 'status', label: 'Status' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {sortedOrders.length > 0 ? (
        <div className="space-y-4">
          {sortedOrders.map((order, index) => {
            const crop = crops.find(c => c.id === order.cropId);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.id.substring(0, 8)}
                            </h3>
                            <p className="text-gray-600">{crop?.name || 'Unknown Crop'}</p>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">Total Amount</p>
                              <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">Order Date</p>
                              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">Payment Status</p>
                              <Badge 
                                variant={order.paymentStatus === 'fully-paid' ? 'success' : 'warning'}
                              >
                                {order.paymentStatus.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {order.advanceAmount && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              <strong>Advance Paid:</strong> ${order.advanceAmount.toFixed(2)} 
                              <span className="ml-2 text-green-600">
                                (Balance: ${(order.totalAmount - order.advanceAmount).toFixed(2)})
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row sm:flex-col gap-2 lg:w-32">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye size={14} />}
                          onClick={() => handleViewDetails(order.id)}
                          fullWidth
                        >
                          View Details
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<X size={14} />}
                            onClick={() => handleCancelOrder(order.id)}
                            fullWidth
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Order Progress</span>
                        <span>{order.status.replace('-', ' ').toUpperCase()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {['pending', 'confirmed', 'in-transit', 'delivered'].map((status, idx) => {
                          const isActive = ['pending', 'confirmed', 'in-transit', 'delivered'].indexOf(order.status) >= idx;
                          const isCurrent = order.status === status;
                          return (
                            <React.Fragment key={status}>
                              <div className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-2 ${
                                isActive 
                                  ? isCurrent 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'bg-green-600 border-green-600 text-white'
                                  : 'border-gray-300 text-gray-300'
                              }`}>
                                {getStatusIcon(status)}
                              </div>
                              {idx < 3 && (
                                <div className={`flex-1 h-1 ${
                                  ['pending', 'confirmed', 'in-transit', 'delivered'].indexOf(order.status) > idx
                                    ? 'bg-green-600' 
                                    : 'bg-gray-300'
                                }`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : "You haven't placed any orders yet. Browse the marketplace to find fresh crops."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && selectedOrderData && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600">#{selectedOrderData.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X size={16} />}
                  onClick={() => setSelectedOrder(null)}
                />
              </div>

              <div className="space-y-6">
                {/* Crop Details */}
                <div className="flex items-start space-x-4">
                  <img
                    src={selectedCrop.images[0] || 'https://images.pexels.com/photos/601798/pexels-photo-601798.jpeg'}
                    alt={selectedCrop.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedCrop.name}</h3>
                    <p className="text-gray-600 text-sm">{selectedCrop.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">Quantity: {selectedCrop.quantity} {selectedCrop.unit}</span>
                      <span className="text-gray-500">Price: ${selectedCrop.price} / {selectedCrop.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-medium">#{selectedOrderData.id.substring(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <StatusBadge status={selectedOrderData.status} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Date:</span>
                        <span className="font-medium">{new Date(selectedOrderData.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Amount:</span>
                        <span className="font-semibold text-green-700">${selectedOrderData.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Status:</span>
                        <Badge variant={selectedOrderData.paymentStatus === 'fully-paid' ? 'success' : 'warning'}>
                          {selectedOrderData.paymentStatus.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {selectedOrderData.advanceAmount && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Advance Paid:</span>
                            <span className="font-medium">${selectedOrderData.advanceAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Balance Due:</span>
                            <span className="font-medium">${(selectedOrderData.totalAmount - selectedOrderData.advanceAmount).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Tracking */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Delivery Tracking</h4>
                  <div className="space-y-3">
                    {['pending', 'confirmed', 'in-transit', 'delivered'].map((status, idx) => {
                      const isActive = ['pending', 'confirmed', 'in-transit', 'delivered'].indexOf(selectedOrderData.status) >= idx;
                      const isCurrent = selectedOrderData.status === status;
                      return (
                        <div key={status} className={`flex items-center space-x-3 p-3 rounded-lg ${
                          isActive ? 'bg-green-50' : 'bg-gray-50'
                        }`}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                            isActive 
                              ? isCurrent 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-green-600 border-green-600 text-white'
                              : 'border-gray-300 text-gray-300'
                          }`}>
                            {getStatusIcon(status)}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-blue-600">Current status</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
