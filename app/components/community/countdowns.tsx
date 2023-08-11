import { Center, Heading, Text, Tooltip, VStack } from "@chakra-ui/react";

import { useServerTime } from "~/utils";

const countDowns = [
  { date: "2024-02-10", description: "polygen 公测" }
];

export default function Countdowns() {
  const now = useServerTime();

  return (
    <Center flexDir="column">
      <Heading size="sm" mb={2}>倒计时</Heading>
      <VStack textAlign="center">
        {countDowns.map(({ date, description }) => (
          <Text key={description}>
            距离&nbsp;
            <Tooltip label={date}>
              <strong>{description}</strong>
            </Tooltip>
            &nbsp;还有&nbsp;
            <strong>{Math.ceil((Number(new Date(date)) - Number(now)) / 1000 / 86400)}</strong>
            &nbsp;天
          </Text>
        ))}
      </VStack>
    </Center>
  );
}