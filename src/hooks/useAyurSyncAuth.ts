import { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  collection 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, handleFirestoreError, OperationType } from '../firebase';

export interface UserProfile {
  account_creation_timestamp: any;
  account_status: 'incomplete_onboarding' | 'active';
  display_name?: string;
  age?: number;
  gender?: string;
  profile_pic_url?: string;
  onboarding_source?: string;
}

export function useAyurSyncAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. auth_status_watcher: Active listener for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            // auth_skeleton_init: Crucial Step
            // Create blank document before any other data is collected
            const skeletonProfile = {
              account_creation_timestamp: serverTimestamp(),
              account_status: 'incomplete_onboarding'
            };
            await setDoc(userRef, skeletonProfile);
            
            // Re-fetch to get the actual timestamp (optional, but good for local state)
            const newSnap = await getDoc(userRef);
            setProfile(newSnap.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // auth_google: Implement Google Sign-In
  const auth_google = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  // Profile Pic: firebase_storage_upload
  const upload_profile_pic = async (file: File): Promise<string> => {
    if (!user) throw new Error("No user logged in");
    
    try {
      const timestamp = Date.now();
      // Naming convention: users/{uid}/profile_pic/current.jpg (or timestamped)
      const storageRef = ref(storage, `users/${user.uid}/profile_pic/${timestamp}_${file.name}`);
      
      await uploadBytes(storageRef, file);
      const publicURL = await getDownloadURL(storageRef);
      
      // Save URL to Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { profile_pic_url: publicURL });
      
      // Update local state
      setProfile(prev => prev ? { ...prev, profile_pic_url: publicURL } : null);
      
      return publicURL;
    } catch (error) {
      console.error("Profile Pic Upload Error:", error);
      throw error;
    }
  };

  // save_core_profile: Save basic info directly into the users document
  const save_core_profile = async (data: { display_name: string; age: number; gender: string; onboarding_source: string }) => {
    if (!user) throw new Error("No user logged in");
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, data);
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // save_health_status: Instantiate health_metadata sub-collection and finalize onboarding
  const save_health_status = async (hasAcuteOrChronicConditions: boolean) => {
    if (!user) throw new Error("No user logged in");
    
    try {
      if (hasAcuteOrChronicConditions) {
        // Instantiate health_metadata sub-collection with an active pointer
        const metadataRef = doc(collection(db, 'users', user.uid, 'health_metadata'), 'conditions_pointer');
        await setDoc(metadataRef, { pointer: true });
      }
      
      // Final save: update account_status to 'active'
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { account_status: 'active' });
      
      // Update local state
      setProfile(prev => prev ? { ...prev, account_status: 'active' } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // logout_func: Sign out and flush local state
  const logout_func = async () => {
    try {
      await signOut(auth);
      // Local state is flushed by the onAuthStateChanged listener
      // But we can explicitly clear any other AI model state here if needed
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  };

  // delete_account_hard_rule: Complete privacy compliance
  const delete_account_hard_rule = async () => {
    if (!user) throw new Error("No user logged in");
    
    try {
      // 1. Delete the user from Firebase Auth
      // NOTE: For true GDPR/HIPAA compliance, a Firebase Cloud Function MUST be set up
      // to listen to the 'auth.user.onDelete' event. That Cloud Function should perform
      // a recursive delete on all Firestore collections (users/{uid}/**) and delete all
      // files in Firebase Storage (users/{uid}/**) to leave zero trace.
      await user.delete();
      
      // Local state is flushed by the onAuthStateChanged listener
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Account Deletion Error:", error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    auth_google,
    upload_profile_pic,
    save_core_profile,
    save_health_status,
    logout_func,
    delete_account_hard_rule
  };
}
