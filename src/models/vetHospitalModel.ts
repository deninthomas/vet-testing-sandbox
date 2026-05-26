import mongoose, { Schema } from 'mongoose';

const VetHospitalSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    specialty: { type: String },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.VetHospital || mongoose.model('VetHospital', VetHospitalSchema);
