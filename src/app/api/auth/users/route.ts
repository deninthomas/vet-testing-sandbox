import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import User from '@/models/userModel';
import { mockDb } from '@/lib/mockData';

export async function GET() {
  try {
    console.log(`\n========================================`);
    console.log(`[QA SANDBOX GET ALL USERS ATTEMPT]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);

    if (isUsingMock()) {
      console.log(`- Total users returned (Mock): ${mockDb.users.length}`);
      return NextResponse.json({ success: true, users: mockDb.users });
    } else {
      await connectToDatabase();
      const users = await User.find({}).select('-password');
      console.log(`- Total users returned (MongoDB): ${users.length}`);
      return NextResponse.json({ success: true, users });
    }
  } catch (error: any) {
    console.log(`[QA GET USERS FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX USER DELETION ATTEMPT]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);
    console.log(`- Target User ID to delete: "${id}"`);

    if (!id) {
      console.log(`[QA USER DELETION FAILURE]: Missing User ID.`);
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (isUsingMock()) {
      const index = mockDb.users.findIndex(u => u._id === id);
      if (index === -1) {
        console.log(`[QA USER DELETION FAILURE]: User ID "${id}" not found in mock store.`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const deletedUser = mockDb.users.splice(index, 1)[0];
      console.log(`[QA USER DELETION SUCCESS] Deleted user from Mock DB:`, deletedUser);
      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } else {
      await connectToDatabase();
      const deletedUser = await User.findByIdAndDelete(id);
      console.log(`[QA USER DELETION SUCCESS] Deleted user from MongoDB:`, deletedUser);
      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    }
  } catch (error: any) {
    console.log(`[QA USER DELETION FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, role } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX USER ROLE UPDATE ATTEMPT]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);
    console.log(`- Target User ID to change: "${id}"`);
    console.log(`- Requested New Role: "${role}"`);

    if (!id || !role) {
      console.log(`[QA USER ROLE UPDATE FAILURE]: Missing User ID or Role.`);
      return NextResponse.json({ error: 'User ID and Role are required' }, { status: 400 });
    }

    if (isUsingMock()) {
      // DELIBERATE BUG: Updates the first user in the array (index 0) instead of the target ID
      const targetIndex = 0; // TYPO! Should be mockDb.users.findIndex(u => u._id === id)
      const targetUser = mockDb.users[targetIndex];
      
      if (!targetUser) {
        console.log(`[QA USER ROLE UPDATE FAILURE]: No users in mock store.`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      console.log(`[QA USER ROLE UPDATE WARNING]: Target mismatch bug! (Deliberate Bug 51).`);
      console.log(`  - Requested ID: "${id}"`);
      console.log(`  - Actually updating ID: "${targetUser._id}" (Name: "${targetUser.name}")`);

      const oldRole = targetUser.role;
      targetUser.role = role;
      console.log(`[QA USER ROLE UPDATE SUCCESS] Updated user "${targetUser.name}" role from "${oldRole}" to "${role}"`);
      
      return NextResponse.json({ success: true, user: targetUser });
    } else {
      await connectToDatabase();
      
      // DELIBERATE BUG: Updates the first user in the collection instead of the target ID
      const firstUser = await User.findOne({});
      if (!firstUser) {
        console.log(`[QA USER ROLE UPDATE FAILURE]: No users found in MongoDB.`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      console.log(`[QA USER ROLE UPDATE WARNING]: Target mismatch bug! (Deliberate Bug 51).`);
      console.log(`  - Requested ID: "${id}"`);
      console.log(`  - Actually updating ID: "${firstUser._id}" (Name: "${firstUser.name}")`);

      const oldRole = firstUser.role;
      firstUser.role = role;
      await firstUser.save();
      console.log(`[QA USER ROLE UPDATE SUCCESS] Updated user "${firstUser.name}" role from "${oldRole}" to "${role}"`);

      return NextResponse.json({ success: true, user: firstUser });
    }
  } catch (error: any) {
    console.log(`[QA USER ROLE UPDATE FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
