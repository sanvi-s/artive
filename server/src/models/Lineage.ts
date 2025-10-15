import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILineage extends Document {
  seedId: Types.ObjectId;
  children: Types.ObjectId[];
  ancestorChain?: Types.ObjectId[];
}

const LineageSchema = new Schema<ILineage>({
  seedId: { type: Schema.Types.ObjectId, ref: 'Seed', required: true, unique: true, index: true },
  children: [{ type: Schema.Types.ObjectId, ref: 'Seed', index: true }],
  ancestorChain: [{ type: Schema.Types.ObjectId, ref: 'Seed' }],
});

export const Lineage = mongoose.models.Lineage || mongoose.model<ILineage>('Lineage', LineageSchema);



