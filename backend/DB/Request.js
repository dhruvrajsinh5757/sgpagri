import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agroId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgroBusiness', required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Responded', 'Rejected'],
    default: 'Pending' 
  },
  response: { type: String },
  farmerName: { type: String },
  farmerPhone: { type: String },
  farmerEmail: { type: String },
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
