import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import User from '@/models/userModel';
import { mockDb } from '@/lib/mockData';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX USER REGISTRATION ATTEMPT]`);
    console.log(`- Input Name: "${name}"`);
    console.log(`- Input Email: "${email}" (Validation Check: BYPASSED)`);
    console.log(`- Input Phone: "${phone}"`);
    console.log(`- Raw Password: "${password}"`);

    // DELIBERATE BUG: Validation bypass!
    // We do NOT perform email format validation here or check for blank password,
    // which allows registering invalid accounts (e.g. email = "abc", password = "")
    if (!name) {
      console.log(`[QA REGISTRATION FAILURE]: Name missing.`);
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // DELIBERATE BUG: Password truncation logic
    // We silently truncate any password longer than 8 characters to 8 characters.
    let finalPassword = password || '';
    if (finalPassword.length > 8) {
      finalPassword = finalPassword.substring(0, 8);
      console.log(`[QA REGISTRATION WARNING]: Password length ${password.length} > 8. Silently truncated to: "${finalPassword}"`);
    }

    if (isUsingMock()) {
      // Check duplicate in mock
      const existing = mockDb.users.find(u => u.email === email);
      if (existing) {
        console.log(`[QA REGISTRATION FAILURE]: Email "${email}" already exists (mock).`);
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      const newUser = {
        _id: 'u_' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone: phone || '',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      };
      
      // Store in memory (mock password is not saved for security in demo but mockDb acts as user database)
      mockDb.users.push(newUser);
      console.log(`[QA REGISTRATION SUCCESS] Registered user in Mock memory:`, newUser);
      return NextResponse.json({ success: true, user: newUser });
    } else {
      await connectToDatabase();
      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`[QA REGISTRATION FAILURE]: Email "${email}" already exists (Mongoose DB).`);
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      const user = await User.create({
        name,
        email,
        phone,
        password: finalPassword, // In a real app we would hash this, but we keep it plain for simple testing / demo purposes.
        role: 'user'
      });

      console.log(`[QA REGISTRATION SUCCESS] Saved user to Mongoose MongoDB:`, {
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
