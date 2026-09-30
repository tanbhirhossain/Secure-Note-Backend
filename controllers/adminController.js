const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.groupByInterests = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          users: { $push: { id: '$_id', name: '$name', email: '$email' } },
          totalUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getUserPosts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const result = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'posts',          
          localField: '_id',      
          foreignField: 'author',  
          as: 'userPosts'
        }
      },
      {
        $project: {
          password: 0 
        }
      }
    ]);

    if (!result.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, body } = req.body;
    const post = new Post({ title, body, author: req.user.id });
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};