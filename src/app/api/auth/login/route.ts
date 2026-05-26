import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import User from '@/models/userModel';
import { mockDb } from '@/lib/mockData';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX LOGIN ATTEMPT]`);
    console.log(`- Input Email: "${email}"`);
    console.log(`- Input Password: "${password}"`);

    if (!email || !password) {
      console.log(`[QA LOGIN FAILURE]: Missing email or password input.`);
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (isUsingMock()) {
      const user = mockDb.users.find(u => u.email === email);
      if (!user) {
        console.log(`[QA LOGIN FAILURE]: User with email "${email}" not found in mock store.`);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
      }

      // DELIBERATE BUG: Password capitalization check bug!
      // We convert password to lowercase before checking, allowing case-insensitive login matches!
      const checkPassword = password.toLowerCase();
      const expectedPassword = user.role === 'admin' ? 'admin123' : user.role === 'volunteer' ? 'volunteer123' : 'user123';
      const isNewUser = !['u1', 'u2', 'u3'].includes(user._id);

      if (checkPassword !== expectedPassword && !isNewUser) {
        console.log(`[QA LOGIN FAILURE]: Password mismatch (mock). Expected: "${expectedPassword}" (or lowercased registered value). Submitted raw: "${password}"`);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
      }

      console.log(`[QA LOGIN SUCCESS] Logged in user (mock DB):`, user);
      return NextResponse.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      await connectToDatabase();
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`[QA LOGIN FAILURE]: User with email "${email}" not found in MongoDB.`);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
      }

      // DELIBERATE BUG: Password capitalization check bug!
      if (user.password.toLowerCase() !== password.toLowerCase()) {
        console.log(`[QA LOGIN FAILURE]: Password mismatch (Mongoose). Saved hash: "${user.password}", Submitted: "${password}" (Lowercases match: ${user.password.toLowerCase() === password.toLowerCase()})`);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
      }

      console.log(`[QA LOGIN SUCCESS] Logged in user (Mongoose MongoDB):`, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      return NextResponse.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
