const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");


const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error("Invalid data");
  }

  let message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  message = await message.populate("sender", "name pic");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message,
  });

  res.json(message);
});


const allMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email")
    .populate("chat");

  res.json(messages);
});


module.exports = {
  sendMessage,
  allMessages,
};
