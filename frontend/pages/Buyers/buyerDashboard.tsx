import react from "react"

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { marketplaceListings, crops } = useCropsStore();
  const { orders, getOrdersByBuyer } = useOrdersStore();
  const buyerOrders = user ? getOrdersByBuyer(user.id) : [];
  const featuredCrops = crops.filter(crop => crop.status === 'listed').slice(0, 3);
  return(
    <div className="space-y-6">
      {/* Welcome section */}
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
  )
