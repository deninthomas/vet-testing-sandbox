import mongoose, { Schema } from 'mongoose';

const FeedbackSchema = new Schema(
  {
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
