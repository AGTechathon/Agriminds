import React from 'react';
export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { crops } = useCropsStore();
  const { orders } = useOrdersStore();
  
  // Calculate statistics
  const pendingCrops = crops.filter(crop => crop.status === 'pending').length;
  const approvedCrops = crops.filter(crop => ['approved', 'listed'].includes(crop.status)).length;
  const rejectedCrops = crops.filter(crop => crop.status === 'rejected').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-blue-700 text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2">Manage the marketplace, review crops, and oversee operations.</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Users</p>
                  <p className="text-2xl font-bold">120</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <ShoppingBag className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Crops</p>
                  <p className="text-2xl font-bold">{crops.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Truck className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <AlertCircle className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Reviews</p>
                  <p className="text-2xl font-bold">{pendingCrops}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
