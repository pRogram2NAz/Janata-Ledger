'use client';

import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Wallet, FileText, ClipboardList, DollarSign, LogOut, Plus, FileCheck, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
  localUnit: string;
}

interface Props {
  user: User;
  onLogout: () => void;
}

export default function LocalGovernmentDashboard({ user, onLogout }: Props) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dailyPlans, setDailyPlans] = useState<any[]>([]);
  const [workReports, setWorkReports] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [budget, setBudget] = useState({
    allocated: 0,
    spent: 0,
    remaining: 0
  });

  // Contract creation form state
  const [contractForm, setContractForm] = useState({
    title: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    size: 'MEDIUM',
    location: '',
    expectedLifespanYears: '10'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [budgetRes, projectsRes, paymentsRes, plansRes, reportsRes, issuesRes] = await Promise.all([
        fetch('/api/local/budget'),
        fetch('/api/local/projects'),
        fetch('/api/local/payments'),
        fetch('/api/plans'),
        fetch('/api/reports'),
        fetch('/api/local/issues')
      ]);

      const budgetData = await budgetRes.json();
      const projectsData = await projectsRes.json();
      const paymentsData = await paymentsRes.json();
      const plansData = await plansRes.json();
      const reportsData = await reportsRes.json();
      const issuesData = await issuesRes.json();

      setBudget(budgetData);
      setProjects(projectsData.projects || []);
      setPayments(paymentsData.payments || []);
      setDailyPlans(plansData.dailyPlans || []);
      setWorkReports(reportsData.workReports || []);
      setIssues(issuesData.issues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contractForm,
          governmentId: user.id,
          budget: parseFloat(contractForm.budget),
          expectedLifespanYears: parseInt(contractForm.expectedLifespanYears)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Project created successfully!');
        setContractForm({
          title: '',
          description: '',
          budget: '',
          startDate: '',
          endDate: '',
          size: 'MEDIUM',
          location: '',
          expectedLifespanYears: '10'
        });
        await loadDashboardData();
      } else {
        alert(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Create contract error:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Local Government Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.localUnit} • {user.name}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {budget.allocated.toLocaleString()}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allocated</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {budget.spent.toLocaleString()}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paid to contractors</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <FileCheck className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {budget.remaining.toLocaleString()}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
            <TabsTrigger value="projects" className="whitespace-nowrap">Projects</TabsTrigger>
            <TabsTrigger value="create" className="whitespace-nowrap">Create Project</TabsTrigger>
            <TabsTrigger value="payments" className="whitespace-nowrap">Payment Requests</TabsTrigger>
            <TabsTrigger value="plans" className="whitespace-nowrap">Daily Plans</TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap">Work Reports</TabsTrigger>
          </TabsList>

          {/* Create Project */}
          <TabsContent value="create">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Create New Project
                </CardTitle>
                <CardDescription>
                  Create a new infrastructure project for your municipality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateContract} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        value={contractForm.title}
                        onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                        placeholder="e.g., Road Construction Project"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (Rs.) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={contractForm.budget}
                        onChange={(e) => setContractForm({ ...contractForm, budget: e.target.value })}
                        placeholder="1000000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Project Size *</Label>
                      <Select
                        value={contractForm.size}
                        onValueChange={(value) => setContractForm({ ...contractForm, size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SMALL">Small (&lt; Rs. 5M)</SelectItem>
                          <SelectItem value="MEDIUM">Medium (Rs. 5M - 50M)</SelectItem>
                          <SelectItem value="LARGE">Large (&gt; Rs. 50M)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={contractForm.location}
                        onChange={(e) => setContractForm({ ...contractForm, location: e.target.value })}
                        placeholder="e.g., Ward 5, Kathmandu"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={contractForm.startDate}
                        onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Expected End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={contractForm.endDate}
                        onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lifespan">Expected Lifespan (Years)</Label>
                      <Input
                        id="lifespan"
                        type="number"
                        value={contractForm.expectedLifespanYears}
                        onChange={(e) => setContractForm({ ...contractForm, expectedLifespanYears: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      value={contractForm.description}
                      onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                      placeholder="Describe the project in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  All Projects
                </CardTitle>
                <CardDescription>Monitor all projects in your municipality</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No projects yet. Create one in the "Create Project" tab.
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.title}</TableCell>
                            <TableCell>{p.contractor?.name || 'Not assigned'}</TableCell>
                            <TableCell>Rs. {p.budget.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{p.size}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {p.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Plans */}
          <TabsContent value="plans">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Contractor Daily Plans
                </CardTitle>
                <CardDescription>Review daily work plans from contractors</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : dailyPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No daily plans submitted</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Contract</TableHead>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Planned Work</TableHead>
                          <TableHead>Workers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyPlans.map((plan: any) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">
                              {new Date(plan.planDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{plan.contract?.title}</TableCell>
                            <TableCell>{plan.contractor?.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{plan.plannedWork}</TableCell>
                            <TableCell>{plan.workers}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Reports */}
          <TabsContent value="reports">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Work Reports
                </CardTitle>
                <CardDescription>Monitor contractor work progress and reports</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : workReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No work reports submitted</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Contract</TableHead>
                          <TableHead>Contractor</TableHead>
                          <TableHead>Work Summary</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workReports.map((report: any) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">
                              {new Date(report.reportDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{report.contract?.title}</TableCell>
                            <TableCell>{report.contractor?.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{report.workSummary}</TableCell>
                            <TableCell>{report.hoursWorked}</TableCell>
                            <TableCell>{report.progress}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Payment Requests
                </CardTitle>
                <CardDescription>Approve or reject contractor payment requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No pending payment requests</div>
                ) : (
                  payments.map(p => (
                    <div key={p.id} className="flex justify-between items-center border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{p.contract?.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {p.requester?.name} • Rs. {p.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{p.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button size="sm" variant="danger">Reject</Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}