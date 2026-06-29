import { NextResponse } from 'next/server';
import { aiService } from '@/services/aiService';

export async function POST(request) {
  try {
    const { image, transcript } = await request.json();
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image base64 payload is required.' },
        { status: 400 }
      );
    }
    
    const analysis = await aiService.analyzeIssuePhoto(image, transcript);
    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error('API Analyze error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
