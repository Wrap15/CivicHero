'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsersRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/dashboard?tab=users');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
