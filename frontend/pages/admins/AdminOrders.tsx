import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Eye, Package, Truck, CheckCircle, 
  Calendar, DollarSign, User, MapPin, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { useOrdersStore } from '../../store/ordersStore';
import { useCropsStore } from '../../store/cropsStore';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { crops } = useCropsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Apply filters
  const filteredOrders = orders.filter(order => {
    const crop = crops.find(c => c.id === order.cropId);
    const matchesSearch = crop?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerId.toLowerCase().includes(searchTerm.toLowerCase());
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
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      inTransit: orders.filter(o => o.status === 'in-transit').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  };

  const stats = getOrderStats();

  const handleManageOrder = (orderId: string) => {
    setSelectedOrder(orderId);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
  };

  const selectedOrderData = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;
  const selectedCrop = selectedOrderData ? crops.find(c => c.id === selectedOrderData.cropId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all marketplace orders</p>
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
              <div className="text-2xl font-bold text-indigo-700">${stats.totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Value</div>
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
                placeholder="Search orders, crops, or buyers..."
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
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
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

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">Amount</p>
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
                              <p className="text-gray-500">Buyer ID</p>
                              <p className="font-medium">{order.buyerId.substring(0, 8)}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-500">Payment</p>
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
                              <strong>Advance:</strong> ${order.advanceAmount.toFixed(2)} 
                              <span className="ml-2 text-green-600">
                                (Balance: ${(order.totalAmount - order.advanceAmount).toFixed(2)})
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:w-32">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Eye size={14} />}
                          onClick={() => handleManageOrder(order.id)}
                          fullWidth
                        >
                          View Details
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Settings size={14} />}
                          onClick={() => handleManageOrder(order.id)}
                          fullWidth
                        >
                          Manage Order
                        </Button>
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
                : "No orders available at the moment."
              }
            </p>
          </CardContent>
        </Card>
      )}
      {/* Order Management Modal */}
      {selectedOrder && selectedOrderData && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
                  <p className="text-gray-600">#{selectedOrderData.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<X size={16} />}
                  onClick={() => setSelectedOrder(null)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order ID:</span>
                        <span className="font-medium">#{selectedOrderData.id.substring(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Crop:</span>
                        <span className="font-medium">{selectedCrop.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Buyer ID:</span>
                        <span className="font-medium">{selectedOrderData.buyerId.substring(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Date:</span>
                        <span className="font-medium">{new Date(selectedOrderData.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Amount:</span>
                        <span className="font-semibold text-green-700">${selectedOrderData.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Current Status:</span>
                        <StatusBadge status={selectedOrderData.status} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Status Management</h3>
                    <div className="space-y-3">
                      <Select
                        label="Update Order Status"
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'confirmed', label: 'Confirmed' },
                          { value: 'in-transit', label: 'In Transit' },
                          { value: 'delivered', label: 'Delivered' },
                        ]}
                        value={selectedOrderData.status}
                        onChange={(e) => handleUpdateStatus(selectedOrderData.id, e.target.value)}
                        fullWidth
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="success"
                          size="sm"
                          icon={<CheckCircle size={14} />}
                          onClick={() => handleUpdateStatus(selectedOrderData.id, 'confirmed')}
                          fullWidth
                        >
                          Confirm Order
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Truck size={14} />}
                          onClick={() => handleUpdateStatus(selectedOrderData.id, 'in-transit')}
                          fullWidth
                        >
                          Mark In Transit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crop Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Crop Details</h3>
                    <div className="flex items-start space-x-4">
                      <img
                        src={selectedCrop.images[0] || 'https://images.pexels.com/photos/601798/pexels-photo-601798.jpeg'}
                        alt={selectedCrop.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{selectedCrop.name}</h4>
                        <p className="text-gray-600 text-sm">{selectedCrop.description}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Quantity:</span>
                            <span className="font-medium">{selectedCrop.quantity} {selectedCrop.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Price:</span>
                            <span className="font-medium">${selectedCrop.price} / {selectedCrop.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Harvest Date:</span>
                            <span className="font-medium">{new Date(selectedCrop.harvestDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                    <div className="space-y-3">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
