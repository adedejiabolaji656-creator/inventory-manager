import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, default: 0 },
    minStock: { type: Number, default: 5 },
    unitPrice: { type: Number, required: true, default: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

productSchema.virtual('stockStatus').get(function () {
  if (this.quantity <= 0) return 'out_of_stock';
  if (this.quantity <= this.minStock) return 'low';
  return 'in_stock';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
