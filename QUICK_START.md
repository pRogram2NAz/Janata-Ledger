# Local Government Payment Delay Tracker - Quick Start Guide

## Overview

A comprehensive full-stack application for Nepal's local government system to track payment delays, manage contracts, and ensure transparency. Built with Next.js 15, TypeScript, Prisma, and shadcn/ui.

## Features by Role

### 🏛️ Local Government
- Create and manage contracts (Small, Medium, Large)
- View and approve/reject payment requests
- Assign contractors to contracts
- Monitor daily work plans and reports
- Track contractor ratings
- Payment transparency dashboard

### 👷 Contractor
- Submit daily work plans (before 5 PM)
- Post work reports (after 5 PM)
- Request payments for completed work
- View AI-based ratings
- Manage active contracts
- Rating-based contract eligibility:
  - **Rating < 3.8**: Small contracts only
  - **Rating >= 3.8**: Medium + Small contracts
  - **Rating >= 4.0**: All contracts (Large + Medium + Small)

### 👤 Citizen
- Verify identity with NID/Citizenship card
- View all work reports from contractors
- Track government payments made
- Access daily work plans
- Full transparency on government spending

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite
- **Icons**: Lucide React
- **State Management**: React Hooks

## Getting Started

### 1. Access the Application

The application is running at: `http://localhost:3000`

### 2. Choose Your Role

On the main page, select one of three roles:
- **Local Government** - For ward offices and government officials
- **Contractor** - For contractors working on government projects
- **Citizen** - For public transparency and oversight

### 3. Login/Register

Enter your email and name to access the dashboard.
- Citizens must also provide their Citizenship/NID number
- New users are automatically registered
- Existing users are logged in automatically

## Workflow Examples

### Local Government Workflow

1. **Create a Contract**
   - Go to Contracts tab → Click "Create Contract"
   - Fill in contract details (title, description, budget, size, dates, location)
   - Contract size affects which contractors can bid (based on ratings)

2. **Assign a Contractor**
   - Find an unassigned contract
   - Click "Assign" button
   - Select a contractor from the list (ratings shown)
   - System checks contractor's rating eligibility

3. **Review Payment Requests**
   - Go to Payment Requests tab
   - Review each request (amount, work period, reason)
   - Approve or reject with reason
   - Track total payments made

4. **Monitor Work Progress**
   - View Daily Plans tab to see contractor plans
   - Check Work Reports tab for daily updates
   - Track overall contract progress

### Contractor Workflow

1. **View Assigned Contracts**
   - Check "My Contracts" tab
   - See active contracts and their status

2. **Submit Daily Plan**
   - Go to Daily Plans tab → Click "Submit Plan"
   - Select contract and date
   - Describe planned work, workers needed, materials
   - Submit before 5 PM each day

3. **Post Work Report**
   - Go to Reports tab → Click "Submit Report"
   - Fill in work summary, hours worked, workers used, progress percentage
   - Submit after 5 PM to report completed work

4. **Request Payment**
   - Go to Payments tab → Click "Request Payment"
   - Select contract, enter amount, work period, and reason
   - Track payment status (Pending → Approved → Paid)

5. **Monitor Your Rating**
   - View your current rating on the header
   - Check ratings breakdown in the stats cards
   - Higher ratings unlock larger contracts

### Citizen Workflow

1. **Verify Identity**
   - Enter your Citizenship/NID number
   - Format: District-Ward-Number (e.g., 12-34-56789)
   - Access verified dashboard

2. **View Work Reports**
   - Go to Work Reports tab
   - See all work reports from contractors
   - Monitor progress on government projects

3. **Track Payments**
   - Go to Payments tab
   - View all payment transactions
   - See payment status and amounts

4. **View Work Plans**
   - Go to Work Plans tab
   - Access daily work plans from contractors
   - Ensure transparency in project planning

## Database Schema

### Key Tables

#### User
- Users (Government, Contractor, Citizen)
- NID verification for citizens
- Contractor ratings and progress tracking

#### Contract
- Government contracts
- Small, Medium, Large sizes
- Status tracking (Pending, Approved, In Progress, Completed)

#### PaymentRequest
- Payment requests from contractors
- Status tracking (Pending, Under Review, Approved, Paid, Rejected)
- Blockchain integration fields (ready for your implementation)

#### DailyPlan
- Daily work plans submitted by contractors
- Worker counts, materials needed

#### WorkReport
- Daily work reports submitted by contractors
- Progress tracking, hours worked, photos

#### ContractorRating
- AI-generated ratings
- Multiple rating categories
- Overall rating determines contract eligibility

## API Endpoints

### User Management
- `POST /api/users` - Register new user
- `GET /api/users?role=ROLE` - Get users by role

### Contracts
- `POST /api/contracts` - Create contract (government only)
- `GET /api/contracts?governmentId=X&contractorId=Y` - Get contracts
- `PATCH /api/contracts/[id]` - Assign contractor or update status
- `GET /api/contracts/[id]` - Get contract details

### Payments
- `POST /api/payments` - Request payment (contractor only)
- `GET /api/payments?contractorId=X` - Get payment requests
- `PATCH /api/payments/[id]` - Approve/reject payment (government only)
- `GET /api/payments/[id]` - Get payment details

### Plans & Reports
- `POST /api/plans` - Submit daily plan (contractor only)
- `GET /api/plans?contractorId=X` - Get daily plans
- `POST /api/reports` - Submit work report (contractor only)
- `GET /api/reports?contractorId=X` - Get work reports

### AI Rating
- `POST /api/ai-rating` - Calculate AI rating (placeholder for your implementation)
- `GET /api/ai-rating?contractorId=X` - Get contractor rating

## Integration Points

### 🤖 AI Integration

The AI rating system is ready for your implementation!

**Location**: `src/app/api/ai-rating/route.ts`

The system provides:
- Complete contractor data (plans, reports, payments, work history)
- Rating fields for multiple categories
- Automatic eligibility checks based on rating

**What you need to do**:
1. Integrate your AI model in `/api/ai-rating/route.ts`
2. Analyze: plan quality, report quality, payment history, worker management
3. Return ratings (0-5 scale) for each category
4. See `INTEGRATION_GUIDE.md` for detailed instructions

### ⛓️ Blockchain Integration

The blockchain recording system is ready for your implementation!

**Location**: `src/app/api/payments/[id]/route.ts`

The database already includes:
- `blockchainTxHash` field in PaymentRequest
- `walletAddress` field for payment tracking

**What you need to do**:
1. Implement blockchain recording in payment approval flow
2. Store transaction hash in database
3. Provide transaction verification for citizens
4. See `INTEGRATION_GUIDE.md` for detailed instructions

## Features for Hackathon

### ✅ Working Features
1. Three distinct dashboards (Government, Contractor, Citizen)
2. Role-based authentication and authorization
3. Complete contract lifecycle management
4. Payment request workflow with approval/rejection
5. Daily plan and work report submission
6. Contractor rating system (placeholder for AI)
7. Citizen verification with NID number
8. Transparent access to government spending
9. Responsive design with shadcn/ui components
10. Dark mode support

### 🔧 Ready for Your Implementation
1. **AI Contractor Rating**: Complete data flow, just add your AI model
2. **Blockchain Payment Recording**: Schema ready, just integrate your blockchain
3. **Smart Contract Integration**: Extend with Ethereum-compatible contracts

## Database Management

### View Database
```bash
bunx prisma studio
```

### Reset Database
```bash
rm /home/z/my-project/db/custom.db
bun run db:push
```

### Update Schema
1. Edit `prisma/schema.prisma`
2. Run `bun run db:push`

## Tips for Hackathon Demo

### Demo Scenario 1: Full Payment Workflow
1. Log in as Government → Create contract
2. Log in as Contractor → Submit plan, report, request payment
3. Log in as Government → Approve payment
4. Log in as Citizen → View payment transparency

### Demo Scenario 2: Contractor Rating System
1. Show contractor ratings dashboard
2. Explain rating thresholds (3.8 for medium, 4.0 for large)
3. Show how ratings unlock different contract sizes
4. Mention AI integration point

### Demo Scenario 3: Citizen Transparency
1. Log in as Citizen with NID
2. Show work reports and payments
3. Explain how citizens can track government spending
4. Mention blockchain integration for immutable records

## Troubleshooting

### Application Not Loading
- Check dev server is running: `tail -f /home/z/my-project/dev.log`
- Try refreshing the page
- Clear browser cache

### Database Issues
- Reset database: `rm /home/z/my-project/db/custom.db && bun run db:push`
- Check Prisma logs in dev.log

### API Errors
- Check browser console for error messages
- Verify data format in API calls
- Check dev.log for server-side errors

## Next Steps

1. **Implement Your AI Model**
   - Update `/api/ai-rating/route.ts`
   - Test with sample data
   - Verify rating thresholds work

2. **Implement Your Blockchain**
   - Update `/api/payments/[id]/route.ts`
   - Record transactions on approval
   - Add verification endpoints

3. **Prepare Demo**
   - Create test users for each role
   - Add sample contracts and data
   - Prepare demo scenarios

## Support

For detailed integration instructions, see:
- `INTEGRATION_GUIDE.md` - AI and Blockchain integration
- `prisma/schema.prisma` - Database schema reference
- Dev log: `/home/z/my-project/dev.log` - Server logs

---

**Good luck with your hackathon! 🚀**

This flexible full-stack application provides a solid foundation for your AI and Blockchain integrations while offering a complete, working system for payment delay tracking in Nepal's local government context.
