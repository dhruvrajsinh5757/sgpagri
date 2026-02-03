import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  crop: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
  cropName: { type: String, required: true },
  alertType: { 
    type: String, 
    enum: ["warning", "over-budget", "custom-threshold"], 
    required: true 
  },
  message: { type: String, required: true },
  budgetUsage: { type: Number, required: true }, // percentage
  threshold: { type: Number, required: true }, // threshold that triggered this alert
  amount: { type: Number, required: true }, // current spent amount
  budget: { type: Number, required: true }, // total budget
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false },
  customThreshold: { type: Number }, // user-defined threshold percentage
  sentVia: [{
    method: { type: String, enum: ["in-app", "sms", "email"] },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["sent", "failed"], default: "sent" }
  }],
  metadata: {
    previousUsage: Number,
    triggerAmount: Number,
    daysUntilHarvest: Number
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
alertSchema.index({ user: 1, crop: 1, createdAt: -1 });
alertSchema.index({ user: 1, isRead: 1, isDismissed: 1 });

export default mongoose.model("Alert", alertSchema); 