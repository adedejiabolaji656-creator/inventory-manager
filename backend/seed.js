import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Supplier from './models/Supplier.js';
import StockMovement from './models/StockMovement.js';
import Sale from './models/Sale.js';

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Supplier.deleteMany(),
    StockMovement.deleteMany(),
    Sale.deleteMany(),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@inventory.com',
    password: 'admin123',
    role: 'admin',
  });
  const manager = await User.create({
    name: 'Manager User',
    email: 'manager@inventory.com',
    password: 'manager123',
    role: 'manager',
  });
  const staff = await User.create({
    name: 'Staff User',
    email: 'staff@inventory.com',
    password: 'staff123',
    role: 'staff',
  });

  const suppliers = await Supplier.insertMany([
    { name: 'Acme Supplies', contactPerson: 'John', email: 'john@acme.com', phone: '123456', address: 'NY' },
    { name: 'Globex Corp', contactPerson: 'Jane', email: 'jane@globex.com', phone: '654321', address: 'LA' },
    { name: 'Initech', contactPerson: 'Bob', email: 'bob@initech.com', phone: '111222', address: 'SF' },
  ]);

  const products = await Product.insertMany([
    { name: 'Wireless Mouse', sku: 'SKU-001', category: 'Electronics', quantity: 25, minStock: 5, unitPrice: 25, supplier: suppliers[0]._id, createdBy: admin._id },
    { name: 'Mechanical Keyboard', sku: 'SKU-002', category: 'Electronics', quantity: 4, minStock: 6, unitPrice: 80, supplier: suppliers[1]._id, createdBy: admin._id },
    { name: 'Desk Chair', sku: 'SKU-003', category: 'Furniture', quantity: 12, minStock: 3, unitPrice: 150, supplier: suppliers[2]._id, createdBy: admin._id },
    { name: 'USB Hub', sku: 'SKU-004', category: 'Electronics', quantity: 60, minStock: 10, unitPrice: 12, supplier: suppliers[0]._id, createdBy: admin._id },
    { name: 'Monitor 24"', sku: 'SKU-005', category: 'Electronics', quantity: 8, minStock: 2, unitPrice: 200, supplier: suppliers[1]._id, createdBy: admin._id },
    { name: 'Office Lamp', sku: 'SKU-006', category: 'Furniture', quantity: 0, minStock: 4, unitPrice: 35, supplier: suppliers[2]._id, createdBy: admin._id },
  ]);

  const mov = await StockMovement.insertMany([
    { product: products[0]._id, type: 'stock-in', quantity: 25, reason: 'Initial stock', createdBy: staff._id },
    { product: products[1]._id, type: 'stock-in', quantity: 10, reason: 'Initial stock', createdBy: staff._id },
  ]);

  await Sale.create({
    invoiceNo: 'INV-1000',
    items: [
      { product: products[0]._id, productName: products[0].name, quantity: 2, unitPrice: 25 },
      { product: products[3]._id, productName: products[3].name, quantity: 5, unitPrice: 12 },
    ],
    totalAmount: 110,
    paymentMethod: 'cash',
    createdBy: staff._id,
  });

  console.log('Seed complete!');
  console.log('--- Login accounts ---');
  console.log('Admin:   admin@inventory.com / admin123');
  console.log('Manager: manager@inventory.com / manager123');
  console.log('Staff:   staff@inventory.com / staff123');
  process.exit(0);
};

seed();
