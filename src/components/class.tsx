import { Button, ColorPicker, Flex, Input, Tooltip } from "antd";
import React, { useState } from "react";

export default function Class({
  newColor,
  setNewColor,
  onAddClass,
}: {
  newColor: string;
  setNewColor: React.Dispatch<React.SetStateAction<string>>;
  onAddClass: (name: string, color: string) => void;
}) {
  const [className, setClassName] = useState("");
  const [colorPicker, setColorPicker] = useState("#000000");
  const handleSetColor = (color: string) => {
    setNewColor(color);
  };

  const handleAddClass = () => {
    if (className.trim() === "") {
      alert("Class name cannot be empty.");
      return;
    }
    onAddClass(className, colorPicker);
    setClassName("");
    setColorPicker("#000000");
  };

  return (
    <div className="grid grid-rows-2 lg:flex gap-3 px-1 mx-auto">
      <Flex className="items-center gap-2">
        <p className="whitespace-nowrap">Class name:</p>
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
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </Tooltip>
      </Flex>
      
      <Flex className="items-center justify-end gap-2">
        <p>Color:</p>
        <ColorPicker
          onChange={(_, hex) => handleSetColor(hex)}
          value={newColor}
          showText
          allowClear
        />
      </Flex>
      <Flex className="items-center justify-end lg:justify-start">
        <Button
          className="w-36"
          onClick={handleAddClass}
          style={{ borderColor: "#dab2ff" }}
        >
          Save Class
        </Button>
      </Flex>
    </div>
  );
}
