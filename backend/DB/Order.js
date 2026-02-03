import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agroId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgroBusiness', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Placed', 'Accepted', 'Shipped', 'Completed', 'Rejected'],
    default: 'Placed' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid'],
    default: 'Pending' 
  },
  invoicePath: { type: String },
  farmerName: { type: String },
  farmerPhone: { type: String },
  farmerEmail: { type: String },
  deliveryAddress: { type: String },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);


