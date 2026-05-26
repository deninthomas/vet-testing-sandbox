import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import Incident from '@/models/incidentModel';
import { mockDb } from '@/lib/mockData';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX INCIDENT RESOLVE REQUEST]`);
    console.log(`- Target ID Requested to Resolve: "${id}"`);

    if (!id) {
      console.log(`[QA RESOLVE FAILURE]: Incident ID is missing.`);
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    if (isUsingMock()) {
      // Find index of the incident
      const index = mockDb.incidents.findIndex(inc => inc._id === id);
      if (index === -1) {
        console.log(`[QA RESOLVE FAILURE]: Incident ID "${id}" not found (mock).`);
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      }

      // DELIBERATE BUG: Off-by-one resolution error!
      // Instead of updating the selected incident, we resolve the next one (index + 1) in the list.
      // If the selected incident is the last one, we resolve the first one (index = 0).
      let targetIndex = index + 1;
      if (targetIndex >= mockDb.incidents.length) {
        targetIndex = 0;
      }

      const targetIncident = mockDb.incidents[targetIndex];
      targetIncident.status = 'resolved';

      console.log(`[QA RESOLVE OFF-BY-ONE ACTIVATED]:`);
      console.log(`  - Clicked index: ${index} (ID: ${id})`);
      console.log(`  - Actually resolved index: ${targetIndex} (ID: ${targetIncident._id}, Type: ${targetIncident.animalType})`);

      return NextResponse.json({ 
        success: true, 
        message: `Resolved incident of ${targetIncident.animalType} at ${targetIncident.location} (requested: ${id}, actual resolved: ${targetIncident._id})` 
      });
    } else {
      await connectToDatabase();
      const allIncidents = await Incident.find({}).sort({ createdAt: -1 });
      const index = allIncidents.findIndex(inc => inc._id.toString() === id);
      if (index === -1) {
        console.log(`[QA RESOLVE FAILURE]: Incident ID "${id}" not found (MongoDB).`);
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      }

      let targetIndex = index + 1;
      if (targetIndex >= allIncidents.length) {
        targetIndex = 0;
      }

      const targetIncident = allIncidents[targetIndex];
      targetIncident.status = 'resolved';
      await targetIncident.save();

      console.log(`[QA RESOLVE OFF-BY-ONE ACTIVATED (MongoDB DB)]:`);
      console.log(`  - Clicked index: ${index} (ID: ${id})`);
      console.log(`  - Actually resolved index: ${targetIndex} (ID: ${targetIncident._id}, Type: ${targetIncident.animalType})`);

      return NextResponse.json({ 
        success: true, 
        message: `Resolved incident (requested: ${id}, actual resolved: ${targetIncident._id})` 
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
