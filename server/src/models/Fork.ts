import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFork extends Document {
  parentSeed: Types.ObjectId;
  author: Types.ObjectId;
  contentDelta?: string;
  summary?: string;
  createdAt: Date;
}

const ForkSchema = new Schema<IFork>(
  {
    parentSeed: { type: Schema.Types.ObjectId, ref: 'Seed', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentDelta: { type: String, maxlength: 20000 },
    summary: { type: String, maxlength: 400 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Fork = mongoose.models.Fork || mongoose.model<IFork>('Fork', ForkSchema);



