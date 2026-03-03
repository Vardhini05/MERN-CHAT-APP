import {
  Button,
  IconButton,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Box,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { useState } from "react";
import axios from "axios";

import { ChatState } from "../../Context/ChatProvider";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const [groupChatName, setGroupChatName] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      const { data } = await axios.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: groupChatName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
      onClose();
    } catch {
      toast({ title: "Rename failed", status: "error" });
    }
  };

  const handleSearch = async (value) => {
    if (!value) return;

    try {
      setLoading(true);

      const { data } = await axios.get(`/api/user?search=${value}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSearchResult(data);
      setLoading(false);
    } catch {
      toast({ title: "Search failed", status: "error" });
    }
  };

  const handleAddUser = async (u) => {
    try {
      const { data } = await axios.put(
        "/api/chat/groupadd",
        { chatId: selectedChat._id, userId: u._id },
        { headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch {
      toast({ title: "Add failed", status: "error" });
    }
  };

  const handleRemove = async (u) => {
    try {
      const { data } = await axios.put(
        "/api/chat/groupremove",
        { chatId: selectedChat._id, userId: u._id },
        { headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (u._id === user._id) {
        setSelectedChat();
        onClose();
      } else {
        setSelectedChat(data);
      }

      setFetchAgain(!fetchAgain);
    } catch {
      toast({ title: "Remove failed", status: "error" });
    }
  };

  return (
    <>
      <IconButton icon={<ViewIcon />} onClick={onOpen} ml={2} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {/* Members */}
            <Box mb={3}>
              {selectedChat.users.map((u) => (
                <Badge
                  key={u._id}
                  colorScheme="purple"
                  m={1}
                  cursor="pointer"
                  onClick={() => handleRemove(u)}
                >
                  {u.name} ✕
                </Badge>
              ))}
            </Box>

            <Input
              placeholder="Chat Name"
              mb={2}
              onChange={(e) => setGroupChatName(e.target.value)}
            />

            <Button colorScheme="blue" mb={3} onClick={handleRename}>
              Update
            </Button>

            <Input
              placeholder="Add User to group"
              onChange={(e) => handleSearch(e.target.value)}
            />

            {loading ? (
              <Spinner mt={2} />
            ) : (
              searchResult.map((u) => (
                <Box
                  key={u._id}
                  p={2}
                  bg="gray.100"
                  mt={1}
                  cursor="pointer"
                  onClick={() => handleAddUser(u)}
                >
                  {u.name}
                </Box>
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;