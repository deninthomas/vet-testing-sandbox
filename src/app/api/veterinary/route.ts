import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import VetHospital from '@/models/vetHospitalModel';
import { mockDb } from '@/lib/mockData';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || '';

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX VETERINARY CLINICS SEARCH]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);
    console.log(`- City Filter Requested: "${city}"`);

    if (city === 'Suburbs') {
      console.log(`[QA VET SEARCH WARNING]: Selecting "Suburbs" which has 0 hospitals will trigger a client-side TypeError crash (Deliberate Bug 48).`);
    }

    if (isUsingMock()) {
      let filteredVets = mockDb.vets;
      if (city) {
        filteredVets = mockDb.vets.filter(v => v.city.toLowerCase() === city.toLowerCase());
      }
      console.log(`- Total clinics returned: ${filteredVets.length}`);
      return NextResponse.json({ success: true, vets: filteredVets });
    } else {
      await connectToDatabase();
      const query = city ? { city: { $regex: new RegExp(city, 'i') } } : {};
      const vets = await VetHospital.find(query);
      console.log(`- Total clinics returned: ${vets.length}`);
      return NextResponse.json({ success: true, vets });
    }
  } catch (error: any) {
    console.log(`[QA VET GET FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clinicId, petName, reason, date, time } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX VET APPOINTMENT BOOKING ATTEMPT]`);
    console.log(`- Clinic ID: "${clinicId}"`);
    console.log(`- Pet Name: "${petName}"`);
    console.log(`- Reason: "${reason}"`);
    console.log(`- Date: "${date}"`);
    console.log(`- Time: "${time}"`);

    if (!clinicId || !petName || !date || !time) {
      console.log(`[QA VET APPOINTMENT FAILURE]: Missing required fields.`);
      return NextResponse.json({ error: 'All fields except reason are required' }, { status: 400 });
    }

    let selectedClinic;
    if (isUsingMock()) {
      // DELIBERATE BUG: Clinic ID target swap bug!
      // The server ignores the clinicId passed by the user and books it for the first clinic in the database.
      selectedClinic = mockDb.vets[0]; // TYPO! Always picks index 0
      
      console.log(`[QA VET APPOINTMENT WARNING]: Clinic ID target swap bug! (Deliberate Bug 52).`);
      console.log(`  - User requested: "${clinicId}"`);
      console.log(`  - System booked with: "${selectedClinic?._id}" (${selectedClinic?.name})`);

      if (!mockDb.appointments) {
        mockDb.appointments = [];
      }
      const newAppt = {
        _id: 'appt_' + Math.random().toString(36).substr(2, 9),
        clinicId: selectedClinic?._id,
        clinicName: selectedClinic?.name,
        petName,
        reason: reason || 'General checkup',
        date,
        time,
        createdAt: new Date().toISOString(),
      };
      mockDb.appointments.push(newAppt);
      console.log(`[QA VET APPOINTMENT SUCCESS] Saved in Mock memory:`, newAppt);
      return NextResponse.json({ 
        success: true, 
        message: `Appointment successfully booked with ${selectedClinic?.name}!`,
        appointment: newAppt 
      });
    } else {
      await connectToDatabase();
      // DELIBERATE BUG: Clinic ID target swap bug!
      const clinics = await VetHospital.find({});
      selectedClinic = clinics[0]; // TYPO! Always picks index 0

      console.log(`[QA VET APPOINTMENT WARNING]: Clinic ID target swap bug! (Deliberate Bug 52).`);
      console.log(`  - User requested: "${clinicId}"`);
      console.log(`  - System booked with: "${selectedClinic?._id}" (${selectedClinic?.name})`);

      return NextResponse.json({ 
        success: true, 
        message: `Appointment successfully booked with ${selectedClinic?.name}!`,
        appointment: {
          clinicId: selectedClinic?._id,
          clinicName: selectedClinic?.name,
          petName,
          reason: reason || 'General checkup',
          date,
          time,
        }
      });
    }
  } catch (error: any) {
    console.log(`[QA VET APPOINTMENT FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
