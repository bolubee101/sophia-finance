import mongoose, { Document, Schema } from 'mongoose';

export interface InsightDocument extends Document {
  sessionId: string;
  createdAt: Date;
  insight: string;
}

const InsightSchema = new Schema<InsightDocument>({
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  insight: String,
});

export default mongoose.model<InsightDocument>('Insight', InsightSchema);