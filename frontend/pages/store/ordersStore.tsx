import { create } from 'zustand';
import { api } from '../utils/api';

export interface Order {
  id: string;
  cropId: string; // Keep as string
  buyerId?: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered';
  paymentStatus: 'fully-paid' | 'partially-paid' | 'unpaid';
  advanceAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  deliveryAgentId?: number;
  cropName?: string;
}

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  setOrders: (orders: Order[]) => void;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  setOrders: (orders) => {
    console.log('🚖 Orders:', orders);
    set({ orders });
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/farmer/orders');
      console.log('✅ Fetched orders:', response);
      const transformedOrders = response.map((order: any) => ({
        id: String(order.id),
        cropId: String(order.crop_id), // Keep as string
        buyerId: order.buyer_id ? String(order.buyer_id) : undefined,
        quantity: parseInt(order.quantity, 10),
        totalAmount: parseFloat(order.total_price),
        status: order.status,
        paymentStatus: order.payment_status || 'unpaid',
        advanceAmount: order.advance_amount ? parseFloat(order.advance_amount) : undefined,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        deliveryAgentId: order.delivery_agent_id ? parseInt(order.delivery_agent_id, 10) : undefined,
        cropName: order.crop_name
      }));
      console.log('✅ Transformed orders:', transformedOrders);
      set({ orders: transformedOrders, isLoading: false });
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err.message);
      set({ error: 'Failed to fetch orders', isLoading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      set((state) => ({
        orders: state.orders.map(order => 
          order.id === id ? { ...order, status } : order
        )
      }));
    } catch (err: any) {
      console.error('❌ Error updating order status:', err.message);
    }
  }
}));