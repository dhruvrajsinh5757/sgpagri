import mongoose from "mongoose";

const agroBusinessSchema = new mongoose.Schema({
  agroName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String },
  agroType: { type: String, enum: ['Supplier', 'Buyer', 'Machinery Provider', 'NGO', 'Other'], required: true },
  services: { type: [String], default: [] },
  gstNumber: { type: String, required: true },
  socialLinks: { type: [String], default: [] },
  workingHours: { type: mongoose.Schema.Types.Mixed },
  logoPath: { type: String },
  idProofPath: { type: String },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model("AgroBusiness", agroBusinessSchema);


