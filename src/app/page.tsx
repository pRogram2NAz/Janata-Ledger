'use client';

import { useState } from 'react';
import { Building2, HardHat, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LocalGovernmentDashboard from '@/components/dashboards/local-government-dashboard';
import ContractorDashboard from '@/components/dashboards/contractor-dashboard';
import CitizenDashboard from '@/components/dashboards/citizen-dashboard';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<'LOCAL_GOVERNMENT' | 'CONTRACTOR' | 'CITIZEN' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (role: string, data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setSelectedRole(role as any);
      } else {
        alert(result.error || 'Failed to login');
      }
    } catch (error) {
      alert('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {!user ? (
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Track Government Payments Transparently
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A comprehensive system for local governments, contractors, and citizens to 
              track payment requests, work progress, and ensure transparency in government projects.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Government Card */}
            <Card className="border-2 border-emerald-200 hover:border-emerald-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedRole('LOCAL_GOVERNMENT')}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <Building2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Local Government</CardTitle>
                <CardDescription className="text-center">
                  Manage contracts, approve payment requests, and monitor work progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600"></div>
                    Approve payment requests
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600"></div>
                    Review daily work reports
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600"></div>
                    Monitor contract progress
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600"></div>
                    Track contractor ratings
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contractor Card */}
            <Card className="border-2 border-teal-200 hover:border-teal-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedRole('CONTRACTOR')}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                    <HardHat className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Contractor</CardTitle>
                <CardDescription className="text-center">
                  Submit work plans, report progress, and request payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-600"></div>
                    Submit daily work plans
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-600"></div>
                    Post work reports after 5 PM
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-600"></div>
                    Request payments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-600"></div>
                    Track your AI rating
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Citizen Card */}
            <Card className="border-2 border-cyan-200 hover:border-cyan-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedRole('CITIZEN')}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                    <Users className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Citizen</CardTitle>
                <CardDescription className="text-center">
                  Monitor government spending and work progress in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-600"></div>
                    View contractor reports
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-600"></div>
                    Track payments made
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-600"></div>
                    Access work plans
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-600"></div>
                    Ensure transparency
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Login Form */}
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Login</CardTitle>
                <CardDescription className="text-center">
                  Enter your details to access to dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleLogin(selectedRole!, {
                    email: formData.get('email') as string,
                    name: formData.get('name') as string,
                    role: selectedRole!,
                    nidNumber: selectedRole === 'CITIZEN' ? formData.get('nidNumber') as string : undefined
                  });
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Selected Role</Label>
                    <Select value={selectedRole || ''} onValueChange={(value) => setSelectedRole(value as 'LOCAL_GOVERNMENT' | 'CONTRACTOR' | 'CITIZEN')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOCAL_GOVERNMENT">Local Government</SelectItem>
                        <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                        <SelectItem value="CITIZEN">Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {selectedRole === 'CITIZEN' && (
                    <div className="space-y-2">
                      <Label htmlFor="nidNumber">Citizenship/NID Number</Label>
                      <Input
                        id="nidNumber"
                        name="nidNumber"
                        type="text"
                        placeholder="Format: District-Ward-Number (e.g., 12-34-56789)"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Format: District-Ward-Number (e.g., 12-34-56789)
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading || !selectedRole}
                  >
                    {isLoading ? 'Logging in...' : 'Access Dashboard'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <section className="bg-white/50 dark:bg-gray-800/50 py-16">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
                    <Building2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Transparent Tracking</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor every payment request and work progress in real-time
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
                    <HardHat className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h4 className="font-semibold mb-2">AI-Powered Ratings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contractor ratings based on comprehensive AI analysis
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900 mb-4">
                    <Users className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Citizen Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Citizens can verify and access all public project information
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                    <HardHat className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Smart Rating</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Harder to gain points, easier to lose points for fair evaluation
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t bg-white dark:bg-gray-900 mt-16">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  © 2025 Payment Delay Tracker. Built for Nepal Local Governments.
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Hackathon Project
                </div>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <div className="min-h-screen">
          {selectedRole === 'LOCAL_GOVERNMENT' && (
            <LocalGovernmentDashboard user={user} onLogout={() => { setUser(null); setSelectedRole(null); }} />
          )}
          {selectedRole === 'CONTRACTOR' && (
            <ContractorDashboard user={user} onLogout={() => { setUser(null); setSelectedRole(null); }} />
          )}
          {selectedRole === 'CITIZEN' && (
            <CitizenDashboard user={user} onLogout={() => { setUser(null); setSelectedRole(null); }} />
          )}
        </div>
      )}
    </div>
  );
}
