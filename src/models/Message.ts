import mongoose, { Schema, Document } from 'mongoose';

export interface MessageDocument extends Document {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<MessageDocument>({
  sessionId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<MessageDocument>('Message', MessageSchema);
