import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import Donation from '@/models/donationModel';
import { mockDb } from '@/lib/mockData';

export async function GET() {
  try {
    console.log(`\n========================================`);
    console.log(`[QA SANDBOX GET DONATIONS LIST ATTEMPT]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);

    if (isUsingMock()) {
      console.log(`- Total donations returned (Mock): ${mockDb.donations.length}`);
      return NextResponse.json({ success: true, donations: mockDb.donations });
    } else {
      await connectToDatabase();
      const donations = await Donation.find({}).sort({ createdAt: -1 });
      console.log(`- Total donations returned (MongoDB): ${donations.length}`);
      return NextResponse.json({ success: true, donations });
    }
  } catch (error: any) {
    console.log(`[QA DONATIONS GET FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { donorName, amount, cause } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX DONATION SUBMISSION ATTEMPT]`);
    console.log(`- Donor Name: "${donorName}"`);
    console.log(`- Input Amount: ${amount} (Type: ${typeof amount})`);
    console.log(`- Input Cause: "${cause}"`);

    if (!donorName || amount === undefined || !cause) {
      console.log(`[QA DONATION SUBMISSION FAILURE]: Missing required fields.`);
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    console.log(`- Parsed Amount: ${parsedAmount}`);

    if (parsedAmount < 0) {
      console.log(`[QA DONATION WARNING]: Negative donation amount permitted! (Deliberate Bug 38). Value: ${parsedAmount}`);
    }

    // DELIBERATE BUG: Cause name mismatch!
    let savedCause = cause;
    if (cause === 'General Welfare Fund') {
      savedCause = 'General Fund';
      console.log(`[QA DONATION WARNING]: Cause mismatch bug! "General Welfare Fund" saved as "General Fund" (Deliberate Bug 39).`);
    }

    if (isUsingMock()) {
      const newDonation = {
        _id: 'd_' + Math.random().toString(36).substr(2, 9),
        donorName,
        amount: parsedAmount,
        cause: savedCause,
        createdAt: new Date().toISOString(),
      };
      mockDb.donations.unshift(newDonation);
      console.log(`[QA DONATION SUCCESS] Saved in Mock memory:`, newDonation);
      return NextResponse.json({ success: true, donation: newDonation });
    } else {
      await connectToDatabase();
      const donation = await Donation.create({
        donorName,
        amount: parsedAmount,
        cause: savedCause,
      });
      console.log(`[QA DONATION SUCCESS] Saved in MongoDB:`, donation);
      return NextResponse.json({ success: true, donation });
    }
  } catch (error: any) {
    console.log(`[QA DONATION FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
