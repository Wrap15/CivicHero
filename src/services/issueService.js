import { db, isMockMode, storage } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  getIssues, 
  saveIssue, 
  updateIssueInDB, 
  getComments, 
  saveComment, 
  getVotes, 
  saveVote, 
  getNotifications, 
  markNotificationsAsRead,
  addNotification,
  updateUserProfile,
  awardAchievement,
  getLocalCollection,
  setLocalCollection
} from './mockDataService';

export const issueService = {
  // Get all issues
  getAllIssues: async () => {
    if (isMockMode) {
      return getIssues();
    } else {
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  },

  // Get issue by ID
  getIssueById: async (issueId) => {
    if (isMockMode) {
      const issues = getIssues();
      return issues.find(i => i.id === issueId) || null;
    } else {
      const docRef = doc(db, 'issues', issueId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    }
  },

  // Upload File (Mock simply returns a base64 or placeholder URL, Real uploads to Firebase Storage)
  uploadFile: async (file, path = 'issues') => {
    if (!file) return '';
    
    if (isMockMode) {
      // Simulate slow network upload
      await new Promise(resolve => setTimeout(resolve, 800));
      // For mock, if it's an audio blob we return a mock audio file url
      if (file.type && file.type.startsWith('audio/')) {
        return 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';
      }
      // If it's a file, convert to object URL or return unsplash placeholder
      try {
        return URL.createObjectURL(file);
      } catch (e) {
        return 'https://images.unsplash.com/photo-1599740831146-80e6f87ad60b?auto=format&fit=crop&w=800&q=80';
      }
    } else {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name || 'uploaded_file'}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    }
  },

  // Submit new issue
  createIssue: async (issueData, reporterUser) => {
    const isAnonymous = issueData.isAnonymous || false;
    const finalReporterId = isAnonymous ? null : (reporterUser ? reporterUser.uid : null);
    const finalReporterName = isAnonymous ? 'Anonymous Citizen' : (reporterUser ? reporterUser.fullName : 'Guest');

    // Rule: Auto-verify if citizen has a high trust score (>= 85) and is not anonymous
    const isTrusted = reporterUser && !isAnonymous && (reporterUser.trustScore >= 85);
    const initialStatus = isTrusted ? 'citizen_verified' : 'reported';

    const rawIssue = {
      title: issueData.title,
      description: issueData.description,
      category: issueData.category || 'Others',
      status: initialStatus,
      severity: issueData.severity || 'medium',
      urgency: issueData.urgency || 'medium',
      location: {
        latitude: Number(issueData.latitude) || 40.7128,
        longitude: Number(issueData.longitude) || -74.0060,
      },
      address: issueData.address || 'Unknown Location',
      imageUrl: issueData.imageUrl || '',
      videoUrl: issueData.videoUrl || '',
      voiceUrl: issueData.voiceUrl || '',
      isAnonymous,
      reporterId: finalReporterId,
      reporterName: finalReporterName,
      aiConfidence: issueData.aiConfidence || 0.9,
      aiAnalysis: issueData.aiAnalysis || {
        isSpam: false,
        severity: issueData.severity || 'medium',
        confidence: 0.9,
        repairRecommendation: 'Muncipal review and scheduling required.',
        estimatedResolutionDays: 5,
      },
      verifiedByTrustScore: isTrusted,
      reporterTrustScore: reporterUser ? (reporterUser.trustScore || 70) : 70,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isMockMode) {
      const id = 'issue_' + Math.random().toString(36).substr(2, 9);
      const newIssue = { id, ...rawIssue };
      saveIssue(newIssue);

      // Reward XP to reporter if not anonymous and valid
      if (reporterUser && !isAnonymous) {
        updateUserProfile(reporterUser.uid, { xpOffset: 50 }); // +50 XP for reporting
        awardAchievement(reporterUser.uid, 'Pothole Patrol', 'Reported your first infrastructure defect.', 100);
      }

      return newIssue;
    } else {
      const docRef = await addDoc(collection(db, 'issues'), rawIssue);
      
      // Update XP for reporter in Firestore
      if (reporterUser && !isAnonymous) {
        const userRef = doc(db, 'users', reporterUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentXp = userSnap.data().xp || 0;
          await updateDoc(userRef, {
            xp: currentXp + 50,
            level: Math.max(1, Math.floor((currentXp + 50) / 200) + 1)
          });
        }
      }

      return { id: docRef.id, ...rawIssue };
    }
  },

  // Update issue status
  updateIssueStatus: async (issueId, status, notes = '', imageUrl = '', workerId = '', workerName = '') => {
    const updates = { 
      status,
      updatedAt: new Date().toISOString()
    };

    if (isMockMode) {
      const updated = updateIssueInDB(issueId, updates);
      
      // If assignment details are specified
      if (status === 'assigned') {
        const allAss = getLocalCollection('civichero_mock_assignments') || [];
        allAss.push({
          id: 'ass_' + Math.random().toString(36).substr(2, 9),
          issueId,
          department: updated.category,
          assignedWorkerId: workerId || 'user_official_1',
          assignedWorkerName: workerName || 'Officer Rogers',
          assignedAt: new Date().toISOString(),
        });
        setLocalCollection('civichero_mock_assignments', allAss);

        // Notify reporter
        if (updated.reporterId) {
          addNotification({
            userId: updated.reporterId,
            title: 'Issue Assigned',
            message: `Your reported issue "${updated.title}" has been assigned for repair.`,
            type: 'assignment',
            issueId,
          });
        }
      }

      if (status === 'resolved') {
        // Update assignment resolved status
        const allAss = getLocalCollection('civichero_mock_assignments') || [];
        const idx = allAss.findIndex(a => a.issueId === issueId && !a.resolvedAt);
        if (idx !== -1) {
          allAss[idx].resolvedAt = new Date().toISOString();
          allAss[idx].resolutionNotes = notes;
          allAss[idx].resolutionImageUrl = imageUrl;
          setLocalCollection('civichero_mock_assignments', allAss);
        }

        // Notify reporter
        if (updated.reporterId) {
          addNotification({
            userId: updated.reporterId,
            title: 'Issue Resolved! 🎉',
            message: `Congratulations! Your reported issue "${updated.title}" has been marked as resolved. Details: ${notes}`,
            type: 'status_change',
            issueId,
          });
          
          // Reward XP for verification validation
          updateUserProfile(updated.reporterId, { xpOffset: 100 }); // +100 XP when issue is resolved
          awardAchievement(updated.reporterId, 'Active Citizen', 'Had a reported issue successfully resolved by the city.', 150);
        }
      }

      return updated;
    } else {
      const docRef = doc(db, 'issues', issueId);
      await updateDoc(docRef, updates);
      
      const docSnap = await getDoc(docRef);
      const updated = { id: issueId, ...docSnap.data() };

      if (status === 'assigned') {
        await addDoc(collection(db, 'assignments'), {
          issueId,
          department: updated.category,
          assignedWorkerId: workerId || 'official_placeholder',
          assignedWorkerName: workerName || 'Official Agent',
          assignedAt: new Date().toISOString(),
        });

        if (updated.reporterId) {
          await addDoc(collection(db, 'notifications'), {
            userId: updated.reporterId,
            title: 'Issue Assigned',
            message: `Your reported issue "${updated.title}" has been assigned for repair.`,
            isRead: false,
            type: 'assignment',
            issueId,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (status === 'resolved') {
        if (updated.reporterId) {
          await addDoc(collection(db, 'notifications'), {
            userId: updated.reporterId,
            title: 'Issue Resolved! 🎉',
            message: `Your reported issue "${updated.title}" has been resolved. Notes: ${notes}`,
            isRead: false,
            type: 'status_change',
            issueId,
            createdAt: new Date().toISOString(),
          });
          
          const userRef = doc(db, 'users', updated.reporterId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const currentXp = userSnap.data().xp || 0;
            await updateDoc(userRef, { xp: currentXp + 100 });
          }
        }
      }

      return updated;
    }
  },

  // Get comments
  getComments: async (issueId) => {
    if (isMockMode) {
      return getComments(issueId);
    } else {
      const q = query(
        collection(db, 'issues', issueId, 'comments'), 
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const comments = [];
      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      return comments;
    }
  },

  // Add Comment
  addComment: async (issueId, content, user) => {
    const rawComment = {
      userId: user.uid,
      userName: user.fullName,
      userAvatar: user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest',
      content,
      createdAt: new Date().toISOString(),
    };

    if (isMockMode) {
      const id = 'comment_' + Math.random().toString(36).substr(2, 9);
      const comment = { id, ...rawComment };
      saveComment(issueId, comment);
      return comment;
    } else {
      const commentsColl = collection(db, 'issues', issueId, 'comments');
      const docRef = await addDoc(commentsColl, rawComment);
      return { id: docRef.id, ...rawComment };
    }
  },

  // Get votes/validations
  getVotes: async (issueId) => {
    if (isMockMode) {
      return getVotes(issueId);
    } else {
      const q = collection(db, 'issues', issueId, 'votes');
      const querySnapshot = await getDocs(q);
      const votes = [];
      querySnapshot.forEach((doc) => {
        votes.push({ id: doc.id, ...doc.data() });
      });
      return votes;
    }
  },

  // Vote on issue
  castVote: async (issueId, user, voteType, comment = '', evidenceUrl = '') => {
    const rawVote = {
      userId: user.uid,
      userName: user.fullName,
      vote: voteType, // 'confirm' | 'reject'
      comment,
      evidenceUrl,
      createdAt: new Date().toISOString(),
    };

    if (isMockMode) {
      saveVote(issueId, rawVote);

      // Reward XP for voting
      updateUserProfile(user.uid, { 
        xpOffset: 15, // +15 XP for voting
        verifiedScore: (user.verifiedScore || 0) + 1
      });
      
      awardAchievement(user.uid, 'Community Sentry', 'Helped verify infrastructure problems in your neighborhood.', 80);

      return rawVote;
    } else {
      const voteRef = doc(db, 'issues', issueId, 'votes', user.uid);
      await setDoc(voteRef, rawVote);

      // Add vote XP in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentXp = userSnap.data().xp || 0;
        const currentVer = userSnap.data().verifiedScore || 0;
        await updateDoc(userRef, { 
          xp: currentXp + 15,
          verifiedScore: currentVer + 1,
          level: Math.max(1, Math.floor((currentXp + 15) / 200) + 1)
        });
      }

      // Check if we need to promote status to citizen_verified
      const votesSnap = await getDocs(collection(db, 'issues', issueId, 'votes'));
      let confCount = 0;
      votesSnap.forEach(d => {
        if (d.data().vote === 'confirm') confCount++;
      });

      if (confCount >= 2) {
        const issueRef = doc(db, 'issues', issueId);
        const issueSnap = await getDoc(issueRef);
        if (issueSnap.exists() && issueSnap.data().status === 'reported') {
          await updateDoc(issueRef, { status: 'citizen_verified' });
        }
      }

      return rawVote;
    }
  },

  // Fetch notifications for user
  getUserNotifications: async (userId) => {
    if (isMockMode) {
      return getNotifications(userId);
    } else {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  },

  // Mark user notifications read
  clearNotifications: async (userId) => {
    if (isMockMode) {
      markNotificationsAsRead(userId);
      return true;
    } else {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId), 
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (d) => {
        await updateDoc(doc(db, 'notifications', d.id), { isRead: true });
      });
      return true;
    }
  },

  // Check for unresolved duplicate reports in a 100-meter radius using Haversine formula
  findDuplicate: async (latitude, longitude, category) => {
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Earth radius in meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // distance in meters
    };

    const targetLat = Number(latitude);
    const targetLng = Number(longitude);

    if (isMockMode) {
      const issues = getIssues();
      const match = issues.find(issue => {
        if (issue.status === 'resolved' || issue.status === 'closed') return false;
        if (issue.category !== category) return false;
        
        const dist = getDistance(
          targetLat, 
          targetLng, 
          Number(issue.location.latitude), 
          Number(issue.location.longitude)
        );
        return dist <= 100;
      });

      if (match) {
        const distanceMeters = Math.round(getDistance(targetLat, targetLng, Number(match.location.latitude), Number(match.location.longitude)));
        return { ...match, distanceMeters };
      }
      return null;
    } else {
      const q = query(
        collection(db, 'issues'),
        where('category', '==', category)
      );
      const querySnapshot = await getDocs(q);
      let match = null;
      
      querySnapshot.forEach((doc) => {
        const issue = { id: doc.id, ...doc.data() };
        if (issue.status === 'resolved' || issue.status === 'closed') return;
        
        const dist = getDistance(
          targetLat, 
          targetLng, 
          Number(issue.location.latitude), 
          Number(issue.location.longitude)
        );
        if (dist <= 100) {
          match = { ...issue, distanceMeters: Math.round(dist) };
        }
      });
      return match;
    }
  },

  // Live real-time observer for all issues (production + mock fallback)
  subscribeToIssues: (callback) => {
    if (isMockMode) {
      const handleUpdate = () => {
        callback(getIssues());
      };
      window.addEventListener('mock_issues_updated', handleUpdate);
      // Trigger initial loading
      callback(getIssues());
      return () => {
        window.removeEventListener('mock_issues_updated', handleUpdate);
      };
    } else {
      const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        callback(list);
      });
      return unsubscribe;
    }
  },

  // Live real-time observer for comments of a specific issue
  subscribeToComments: (issueId, callback) => {
    if (isMockMode) {
      const handleUpdate = (e) => {
        if (e.detail && e.detail.issueId === issueId) {
          callback(getComments(issueId));
        }
      };
      window.addEventListener('mock_comments_updated', handleUpdate);
      // Trigger initial loading
      callback(getComments(issueId));
      return () => {
        window.removeEventListener('mock_comments_updated', handleUpdate);
      };
    } else {
      const q = query(
        collection(db, 'comments'),
        where('issueId', '==', issueId),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        callback(list);
      });
      return unsubscribe;
    }
  }
};
