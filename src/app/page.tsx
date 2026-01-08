'use client';

import { useState } from 'react';
import { Building2, HardHat, Users, Landmark, Wallet, Building, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import LocalGovernmentDashboard from '@/components/dashboards/local-government-dashboard';
import ContractorDashboard from '@/components/dashboards/contractor-dashboard';
import CitizenDashboard from '@/components/dashboards/citizen-dashboard';
import CentralGovernmentDashboard from '@/components/dashboards/central-government-dashboard';

// All available roles
type UserRole = 
  | 'LOCAL_GOVERNMENT' 
  | 'CONTRACTOR' 
  | 'CITIZEN' 
  | 'CENTRAL_GOV_PM' 
  | 'CENTRAL_GOV_FINANCE' 
  | 'CENTRAL_GOV_INFRASTRUCTURE'
  | 'PROVINCIAL_GOVERNMENT';

// Role categories for grouping
type RoleCategory = 'CENTRAL' | 'PROVINCIAL' | 'LOCAL' | 'CONTRACTOR' | 'CITIZEN';

interface RoleOption {
  value: UserRole;
  label: string;
  category: RoleCategory;
  ministry?: string;
}

const roleOptions: RoleOption[] = [
  { value: 'CENTRAL_GOV_PM', label: 'Prime Minister Office', category: 'CENTRAL', ministry: 'Prime Minister Office' },
  { value: 'CENTRAL_GOV_FINANCE', label: 'Ministry of Finance', category: 'CENTRAL', ministry: 'Ministry of Finance' },
  { value: 'CENTRAL_GOV_INFRASTRUCTURE', label: 'Ministry of Infrastructure', category: 'CENTRAL', ministry: 'Ministry of Infrastructure Development' },
  { value: 'PROVINCIAL_GOVERNMENT', label: 'Provincial Government', category: 'PROVINCIAL' },
  { value: 'LOCAL_GOVERNMENT', label: 'Local Government', category: 'LOCAL' },
  { value: 'CONTRACTOR', label: 'Contractor', category: 'CONTRACTOR' },
  { value: 'CITIZEN', label: 'Citizen', category: 'CITIZEN' },
];

const provinces = [
  { id: 'koshi', name: 'Koshi Province', code: 'P1' },
  { id: 'madhesh', name: 'Madhesh Province', code: 'P2' },
  { id: 'bagmati', name: 'Bagmati Province', code: 'P3' },
  { id: 'gandaki', name: 'Gandaki Province', code: 'P4' },
  { id: 'lumbini', name: 'Lumbini Province', code: 'P5' },
  { id: 'karnali', name: 'Karnali Province', code: 'P6' },
  { id: 'sudurpashchim', name: 'Sudurpashchim Province', code: 'P7' },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedLocalUnit, setSelectedLocalUnit] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategorySelect = (category: RoleCategory) => {
    setSelectedCategory(category);
    // Auto-select role if only one option in category
    const rolesInCategory = roleOptions.filter(r => r.category === category);
    if (rolesInCategory.length === 1) {
      setSelectedRole(rolesInCategory[0].value);
    } else {
      setSelectedRole(null);
    }
  };

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
      // Show success message
      if (result.message === 'Login successful') {
        // Optional: show a toast notification
        console.log('Welcome back!');
      } else {
        console.log('Account created successfully!');
      }
    } else {
      alert(result.error || 'Failed to login');
    }
  } catch (error) {
    alert('Failed to login. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    setSelectedCategory(null);
    setSelectedProvince('');
    setSelectedLocalUnit('');
  };

  const isCentralGovRole = (role: UserRole | null): boolean => {
    return role === 'CENTRAL_GOV_PM' || role === 'CENTRAL_GOV_FINANCE' || role === 'CENTRAL_GOV_INFRASTRUCTURE';
  };

  const getCentralGovRoleType = (role: UserRole): 'PM' | 'FINANCE_MINISTRY' | 'INFRASTRUCTURE_MINISTRY' => {
    switch (role) {
      case 'CENTRAL_GOV_PM': return 'PM';
      case 'CENTRAL_GOV_FINANCE': return 'FINANCE_MINISTRY';
      case 'CENTRAL_GOV_INFRASTRUCTURE': return 'INFRASTRUCTURE_MINISTRY';
      default: return 'PM';
    }
  };

  // Render dashboard based on role
  const renderDashboard = () => {
    if (!user || !selectedRole) return null;

    if (isCentralGovRole(selectedRole)) {
      return (
        <CentralGovernmentDashboard 
          user={{
            ...user,
            role: getCentralGovRoleType(selectedRole)
          }} 
          onLogout={handleLogout} 
        />
      );
    }

    switch (selectedRole) {
      case 'LOCAL_GOVERNMENT':
        return <LocalGovernmentDashboard user={user} onLogout={handleLogout} />;
      case 'CONTRACTOR':
        return <ContractorDashboard user={user} onLogout={handleLogout} />;
      case 'CITIZEN':
        return <CitizenDashboard user={user} onLogout={handleLogout} />;
      case 'PROVINCIAL_GOVERNMENT':
        // For now, use Local Government Dashboard with provincial context
        // You can create a separate ProvincialGovernmentDashboard later
        return <LocalGovernmentDashboard user={{...user, isProvincial: true}} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {!user ? (
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                <Landmark className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Civic Track Platform
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A comprehensive system for tracking government projects, payments, and ensuring 
              transparency from Central Government to Local Units.
            </p>
          </div>

          {/* Role Category Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 max-w-5xl mx-auto">
            {/* Central Government */}
            <Card 
              className={`border-2 cursor-pointer transition-all ${
                selectedCategory === 'CENTRAL' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-purple-200 hover:border-purple-400'
              }`}
              onClick={() => handleCategorySelect('CENTRAL')}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    selectedCategory === 'CENTRAL' ? 'bg-purple-500' : 'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    <Landmark className={`h-6 w-6 ${
                      selectedCategory === 'CENTRAL' ? 'text-white' : 'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Central Government</h3>
                <p className="text-xs text-gray-500 mt-1">PM & Ministries</p>
              </CardContent>
            </Card>

            {/* Provincial Government */}
            <Card 
              className={`border-2 cursor-pointer transition-all ${
                selectedCategory === 'PROVINCIAL' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-indigo-200 hover:border-indigo-400'
              }`}
              onClick={() => handleCategorySelect('PROVINCIAL')}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    selectedCategory === 'PROVINCIAL' ? 'bg-indigo-500' : 'bg-indigo-100 dark:bg-indigo-900'
                  }`}>
                    <MapPin className={`h-6 w-6 ${
                      selectedCategory === 'PROVINCIAL' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                    }`} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Provincial Government</h3>
                <p className="text-xs text-gray-500 mt-1">7 Provinces</p>
              </CardContent>
            </Card>

            {/* Local Government */}
            <Card 
              className={`border-2 cursor-pointer transition-all ${
                selectedCategory === 'LOCAL' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'border-emerald-200 hover:border-emerald-400'
              }`}
              onClick={() => handleCategorySelect('LOCAL')}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    selectedCategory === 'LOCAL' ? 'bg-emerald-500' : 'bg-emerald-100 dark:bg-emerald-900'
                  }`}>
                    <Building2 className={`h-6 w-6 ${
                      selectedCategory === 'LOCAL' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                    }`} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Local Government</h3>
                <p className="text-xs text-gray-500 mt-1">Municipalities</p>
              </CardContent>
            </Card>

            {/* Contractor */}
            <Card 
              className={`border-2 cursor-pointer transition-all ${
                selectedCategory === 'CONTRACTOR' 
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                  : 'border-teal-200 hover:border-teal-400'
              }`}
              onClick={() => handleCategorySelect('CONTRACTOR')}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    selectedCategory === 'CONTRACTOR' ? 'bg-teal-500' : 'bg-teal-100 dark:bg-teal-900'
                  }`}>
                    <HardHat className={`h-6 w-6 ${
                      selectedCategory === 'CONTRACTOR' ? 'text-white' : 'text-teal-600 dark:text-teal-400'
                    }`} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Contractor</h3>
                <p className="text-xs text-gray-500 mt-1">Construction</p>
              </CardContent>
            </Card>

            {/* Citizen */}
            <Card 
              className={`border-2 cursor-pointer transition-all ${
                selectedCategory === 'CITIZEN' 
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                  : 'border-cyan-200 hover:border-cyan-400'
              }`}
              onClick={() => handleCategorySelect('CITIZEN')}
            >
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    selectedCategory === 'CITIZEN' ? 'bg-cyan-500' : 'bg-cyan-100 dark:bg-cyan-900'
                  }`}>
                    <Users className={`h-6 w-6 ${
                      selectedCategory === 'CITIZEN' ? 'text-white' : 'text-cyan-600 dark:text-cyan-400'
                    }`} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm">Citizen</h3>
                <p className="text-xs text-gray-500 mt-1">Public Access</p>
              </CardContent>
            </Card>
          </div>

          {/* Role Details & Login Form */}
          {selectedCategory && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    {selectedCategory === 'CENTRAL' && <Landmark className="h-5 w-5 text-purple-600" />}
                    {selectedCategory === 'PROVINCIAL' && <MapPin className="h-5 w-5 text-indigo-600" />}
                    {selectedCategory === 'LOCAL' && <Building2 className="h-5 w-5 text-emerald-600" />}
                    {selectedCategory === 'CONTRACTOR' && <HardHat className="h-5 w-5 text-teal-600" />}
                    {selectedCategory === 'CITIZEN' && <Users className="h-5 w-5 text-cyan-600" />}
                    
                    {selectedCategory === 'CENTRAL' && 'Central Government Login'}
                    {selectedCategory === 'PROVINCIAL' && 'Provincial Government Login'}
                    {selectedCategory === 'LOCAL' && 'Local Government Login'}
                    {selectedCategory === 'CONTRACTOR' && 'Contractor Login'}
                    {selectedCategory === 'CITIZEN' && 'Citizen Login'}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {selectedCategory === 'CENTRAL' && 'Access the national dashboard for policy decisions and budget allocation'}
                    {selectedCategory === 'PROVINCIAL' && 'Manage provincial projects and monitor local unit performance'}
                    {selectedCategory === 'LOCAL' && 'Manage contracts, approve payments, and monitor work progress'}
                    {selectedCategory === 'CONTRACTOR' && 'Submit work plans, report progress, and request payments'}
                    {selectedCategory === 'CITIZEN' && 'Monitor government spending and project progress in your area'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedRole) {
                      alert('Please select a role');
                      return;
                    }
                    const formData = new FormData(e.currentTarget);
                    handleLogin(selectedRole, {
                      email: formData.get('email') as string,
                      name: formData.get('name') as string,
                      role: selectedRole,
                      nidNumber: selectedCategory === 'CITIZEN' ? formData.get('nidNumber') as string : undefined,
                      company: selectedCategory === 'CONTRACTOR' ? formData.get('company') as string : undefined,
                      designation: formData.get('designation') as string || undefined,
                    });
                  }} className="space-y-4">
                    
                    {/* Central Government Role Selection */}
                    {selectedCategory === 'CENTRAL' && (
                      <div className="space-y-2">
                        <Label>Select Ministry/Office</Label>
                        <div className="grid grid-cols-1 gap-2">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                              selectedRole === 'CENTRAL_GOV_PM' 
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                : 'hover:border-purple-300'
                            }`}
                            onClick={() => setSelectedRole('CENTRAL_GOV_PM')}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                              <Landmark className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Prime Minister Office</p>
                              <p className="text-xs text-gray-500">National oversight, policy approval</p>
                            </div>
                            {selectedRole === 'CENTRAL_GOV_PM' && (
                              <Badge className="ml-auto bg-purple-600">Selected</Badge>
                            )}
                          </div>
                          
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                              selectedRole === 'CENTRAL_GOV_FINANCE' 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'hover:border-green-300'
                            }`}
                            onClick={() => setSelectedRole('CENTRAL_GOV_FINANCE')}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                              <Wallet className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Ministry of Finance</p>
                              <p className="text-xs text-gray-500">Budget allocation, payment approval</p>
                            </div>
                            {selectedRole === 'CENTRAL_GOV_FINANCE' && (
                              <Badge className="ml-auto bg-green-600">Selected</Badge>
                            )}
                          </div>
                          
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                              selectedRole === 'CENTRAL_GOV_INFRASTRUCTURE' 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'hover:border-blue-300'
                            }`}
                            onClick={() => setSelectedRole('CENTRAL_GOV_INFRASTRUCTURE')}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Building className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Ministry of Infrastructure Development</p>
                              <p className="text-xs text-gray-500">Project monitoring, quality control</p>
                            </div>
                            {selectedRole === 'CENTRAL_GOV_INFRASTRUCTURE' && (
                              <Badge className="ml-auto bg-blue-600">Selected</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Provincial Government - Province Selection */}
                    {selectedCategory === 'PROVINCIAL' && (
                      <div className="space-y-2">
                        <Label>Select Province</Label>
                        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province.id} value={province.id}>
                                {province.name} ({province.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Local Government - Province & Local Unit Selection */}
                    {selectedCategory === 'LOCAL' && (
                      <>
                        <div className="space-y-2">
                          <Label>Select Province</Label>
                          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent>
                              {provinces.map((province) => (
                                <SelectItem key={province.id} value={province.id}>
                                  {province.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Local Unit Name</Label>
                          <Input
                            name="localUnit"
                            type="text"
                            placeholder="e.g., Kathmandu Metropolitan City"
                            value={selectedLocalUnit}
                            onChange={(e) => setSelectedLocalUnit(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {/* Contractor - Company Info */}
                    {selectedCategory === 'CONTRACTOR' && (
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          placeholder="Your construction company name"
                          required
                        />
                      </div>
                    )}

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Designation for Government Officials */}
                    {(selectedCategory === 'CENTRAL' || selectedCategory === 'PROVINCIAL' || selectedCategory === 'LOCAL') && (
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                          id="designation"
                          name="designation"
                          type="text"
                          placeholder="e.g., Secretary, Director, Officer"
                        />
                      </div>
                    )}

                    {/* Citizen NID */}
                    {selectedCategory === 'CITIZEN' && (
                      <div className="space-y-2">
                        <Label htmlFor="nidNumber">Citizenship/NID Number</Label>
                        <Input
                          id="nidNumber"
                          name="nidNumber"
                          type="text"
                          placeholder="Format: District-Ward-Number (e.g., 12-34-56789)"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Format: District-Ward-Number (e.g., 12-34-56789)
                        </p>
                      </div>
                    )}

                   <Button
                    type="submit"
                    className={`w-full ${
                    selectedCategory === 'CENTRAL' ? 'bg-purple-600 hover:bg-purple-700' :
                    selectedCategory === 'PROVINCIAL' ? 'bg-indigo-600 hover:bg-indigo-700' :
                     selectedCategory === 'LOCAL' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    selectedCategory === 'CONTRACTOR' ? 'bg-teal-600 hover:bg-teal-700' :
                  'bg-cyan-600 hover:bg-cyan-700'
                  }`}
                   disabled={isLoading || (selectedCategory === 'CENTRAL' && !selectedRole)}
                    >
                  {isLoading ? 'Processing...' : 'Login / Register'}
                </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedRole(null);
                      }}
                    >
                      Back to Role Selection
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Section - Show when no category selected */}
          {!selectedCategory && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-6xl mx-auto">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                      <Landmark className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Centralized Oversight</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      PM and ministries can monitor all projects and allocate budgets nationwide
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 mb-4">
                      <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Multi-Level Governance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Seamless coordination between central, provincial, and local governments
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
                      <HardHat className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h4 className="font-semibold mb-2">AI-Powered Ratings</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Contractor ratings based on comprehensive AI analysis of performance
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900 mb-4">
                      <Users className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Citizen Transparency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Citizens can verify and access all public project information
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Government Structure Overview */}
              <div className="mt-16 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-8">Nepal's Government Structure</h3>
                <div className="relative">
                  {/* Central Level */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-4 text-center w-64">
                      <Landmark className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold">Central Government</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">PM, Finance, Infrastructure</p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                  </div>
                  
                  {/* Provincial Level */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-4 text-center w-64">
                      <MapPin className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <h4 className="font-semibold">7 Provinces</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Provincial governments</p>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                  </div>
                  
                  {/* Local Level */}
                  <div className="flex justify-center">
                    <div className="bg-emerald-100 dark:bg-emerald-900 rounded-lg p-4 text-center w-64">
                      <Building2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <h4 className="font-semibold">753 Local Units</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Municipalities & Rural Municipalities</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <footer className="border-t bg-white/50 dark:bg-gray-900/50 mt-16">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold">Civic Track Platform</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  © 2025 Built for Nepal's Federal Government Structure
                </div>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <div className="min-h-screen">
          {renderDashboard()}
        </div>
      )}
    </div>
  );
}