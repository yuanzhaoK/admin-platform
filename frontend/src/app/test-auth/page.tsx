'use client';

import { useAuth } from '@/contexts/AuthContext';
import { pb } from '@/lib/pocketbase';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">认证状态测试</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">AuthContext状态:</h2>
          <p>isLoading: {isLoading.toString()}</p>
          <p>isAuthenticated: {isAuthenticated.toString()}</p>
          <p>user: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="font-semibold">PocketBase authStore状态:</h2>
          <p>isValid: {pb.authStore.isValid.toString()}</p>
          <p>hasToken: {(!!pb.authStore.token).toString()}</p>
          <p>hasModel: {(!!pb.authStore.model).toString()}</p>
          <p>token: {pb.authStore.token ? `${pb.authStore.token.substring(0, 20)}...` : 'null'}</p>
          <p>model: {pb.authStore.model ? JSON.stringify(pb.authStore.model, null, 2) : 'null'}</p>
        </div>

        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          前往Dashboard
        </button>

        <button 
          onClick={() => window.location.href = '/'}
          className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
        >
          返回首页
        </button>
      </div>
    </div>
  );
} 