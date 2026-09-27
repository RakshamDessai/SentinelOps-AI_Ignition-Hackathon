import { NextRequest, NextResponse } from 'next/server';
import { askOpsCopilot } from '@/lib/geminiClient';
import { IncidentScenario } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { question, scenario, chatHistory } = await req.json();

    if (!question || !scenario) {
      return NextResponse.json({ error: 'Missing question or scenario' }, { status: 400 });
    }

    const answer = await askOpsCopilot(question, scenario as IncidentScenario, chatHistory || []);
    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Copilot error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
