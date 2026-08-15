import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import { emitEvent } from '../utils/socket.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, stockStatus } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (stockStatus) {
      if (stockStatus === 'low') filter.$expr = { $lte: ['$quantity', '$minStock'] };
      if (stockStatus === 'out_of_stock') filter.quantity = { $lte: 0 };
      if (stockStatus === 'in_stock') filter.$expr = { $gt: ['$quantity', '$minStock'] };
    }

    const products = await Product.find(filter).populate('supplier', 'name');
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({ ...req.body, createdBy: req.user._id });
    emitEvent('product:update', { action: 'created', product });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    emitEvent('product:update', { action: 'updated', product });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await StockMovement.deleteMany({ product: product._id });
    await product.deleteOne();
    emitEvent('product:update', { action: 'deleted', id: req.params.id });
    res.json({ message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.filter((c) => c));
  } catch (err) {
    next(err);
  }
};
