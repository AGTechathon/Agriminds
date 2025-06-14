import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, CheckCircle2, TruckIcon, 
  AlertCircle, Calendar, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useCropsStore } from '../../store/cropsStore';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { crops } = useCropsStore();
  
  // Mock data - In a real application, these would come from the API
  const pendingInspections = 3;
  const completedInspections = 8;
  const assignedDeliveries = 2;
  
  // Tasks for today
  const todayTasks = [
    { id: 1, type: 'inspection', cropName: 'Organic Wheat', time: '10:00 AM', location: 'Farm Zone A', status: 'pending' },
    { id: 2, type: 'delivery', cropName: 'Fresh Tomatoes', time: '2:00 PM', location: 'Logistics Hub', status: 'pending' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-purple-700 text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="mt-2">Manage quality inspections and crop deliveries.</p>
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
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <ClipboardCheck className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Inspections</p>
                  <p className="text-2xl font-bold">{pendingInspections}</p>
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
                  <CheckCircle2 className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">{completedInspections}</p>
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
                  <TruckIcon className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Deliveries</p>
                  <p className="text-2xl font-bold">{assignedDeliveries}</p>
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
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Calendar className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today's Tasks</p>
                  <p className="text-2xl font-bold">{todayTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Today's schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {todayTasks.length > 0 ? (
            <div className="space-y-4">
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div className="mr-4">
                    {task.type === 'inspection' ? (
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <ClipboardCheck className="h-5 w-5 text-amber-700" />
                      </div>
                    ) : (
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TruckIcon className="h-5 w-5 text-blue-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{task.cropName}</h3>
                        <p className="text-sm text-gray-500">{task.location}</p>
                      </div>
                      <Badge variant={task.type === 'inspection' ? 'warning' : 'info'}>
                        {task.type === 'inspection' ? 'Inspection' : 'Delivery'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600">{task.time}</span>
                      <Link to={task.type === 'inspection' ? '/agent/inspections' : '/agent/deliveries'}>
                        <Button variant="ghost" size="sm" icon={<ArrowRight size={16} />}>
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks scheduled for today.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pending inspections */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crops.filter(crop => crop.status === 'pending').slice(0, 3).map(crop => (
              <div key={crop.id} className="flex items-start p-3 bg-amber-50 rounded-md">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{crop.name}</h4>
                  <p className="text-sm text-gray-500">Quantity: {crop.quantity} {crop.unit}</p>
                  <p className="text-sm text-gray-500">Harvest: {new Date(crop.harvestDate).toLocaleDateString()}</p>
                </div>
                <Link to={`/agent/inspections/${crop.id}`}>
                  <Button variant="outline" size="sm">
                    Inspect
                  </Button>
                </Link>
              </div>
            ))}
            
            {crops.filter(crop => crop.status === 'pending').length === 0 && (
              <div className="p-3 text-center text-gray-500">
                No pending inspections at the moment.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link to="/agent/inspections" className="w-full">
            <Button variant="outline" fullWidth>
              View All Inspections
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  Completed inspection for <span className="font-medium">Organic Carrots</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
              <StatusBadge status="approved" />
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  Delivered <span className="font-medium">Fresh Apples</span> to buyer
                </p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
              <StatusBadge status="delivered" />
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
              <div className="flex-shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  Assigned to inspect <span className="font-medium">Brown Rice</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">3 days ago</p>
              </div>
              <StatusBadge status="pending" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
