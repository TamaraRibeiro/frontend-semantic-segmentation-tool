import { ColorPicker, Flex, Input, Tooltip } from "antd";

export default function Class() {
  return (
    <div className="flex gap-3 px-1 mx-auto">
      <Flex className="items-center gap-2">
        <label className="whitespace-nowrap" htmlFor="">
          Class name:
        </label>
        <Tooltip
          trigger={["focus"]}
          title="Type your class name"
          placement="topLeft"
          classNames={{ root: "numeric-input" }}
        >
          <Input size="small" className="w-full lg:size-8" placeholder="Type your class name" />
        </Tooltip>
      </Flex>
      <Flex className="items-center justify-end gap-2">
        <label htmlFor="">Color:</label>
        <ColorPicker size="small" defaultValue="#dab2ff" showText allowClear />
      </Flex>
    </div>
  );
}
