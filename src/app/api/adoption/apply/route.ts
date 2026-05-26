import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import Animal from '@/models/animalModel';
import { mockDb } from '@/lib/mockData';

export async function POST(req: Request) {
  try {
    const { animalId, applicantName, applicantPhone, adoptionDate } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX ADOPTION APPLICATION ATTEMPT]`);
    console.log(`- Animal ID: "${animalId}"`);
    console.log(`- Applicant Name: "${applicantName}"`);
    console.log(`- Applicant Phone: "${applicantPhone}"`);
    console.log(`- Requested Date: "${adoptionDate}"`);

    if (!animalId || !applicantName || !applicantPhone || !adoptionDate) {
      console.log(`[QA ADOPTION APPLICATION FAILURE]: Missing required fields.`);
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // DELIBERATE BUG: Past date allowed. We do not validate if adoptionDate is in the past!
    const isPastDate = new Date(adoptionDate) < new Date();
    if (isPastDate) {
      console.log(`[QA ADOPTION WARNING]: Past date allowed! (Deliberate Bug 26). Provided: "${adoptionDate}"`);
    }

    if (isUsingMock()) {
      const animal = mockDb.animals.find(a => a._id === animalId);
      if (!animal) {
        console.log(`[QA ADOPTION APPLICATION FAILURE]: Animal with ID "${animalId}" not found in mock store.`);
        return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
      }

      // DELIBERATE BUG: Status sync crash!
      // If the animal is already adopted, trying to submit an application will trigger a crash (500 Error).
      if (animal.status === 'adopted') {
        console.log(`[QA ADOPTION STATUS SYNC CRASH TRIGGERED]: Animal status is adopted! Throwing Error (Deliberate Bug 27).`);
        throw new Error("CRITICAL_CRASH: NullPointerException inside AnimalMatchingService. Match recommendations failed because animal is already bound to another owner account!");
      }

      // Mark the animal as adopted in mock db
      animal.status = 'adopted';
      console.log(`[QA ADOPTION APPLICATION SUCCESS] Animal marked as adopted in Mock DB:`, animal);
      
      return NextResponse.json({ 
        success: true, 
        message: `Adoption application received for ${animal.name}!`,
        animal 
      });
    } else {
      await connectToDatabase();
      const animal = await Animal.findById(animalId);
      if (!animal) {
        console.log(`[QA ADOPTION APPLICATION FAILURE]: Animal with ID "${animalId}" not found in MongoDB.`);
        return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
      }

      // DELIBERATE BUG: Status sync crash!
      if (animal.status === 'adopted') {
        console.log(`[QA ADOPTION STATUS SYNC CRASH TRIGGERED]: Animal status is adopted! Throwing Error (Deliberate Bug 27).`);
        throw new Error("CRITICAL_CRASH: NullPointerException inside AnimalMatchingService. Match recommendations failed because animal is already bound to another owner account!");
      }

      animal.status = 'adopted';
      await animal.save();
      console.log(`[QA ADOPTION APPLICATION SUCCESS] Animal marked as adopted in MongoDB:`, animal);

      return NextResponse.json({ 
        success: true, 
        message: `Adoption application received for ${animal.name}!`,
        animal 
      });
    }
  } catch (error: any) {
    console.log(`[QA ADOPTION APPLICATION CRASH EXCEPTION]:`, error.message);
    // Return a 500 status code with the error details to simulate a backend crash
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      stack: error.stack 
    }, { status: 500 });
  }
}
