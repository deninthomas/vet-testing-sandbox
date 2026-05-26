import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { fileName } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX ML IDENTIFICATION ATTEMPT]`);
    console.log(`- File Name: "${fileName}"`);

    if (!fileName) {
      console.log(`[QA IDENTIFY FAILURE]: Filename is missing.`);
      return NextResponse.json({ error: 'Filename is required for identification' }, { status: 400 });
    }

    // DELIBERATE BUG: ML predictive logic bug!
    // The classifier checks if the filename contains the letter 'd' (case-insensitive).
    // If it does, it classifies it as a Dog. Otherwise, it defaults to a Cat.
    const nameLower = fileName.toLowerCase();
    
    // Simulate minor delay for ML processing
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[QA ML WARNING]: Using filename checking logic. File contains 'd': ${nameLower.includes('d')} (Deliberate Bug 75/38).`);

    if (nameLower.includes('d')) {
      const result = {
        success: true,
        species: 'Dog',
        breed: nameLower.includes('retriever') ? 'Golden Retriever' : nameLower.includes('shepherd') ? 'German Shepherd' : 'Mixed Breed Dog',
        confidence: 0.92,
        modelDetails: 'MobileNetV3-TailWise Animal Classifier v1.2',
      };
      console.log(`[QA ML SUCCESS] Classified as Dog:`, result);
      return NextResponse.json(result);
    } else {
      const result = {
        success: true,
        species: 'Cat',
        breed: nameLower.includes('persian') ? 'Persian Cat' : nameLower.includes('siamese') ? 'Siamese Cat' : 'Domestic Shorthair Cat',
        confidence: 0.88,
        modelDetails: 'MobileNetV3-TailWise Animal Classifier v1.2',
      };
      console.log(`[QA ML SUCCESS] Classified as Cat:`, result);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.log(`[QA IDENTIFY FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
