const express = require('express');
const storeRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware.js');
const Order = require('../models/order.js');
const User = require('../models/user.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

// Get available goodies
storeRouter.get('/goodies', async (req, res) => {
  try {
    const goodies = [
      {
        id: 'tshirt',
        name: 'LeetPro T-shirt',
        price: 150,
        image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
        description: 'Premium quality LeetPro branded T-shirt made from 100% cotton.',
        category: 'apparel',
        inStock: true,
        estimatedDelivery: '7-10 business days'
      },
      {
        id: 'cap',
        name: 'LeetPro Cap',
        price: 100,
        image: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg',
        description: 'Stylish LeetPro cap perfect for coding sessions.',
        category: 'apparel',
        inStock: true,
        estimatedDelivery: '5-7 business days'
      },
      {
        id: 'pen',
        name: 'LeetPro Pen',
        price: 50,
        image: 'https://images.pexels.com/photos/29253139/pexels-photo-29253139.jpeg',
        description: 'Smooth writing LeetPro branded pen.',
        category: 'stationery',
        inStock: true,
        estimatedDelivery: '3-5 business days'
      },
      {
        id: 'bag',
        name: 'LeetPro Backpack',
        price: 300,
        image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
        description: 'Spacious and durable LeetPro backpack for all your coding gear.',
        category: 'accessories',
        inStock: true,
        estimatedDelivery: '7-14 business days'
      },
      {
        id: 'mug',
        name: 'LeetPro Coffee Mug',
        price: 75,
        image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
        description: 'Start your coding day with coffee in this premium LeetPro mug.',
        category: 'accessories',
        inStock: true,
        estimatedDelivery: '5-7 business days'
      },
      {
        id: 'stickers',
        name: 'LeetPro Sticker Pack',
        price: 25,
        image: 'https://images.pexels.com/photos/30101191/pexels-photo-30101191.jpeg',
        description: 'Collection of cool LeetPro stickers for your laptop.',
        category: 'accessories',
        inStock: true,
        estimatedDelivery: '3-5 business days'
      }
    ];
    
    res.status(200).json({ goodies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goodies' });
  }
});

// Place an order (deduct points, create order)
storeRouter.post('/order', userMiddleware, async (req, res) => {
  try {
    const userId = req.result._id;
    const { goodie, address } = req.body;
    
    if (!goodie || !address) {
      return res.status(400).json({ error: 'Missing goodie or address information' });
    }

    // Validate required address fields
    const requiredFields = ['line1', 'city', 'state', 'zip', 'country'];
    for (const field of requiredFields) {
      if (!address[field] || address[field].trim() === '') {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.points < goodie.price) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    
    // Deduct points
    user.points -= goodie.price;
    await user.save();
    
    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 10); // Default 10 days
    
    // Create order
    const order = await Order.create({
      userId,
      goodie,
      address,
      pointsSpent: goodie.price,
      estimatedDelivery,
      status: 'pending'
    });
    
    // Populate user details for response
    await order.populate('userId', 'firstName lastName emailId');
    
    res.status(201).json({ 
      message: 'Order placed successfully',
      order 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get user's orders
storeRouter.get('/orders', userMiddleware, async (req, res) => {
  try {
    const userId = req.result._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ADMIN: Get all orders with user details
storeRouter.get('/admin/orders', adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'firstName lastName emailId age')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Order.countDocuments(query);
    
    res.status(200).json({ 
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// ADMIN: Update order status
storeRouter.patch('/admin/order/:orderId', adminMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, notes } = req.body;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('userId', 'firstName lastName emailId');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json({ 
      message: 'Order updated successfully',
      order 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get order statistics for admin
storeRouter.get('/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPoints: { $sum: '$pointsSpent' }
        }
      }
    ]);
    
    const totalOrders = await Order.countDocuments();
    const totalPointsSpent = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$pointsSpent' } } }
    ]);
    
    res.status(200).json({
      totalOrders,
      totalPointsSpent: totalPointsSpent[0]?.total || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

module.exports = storeRouter;