import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import Sale from '../models/Sale.js';
import StockMovement from '../models/StockMovement.js';

export const getDashboard = async (req, res, next) => {
  try {
    const [totalProducts, totalSuppliers, totalSales, lowStock, outOfStock, allProducts] =
      await Promise.all([
        Product.countDocuments(),
        Supplier.countDocuments(),
        Sale.countDocuments(),
        Product.countDocuments({ $expr: { $gt: ['$minStock', '$quantity'] } }),
        Product.countDocuments({ quantity: 0 }),
        Product.find().select('name quantity minStock'),
      ]);

    const revenueAgg = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Stock distribution
    const stockDistribution = allProducts.reduce(
      (acc, p) => {
        if (p.quantity <= 0) {
          acc.out_of_stock.count += 1;
          acc.out_of_stock.stock += p.quantity;
        } else if (p.quantity <= p.minStock) {
          acc.low.count += 1;
          acc.low.stock += p.quantity;
        } else {
          acc.in_stock.count += 1;
          acc.in_stock.stock += p.quantity;
        }
        return acc;
      },
      { in_stock: { count: 0, stock: 0 }, low: { count: 0, stock: 0 }, out_of_stock: { count: 0, stock: 0 } }
    );

    res.json({
      totalProducts,
      totalSuppliers,
      totalSales,
      totalRevenue: revenueAgg[0]?.total || 0,
      lowStock,
      outOfStock,
      stockDistribution,
      lowStockProducts: allProducts
        .filter((p) => p.quantity <= p.minStock)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
};

export const getCharts = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;

    const dailySales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    const recentMovements = await StockMovement.find()
      .populate('product', 'name')
      .sort('-createdAt')
      .limit(10);

    res.json({ dailySales, topProducts, recentMovements });
  } catch (err) {
    next(err);
  }
};
