import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, ShoppingBag, Truck, AlertCircle, 
  CheckCircle2, Clock, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useCropsStore } from '../../store/cropsStore';
import { useOrdersStore } from '../../store/ordersStore';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { crops } = useCropsStore();
  const { orders } = useOrdersStore();
  

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
      
      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-amber-600 mr-2" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crops.filter(crop => crop.status === 'pending').slice(0, 3).map(crop => (
                <div key={crop.id} className="flex items-start p-3 bg-amber-50 rounded-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{crop.name}</h4>
                    <p className="text-sm text-gray-500">Harvest: {new Date(crop.harvestDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={crop.status} />
                </div>
              ))}
              
              {crops.filter(crop => crop.status === 'pending').length === 0 && (
                <div className="p-3 text-center text-gray-500">
                  No pending approvals
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/crops" className="w-full">
              <Button variant="outline" fullWidth>
                View All Pending ({pendingCrops})
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              Recent Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crops.filter(crop => crop.status === 'approved').slice(0, 3).map(crop => (
                <div key={crop.id} className="flex items-start p-3 bg-green-50 rounded-md">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{crop.name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {crop.quantity} {crop.unit}</p>
                  </div>
                  <StatusBadge status={crop.status} />
                </div>
              ))}
              
              {crops.filter(crop => crop.status === 'approved').length === 0 && (
                <div className="p-3 text-center text-gray-500">
                  No recent approvals
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/crops?status=approved" className="w-full">
              <Button variant="outline" fullWidth>
                View All Approved ({approvedCrops})
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2">
                <span className="text-sm text-gray-700">Pending</span>
                <Badge variant="warning">{orders.filter(o => o.status === 'pending').length}</Badge>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm text-gray-700">Confirmed</span>
                <Badge variant="info">{orders.filter(o => o.status === 'confirmed').length}</Badge>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm text-gray-700">In Transit</span>
                <Badge variant="info">{orders.filter(o => o.status === 'in-transit').length}</Badge>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm text-gray-700">Delivered</span>
                <Badge variant="success">{orders.filter(o => o.status === 'delivered').length}</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/orders" className="w-full">
              <Button variant="outline" fullWidth>
                Manage Orders
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* User activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  New farmer <span className="font-medium">John Farmer</span> registered
                </p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Organic Wheat</span> was approved and listed on marketplace
                </p>
                <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  New order <span className="font-medium">#123456</span> was placed
                </p>
                <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  Quality agent <span className="font-medium">Alex</span> submitted a new quality report
                </p>
                <p className="text-xs text-gray-500 mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
