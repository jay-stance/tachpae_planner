'use client';

import { useEffect, useState } from 'react';
import { Package, Tags, Sparkles, ShoppingCart, TrendingUp } from 'lucide-react';

interface Stats {
  products: number;
  categories: number;
  services: number;
  orders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ products: 0, categories: 0, services: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('admin_token');
      
      try {
        // Fetch counts in parallel
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        setStats({
          products: productsData.data?.length || 0,
          categories: categoriesData.data?.length || 0,
          services: 0, // Will add later
          orders: 0,   // Will add later
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }

      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Products', value: stats.products, icon: Package, color: 'var(--tachpae-primary)' },
    { name: 'Categories', value: stats.categories, icon: Tags, color: 'var(--tachpae-secondary)' },
    { name: 'Services', value: stats.services, icon: Sparkles, color: 'var(--tachpae-accent)' },
    { name: 'Orders', value: stats.orders, icon: ShoppingCart, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div 
            key={stat.name}
            className="rounded-2xl border border-white/10 p-6"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}20` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-white/50 text-sm font-medium">{stat.name}</p>
            <p className="text-3xl font-black text-white mt-1">
              {loading ? '...' : stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/tachpae-hq-9x7k/products"
            className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-center"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-white/70" />
            <p className="text-white text-sm font-medium">Manage Products</p>
          </a>
          <a 
            href="/tachpae-hq-9x7k/orders"
            className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-center"
          >
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-white/70" />
            <p className="text-white text-sm font-medium">View Orders</p>
          </a>
          <a 
            href="/tachpae-hq-9x7k/categories"
            className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-center"
          >
            <Tags className="w-8 h-8 mx-auto mb-2 text-white/70" />
            <p className="text-white text-sm font-medium">Edit Categories</p>
          </a>
          <a 
            href="/tachpae-hq-9x7k/services"
            className="p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-center"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/70" />
            <p className="text-white text-sm font-medium">Manage Services</p>
          </a>
        </div>
      </div>
    </div>
  );
}
