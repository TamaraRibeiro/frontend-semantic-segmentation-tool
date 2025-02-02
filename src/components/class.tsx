import { ColorPicker, Flex, Input, Tooltip } from "antd";

export default function Class({
  newColor,
  setNewColor,
}: {
  newColor: string;
  setNewColor: React.Dispatch<React.SetStateAction<string>>;
}) {
  const handleSetColor = (color: string) => {
    setNewColor(color);
  };

  return (
    <div className="flex gap-3 px-1 mx-auto">
      <Flex className="items-center gap-2">
        <p className="whitespace-nowrap">
          Class name:
        </p>
        <Tooltip
          trigger={["focus"]}
          title="Type your class name"
          placement="topLeft"
          classNames={{ root: "numeric-input" }}
          id="obj-class-name-tooltip"
        >
          <Input
            id="obj-class-name"
            size="small"
            className="w-full lg:size-8"
            placeholder="Type your class name"
          />
        </Tooltip>
      </Flex>
      <Flex className="items-center justify-end gap-2">
        <p>Color:</p>
        <ColorPicker
          onChange={(_, hex) => handleSetColor(hex)}
          size="small"
          value={newColor}
          showText
          allowClear
        />
      </Flex>
    </div>
  );
}
