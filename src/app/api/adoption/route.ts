import { NextResponse } from 'next/server';
import { connectToDatabase, isUsingMock } from '@/lib/dbConnect';
import Animal from '@/models/animalModel';
import { mockDb } from '@/lib/mockData';

export async function GET() {
  try {
    console.log(`\n========================================`);
    console.log(`[QA SANDBOX ADOPTION BOARD RETRIEVAL]`);
    console.log(`- Connection Type: ${isUsingMock() ? 'Mock In-Memory' : 'Mongoose MongoDB'}`);

    if (isUsingMock()) {
      // DELIBERATE BUG: Returns all animals including adopted ones,
      // instead of filtering to show only 'available' animals on the adoption board.
      console.log(`[QA ADOPTION BOARD WARNING]: Returning all animals including adopted ones (Deliberate Bug 27/35).`);
      console.log(`- Total animals returned: ${mockDb.animals.length}`);
      return NextResponse.json({ success: true, animals: mockDb.animals });
    } else {
      await connectToDatabase();
      const animals = await Animal.find({});
      console.log(`[QA ADOPTION BOARD WARNING]: Returning all animals including adopted ones (Deliberate Bug 27/35).`);
      console.log(`- Total animals returned: ${animals.length}`);
      return NextResponse.json({ success: true, animals });
    }
  } catch (error: any) {
    console.log(`[QA ADOPTION BOARD FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, species, breed, age, healthStatus, temperament, imageUrl } = await req.json();

    console.log(`\n========================================`);
    console.log(`[QA SANDBOX ANIMAL CREATION ATTEMPT]`);
    console.log(`- Name: "${name}"`);
    console.log(`- Species: "${species}"`);
    console.log(`- Breed: "${breed}"`);
    console.log(`- Age: "${age}"`);
    console.log(`- Health Status: "${healthStatus}"`);
    console.log(`- Temperament: "${temperament}"`);
    console.log(`- Image URL: "${imageUrl}"`);

    if (!name || !species) {
      console.log(`[QA ANIMAL CREATION FAILURE]: Missing name or species.`);
      return NextResponse.json({ error: 'Name and species are required' }, { status: 400 });
    }

    if (isUsingMock()) {
      const newAnimal = {
        _id: 'a_' + Math.random().toString(36).substr(2, 9),
        name,
        species,
        breed: breed || 'Unknown',
        age: age || 'Unknown',
        healthStatus: healthStatus || 'Healthy',
        temperament: temperament || 'Friendly',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60',
        status: 'available' as const,
        createdAt: new Date().toISOString(),
      };
      mockDb.animals.unshift(newAnimal);
      console.log(`[QA ANIMAL CREATION SUCCESS] Saved in Mock memory:`, newAnimal);
      return NextResponse.json({ success: true, animal: newAnimal });
    } else {
      await connectToDatabase();
      const animal = await Animal.create({
        name,
        species,
        breed: breed || 'Unknown',
        age: age || 'Unknown',
        healthStatus: healthStatus || 'Healthy',
        temperament: temperament || 'Friendly',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60',
        status: 'available',
      });
      console.log(`[QA ANIMAL CREATION SUCCESS] Saved in MongoDB:`, animal);
      return NextResponse.json({ success: true, animal });
    }
  } catch (error: any) {
    console.log(`[QA ANIMAL CREATION FAILURE]: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
