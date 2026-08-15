import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { emitEvent } from '../utils/socket.js';

export const getSales = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const sales = await Sale.find(filter).populate('items.product', 'name sku').sort('-createdAt');
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const { items, customerName, paymentMethod } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: 'No items provided' });

    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `${product.name} has insufficient stock (available: ${product.quantity})`,
        });
      }

      const unitPrice = item.unitPrice ?? product.unitPrice;
      product.quantity -= item.quantity;
      await product.save();

      totalAmount += unitPrice * item.quantity;
      saleItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
      });
    }

    const invoiceNo = `INV-${Date.now()}`;
    const sale = await Sale.create({
      invoiceNo,
      items: saleItems,
      totalAmount,
      customerName,
      paymentMethod: paymentMethod || 'cash',
      createdBy: req.user._id,
    });

    emitEvent('sale:update', { sale });
    emitEvent('stock:update', { type: 'sale', sale });

    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

export const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('items.product', 'name sku');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};
