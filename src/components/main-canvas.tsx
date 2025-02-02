/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, PencilBrush } from "fabric";
import { Button, Slider, SliderSingleProps } from "antd";
import { BiExport } from "react-icons/bi";
import { LuEraser } from "react-icons/lu";
import { FaUndo } from "react-icons/fa";
import UploadButton from "./upload";
import RadioGroup from "./radio-group";
import Class from "./class";
export default function MainCanvas() {
  // create reference so fabric.js can interact with the DOM
  const canvasRef = useRef<Canvas | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null)
  
  const [canvas, setCanvas] = useState<Canvas | null>();

  const [optionToggleValue, setOptionToggleValue] = useState(1);
  const [brushWidthValue, setBrushWidthValue] = useState(5);
  const [newColor, setNewColor] = useState("#000000");

  // initialize the fabric canvas
  useEffect(() => {
    // check if the fabric canvas has successfully initialized
    if (canvasElementRef.current) {
      // tells fabric js to initialize on the specific canvas element and set properties
      const newCanvas = new Canvas(canvasElementRef.current, {
        width: 350,
        height: 400,
        backgroundColor: "#ffffff",
        isDrawingMode: true,
      });

      canvasRef.current = newCanvas

      newCanvas.freeDrawingBrush = new PencilBrush(newCanvas);
      newCanvas.freeDrawingBrush.color = "#000000";
      newCanvas.freeDrawingBrush.width = 0;

      setCanvas(newCanvas);
      newCanvas.renderAll();

      return () => {
        canvasRef.current?.dispose();
      };
    }
     
  }, []);

  // updating brush size and color when they change
  useEffect(() => {
    if (canvasRef.current && canvasRef.current.freeDrawingBrush) {
      canvasRef.current.freeDrawingBrush.color = newColor;
      canvasRef.current.freeDrawingBrush.width = brushWidthValue;
    }
  }, [newColor, brushWidthValue]);

  const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (
    value
  ) => `${value}%`;

  const handleBrushWidthSlider = (value: number) => {
    setBrushWidthValue(value);
  };

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;

        try {
          // load image with type FabricImage
          const img: FabricImage = await FabricImage.fromURL(imageUrl, {
            crossOrigin: "anonymous",
          });

          // scale the image to fit in the canvas
          const scaleX = canvas.width! / img.width!;
          const scaleY = canvas.height! / img.height!;
          img.scaleX = scaleX;
          img.scaleY = scaleY;

          // set tjhe background
          canvas.backgroundImage = img;
          canvas.renderAll();
        } catch (error) {
          console.error("Error loading image:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="bg-fuchsia-100/80 rounded-xl px-4 py-4 space-y-4 w-full h-full flex flex-col">
      <div className="flex mx-auto items-center gap-2">
        <h3 className="lg:text-lg">Upload your image</h3>
        <UploadButton uploadImage={uploadImage}/>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2 items-center justify-center">
          <RadioGroup
            optionToggleValue={optionToggleValue}
            setOptionToggleValue={setOptionToggleValue}
          />
          <div className="flex items-center gap-4">
            <LuEraser
              className="cursor-pointer hover:text-purple-400 hover:scale-105 transition ease-in-out duration-200"
              size={17}
            />
            <FaUndo
              className="cursor-pointer hover:text-purple-400 hover:scale-105 transition ease-in-out duration-200"
              size={13}
            />
          </div>
        </div>
        <div className="w-72">
          <Slider
            onChange={handleBrushWidthSlider}
            disabled={optionToggleValue !== 1}
            tooltip={{ formatter }}
            value={brushWidthValue}
            min={1}
            max={100}
          />
        </div>
      </div>

      <Class newColor={newColor} setNewColor={setNewColor} />

      <div className="flex justify-center w-full">
        <canvas
          id="canvas"
          ref={canvasElementRef}
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
  );
}
