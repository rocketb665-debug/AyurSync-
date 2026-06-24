import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface UserHealthContext {
  profile: any;
  health_profile: any;
  recent_medical_records: any[];
  recent_daily_metrics: any[];
}

/**
 * Aggregates user data from Firestore into a single JSON object optimized for LLM token limits.
 * Prioritizes recent reports over old ones.
 * 
 * @param uid The user's Firebase Auth UID
 * @returns A promise that resolves to the aggregated health context
 */
export async function getUserHealthContext(uid: string): Promise<UserHealthContext> {
  const context: UserHealthContext = {
    profile: null,
    health_profile: null,
    recent_medical_records: [],
    recent_daily_metrics: []
  };

  try {
    // 1. Fetch User Profile
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      context.profile = userSnap.data();
    }

    // 2. Fetch Static Health Profile (AI Brain)
    // Assuming there's only one active profile document per user, or we just get the first one
    const healthProfileRef = collection(db, 'users', uid, 'health_profile');
    const healthProfileQuery = query(healthProfileRef, limit(1));
    const healthProfileSnap = await getDocs(healthProfileQuery);
    if (!healthProfileSnap.empty) {
      context.health_profile = healthProfileSnap.docs[0].data();
    }

    // 3. Fetch Recent Medical Records (limit to 5 most recent to save tokens)
    const medicalRecordsRef = collection(db, 'medical_records');
    // Requires Composite Index on uid (ASC) and timestamp (DESC)
    const medicalRecordsQuery = query(
      medicalRecordsRef,
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const medicalRecordsSnap = await getDocs(medicalRecordsQuery);
    context.recent_medical_records = medicalRecordsSnap.docs.map(doc => {
      const data = doc.data();
      // Omit raw_image_url to save tokens, AI only needs ocr_summary
      return {
        report_type: data.report_type,
        ocr_summary: data.ocr_summary,
        timestamp: data.timestamp,
        severity_score: data.severity_score
      };
    });

    // 4. Fetch Recent Daily Metrics (limit to 10 most recent)
    const dailyMetricsRef = collection(db, 'daily_metrics');
    // Requires Composite Index on uid (ASC) and timestamp (DESC)
    const dailyMetricsQuery = query(
      dailyMetricsRef,
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const dailyMetricsSnap = await getDocs(dailyMetricsQuery);
    context.recent_daily_metrics = dailyMetricsSnap.docs.map(doc => doc.data());

    return context;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `Aggregating health context for ${uid}`);
    throw error;
  }
}
