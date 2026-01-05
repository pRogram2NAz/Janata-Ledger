'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, FileText, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  nidNumber?: string;
}

interface Props {
  user: User;
  onLogout: () => void;
}

export default function CitizenDashboard({ user, onLogout }: Props) {
  const [isVerified, setIsVerified] = useState(false);
  const [workReports, setWorkReports] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dailyPlans, setDailyPlans] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nidInput, setNidInput] = useState('');

  const [ratingForm, setRatingForm] = useState({
    contractId: '',
    contractorId: '',
    rating: '',
    comment: '',
    qualityRating: '',
    durabilityRating: '',
    timelinessRating: '',
    proofUrl: '',
    proofDescription: ''
  });

  const [issueForm, setIssueForm] = useState({
    contractId: '',
    contractorId: '',
    title: '',
    description: '',
    category: 'CONTRACTOR_FAULT' as 'NATURAL_DISASTER' | 'CONTRACTOR_FAULT',
    issueDate: '',
    issueType: '',
    severity: '',
    location: ''
  });

  useEffect(() => {
    if (user.nidNumber) {
      setIsVerified(true);
      loadPublicData();
    }
  }, [user.id]);

  const handleVerifyNid = async () => {
    if (!nidInput) {
      alert('Please enter your NID/Citizenship number');
      return;
    }

    const nidRegex = /^\d{1,2}-\d{1,2}-\d{5}$/;
    if (!nidRegex.test(nidInput)) {
      alert('Invalid NID format. Format: District-Ward-Number (e.g., 12-34-56789)');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, nidNumber: nidInput })
      });

      const result = await response.json();
      if (result.success) {
        user.nidNumber = nidInput;
        setIsVerified(true);
        await loadPublicData();
      } else {
        alert(result.error || 'Failed to verify NID');
      }
    } catch (error) {
      console.error('NID verification error:', error);
      alert('Failed to verify NID. Please try again.');
    }
  };

  const loadPublicData = async () => {
    setLoading(true);
    try {
      const [reportsRes, paymentsRes, plansRes, contractorsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/payments'),
        fetch('/api/plans'),
        fetch('/api/users?role=CONTRACTOR')
      ]);

      const reportsData = await reportsRes.json();
      const paymentsData = await paymentsRes.json();
      const plansData = await plansRes.json();
      const contractorsData = await contractorsRes.json();

      setWorkReports(reportsData.success ? reportsData.workReports : []);
      setPayments(paymentsData.success ? paymentsData.paymentRequests : []);
      setDailyPlans(plansData.success ? plansData.dailyPlans : []);
      setContractors(contractorsData.success ? contractorsData.users : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    const ratingValue = parseFloat(ratingForm.rating);

    if (ratingValue < 3.0 && !ratingForm.proofUrl) {
      alert('Proof is required for negative ratings (< 3.0)');
      return;
    }

    try {
      const response = await fetch('/api/citizen-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ratingForm,
          citizenId: user.id,
          rating: ratingValue
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Rating submitted successfully!');
        setRatingForm({
          contractId: '',
          contractorId: '',
          rating: '',
          comment: '',
          qualityRating: '',
          durabilityRating: '',
          timelinessRating: '',
          proofUrl: '',
          proofDescription: ''
        });
        await loadPublicData();
      } else {
        alert(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/issue-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...issueForm,
          citizenId: user.id
        })
      });

      const result = await response.json();
      if (result.success) {
        const message = issueForm.category === 'NATURAL_DISASTER'
          ? 'Issue report submitted. Will be reviewed for forgiveness eligibility.'
          : 'Issue report submitted. Contractor rating updated.';
        alert(message);
        setIssueForm({
          contractId: '',
          contractorId: '',
          title: '',
          description: '',
          category: 'CONTRACTOR_FAULT',
          issueDate: '',
          issueType: '',
          severity: '',
          location: ''
        });
      } else {
        alert(result.error || 'Failed to submit issue report');
      }
    } catch (error) {
      alert('Failed to submit issue report. Please try again.');
    }
  };

  const stats = {
    totalPaid: payments.filter((p: any) => p.status === 'PAID').reduce((sum: number, p: any) => sum + p.amount, 0),
    totalReports: workReports.length,
    totalPlans: dailyPlans.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {!isVerified ? (
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-cyan-600" />
                Verify Your Identity
              </CardTitle>
              <CardDescription>
                Enter your National ID/Citizenship number to access government project data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nidNumber">National ID / Citizenship Number</Label>
                <Input
                  id="nidNumber"
                  value={nidInput}
                  onChange={(e) => setNidInput(e.target.value)}
                  placeholder="Format: District-Ward-Number (e.g., 12-34-56789)"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example: 12-34-56789 (District:12, Ward:34, Number:56789)
                </p>
              </div>
              <Button
                onClick={handleVerifyNid}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verify and Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Citizen Dashboard</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user.name}</p>
                  </div>
                </div>
                <Button onClick={onLogout} variant="outline">Logout</Button>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 pb-24">
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-emerald-800 dark:text-emerald-200">
                  <strong>NID Verified: {user.nidNumber}</strong>
                </p>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                You have full access to transparent government project data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {stats.totalPaid.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">By government</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <Clock className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payments.filter((p: any) => p.status === 'PENDING').length}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Work Reports</CardTitle>
                  <FileText className="h-4 w-4 text-cyan-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReports}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">From contractors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Daily Plans</CardTitle>
                  <FileText className="h-4 w-4 text-cyan-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPlans}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contractor plans</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="reports" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto">
                <TabsTrigger value="reports">Work Reports</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="plans">Daily Plans</TabsTrigger>
                <TabsTrigger value="contractors">Contractors</TabsTrigger>
                <TabsTrigger value="actions">Rate & Report</TabsTrigger>
              </TabsList>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Contractor Work Reports</CardTitle>
                    <CardDescription>View all work reports submitted by contractors</CardDescription>
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

              <TabsContent value="payments">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Transactions</CardTitle>
                      <CardDescription>Track government payments made to contractors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                      ) : payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No payments found</div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Contract</TableHead>
                                <TableHead>Contractor</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Work Period</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map((payment: any) => (
                                <TableRow key={payment.id}>
                                  <TableCell className="font-medium">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>{payment.contract?.title}</TableCell>
                                  <TableCell>{payment.requester?.name}</TableCell>
                                  <TableCell className="font-semibold">
                                    Rs. {payment.amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell>{payment.workPeriod || '-'}</TableCell>
                                  <TableCell className="max-w-xs truncate">{payment.reason}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        payment.status === 'PAID' ? 'default' :
                                        payment.status === 'APPROVED' ? 'secondary' :
                                        payment.status === 'PENDING' ? 'outline' :
                                        'destructive'
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

              <TabsContent value="plans">
                <Card>
                  <CardHeader>
                    <CardTitle>Contractor Daily Plans</CardTitle>
                    <CardDescription>Access daily work plans submitted by contractors</CardDescription>
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
                              <TableHead>Contractor</TableHead>
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
                                <TableCell>{plan.contract?.title}</TableCell>
                                <TableCell>{plan.contractor?.name}</TableCell>
                                <TableCell className="max-w-xs truncate">{plan.plannedWork}</TableCell>
                                <TableCell>{plan.workers}</TableCell>
                                <TableCell>
                                  <Badge variant={plan.workReports?.length > 0 ? 'default' : 'outline'}>
                                    {plan.workReports?.length > 0 ? 'Submitted' : 'Pending'}
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

              <TabsContent value="contractors">
                <Card>
                  <CardHeader>
                    <CardTitle>Contractors List</CardTitle>
                    <CardDescription>View all registered contractors and their ratings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : contractors.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No contractors found</div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contractors.map((contractor: any) => (
                              <TableRow key={contractor.id}>
                                <TableCell className="font-medium">{contractor.name}</TableCell>
                                <TableCell>{contractor.email}</TableCell>
                                <TableCell>
                                  {contractor.contractorRating ? (
                                    <Badge
                                      variant={
                                        contractor.contractorRating.overallRating >= 4.0 ? 'default' :
                                        contractor.contractorRating.overallRating >= 3.8 ? 'secondary' :
                                        'outline'
                                      }
                                    >
                                      {contractor.contractorRating.overallRating.toFixed(2)}/5.0
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">No rating</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {contractor.contractorProgress ? (
                                    <Badge variant={contractor.contractorProgress.isSuspended ? 'destructive' : 'default'}>
                                      {contractor.contractorProgress.isSuspended ? 'Suspended' : 'Active'}
                                    </Badge>
                                  ) : (
                                    <Badge variant="default">Active</Badge>
                                  )}
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

              <TabsContent value="actions">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rate Contractor</CardTitle>
                      <CardDescription>Rate contractor work quality. For negative ratings, proof is required.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitRating} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Contract</Label>
                            <Select
                              value={ratingForm.contractId}
                              onValueChange={(value) => {
                                const selectedPlan = dailyPlans.find((p: any) => p.contract?.id === value);
                                setRatingForm({ 
                                  ...ratingForm, 
                                  contractId: value,
                                  contractorId: selectedPlan?.contractor?.id || ''
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select contract" />
                              </SelectTrigger>
                              <SelectContent>
                                {dailyPlans.map((plan: any) => (
                                  <SelectItem key={plan.contract?.id} value={plan.contract?.id}>
                                    {plan.contract?.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Rating (1-5)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={ratingForm.rating}
                              onChange={(e) => setRatingForm({ ...ratingForm, rating: e.target.value })}
                              placeholder="5.0"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Comment (Optional)</Label>
                          <Textarea
                            value={ratingForm.comment}
                            onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                            placeholder="Share your thoughts..."
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Quality</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={ratingForm.qualityRating}
                              onChange={(e) => setRatingForm({ ...ratingForm, qualityRating: e.target.value })}
                              placeholder="5.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Durability</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={ratingForm.durabilityRating}
                              onChange={(e) => setRatingForm({ ...ratingForm, durabilityRating: e.target.value })}
                              placeholder="5.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Timeliness</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={ratingForm.timelinessRating}
                              onChange={(e) => setRatingForm({ ...ratingForm, timelinessRating: e.target.value })}
                              placeholder="5.0"
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            <strong>Note:</strong> For negative ratings (below 3.0), you must provide photo/video evidence and explain why the rating is low.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Proof URL (Required for ratings below 3.0)</Label>
                          <Input
                            value={ratingForm.proofUrl}
                            onChange={(e) => setRatingForm({ ...ratingForm, proofUrl: e.target.value })}
                            placeholder="https://... (for ratings < 3.0)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Proof Description</Label>
                          <Textarea
                            value={ratingForm.proofDescription}
                            onChange={(e) => setRatingForm({ ...ratingForm, proofDescription: e.target.value })}
                            placeholder="Describe the proof..."
                          />
                        </div>
                        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                          Submit Rating
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Report Issue</CardTitle>
                      <CardDescription>Report work issues. Natural disasters can be forgiven. Contractor faults will affect rating.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitIssue} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Contract</Label>
                          <Select
                            value={issueForm.contractId}
                            onValueChange={(value) => {
                              const selectedPlan = dailyPlans.find((p: any) => p.contract?.id === value);
                              setIssueForm({ 
                                ...issueForm, 
                                contractId: value,
                                contractorId: selectedPlan?.contractor?.id || ''
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract" />
                            </SelectTrigger>
                            <SelectContent>
                              {dailyPlans.map((plan: any) => (
                                <SelectItem key={plan.contract?.id} value={plan.contract?.id}>
                                  {plan.contract?.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Issue Title</Label>
                          <Input
                            value={issueForm.title}
                            onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                            placeholder="e.g., Road cracks appeared"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={issueForm.category}
                              onValueChange={(value) => setIssueForm({ ...issueForm, category: value as 'NATURAL_DISASTER' | 'CONTRACTOR_FAULT' })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NATURAL_DISASTER">Natural Disaster</SelectItem>
                                <SelectItem value="CONTRACTOR_FAULT">Contractor Fault</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select
                              value={issueForm.severity}
                              onValueChange={(value) => setIssueForm({ ...issueForm, severity: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="CRITICAL">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input
                              type="date"
                              value={issueForm.issueDate}
                              onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Issue Type</Label>
                            <Select
                              value={issueForm.issueType}
                              onValueChange={(value) => setIssueForm({ ...issueForm, issueType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="QUALITY">Quality Issue</SelectItem>
                                <SelectItem value="SAFETY">Safety Concern</SelectItem>
                                <SelectItem value="DELAY">Delay</SelectItem>
                                <SelectItem value="DAMAGE">Damage</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={issueForm.location}
                            onChange={(e) => setIssueForm({ ...issueForm, location: e.target.value })}
                            placeholder="e.g., Main road near school"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={issueForm.description}
                            onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                            placeholder="Describe the issue in detail..."
                            required
                          />
                        </div>
                        {issueForm.category === 'NATURAL_DISASTER' && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <CheckCircle className="h-4 w-4 inline mr-2" />
                              <strong>Natural Disaster:</strong> This issue will be reviewed by government officials for forgiveness eligibility. The contractor's rating will not be affected if approved.
                            </p>
                          </div>
                        )}
                        {issueForm.category === 'CONTRACTOR_FAULT' && (
                          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              <strong>Contractor Fault:</strong> This issue will directly affect the contractor's rating and may result in penalties.
                            </p>
                          </div>
                        )}
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Submit Issue Report
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>

          <footer className="border-t bg-white dark:bg-gray-900 mt-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                © 2025 Payment Delay Tracker. Citizen Dashboard.
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}