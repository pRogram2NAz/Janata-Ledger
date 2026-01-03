# Enhanced Contractor Rating & Quality System

## Overview

This document explains the comprehensive contractor rating and quality tracking system added to the Local Government Payment Delay Tracker. The system is designed to be **harder to gain points and easier to lose them**, ensuring only high-quality contractors maintain good ratings.

---

## New Features

### 1. Contractor Qualification System

Contractors must prove their credentials before bidding on contracts.

#### Required Information
- **Certificate**: Upload construction certificate or license
- **Certificate Number**: Official certificate/registration number
- **Issuing Authority**: Government body that issued the certificate
- **Issued Date & Expiry Date**: Validity period
- **Skills**: List of construction skills (JSON array)
- **Experience**: Years of experience and details of previous work

#### Initial Rating Calculation

The initial rating is calculated based on submitted qualifications:

```
Initial Rating = Certificate Score + Experience Score + Skills Score
```

**Certificate Score (Max 2.0 points)**
- Valid certificate: +2.0

**Experience Score (Max 2.0 points)**
- 0.5 points per year of experience
- Maximum 4 years = 2.0 points

**Skills Score (Max 1.0 points)**
- 0.2 points per relevant skill
- Maximum 5 skills = 1.0 points

**Total Initial Rating Range: 0.0 - 5.0**

#### Minimum Rating to Operate

- **Minimum rating**: 3.8 out of 5.0
- Contractors **below 3.8** are **suspended** and cannot bid on contracts
- Must work on small projects or take a test to rebuild rating

---

### 2. Smart Rating System (Harder to Gain, Easier to Lose)

#### Rating Change Rules

**Positive Ratings (Gaining Points)**
- Only gain **50%** of the increase
- Example: If citizen rates 5.0 and current rating is 4.0
  - Difference: +1.0
  - **Actual gain: +0.5** (hard to gain!)
  - New rating: 4.5

**Negative Ratings (Losing Points)**
- Lose **100%** of the decrease
- Example: If citizen rates 2.0 and current rating is 4.0
  - Difference: -2.0
  - **Actual loss: -2.0** (easy to lose!)
  - New rating: 2.0

**Rating Range**: 0.0 to 5.0 (clamped)

#### Rating Categories

1. **Overall Rating**: Average of all categories
2. **Plan Rating**: Based on daily plan adherence
3. **Report Quality**: Based on work report detail and accuracy
4. **Payment History**: Based on payment request validity
5. **Worker Management**: Based on worker consistency
6. **Quality of Work**: Based on citizen ratings
7. **Durability Score**: Based on work longevity

---

### 3. Citizen Rating System

Citizens can rate contractors on completed work.

#### Rating Requirements

**When Rating is Positive (>= 3.0)**
- Rating accepted immediately
- No proof required

**When Rating is Negative (< 3.0)**
- **Proof is MANDATORY**
- Must provide photo/video evidence
- Must explain why the rating is low
- Subject to government review

#### Rating Breakdown

Citizens can provide ratings in multiple categories:

1. **Overall Rating**: 1-5 scale
2. **Quality Rating**: 1-5 scale (workmanship)
3. **Durability Rating**: 1-5 scale (how long will it last)
4. **Timeliness Rating**: 1-5 scale (was it completed on time)

#### Work Longevity Tracking

For each contract, the system tracks:

- **Expected Lifespan**: How long work should last (e.g., road = 10 years)
- **Actual Lifespan Start**: When work was completed
- **Actual Lifespan End**: When work starts failing (if reported)

**Example Scenario:**
```
Contract: Road construction in Ward 5
Expected Lifespan: 10 years
Contractor builds road

After 2 years, citizen reports:
- "Road has cracks and potholes"
- Photos attached as proof
- Issue category: Contractor Fault (poor drainage)

Penalty Calculation:
- Base penalty: 1.5 (HIGH severity)
- Early failure bonus: x2 (failed before 50% of expected lifespan)
- Total penalty: 3.0 points lost

Current rating: 4.0
New rating: 1.0 (Contractor can no longer bid on contracts!)
```

---

### 4. Issue Reporting System

Citizens can report issues with contractor work.

#### Issue Categories

**A. Natural Disaster (No Rating Penalty)**
- Landslides
- Earthquakes
- Floods
- Heavy rainfall (beyond normal levels)

These issues **do NOT affect contractor rating** if approved as forgiveness requests.

**B. Contractor Fault (Rating Penalty)**
- Poor drainage (water collecting on road)
- Cracks and potholes
- Substandard materials
- Design flaws
- Poor workmanship

These issues **DO affect contractor rating**.

#### Issue Severity Levels

| Severity | Penalty |
|-----------|----------|
| LOW | 0.5 points lost |
| MEDIUM | 1.0 points lost |
| HIGH | 1.5 points lost |
| CRITICAL | 2.0 points lost |

#### Forgiveness System

**For Natural Disasters:**
1. Citizen submits issue report
2. Marks as "Forgiveness Request"
3. Government reviews:
   - If approved: **No rating penalty** (contractor forgiven)
   - If rejected: Treated as contractor fault (full penalty applies)

**Example - Landslide Scenario:**
```
Contractor builds road
Landslide occurs, damages road

Citizen reports:
- Category: Natural Disaster
- Photos of landslide
- Request forgiveness

Government reviews:
- Landslide verified by authorities ✓
- Forgiveness approved ✓
- Contractor rating: NO CHANGE (fair!)

But if:
- Landslide NOT verified by authorities ✗
- Forgiveness rejected ✗
- Contractor rating: LOSES POINTS (poor site preparation)
```

#### Issue Examples

**Contractor Fault (Penalty Applies)**
- Heavy rainfall causes flooding
- Water does not drain away (stores on road)
- **This is contractor's fault** - poor drainage design
- Rating penalty applies

**Natural Disaster (No Penalty if Forgiven)**
- Landslide damages road
- No way to prevent it
- **This is natural disaster**
- Forgiveness requested
- If approved: No rating penalty

---

### 5. Material Details Tracking

Contractors must upload material details for pricing transparency.

#### Where Material Details Are Required

1. **Payment Requests**: When asking for payment
   - Upload material receipts
   - List materials with quantities and prices
   - Government verifies pricing

2. **Daily Plans**: When planning work
   - List materials to be used
   - Estimated costs
   - Helps government track spending

#### Material Data Structure

```json
{
  "materials": [
    {
      "name": "Cement",
      "quantity": 50,
      "unit": "bags",
      "pricePerUnit": 850,
      "totalPrice": 42500
    },
    {
      "name": "Steel Bars",
      "quantity": 200,
      "unit": "kg",
      "pricePerUnit": 120,
      "totalPrice": 24000
    }
  ],
  "totalEstimatedCost": 66500
}
```

---

## Rating Thresholds & Contract Eligibility

### Contract Size Requirements

| Contract Size | Minimum Rating Required |
|---------------|----------------------|
| Small | 3.8 (minimum to operate) |
| Medium | 3.8 |
| Large | 4.0 |

### Contractor Status Based on Rating

| Rating Range | Status | Can Bid On |
|---------------|--------|-------------|
| 0.0 - 3.7 | **SUSPENDED** | None |
| 3.8 - 3.9 | Active | Small, Medium |
| 4.0 - 5.0 | Active | All (Small, Medium, Large) |

### Rebuilding Rating

**If contractor rating falls below 3.8:**
1. Can only work on small contracts
2. Must complete small contracts successfully
3. Must maintain good ratings from citizens
4. Rating will slowly increase over time

**If contractor rating falls below 2.0:**
1. **Suspension**
2. Must take assessment test
3. Test results determine new initial rating
4. Government reviews before allowing back

---

## API Endpoints

### Qualification Management

**Submit Qualification**
```
POST /api/qualification
{
  "contractorId": "string",
  "certificateUrl": "string",
  "certificateNumber": "string",
  "issuedDate": "date",
  "expiryDate": "date",
  "issuingAuthority": "string",
  "skills": "[\"road construction\", \"drainage\"]",
  "experienceYears": 5,
  "experienceDetails": "string"
}
```

**Get Qualification**
```
GET /api/qualification?contractorId=<id>
```

### Citizen Ratings

**Submit Rating**
```
POST /api/citizen-ratings
{
  "contractId": "string",
  "contractorId": "string",
  "citizenId": "string",
  "rating": 1-5,
  "comment": "string",
  "qualityRating": 1-5,
  "durabilityRating": 1-5,
  "timelinessRating": 1-5,
  "proofUrl": "string",  // Required for negative ratings
  "proofDescription": "string"  // Required for negative ratings
}
```

**Get Ratings**
```
GET /api/citizen-ratings?contractorId=<id>&contractId=<id>&status=<status>
```

### Issue Reports

**Submit Issue Report**
```
POST /api/issue-reports
{
  "contractId": "string",
  "contractorId": "string",
  "citizenId": "string",
  "title": "string",
  "description": "string",
  "category": "NATURAL_DISASTER" | "CONTRACTOR_FAULT",
  "issueDate": "date",
  "issueType": "string",  // e.g., "Cracks", "Drainage", "Landslide"
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "location": "string",
  "photos": "[\"url1\", \"url2\"]"
}
```

**Review Forgiveness Request (Government)**
```
PATCH /api/issue-reports
{
  "issueId": "string",
  "forgive": true | false,
  "reviewedBy": "string"  // Government user ID
}
```

**Get Issues**
```
GET /api/issue-reports?contractorId=<id>&category=<category>&status=<status>
```

---

## Database Schema Updates

### New Models

1. **ContractorQualification**
   - Certificate details
   - Skills and experience
   - Initial rating calculation
   - Approval status

2. **CitizenRating**
   - Citizen ratings with proof
   - Work longevity tracking
   - Multi-category ratings (quality, durability, timeliness)

3. **IssueReport**
   - Natural disaster vs contractor fault categorization
   - Forgiveness system
   - Severity levels

### Updated Models

1. **Contract**
   - Added expected lifespan (e.g., 10 years for roads)
   - Added actual lifespan tracking
   - Added durability scoring

2. **DailyPlan**
   - Enhanced material tracking with costs
   - Estimated costs for transparency

3. **PaymentRequest**
   - Added material details with receipts
   - Enhanced pricing transparency

4. **ContractorRating**
   - Added points gained/lost tracking
   - Added durability score
   - Added quality of work rating
   - Added minimum threshold alerts

5. **ContractorProgress**
   - Enhanced with suspension status
   - Added suspension reasons
   - Detailed eligibility tracking

---

## Smart Rating Logic Summary

### Point Gains (Harder)
```
Positive rating change × 0.5 = Actual gain
Example: +1.0 × 0.5 = +0.5
```

### Point Losses (Easier)
```
Negative rating change × 1.0 = Actual loss
Example: -1.0 × 1.0 = -1.0
```

### Durability Bonus Penalties
```
If work fails before 50% of expected lifespan:
Penalty × 2 = Total penalty

Example: Road should last 10 years
Fails after 2 years (< 50% of 10 years)
Base penalty: 1.5
Total penalty: 3.0
```

---

## Real-World Examples

### Example 1: Good Contractor

**Initial Qualification:**
- Certificate: ✓ (+2.0)
- 5 years experience: ✓ (+2.0)
- 5 relevant skills: ✓ (+1.0)
- **Initial Rating: 5.0**

**After 1 Year of Work:**
- Completes 3 contracts successfully
- Citizen ratings: 4.8, 4.9, 5.0
- Points gained: Small (hard to gain)
- **Rating: 4.5** (still excellent!)

### Example 2: Poor Contractor

**Initial Qualification:**
- Certificate: ✓ (+2.0)
- 2 years experience: ✓ (+1.0)
- 2 relevant skills: ✓ (+0.4)
- **Initial Rating: 3.4**

**After 6 Months:**
- 1 citizen rating: 2.0 (poor quality)
- 1 issue report: Poor drainage (HIGH severity)
- Points lost: Large (easy to lose)
- **Rating: 0.9** (SUSPENDED!)

### Example 3: Natural Disaster Forgiveness

**Contractor Rating: 4.0**

**Landslide Occurs:**
- Citizen reports landslide
- Category: Natural disaster
- Requests forgiveness

**Government Review:**
- Landslide verified by authorities ✓
- **Forgiveness approved** ✓
- **Rating remains: 4.0** (Fair!)

### Example 4: Contractor Fault (Drainage Issue)

**Contractor Rating: 4.0**

**Heavy Rainfall:**
- Water collects on road (poor drainage)
- Citizen reports issue
- Category: Contractor fault (poor drainage)
- Severity: HIGH

**Government Review:**
- This is contractor's fault (bad design)
- **Penalty applied: -1.5**
- **New Rating: 2.5** (Can only work on small contracts)

---

## Implementation Status

### ✅ Completed

1. **Database Schema** - All new models and relations
2. **Qualification API** - `/api/qualification`
3. **Citizen Rating API** - `/api/citizen-ratings`
4. **Issue Report API** - `/api/issue-reports`
5. **Smart Rating Logic** - Hard to gain, easy to lose
6. **Material Tracking** - Enhanced in DailyPlan and PaymentRequest
7. **Work Longevity** - Durability tracking in contracts
8. **Forgiveness System** - Natural disaster vs contractor fault

### 🔄 In Progress

1. **Contractor Dashboard UI** - Add qualification submission form
2. **Citizen Dashboard UI** - Add rating and issue reporting forms
3. **Government Dashboard UI** - Add qualification review and forgiveness approval

### 📋 To Do

1. Upload functionality for certificates and photos
2. Test/assessment system for suspended contractors
3. Rating history and analytics
4. Notification system for rating changes

---

## Benefits

### For Government
- Transparent contractor evaluation
- Data-driven contract awarding
- Quality control mechanism
- Issue tracking and resolution

### For Contractors
- Clear path to demonstrate qualifications
- Fair rating system (natural disasters forgiven)
- Incentive to maintain high quality
- Opportunity to rebuild rating through small contracts

### For Citizens
- Power to rate work quality
- Proof-based negative ratings (prevents abuse)
- Issue reporting system
- Transparency in government spending
- Accountability for contractors

---

## Summary

This enhanced system ensures:

1. **Contractors must prove qualifications** before bidding
2. **Harder to gain rating** (50% of positive increases)
3. **Easier to lose rating** (100% of negative decreases)
4. **Fair treatment** (natural disasters can be forgiven)
5. **Accountability** (contractor faults are penalized)
6. **Durability matters** (work must last expected lifespan)
7. **Transparency** (material details and pricing tracked)
8. **Citizen voice** (can rate and report issues with proof)

The system incentivizes quality workmanship while being fair about uncontrollable factors like landslides and natural disasters.
