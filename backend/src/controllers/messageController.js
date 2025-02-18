import User from "../models/user.js";
import Message from "../models/messageModel.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    // $ne (Not Equal) → Excludes the logged-in user.
    // Returns all users except the one with _id = loggedInUserId.

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUserForSideBar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
        // Find All The Message When Sender is Me and Receiver is Other User OR Also Find All Message When Receiver is Me and Sender is Othe User.
      ],
    });
    res.status(200).json(message);
  } catch (error) {
    console.log("Error in getUserForSideBar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const SendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params; // receiver Id
    const senderId = req.user._id; // my Id

    let imageUrl;
    if (image) {
      // Upload base image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image); // upload image
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // realTime Functionality which happne with socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in SendMessage Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
