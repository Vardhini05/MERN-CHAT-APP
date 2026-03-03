import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <Box
      display="flex"
      flexDir="column-reverse"  
      overflowY="auto"
      h="100%"
      p={2}
    >
      {messages
        .slice()
        .reverse()  
        .map((m) => {
          const isMe = m.sender?._id === user._id;

          return (
            <Box
              key={m._id}
              alignSelf={isMe ? "flex-end" : "flex-start"}
              bg={isMe ? "#BEE3F8" : "#B9F5D0"}
              px={4}
              py={2}
              borderRadius="20px"
              maxW="75%"
              m={1}
            >
              {m.content}
            </Box>
          );
        })}
    </Box>
  );
};

export default ScrollableChat;
