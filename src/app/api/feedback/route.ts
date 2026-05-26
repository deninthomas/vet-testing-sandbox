import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import Feedback from '@/models/feedbackModel';
import { mockDb } from '@/lib/mockData';

export async function GET() {
  try {
    console.log(`\n========================================`);
    console.log(`[QA SANDBOX GET FEEDBACK LIST]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);

    if (isUsingMock()) {
      console.log(`- Total feedbacks returned (Mock): ${mockDb.feedbacks?.length || 0}`);
      return NextResponse.json({ success: true, feedbacks: mockDb.feedbacks || [] });
    } else {
      await connectToDatabase();
      const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
      console.log(`- Total feedbacks returned (MongoDB): ${feedbacks.length}`);
      return NextResponse.json({ success: true, feedbacks });
    }
  } catch (error: any) {
    console.log(`[QA FEEDBACK GET FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userName, comment, rating } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX FEEDBACK SUBMISSION ATTEMPT]`);
    console.log(`- User Name: "${userName}"`);
    console.log(`- Comment: "${comment}"`);
    console.log(`- Rating: ${rating}`);

    if (!userName || !comment) {
      console.log(`[QA FEEDBACK SUBMISSION FAILURE]: Missing name or comment.`);
      return NextResponse.json({ error: 'Name and comment are required' }, { status: 400 });
    }

    // DELIBERATE BUG: Crash Bug!
    // If the comment contains the word "crash", the server will throw an error simulating a crash.
    if (comment.toLowerCase().includes('crash')) {
      console.log(`[QA FEEDBACK CRASH TRIGGERED]: comment contains 'crash'! Throwing simulated error (Deliberate Bug 48).`);
      throw new Error('CRITICAL: NullPointerException at FeedbackCensorshipProcessor.java:42. String reference is null.');
    }

    // DELIBERATE BUG: Censorship Bug!
    // A buggy function that replaces "bad" with "excellent" in a crude attempt to clean feedback.
    let cleanedComment = comment;
    if (comment.toLowerCase().includes('bad')) {
      cleanedComment = comment.replace(/bad/gi, 'excellent');
      console.log(`[QA FEEDBACK WARNING]: Censorship activated! Replaced 'bad' with 'excellent' (Deliberate Bug). Cleaned: "${cleanedComment}"`);
    }

    // DELIBERATE BUG: Rating range validation bypass!
    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      console.log(`[QA FEEDBACK WARNING]: Out-of-range rating accepted! (Deliberate Bug). Rating: ${numRating}`);
    }

    if (isUsingMock()) {
      const newFeedback = {
        _id: 'fb_' + Math.random().toString(36).substr(2, 9),
        userName,
        comment: cleanedComment,
        rating: numRating,
        createdAt: new Date().toISOString(),
      };
      
      if (!mockDb.feedbacks) {
        mockDb.feedbacks = [];
      }
      
      mockDb.feedbacks.unshift(newFeedback);
      console.log(`[QA FEEDBACK SUCCESS] Saved in Mock memory:`, newFeedback);
      return NextResponse.json({ success: true, feedback: newFeedback });
    } else {
      await connectToDatabase();
      const feedback = await Feedback.create({
        userName,
        comment: cleanedComment,
        rating: numRating,
      });
      console.log(`[QA FEEDBACK SUCCESS] Saved in MongoDB:`, feedback);
      return NextResponse.json({ success: true, feedback });
    }
  } catch (error: any) {
    console.log(`[QA FEEDBACK SUBMISSION EXCEPTION]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
