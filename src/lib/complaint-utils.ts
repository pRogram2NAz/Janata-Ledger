// lib/complaint-utils.ts

// Mock implementation - replace with real EXIF library
// npm install exif-parser (recommended)
// import ExifParser from 'exif-parser';

// ============================================================================
// TYPES
// ============================================================================

export type ComplaintFlag = 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED';

export type GPSData = {
  latitude: number;
  longitude: number;
  timestamp?: Date;
};

export type LocationVerificationResult = {
  isValid: boolean;
  distance: number;
  withinRange: boolean;
};

export type ComplaintClassification = {
  type: string;
  confidence: number;
};

export type FlagDetermination = {
  flag: ComplaintFlag;
  reasons: string[];
};

export type ComplaintSubmissionResult = {
  success: boolean;
  complaintId: string;
  sentiment: number;
  type: string;
  rating: number;
  hasGps: boolean;
  distance: number | null;
  locationVerified: boolean;
  flag: ComplaintFlag;
  flagReason: string;
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_PROJECT_LOCATION = {
  latitude: 27.7172, // Kathmandu, Nepal
  longitude: 85.324,
};

export const MAX_DISTANCE_METERS = 1000; // 1km radius

export const COMPLAINT_TYPES = [
  'QUALITY_ISSUE',
  'SAFETY_CONCERN',
  'DELAY',
  'COMMUNICATION',
  'COST_OVERRUN',
  'MATERIAL_DEFECT',
  'WORKMANSHIP',
  'OTHER',
] as const;

export type ComplaintType = typeof COMPLAINT_TYPES[number];

// Sentiment thresholds
const SENTIMENT_VERY_NEGATIVE = -0.6;
const SENTIMENT_NEGATIVE = -0.3;
const SENTIMENT_NEUTRAL_LOW = -0.1;
const SENTIMENT_NEUTRAL_HIGH = 0.1;
const SENTIMENT_POSITIVE = 0.3;

// Rating adjustment factors
const RATING_IMPACT_VERY_NEGATIVE = -0.5;
const RATING_IMPACT_NEGATIVE = -0.3;
const RATING_IMPACT_NEUTRAL = -0.1;
const RATING_IMPACT_POSITIVE = 0.05;
const RATING_DECAY_FACTOR = 0.9; // Exponential moving average

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

/**
 * Analyze sentiment of complaint text
 * Returns a score from -1 (very negative) to +1 (very positive)
 */
export async function analyzeSentiment(text: string): Promise<number> {
  const lowerText = text.toLowerCase();
  
  // Negative keywords
  const negativeKeywords = [
    'terrible', 'horrible', 'awful', 'bad', 'poor', 'worst', 'unacceptable',
    'disappointing', 'failed', 'broken', 'defective', 'dangerous', 'unsafe',
    'unprofessional', 'incompetent', 'negligent', 'delayed', 'late', 'slow',
    'expensive', 'overpriced', 'waste', 'fraud', 'scam', 'cheated', 'lied',
    'never', 'hate', 'angry', 'furious', 'disgusted', 'appalled', 'shocked',
    'cheap', 'shoddy', 'substandard', 'inferior', 'damage', 'damaged',
  ];

  // Very negative phrases
  const veryNegativePhrases = [
    'complete disaster', 'total failure', 'absolute worst', 'never again',
    'stay away', 'do not hire', 'avoid at all costs', 'waste of money',
    'serious safety', 'code violation', 'illegal', 'not up to code',
  ];

  // Positive keywords (complaints can have positive aspects)
  const positiveKeywords = [
    'good', 'great', 'excellent', 'professional', 'quality', 'satisfied',
    'happy', 'pleased', 'resolved', 'fixed', 'improved', 'better',
  ];

  // Intensifiers
  const intensifiers = ['very', 'extremely', 'absolutely', 'totally', 'completely'];

  let score = 0;
  let wordCount = 0;

  // Check for very negative phrases
  for (const phrase of veryNegativePhrases) {
    if (lowerText.includes(phrase)) {
      score -= 0.3;
    }
  }

  // Split into words
  const words = lowerText.split(/\s+/);
  wordCount = words.length;

  // Analyze words
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    // Check if word is intensified
    const isIntensified = i > 0 && intensifiers.includes(words[i - 1]);
    const multiplier = isIntensified ? 1.5 : 1.0;

    // Check negative keywords
    if (negativeKeywords.includes(word)) {
      score -= 0.1 * multiplier;
    }

    // Check positive keywords
    if (positiveKeywords.includes(word)) {
      score += 0.1 * multiplier;
    }

    // Check for negations (not good, not bad)
    if (word === 'not' || word === "don't" || word === "didn't") {
      if (positiveKeywords.includes(nextWord)) {
        score -= 0.1;
      } else if (negativeKeywords.includes(nextWord)) {
        score += 0.05;
      }
    }
  }

  // Normalize by word count
  if (wordCount > 0) {
    score = score / Math.sqrt(wordCount);
  }

  // Clamp between -1 and 1
  score = Math.max(-1, Math.min(1, score));

  // Complaints are generally negative, so bias slightly negative
  score = score - 0.2;
  score = Math.max(-1, Math.min(1, score));

  return score;
}

// ============================================================================
// COMPLAINT CLASSIFICATION
// ============================================================================

/**
 * Classify complaint into categories using keyword matching
 */
export async function classifyComplaint(text: string): Promise<ComplaintClassification> {
  const lowerText = text.toLowerCase();

  const classifications: Record<ComplaintType, { keywords: string[]; weight: number }> = {
    QUALITY_ISSUE: {
      keywords: ['quality', 'poor quality', 'substandard', 'inferior', 'defect', 'defective', 'cheap', 'shoddy'],
      weight: 0,
    },
    SAFETY_CONCERN: {
      keywords: ['safety', 'unsafe', 'dangerous', 'hazard', 'risk', 'injury', 'accident', 'code violation'],
      weight: 0,
    },
    DELAY: {
      keywords: ['delay', 'late', 'behind schedule', 'slow', 'waiting', 'overdue', 'deadline', 'timeline'],
      weight: 0,
    },
    COMMUNICATION: {
      keywords: ['communication', 'unresponsive', 'no response', 'ignoring', "doesn't answer", 'no call back', 'unprofessional'],
      weight: 0,
    },
    COST_OVERRUN: {
      keywords: ['cost', 'expensive', 'overpriced', 'budget', 'overcharge', 'money', 'price', 'fee'],
      weight: 0,
    },
    MATERIAL_DEFECT: {
      keywords: ['material', 'materials', 'supplies', 'product', 'equipment', 'broken', 'faulty'],
      weight: 0,
    },
    WORKMANSHIP: {
      keywords: ['workmanship', 'work quality', 'craftsmanship', 'installation', 'construction', 'built', 'finish'],
      weight: 0,
    },
    OTHER: {
      keywords: [],
      weight: 0,
    },
  };

  // Calculate weights based on keyword matches
  for (const [type, config] of Object.entries(classifications)) {
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        config.weight += 1;
        // Extra weight for exact phrase matches
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          config.weight += matches.length * 0.5;
        }
      }
    }
  }

  // Find type with highest weight
  let maxWeight = 0;
  let selectedType: ComplaintType = 'OTHER';

  for (const [type, config] of Object.entries(classifications)) {
    if (config.weight > maxWeight) {
      maxWeight = config.weight;
      selectedType = type as ComplaintType;
    }
  }

  // Calculate confidence (0-1)
  const totalWeight = Object.values(classifications).reduce((sum, c) => sum + c.weight, 0);
  const confidence = totalWeight > 0 ? maxWeight / totalWeight : 0.5;

  return {
    type: selectedType,
    confidence: Math.min(1, confidence),
  };
}

// ============================================================================
// GPS EXTRACTION
// ============================================================================

/**
 * Extract GPS data from image EXIF metadata using exif-parser
 * 
 * MOCK IMPLEMENTATION - Install a real EXIF library:
 * npm install exif-parser
 * or
 * npm install exifreader
 */
export async function extractGpsFromImage(imageBuffer: Buffer): Promise<GPSData | null> {
  try {
    // TODO: Replace with real EXIF parsing
    // Option 1: exif-parser
    // const parser = ExifParser.create(imageBuffer);
    // const result = parser.parse();
    // return { latitude: result.tags.GPSLatitude, longitude: result.tags.GPSLongitude };
    
    // Option 2: exifreader
    // const tags = ExifReader.load(imageBuffer);
    // return { latitude: parseFloat(tags.GPSLatitude.description), ... };
    
    console.warn('GPS extraction not implemented - install exif-parser or exifreader');
    
    // For testing: return null (no GPS data)
    // Or return mock GPS data near project location
    const useMockData = process.env.NODE_ENV === 'development';
    
    if (useMockData) {
      // Mock GPS data near Kathmandu (within 1km of default location)
      return {
        latitude: DEFAULT_PROJECT_LOCATION.latitude + (Math.random() - 0.5) * 0.01,
        longitude: DEFAULT_PROJECT_LOCATION.longitude + (Math.random() - 0.5) * 0.01,
        timestamp: new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting GPS from image:', error);
    return null;
  }
}

// ============================================================================
// LOCATION VERIFICATION
// ============================================================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Verify if photo location is within acceptable range of project location
 */
export function verifyLocation(
  photoLat: number,
  photoLon: number,
  projectLat: number,
  projectLon: number,
  maxDistance: number = MAX_DISTANCE_METERS
): LocationVerificationResult {
  const distance = calculateDistance(photoLat, photoLon, projectLat, projectLon);
  const withinRange = distance <= maxDistance;

  return {
    isValid: withinRange,
    distance,
    withinRange,
  };
}

// ============================================================================
// RATING CALCULATION
// ============================================================================

/**
 * Calculate new rating based on complaint sentiment
 * Uses exponential moving average to give more weight to recent complaints
 */
export function calculateNewRating(currentRating: number, sentiment: number): number {
  let impact = 0;

  // Determine impact based on sentiment
  if (sentiment <= SENTIMENT_VERY_NEGATIVE) {
    impact = RATING_IMPACT_VERY_NEGATIVE;
  } else if (sentiment <= SENTIMENT_NEGATIVE) {
    impact = RATING_IMPACT_NEGATIVE;
  } else if (sentiment <= SENTIMENT_NEUTRAL_LOW) {
    impact = RATING_IMPACT_NEUTRAL;
  } else if (sentiment >= SENTIMENT_POSITIVE) {
    impact = RATING_IMPACT_POSITIVE;
  } else {
    impact = RATING_IMPACT_NEUTRAL * 0.5;
  }

  // Apply exponential moving average
  const newRating = currentRating * RATING_DECAY_FACTOR + impact;

  // Clamp between 0 and 5
  return Math.max(0, Math.min(5, newRating));
}

// ============================================================================
// FLAG DETERMINATION
// ============================================================================

/**
 * Determine complaint flag status based on verification results
 */
export function determineFlag(
  hasGps: boolean,
  locationVerified: boolean,
  distance: number | null
): FlagDetermination {
  const reasons: string[] = [];

  // No GPS data - requires manual review
  if (!hasGps) {
    reasons.push('No GPS data in image');
    return { flag: 'PENDING_REVIEW', reasons };
  }

  // GPS exists but location is too far
  if (!locationVerified) {
    reasons.push(`Location is ${distance?.toFixed(0)}m from project site (max: ${MAX_DISTANCE_METERS}m)`);
    return { flag: 'REJECTED', reasons };
  }

  // All checks passed
  return { flag: 'VERIFIED', reasons: [] };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate GPS coordinates
 */
export function isValidGPS(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Sanitize text input
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 2000); // Limit length
}

// ============================================================================
// STATISTICS HELPERS
// ============================================================================

/**
 * Calculate complaint statistics for a contractor
 */
export type ComplaintStats = {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  averageSentiment: number;
  mostCommonType: string;
  verificationRate: number;
};

export function calculateComplaintStats(
  complaints: Array<{
    status: string;
    sentimentScore: number;
    complaintType: string;
  }>
): ComplaintStats {
  const total = complaints.length;
  const verified = complaints.filter(c => c.status === 'VERIFIED').length;
  const pending = complaints.filter(c => c.status === 'PENDING_REVIEW').length;
  const rejected = complaints.filter(c => c.status === 'REJECTED').length;

  const averageSentiment = total > 0
    ? complaints.reduce((sum, c) => sum + c.sentimentScore, 0) / total
    : 0;

  // Find most common type
  const typeCounts: Record<string, number> = {};
  complaints.forEach(c => {
    typeCounts[c.complaintType] = (typeCounts[c.complaintType] || 0) + 1;
  });

  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'NONE';
  const verificationRate = total > 0 ? verified / total : 0;

  return {
    total,
    verified,
    pending,
    rejected,
    averageSentiment,
    mostCommonType,
    verificationRate,
  };
}