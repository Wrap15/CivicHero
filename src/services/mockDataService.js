// Local Storage Mock Database Service
const STORAGE_KEYS = {
  USERS: 'civichero_mock_users',
  ISSUES: 'civichero_mock_issues',
  COMMENTS: 'civichero_mock_comments', // Keyed by issueId
  VOTES: 'civichero_mock_votes', // Keyed by issueId
  NOTIFICATIONS: 'civichero_mock_notifications',
  ACHIEVEMENTS: 'civichero_mock_achievements',
  AUDIT_LOGS: 'civichero_mock_audit_logs',
};

// Seed initial data if localStorage is empty
export const initializeMockDB = () => {
  if (typeof window === 'undefined') return;

  // 1. Seed Users
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        uid: 'user_citizen_1',
        email: 'citizen@civichero.org',
        fullName: 'Jane Citizen',
        role: 'citizen',
        phone: '+1 555-0199',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jane',
        xp: 450,
        level: 3,
        verifiedScore: 28,
        trustScore: 92,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        uid: 'user_official_1',
        email: 'official@civichero.org',
        fullName: 'Officer Rogers',
        role: 'official',
        phone: '+1 555-0177',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rogers',
        department: 'Roads & Sanitation',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        uid: 'user_admin_1',
        email: 'admin@civichero.org',
        fullName: 'Admin Chief',
        role: 'admin',
        phone: '+1 555-0100',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Chief',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 2. Seed Issues
  if (!localStorage.getItem(STORAGE_KEYS.ISSUES)) {
    const defaultIssues = [
      {
        id: 'issue_1',
        reporterId: 'user_citizen_1',
        reporterName: 'Jane Citizen',
        title: 'Massive Pothole on Broadway',
        description: 'A deep pothole measuring roughly 3ft wide. Several cars have hit it and it poses a severe danger to motorcycles and cyclists.',
        category: 'Road Damage',
        status: 'reported',
        severity: 'high',
        urgency: 'high',
        location: { latitude: 40.758896, longitude: -73.985130 }, // Times Square
        address: 'Broadway & W 45th St, New York, NY 10036',
        imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        voiceUrl: '',
        isAnonymous: false,
        aiConfidence: 0.94,
        aiAnalysis: {
          isSpam: false,
          detectedCategory: 'Road Damage',
          severity: 'high',
          confidence: 0.94,
          repairRecommendation: 'Patch with hot-mix asphalt compaction immediately.',
          estimatedResolutionDays: 3,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'issue_2',
        reporterId: 'user_citizen_1',
        reporterName: 'Jane Citizen',
        title: 'Broken Traffic Signal near High School',
        description: 'The pedestrian crossing signal is stuck on red, forcing children to run across traffic to get to school.',
        category: 'Traffic Signal Failure',
        status: 'assigned',
        severity: 'critical',
        urgency: 'high',
        location: { latitude: 40.748440, longitude: -73.985664 }, // Empire State Building
        address: '350 5th Ave, New York, NY 10118',
        imageUrl: 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        voiceUrl: '',
        isAnonymous: false,
        aiConfidence: 0.98,
        aiAnalysis: {
          isSpam: false,
          detectedCategory: 'Traffic Signal Failure',
          severity: 'critical',
          confidence: 0.98,
          repairRecommendation: 'Reboot controller node and replace faulty LED module.',
          estimatedResolutionDays: 1,
        },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'issue_3',
        reporterId: 'user_citizen_1',
        reporterName: 'Jane Citizen',
        title: 'Illegal Chemical Dumping in Alleyway',
        description: 'Large blue plastic drums leaking an oily liquid have been left in the alleyway behind the warehouse.',
        category: 'Illegal Dumping',
        status: 'citizen_verified',
        severity: 'high',
        urgency: 'high',
        location: { latitude: 40.7061, longitude: -73.9969 }, // DUMBO
        address: 'Water St, Brooklyn, NY 11201',
        imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        voiceUrl: '',
        isAnonymous: true,
        aiConfidence: 0.89,
        aiAnalysis: {
          isSpam: false,
          detectedCategory: 'Illegal Dumping',
          severity: 'high',
          confidence: 0.89,
          repairRecommendation: 'Deploy hazmat cleanup team to safely contain and dispose of chemicals.',
          estimatedResolutionDays: 2,
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'issue_4',
        reporterId: 'user_citizen_1',
        reporterName: 'Jane Citizen',
        title: 'Overflowing Public Garbage Cans',
        description: 'Trash is piled up 3 feet high around the public bins, blowing into the street and attracting rodents.',
        category: 'Garbage Overflow',
        status: 'resolved',
        severity: 'medium',
        urgency: 'medium',
        location: { latitude: 40.785091, longitude: -73.968285 }, // Central Park
        address: 'Central Park East, New York, NY 10024',
        imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
        videoUrl: '',
        voiceUrl: '',
        isAnonymous: false,
        aiConfidence: 0.96,
        aiAnalysis: {
          isSpam: false,
          detectedCategory: 'Garbage Overflow',
          severity: 'medium',
          confidence: 0.96,
          repairRecommendation: 'Dispatch municipal sanitation truck for emergency collection.',
          estimatedResolutionDays: 1,
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(defaultIssues));
  }

  // 3. Seed Comments
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    const defaultComments = {
      'issue_1': [
        {
          id: 'comment_1',
          userId: 'user_official_1',
          userName: 'Officer Rogers',
          userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rogers',
          content: 'We have dispatched a site evaluator to confirm road conditions and traffic impact.',
          createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]
    };
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(defaultComments));
  }

  // 4. Seed Votes
  if (!localStorage.getItem(STORAGE_KEYS.VOTES)) {
    const defaultVotes = {
      'issue_1': [
        { userId: 'user_citizen_1', userName: 'Jane Citizen', vote: 'confirm', evidenceUrl: '', comment: 'I drive past this every morning, it is extremely deep.', createdAt: new Date().toISOString() }
      ],
      'issue_3': [
        { userId: 'user_citizen_1', userName: 'Jane Citizen', vote: 'confirm', evidenceUrl: '', comment: 'Smells awful, definitely leaking chemicals.', createdAt: new Date().toISOString() }
      ]
    };
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(defaultVotes));
  }

  // 5. Seed Achievements
  if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
    const defaultAchievements = {
      'user_citizen_1': [
        { id: 'ach_1', badgeName: 'Pothole Patrol', description: 'Reported your first infrastructure defect.', xpReward: 100, earnedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'ach_2', badgeName: 'Super Voter', description: 'Helped verify 5 neighborhood problems.', xpReward: 150, earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      ]
    };
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(defaultAchievements));
  }

  // 6. Seed Notifications
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    const defaultNotifications = [
      {
        id: 'notif_1',
        userId: 'user_citizen_1',
        title: 'Issue Assigned',
        message: 'Your report "Broken Traffic Signal near High School" has been assigned to the Roads & Sanitation department.',
        isRead: false,
        type: 'assignment',
        issueId: 'issue_2',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_2',
        userId: 'user_citizen_1',
        title: 'Achievement Unlocked!',
        message: 'Congratulations! You unlocked the "Super Voter" badge and earned 150 XP.',
        isRead: true,
        type: 'reward',
        issueId: '',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
  }

  // 7. Seed Audit Logs
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const defaultAuditLogs = [
      { id: 'log_1', userId: 'user_admin_1', userName: 'Admin Chief', action: 'SYSTEM_STARTUP', details: { message: 'CivicHero mock environment loaded.' }, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(defaultAuditLogs));
  }
};

// Database Getters & Setters
export const getLocalCollection = (key) => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(key)) || [];
};

export const setLocalCollection = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const getIssues = () => getLocalCollection(STORAGE_KEYS.ISSUES);

export const saveIssue = (issue) => {
  const issues = getIssues();
  issues.unshift(issue); // Place newest first
  setLocalCollection(STORAGE_KEYS.ISSUES, issues);
  return issue;
};

export const updateIssueInDB = (issueId, updatedFields) => {
  const issues = getIssues();
  const index = issues.findIndex(i => i.id === issueId);
  if (index !== -1) {
    issues[index] = { ...issues[index], ...updatedFields, updatedAt: new Date().toISOString() };
    setLocalCollection(STORAGE_KEYS.ISSUES, issues);
    return issues[index];
  }
  return null;
};

export const deleteIssueFromDB = (issueId) => {
  const issues = getIssues();
  const filtered = issues.filter(i => i.id !== issueId);
  setLocalCollection(STORAGE_KEYS.ISSUES, filtered);
};

export const getComments = (issueId) => {
  if (typeof window === 'undefined') return [];
  const allComments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
  return allComments[issueId] || [];
};

export const saveComment = (issueId, comment) => {
  const allComments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
  if (!allComments[issueId]) allComments[issueId] = [];
  allComments[issueId].push(comment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));
  return comment;
};

export const getVotes = (issueId) => {
  if (typeof window === 'undefined') return [];
  const allVotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTES)) || {};
  return allVotes[issueId] || [];
};

export const saveVote = (issueId, vote) => {
  const allVotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTES)) || {};
  if (!allVotes[issueId]) allVotes[issueId] = [];
  
  // Filter out any existing vote by this user to avoid duplicates
  allVotes[issueId] = allVotes[issueId].filter(v => v.userId !== vote.userId);
  allVotes[issueId].push(vote);
  localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(allVotes));
  
  // Recalculate status of the issue based on votes
  recalculateIssueStatus(issueId);

  // Dynamic feedback loop: update reporter's trustScore based on vote validity
  const issue = getIssues().find(i => i.id === issueId);
  if (issue && issue.reporterId) {
    if (vote.vote === 'confirm') {
      updateReporterTrustScore(issue.reporterId, 1);
    } else {
      updateReporterTrustScore(issue.reporterId, -5);
    }
  }

  return vote;
};

const updateReporterTrustScore = (uid, offset) => {
  const users = getUsers();
  const index = users.findIndex(u => u.uid === uid);
  if (index !== -1) {
    const current = users[index].trustScore !== undefined ? users[index].trustScore : 70;
    users[index].trustScore = Math.max(0, Math.min(100, current + offset));
    setLocalCollection(STORAGE_KEYS.USERS, users);
  }
};

const recalculateIssueStatus = (issueId) => {
  const votes = getVotes(issueId);
  const confVotes = votes.filter(v => v.vote === 'confirm').length;
  const issue = getIssues().find(i => i.id === issueId);
  
  if (issue && issue.status === 'reported') {
    // If we have at least 3 confirmation votes, promote to citizen_verified
    if (confVotes >= 2) {
      updateIssueInDB(issueId, { status: 'citizen_verified' });
      
      // Notify the reporter
      if (issue.reporterId) {
        addNotification({
          userId: issue.reporterId,
          title: 'Issue Community Verified',
          message: `Your reported issue "${issue.title}" has been verified by the community!`,
          type: 'status_change',
          issueId: issue.id,
        });
      }
    }
  }
};

export const getNotifications = (userId) => {
  const all = getLocalCollection(STORAGE_KEYS.NOTIFICATIONS);
  return all.filter(n => n.userId === userId);
};

export const addNotification = (notif) => {
  const all = getLocalCollection(STORAGE_KEYS.NOTIFICATIONS);
  const newNotif = {
    id: 'notif_' + Math.random().toString(36).substr(2, 9),
    isRead: false,
    createdAt: new Date().toISOString(),
    ...notif
  };
  all.unshift(newNotif);
  setLocalCollection(STORAGE_KEYS.NOTIFICATIONS, all);
  return newNotif;
};

export const markNotificationsAsRead = (userId) => {
  const all = getLocalCollection(STORAGE_KEYS.NOTIFICATIONS);
  const updated = all.map(n => n.userId === userId ? { ...n, isRead: true } : n);
  setLocalCollection(STORAGE_KEYS.NOTIFICATIONS, updated);
};

export const getAchievements = (userId) => {
  if (typeof window === 'undefined') return [];
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) || {};
  return all[userId] || [];
};

export const awardAchievement = (userId, badgeName, description, xpReward) => {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) || {};
  if (!all[userId]) all[userId] = [];
  
  // Don't award duplicate badges
  if (all[userId].some(a => a.badgeName === badgeName)) return;

  const newAch = {
    id: 'ach_' + Math.random().toString(36).substr(2, 9),
    badgeName,
    description,
    xpReward,
    earnedAt: new Date().toISOString(),
  };
  
  all[userId].push(newAch);
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(all));

  // Add XP to user profile
  updateUserProfile(userId, {
    xpOffset: xpReward,
  });

  // Add notification
  addNotification({
    userId,
    title: 'Achievement Unlocked!',
    message: `You earned the "${badgeName}" badge (+${xpReward} XP)`,
    type: 'reward',
    issueId: '',
  });

  return newAch;
};

export const getUsers = () => getLocalCollection(STORAGE_KEYS.USERS);

export const updateUserProfile = (uid, fields) => {
  const users = getUsers();
  const index = users.findIndex(u => u.uid === uid);
  if (index !== -1) {
    let currentXp = users[index].xp;
    if (fields.xpOffset) {
      currentXp += fields.xpOffset;
      delete fields.xpOffset;
    }

    let currentTrust = users[index].trustScore !== undefined ? users[index].trustScore : 70;
    if (fields.trustScoreOffset) {
      currentTrust = Math.max(0, Math.min(100, currentTrust + fields.trustScoreOffset));
      delete fields.trustScoreOffset;
    }
    
    // Level calculation (e.g. 200 XP per level)
    const currentLevel = Math.max(1, Math.floor(currentXp / 200) + 1);

    users[index] = { 
      ...users[index], 
      ...fields, 
      xp: currentXp,
      level: currentLevel,
      trustScore: currentTrust,
    };
    setLocalCollection(STORAGE_KEYS.USERS, users);
    return users[index];
  }
  return null;
};

export const getAuditLogs = () => getLocalCollection(STORAGE_KEYS.AUDIT_LOGS);

export const addAuditLog = (userId, userName, action, details = {}) => {
  const all = getLocalCollection(STORAGE_KEYS.AUDIT_LOGS);
  const newLog = {
    id: 'log_' + Math.random().toString(36).substr(2, 9),
    userId,
    userName,
    action,
    details,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newLog);
  setLocalCollection(STORAGE_KEYS.AUDIT_LOGS, all);
  return newLog;
};
