/* eslint-disable @typescript-eslint/no-explicit-any */
// In-memory data store for testing fallback when MongoDB is not connected.

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'volunteer' | 'admin';
  createdAt: string;
}

export interface Incident {
  _id: string;
  reporterName: string;
  reporterPhone: string;
  animalType: string;
  description: string;
  location: string;
  imageUrl: string;
  status: 'reported' | 'rescued' | 'resolved';
  createdAt: string;
}

export interface Animal {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  healthStatus: string;
  temperament: string;
  imageUrl: string;
  status: 'available' | 'adopted';
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  shopName: string;
  shopLocation: string;
  shopPhone: string;
  stock: number;
}

export interface Donation {
  _id: string;
  donorName: string;
  amount: number;
  cause: string;
  createdAt: string;
}

export interface VetHospital {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  specialty: string;
  rating: number;
}

export interface Campaign {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

declare global {
  // eslint-disable-next-line no-var
  var mockDb: {
    users: User[];
    incidents: Incident[];
    animals: Animal[];
    products: Product[];
    donations: Donation[];
    vets: VetHospital[];
    campaigns: Campaign[];
    feedbacks: any[];
    appointments: any[];
    initialized: boolean;
  };
}

if (!global.mockDb) {
  global.mockDb = {
    users: [
      { _id: 'u1', name: 'John Doe', email: 'user@tailwise.org', phone: '1234567890', role: 'user', createdAt: new Date().toISOString() },
      { _id: 'u2', name: 'Jane Volunteer', email: 'volunteer@tailwise.org', phone: '9876543210', role: 'volunteer', createdAt: new Date().toISOString() },
      { _id: 'u3', name: 'Alice Admin', email: 'admin@tailwise.org', phone: '5551234567', role: 'admin', createdAt: new Date().toISOString() },
    ],
    incidents: [
      { _id: 'i1', reporterName: 'Mark Smith', reporterPhone: '1112223333', animalType: 'Dog', description: 'Stray dog with a broken front leg near Central Park.', location: 'Central Park, NY', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60', status: 'reported', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { _id: 'i2', reporterName: 'Sarah Jenkins', reporterPhone: '4445556666', animalType: 'Cat', description: 'Injured kitten trapped in a drainage pipe.', location: 'Main Street Corner, Boston', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=60', status: 'rescued', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
    ],
    animals: [
      { _id: 'a1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever Mix', age: '2 years', healthStatus: 'Healthy (Vaccinated)', temperament: 'Friendly, playful, energetic', imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=60', status: 'available', createdAt: new Date().toISOString() },
      { _id: 'a2', name: 'Luna', species: 'Cat', breed: 'Domestic Shorthair', age: '6 months', healthStatus: 'Recovering from minor skin allergy', temperament: 'Calm, affectionate, quiet', imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=60', status: 'available', createdAt: new Date().toISOString() },
      { _id: 'a3', name: 'Max', species: 'Dog', breed: 'German Shepherd', age: '3 years', healthStatus: 'Healthy', temperament: 'Protective, alert, trained', imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&auto=format&fit=crop&q=60', status: 'adopted', createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
    ],
    products: [
      { _id: 'p1', name: 'Premium Dog Food', price: 29.99, description: 'Nutritious high-protein kibble for active adult dogs.', imageUrl: 'https://images.unsplash.com/photo-1585499103188-5972f78a727f?w=600&auto=format&fit=crop&q=60', shopName: 'Happy Tails Shop', shopLocation: 'Downtown', shopPhone: '9998887777', stock: 15 },
      { _id: 'p2', name: 'Cat Scratching Post', price: 45.50, description: 'Durable sisal fiber scratching post with hanging toy.', imageUrl: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=60', shopName: 'Happy Tails Shop', shopLocation: 'Downtown', shopPhone: '9998887777', stock: 8 },
      { _id: 'p3', name: 'Adjustable Dog Harness', price: 19.99, description: 'Reflective, heavy-duty nylon harness for all dog sizes.', imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=60', shopName: 'Pet & Vet Care Center', shopLocation: 'Uptown', shopPhone: '7776665555', stock: 20 },
    ],
    donations: [
      { _id: 'd1', donorName: 'Robert Vance', amount: 100, cause: 'General Welfare Fund', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
      { _id: 'd2', donorName: 'Pam Beesly', amount: 50, cause: 'Buddy - Golden Retriever Care', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
    ],
    vets: [
      { _id: 'v1', name: 'City Animal Hospital', city: 'Downtown', address: '123 Vet Blvd, Suite A', phone: '222-333-4444', specialty: 'General practice & Surgery', rating: 4.8 },
      { _id: 'v2', name: 'Emergency Pet Clinic', city: 'Downtown', address: '456 Urgent Care Ln', phone: '222-888-9999', specialty: '24/7 Trauma & Emergency', rating: 4.5 },
      { _id: 'v3', name: 'Cat Wellness Center', city: 'Uptown', address: '789 Purrfect Way', phone: '555-444-1111', specialty: 'Feline internal medicine', rating: 4.9 },
    ],
    campaigns: [
      { _id: 'c1', title: 'Adoption Drive & Fun Fair', description: 'Come meet lovable animals ready to find their forever homes. Fun activities for kids!', date: '2026-06-15', location: 'City Park Meadow' },
      { _id: 'c2', title: 'Free Vaccination Campaign', description: 'Get free rabies and basic vaccines for your pets. Sponsored by City Animal Hospital.', date: '2026-07-02', location: 'Downtown Community Center' },
    ],
    feedbacks: [],
    appointments: [],
    initialized: true,
  };
}

export const mockDb = global.mockDb;
