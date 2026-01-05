'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardHat, DollarSign, Clock, FileText, Plus, AlertTriangle, Star, TrendingDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Props {
  user: User;
  onLogout: () => void;
}

export default function ContractorDashboard({ user, onLogout }: Props) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [dailyPlans, setDailyPlans] = useState<any[]>([]);
  const [workReports, setWorkReports] = useState<any[]>([]);
  const [rating, setRating] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  const [paymentForm, setPaymentForm] = useState({ contractId: '', amount: '', reason: '', workPeriod: '', materials: '', materialProof: '' });
  const [planForm, setPlanForm] = useState({ contractId: '', planDate: new Date().toISOString().split('T')[0], plannedWork: '', workers: '', materials: '' });
  const [reportForm, setReportForm] = useState({ contractId: '', reportDate: new Date().toISOString().split('T')[0], workSummary: '', hoursWorked: '', workersUsed: '', progress: '' });

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsRes, paymentsRes, plansRes, reportsRes, ratingRes] = await Promise.all([
        fetch(`/api/contracts?contractorId=${user.id}`),
        fetch(`/api/payments?requesterId=${user.id}`),
        fetch(`/api/plans?contractorId=${user.id}`),
        fetch(`/api/reports?contractorId=${user.id}`),
        fetch(`/api/ai-rating?contractorId=${user.id}`)
      ]);

      const contractsData = await contractsRes.json();
      const paymentsData = await paymentsRes.json();
      const plansData = await plansRes.json();
      const reportsData = await reportsRes.json();
      const ratingData = await ratingRes.json();

      setContracts(contractsData.success ? contractsData.contracts : []);
      setPaymentRequests(paymentsData.success ? paymentsData.paymentRequests : []);
      setDailyPlans(plansData.success ? plansData.dailyPlans : []);
      setWorkReports(reportsData.success ? reportsData.workReports : []);
      if (ratingData.success && ratingData.rating) {
        setRating(ratingData.rating);
        setProgress({
          totalContracts: ratingData.rating.totalContracts,
          activeContracts: ratingData.rating.activeContracts,
          completedContracts: ratingData.rating.completedContracts
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          requesterId: user.id,
          materials: paymentForm.materials ? JSON.stringify([
            { name: 'Cement', quantity: '50', unit: 'bags', pricePerUnit: '850', totalPrice: '42500' },
            { name: 'Sand', quantity: '100', unit: 'm³', pricePerUnit: '80', totalPrice: '8000' },
            { name: 'Gravel', quantity: '200', unit: 'm³', pricePerUnit: '150', totalPrice: '30000' }
          ]) : undefined
        })
      });
      setPaymentForm({ contractId: '', amount: '', reason: '', workPeriod: '', materials: '', materialProof: '' });
      await loadData();
    } catch (error) {
      console.error('Error requesting payment:', error);
    }
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planForm,
          contractorId: user.id,
          materials: planForm.materials ? JSON.stringify([
            { name: 'Cement', quantity: '10', unit: 'bags' },
            { name: 'Sand', quantity: '20', unit: 'm³' },
            { name: 'Gravel', quantity: '40', unit: 'm³' }
          ]) : undefined,
          estimatedCosts: 'Rs. 59500'
        })
      });
      setPlanForm({ contractId: '', planDate: new Date().toISOString().split('T')[0], plannedWork: '', workers: '', materials: '' });
      await loadData();
    } catch (error) {
      console.error('Error submitting plan:', error);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentHour < 17) {
      alert('Work reports can only be submitted after 5 PM.');
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportForm,
          contractorId: user.id,
          photos: '[]'
        })
      });
      setReportForm({ contractId: '', reportDate: new Date().toISOString().split('T')[0], workSummary: '', hoursWorked: '', workersUsed: '', progress: '' });
      await loadData();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contractor Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user.name}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24">
        {/* Rating Warning */}
        {rating && rating.overallRating < 3.8 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">Rating Below Minimum Threshold (3.8)</p>
                <p className="text-sm">
                  Your current rating is <strong>{rating.overallRating.toFixed(2)}/5.0</strong>. You can only work on small contracts to build your rating up to 4.0.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rating System Info */}
        {rating && (
          <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-semibold text-teal-800 dark:text-teal-200">Your AI Rating</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Overall Rating</p>
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{rating.overallRating.toFixed(2)}/5.0</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Points Gained</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{rating.pointsGained.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Points Lost</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{rating.pointsLost.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Smart Rating Rules:</strong></p>
              <ul className="mt-2 space-y-1">
                <li>• Positive ratings: Only gain <strong>50%</strong> of increase (harder to gain)</li>
                <li>• Negative ratings: Lose <strong>100%</strong> of decrease (easier to lose)</li>
                <li>• Natural disasters can be <strong>forgiven</strong> (no rating impact)</li>
                <li>• Contractor faults: Full penalty applies</li>
              </ul>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Contracts</CardTitle>
              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress?.totalContracts || 0}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Active: {progress?.activeContracts || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentRequests.filter((p: any) => p.status === 'PENDING').length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total: {paymentRequests.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Work Reports</CardTitle>
              <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workReports.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily Plans</CardTitle>
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailyPlans.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Submitted this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="contracts">My Contracts</TabsTrigger>
            <TabsTrigger value="plans">Daily Plans</TabsTrigger>
            <TabsTrigger value="reports">Work Reports</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Dialog>
  <DialogTrigger asChild>
    <Button 
      className="bg-teal-600 hover:bg-teal-700"
      disabled={contracts.length === 0}
    >
      <Plus className="h-4 w-4 mr-2" />
      Request Payment
      {contracts.length === 0 && ' (No Contracts)'}
    </Button>
  </DialogTrigger>
  <DialogContent className="max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Request Payment</DialogTitle>
      <DialogDescription>Submit a payment request for completed work</DialogDescription>
    </DialogHeader>
    
    {loading ? (
      <div className="py-8 text-center text-gray-500">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        Loading contracts...
      </div>
    ) : contracts.length === 0 ? (
      <div className="py-8 text-center">
        <p className="text-gray-500 mb-2">No contracts available</p>
        <p className="text-sm text-amber-600">
          You need to have at least one assigned contract to request payment.
        </p>
      </div>
    ) : (
      <form onSubmit={handleSubmitPayment} className="space-y-4">
        <div className="space-y-2">
          <Label>Contract *</Label>
          <Select 
            value={paymentForm.contractId} 
            onValueChange={(value) => setPaymentForm({ ...paymentForm, contractId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select contract" />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract: any) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.title} - {contract.location || 'No location'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Amount (Rs.) *</Label>
          <Input
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            placeholder="Enter amount"
            required
            min="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Work Period *</Label>
          <Input
            value={paymentForm.workPeriod}
            onChange={(e) => setPaymentForm({ ...paymentForm, workPeriod: e.target.value })}
            placeholder="e.g., Jan 1-15, 2025"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Reason *</Label>
          <Textarea
            value={paymentForm.reason}
            onChange={(e) => setPaymentForm({ ...paymentForm, reason: e.target.value })}
            placeholder="Describe the reason for this payment request..."
            required
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Material Details (Optional)</Label>
          <Textarea
            value={paymentForm.materials}
            onChange={(e) => setPaymentForm({ ...paymentForm, materials: e.target.value })}
            placeholder="List materials used..."
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Receipt/Proof URL (Optional)</Label>
          <Input
            type="url"
            value={paymentForm.materialProof}
            onChange={(e) => setPaymentForm({ ...paymentForm, materialProof: e.target.value })}
            placeholder="https://..."
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={!paymentForm.contractId || !paymentForm.amount || !paymentForm.reason}
        >
          Submit Payment Request
        </Button>
      </form>
    )}
  </DialogContent>
</Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Requests</CardTitle>
                  <CardDescription>Track status of your payment requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : paymentRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No payment requests found</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Contract</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Work Period</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentRequests.map((payment: any) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-medium">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{payment.contract.title}</TableCell>
                              <TableCell className="font-semibold">Rs. {payment.amount.toLocaleString()}</TableCell>
                              <TableCell>{payment.workPeriod || '-'}</TableCell>
                              <TableCell className="max-w-xs truncate">{payment.reason}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    payment.status === 'PAID' ? 'default' :
                                    payment.status === 'APPROVED' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {payment.status}
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
            </div>
          </TabsContent>

          {/* My Contracts Tab */}
          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle>My Contracts</CardTitle>
                <CardDescription>View and manage your assigned contracts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : contracts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No contracts assigned to you yet</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contracts.map((contract: any) => (
                          <TableRow key={contract.id}>
                            <TableCell className="font-medium">{contract.title}</TableCell>
                            <TableCell>Rs. {contract.budget.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{contract.size}</Badge>
                            </TableCell>
                            <TableCell>{contract.location || '-'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  contract.status === 'COMPLETED' ? 'default' :
                                  contract.status === 'IN_PROGRESS' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {contract.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Progress value={contract.status === 'COMPLETED' ? 100 : contract.status === 'IN_PROGRESS' ? 50 : 10} className="w-20" />
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

          {/* Daily Plans Tab */}
          <TabsContent value="plans">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Daily Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Daily Plan</DialogTitle>
                      <DialogDescription>Create a work plan for today (before 5 PM)</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPlan} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Contract</Label>
                        <Select value={planForm.contractId} onValueChange={(value) => setPlanForm({ ...planForm, contractId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract" />
                          </SelectTrigger>
                          <SelectContent>
                            {contracts.map((contract: any) => (
                              <SelectItem key={contract.id} value={contract.id}>{contract.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={planForm.planDate}
                          onChange={(e) => setPlanForm({ ...planForm, planDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Planned Work</Label>
                        <Textarea
                          value={planForm.plannedWork}
                          onChange={(e) => setPlanForm({ ...planForm, plannedWork: e.target.value })}
                          placeholder="Describe today's planned work..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Number of Workers</Label>
                        <Input
                          type="number"
                          value={planForm.workers}
                          onChange={(e) => setPlanForm({ ...planForm, workers: e.target.value })}
                          placeholder="Number of workers"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Materials (Optional)</Label>
                        <Input
                          value={planForm.materials}
                          onChange={(e) => setPlanForm({ ...planForm, materials: e.target.value })}
                          placeholder='JSON: [{"name": "Cement", "quantity": 10, "unit": "bags"}]'
                        />
                        <p className="text-xs text-gray-500">JSON format for materials to be used (for transparency)</p>
                      </div>
                      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Submit Daily Plan</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Work Plans</CardTitle>
                  <CardDescription>View your submitted daily work plans</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : dailyPlans.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No daily plans found</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Contract</TableHead>
                            <TableHead>Planned Work</TableHead>
                            <TableHead>Workers</TableHead>
                            <TableHead>Report Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyPlans.map((plan: any) => (
                            <TableRow key={plan.id}>
                              <TableCell className="font-medium">
                                {new Date(plan.planDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{plan.contract.title}</TableCell>
                              <TableCell className="max-w-xs truncate">{plan.plannedWork}</TableCell>
                              <TableCell>{plan.workers}</TableCell>
                              <TableCell>
                                <Badge variant={plan.workReports.length > 0 ? 'default' : 'outline'}>
                                  {plan.workReports.length > 0 ? 'Submitted' : 'Pending'}
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
            </div>
          </TabsContent>

          {/* Work Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700" disabled={currentHour < 17}>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Work Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Work Report</DialogTitle>
                      <DialogDescription>Report work completed today (after 5 PM only)</DialogDescription>
                    </DialogHeader>
                    {currentHour < 17 ? (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                          <strong>Reports can only be submitted after 5 PM.</strong> Current time: {currentTime.toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReport} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Contract</Label>
                          <Select value={reportForm.contractId} onValueChange={(value) => setReportForm({ ...reportForm, contractId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract" />
                            </SelectTrigger>
                            <SelectContent>
                              {contracts.map((contract: any) => (
                                <SelectItem key={contract.id} value={contract.id}>{contract.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={reportForm.reportDate}
                            onChange={(e) => setReportForm({ ...reportForm, reportDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Work Summary</Label>
                          <Textarea
                            value={reportForm.workSummary}
                            onChange={(e) => setReportForm({ ...reportForm, workSummary: e.target.value })}
                            placeholder="Describe work completed..."
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Hours Worked</Label>
                            <Input
                              type="number"
                              value={reportForm.hoursWorked}
                              onChange={(e) => setReportForm({ ...reportForm, hoursWorked: e.target.value })}
                              placeholder="Hours"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Workers Used</Label>
                            <Input
                              type="number"
                              value={reportForm.workersUsed}
                              onChange={(e) => setReportForm({ ...reportForm, workersUsed: e.target.value })}
                              placeholder="Number"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Progress (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={reportForm.progress}
                            onChange={(e) => setReportForm({ ...reportForm, progress: e.target.value })}
                            placeholder="0-100"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Submit Work Report</Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Work Reports</CardTitle>
                  <CardDescription>View all work reports you have submitted</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : workReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No work reports found</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Contract</TableHead>
                            <TableHead>Work Summary</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Workers</TableHead>
                            <TableHead>Progress</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workReports.map((report: any) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">
                                {new Date(report.reportDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{report.contract.title}</TableCell>
                              <TableCell className="max-w-xs truncate">{report.workSummary}</TableCell>
                              <TableCell>{report.hoursWorked}</TableCell>
                              <TableCell>{report.workersUsed}</TableCell>
                              <TableCell>
                                <Progress value={report.progress} className="w-20" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © 2025 Payment Delay Tracker. Contractor Dashboard.
          </div>
        </div>
      </footer>
    </div>
  );
}
