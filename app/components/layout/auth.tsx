import { CheckIcon, LockIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import { Form, useActionData, useLocation, useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa6";

import type { action } from "~/routes/auth.register";

export default function Auth() {
  const [type, setType] = useState("login");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const title = type === "login" ? "登录" : "注册";

  const maybeActionData = useActionData<typeof action>();
  const [actionData, setActionData] = useState<typeof maybeActionData>();
  const navigation = useNavigation();

  const [captcha, setCaptcha] = useState(0);
  const changeCaptcha = () => setCaptcha(x => x + 1);

  const location = useLocation();

  useEffect(() => {
    if (maybeActionData?.username || maybeActionData?.password || maybeActionData?.repeatPassword || maybeActionData?.captcha) {
      setActionData(maybeActionData);
      changeCaptcha();
    }
  }, [maybeActionData]);

  useEffect(() => {
    setActionData(undefined);
  }, [type]);

  return (
    <>
      <Button variant="ghost" onClick={() => {
        setType("login");
        onOpen();
      }}>
        登录
      </Button>

      <Button colorScheme="blue"
              onClick={() => {
                setType("register");
                onOpen();
              }}>
        注册
      </Button>

      <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form method="post" action={`/auth/${type}`}>
              <Stack spacing={4}>
                <FormControl isInvalid={Boolean(actionData?.username)}>
                  <FormLabel>用户名</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaUser} color="gray.300" />
                    </InputLeftElement>
                    <Input type="username" autoComplete="nickname" placeholder="用户名"
                           name="username" required minLength={3} maxLength={16} />
                  </InputGroup>
                  {actionData?.username && (
                    <FormErrorMessage>{actionData.username}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={Boolean(actionData?.password)}>
                  <FormLabel>密码</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <LockIcon color="gray.300" />
                    </InputLeftElement>
                    <Input type="password" autoComplete={type === "login" ? "current-password" : "new-password"}
                           placeholder="密码" name="password" required minLength={6} maxLength={161} />
                  </InputGroup>
                  {actionData?.password && (
                    <FormErrorMessage>{actionData.password}</FormErrorMessage>
                  )}
                </FormControl>

                {type === "register" && (
                  <>
                    <FormControl isInvalid={Boolean(actionData?.repeatPassword)}>
                      <FormLabel>再次输入密码</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <LockIcon color="gray.300" />
                        </InputLeftElement>
                        <Input type="password" autoComplete="new-password" placeholder="再次输入密码"
                               name="repeatPassword" required minLength={6} maxLength={161} />
                      </InputGroup>
                      {actionData?.repeatPassword && (
                        <FormErrorMessage>{actionData.repeatPassword}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isInvalid={Boolean(actionData?.captcha)}>
                      <FormLabel>验证码</FormLabel>
                      <HStack alignItems="flex-start">
                        <Box w="100%">
                          <InputGroup>
                            <InputLeftElement pointerEvents="none">
                              <CheckIcon color="gray.300" />
                            </InputLeftElement>
                            <Input required name="captcha" type="text" placeholder="验证码"
                                   minLength={4} maxLength={4} />
                          </InputGroup>
                          {actionData?.captcha && (
                            <FormErrorMessage>{actionData.captcha}</FormErrorMessage>
                          )}
                        </Box>
                        <Box>
                          <Image src={"/captcha?" + captcha} alt="captcha" cursor="pointer" onClick={changeCaptcha} />
                        </Box>
                      </HStack>
                    </FormControl>
                  </>
                )}

                <input type="hidden" name="redirectTo" value={location.pathname} />

                <Button size="lg" colorScheme="blue" type="submit" mt={2}
                        isLoading={navigation.state === "submitting"}>
                  {title}
                </Button>

                <Text align="center" pt={3}>
                  {type === "login" ? "没有账号？" : "已有账号？"}
                  <Link color={useColorModeValue("blue.500", "blue.200")}
                        onClick={() => setType(type === "login" ? "register" : "login")}>
                    {type === "login" ? "注册" : "登录"}
                  </Link>
                </Text>
              </Stack>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}