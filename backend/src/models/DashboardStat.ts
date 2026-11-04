import mongoose, { Document, Schema } from 'mongoose';

export interface IDashboardStat extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  threatsDetected: number;
  urlsScanned: number;
  emailsAnalyzed: number;
  portsScanned: number;
  filesEncrypted: number;
}

const dashboardStatSchema = new Schema<IDashboardStat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    threatsDetected: { type: Number, default: 0 },
    urlsScanned: { type: Number, default: 0 },
    emailsAnalyzed: { type: Number, default: 0 },
    portsScanned: { type: Number, default: 0 },
    filesEncrypted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index to enforce one stat document per user per day
dashboardStatSchema.index({ userId: 1, date: 1 }, { unique: true });

const DashboardStat = mongoose.model<IDashboardStat>('DashboardStat', dashboardStatSchema);
export default DashboardStat;
