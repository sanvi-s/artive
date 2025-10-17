import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFork extends Document {
  parentSeed: Types.ObjectId;
  author: Types.ObjectId;
  contentDelta?: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  forkCount: number;
  createdAt: Date;
}

const ForkSchema = new Schema<IFork>(
  {
    parentSeed: { type: Schema.Types.ObjectId, ref: 'Seed', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentDelta: { type: String, maxlength: 20000 },
    summary: { type: String, maxlength: 400 },
    description: { type: String, maxlength: 1000 },
    imageUrl: { type: String },
    thumbnailUrl: { type: String },
    forkCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Fork = mongoose.models.Fork || mongoose.model<IFork>('Fork', ForkSchema);



