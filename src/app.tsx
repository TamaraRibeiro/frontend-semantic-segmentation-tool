import "./App.css";
import { useEffect, useRef, useState } from "react";
import { Canvas, Rect } from "fabric";
import { Button } from "antd";
import UploadButton from "./components/upload";
export default function App() {
  // create reference so fabric.js can interact with the DOM
  const canvasRef = useRef(null);
  // check if the fabric canvas has successfully initialized
  const [canvas, setCanvas] = useState<Canvas>();

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

  return (
    <div className="bg-red-50/40 h-screen w-screen flex flex-col items-center justify-center p-4 space-y-6 text-center">
      <div className="bg-fuchsia-100/80 rounded-xl px-2 lg:px-6 py-4 w-full">
        <h1 className="text-xl lg:text-4xl font-semibold leading-loose text-violet-400">
          Frontend Segmentation Labeling Tool <br /> Overview AI
        </h1>
      </div>
      <div className="bg-fuchsia-100/80 rounded-xl px-4 py-4 space-y-4 w-full h-full flex flex-col">
        <div className="flex mx-auto items-center gap-2">
          <h3 className="lg:text-lg">Upload your image</h3>
          <UploadButton />
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
      </div>
    </div>
  );
}
