import { useEffect, useRef, useState } from "react";
import { Canvas, Rect } from "fabric";
import { Button, Slider, SliderSingleProps } from "antd";
import { BiExport } from "react-icons/bi";
import { LuEraser } from "react-icons/lu";
import { FaUndo } from "react-icons/fa";
import UploadButton from "./upload";
import RadioGroup from "./radio-group";
export default function MainCanvas() {
    // create reference so fabric.js can interact with the DOM
  const canvasRef = useRef(null);
  // check if the fabric canvas has successfully initialized
  const [canvas, setCanvas] = useState<Canvas>();
  const [value, setValue] = useState(1);

  // initialize the fabric canvas
  useEffect(() => {
    if (canvasRef.current) {
      // tells fabric js to initialize on the specific canvas element
      const newCanvas = new Canvas(canvasRef.current, {
        width: 350,
        height: 400,
        // backgroundColor: "#fff",
      });

      newCanvas.renderAll();

      setCanvas(newCanvas);

      return () => {
        newCanvas.dispose();
      };
    }
  }, []);

  const addRectangle = () => {
    if (canvas) {
      const rect = new Rect({
        top: 200,
        left: 50,
        width: 80,
        height: 40,
        fill: "#D84D42",
      });

      canvas.add(rect);
    }
  };

  const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (
    value
  ) => `${value}%`;
    return(
        <div className="bg-fuchsia-100/80 rounded-xl px-4 py-4 space-y-4 w-full h-full flex flex-col">
        <div className="flex mx-auto items-center gap-2">
          <h3 className="lg:text-lg">Upload your image</h3>
          <UploadButton />
        </div>
        <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2 items-center justify-center">
          <RadioGroup value={value} setValue={setValue} />
          <div className="flex items-center gap-4">
            <LuEraser size={17} />
            <FaUndo size={13} />
          </div>
        </div>
        <div className="w-72">
          <Slider disabled={value !== 1} tooltip={{ formatter }} />
        </div>
        </div>

        <div className="py-2 px-2 grid grid-cols-2 gap-2 lg:mx-auto">
          <Button onClick={addRectangle} style={{ borderColor: "#dab2ff" }}>
            Rectangle
          </Button>
          <Button onClick={addRectangle} style={{ borderColor: "#dab2ff" }}>
            Rectangle
          </Button>
        </div>
        <div className="flex justify-center w-full">
          <canvas
            id="canvas"
            ref={canvasRef}
            className="rounded-md shadow-md border border-zinc-300"
          />
        </div>
        <div className="py-2 px-2 gap-2 lg:mx-auto w-full">
          <Button
            iconPosition="end"
            icon={<BiExport />}
            style={{ borderColor: "#dab2ff" }}
          >
            Export your annotations
          </Button>
        </div>
      </div>
    )
}