const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("UserId param not sent");
  }

  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  }).populate("users", "-password");

  if (chat) return res.json(chat);

  const created = await Chat.create({
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  });

  const full = await Chat.findById(created._id).populate("users", "-password");

  res.json(full);
});

const fetchChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .sort({ updatedAt: -1 });

  res.json(chats);
});


const createGroupChat = asyncHandler(async (req, res) => {
  const { name, users } = req.body;

  const parsedUsers = JSON.parse(users);

  parsedUsers.push(req.user);

  const group = await Chat.create({
    chatName: name,
    users: parsedUsers,
    isGroupChat: true,
    groupAdmin: req.user,
  });

  const full = await Chat.findById(group._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(full);
});


const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updated = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(updated);
});


const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updated = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  ).populate("users", "-password");

  res.json(updated);
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const updated = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  ).populate("users", "-password");

  res.json(updated);
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
