import mongoose, { Schema, Document } from 'mongoose';

export interface IMigration extends Document {
  id: string;
  name: string;
  runAt: Date;
}

const MigrationSchema = new Schema<IMigration>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  runAt: { type: Date, default: () => new Date() },
});

export const Migration = mongoose.models.Migration || mongoose.model<IMigration>('Migration', MigrationSchema);



