import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { action, details } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA CLIENT-SIDE ACTION LOGGED]`);
    console.log(`- Action: "${action}"`);
    if (details) {
      console.log(`- Details:`, JSON.stringify(details, null, 2));
    }
    console.log(`========================================`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
