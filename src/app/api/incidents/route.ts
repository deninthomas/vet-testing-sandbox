import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import Incident from '@/models/incidentModel';
import { mockDb } from '@/lib/mockData';

export async function GET() {
  try {
    console.log(`\n========================================`);
    console.log(`[QA SANDBOX GET INCIDENTS LIST ATTEMPT]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);

    if (isUsingMock()) {
      console.log(`- Total incidents returned (Mock): ${mockDb.incidents.length}`);
      return NextResponse.json({ success: true, incidents: mockDb.incidents });
    } else {
      await connectToDatabase();
      const incidents = await Incident.find({}).sort({ createdAt: -1 });
      console.log(`- Total incidents returned (MongoDB): ${incidents.length}`);
      return NextResponse.json({ success: true, incidents });
    }
  } catch (error: any) {
    console.log(`[QA INCIDENTS GET FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { reporterName, reporterPhone, animalType, description, location, imageUrl, latitude, longitude } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX INCIDENT EMERGENCY REPORT ATTEMPT]`);
    console.log(`- Reporter Name: "${reporterName}"`);
    console.log(`- Reporter Phone: "${reporterPhone}"`);
    console.log(`- Animal Type: "${animalType}"`);
    console.log(`- Description: "${description}"`);
    console.log(`- Input Location: "${location}"`);
    console.log(`- GPS Latitude: "${latitude}", Longitude: "${longitude}"`);

    if (!reporterName || !reporterPhone || !animalType || !description) {
      console.log(`[QA INCIDENT FAILURE]: Missing required fields.`);
      return NextResponse.json({ error: 'All fields except location and image are required' }, { status: 400 });
    }

    // DELIBERATE BUG: Location validation bypass. 
    if (!location) {
      console.log(`[QA INCIDENT WARNING]: Location is empty. (Bypass check active!)`);
    }
    
    // DELIBERATE BUG: Swapped Coordinates Bug!
    // We swap latitude and longitude values before storing, putting them in the wrong place.
    const savedLat = longitude;
    const savedLng = latitude;
    if (latitude || longitude) {
      console.log(`[QA INCIDENT WARNING]: GPS coordinates swapped! Stored lat: "${savedLat}", Stored lng: "${savedLng}"`);
    }
    const gpsString = savedLat && savedLng ? ` (GPS: ${savedLat}, ${savedLng})` : '';
    const finalLocation = (location || '') + gpsString;

    // DELIBERATE BUG: Image upload issue. If the image is >2MB (simulated by checking string length of base64/url,
    // e.g. length > 500000), we save a broken/corrupted image URL.
    let savedImageUrl = imageUrl;
    if (imageUrl && imageUrl.length > 500000) {
      savedImageUrl = 'broken_base64_data_image_corrupted';
      console.log(`[QA INCIDENT WARNING]: Simulated image upload size exceeds 2MB limit. Image saved as corrupted data.`);
    }

    if (isUsingMock()) {
      const newIncident = {
        _id: 'i_' + Math.random().toString(36).substr(2, 9),
        reporterName,
        reporterPhone,
        animalType,
        description,
        location: finalLocation,
        imageUrl: savedImageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=60',
        status: 'reported' as const,
        createdAt: new Date().toISOString(),
      };
      mockDb.incidents.unshift(newIncident);
      return NextResponse.json({ success: true, incident: newIncident });
    } else {
      await connectToDatabase();
      const incident = await Incident.create({
        reporterName,
        reporterPhone,
        animalType,
        description,
        location: finalLocation,
        imageUrl: savedImageUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=60',
        status: 'reported',
      });
      return NextResponse.json({ success: true, incident });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
