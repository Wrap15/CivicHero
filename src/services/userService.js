import { auth, db, isMockMode } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  initializeMockDB, 
  getUsers, 
  updateUserProfile, 
  getAchievements, 
  awardAchievement 
} from './mockDataService';

// Initialize mock DB on load if in mock mode
if (typeof window !== 'undefined' && isMockMode) {
  initializeMockDB();
}

const ACTIVE_USER_KEY = 'civichero_active_user';

export const userService = {
  // Check active user (synchronous or callback-based)
  getCurrentUser: async () => {
    if (isMockMode) {
      if (typeof window === 'undefined') return null;
      const userStr = sessionStorage.getItem(ACTIVE_USER_KEY) || localStorage.getItem(ACTIVE_USER_KEY);
      if (!userStr) return null;
      const parsed = JSON.parse(userStr);
      // Fetch latest profile info from local storage DB
      const users = getUsers();
      const latest = users.find(u => u.uid === parsed.uid);
      return latest || parsed;
    } else {
      const fbUser = auth.currentUser;
      if (!fbUser) return null;
      const docRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid: fbUser.uid, email: fbUser.email, ...docSnap.data() };
      }
      return { uid: fbUser.uid, email: fbUser.email, role: 'citizen' };
    }
  },

  // Auth Observer
  onAuthChange: (callback) => {
    if (isMockMode) {
      // Simulate auth state change
      const checkUser = async () => {
        const user = await userService.getCurrentUser();
        callback(user);
      };
      checkUser();
      
      // Listen to storage events to update auth across tabs
      if (typeof window !== 'undefined') {
        const handler = () => checkUser();
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
      }
      return () => {};
    } else {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            callback({ uid: fbUser.uid, email: fbUser.email, ...docSnap.data() });
          } else {
            callback({ uid: fbUser.uid, email: fbUser.email, role: 'citizen' });
          }
        } else {
          callback(null);
        }
      });
    }
  },

  // Sign In
  signIn: async (email, password) => {
    if (isMockMode) {
      const users = getUsers();
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        throw new Error('User not found. Try: citizen@civichero.org, official@civichero.org, or admin@civichero.org.');
      }
      
      // Compare against user's actual stored password, fallback to 'password123' for pre-seeded profiles
      const expectedPassword = found.password || 'password123';
      if (password !== expectedPassword) {
        throw new Error('Incorrect password. Please verify your credentials.');
      }

      sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(found));
      return found;
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const docRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid: fbUser.uid, email: fbUser.email, ...docSnap.data() };
      }
      return { uid: fbUser.uid, email: fbUser.email, role: 'citizen' };
    }
  },

  // Sign In with Google
  signInWithGoogle: async () => {
    if (isMockMode) {
      // Prompt user to enter their name to simulate Google SSO
      let simulatedName = '';
      if (typeof window !== 'undefined') {
        simulatedName = window.prompt('🔑 [Simulated Google SSO]\n\nEnter your name to log in with Google:', 'Jane Doe');
      }
      
      if (!simulatedName) {
        throw new Error('Google Sign-In cancelled.');
      }

      // Generate a mock profile for this name
      const simulatedEmail = `${simulatedName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
      const users = getUsers();
      
      // Check if this simulated user already exists in mock users database
      let found = users.find(u => u.email.toLowerCase() === simulatedEmail.toLowerCase());
      
      if (!found) {
        found = {
          uid: 'user_google_' + Math.random().toString(36).substr(2, 9),
          email: simulatedEmail,
          fullName: simulatedName,
          role: 'citizen',
          phone: '',
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(simulatedEmail)}`,
          xp: 0,
          level: 1,
          verifiedScore: 0,
          trustScore: 70,
          createdAt: new Date().toISOString(),
        };
        users.push(found);
        localStorage.setItem('civichero_mock_users', JSON.stringify(users));
      }

      sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(found));
      return found;
    } else {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const fbUser = userCredential.user;
      
      const docRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { uid: fbUser.uid, email: fbUser.email, ...docSnap.data() };
      } else {
        // Create new user profile for first-time Google sign-ins
        const profileData = {
          fullName: fbUser.displayName || 'Google Citizen',
          role: 'citizen',
          email: fbUser.email,
          phone: fbUser.phoneNumber || '',
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.email)}`,
          xp: 0,
          level: 1,
          verifiedScore: 0,
          trustScore: 70,
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, profileData);
        return { uid: fbUser.uid, ...profileData };
      }
    }
  },

  // Sign Up
  signUp: async (email, password, fullName, role = 'citizen') => {
    if (isMockMode) {
      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered.');
      }
      const newUid = 'user_' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        uid: newUid,
        email,
        fullName,
        role,
        phone: '',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        xp: 0,
        level: 1,
        verifiedScore: 0,
        trustScore: 70,
        password, // Store password in database
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('civichero_mock_users', JSON.stringify(users));
      
      // Auto sign in
      sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(newUser));
      
      // Award first reporting setup achievement
      awardAchievement(newUid, 'Civic Recruit', 'Successfully registered on the CivicHero platform.', 50);
      
      return newUser;
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      
      const profileData = {
        fullName,
        role,
        email,
        phone: '',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        xp: 0,
        level: 1,
        verifiedScore: 0,
        trustScore: 70,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', fbUser.uid), profileData);
      return { uid: fbUser.uid, ...profileData };
    }
  },

  // Sign Out
  signOut: async () => {
    if (isMockMode) {
      sessionStorage.removeItem(ACTIVE_USER_KEY);
      localStorage.removeItem(ACTIVE_USER_KEY);
      // Dispatch storage event to alert other context listeners
      window.dispatchEvent(new Event('storage'));
      return true;
    } else {
      await firebaseSignOut(auth);
      return true;
    }
  },

  // Update Profile Info
  updateProfile: async (uid, fields) => {
    if (isMockMode) {
      const updated = updateUserProfile(uid, fields);
      // Update session storage if active user is edited
      const activeStr = sessionStorage.getItem(ACTIVE_USER_KEY);
      if (activeStr) {
        const active = JSON.parse(activeStr);
        if (active.uid === uid) {
          sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(updated));
        }
      }
      return updated;
    } else {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, fields);
      return { uid, ...fields };
    }
  },

  // Get Leaderboard Data
  getLeaderboard: async () => {
    if (isMockMode) {
      const users = getUsers();
      // Only rank citizens
      const citizens = users.filter(u => u.role === 'citizen');
      return citizens.sort((a, b) => b.xp - a.xp).slice(0, 10);
    } else {
      const q = query(
        collection(db, 'users'), 
        orderBy('xp', 'desc'), 
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ uid: doc.id, ...doc.data() });
      });
      return list;
    }
  },

  // Get user achievements
  getAchievements: async (uid) => {
    if (isMockMode) {
      return getAchievements(uid);
    } else {
      const querySnapshot = await getDocs(collection(db, 'users', uid, 'achievements'));
      const achievements = [];
      querySnapshot.forEach((doc) => {
        achievements.push({ id: doc.id, ...doc.data() });
      });
      return achievements;
    }
  },

  // Award user achievements
  awardBadge: async (uid, badgeName, description, xpReward) => {
    if (isMockMode) {
      return awardAchievement(uid, badgeName, description, xpReward);
    } else {
      // In firestore: check if exists
      const docRef = doc(db, 'users', uid, 'achievements', badgeName);
      const snap = await getDoc(docRef);
      if (snap.exists()) return null; // already earned

      const achData = {
        badgeName,
        description,
        xpReward,
        earnedAt: new Date().toISOString(),
      };
      await setDoc(docRef, achData);
      
      // Update XP
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentXp = userSnap.data().xp || 0;
        const newXp = currentXp + xpReward;
        const newLevel = Math.max(1, Math.floor(newXp / 200) + 1);
        await updateDoc(userRef, { xp: newXp, level: newLevel });
      }

      // Add Notification
      const notifRef = doc(collection(db, 'notifications'));
      await setDoc(notifRef, {
        userId: uid,
        title: 'Achievement Unlocked!',
        message: `You earned the "${badgeName}" badge (+${xpReward} XP)`,
        isRead: false,
        type: 'reward',
        issueId: '',
        createdAt: new Date().toISOString(),
      });

      return { id: badgeName, ...achData };
    }
  }
};
