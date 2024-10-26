// src/app/api/flight-data/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    // Log to see if we have the KV binding
    console.log('KV binding check:', !!process.env.FLIGHT_DATA);
    
    const kv = process.env.FLIGHT_DATA;
    if (!kv) {
      console.error('KV binding not found');
      throw new Error('KV binding not found');
    }

    // Try to get the data and log the result
    console.log('Attempting to fetch from KV...');
    const data = await kv.get('airport_data', 'json');
    console.log('KV response:', data);

    if (!data) {
      console.error('No data found in KV');
      throw new Error('No data found in KV');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}