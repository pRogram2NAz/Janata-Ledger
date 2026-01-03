# Integration Guide: AI and Blockchain

This document provides guidance on integrating your custom AI and Blockchain implementations into the Local Government Payment Delay Tracker.

## AI Integration Points

### 1. Contractor Rating System

**Location:** `src/app/api/ai-rating/route.ts`

The AI rating system is designed to analyze contractor performance based on multiple factors:

#### Data Available for Analysis
- Daily plans and their adherence
- Work reports (content, photos, progress tracking)
- Payment request history
- Worker management data
- Overall project performance

#### Current Implementation
Currently uses placeholder ratings (4.0 default). You need to integrate your AI model here.

#### How to Integrate Your AI

```typescript
// In src/app/api/ai-rating/route.ts

// 1. Import your AI SDK
// import { zAI } from 'z-ai-web-dev-sdk';

// 2. Replace the placeholder logic in the POST handler
export async function POST(request: NextRequest) {
  // ... existing code to fetch contractor data ...

  // ==========================================
  // TODO: INTEGRATE YOUR AI MODEL HERE
  // ==========================================

  // Prepare data for AI analysis
  const aiInput = {
    contractor: {
      name: contractor.name,
      totalContracts: contractor.contracts.length,
      activeContracts: contractor.contracts.filter(c => c.contract.status === 'IN_PROGRESS').length,
      completedContracts: contractor.contracts.filter(c => c.contract.status === 'COMPLETED').length,
    },
    plans: contractor.contracts.flatMap(c => c.contract.dailyPlans),
    reports: contractor.contracts.flatMap(c => c.contract.dailyPlans.flatMap(dp => dp.workReports)),
    paymentRequests: contractor.contracts.flatMap(c => c.contract.paymentRequests),
    currentRatings: contractor.contractorRating
  };

  // Call your AI model
  // const aiAnalysis = await analyzeContractorPerformance(aiInput);

  // Expected AI response structure:
  /*
  {
    overallRating: number,        // 0-5 scale
    planRating: number,           // 0-5 scale
    reportQuality: number,        // 0-5 scale
    paymentHistory: number,       // 0-5 scale
    workerManagement: number,     // 0-5 scale
    aiAnalysis: string            // Detailed analysis text
  }
  */

  // Update ratings in database
  await db.contractorRating.update({
    where: { contractorId },
    data: {
      overallRating: aiAnalysis.overallRating,
      planRating: aiAnalysis.planRating,
      reportQuality: aiAnalysis.reportQuality,
      paymentHistory: aiAnalysis.paymentHistory,
      workerManagement: aiAnalysis.workerManagement,
      aiAnalysis: aiAnalysis.aiAnalysis,
      lastUpdated: new Date()
    }
  });

  // ... rest of the code ...
}
```

#### Rating Rules
- **Rating < 3.8**: Can only work on small contracts
- **Rating >= 3.8**: Can work on medium and small contracts
- **Rating >= 4.0**: Can work on all contract sizes (large, medium, small)

#### Factors to Consider for AI Analysis
1. **Plan Quality**: How well do actual reports match planned work?
2. **Report Quality**: Detail level, photo evidence, progress tracking
3. **Payment History**: Validity of payment requests, work completion ratio
4. **Worker Management**: Planned vs actual worker counts, efficiency
5. **Timeliness**: Punctuality in submitting reports after 5 PM

---

## Blockchain Integration Points

### 1. Payment Transaction Recording

**Location:** `src/app/api/payments/[id]/route.ts`

When a payment is approved or marked as PAID, you should record it on the blockchain.

#### Current Implementation
The `blockchainTxHash` field exists in the PaymentRequest schema but is not populated.

#### How to Integrate Your Blockchain

```typescript
// In src/app/api/payments/[id]/route.ts

// 1. Import your blockchain SDK
// import { blockchainService } from '@/lib/blockchain';

// 2. In the PATCH handler, after status update
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... existing validation and update code ...

  let blockchainTxHash = null;

  // Record on blockchain when payment is approved/paid
  if (status === 'APPROVED' || status === 'PAID') {
    try {
      // Prepare transaction data
      const transactionData = {
        paymentId: updatedPayment.id,
        contractId: updatedPayment.contract.id,
        amount: updatedPayment.amount,
        contractorId: updatedPayment.requester.id,
        governmentId: updatedPayment.contract.government.id,
        timestamp: new Date().toISOString(),
        status: status,
        workPeriod: updatedPayment.workPeriod,
        // Add any additional metadata you want to store
        metadata: {
          contractTitle: updatedPayment.contract.title,
          contractorName: updatedPayment.requester.name,
          reason: updatedPayment.reason
        }
      };

      // Submit to blockchain
      // blockchainTxHash = await blockchainService.recordPayment(transactionData);

      console.log('Blockchain transaction recorded:', blockchainTxHash);

    } catch (error) {
      console.error('Blockchain recording error:', error);
      // Decide whether to fail the payment or continue without blockchain
      // For hackathon, you might want to log and continue
    }
  }

  // Update payment request with blockchain transaction hash
  const updatedPaymentWithTx = await db.paymentRequest.update({
    where: { id },
    data: {
      status,
      approvedBy,
      rejectedAt: status === 'REJECTED' ? new Date() : null,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      blockchainTxHash,
      walletAddress: status === 'PAID' ? updatedPayment.contract.government.email : null
    },
    include: {
      contract: { /* ... */ },
      requester: { /* ... */ }
    }
  });

  // ... rest of the code ...
}
```

#### Blockchain Data Structure
Each payment transaction should store:
- Payment ID (for reference)
- Contract ID
- Amount
- Contractor identifier
- Government/Authority identifier
- Timestamp
- Status (APPROVED/PAID)
- Work period covered
- Additional metadata for transparency

#### Suggested Blockchain Features
1. **Immutable Payment Records**: Every payment approval/pay-out is recorded
2. **Payment Trail**: Citizens can trace where funds went
3. **Smart Contracts**: Automate payment release based on milestones
4. **Audit Trail**: Complete history of all government payments

---

## Database Schema Integration Points

### Blockchain-Ready Fields

The database schema already includes blockchain integration fields:

#### In `PaymentRequest` model:
```prisma
model PaymentRequest {
  // ... existing fields ...
  blockchainTxHash String?  // Transaction hash from blockchain
  walletAddress     String?  // Wallet address for payment
}
```

### AI-Ready Fields

The database schema includes AI integration fields:

#### In `ContractorRating` model:
```prisma
model ContractorRating {
  // ... existing fields ...
  aiAnalysis String?  // AI analysis text (for your AI model output)

  // Rating fields for AI to update:
  overallRating     Float  // Overall performance rating
  planRating        Float  // Plan adherence rating
  reportQuality     Float  // Report quality rating
  paymentHistory    Float  // Payment history rating
  workerManagement  Float  // Worker management rating
}
```

---

## Testing Your Integrations

### 1. Testing AI Integration

1. Create test contractor and contracts
2. Submit daily plans and work reports
3. Request payments
4. Call the AI rating endpoint:
   ```bash
   POST /api/ai-rating
   {
     "contractorId": "<contractor-id>"
   }
   ```
5. Verify ratings are updated correctly

### 2. Testing Blockchain Integration

1. Create and approve a payment
2. Check the `blockchainTxHash` field in the payment record
3. Verify the transaction on your blockchain explorer
4. Test that citizens can view payment history with blockchain proof

---

## Example AI Analysis Prompt

If using LLM for contractor analysis, you can structure a prompt like:

```
You are an AI contractor performance evaluator. Analyze the following contractor data and provide ratings (0-5 scale) for each category:

Contractor: {name}
Total Contracts: {total}
Completed: {completed}
Active: {active}

Plans Analysis:
- Total plans: {count}
- Plans with reports: {count}
- Plan-to-report adherence rate: {percentage}

Reports Analysis:
- Total reports: {count}
- Average report length: {chars}
- Reports with photos: {percentage}

Payment History:
- Total requests: {count}
- Approved: {count}
- Rejected: {count}
- Total amount requested: {amount}
- Total amount paid: {amount}

Worker Management:
- Average planned workers: {number}
- Average actual workers: {number}
- Worker consistency: {percentage}

Provide ratings and detailed analysis in JSON format:
{
  "overallRating": 0-5,
  "planRating": 0-5,
  "reportQuality": 0-5,
  "paymentHistory": 0-5,
  "workerManagement": 0-5,
  "aiAnalysis": "detailed text analysis"
}
```

---

## Summary

The application is fully set up with:

### ✅ Database Integration
- Complete Prisma schema with AI and blockchain fields
- All relations and indexes optimized
- SQLite database ready for production

### ✅ API Endpoints
- `/api/users` - User registration and management
- `/api/contracts` - Contract CRUD operations
- `/api/payments` - Payment request management
- `/api/plans` - Daily plan submissions
- `/api/reports` - Work report submissions
- `/api/ai-rating` - **AI integration point** (ready for your implementation)
- `/api/contracts/[id]` - Contract assignment and updates
- `/api/payments/[id]` - **Blockchain integration point** (ready for your implementation)

### ✅ User Dashboards
- **Local Government Dashboard**: Full management capabilities
- **Contractor Dashboard**: Plan, report, request payments, view ratings
- **Citizen Dashboard**: Transparency views with NID verification

### 🔧 Ready for Your Additions
- AI rating analysis system (placeholder in place)
- Blockchain transaction recording (schema ready)
- Flexible architecture for easy extension

---

## Next Steps

1. **Implement Your AI Model**:
   - Update `/api/ai-rating/route.ts` with your AI logic
   - Test with sample contractor data
   - Verify rating thresholds work correctly

2. **Implement Your Blockchain**:
   - Update `/api/payments/[id]/route.ts` to record transactions
   - Add blockchain verification endpoints
   - Create a blockchain explorer view for citizens

3. **Test End-to-End**:
   - Create complete workflow test scenarios
   - Verify all role-based access controls
   - Test payment delay tracking features

Good luck with your hackathon! 🚀
