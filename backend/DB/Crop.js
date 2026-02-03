import mongoose from "mongoose";

const cropSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date, required: true },
    plannedBudget: { type: Number, required: true },
    customThreshold: { type: Number },
  },
  { timestamps: true }
);

cropSchema.index({ user: 1, name: 1 }, { unique: false });

export default mongoose.model("Crop", cropSchema);

