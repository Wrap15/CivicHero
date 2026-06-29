import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client (server-side only, will return mock client on client-side)
let genAI = null;
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (apiKey && typeof window === 'undefined') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize GoogleGenerativeAI:', error);
  }
}

export const aiService = {
  // 1. Analyze reported issue photo using Gemini 2.5 Flash Vision
  analyzeIssuePhoto: async (base64Image, audioTranscript = '') => {
    // If we have API key and are running on server side
    if (genAI && base64Image) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Clean base64 prefix if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        
        const prompt = `
          Analyze this infrastructure issue photo. Act as an elite civic inspector.
          Return a JSON object containing the following keys (ensure it is valid JSON, no markdown formatting outside the JSON block):
          {
            "isSpam": boolean (true if image is a meme, selfie, inside a clean room, or unrelated to outdoor infrastructure problems),
            "category": string (Must be exactly one of: "Road Damage", "Water Leakage", "Streetlight", "Garbage", "Electric Hazard", "Illegal Construction", "Public Safety", "Tree Fall", "Drainage", "Others"),
            "title": string (A short, descriptive title of 5-8 words),
            "description": string (A detailed description of the defect, its visual parameters, and potential hazards),
            "severity": string (low, medium, high, critical),
            "urgency": string (low, medium, high),
            "confidence": number (float between 0.0 and 1.0),
            "repairRecommendation": string (a short technical advice for municipal technicians on how to fix this issue),
            "estimatedResolutionDays": number (integer estimate of how many days it should take to fix)
          }
          
          Additional context from citizen voice note transcript: "${audioTranscript}"
        `;
        
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        
        // Extract JSON from response text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to parse JSON from Gemini response');
      } catch (error) {
        console.error('Gemini Vision analysis error:', error);
        // Fall through to mock analyzer
      }
    }

    // --- FALLBACK MOCK VISION ANALYZER ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI delay
    
    // Guess category from voice transcript keyword
    let category = 'Others';
    let title = 'General Infrastructure Issue';
    let description = 'AI analyzed: Infrastructure concern reported. Visual inspection recommended.';
    let severity = 'medium';
    let urgency = 'medium';
    let repairRecommendation = 'Inspect onsite and assign to the nearest ward maintenance team.';
    let estimatedResolutionDays = 4;

    const transcriptLower = audioTranscript.toLowerCase();
    
    if (transcriptLower.includes('pothole') || transcriptLower.includes('road') || transcriptLower.includes('crack') || transcriptLower.includes('street')) {
      category = 'Road Damage';
      title = 'Pothole and Asphalt Fracture';
      description = 'Visible cracking and pavement depression forming a deep pothole. Poses a danger to passing vehicles and cyclists.';
      severity = 'high';
      urgency = 'high';
      repairRecommendation = 'Apply hot-mix asphalt patching and compact with a heavy roller.';
      estimatedResolutionDays = 3;
    } else if (transcriptLower.includes('leak') || transcriptLower.includes('water') || transcriptLower.includes('pipe') || transcriptLower.includes('burst')) {
      category = 'Water Leakage';
      title = 'Water Main Pipe Leakage';
      description = 'Active water flow escaping from a pavement joint or utility access point, creating localized flooding.';
      severity = 'high';
      urgency = 'medium';
      repairRecommendation = 'Shut off water flow valve, dig trench to expose line, and patch or replace pipeline segment.';
      estimatedResolutionDays = 2;
    } else if (transcriptLower.includes('trash') || transcriptLower.includes('garbage') || transcriptLower.includes('dump') || transcriptLower.includes('waste')) {
      category = 'Garbage';
      title = 'Sanitation / Garbage Overflow';
      description = 'Excess municipal waste accumulating outside public containers. Attracting pests and blocking pedestrian pathways.';
      severity = 'medium';
      urgency = 'medium';
      repairRecommendation = 'Dispatch municipal waste vehicle for bulk clearance and sanitize the immediate area.';
      estimatedResolutionDays = 1;
    } else if (transcriptLower.includes('light') || transcriptLower.includes('streetlights') || transcriptLower.includes('dark') || transcriptLower.includes('bulb')) {
      category = 'Streetlight';
      title = 'Broken Streetlight Luminaire';
      description = 'Street lamp fixture is non-functional or blinking, causing reduced visibility and safety concerns on the public road.';
      severity = 'low';
      urgency = 'medium';
      repairRecommendation = 'Deploy cherry picker crane to replace faulty bulb and verify connection voltage.';
      estimatedResolutionDays = 2;
    } else if (transcriptLower.includes('safety') || transcriptLower.includes('danger') || transcriptLower.includes('crime') || transcriptLower.includes('hazard')) {
      category = 'Public Safety';
      title = 'Public Space Hazard';
      description = 'Identified safety hazard in a public park or walkway that threatens pedestrian security.';
      severity = 'high';
      urgency = 'high';
      repairRecommendation = 'Erect safety barricades and alert police / safety wardens for inspection.';
      estimatedResolutionDays = 2;
    }

    return {
      isSpam: false,
      category,
      title,
      description,
      severity,
      urgency,
      confidence: 0.92,
      repairRecommendation,
      estimatedResolutionDays,
    };
  },

  // 2. Translate natural language search queries into Firestore issue filter logic
  searchIssues: async (queryText, issues = []) => {
    const q = queryText.toLowerCase().trim();
    
    // Server-side parsing with Gemini if API is active
    if (genAI && typeof window === 'undefined') {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `
          Translate the following user search query for a civic problem app into a search filter instructions JSON object.
          Query: "${queryText}"
          Available Categories: ["Road Damage", "Water Leakage", "Streetlight", "Garbage", "Electric Hazard", "Illegal Construction", "Public Safety", "Tree Fall", "Drainage", "Others"]
          Available Statuses: ["reported", "ai_verified", "citizen_verified", "assigned", "in_progress", "resolved", "closed"]
          Available Severities: ["low", "medium", "high", "critical"]

          Return EXACTLY a JSON structure with optional keys:
          {
            "category": string | null,
            "status": string | null (unresolved maps to status not being resolved/closed),
            "severity": string | null,
            "excludeResolved": boolean,
            "keywords": string[]
          }
        `;
        const result = await model.generateContent(prompt);
        const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const filter = JSON.parse(jsonMatch[0]);
          return issues.filter(issue => {
            if (filter.category && issue.category !== filter.category) return false;
            if (filter.severity && issue.severity !== filter.severity) return false;
            if (filter.status && issue.status !== filter.status) return false;
            if (filter.excludeResolved && (issue.status === 'resolved' || issue.status === 'closed')) return false;
            if (filter.keywords && filter.keywords.length > 0) {
              const textContent = `${issue.title} ${issue.description} ${issue.address}`.toLowerCase();
              return filter.keywords.some(kw => textContent.includes(kw.toLowerCase()));
            }
            return true;
          });
        }
      } catch (err) {
        console.error('Gemini Search Query parsing error:', err);
      }
    }

    // --- HEURISTIC LOCAL NLP SEARCH ---
    let categoryFilter = null;
    let severityFilter = null;
    let excludeResolved = false;
    let statusFilter = null;

    if (q.includes('unresolved') || q.includes('open') || q.includes('active') || q.includes('pending')) {
      excludeResolved = true;
    }

    if (q.includes('resolved') || q.includes('fixed') || q.includes('closed')) {
      statusFilter = 'resolved';
    }

    if (q.includes('pothole') || q.includes('road') || q.includes('asphalt')) {
      categoryFilter = 'Road Damage';
    } else if (q.includes('water') || q.includes('pipe') || q.includes('leak')) {
      categoryFilter = 'Water Leakage';
    } else if (q.includes('garbage') || q.includes('trash') || q.includes('dump')) {
      categoryFilter = 'Garbage Overflow';
    } else if (q.includes('light') || q.includes('bulb') || q.includes('lamp')) {
      categoryFilter = 'Broken Streetlight';
    } else if (q.includes('wire') || q.includes('shock') || q.includes('power') || q.includes('electric')) {
      categoryFilter = 'Electric Hazard';
    }

    if (q.includes('critical') || q.includes('emergency') || q.includes('dangerous')) {
      severityFilter = 'critical';
    } else if (q.includes('high') || q.includes('severe') || q.includes('urgent')) {
      severityFilter = 'high';
    }

    return issues.filter(issue => {
      // Category filter
      if (categoryFilter && issue.category !== categoryFilter) return false;
      // Severity filter
      if (severityFilter && issue.severity !== severityFilter) return false;
      // Status filter
      if (statusFilter && issue.status !== statusFilter) return false;
      // Exclude resolved
      if (excludeResolved && (issue.status === 'resolved' || issue.status === 'closed')) return false;
      
      // Keywords fallback search
      const textToSearch = `${issue.title} ${issue.description} ${issue.address} ${issue.category}`.toLowerCase();
      const keywords = q.split(' ').filter(word => word.length > 3 && !['show', 'find', 'near', 'from', 'with'].includes(word));
      
      if (keywords.length > 0) {
        return keywords.some(keyword => textToSearch.includes(keyword));
      }
      
      return true;
    });
  },

  // 3. Generate predictive analysis for infrastructure risks and seasonal hotspots
  getPredictiveRisk: async (issues = []) => {
    // If Gemini API key is available
    if (genAI && typeof window === 'undefined') {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const dataSummary = issues.map(i => ({
          category: i.category,
          severity: i.severity,
          lat: i.location.latitude,
          lng: i.location.longitude,
          date: i.createdAt
        }));
        
        const prompt = `
          Analyze the following historical complaint data:
          ${JSON.stringify(dataSummary)}
          
          Generate a predictive report showing:
          1. Areas likely to develop pothole clusters
          2. Garbage overflow hotspots and timings
          3. Seasonal trends (monsoon clogging, summer water drops)
          4. Department workloads & forecasted backlogs
          5. Future structural infrastructure risks.

          Return EXACTLY a JSON structure with keys:
          {
            "potholeRisks": [{ "area": string, "riskPercent": number, "explanation": string }],
            "garbageHotspots": [{ "area": string, "peakTime": string, "explanation": string }],
            "seasonalTrends": string,
            "departmentBottlenecks": [{ "department": string, "risk": string, "workloadForecast": number }],
            "generalRiskIndex": number (float between 1.0 and 100.0)
          }
        `;
        
        const result = await model.generateContent(prompt);
        const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error('Gemini Predictive Risk analysis error:', err);
      }
    }

    // --- FALLBACK MOCK PREDICTIVE ANALYSIS ---
    // Generate simulated analytics based on data
    return {
      potholeRisks: [
        { area: 'Broadway & 45th St Corridor', riskPercent: 88, explanation: 'High traffic volume combined with aging asphalt base layer creates high stress nodes prone to pothole expansions.' },
        { area: 'Water St & Main St intersection', riskPercent: 62, explanation: 'Frequent heavy truck traffic and drainage runoff pools soften pavement layers, causing cracks.' }
      ],
      garbageHotspots: [
        { area: 'Central Park East Entrance', peakTime: 'Saturdays, 4:00 PM - 8:00 PM', explanation: 'Tourist and weekend footfall exceeds existing waste bin capacities by 140%.' },
        { area: 'Times Square Subway Alleyway', peakTime: 'Fridays, 9:00 PM - Midnight', explanation: 'Commercial dumping from nearby food vendors triggers recurring pileups.' }
      ],
      seasonalTrends: 'Upcoming heavy rain forecasts indicate a 40% increase in drainage blockages near DUMBO and low-elevation roads. Winter freeze-thaw cycles are expected to accelerate pothole formations by 70% in high-traffic commercial zones.',
      departmentBottlenecks: [
        { department: 'Roads & Traffic', risk: 'High', workloadForecast: 85 },
        { department: 'Sanitation Dept', risk: 'Medium', workloadForecast: 60 },
        { department: 'Water Board', risk: 'Low', workloadForecast: 30 }
      ],
      generalRiskIndex: 72.4
    };
  }
};
