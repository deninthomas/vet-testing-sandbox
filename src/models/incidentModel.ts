import mongoose, { Schema } from 'mongoose';

const IncidentSchema = new Schema(
  {
    reporterName: { type: String, required: true },
    reporterPhone: { type: String, required: true },
    animalType: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String }, // Empty is allowed due to our deliberate bug!
    imageUrl: { type: String },
    status: { type: String, enum: ['reported', 'rescued', 'resolved'], default: 'reported' },
  },
  { timestamps: true }
);

export default mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
