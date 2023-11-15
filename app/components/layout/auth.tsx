import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
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
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa6";

import type { TFunctionArg } from "~/i18next";
import type { action } from "~/routes/auth.register";

import PasswordInputGroup from "./passwordInputGroup";

export default function Auth() {
  const [type, setType] = useState("login");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { t } = useTranslation();

  const title = t(("auth." + type) as TFunctionArg);

  const { data, state, Form } = useFetcher<typeof action>();

  const [captcha, setCaptcha] = useState(0);
  const changeCaptcha = () => setCaptcha(x => x + 1);

  useEffect(() => {
    changeCaptcha();
  }, [data]);

  return (
    <>
      <Button
        onClick={() => {
          setType("login");
          onOpen();
        }}
        variant="ghost"
      >
        {t("auth.login")}
      </Button>

      <Button
        colorScheme="blue"
        onClick={() => {
          setType("register");
          onOpen();
        }}
      >
        {t("auth.register")}
      </Button>

      <Modal
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <Form method="post" action={`/auth/${type}`}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!data?.username}>
                  <FormLabel>{t("auth.username")}</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <FaUser />
                    </InputLeftElement>
                    <Input
                      autoComplete="username"
                      maxLength={18}
                      minLength={3}
                      name="username"
                      placeholder={t("auth.username-placeholder")}
                      required
                    />
                  </InputGroup>
                  {data?.username ? (
                    <FormErrorMessage>{t(data.username)}</FormErrorMessage>
                  ) : null}
                </FormControl>

                <FormControl isInvalid={!!data?.password}>
                  <FormLabel>{t("auth.password")}</FormLabel>
                  <PasswordInputGroup
                    autoComplete={
                      type === "login" ? "current-password" : "new-password"
                    }
                    maxLength={161}
                    minLength={6}
                    name="password"
                    placeholder={t("auth.password-placeholder")}
                    required
                  />
                  {data?.password ? (
                    <FormErrorMessage>{t(data.password)}</FormErrorMessage>
                  ) : null}
                </FormControl>

                {type === "register" ? (
                  <>
                    <FormControl isInvalid={!!data?.retypePassword}>
                      <FormLabel>{t("auth.retype-password")}</FormLabel>
                      <PasswordInputGroup
                        autoComplete="new-password"
                        maxLength={161}
                        minLength={6}
                        name="retypePassword"
                        placeholder={t("auth.retype-password-placeholder")}
                        required
                      />
                      {data?.retypePassword ? (
                        <FormErrorMessage>
                          {t(data.retypePassword)}
                        </FormErrorMessage>
                      ) : null}
                    </FormControl>

                    <FormControl isInvalid={!!data?.captcha}>
                      <FormLabel>{t("auth.captcha")}</FormLabel>
                      <HStack alignItems="flex-start">
                        <Box w="100%">
                          <InputGroup>
                            <InputLeftElement>
                              <CheckIcon />
                            </InputLeftElement>
                            <Input
                              maxLength={4}
                              minLength={4}
                              name="captcha"
                              placeholder={t("auth.captcha-placeholder")}
                              required
                            />
                          </InputGroup>
                          {data?.captcha ? (
                            <FormErrorMessage>
                              {t(data.captcha)}
                            </FormErrorMessage>
                          ) : null}
                        </Box>
                        <Box>
                          <Image
                            cursor="pointer"
                            alt="captcha"
                            onClick={changeCaptcha}
                            src={"/captcha?" + captcha}
                          />
                        </Box>
                      </HStack>
                    </FormControl>
                  </>
                ) : null}

                <Button
                  mt={1}
                  colorScheme="blue"
                  isLoading={state === "submitting"}
                  size="lg"
                  type="submit"
                >
                  {title}
                </Button>

                <Text align="center">
                  {type === "login"
                    ? t("auth.no-account")
                    : t("auth.have-account")}
                  <Link
                    color={useColorModeValue("blue.500", "blue.200")}
                    onClick={() =>
                      setType(type === "login" ? "register" : "login")
                    }
                  >
                    {type === "login" ? t("auth.register") : t("auth.login")}
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
