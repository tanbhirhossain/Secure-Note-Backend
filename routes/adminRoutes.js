const express = require('express');
const router = express.Router();
const {getAllUsers, deleteUser,groupByInterests,getUserPosts,createPost} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.post('/posts', protect, createPost);
router.get('/users/:userId/posts', protect, getUserPosts); 

router.use(protect, authorizeAdmin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/interests-group', groupByInterests); 

module.exports = router;