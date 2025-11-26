// 用户个人资料页面
'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
    
    // 如果未登录，重定向到登录页面
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-lg font-medium">{session.user.email}</p>
              </div>
              
              {session.user.name && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-lg font-medium">{session.user.name}</p>
                </div>
              )}
              
              {session.user.bio && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                  <p className="text-base whitespace-pre-wrap">{session.user.bio}</p>
                </div>
              )}
              
              {session.user.skills && session.user.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {session.user.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="text-lg font-medium capitalize">{session.user.role}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                <p className="text-base">
                  {session.user.createdAt && 
                    new Date(session.user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  }
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}