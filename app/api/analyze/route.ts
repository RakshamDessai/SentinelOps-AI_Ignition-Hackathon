import { NextRequest, NextResponse } from 'next/server';
import { analyzeCustomTelemetry } from '@/lib/correlationEngine';

export async function POST(req: NextRequest) {
  try {
    const { telemetryText } = await req.json();
    if (!telemetryText || typeof telemetryText !== 'string') {
      return NextResponse.json({ error: 'Missing telemetryText payload' }, { status: 400 });
    }

    const analyzedScenario = analyzeCustomTelemetry(telemetryText);
    return NextResponse.json({ scenario: analyzedScenario });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
