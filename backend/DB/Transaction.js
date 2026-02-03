import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    person: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String },
    crop: { type: String },
    project: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);

