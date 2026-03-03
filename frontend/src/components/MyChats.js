import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Button,
  useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";

import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();


  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));

    const fetchChats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get("/api/chat", config);

        setChats(data);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to Load the chats",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (user) fetchChats();
  }, [fetchAgain, user, setChats, toast]);


  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize="2xl"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats

        <GroupChatModal>
          <Button size="sm" rightIcon={<AddIcon />}>
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        flex="1"
        overflowY="auto"
        bg="#F8F8F8"
        borderRadius="lg"
        p={3}
      >
        <Stack spacing={3}>
          {chats &&
            chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
              >
                {!chat.isGroupChat
                  ? getSender(loggedUser, chat.users)
                  : chat.chatName}
              </Box>
            ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default MyChats;
