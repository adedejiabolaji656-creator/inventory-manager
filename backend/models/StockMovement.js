import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['stock-in', 'stock-out'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true },
    note: { type: String, trim: true },
    reference: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);
export default StockMovement;
