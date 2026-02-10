import express from "express";
import User from "./User.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import AgroBusiness from "./AgroBusiness.js";
import crypto from "crypto";
import Expense from "./Expense.js";
import axios from "axios";
import Income from "./Income.js";
import Person from "./Person.js";
import Transaction from "./Transaction.js";
import Crop from "./Crop.js";
import Alert from "./Alert.js";
import Settings from "./Settings.js";
import Product from "./Product.js";
import FarmerRequest from "./FarmerRequest.js";
import Order from "./Order.js";
import Request from "./Request.js";
import Notification from "./Notification.js";
const router = express.Router();

// File upload setup for logos and ID proofs
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Agro-Business Registration
router.post('/agro/register', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      agroName,
      ownerName,
      email,
      phone,
      password,
      city,
      address,
      location,
      agroType,
      services,
      gstNumber,
      socialLinks,
      workingHours
    } = req.body;

    if (!agroName || !ownerName || !email || !phone || !password || !city || !address || !agroType || !gstNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingAgro = await AgroBusiness.findOne({ email });
    if (existingAgro) return res.status(400).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const logoFile = req.files?.logo?.[0];
    const idProofFile = req.files?.idProof?.[0];

    const newAgro = new AgroBusiness({
      agroName,
      ownerName,
      email,
      phone,
      passwordHash,
      city,
      address,
      location,
      agroType,
      services: services ? (Array.isArray(services) ? services : String(services).split(',').map(s => s.trim()).filter(Boolean)) : [],
      gstNumber,
      socialLinks: socialLinks ? (Array.isArray(socialLinks) ? socialLinks : String(socialLinks).split(',').map(s => s.trim()).filter(Boolean)) : [],
      workingHours: workingHours ? JSON.parse(workingHours) : undefined,
      logoPath: logoFile ? `/uploads/${logoFile.filename}` : undefined,
      idProofPath: idProofFile ? `/uploads/${idProofFile.filename}` : undefined,
    });

    await newAgro.save();
    const { passwordHash: _ph, ...agroSafe } = newAgro.toObject();
    res.status(201).json({ message: 'Agro-Business account created', agro: agroSafe });
  } catch (err) {
    console.error('Agro register error:', err);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

// Products CRUD
router.post('/product', upload.single('image'), async (req, res) => {
  try {
    const { email, name, category, price, quantity, discount = 0, description } = req.body;
    if (!email || !name || !category || !price || !quantity) {
      return res.status(400).json({ message: 'Missing required fields: email, name, category, price, quantity' });
    }
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const product = new Product({
      ownerId: agro._id,
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      discount: Number(discount) || 0,
      description: description || '',
      imagePath,
      isActive: true, // Ensure product is active by default
    });
    await product.save();
    console.log(`Product created: ${product._id} for agro ${agro._id}`);
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/product', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    // Return all products for the owner, regardless of isActive status or creation date
    const products = await Product.find({ ownerId: agro._id }).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products for agro ${agro._id}`);
    // Log product dates for debugging
    if (products.length > 0) {
      const oldestProduct = products[products.length - 1];
      const newestProduct = products[0];
      console.log(`Product date range: Oldest: ${oldestProduct.createdAt}, Newest: ${newestProduct.createdAt}`);
    }
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/product/:id', upload.single('image'), async (req, res) => {
  try {
    const { email, ...updates } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const prod = await Product.findOne({ _id: req.params.id, ownerId: agro._id });
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    
    if (req.file) {
      updates.imagePath = `/uploads/${req.file.filename}`;
    }
    
    Object.assign(prod, updates);
    await prod.save();
    res.json({ message: 'Product updated', product: prod });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/product/:id', async (req, res) => {
  try {
    const { email } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, ownerId: agro._id });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Marketplace - Get all products for farmers
router.get('/marketplace/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const products = await Product.find(filter)
      .populate('ownerId', 'agroName city')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Place Order
router.post('/order', async (req, res) => {
  try {
    const { farmerEmail, productId, quantity, deliveryAddress } = req.body;
    
    const farmer = await User.findOne({ email: farmerEmail });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const product = await Product.findById(productId).populate('ownerId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }
    
    const discountAmount = (product.price * product.discount) / 100;
    const discountedPrice = product.price - discountAmount;
    const totalPrice = discountedPrice * quantity;
    
    const order = new Order({
      productId: product._id,
      farmerId: farmer._id,
      agroId: product.ownerId._id,
      quantity,
      totalPrice,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerEmail: farmer.email,
      deliveryAddress,
    });
    
    await order.save();
    
    // Create notification for agro business
    const notification = new Notification({
      userId: product.ownerId._id,
      userRole: 'agro',
      type: 'Order',
      title: 'New Order Received',
      body: `${farmer.name} placed an order for ${quantity} units of ${product.name}`,
      relatedId: order._id,
    });
    await notification.save();
    
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send Request/Enquiry
router.post('/request', async (req, res) => {
  try {
    const { farmerEmail, productId, message } = req.body;
    
    const farmer = await User.findOne({ email: farmerEmail });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const product = await Product.findById(productId).populate('ownerId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const request = new Request({
      productId: product._id,
      farmerId: farmer._id,
      agroId: product.ownerId._id,
      message,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      farmerEmail: farmer.email,
    });
    
    await request.save();
    
    // Create notification for agro business
    const notification = new Notification({
      userId: product.ownerId._id,
      userRole: 'agro',
      type: 'Request',
      title: 'New Enquiry Received',
      body: `${farmer.name} sent an enquiry about ${product.name}`,
      relatedId: request._id,
    });
    await notification.save();
    
    res.status(201).json({ message: 'Request sent successfully', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get farmer's orders
router.get('/farmer/orders', async (req, res) => {
  try {
    const { email } = req.query;
    const farmer = await User.findOne({ email });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    
    const orders = await Order.find({ farmerId: farmer._id })
      .populate('productId', 'name category price imagePath')
      .populate('agroId', 'agroName city')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get agro's orders
router.get('/agro/orders', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const orders = await Order.find({ agroId: agro._id })
      .populate('productId', 'name category price imagePath')
      .populate('farmerId', 'name phone email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get agro's requests
router.get('/agro/requests', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const requests = await Request.find({ agroId: agro._id })
      .populate('productId', 'name category price imagePath')
      .populate('farmerId', 'name phone email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch('/order/:id/status', async (req, res) => {
  try {
    const { email, status, paymentStatus } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const order = await Order.findOne({ _id: req.params.id, agroId: agro._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    
    // Create notification for farmer
    const notification = new Notification({
      userId: order.farmerId,
      userRole: 'farmer',
      type: 'Order',
      title: 'Order Status Updated',
      body: `Your order status has been updated to ${status}`,
      relatedId: order._id,
    });
    await notification.save();
    
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Respond to request
router.patch('/request/:id/respond', async (req, res) => {
  try {
    const { email, response, status } = req.body;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    const request = await Request.findOne({ _id: req.params.id, agroId: agro._id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    request.response = response;
    request.status = status || 'Responded';
    
    await request.save();
    
    // Create notification for farmer
    const notification = new Notification({
      userId: request.farmerId,
      userRole: 'farmer',
      type: 'Request',
      title: 'Response Received',
      body: `You received a response to your enquiry`,
      relatedId: request._id,
    });
    await notification.save();
    
    res.json({ message: 'Response sent', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Orders listing (basic)
router.get('/orders', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const orders = await Order.find({ agroId: agro._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get notifications for user
router.get('/notifications', async (req, res) => {
  try {
    const { email, userRole } = req.query;
    
    let user;
    if (userRole === 'agro') {
      user = await AgroBusiness.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const notifs = await Notification.find({ 
      userId: user._id, 
      userRole: userRole || 'farmer' 
    }).sort({ createdAt: -1 });
    
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const { email, userRole } = req.body;
    
    let user;
    if (userRole === 'agro') {
      user = await AgroBusiness.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dismiss (delete) a notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { email, userRole } = req.body;
    let user;
    if (userRole === 'agro') {
      user = await AgroBusiness.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    const result = await Notification.deleteOne({ _id: req.params.id, userId: user._id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification dismissed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple analytics placeholder
router.get('/analytics', async (req, res) => {
  try {
    const { email } = req.query;
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const [orders, products] = await Promise.all([
      Order.find({ agroId: agro._id }),
      Product.find({ ownerId: agro._id })
    ]);
    const monthlySales = {};
    orders.forEach(o => {
      const k = new Date(o.createdAt).toISOString().slice(0,7);
      monthlySales[k] = (monthlySales[k] || 0) + (o.totalPrice || 0);
    });
    res.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      monthlySales,
      topProducts: products.slice(0,5).map(p => ({ name: p.name, sold: Math.floor(Math.random()*50)+1 }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Shared Auth Login for Farmer and Agro
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // Try farmer first
    let account = await User.findOne({ email });
    if (account) {
      const isMatch = await bcrypt.compare(password, account.password);
      if (isMatch) {
        const { password: _pw, ...farmerSafe } = account.toObject();
        return res.json({ role: 'farmer', ...farmerSafe });
      }
      // If farmer password doesn't match, continue to try agro-business before failing
    }

    // Try agro-business
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(password, agro.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Incorrect password' });
    const { passwordHash: _ph, ...agroSafe } = agro.toObject();
    return res.json({ role: 'agro', ...agroSafe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Agro-Business profile by ID
router.get('/agro/:id', async (req, res) => {
  try {
    const agro = await AgroBusiness.findById(req.params.id).lean();
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    delete agro.passwordHash;
    res.json(agro);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Simple Agro dashboard data
router.get('/agro/dashboard', async (req, res) => {
  try {
    const { email, id } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Aggregations - return all products regardless of isActive status
    // Note: For dashboard summary, we limit to recent items, but full product list is available via /product endpoint
    const [products, orders, notifications] = await Promise.all([
      Product.find({ ownerId: agro._id }).sort({ createdAt: -1 }).limit(8),
      Order.find({ agroId: agro._id }).sort({ createdAt: -1 }).limit(10),
      Notification.find({ userId: agro._id, userRole: 'agro' }).sort({ createdAt: -1 }).limit(10)
    ]);
    console.log(`Dashboard: Found ${products.length} products for agro ${agro._id}`);

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, { Placed: 0, Accepted: 0, Shipped: 0, Completed: 0, Rejected: 0 });

    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    const dashboard = {
      summary: {
        agroName: agro.agroName,
        agroType: agro.agroType,
        city: agro.city,
        workingHours: agro.workingHours || null,
        logoPath: agro.logoPath || null,
        servicesCount: (agro.services || []).length,
      },
      services: agro.services || [],
      stats: {
        products: products.length,
        orders: orders.length,
        pendingOrders: statusCounts.Placed,
        revenue: totalRevenue,
        unreadNotifications,
      },
      recent: {
        products,
        orders,
        notifications,
      }
    };
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro Dashboard: metrics only
router.get('/agro/dashboard/metrics', async (req, res) => {
  try {
    const { id, email } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Count all products regardless of isActive status
    const [productsCount, orders, completedOrders] = await Promise.all([
      Product.countDocuments({ ownerId: agro._id }),
      Order.find({ agroId: agro._id }).select('status totalPrice'),
      Order.find({ agroId: agro._id, status: 'Completed' }).select('totalPrice')
    ]);
    const ordersCount = orders.length;
    const pendingOrders = orders.filter(o => (o.status === 'Placed' || o.status === 'Pending')).length;
    const revenue = completedOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    console.log(`Metrics: ${productsCount} products, ${ordersCount} orders for agro ${agro._id}`);
    res.json({ products: productsCount, orders: ordersCount, pendingOrders, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro profile minimal
router.get('/agro/profile', async (req, res) => {
  try {
    const { id, email } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    const { passwordHash, resetToken, resetTokenExpires, ...safe } = agro.toObject();
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro services
router.get('/agro/services', async (req, res) => {
  try {
    const { id, email } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    res.json({ services: agro.services || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/agro/services', async (req, res) => {
  try {
    const { id, email, service } = req.body;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    if (!service || !String(service).trim()) return res.status(400).json({ message: 'Service is required' });
    const list = Array.isArray(agro.services) ? agro.services : [];
    list.push(String(service).trim());
    agro.services = Array.from(new Set(list));
    await agro.save();
    res.json({ message: 'Service added', services: agro.services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recent products
router.get('/agro/products/recent', async (req, res) => {
  try {
    const { id, email, limit = 10 } = req.query;
    console.log('Recent products request:', { id, email, limit });
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    console.log('Found agro business:', agro._id);
    // Return all products, regardless of isActive status, sorted by newest first
    const products = await Product.find({ ownerId: agro._id }).sort({ createdAt: -1 }).limit(Number(limit));
    console.log(`Found ${products.length} recent products for agro ${agro._id}`);
    res.json(products);
  } catch (err) {
    console.error('Error in recent products:', err);
    res.status(500).json({ message: err.message });
  }
});

// Recent orders
router.get('/agro/orders/recent', async (req, res) => {
  try {
    const { id, email, limit = 5 } = req.query;
    console.log('Recent orders request:', { id, email, limit });
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    console.log('Found agro business for orders:', agro._id);
    const orders = await Order.find({ agroId: agro._id })
      .populate('productId', 'name category price imagePath')
      .populate('farmerId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    console.log('Found orders:', orders.length);
    res.json(orders);
  } catch (err) {
    console.error('Error in recent orders:', err);
    res.status(500).json({ message: err.message });
  }
});

// Recent notifications for agro
router.get('/agro/notifications', async (req, res) => {
  try {
    const { id, email, limit = 5 } = req.query;
    console.log('Recent notifications request:', { id, email, limit });
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    console.log('Found agro business for notifications:', agro._id);
    const notifications = await Notification.find({ userId: agro._id, userRole: 'agro' })
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error('Error in recent notifications:', err);
    res.status(500).json({ message: err.message });
  }
});

// Agro-Business Forgot Password - generate reset token
router.post('/agro/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const agro = await AgroBusiness.findOne({ email });
    if (!agro) return res.status(404).json({ message: 'User not found' });
    const token = crypto.randomBytes(20).toString('hex');
    agro.resetToken = token;
    agro.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await agro.save();
    // In production, send email or WhatsApp. For now, return token for client flow.
    res.json({ message: 'Reset token generated', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Agro-Business Reset Password using token
router.post('/agro/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await AgroBusiness.findOneAndUpdate(
      { resetToken: token, resetTokenExpires: { $gt: new Date() } },
      { $set: { passwordHash }, $unset: { resetToken: "", resetTokenExpires: "" } },
      { new: true }
    );
    if (!updated) return res.status(400).json({ message: 'Invalid or expired token' });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to generate alerts for budget usage
const generateBudgetAlerts = async (userId, cropId, cropName, currentAmount, budget) => {
  try {
    const usagePercentage = (currentAmount / budget) * 100;
    
    // Check for existing alerts to avoid duplicates
    const existingAlerts = await Alert.find({ 
      user: userId, 
      crop: cropId, 
      isDismissed: false 
    });
    
    let alertsCreated = [];
    
    // Warning alert at 90%
    if (usagePercentage >= 90 && usagePercentage < 100) {
      const hasWarning = existingAlerts.some(a => a.alertType === 'warning');
      if (!hasWarning) {
        const warningAlert = new Alert({
          user: userId,
          crop: cropId,
          cropName,
          alertType: 'warning',
          message: `Budget usage for ${cropName} has reached ${usagePercentage.toFixed(1)}%`,
          budgetUsage: usagePercentage,
          threshold: 90,
          amount: currentAmount,
          budget,
          sentVia: [{ method: 'in-app', status: 'sent' }]
        });
        await warningAlert.save();
        alertsCreated.push(warningAlert);
      }
    }
    
    // Over-budget alert at 100%
    if (usagePercentage >= 100) {
      const hasOverBudget = existingAlerts.some(a => a.alertType === 'over-budget');
      if (!hasOverBudget) {
        const overBudgetAlert = new Alert({
          user: userId,
          crop: cropId,
          cropName,
          alertType: 'over-budget',
          message: `Budget for ${cropName} has been exceeded by ₹${(currentAmount - budget).toFixed(2)}`,
          budgetUsage: usagePercentage,
          threshold: 100,
          amount: currentAmount,
          budget,
          sentVia: [{ method: 'in-app', status: 'sent' }]
        });
        await overBudgetAlert.save();
        alertsCreated.push(overBudgetAlert);
      }
    }
    
    return alertsCreated;
  } catch (error) {
    console.error('Error generating budget alerts:', error);
    return [];
  }
};

// Crop management
router.post('/crop', async (req, res) => {
  try {
    const { email, name, startDate, expectedHarvestDate, plannedBudget } = req.body;
    if (!email || !name || !startDate || !expectedHarvestDate || plannedBudget == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const crop = new Crop({
      user: user._id,
      name,
      startDate: new Date(startDate),
      expectedHarvestDate: new Date(expectedHarvestDate),
      plannedBudget: Number(plannedBudget),
    });
    await crop.save();
    res.status(201).json({ message: 'Crop added', crop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/crop', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const crops = await Crop.find({ user: user._id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/crop/summary', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const [crops, expenses] = await Promise.all([
      Crop.find({ user: user._id }),
      Expense.find({ user: user._id }),
    ]);
    const summaries = crops.map(c => {
      const spent = expenses.filter(e => e.crop === c.name).reduce((s, e) => s + e.amount, 0);
      return {
        name: c.name,
        plannedBudget: c.plannedBudget,
        totalSpent: spent,
        remainingBudget: c.plannedBudget - spent,
      };
    });
    const totals = summaries.reduce((acc, s) => {
      acc.plannedBudget += s.plannedBudget;
      acc.totalSpent += s.totalSpent;
      acc.remainingBudget += s.remainingBudget;
      return acc;
    }, { plannedBudget: 0, totalSpent: 0, remainingBudget: 0 });
    res.json({ summaries, totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/crop/expenses', async (req, res) => {
  try {
    const { email, crop } = req.query;
    if (!email || !crop) return res.status(400).json({ message: 'Email and crop are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const cropDoc = await Crop.findOne({ user: user._id, name: crop });
    if (!cropDoc) return res.status(404).json({ message: 'Crop not found' });
    const expenses = await Expense.find({ user: user._id, crop }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Alert management endpoints
router.get('/alerts', async (req, res) => {
  try {
    const { email, unreadOnly = false } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const filter = { user: user._id, isDismissed: false };
    if (unreadOnly === 'true') filter.isRead = false;
    
    const alerts = await Alert.find(filter)
      .populate('crop', 'name startDate expectedHarvestDate')
      .sort({ createdAt: -1 });
    
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/alerts/:id/read', async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const alert = await Alert.findOneAndUpdate(
      { _id: id, user: user._id },
      { isRead: true },
      { new: true }
    );
    
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert marked as read', alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/alerts/:id/dismiss', async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email is required' });
    
    const alert = await Alert.findOneAndUpdate(
      { _id: id, user: user._id },
      { isDismissed: true },
      { new: true }
    );
    
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert dismissed', alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/crop/:id/threshold', async (req, res) => {
  try {
    const { email, threshold } = req.body;
    const { id } = req.params;
    if (!email || threshold === undefined) return res.status(400).json({ message: 'Email and threshold are required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const crop = await Crop.findOne({ _id: id, user: user._id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    
    // Persist the custom threshold on the crop
    crop.customThreshold = Number(threshold);
    await crop.save();

    // Check if threshold is already crossed
    const cropExpenses = await Expense.find({ user: user._id, crop: crop.name });
    const totalSpent = cropExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const usagePercentage = (totalSpent / crop.plannedBudget) * 100;
    
    if (usagePercentage >= threshold) {
      // Create custom threshold alert
      const customAlert = new Alert({
        user: user._id,
        crop: crop._id,
        cropName: crop.name,
        alertType: 'custom-threshold',
        message: `Custom threshold of ${threshold}% reached for ${crop.name}`,
        budgetUsage: usagePercentage,
        threshold: threshold,
        amount: totalSpent,
        budget: crop.plannedBudget,
        customThreshold: threshold,
        sentVia: [{ method: 'in-app', status: 'sent' }]
      });
      await customAlert.save();
    }
    
    res.json({ message: 'Custom threshold set', threshold, currentUsage: usagePercentage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, userType });
    await user.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email
router.post("/by-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  console.log("login")

  try {
    console.log(req.body)
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Expense
router.post("/expense", async (req, res) => {
  try {
    const { email, amount, category, crop, date, note } = req.body;
    if (!email || !amount || !category) return res.status(400).json({ message: "Email, amount, and category are required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Optional: validate crop name exists for this user
    let cropName = crop;
    let cropDoc = null;
    if (cropName) {
      cropDoc = await Crop.findOne({ user: user._id, name: cropName });
      if (!cropDoc) {
        return res.status(400).json({ message: "Selected crop does not exist" });
      }
    }
    
    const expense = new Expense({
      user: user._id,
      amount,
      category,
      crop: cropName,
      date: date ? new Date(date) : undefined,
      note,
    });
    await expense.save();
    
    // Generate budget alerts if this is a crop expense
    if (cropDoc) {
      const cropExpenses = await Expense.find({ user: user._id, crop: cropName });
      const totalSpent = cropExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    // Built-in 90%/100% alerts
    await generateBudgetAlerts(user._id, cropDoc._id, cropName, totalSpent, cropDoc.plannedBudget);

    // Custom threshold alert if saved on crop and crossed
    if (typeof cropDoc.customThreshold === 'number' && !Number.isNaN(cropDoc.customThreshold)) {
      const usagePercentage = (totalSpent / cropDoc.plannedBudget) * 100;
      if (usagePercentage >= cropDoc.customThreshold) {
        const existingCustom = await Alert.findOne({
          user: user._id,
          crop: cropDoc._id,
          alertType: 'custom-threshold',
          isDismissed: false,
        });
        if (!existingCustom) {
          const customAlert = new Alert({
            user: user._id,
            crop: cropDoc._id,
            cropName: cropName,
            alertType: 'custom-threshold',
            message: `Custom threshold of ${cropDoc.customThreshold}% reached for ${cropName}`,
            budgetUsage: usagePercentage,
            threshold: cropDoc.customThreshold,
            amount: totalSpent,
            budget: cropDoc.plannedBudget,
            customThreshold: cropDoc.customThreshold,
            sentVia: [{ method: 'in-app', status: 'sent' }]
          });
          await customAlert.save();
        }
      }
    }
    }
    
    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Income
router.post("/income", async (req, res) => {
  try {
    const { email, amount, category, crop, date, note } = req.body;
    if (!email || !amount || !category) return res.status(400).json({ message: "Email, amount, and category are required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    // Optional: validate crop name exists for this user
    let cropName = crop;
    if (cropName) {
      const cropDoc = await Crop.findOne({ user: user._id, name: cropName });
      if (!cropDoc) {
        return res.status(400).json({ message: "Selected crop does not exist" });
      }
    }
    const income = new Income({
      user: user._id,
      amount,
      category,
      crop: cropName,
      date: date ? new Date(date) : undefined,
      note,
    });
    await income.save();
    res.status(201).json({ message: "Income added successfully", income });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Reports with filters
router.post("/reports", async (req, res) => {
  try {
    const { email, startDate, endDate, filterType, selectedMonth, selectedYear } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    let start, end;
    const now = new Date();
    const year = selectedYear ? Number(selectedYear) : now.getFullYear();
    const monthIndex = selectedMonth ? Number(selectedMonth) - 1 : now.getMonth();
    
    // Set date range based on filter type
    switch (filterType) {
      case 'month':
        start = new Date(year, monthIndex, 1);
        end = new Date(year, monthIndex + 1, 0);
        break;
      case 'year':
        start = new Date(year, 0, 1);
        end = new Date(year, 11, 31);
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
        end = endDate ? new Date(endDate) : now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get income and expenses for the date range
    const income = await Income.find({
      user: user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const expenses = await Expense.find({
      user: user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Calculate totals
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Group by category
    const incomeByCategory = {};
    const expensesByCategory = {};

    income.forEach(item => {
      incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
    });

    expenses.forEach(item => {
      expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
    });

    // Group by date for trend analysis
    const incomeByDate = {};
    const expensesByDate = {};

    income.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      incomeByDate[dateKey] = (incomeByDate[dateKey] || 0) + item.amount;
    });

    expenses.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      expensesByDate[dateKey] = (expensesByDate[dateKey] || 0) + item.amount;
    });

    // Build crop summaries
    const crops = await Crop.find({ user: user._id });
    const cropSummaries = crops.map(c => {
      const spent = expenses.filter(e => e.crop === c.name).reduce((s, e) => s + e.amount, 0);
      return {
        name: c.name,
        plannedBudget: c.plannedBudget,
        totalSpent: spent,
        remainingBudget: c.plannedBudget - spent,
      }
    });

    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      incomeByCategory,
      expensesByCategory,
      incomeByDate,
      expensesByDate,
      income,
      expenses,
      dateRange: { start, end },
      cropSummaries,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all income and expenses for a user
router.post("/all-transactions", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const income = await Income.find({ user: user._id }).sort({ date: -1 });
    const expenses = await Expense.find({ user: user._id }).sort({ date: -1 });

    res.json({ income, expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Person management
router.post('/person', async (req, res) => {
  try {
    const { email, name, role, photo } = req.body;
    if (!email || !name) return res.status(400).json({ message: 'Email and name are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const person = new Person({ name, role, photo, created_by: user._id });
    await person.save();
    res.status(201).json({ message: 'Person created', person });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/person', async (req, res) => {
  try {
    const { email, q } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const filter = { created_by: user._id };
    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }
    const people = await Person.find(filter).sort({ createdAt: -1 });
    res.json(people);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/person/:id/transactions', async (req, res) => {
  try {
    const { email } = req.query;
    const { id } = req.params;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const txns = await Transaction.find({ user: user._id, person: id }).sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Transaction management
router.post('/transaction', async (req, res) => {
  try {
    const { email, personId, type, amount, category, date, description, crop, project } = req.body;
    if (!email || !personId || !type || !amount || !category)
      return res.status(400).json({ message: 'Missing required fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const txn = new Transaction({
      user: user._id,
      person: personId,
      type,
      amount,
      category,
      date: date ? new Date(date) : undefined,
      description,
      crop,
      project,
    });
    await txn.save();

    // Mirror to main Income/Expense collections
    if (type === 'income') {
      const inc = new Income({
        user: user._id,
        person: personId,
        amount,
        category,
        crop,
        date: date ? new Date(date) : undefined,
        note: description,
      });
      await inc.save();
    } else if (type === 'expense') {
      const exp = new Expense({
        user: user._id,
        person: personId,
        amount,
        category,
        crop,
        date: date ? new Date(date) : undefined,
        note: description,
      });
      await exp.save();
    }

    res.status(201).json({ message: 'Transaction added', transaction: txn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const { email, person_id, month, category, crop } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const filter = { user: user._id };
    if (person_id) filter.person = person_id;
    if (category) filter.category = category;
    if (crop) filter.crop = crop;

    if (month) {
      const [y, m] = month.split('-').map(Number); // YYYY-MM
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      filter.date = { $gte: start, $lte: end };
    }

    const txns = await Transaction.find(filter).populate('person').sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Settings management
router.get('/settings', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({ user: user._id });
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload Profile Photo
router.post('/settings/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!req.file) return res.status(400).json({ message: 'Photo file is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get the public URL for the uploaded file
    const photoUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: photoUrl,
      path: photoUrl,
    });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ message: err.message });
  }
});


router.put('/settings', async (req, res) => {
  try {
    const { email, ...settingsData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update settings with provided data
    Object.keys(settingsData).forEach(key => {
      if (settingsData[key] !== undefined) {
        settings[key] = settingsData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/profile', async (req, res) => {
  try {
    const { email, ...profileData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update profile settings
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== undefined) {
        settings.profile[key] = profileData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Profile updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/theme', async (req, res) => {
  try {
    const { email, ...themeData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update theme settings
    Object.keys(themeData).forEach(key => {
      if (themeData[key] !== undefined) {
        settings.theme[key] = themeData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Theme settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/notifications', async (req, res) => {
  try {
    const { email, ...notificationData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update notification settings
    Object.keys(notificationData).forEach(key => {
      if (notificationData[key] !== undefined) {
        settings.notifications[key] = notificationData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Notification settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/security', async (req, res) => {
  try {
    const { email, ...securityData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update security settings
    Object.keys(securityData).forEach(key => {
      if (securityData[key] !== undefined) {
        settings.security[key] = securityData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Security settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/preferences', async (req, res) => {
  try {
    const { email, ...preferenceData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update preference settings
    Object.keys(preferenceData).forEach(key => {
      if (preferenceData[key] !== undefined) {
        settings.preferences[key] = preferenceData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Preferences updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/account', async (req, res) => {
  try {
    const { email, ...accountData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update account settings
    Object.keys(accountData).forEach(key => {
      if (accountData[key] !== undefined) {
        settings.account[key] = accountData[key];
      }
    });
    
    await settings.save();
    res.json({ message: 'Account settings updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/settings/agricultural', async (req, res) => {
  try {
    const { email, ...agriculturalData } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let settings = await Settings.findOne({ user: user._id });
    if (!settings) {
      settings = new Settings({ user: user._id });
    }
    
    // Update agricultural settings
    Object.keys(agriculturalData).forEach(key => {
      if (agriculturalData[key] !== undefined) {
        if (key === 'alertPrefs') {
          Object.keys(agriculturalData[key]).forEach(prefKey => {
            if (agriculturalData[key][prefKey] !== undefined) {
              settings.agricultural.alertPrefs[prefKey] = agriculturalData[key][prefKey];
            }
          });
        } else {
          settings.agricultural[key] = agriculturalData[key];
        }
      }
    });
    
    await settings.save();
    res.json({ message: 'Agricultural profile updated successfully', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Test Analytics Endpoint
router.get('/agro/analytics/test', async (req, res) => {
  try {
    const { id, email } = req.query;
    console.log('Analytics test endpoint called with:', { id, email });
    
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    // Check if there are any orders
    const orderCount = await Order.countDocuments({ agroId: agro._id });
    const productCount = await Product.countDocuments({ ownerId: agro._id });
    
    res.json({
      message: 'Analytics test successful',
      agroId: agro._id,
      agroName: agro.agroName,
      orderCount,
      productCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in analytics test:', err);
    res.status(500).json({ message: err.message });
  }
});

// Generate Demo Data for Analytics
router.post('/agro/analytics/generate-demo-data', async (req, res) => {
  try {
    const { id, email } = req.body;
    console.log('Generating demo data for:', { id, email });
    
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    // Create some demo products if none exist
    const existingProducts = await Product.find({ ownerId: agro._id });
    if (existingProducts.length === 0) {
      const demoProducts = [
        { name: 'Wheat Seeds', category: 'Seed', price: 500, quantity: 100, description: 'High quality wheat seeds' },
        { name: 'Rice Seeds', category: 'Seed', price: 400, quantity: 80, description: 'Premium rice seeds' },
        { name: 'NPK Fertilizer', category: 'Fertilizer', price: 800, quantity: 50, description: 'Balanced NPK fertilizer' },
        { name: 'Tractor', category: 'Machinery', price: 50000, quantity: 2, description: 'Heavy duty tractor' },
        { name: 'Pesticide', category: 'Other', price: 300, quantity: 60, description: 'Organic pesticide' }
      ];
      
      for (const productData of demoProducts) {
        const product = new Product({
          ...productData,
          ownerId: agro._id
        });
        await product.save();
      }
    }
    
    // Create some demo orders if none exist
    const existingOrders = await Order.countDocuments({ agroId: agro._id });
    if (existingOrders === 0) {
      const products = await Product.find({ ownerId: agro._id });
      const now = new Date();
      
      // Generate orders for the last 6 months
      for (let i = 0; i < 30; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const createdAt = new Date(now.getTime() - (Math.random() * 180 * 24 * 60 * 60 * 1000)); // Last 6 months
        
        const order = new Order({
          productId: product._id,
          farmerId: new mongoose.Types.ObjectId(), // Random farmer ID
          agroId: agro._id,
          quantity: Math.floor(Math.random() * 10) + 1,
          totalPrice: product.price * (Math.floor(Math.random() * 10) + 1),
          status: ['Placed', 'Accepted', 'Shipped', 'Completed'][Math.floor(Math.random() * 4)],
          createdAt: createdAt,
          farmerName: `Farmer ${i + 1}`,
          farmerPhone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`
        });
        
        await order.save();
      }
    }
    
    res.json({
      message: 'Demo data generated successfully',
      agroId: agro._id,
      productsCreated: existingProducts.length === 0 ? 5 : 0,
      ordersCreated: existingOrders === 0 ? 30 : 0
    });
  } catch (err) {
    console.error('Error generating demo data:', err);
    res.status(500).json({ message: err.message });
  }
});

// Monthly Sales Analytics
router.get('/agro/analytics/monthly-sales', async (req, res) => {
  try {
    const { id, email, dateRange, productType, start, end } = req.query;
    console.log('Monthly sales analytics called with:', { id, email, dateRange, productType });
    
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    console.log('Found agro business:', agro.agroName, 'ID:', agro._id);

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ];

    // Add product type filter if specified
    if (productType && productType !== 'all') {
      pipeline.push({
        $match: {
          'product.category': productType
        }
      });
    }

    // Group by month and aggregate
    pipeline.push(
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    );

    const result = await Order.aggregate(pipeline);
    console.log('Aggregation result:', result);
    
    // Format result for frontend
    const monthlyData = result.map(item => ({
      month: item._id.month,
      year: item._id.year,
      revenue: item.revenue,
      quantity: item.quantity,
      orders: item.orders
    }));

    console.log('Formatted monthly data:', monthlyData);
    res.json(monthlyData);
  } catch (err) {
    console.error('Error in monthly sales analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Popular Products Analytics
router.get('/agro/analytics/popular-products', async (req, res) => {
  try {
    const { id, email, dateRange, productType, start, end } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Build date filter (same logic as monthly sales)
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ];

    // Add product type filter if specified
    if (productType && productType !== 'all') {
      pipeline.push({
        $match: {
          'product.category': productType
        }
      });
    }

    // Group by product and aggregate
    pipeline.push(
      {
        $group: {
          _id: '$productId',
          name: { $first: '$product.name' },
          category: { $first: '$product.category' },
          imagePath: { $first: '$product.imagePath' },
          revenue: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    );

    const result = await Order.aggregate(pipeline);
    
    // Get top 5 and bottom 5
    const topProducts = result.slice(0, 5);
    const bottomProducts = result.slice(-5).reverse();

    res.json({
      topProducts,
      bottomProducts,
      totalProducts: result.length
    });
  } catch (err) {
    console.error('Error in popular products analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Farmer Connections Analytics
router.get('/agro/analytics/farmer-connections', async (req, res) => {
  try {
    const { id, email, dateRange, start, end } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Get unique farmers from orders
    const farmersFromOrders = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$farmerId',
          firstOrderDate: { $min: '$createdAt' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      }
    ]);

    // Get unique farmers from requests
    const farmersFromRequests = await Request.aggregate([
      {
        $match: {
          agroId: agro._id
        }
      },
      {
        $group: {
          _id: '$farmerId',
          firstRequestDate: { $min: '$requestDate' }
        }
      }
    ]);

    // Combine and get unique farmers
    const allFarmerIds = new Set();
    farmersFromOrders.forEach(f => allFarmerIds.add(f._id.toString()));
    farmersFromRequests.forEach(f => allFarmerIds.add(f._id.toString()));

    // Get region-wise data
    const regionData = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'farmerId',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      },
      {
        $group: {
          _id: '$farmer.region',
          farmerCount: { $addToSet: '$farmerId' },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $project: {
          region: '$_id',
          farmerCount: { $size: '$farmerCount' },
          orders: 1,
          revenue: 1
        }
      }
    ]);

    // Get growth data (monthly)
    const growthData = await Order.aggregate([
      {
        $match: {
          agroId: agro._id
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          uniqueFarmers: { $addToSet: '$farmerId' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          totalConnections: { $size: '$uniqueFarmers' },
          orders: 1
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    // Calculate new connections this month
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: '$farmerId',
          firstOrderThisMonth: { $min: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { farmerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$farmerId', '$$farmerId'] },
                    { $eq: ['$agroId', agro._id] },
                    { $lt: ['$createdAt', thisMonth] }
                  ]
                }
              }
            }
          ],
          as: 'previousOrders'
        }
      },
      {
        $match: {
          previousOrders: { $size: 0 }
        }
      }
    ]);

    res.json({
      summary: {
        totalFarmers: allFarmerIds.size,
        newThisMonth: newThisMonth.length,
        totalContacts: farmersFromRequests.length,
        totalOrders: farmersFromOrders.reduce((sum, f) => sum + f.totalOrders, 0)
      },
      regionData,
      growthData
    });
  } catch (err) {
    console.error('Error in farmer connections analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Geo-Map Analytics
router.get('/agro/analytics/geo-map', async (req, res) => {
  try {
    const { id, email, dateRange, productType, start, end } = req.query;
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (start && end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          };
        }
        break;
    }

    // Get region-wise data with product details
    const regionData = await Order.aggregate([
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'farmerId',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ]);

    // Add product type filter if specified
    let filteredData = regionData;
    if (productType && productType !== 'all') {
      filteredData = regionData.filter(item => item.product.category === productType);
    }

    // Group by region
    const regionStats = {};
    filteredData.forEach(item => {
      const region = item.farmer.region || 'Unknown';
      if (!regionStats[region]) {
        regionStats[region] = {
          region,
          farmerCount: new Set(),
          orders: 0,
          revenue: 0,
          products: {},
          browsingCount: Math.floor(Math.random() * 50) + 10 // Simulated browsing data
        };
      }
      
      regionStats[region].farmerCount.add(item.farmerId.toString());
      regionStats[region].orders += 1;
      regionStats[region].revenue += item.totalPrice;
      
      // Track top products
      const productName = item.product.name;
      if (!regionStats[region].products[productName]) {
        regionStats[region].products[productName] = 0;
      }
      regionStats[region].products[productName] += item.quantity;
    });

    // Convert to array and format
    const result = Object.values(regionStats).map(region => ({
      region: region.region,
      farmerCount: region.farmerCount.size,
      orders: region.orders,
      revenue: region.revenue,
      browsingCount: region.browsingCount,
      topProducts: Object.entries(region.products)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3),
      potentialRevenue: region.browsingCount > region.orders ? 
        (region.browsingCount - region.orders) * (region.revenue / Math.max(region.orders, 1)) : 0
    }));

    res.json(result);
  } catch (err) {
    console.error('Error in geo-map analytics:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Analytics Data
router.get('/agro/analytics/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get all analytics data
    const [monthlySales, popularProducts, farmerConnections, geoMap] = await Promise.all([
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/monthly-sales`, {
        params: { id, email, dateRange, productType }
      }).then(r => r.data).catch(() => []),
      
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/popular-products`, {
        params: { id, email, dateRange, productType }
      }).then(r => r.data).catch(() => ({ topProducts: [], bottomProducts: [] })),
      
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/farmer-connections`, {
        params: { id, email, dateRange }
      }).then(r => r.data).catch(() => ({ summary: {}, regionData: [], growthData: [] })),
      
      axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/geo-map`, {
        params: { id, email, dateRange, productType }
      }).then(r => r.data).catch(() => [])
    ]);

    if (format === 'csv') {
      // Generate CSV content
      let csvContent = 'Analytics Export\n\n';
      
      // Monthly Sales
      csvContent += 'Monthly Sales\n';
      csvContent += 'Month,Revenue,Quantity,Orders\n';
      monthlySales.forEach(item => {
        csvContent += `${item.month},${item.revenue},${item.quantity},${item.orders}\n`;
      });
      
      csvContent += '\nTop Products\n';
      csvContent += 'Product Name,Category,Revenue,Quantity,Orders\n';
      popularProducts.topProducts.forEach(item => {
        csvContent += `${item.name},${item.category},${item.revenue},${item.quantity},${item.orders}\n`;
      });
      
      csvContent += '\nFarmer Connections by Region\n';
      csvContent += 'Region,Farmer Count,Orders,Revenue\n';
      farmerConnections.regionData.forEach(item => {
        csvContent += `${item.region},${item.farmerCount},${item.orders},${item.revenue}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      res.send(csvContent);
    } else {
      // Return JSON for other formats
      res.json({
        monthlySales,
        popularProducts,
        farmerConnections,
        geoMap,
        exportDate: new Date().toISOString(),
        filters: { dateRange, productType }
      });
    }
  } catch (err) {
    console.error('Error in analytics export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Individual Export Endpoints for each analytics component

// Export Monthly Sales Data
router.get('/agro/analytics/monthly-sales/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get agro business
    let agro;
    if (id) agro = await AgroBusiness.findById(id);
    else if (email) agro = await AgroBusiness.findOne({ email });
    else return res.status(400).json({ message: 'Email or id required' });
    if (!agro) return res.status(404).json({ message: 'Agro-Business not found' });
    
    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'thisMonth':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        dateFilter = { createdAt: { $gte: threeMonthsAgo } };
        break;
      case 'thisYear':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lt: new Date(now.getFullYear() + 1, 0, 1)
          }
        };
        break;
      case 'custom':
        if (req.query.start && req.query.end) {
          dateFilter = {
            createdAt: {
              $gte: new Date(req.query.start),
              $lte: new Date(req.query.end)
            }
          };
        }
        break;
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          agroId: agro._id,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ];

    // Add product type filter if specified
    if (productType && productType !== 'all') {
      pipeline.push({
        $match: {
          'product.category': productType
        }
      });
    }

    // Group by month and aggregate
    pipeline.push(
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          quantity: { $sum: '$quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    );

    const result = await Order.aggregate(pipeline);
    
    // Format result for frontend
    const monthlyData = result.map(item => ({
      month: item._id.month,
      year: item._id.year,
      revenue: item.revenue,
      quantity: item.quantity,
      orders: item.orders
    }));
    
    if (format === 'csv') {
      let csvContent = 'Month,Revenue,Quantity,Orders\n';
      monthlyData.forEach(item => {
        csvContent += `${item.month},${item.revenue},${item.quantity},${item.orders}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=monthly-sales.csv');
      res.send(csvContent);
    } else {
      res.json(monthlyData);
    }
  } catch (err) {
    console.error('Error in monthly sales export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Popular Products Data
router.get('/agro/analytics/popular-products/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get popular products data
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/popular-products`, {
      params: { id, email, dateRange, productType }
    });
    
    const data = response.data;
    
    if (format === 'csv') {
      let csvContent = 'Product Name,Category,Revenue,Quantity,Orders,Type\n';
      
      // Add top products
      data.topProducts.forEach(item => {
        csvContent += `"${item.name}",${item.category},${item.revenue},${item.quantity},${item.orders},Top\n`;
      });
      
      // Add bottom products
      data.bottomProducts.forEach(item => {
        csvContent += `"${item.name}",${item.category},${item.revenue},${item.quantity},${item.orders},Bottom\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=popular-products.csv');
      res.send(csvContent);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error('Error in popular products export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Farmer Connections Data
router.get('/agro/analytics/farmer-connections/export', async (req, res) => {
  try {
    const { id, email, dateRange, format = 'csv' } = req.query;
    
    // Get farmer connections data
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/farmer-connections`, {
      params: { id, email, dateRange }
    });
    
    const data = response.data;
    
    if (format === 'csv') {
      let csvContent = 'Region,Farmer Count,Orders,Revenue,New This Month\n';
      data.regionData.forEach(item => {
        csvContent += `${item.region},${item.farmerCount},${item.orders},${item.revenue || 0},${item.newThisMonth || 0}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=farmer-connections.csv');
      res.send(csvContent);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error('Error in farmer connections export:', err);
    res.status(500).json({ message: err.message });
  }
});

// Export Geo Map Data
router.get('/agro/analytics/geo-map/export', async (req, res) => {
  try {
    const { id, email, dateRange, productType, format = 'csv' } = req.query;
    
    // Get geo map data
    const response = await axios.get(`${req.protocol}://${req.get('host')}/api/user/agro/analytics/geo-map`, {
      params: { id, email, dateRange, productType }
    });
    
    const data = response.data;
    
    if (format === 'csv') {
      let csvContent = 'Region,Farmer Count,Orders,Revenue,Browsing Count,Opportunity Score\n';
      data.forEach(item => {
        const opportunityScore = item.browsingCount > 0 && item.orders === 0 ? 'High' : 
                               item.browsingCount > item.orders * 2 ? 'Medium' : 'Low';
        csvContent += `${item.region},${item.farmerCount},${item.orders},${item.revenue || 0},${item.browsingCount || 0},${opportunityScore}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=geo-map.csv');
      res.send(csvContent);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error('Error in geo-map export:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router; 