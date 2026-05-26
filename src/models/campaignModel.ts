import mongoose, { Schema } from 'mongoose';

const CampaignSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
