import React, { useState } from 'react';
//import { motion } from 'farmer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, MapPin, Phone, Mail, Calendar, Edit, 
  Save, X, Camera, Shield, Award, ShoppingCart
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useCropsStore } from '../../store/cropsStore';
import { useOrdersStore } from '../../store/ordersStore';

interface ProfileFormData {
  name: string;
  email: string;
  contactNumber: string;
  location: string;
  bio: string;
  preferredCrops: string;
  purchaseFrequency: string;
  deliveryPreference: string;
}

export const BuyerProfile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { crops } = useCropsStore();
  const { orders } = useOrdersStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      contactNumber: user?.contactNumber || '',
      location: user?.location || '',
      bio: 'Passionate about sourcing fresh, sustainable produce from local farmers.',
      preferredCrops: 'Organic vegetables, grains, fruits',
      purchaseFrequency: 'Weekly',
      deliveryPreference: 'Home delivery',
    },
  });

  
  const buyerOrders = user ? orders.filter(order => order.buyerId === user.id) : [];
  const favoriteCrops = [...new Set(buyerOrders.map(order => crops.find(crop => crop.id === order.cropId)?.name).filter(Boolean))];

  const stats = {
    totalOrders: buyerOrders.length,
    activeOrders: buyerOrders.filter(o => o.status === 'pending' ).length,
    totalSpent: buyerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    favoriteCropCount: favoriteCrops.length,
    loyaltyScore: buyerOrders.length > 0 ? Math.min(buyerOrders.length * 10, 100) : 0,
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    
    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          name: data.name,
          email: data.email,
          contactNumber: data.contactNumber,
          location: data.location,
        });
      }
      setIsLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleImageUpload = () => {
    // In a real app, this would handle image upload
    console.log('Image upload functionality');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyer Profile</h1>
          <p className="text-gray-600 mt-1">Manage your buyer profile and account settings</p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            icon={<Edit size={16} />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <Card>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      {...register('name', { required: 'Name is required' })}
                      error={errors.name?.message}
                      fullWidth
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      error={errors.email?.message}
                      fullWidth
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Contact Number"
                      {...register('contactNumber')}
                      fullWidth
                    />
                    <Input
                      label="Location"
                      {...register('location')}
                      fullWidth
                    />
                  </div>

                  <Textarea
                    label="Bio"
                    rows={3}
                    {...register('bio')}
                    fullWidth
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Preferred Crops"
                      {...register('preferredCrops')}
                      fullWidth
                    />
                    <Input
                      label="Purchase Frequency"
                      {...register('purchaseFrequency')}
                      fullWidth
                    />
                    <Input
                      label="Delivery Preference"
                      {...register('deliveryPreference')}
                      fullWidth
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      icon={<X size={16} />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={<Save size={16} />}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-10 w-10 text-blue-700" />
                      </div>
                      <button
                        onClick={handleImageUpload}
                        className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md border hover:bg-gray-50"
                      >
                        <Camera className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                      <p className="text-gray-600">{user?.email}</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {user?.location || 'Location not set'}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {user?.contactNumber || 'Phone not set'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="primary">Buyer</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {new Date(user?.createdAt || new Date()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Bio and Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">About</h3>
                      <p className="text-gray-600 text-sm">
                        Passionate about sourcing fresh, sustainable produce from local farmers.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Preferred Crops:</span>
                        <span className="ml-2 text-sm font-medium">Organic vegetables, grains, fruits</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Purchase Frequency:</span>
                        <span className="ml-2 text-sm font-medium">Weekly</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Delivery Preference:</span>
                        <span className="ml-2 text-sm font-medium">Home delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Milestones</CardTitle>
            </CardHeader>
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Award className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Loyal Customer</h4>
                    <p className="text-sm text-blue-700">50+ Orders Placed</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Shield className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Trusted Buyer</h4>
                    <p className="text-sm text-green-700">100% Payment Success</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <div className="p-2 bg-amber-100 rounded-lg mr-3">
                    <ShoppingCart className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-900">Bulk Buyer</h4>
                    <p className="text-sm text-amber-700">High-volume purchases</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <User className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-900">Community Supporter</h4>
                    <p className="text-sm text-purple-700">Supports local farmers</p>
                  </div>
                </div>
              </div>
            </Card>
          </Card>
        </div>

    
        <div className="space-y-6">
   
          <Card>
            <CardHeader>
              <CardTitle>Purchase Overview</CardTitle>
            </CardHeader>
            <Card className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats.totalOrders}</div>
                <div className="text-sm text-blue-600">Total Orders Placed</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats.activeOrders}</div>
                <div className="text-sm text-green-600">Active Orders</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">${stats.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-purple-600">Total Spent</div>
              </div>

              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">{stats.favoriteCropCount}</div>
                <div className="text-sm text-amber-600">Favorite Crops</div>
              </div>

              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-700">{stats.loyaltyScore}%</div>
                <div className="text-sm text-emerald-600">Loyalty Score</div>
              </div>
            </Card>
          </Card>

     
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <Card className="space-y-3">
              <Button variant="outline" fullWidth icon={<ShoppingCart size={16} />}>
                Browse Crops
              </Button>
              <Button variant="outline" fullWidth icon={<User size={16} />}>
                Update Preferences
              </Button>
              <Button variant="outline" fullWidth icon={<Shield size={16} />}>
                Security Settings
              </Button>
              <Button variant="outline" fullWidth icon={<Mail size={16} />}>
                Contact Support
              </Button>
            </Card>
          </Card>
        </div>
      </div>
    </div>
  );
};
