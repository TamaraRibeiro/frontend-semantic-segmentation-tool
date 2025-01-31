import type { RadioChangeEvent } from "antd";
import { Flex, Radio } from "antd";
import { PiPaintBrush, PiPolygon } from "react-icons/pi";

export default function RadioGroup({value, setValue}: {value: number, setValue: React.Dispatch<React.SetStateAction<number>>}) {

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  return (
    <Radio.Group
      onChange={onChange}
      value={value}
      options={[
        {
          value: 1,
          label: (
            <Flex
              gap={3}
              justify="center"
              align="center"
              style={{ fontSize: "medium" }}
            >
              <PiPaintBrush style={{ fontSize: 20 }} />
              Brush tool
            </Flex>
          ),
        },
        {
          value: 2,
          label: (
            <Flex
              gap={3}
              justify="center"
              align="center"
              style={{ fontSize: "medium" }}
            >
              <PiPolygon style={{ fontSize: 18 }} />
              Polygon
            </Flex>
          ),
        },
      ]}
    />
  );
}
