'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Loader2, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-purple-500/20 text-purple-400',
  SHIPPED: 'bg-cyan-500/20 text-cyan-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');

    try {
      let url = `/api/admin/orders?page=${page}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.data || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Orders</h1>
          <p className="text-white/50 mt-1">{pagination.total} orders total</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 bg-white/5 border border-white/10 text-white rounded-xl text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Button 
            variant="ghost" 
            onClick={() => fetchOrders(pagination.page)}
            className="text-white/50 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium p-4">Order ID</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Customer</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Items</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Total</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Status</th>
                  <th className="text-left text-white/50 text-sm font-medium p-4">Date</th>
                  <th className="text-right text-white/50 text-sm font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <span className="text-white font-mono text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium">{order.customerName}</p>
                      <p className="text-white/40 text-sm">{order.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70">{order.items?.length || 0} items</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold">₦{order.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/50 text-sm">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="p-4">
                      <Link href={`/tachpae-hq-9x7k/orders/${order._id}`}>
                        <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant="ghost"
              size="sm"
              onClick={() => fetchOrders(page)}
              className={page === pagination.page ? 'bg-white/10 text-white' : 'text-white/50'}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
