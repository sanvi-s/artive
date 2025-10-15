import mongoose, { Schema, Document, Types } from 'mongoose';

export type SeedType = 'poem' | 'visual' | 'music' | 'code' | 'other';

export interface ISeed extends Document {
  title: string;
  contentSnippet?: string;
  contentFull?: string;
  contentIsExternal?: boolean;
  type: SeedType;
  author: Types.ObjectId;
  forkCount: number;
  likes?: number;
  tags?: string[];
  thumbnailUrl?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SeedSchema = new Schema<ISeed>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    contentSnippet: { type: String, maxlength: 400 },
    contentFull: { type: String, maxlength: 20000 },
    contentIsExternal: { type: Boolean, default: false },
    type: { type: String, enum: ['poem', 'visual', 'music', 'code', 'other'], default: 'other', index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    forkCount: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    tags: { type: [String], index: true },
    thumbnailUrl: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

SeedSchema.index({ type: 1, createdAt: -1 });
SeedSchema.index({ title: 'text', contentSnippet: 'text' });

export const Seed = mongoose.models.Seed || mongoose.model<ISeed>('Seed', SeedSchema);



