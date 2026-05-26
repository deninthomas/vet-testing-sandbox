import mongoose, { Schema } from 'mongoose';

const DonationSchema = new Schema(
  {
    donorName: { type: String, required: true },
    amount: { type: Number, required: true },
    cause: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
