import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, Check, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useAuthStore } from '../../store/authStore';
import { useCropsStore } from '../../store/cropsStore';
import { Crop } from '../../types';

interface AddCropFormData {
  name: string;
  quantity: number;
  unit: string;
  harvest_date: string;
  description: string;
  images: FileList;
  price: number;
  category: string;
}

export const AddCropPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addCrop } = useCropsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<AddCropFormData>();
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // In a real app, you would upload these files to a server
    // Here we'll just create local URLs for preview
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      imageUrls.push(url);
    }
    
    setUploadedImages(imageUrls);
  };
  
  const onSubmit = async (data: AddCropFormData) => {
  if (!user) {
    console.error("No user found");
    return;
  }
  
  setIsSubmitting(true);
  console.log("🚀 Starting form submission...");

  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('quantity', String(data.quantity));
    formData.append('unit', data.unit);
    formData.append('harvest_date', data.harvest_date);
    formData.append('price', String(data.price));
    formData.append('description', data.description);
    formData.append('category', data.category);

    // Attach images if available
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('crop_images', data.images[i]);
      }
    }

    console.log("🚀 Form data prepared:", data);

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log("🚀 Sending request to:", 'http://localhost:5000/api/farmer/crops');
    
    const response = await fetch('http://localhost:5000/api/farmer/crops', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("🚀 Response status:", response.status);

    // Even if there's a 500 error, we'll assume the data was saved
    // because we know that's what's happening in our backend
    if (response.status === 500) {
      console.warn("Server returned 500 but data may have been saved. Proceeding anyway.");
      
      // Navigate to My Crops page
      navigate('/farmer/my-crops', {
        state: {
          notification: {
            type: 'warning',
            message: 'Crop may have been submitted, but there was an error. Please check your crops list.'
          }
        }
      });
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Server error response:", errorData);
      throw new Error(`Failed to submit crop: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Crop added successfully:', result);

    // Navigate to My Crops page
    navigate('/farmer/my-crops', {
      state: {
        notification: {
          type: 'success',
          message: 'Crop submitted successfully and is pending approval.'
        }
      }
    });
  } catch (error) {
    console.error('❌ Submission error:', error);
    
    // Here we'll check if it's our known 500 error and still navigate
    if (error instanceof Error && error.message.includes('500 Internal Server Error')) {
      console.warn("Server returned 500 but data may have been saved. Proceeding anyway.");
      
      navigate('/farmer/my-crops', {
        state: {
          notification: {
            type: 'warning',
            message: 'Crop may have been submitted, but there was an error. Please check your crops list.'
          }
        }
      });
      return;
    }
    
    alert(`Failed to submit crop: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsSubmitting(false);
  }
};
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">Add New Crop</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Crop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="add-crop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Crop Name"
                placeholder="e.g., Organic Wheat"
                {...register('name', { required: 'Crop name is required' })}
                error={errors.name?.message}
                fullWidth
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  min="0"
                  placeholder="e.g., 500"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be greater than 0' }
                  })}
                  error={errors.quantity?.message}
                  fullWidth
                />
                
                <Select
                  label="Unit"
                  options={[
                    { value: 'kg', label: 'Kilograms (kg)' },
                    { value: 'tons', label: 'Tons' },
                    { value: 'lbs', label: 'Pounds (lbs)' },
                    { value: 'bushels', label: 'Bushels' },
                  ]}
                  {...register('unit', { required: 'Unit is required' })}
                  error={errors.unit?.message}
                  fullWidth
                />
              </div>
              
              <Input
                label="Harvest Date"
                type="date"
                {...register('harvest_date', { required: 'Harvest date is required' })}
                error={errors.harvest_date?.message}
                fullWidth
              />
              
              <Input
                label="Expected Price (per unit)"
                type="number"
                placeholder="e.g., 250"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 1, message: 'Price must be greater than 0' }
                })}
                error={errors.price?.message}
                fullWidth
              />
            </div>
            
            <Textarea
              label="Description"
              placeholder="Describe your crop, growing methods, and any special characteristics..."
              rows={4}
              {...register('description', { required: 'Description is required' })}
              error={errors.description?.message}
              fullWidth
            />
            
            <Select
              label="Category"
              options={[
                { value: 'vegetables', label: 'Vegetables' },
                { value: 'fruits', label: 'Fruits' },
                { value: 'pulses', label: 'Pulses' },
                { value: 'grains', label: 'Grains' },
                { value: 'oilseeds', label: 'Oilseeds' },
                { value: 'spices', label: 'Spices' },
                { value: 'other', label: 'Other' },
              ]}
              {...register('category', { required: 'Category is required' })}
              error={errors.category?.message}
              fullWidth
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Crop Images
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                    >
                      <span>Upload images</span>
                      <input
                        id="images"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        {...register('images')}
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Uploaded image ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full">
                        <Check size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-crop-form"
            disabled={isSubmitting}
            className={isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 p-4 rounded-lg border border-blue-200"
      >
        <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Your crop submission will be reviewed by an administrator</li>
          <li>A quality agent will be assigned to inspect your crop</li>
          <li>After inspection, your crop will be approved or rejected</li>
          <li>Approved crops will be listed on the marketplace</li>
          <li>You'll be notified at each step of the process</li>
        </ol>
      </motion.div>
    </div>
  );
};
