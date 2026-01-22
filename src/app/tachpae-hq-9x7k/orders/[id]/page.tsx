'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Package, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  productName: string;
  name?: string;
  quantity: number;
  priceAtPurchase: number;
  variantSelection?: Record<string, string>;
}

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
}

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PROCESSING: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SHIPPED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem('admin_token');

      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.success) {
          setOrder(data.data);
          setNewStatus(data.data.status);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) return;
    
    setSaving(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order!, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update:', err);
    }
    setSaving(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50">Order not found</p>
        <Link href="/tachpae-hq-9x7k/orders" className="text-blue-400 mt-4 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tachpae-hq-9x7k/orders">
          <Button variant="ghost" className="text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-white/50 text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Customer</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-white/40" />
              <span className="text-white">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-white/40" />
              <span className="text-white">{order.customerPhone}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-white/40 mt-0.5" />
              <div>
                <p className="text-white">{order.deliveryAddress}</p>
                <p className="text-white/50 text-sm">{order.deliveryCity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Status */}
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-4">Update Status</h2>
          <div className="space-y-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 text-white rounded-xl"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button 
              onClick={handleUpdateStatus}
              disabled={saving || newStatus === order.status}
              className="w-full border-0"
              style={{ background: 'linear-gradient(135deg, var(--tachpae-primary), var(--tachpae-primary-light))' }}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="text-lg font-bold text-white mb-4">Items ({order.items?.length || 0})</h2>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{item.name || item.productName}</p>
                <p className="text-white/40 text-sm">Qty: {item.quantity}</p>
                {Object.entries(item.variantSelection || {}).map(([key, val]) => (
                  <span key={key} className="text-white/50 text-xs mr-2">{key}: {val}</span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-white font-bold">₦{(item.priceAtPurchase || 0).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Total */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-white font-medium">Total Amount</span>
          <span className="text-2xl font-black text-white">₦{order.totalAmount?.toLocaleString()}</span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-lg font-bold text-white mb-2">Customer Notes</h2>
          <p className="text-white/70">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
