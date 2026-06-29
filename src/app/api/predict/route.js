import { NextResponse } from 'next/server';
import { issueService } from '@/services/issueService';
import { aiService } from '@/services/aiService';

export async function GET() {
  try {
    // Load historical complaints
    const issues = await issueService.getAllIssues();
    
    // Process predictive workload and infrastructure risks
    const predictionReport = await aiService.getPredictiveRisk(issues);
    
    return NextResponse.json({ success: true, data: predictionReport });
  } catch (error) {
    console.error('API Predict error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
