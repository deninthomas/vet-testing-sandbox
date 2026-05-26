import mongoose, { Schema } from 'mongoose';

const AnimalSchema = new Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String },
    age: { type: String },
    healthStatus: { type: String },
    temperament: { type: String },
    imageUrl: { type: String },
    status: { type: String, enum: ['available', 'adopted'], default: 'available' },
  },
  { timestamps: true }
);

export default mongoose.models.Animal || mongoose.model('Animal', AnimalSchema);
