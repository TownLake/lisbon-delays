import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const kv = process.env.FLIGHT_DATA;
    if (!kv) {
      throw new Error('KV binding not found');
    }

    const data = await kv.get('airport_data', 'json');
    if (!data) {
      throw new Error('No data found');
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch flight data' },
      { status: 500 }
    );
  }
}