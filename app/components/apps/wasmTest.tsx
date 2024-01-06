import {
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Slider,
  SliderTrack,
  SliderThumb,
  Radio,
  RadioGroup,
  SliderFilledTrack,
  VStack,
  HStack,
  Button,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Mode } from "~/wasm/client";
import initWasm, { Map } from "~/wasm/client";

interface SliderInputProps {
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  label: string;
}

function SliderInput({ value, setValue, min, max, label }: SliderInputProps) {
  return (
    <Flex align="center" w={{ base: "100%", sm: "450px" }}>
      <Text mr={4}>{label}</Text>

      <NumberInput
        maxW="100px"
        mr={8}
        allowMouseWheel
        max={max}
        min={min}
        onChange={(_, value) => setValue(value)}
        value={value}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <Slider
        flex={1}
        focusThumbOnChange={false}
        max={max}
        min={min}
        onChange={setValue}
        value={value}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>

        <SliderThumb boxSize={8} fontSize="sm">
          {value}
        </SliderThumb>
      </Slider>
    </Flex>
  );
}

if (typeof window !== "undefined") {
  void initWasm();
}

export default function WasmTest() {
  const { t } = useTranslation();

  const [mode, setMode] = useState("0");
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);

  const limits = {
    min: 1,
    max: 255
  };

  const toast = useToast();

  const generate = () => {
    const start = performance.now();

    new Map(Number(mode) as Mode, width, height).free();

    const end = performance.now();

    toast({
      title: t("apps.generate-success"),
      description: `${(end - start).toFixed(1)}ms`,
      status: "success",
      duration: 1000
    });
  };

  return (
    <VStack gap={4} w="100%">
      <RadioGroup onChange={setMode} value={mode}>
        <HStack>
          <Text>{t("game.vote-item-mode")}</Text>
          <Radio value="0">{t("game.vote-value-hexagon")}</Radio>
          <Radio value="1">{t("game.vote-value-square")}</Radio>
        </HStack>
      </RadioGroup>

      <SliderInput
        value={width}
        setValue={setWidth}
        label={t("apps.width")}
        {...limits}
      />

      <SliderInput
        value={height}
        setValue={setHeight}
        label={t("apps.height")}
        {...limits}
      />

      <Button colorScheme="blue" onClick={generate}>
        {t("apps.generate")}
      </Button>
    </VStack>
  );
}
