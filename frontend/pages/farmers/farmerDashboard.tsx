import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as ChartComponents from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { PlusCircle, Leaf, Package, Truck, Clipboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CropCard } from '../../components/common/CropCard';
import { useAuthStore } from '../../store/authStore';
import { useCropsStore } from '../../store/cropsStore';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { crops, getCropsByFarmer } = useCropsStore();
  
  // Get farmer's crops
  const farmerCrops = user ? getCropsByFarmer(user.id.toString()) : [];
  
  // Calculate statistics
  const totalCrops = farmerCrops.length;
  const pendingCrops = farmerCrops.filter(crop => crop.status === 'pending').length;
  const approvedCrops = farmerCrops.filter(crop => ['approved', 'listed'].includes(crop.status)).length;
  const rejectedCrops = farmerCrops.filter(crop => crop.status === 'rejected').length;
  
  // Chart data
  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Crops Sold',
        data: [12, 19, 10, 15, 22, 30],
        backgroundColor: 'rgba(46, 125, 50, 0.7)',
      },
    ],
  };
  
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [1200, 1900, 1000, 1500, 2200, 3000],
        borderColor: 'rgb(255, 143, 0)',
        backgroundColor: 'rgba(255, 143, 0, 0.1)',
        tension: 0.3,
      },
    ],
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-green-700 text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
        <p className="mt-2">Manage your crops and track your farming business.</p>
        <div className="mt-4">
          <Link to="/farmer/add-crop">
            <Button variant="secondary" icon={<PlusCircle size={16} />}>
              Add New Crop
            </Button>
          </Link>
        </div>
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
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Leaf className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Crops</p>
                  <p className="text-2xl font-bold">{totalCrops}</p>
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
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Clipboard className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Approval</p>
                  <p className="text-2xl font-bold">{pendingCrops}</p>
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
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Package className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved Crops</p>
                  <p className="text-2xl font-bold">{approvedCrops}</p>
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
                  <Truck className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold">{rejectedCrops}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartComponents.Bar data={barChartData} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartComponents.Line data={lineChartData} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent crops */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Crops</h2>
          <Link to="/farmer/crops">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmerCrops.slice(0, 3).map((crop) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CropCard crop={crop} linkTo={`/farmer/crops/${crop.id}`} />
            </motion.div>
          ))}
          
          {farmerCrops.length === 0 && (
            <div className="col-span-3 p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 mb-4">You haven't added any crops yet.</p>
              <Link to="/farmer/add-crop">
                <Button variant="primary">Add Your First Crop</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3 p-3 bg-green-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-800">
                  Your crop <span className="font-medium">Organic Wheat</span> has been approved.
                </p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status="approved" />
              </div>
            </li>
            <li className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-800">
                  Quality inspection scheduled for <span className="font-medium">Fresh Tomatoes</span>.
                </p>
                <p className="text-xs text-gray-500 mt-1">Yesterday</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status="pending" />
              </div>
            </li>
            <li className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-800">
                  New order placed for <span className="font-medium">Organic Wheat</span>.
                </p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status="confirmed" />
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
