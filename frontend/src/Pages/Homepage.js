import React, { useEffect } from "react";
import { Container, Box, Text, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useHistory } from "react-router";


function Homepage() {
  const history=useHistory();
  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem("userInfo"));
    if(user) history.push("/chats");
  }, [history]);
  return (
    <Container maxW="xl" centerContent>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        p={4}
        bg="white"
        w="100%"
        m="40px 0 20px 0"
        borderRadius="lg"
        borderWidth="1px"
        boxShadow="lg"
      >
        <Text
          fontSize="4xl"
          fontFamily="Work Sans"
          fontWeight="bold"
        >
          Talk-A-Tive
        </Text>
      </Box>

      <Box
        bg="white"
        w="100%"
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        boxShadow="lg"
      >
        <Tabs isFitted variant="soft-rounded" colorScheme="green">
          
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>

            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>

        </Tabs>
      </Box>

    </Container>
  );
}

export default Homepage;
