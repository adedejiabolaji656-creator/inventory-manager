import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import { emitEvent } from '../utils/socket.js';

export const stockIn = async (req, res, next) => {
  try {
    const { productId, quantity, reason, note, reference } = req.body;
    if (!productId || quantity <= 0) return res.status(400).json({ message: 'Invalid input' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.quantity += quantity;
    await product.save();

    const movement = await StockMovement.create({
      product: productId,
      type: 'stock-in',
      quantity,
      reason,
      note,
      reference,
      createdBy: req.user._id,
    });

    emitEvent('stock:update', { type: 'stock-in', product, movement });
    res.status(201).json({ message: 'Stock added', product, movement });
  } catch (err) {
    next(err);
  }
};

export const stockOut = async (req, res, next) => {
  try {
    const { productId, quantity, reason, note, reference } = req.body;
    if (!productId || quantity <= 0) return res.status(400).json({ message: 'Invalid input' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.quantity}` });
    }

    product.quantity -= quantity;
    await product.save();

    const movement = await StockMovement.create({
      product: productId,
      type: 'stock-out',
      quantity,
      reason,
      note,
      reference,
      createdBy: req.user._id,
    });

    emitEvent('stock:update', { type: 'stock-out', product, movement });
    res.status(201).json({ message: 'Stock removed', product, movement });
  } catch (err) {
    next(err);
  }
};

export const getMovements = async (req, res, next) => {
  try {
    const { type, productId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (productId) filter.product = productId;

    const movements = await StockMovement.find(filter)
      .populate('product', 'name sku')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(movements);
  } catch (err) {
    next(err);
  }
};
