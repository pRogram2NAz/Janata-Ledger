# Local Government Payment Delay Tracker - Enhanced Features

## 🎉 New Features Added!

All the enhancements you requested have been implemented with a comprehensive rating and quality tracking system.

---

## 📋 Key Enhancements

### 1. Contractor Qualification System ✅

**Contractors MUST provide credentials before working on contracts:**

- **Certificate Upload**: Construction certificate or license
- **Certificate Details**: Number, issuing authority, dates
- **Skills**: List of construction capabilities
- **Experience**: Years and details of previous work
- **Initial Rating Calculation**: Based on qualifications (0-5 scale)

**Initial Rating Formula:**
```
Rating = Certificate (max 2.0) + Experience (max 2.0) + Skills (max 1.0)
Maximum without test: 5.0
```

### 2. Smart Rating System ✅

**Harder to gain points, easier to lose:**

| Scenario | Rating Change | Actual Impact |
|----------|---------------|---------------|
| Positive rating (+1.0) | Only gain 50% | +0.5 |
| Negative rating (-1.0) | Lose 100% | -1.0 |

**Rating Categories:**
- Overall Rating
- Plan Adherence
- Report Quality
- Payment History
- Worker Management
- Quality of Work (from citizens)
- Durability Score (work longevity)

### 3. Citizen Rating System ✅

**Citizens can rate contractors on completed work with:**

- **Overall Rating** (1-5 scale)
- **Quality Rating** (workmanship)
- **Durability Rating** (how long will it last)
- **Timeliness Rating** (was it completed on time)

**Proof Required for Negative Ratings (< 3.0):**
- Photo/video evidence mandatory
- Detailed explanation required
- Subject to government review

### 4. Issue Reporting System ✅

**Two Categories of Issues:**

#### A. Natural Disaster (No Rating Penalty)
- Landslides
- Earthquakes
- Floods
- Extreme weather beyond normal

**Forgiveness Process:**
1. Citizen submits issue as "Natural Disaster"
2. Requests forgiveness
3. Government reviews and verifies
4. **If approved**: No rating penalty (contractor forgiven)
5. **If rejected**: Treated as contractor fault

#### B. Contractor Fault (Rating Penalty)
- Poor drainage design (water doesn't flow)
- Cracks and potholes
- Substandard materials
- Poor workmanship

**Penalty Levels:**
| Severity | Points Lost |
|----------|-------------|
| LOW | 0.5 |
| MEDIUM | 1.0 |
| HIGH | 1.5 |
| CRITICAL | 2.0 |

**Example - Landslide vs Drainage:**

**Landslide (Natural Disaster):**
- Happens to road
- Contractor had no way to prevent it
- Citizen reports, requests forgiveness
- Government verifies with authorities
- **Forgiveness approved → No rating penalty!** ✅

**Drainage Issue (Contractor Fault):**
- Heavy rainfall occurs
- Water collects on road instead of draining
- **This is contractor's fault** - poor drainage design
- Citizen reports as "Contractor Fault"
- **Rating penalty applied!** ❌

### 5. Work Longevity Tracking ✅

**Each contract has:**
- **Expected Lifespan**: e.g., road must last 10 years
- **Actual Lifespan**: Tracking when work starts failing

**Early Failure Penalty:**
```
If work fails before 50% of expected lifespan:
Penalty × 2 = Total penalty

Example:
Road should last 10 years
Fails after 2 years (< 50% of 10 years)
Base penalty: 1.5
Total penalty: 3.0 points lost!
```

### 6. Material Details Tracking ✅

**For Pricing Transparency:**

Contractors must upload material details when:
- Submitting daily plans (materials to be used)
- Requesting payments (materials purchased)

**Material Data Includes:**
- Material name
- Quantity and unit
- Price per unit
- Total cost
- Receipt evidence

---

## 📊 Rating Thresholds

### Contract Size Requirements

| Contract Size | Minimum Rating | Can Bid? |
|---------------|-----------------|-----------|
| Small | 3.8 | ✓ |
| Medium | 3.8 | ✓ |
| Large | 4.0 | ✓ |

### Contractor Status

| Rating Range | Status | Can Work On |
|---------------|--------|--------------|
| 0.0 - 3.7 | **SUSPENDED** | None (must rebuild) |
| 3.8 - 3.9 | Active | Small, Medium |
| 4.0 - 5.0 | Active | All (Small, Medium, Large) |

---

## 🛠️ API Endpoints

### Contractor Qualification

**Submit Qualification**
```bash
POST /api/qualification
{
  "contractorId": "<id>",
  "certificateUrl": "https://...",
  "certificateNumber": "CERT-123",
  "issuedDate": "2020-01-01",
  "expiryDate": "2025-01-01",
  "issuingAuthority": "Department of Roads",
  "skills": "[\"road construction\", \"drainage\", \"concrete\"]",
  "experienceYears": 5,
  "experienceDetails": "Built 10km of roads in Kathmandu"
}
```

**Get Qualification**
```bash
GET /api/qualification?contractorId=<id>
```

### Citizen Ratings

**Submit Rating**
```bash
POST /api/citizen-ratings
{
  "contractId": "<id>",
  "contractorId": "<id>",
  "citizenId": "<id>",
  "rating": 5,
  "comment": "Excellent work!",
  "qualityRating": 5,
  "durabilityRating": 4,
  "timelinessRating": 5,
  "proofUrl": "https://..."  // Required for ratings < 3.0
}
```

**Get Ratings**
```bash
GET /api/citizen-ratings?contractorId=<id>
GET /api/citizen-ratings?contractId=<id>
GET /api/citizen-ratings?citizenId=<id>
```

### Issue Reports

**Submit Issue**
```bash
POST /api/issue-reports
{
  "contractId": "<id>",
  "contractorId": "<id>",
  "citizenId": "<id>",
  "title": "Road drainage issue",
  "description": "Water collects on road...",
  "category": "CONTRACTOR_FAULT",  // or "NATURAL_DISASTER"
  "issueDate": "2025-01-01",
  "issueType": "Drainage",
  "severity": "HIGH",  // LOW, MEDIUM, HIGH, CRITICAL
  "location": "Ward 5, Kathmandu",
  "photos": "[\"url1\", \"url2\"]"
}
```

**Review Forgiveness (Government)**
```bash
PATCH /api/issue-reports
{
  "issueId": "<id>",
  "forgive": true,  // or false
  "reviewedBy": "<government-user-id>"
}
```

---

## 📁 Database Schema Updates

### New Models Added:

1. **ContractorQualification** - Contractor credentials and initial rating
2. **CitizenRating** - Citizen ratings with proof and longevity tracking
3. **IssueReport** - Issue reports with forgiveness system

### Enhanced Models:

1. **Contract** - Added expected/actual lifespan tracking
2. **DailyPlan** - Added detailed material costs
3. **PaymentRequest** - Added material receipts for pricing transparency
4. **ContractorRating** - Added points gained/lost, quality, durability scores
5. **ContractorProgress** - Enhanced suspension and eligibility tracking

---

## 🎯 Real-World Examples

### Example 1: Qualified Contractor

**Qualification:**
- Certificate ✓ (Construction License)
- 5 years experience ✓
- 5 relevant skills ✓
- **Initial Rating: 5.0** (Perfect!)

**After 1 Year:**
- Completes 3 contracts
- Gets ratings: 4.8, 4.9, 5.0
- Points gained: Small (hard to gain - only 50%)
- **Rating: 4.8** (Still excellent!)

### Example 2: Poor Workmanship

**Initial Rating: 4.0**

**Issue: Road fails after 6 months**
- Should last 10 years
- Fails at 6 months (< 50% of expected)
- Citizen reports with photos
- Category: Contractor Fault (poor materials)
- Severity: HIGH

**Penalty:**
- Base: 1.5
- Early failure bonus: ×2
- **Total: 3.0 points lost**

**New Rating: 1.0** (Cannot bid on contracts!)

### Example 3: Landslide (Fair Treatment)

**Contractor Rating: 4.0**

**Landslide damages road:**
- Citizen reports
- Category: Natural Disaster
- Requests forgiveness
- Government verifies with authorities

**If Forgiveness Approved:**
- **Rating stays: 4.0** (Fair! No fault)

**If Forgiveness Rejected:**
- Should have built protective walls
- **Rating drops: -1.5** (Contractor fault)

### Example 4: Drainage Design Flaw

**Contractor Rating: 4.0**

**Heavy Rainfall:**
- Water collects on road
- **This is contractor's fault** - drainage doesn't work
- Citizen reports as Contractor Fault

**Penalty:**
- Severity: HIGH
- **Rating drops: -1.5**

**New Rating: 2.5** (Can only work on Small/Medium contracts)

---

## 🎓 How Rating System Works

### Getting Started (New Contractors)

1. **Register** as contractor
2. **Submit Qualification** with certificate, experience, skills
3. **Receive Initial Rating** (0-5 based on qualifications)
4. **If Rating < 3.8**:
   - **SUSPENDED**
   - Must work on small contracts to rebuild
   - Or take assessment test

5. **If Rating >= 3.8**:
   - Can bid on Small/Medium contracts
   - Start working and building reputation

### Maintaining High Rating

**Gaining Points (Hard):**
- Complete contracts successfully
- Get positive citizen ratings (only gain 50% of increase)
- Maintain quality workmanship
- Ensure drainage and proper construction

**Losing Points (Easy):**
- Poor quality work
- Early failures (before expected lifespan)
- Citizen complaints with proof
- Contractor fault issues

### Building from Low Rating

**If Rating Falls Below 3.8:**
1. Work on small contracts only
2. Must maintain quality
3. Positive ratings slowly rebuild rating
4. Once back to 3.8+, can bid on Medium contracts

**If Rating Falls Below 2.0:**
1. **Suspension**
2. Must take assessment test
3. Test results determine new rating
4. Government must approve to resume

---

## 🔍 Key Principles

### 1. Harder to Gain
- Positive ratings only give 50% of increase
- Prevents rating inflation
- Ensures sustained quality required

### 2. Easier to Lose
- Negative ratings take 100% of decrease
- Quick feedback for poor work
- Citizens have real impact

### 3. Fair Treatment
- Natural disasters can be forgiven
- Not all negative events are contractor's fault
- Government verifies disaster claims

### 4. Work Longevity Matters
- Roads must last expected lifespan (e.g., 10 years)
- Early failures penalized heavily
- Encourages durable construction

### 5. Proof-Based Accountability
- Negative ratings require proof
- Prevents malicious or false complaints
- Photos/videos provide evidence

---

## 📝 Files Created/Updated

### Database
- ✅ `prisma/schema.prisma` - Complete updated schema

### API Routes
- ✅ `src/app/api/qualification/route.ts` - Qualification management
- ✅ `src/app/api/citizen-ratings/route.ts` - Citizen rating system
- ✅ `src/app/api/issue-reports/route.ts` - Issue reporting & forgiveness

### Documentation
- ✅ `ENHANCED_RATING_SYSTEM.md` - Detailed feature documentation
- ✅ `INTEGRATION_GUIDE.md` - AI & Blockchain integration
- ✅ `QUICK_START.md` - Getting started guide

---

## 🚀 Next Steps for Hackathon Demo

### Demo Scenario 1: Contractor Qualification
1. Register new contractor
2. Submit qualification form
3. Show initial rating calculation
4. Explain rating thresholds

### Demo Scenario 2: Smart Rating in Action
1. Show contractor with 4.5 rating
2. Citizen rates work 5.0
3. Rating increases by only 0.25 (50% of 0.5)
4. Explain: "Harder to gain points"

### Demo Scenario 3: Natural Disaster Forgiveness
1. Simulate landslide damage
2. Citizen reports as Natural Disaster
3. Government approves forgiveness
4. Rating unchanged - show fairness

### Demo Scenario 4: Contractor Fault Penalty
1. Simulate drainage issue
2. Citizen reports as Contractor Fault
3. Rating drops significantly
4. Contractor can only bid on small contracts
5. Explain: "Easier to lose points"

### Demo Scenario 5: Work Longevity
1. Show 10-year road contract
2. Explain expected lifespan tracking
3. Demonstrate early failure penalty
4. Show how this incentivizes quality work

---

## ✨ Summary

All your requested features have been implemented:

✅ **Contractor qualification system** with certificates, skills, experience
✅ **Initial rating calculation** based on qualifications
✅ **Minimum rating 3.8** to operate as contractor
✅ **Smart rating logic** - harder to gain, easier to lose
✅ **Citizen rating system** with proof requirements for negative ratings
✅ **Work longevity tracking** (e.g., 10 years for roads)
✅ **Early failure penalties** (double penalty before 50% of expected lifespan)
✅ **Issue reporting** with two categories
✅ **Natural disaster forgiveness** - verified disasters don't affect rating
✅ **Contractor fault tracking** - poor drainage, poor materials, etc.
✅ **Material details tracking** - pricing transparency
✅ **Landslide vs drainage distinction** - fair treatment system

The system now properly incentivizes high-quality construction while being fair about uncontrollable factors like natural disasters!

---

**Good luck with your hackathon! 🎉**

For detailed technical documentation, see:
- `ENHANCED_RATING_SYSTEM.md` - Complete feature documentation
- `prisma/schema.prisma` - Database schema
- API endpoints documentation above - For integration details
