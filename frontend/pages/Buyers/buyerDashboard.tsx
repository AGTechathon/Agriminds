import react from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Box, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CropCard } from '../../components/common/CropCard';
import { useAuthStore } from '../../store/authStore';
import { useCropsStore } from '../../store/cropsStore';
import { useOrdersStore } from '../../store/ordersStore';
export const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { marketplaceListings, crops } = useCropsStore();
  const { orders, getOrdersByBuyer } = useOrdersStore();
  const buyerOrders = user ? getOrdersByBuyer(user.id) : [];
  const featuredCrops = crops.filter(crop => crop.status === 'listed').slice(0, 3);
  return(
    <div className="space-y-6">
     
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="mt-2">Browse the freshest crops directly from farmers.</p>
        <div className="mt-4">
          <Link to="/buyer/marketplace">
            <Button variant="primary" icon={<ShoppingCart size={16} />}>
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>

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
                  <ShoppingCart className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Orders Placed</p>
                  <p className="text-2xl font-bold">{buyerOrders.length}</p>
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
                  <Box className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Crops</p>
                  <p className="text-2xl font-bold">{marketplaceListings.length}</p>
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
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold">$1,250</p>
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
                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                  <Clock className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Delivery</p>
                  <p className="text-2xl font-bold">{buyerOrders.filter(o => o.status !== 'delivered').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
 
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Featured Crops</h2>
          <Link to="/buyer/marketplace">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCrops.map((crop) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CropCard crop={crop} linkTo={`/buyer/marketplace/${crop.id}`} />
            </motion.div>
          ))}
          
          {featuredCrops.length === 0 && (
            <div className="col-span-3 p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No crops available in the marketplace yet.</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for new listings.</p>
            </div>
          )}
        </div>
      </div>
  
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {buyerOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Order ID</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Crop</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Amount</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {buyerOrders.map(order => {
                    const orderCrop = crops.find(c => c.id === order.cropId);
                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">#{order.id.substring(0, 6)}</td>
                        <td className="px-4 py-3">{orderCrop?.name || 'Unknown Crop'}</td>
                        <td className="px-4 py-3">${order.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/buyer/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">Details</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link to="/buyer/marketplace">
                <Button variant="primary">Browse Marketplace</Button>
              </Link>
            </div>
          )}
        </CardContent>
        {buyerOrders.length > 0 && (
          <CardFooter className="flex justify-center">
            <Link to="/buyer/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
      

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center text-center">
              <img 
                src="https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg" 
                alt="Seasonal Crop" 
                className="w-16 h-16 object-cover rounded-full mb-3"
              />
              <h3 className="font-medium text-green-800">Spring Harvest</h3>
              <p className="text-sm text-gray-600 mt-1">
                Fresh greens and early vegetables are in season now!
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg flex flex-col items-center text-center">
              <img 
                src="https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg" 
                alt="Seasonal Crop" 
                className="w-16 h-16 object-cover rounded-full mb-3"
              />
              <h3 className="font-medium text-amber-800">Best Deals</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check out our featured crops at special prices
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center text-center">
              <img 
                src="https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg" 
                alt="Seasonal Crop" 
                className="w-16 h-16 object-cover rounded-full mb-3"
              />
              <h3 className="font-medium text-blue-800">Coming Soon</h3>
              <p className="text-sm text-gray-600 mt-1">
                Summer fruits will be available next month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
