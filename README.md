<<<<<<< HEAD
# 🏛️ Local Government Payment Delay Tracker - Nepal

A comprehensive full-stack application for tracking government payments to contractors, ensuring transparency and accountability in Nepal's local government system.

## 🎯 Problem Statement

**The Issue**: Ward offices approve payments, but contractors and employees wait for months before receiving payment. Nobody knows where the payment is stuck in the approval process.

**The Solution**: A transparent, trackable payment system with:
- Real-time payment status tracking
- Role-based dashboards (Government, Contractor, Citizen)
- Daily work reports and plans
- AI-powered contractor ratings
- Citizen oversight with NID verification
- Work longevity tracking

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React

## 👥 User Roles

### 1. 🏛️ Local Government (Ward Office)
**Responsibilities**:
- Create and manage contracts (Small, Medium, Large)
- Approve or reject payment requests
- Assign contractors to contracts (with rating validation)
- Review daily work reports
- Monitor contractor work progress
- Review contractor qualifications

### 2. 👷 Contractor
**Responsibilities**:
- Submit daily work plans (before 5 PM)
- Post work reports (after 5 PM only)
- Request payments for completed work
- Upload material details for pricing transparency
- View AI-based ratings
- Build rating to qualify for larger contracts

### 3. 👤 Citizen
**Responsibilities**:
- Verify identity with Citizenship/NID number
- View all contractor work reports
- Track government payments made
- Access daily work plans (transparency)
- Rate contractors on completed work (with proof for negatives)
- Report issues (natural disasters vs contractor faults)

## 🌟 Rating System

### Smart Rating Rules
- **Harder to Gain**: Positive ratings only give **50%** of the increase
- **Easier to Lose**: Negative ratings take **100%** of the decrease
- **Rating Range**: 0.0 to 5.0
- **Minimum to Operate**: 3.8/5.0 (contractors below 3.8 are suspended)

### Rating Categories
1. **Overall Rating**: Average of all categories
2. **Plan Rating**: Based on daily plan adherence
3. **Report Quality**: Based on work report detail
4. **Payment History**: Based on payment request validity
5. **Worker Management**: Based on worker consistency
6. **Quality of Work**: Based on citizen ratings
7. **Durability Score**: Based on work longevity

### Contract Size Requirements
| Contract Size | Minimum Rating | Can Bid On |
|---------------|----------------|------------|
| Small | 3.8 | Small |
| Medium | 3.8 | Small, Medium |
| Large | 4.0 | Small, Medium, Large |

### Forgiveness System
**Natural Disasters** (Landslides, earthquakes, floods) can be forgiven:
- Government reviews the disaster claim
- If approved: No rating penalty
- If rejected: Treated as contractor fault (full penalty)

**Contractor Faults** (Poor drainage, substandard materials, poor workmanship):
- Full penalty applies based on severity
- Low: -0.5 points
- Medium: -1.0 points
- High: -1.5 points
- Critical: -2.0 points

## 📊 Database Schema

### Models (10 tables)

1. **User**: Government officials, contractors, citizens
2. **Contract**: Government contracts with size, budget, work longevity tracking
3. **PaymentRequest**: Payment requests with material details and blockchain fields
4. **DailyPlan**: Contractor daily work plans with material tracking
5. **WorkReport**: Daily work reports with progress tracking
6. **ContractorQualification**: Contractor certificates, skills, experience, test results
7. **CitizenRating**: Citizen ratings with proof requirements and longevity tracking
8. **IssueReport**: Issue reports (natural disaster vs contractor fault) with forgiveness system
9. **ContractorRating**: AI-based ratings with smart point system tracking
10. **ContractorProgress**: Contract eligibility and suspension tracking

## 🛠️ API Endpoints

### Authentication & Users
```
POST /api/users                    # Register new user
GET /api/users?role=XXX            # Get users by role
```

### Contracts
```
POST /api/contracts                   # Create contract (government)
GET /api/contracts?governmentId=XXX    # Get contracts
PATCH /api/contracts/[id]             # Assign contractor/update status
GET /api/contracts/[id]             # Get contract details
```

### Payments
```
POST /api/payments                   # Request payment (contractor)
GET /api/payments?contractorId=XXX    # Get payments
PATCH /api/payments/[id]             # Approve/reject payment (government)
GET /api/payments/[id]             # Get payment details
```

### Daily Plans
```
POST /api/plans                       # Submit daily plan (contractor)
GET /api/plans?contractorId=XXX       # Get daily plans
```

### Work Reports
```
POST /api/reports                      # Submit work report (contractor, after 5 PM)
GET /api/reports?contractorId=XXX       # Get work reports
```

### Contractor Ratings (AI Integration Point)
```
POST /api/ai-rating                   # Calculate AI rating (your AI goes here)
GET /api/ai-rating?contractorId=XXX   # Get contractor rating
```

### Citizen Ratings
```
POST /api/citizen-ratings              # Submit citizen rating
GET /api/citizen-ratings?contractorId=XXX  # Get ratings
```

### Issue Reports
```
POST /api/issue-reports              # Submit issue report
PATCH /api/issue-reports              # Review forgiveness (government)
GET /api/issue-reports?contractorId=XXX  # Get issues
```

## 🎨 Features

### For Government
- ✅ Contract management with size categories
- ✅ Contractor assignment with rating validation
- ✅ Payment approval/rejection workflow
- ✅ Work reports monitoring
- ✅ Daily plans review
- ✅ Contractor qualification review

### For Contractors
- ✅ Daily plan submission (before 5 PM)
- ✅ Work report submission (after 5 PM)
- ✅ Payment request submission with material details
- ✅ AI rating display with breakdown
- ✅ Rating eligibility warnings (below 3.8, below 4.0)
- ✅ Contract progress tracking

### For Citizens
- ✅ NID/Citizenship verification
- ✅ View all contractor work reports
- ✅ Track government payments
- ✅ Access daily work plans
- ✅ Rate contractors with proof requirements for negatives
- ✅ Report issues (natural disaster vs contractor fault)
- ✅ Full transparency dashboard

### Advanced Features
- ✅ **Smart Rating System**: Harder to gain points, easier to lose
- ✅ **Work Longevity Tracking**: Expected vs actual lifespan monitoring
- ✅ **Forgiveness System**: Natural disasters can be forgiven
- ✅ **Material Transparency**: Material details in plans and payments
- ✅ **Proof Requirements**: Negative ratings require photo/video evidence
- ✅ **Early Failure Penalties**: Double penalty if work fails before 50% of expected lifespan
- ✅ **NID Verification**: Nepal format (District-Ward-Number)
- ✅ **Rating Thresholds**: Minimum 3.8 to operate, 4.0 for large contracts
- ✅ **Blockchain Ready**: Schema prepared for transaction recording
- ✅ **AI Integration Point**: Placeholder for your AI model

## 📱 Responsive Design

- **Mobile**: Stacked cards, touch-friendly
- **Tablet**: 2-column grids
- **Desktop**: Full table visibility
- **Dark Mode**: Full support
- **Beautiful Gradients**: Emerald → Teal → Cyan

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- bun or npm
- Git

### Installation
```bash
# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

### Access the Application
```
http://localhost:3000
```

## 📁 Project Structure

```
/home/z/my-project/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main landing page with role selection
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles
│   │   └── api/                 # All API routes
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── contracts/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── payments/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── plans/
│   │       │   └── route.ts
│   │       ├── reports/
│   │       │   └── route.ts
│   │       ├── ai-rating/
│   │       │   └── route.ts
│   │       ├── citizen-ratings/
│   │       │   └── route.ts
│   │       └── issue-reports/
│   │           ├── route.ts
│   ├── components/
│   │   ├── ui/                    # 40+ shadcn/ui components
│   │   └── dashboards/           # Role-based dashboards
│   │       ├── local-government-dashboard.tsx
│   │       ├── contractor-dashboard.tsx
│   │       └── citizen-dashboard.tsx
│   ├── lib/
│   │   ├── db.ts                  # Prisma client
│   │   └── utils.ts               # Utility functions
│   └── hooks/
│       └── use-toast.ts           # Toast notifications
├── db/
│   └── custom.db                  # SQLite database
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── components.json                 # shadcn/ui config
```

## 🎓 Workflow Examples

### Government Workflow
1. Login as Government
2. Create a contract (e.g., "Road Construction - Ward 5")
3. Assign contractor (check rating requirements)
4. Review payment requests from contractor
5. Approve or reject payments
6. Monitor work reports and daily plans

### Contractor Workflow
1. Login as Contractor
2. View assigned contracts
3. Submit daily plan (before 5 PM) with material details
4. Complete work
5. Post work report (after 5 PM) with progress
6. Request payment with material receipts
7. Monitor your rating
8. Build rating from 3.8 to qualify for larger contracts

### Citizen Workflow
1. Login as Citizen
2. Verify NID (format: District-Ward-Number, e.g., 12-34-56789)
3. View contractor work reports
4. Track government payments
5. Access daily work plans
6. Rate contractor on completed work (with proof for negatives)
7. Report issues (natural disasters vs contractor faults)

## 🔗️ Database Management

```bash
# View database
bunx prisma studio

# Push schema changes
bun run db:push

# Generate Prisma client
bun run db:generate
```

## 🤖 AI Integration Point

The AI rating system is ready for your custom AI model integration:

**Location**: `src/app/api/ai-rating/route.ts`

**Data Available for Analysis**:
- Contractor's daily plans
- Work reports submitted
- Payment request history
- Worker consistency
- Plan adherence rates

**What Your AI Should Do**:
1. Analyze plan quality vs actual work done
2. Evaluate report detail and accuracy
3. Assess worker efficiency and consistency
4. Review payment request validity
5. Calculate multi-category ratings:
   - Overall rating (0-5)
   - Plan rating (0-5)
   - Report quality (0-5)
   - Payment history (0-5)
   - Worker management (0-5)
   - Quality of work (0-5)
   - Durability score (0-5)

**Expected Response**:
```json
{
  "success": true,
  "rating": { overallRating: 4.2, ... },
  "analysis": "Your detailed AI analysis text here"
}
```

## ⛓️ Blockchain Integration Point

The blockchain recording system is ready for your implementation:

**Location**: `src/app/api/payments/[id]/route.ts`

**When Payment is Approved/Paid**:
- Record transaction on blockchain
- Store transaction hash in `blockchainTxHash` field
- Store wallet address in `walletAddress` field

**What You Should Do**:
```typescript
// When payment is approved
blockchainTxHash = await recordTransactionOnBlockchain({
  paymentId: updatedPayment.id,
  contractId: updatedPayment.contract.id,
  amount: updatedPayment.amount,
  contractorId: updatedPayment.requester.id,
  governmentId: updatedPayment.contract.governmentId,
  timestamp: new Date().toISOString(),
  metadata: {
    contractTitle: updatedPayment.contract.title,
    workPeriod: updatedPayment.workPeriod
  }
});

await db.paymentRequest.update({
  where: { id: updatedPayment.id },
  data: {
    blockchainTxHash,
    walletAddress
  }
});
```

## 🎯 Hackathon Demo Scenarios

### Scenario 1: End-to-End Payment Flow
1. **Government**: Creates contract "Road Construction - Ward 5"
2. **Contractor**: Assigned to contract, submits daily plan
3. **Contractor**: Posts work report showing 10% progress
4. **Contractor**: Requests payment for Rs. 100,000
5. **Government**: Receives request, reviews, approves
6. **Citizen**: Can see payment status, work progress

### Scenario 2: Rating System in Action
**Contractor A (Good Performer)**:
- Initial rating: 4.0 (certificate + experience)
- Gets 5-star citizen ratings
- Points gained: +0.25 (50% of +0.5 each)
- New rating: 4.25 (slow growth - harder to gain!)

**Contractor B (Poor Performer)**:
- Initial rating: 3.5
- Gets 2-star citizen ratings
- Points lost: -1.5 (100% of -1.5 each)
- New rating: 2.0 (below 3.8 threshold, SUSPENDED!)
- Must work on small contracts to rebuild

### Scenario 3: Natural Disaster Forgiveness
**Event**: Landslide damages road
1. **Citizen**: Reports issue as "Natural Disaster"
2. **Government**: Reviews with authorities
3. **Government**: Approves forgiveness
4. **Result**: Contractor rating unchanged (fair!)

### Scenario 4: Contractor Fault Penalty
**Event**: Poor drainage causes water to collect on road
1. **Citizen**: Reports as "Contractor Fault", HIGH severity
2. **System**: Applies -1.5 penalty immediately
3. **Result**: Contractor rating drops significantly
4. **Impact**: Contractor may lose contract eligibility

### Scenario 5: Work Longevity Tracking
**Event**: Road fails after 6 months (should last 10 years)
1. **System**: Detects early failure (< 50% of expected lifespan)
2. **Penalty**: Double normal penalty (-1.5 × 2 = -3.0)
3. **Result**: Severe rating drop, contractor suspended
4. **Message**: Incentivizes durable construction

## 📋 Key Features for Hackathon

1. ✅ **Three Complete Dashboards** (Government, Contractor, Citizen)
2. ✅ **Smart Rating System** (harder to gain, easier to lose)
3. ✅ **Work Longevity Tracking** (expected vs actual lifespan)
4. ✅ **Forgiveness System** (natural disasters can be forgiven)
5. ✅ **Contractor Qualification** (certificate, skills, experience, or test)
6. ✅ **Material Transparency** (pricing in daily plans and payments)
7. ✅ **Proof-Based Ratings** (negative ratings require evidence)
8. ✅ **Issue Reporting** (natural disaster vs contractor fault)
9. ✅ **NID Verification** (Nepal format: District-Ward-Number)
10. ✅ **Rating Thresholds** (3.8 minimum, 4.0 for large contracts)
11. ✅ **5 PM Reporting Rule** (contractors can only submit reports after 5 PM)
12. ✅ **Blockchain Ready** (schema prepared for transaction recording)
13. ✅ **AI Integration Point** (placeholder ready for your AI)
14. ✅ **Responsive Design** (mobile, tablet, desktop)
15. ✅ **Dark Mode** (fully supported)

## 🎓 Learning Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

## 📝 Development Notes

### Environment Variables
```bash
DATABASE_URL="file:./db/custom.db"
```

### Available Scripts
```bash
bun run dev              # Start development server
bun run build            # Create production build
bun run lint             # Check code quality
bun run db:generate        # Generate Prisma client
bun run db:push           # Push schema to database
bun run db:studio         # Open Prisma Studio
```

---

**© 2025 Payment Delay Tracker. Built for Nepal Local Governments.**
**Hackathon Project**
=======
# Hack-a-Week-
>>>>>>> 595ff9b246e6af4f7981627361b0e8860ca36d1b
