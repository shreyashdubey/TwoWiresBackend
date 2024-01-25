// routes/friendRequestRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/UserSchema');
const FriendRequest = require('../models/FriendRequestSchema');
const FriendRequestStatus = require('../enums/FriendRequestStatus');
const Friend = require('../models/FriendSchema')

async function areUsersFriends(sender, receiver) {
  const thirtyDaysAgo = new Date(); 
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const existingFriendship = await FriendRequest.findOne({
    $or: [
      { sender, receiver },
      { sender: receiver, receiver: sender },
    ],
    $or: [
      {status: FriendRequestStatus.ACCEPTED},
      {status: FriendRequestStatus.PENDING},
    ]
  });

  if(!existingFriendship){ //Checking for null
    return FriendRequestStatus.NOT_FOUND;
  }

  if (existingFriendship) {
    if (existingFriendship.status === FriendRequestStatus.ACCEPTED) {
      return FriendRequestStatus.ACCEPTED;
    } else if (existingFriendship.status === FriendRequestStatus.PENDING) {
      return FriendRequestStatus.PENDING;
    } else if (existingFriendship.status === FriendRequestStatus.DECLINED && existingFriendship.createdAt < thirtyDaysAgo) {
      return FriendRequestStatus.NOT_FOUND;
    }
  }
  return FriendRequestStatus.NOT_FOUND;
}

// Creation of new friend Request
router.post('/create', async (req, res) => {
  const { sender, receiver} = req.body;
  try {
    // Check if the user exists
    const senderExists = await User.findById(sender);
    if (!senderExists) {
      return res.status(404).json({ error: 'Sender not found.' });
    }

    const receiverExists = await User.findById(receiver);
    if (!receiverExists) {
      return res.status(404).json({ error: 'Receiever not found.' });
    }
    const friendshipStatus = await areUsersFriends(sender, receiver);
    console.log(friendshipStatus)
    if(friendshipStatus != FriendRequestStatus.NOT_FOUND){
      return res.status(404).json({ error: 'Friend Request already exist try later' });
    }
  
    const newFriendRequest = new FriendRequest({
      sender,
      receiver,
    });
    console.log('createe')
    const savedFriendRequest = await newFriendRequest.save();
    console.log('saved')
    res.status(201).json(savedFriendRequest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create a new friend request.' });
  }
});



// Send a friend request
router.post('/send', async (req, res) => {
    const {receiverId } = req.body;
    try{
    // Check if the sender and receiver exist in the database
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(203).json({ message: 'User not found' });
    }

    // Check if the friend request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(210).json({ message: 'Friend request already sent' });
    }
    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });

    await friendRequest.save();
    res.status(200).json({ message: 'Friend request sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Respond to a friend request
router.post('/respond', async (req, res) => {
  const { requestId, response } = req.body;

  try {
    // Check if the friend request exists in the database
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

  //  Check if the friend request is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid friend request status' });
    }
    // Update the friend request status based on the response
    friendRequest.status = response;
    await friendRequest.save();
    if (response === 'accepted') {
      const { sender, receiver } = friendRequest;
    
      // Add the sender to the receiver's friends list
      await Friend.findOneAndUpdate(
        { user: receiver },
        { $addToSet: { friends: sender } },
        { upsert: true }
      );
    
      // Add the receiver to the sender's friends list
      await Friend.findOneAndUpdate(
        { user: sender },
        { $addToSet: { friends: receiver } },
        { upsert: true }
      );
    }
    
    res.json({ message: 'Friend request responded successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to friend request' });
  }
});

router.get('/requests', async (req, res) => {
   const loggedInUserId = '64b68ff97756b51554f9e090'
    try {
      const friendRequests = await FriendRequest.find({ receiver: loggedInUserId, status: 'accepted' })
        .populate('sender'); // Populate the sender field with the User object
  
      res.json(friendRequests);
    } catch (error) {
      console.error('Error getting friend requests:', error);
      res.status(500).json({ error: 'Failed to get friend requests' });
    }
  });

  router.get('/friends/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Find the Friend document with the given user ID
      const friend = await Friend.findOne({ user: userId }).populate('friends', 'username profession');
  
      if (!friend) {
        return res.status(404).json({ error: 'User not found or has no friends' });
      }
  
      // Return the list of friends for the user
      res.json(friend.friends);
    } catch (error) {
      console.error('Error getting friends:', error);
      res.status(500).json({ error: 'Failed to get friends' });
    }
  });
  
  router.post('/pending-requests', async (req, res) => {
    const token = req.cookies.token
    if (!token) {
      return res.json({ status: false })
    }
    const decoded = await verifyToken(token);
    const senderId = decoded.id
    try {
      const pendingRequests = await FriendRequest.find({
        receiver: senderId,
        status: 'pending',
      }).populate('sender');
      res.json(pendingRequests);
    } catch (error) {
      console.error('Error getting pending friend requests:', error);
      res.status(500).json({ error: 'Failed to get pending friend requests' });
    }
  });
  

module.exports = router;
