import { useCallback, useEffect, useRef, useState } from "react";
import {
  Canvas,
  Circle,
  FabricImage,
  Group,
  Line,
  PencilBrush,
  Polygon,
  TPointerEvent,
  TPointerEventInfo,
} from "fabric";
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
  const canvasElementRef = useRef<HTMLCanvasElement>(null);

  // create the state to set fabric canvas
  const [canvas, setCanvas] = useState<Canvas | null>();

  //state to control de toggle value 0 -> canvas move (default), 1 -> brush, 2 -> polygon
  const [optionToggleValue, setOptionToggleValue] = useState(0);
  // states to control brush and width settings
  const [brushWidthValue, setBrushWidthValue] = useState(5);
  const [newColor, setNewColor] = useState("#000000");

  // polygon settings
  const [isPolygonMode, setIsPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const closingThreshold = 10;
  const [lines, setLines] = useState<Line[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);

  // initialize the fabric canvas
  useEffect(() => {
    // check if the fabric canvas has successfully initialized
    if (canvasElementRef.current) {
      // tells fabric js to initialize on the specific canvas element and set default properties
      const newCanvas = new Canvas(canvasElementRef.current, {
        width: 350,
        height: 400,
        backgroundColor: "#ffffff",
        isDrawingMode: false,
      });

      canvasRef.current = newCanvas;

      // initializing brush mode
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

  // function to verify when the polygon is near to the start point so it can close
  const isNearStartPoint = useCallback(
    (x: number, y: number) => {
      if (!startPoint) return false;
      const dx = startPoint.x - x;
      const dy = startPoint.y - y;
      return Math.sqrt(dx * dx + dy * dy) < closingThreshold;
    },
    [startPoint]
  );

  // polygon mode
  const handleMouseClick = useCallback(
    (event: TPointerEventInfo<TPointerEvent>) => {
      if (!isPolygonMode || !canvas) return;

      const pointer = canvas.getViewportPoint(event.e);
      const { x, y } = pointer;

      if (polygonPoints.length === 0) {
        setStartPoint({ x, y });

        // Draw temporary points
        const firstCircle = new Circle({
          left: x,
          top: y,
          radius: 5,
          fill: "black",
          selectable: false,
          originX: "center",
          originY: "center",
        });
        canvas.add(firstCircle);
        setCircles((prev) => [...prev, firstCircle]);
      }

      if (polygonPoints.length >= 2 && isNearStartPoint(x, y)) {
        const closingLine = new Line(
          [
            polygonPoints[polygonPoints.length - 1].x,
            polygonPoints[polygonPoints.length - 1].y,
            startPoint!.x,
            startPoint!.y,
          ],
          {
            stroke: "blue",
            strokeWidth: 2,
            selectable: false,
          }
        );
        canvas.add(closingLine);
        setLines((prev) => [...prev, closingLine]);

        const polygon = new Polygon(polygonPoints, {
          fill: "rgba(0, 0, 255, 0.2)",
          stroke: newColor,
          strokeWidth: 2,
          selectable: false,
          objectCaching: false,
        });

        const group = new Group([polygon, ...lines, ...circles], {
          selectable: true,
          objectCaching: false,
        });

        canvas.add(group);
        canvas.renderAll();

        [...lines, ...circles, closingLine].forEach((item) =>
          canvas.remove(item)
        );

        setLines([]);
        setCircles([]);
        setPolygonPoints([]);
        setStartPoint(null);
        return;
      }

      if (polygonPoints.length > 0) {
        const prevPoint = polygonPoints[polygonPoints.length - 1];
        const line = new Line([prevPoint.x, prevPoint.y, x, y], {
          stroke: newColor,
          strokeWidth: 2,
          selectable: false,
        });
        canvas.add(line);
        setLines((prev) => [...prev, line]);
      }

      const circle = new Circle({
        left: x,
        top: y,
        radius: 3,
        stroke: "black",
        fill: "white",
        selectable: false,
        originX: "center",
        originY: "center",
      });
      canvas.add(circle);
      setCircles((prev) => [...prev, circle]);

      setPolygonPoints((prev) => [...prev, { x, y }]);
    },
    [
      canvas,
      isPolygonMode,
      polygonPoints,
      startPoint,
      isNearStartPoint,
      lines,
      circles,
    ]
  );

  useEffect(() => {
    return () => {
      canvas?.off("mouse:down", handleMouseClick);
    };
  }, [canvas, handleMouseClick]);

  // function to toggle between canvas, drawing or polygon modes
  useEffect(() => {
    if (!canvas) return;
    canvas.off("mouse:down", handleMouseClick);

    if (optionToggleValue === 0) {
      canvas.isDrawingMode = false;
      setIsPolygonMode(false);

      canvas.getObjects().forEach((obj) => {
        if (obj.type === "group" || obj.type === "polygon") {
          obj.selectable = true;
        } else {
          obj.selectable = false;
        }
      });
    } else if (optionToggleValue === 1) {
      canvas.isDrawingMode = true;
      setIsPolygonMode(false);
      canvas.getObjects().forEach((obj) => {
        obj.selectable = false;
      });
    } else {
      canvas.isDrawingMode = false;
      setIsPolygonMode(true);

      canvas.getObjects().forEach((obj) => {
        if (obj.type === "group" || obj.type === "polygon") {
          obj.selectable = false;
        }
      });

      canvas.on("mouse:down", handleMouseClick);
    }
  }, [optionToggleValue, canvas, handleMouseClick]);

  // function to update brush size and color when they change
  useEffect(() => {
    if (!canvas) return;
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = newColor;
      canvas.freeDrawingBrush.width = brushWidthValue;
    }
  }, [newColor, brushWidthValue, canvas]);

  const handleBrushWidthSlider = (value: number) => {
    setBrushWidthValue(value);
  };

  // function to upload an image as the background
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

  // slider formatter config
  const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (
    value
  ) => `${value}%`;

  return (
    <div className="bg-fuchsia-100/80 rounded-xl px-4 py-4 space-y-4 w-full h-full flex flex-col">
      <div className="flex mx-auto items-center gap-2">
        <h3 className="lg:text-lg">Upload your image</h3>
        <UploadButton uploadImage={uploadImage} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col gap-2 lg:flex-row items-center">
        <div className="flex gap-2 items-center justify-center">
          <RadioGroup
            optionToggleValue={optionToggleValue}
            setOptionToggleValue={setOptionToggleValue}
          />
        </div>
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
