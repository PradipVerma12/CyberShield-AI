import mongoose, { Document, Schema } from 'mongoose';

export type ScanModule =
  | 'url'
  | 'email'
  | 'port'
  | 'password'
  | 'file-encryption';

export type ScanVerdict = 'safe' | 'suspicious' | 'malicious' | 'phishing' | 'spam' | 'clean' | 'strong' | 'weak' | 'moderate';

export interface IScanHistory extends Document {
  userId: mongoose.Types.ObjectId;
  module: ScanModule;
  input: string;
  result: Record<string, unknown>;
  riskScore?: number;
  verdict?: string;
  createdAt: Date;
}

const scanHistorySchema = new Schema<IScanHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: ['url', 'email', 'port', 'password', 'file-encryption'],
      required: true,
    },
    input: { type: String, required: true, maxlength: 5000 },
    result: { type: Schema.Types.Mixed, required: true },
    riskScore: { type: Number, min: 0, max: 100 },
    verdict: { type: String },
  },
  { timestamps: true }
);

const ScanHistory = mongoose.model<IScanHistory>('ScanHistory', scanHistorySchema);
export default ScanHistory;
