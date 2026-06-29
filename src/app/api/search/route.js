import { NextResponse } from 'next/server';
import { issueService } from '@/services/issueService';
import { aiService } from '@/services/aiService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    
    // Fetch all current issues
    const allIssues = await issueService.getAllIssues();
    
    // Execute AI-based keyword and semantic matching
    const searchResults = await aiService.searchIssues(q, allIssues);
    
    return NextResponse.json({ success: true, data: searchResults });
  } catch (error) {
    console.error('API Search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
