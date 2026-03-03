import {
  Box,
  Text,
  IconButton,
  FormControl,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react";

import { ArrowBackIcon } from "@chakra-ui/icons";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import Lottie from "react-lottie";

import animationData from "../animations/typing.json";

import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
import ScrollableChat from "./ScrollableChat";

const ENDPOINT = process.env.NODE_ENV === "production"
  ? "/"
  : "http://localhost:5000";
let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
  } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (!user) return;

    socket = io(ENDPOINT);

    socket.emit("setup", user);

    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => socket.disconnect();
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
      selectedChatCompare = selectedChat;

    } catch {
      toast({
        title: "Failed to load messages",
        status: "error",
      });
    }
  }, [selectedChat, user, toast]);

  const sendMessage = async (e) => {
    if (e.key !== "Enter" || !newMessage.trim()) return;

    try {
      socket.emit("stop typing", selectedChat._id);

      const { data } = await axios.post(
        "/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setNewMessage("");
      socket.emit("new message", data);

    } catch {
      toast({
        title: "Message failed",
        status: "error",
      });
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const timerLength = 2000;

    setTimeout(() => {
      if (typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // Notification logic
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => {
          if (prev.find((m) => m._id === newMessageReceived._id)) {
            return prev;
          }
          return [...prev, newMessageReceived];
        });
      }
    });

    return () => socket.off("message received");
  }, [
    notification,
    fetchAgain,
    setFetchAgain,
    setNotification,
  ]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <>
      {selectedChat ? (
        <Box display="flex" flexDir="column" w="100%" h="100%">

          {/* HEADER */}
          <Box
            px={3}
            py={2}
            display="flex"
            alignItems="center"
            bg="white"
            borderRadius="lg"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            <Text fontSize="xl" fontWeight="bold" ml={2}>
              {!selectedChat.isGroupChat
                ? getSender(user, selectedChat.users)
                : selectedChat.chatName}
            </Text>
          </Box>

          <Box
            flex="1"
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            bg="#E8E8E8"
            p={3}
            borderRadius="lg"
            overflowY="auto"
          >
            {loading ? (
              <Spinner alignSelf="center" />
            ) : (
              <>
                <ScrollableChat messages={messages} />

                {isTyping && (
                  <Box alignSelf="flex-start" mt={1}>
                    <Lottie
                      options={defaultOptions}
                      width={50}
                      height={25}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          <FormControl onKeyDown={sendMessage} mt={2}>
            <Input
              placeholder="Enter a message..."
              bg="white"
              value={newMessage}
              onChange={typingHandler}
            />
          </FormControl>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="2xl">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;