import { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  onAuthStateChanged,
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, googleProvider, db, storage } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          
          // Timeout wrapper to prevent hanging if Firestore is not created in console
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000));
          const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            const defaultProfile = { role: 'Common User', bio: '', displayName: currentUser.displayName || '' };
            await Promise.race([setDoc(docRef, defaultProfile, { merge: true }), timeoutPromise]);
            setUserProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Error fetching user profile (Firestore might not be enabled in console):", err);
          setUserProfile({ role: 'Common User', bio: '', displayName: currentUser.displayName || '' });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (!auth) throw new Error("Firebase not configured");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    if (!auth) throw new Error("Firebase not configured");
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    if (!auth) {
        setUser(null);
        return;
    }
    return signOut(auth);
  };

  const resetPassword = async (email) => {
    if (!auth) throw new Error("Firebase not configured");
    return sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not configured");
    return signInWithPopup(auth, googleProvider);
  };

  const updateDisplayName = async (name) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: name });
    // Manually update the state to trigger re-renders immediately
    setUser({ ...auth.currentUser, displayName: name });
  };

  const updateProfileData = async (data, imageFile, explicitAvatarUrl = null) => {
    if (!auth.currentUser) return;
    
    // Timeout wrapper
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Storage not enabled. Please enable Storage in Firebase Console, or use a predefined theme avatar.')), 10000));
    
    let photoURL = auth.currentUser.photoURL;
    
    if (explicitAvatarUrl) {
      photoURL = explicitAvatarUrl;
    } else if (imageFile) {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}_${Date.now()}`);
      const snapshot = await Promise.race([uploadBytes(storageRef, imageFile), timeoutPromise]);
      photoURL = await Promise.race([getDownloadURL(snapshot.ref), timeoutPromise]);
    }
    
    const authUpdates = { displayName: data.displayName };
    if (photoURL) authUpdates.photoURL = photoURL;
    
    await updateProfile(auth.currentUser, authUpdates);
    
    const docRef = doc(db, 'users', auth.currentUser.uid);
    const firestoreData = { 
      role: data.role || 'Common User', 
      bio: data.bio || '',
      displayName: data.displayName
    };
    if (photoURL) {
      firestoreData.photoURL = photoURL;
    }
    await Promise.race([setDoc(docRef, firestoreData, { merge: true }), timeoutPromise]);
    
    setUser({ ...auth.currentUser, ...authUpdates });
    setUserProfile((prev) => ({ ...prev, ...firestoreData }));
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, signup, logout, resetPassword, loginWithGoogle, updateDisplayName, updateProfileData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
