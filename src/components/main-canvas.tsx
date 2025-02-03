import { useCallback, useEffect, useRef, useState } from "react";
import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  Group,
  Line,
  Path,
  PencilBrush,
  Point,
  Polygon,
  TPointerEvent,
  TPointerEventInfo,
} from "fabric";
import { Button, Slider, SliderSingleProps, Tooltip } from "antd";
import { BiExport } from "react-icons/bi";
import { LuEraser } from "react-icons/lu";
import { FaUndo } from "react-icons/fa";
import UploadButton from "./upload";
import RadioGroup from "./radio-group";
import Class from "./class";
import { ClassProps, COCOAnnotation } from "../types/types";

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

  // create state to track actions
  const [history, setHistory] = useState<string[]>([]);

  const [classes, setClasses] = useState<ClassProps[]>([]);

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
      isPolygonMode,
      canvas,
      polygonPoints,
      isNearStartPoint,
      startPoint,
      newColor,
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

  const handleEraser = () => {
    if (!canvas) return;

    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "white";
    canvas.freeDrawingBrush.width = 10;

    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      if (activeObject.type === "group" || activeObject.type === "polygon") {
        canvas.remove(activeObject);
        alert("Are you sure you want to delete this annotation?");
      }
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const handleUndo = () => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length > 0) {
      const lastObject = objects[objects.length - 1];
      canvas.remove(lastObject);
      canvas.renderAll();

      setHistory((prevHistory) => prevHistory.slice(0, -1));
    }
  };

  // slider formatter config
  const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (
    value
  ) => `${value}%`;

  const onAddClass = (name: string, color: string) => {
    if (
      classes.some((item) => item.color.toLowerCase() === color.toLowerCase())
    ) {
      alert(
        "This color is already used by another class. Please choose a different color."
      );
      return;
    }
    const newClassCategory = { id: classes.length + 1, name, color };
    setClasses([...classes, newClassCategory]);
  };

  function pointInPolygon(
    x: number,
    y: number,
    poly: { x: number; y: number }[]
  ): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x,
        yi = poly[i].y;
      const xj = poly[j].x,
        yj = poly[j].y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const exportAnnotations = () => {
    if (!canvas) {
      alert("Canvas not initialized!");
      return;
    }

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const image_id = 1; // In this example we export one image.
    let annotationId = 1;

    // Declare arrays with our explicit type.
    const polygonAnnotations: COCOAnnotation[] = [];
    const brushAnnotations: COCOAnnotation[] = [];

    // 1. Process polygon annotations (from finished polygon mode).
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "group") {
        // Find the polygon inside the group.
        const groupObj = obj as Group;
        const polygonObj = groupObj
          .getObjects()
          .find((o: FabricObject) => o.type === "polygon") as
          | Polygon
          | undefined;
        if (!polygonObj) return;

        // Get the absolute transformation matrix of the group.
        const groupMatrix = obj.calcTransformMatrix();

        // Transform each of the polygon’s relative points using Fabric’s utility.
        const absolutePoints: Point[] = polygonObj.points.map(
          (pt: { x: number; y: number }) => {
            const relativePoint = new Point(pt.x, pt.y);
            return relativePoint.transform(groupMatrix);
          }
        );

        // Build a flat segmentation array for COCO format.
        // COCO expects an array of polygons (each polygon is an array of numbers).
        const segmentation = [
          absolutePoints.reduce(
            (acc: number[], pt: Point) => acc.concat([pt.x, pt.y]),
            []
          ),
        ];

        // Use Fabric’s getBoundingRect() to compute the bounding box.
        const rect = obj.getBoundingRect();
        const bbox: [number, number, number, number] = [
          rect.left,
          rect.top,
          rect.width,
          rect.height,
        ];

        // Compute the polygon area using the shoelace formula.
        let area = 0;
        for (let i = 0; i < absolutePoints.length; i++) {
          const j = (i + 1) % absolutePoints.length;
          area +=
            absolutePoints[i].x * absolutePoints[j].y -
            absolutePoints[j].x * absolutePoints[i].y;
        }
        area = Math.abs(area / 2);

        // Look up the class based on the polygon’s stroke color.
        const strokeColor = polygonObj.stroke as string;
        const category = classes.find(
          (c) => c.color.toLowerCase() === strokeColor.toLowerCase()
        );
        if (!category) {
          alert(
            "An annotation with stroke color " +
              strokeColor +
              " does not match any class."
          );
          return;
        }

        polygonAnnotations.push({
          id: annotationId,
          image_id: image_id,
          category_id: category.id,
          segmentation: segmentation,
          bbox: bbox,
          area: area,
          iscrowd: 0,
          annotation_type: "polygon",
        });
        annotationId++;
      }
    });

    // 2. Process brush (free-drawing) annotations.
    // These objects are of type "path".
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "path") {
        // Cast the generic object to fabric.Path so TypeScript recognizes the 'path' property.
        const pathObj = obj as Path;

        // Get the bounding rectangle and center point.
        const rect = pathObj.getBoundingRect();
        const bbox: [number, number, number, number] = [
          rect.left,
          rect.top,
          rect.width,
          rect.height,
        ];
        const area = rect.width * rect.height; // approximate area
        const center = pathObj.getCenterPoint();

        // Lookup the class by the stroke color.
        const strokeColor = pathObj.stroke as string;
        const category = classes.find(
          (c) => c.color.toLowerCase() === strokeColor.toLowerCase()
        );
        if (!category) {
          alert(
            "A brush annotation with stroke color " +
              strokeColor +
              " does not match any class."
          );
          return;
        }

        brushAnnotations.push({
          id: annotationId,
          image_id: image_id,
          category_id: category.id,
          segmentation: [], // No segmentation for free-draw strokes.
          bbox: bbox,
          area: area,
          iscrowd: 0,
          annotation_type: "brush",
          brush: {
            color: strokeColor,
            width: pathObj.strokeWidth,
            // TypeScript now knows that pathObj.path exists.
            path: pathObj.path,
            center: { x: center.x, y: center.y },
          },
        });
        annotationId++;
      }
    });

    // 3. (Optional) Overlap Check for polygon annotations.
    const mask = new Uint8Array(canvasWidth * canvasHeight);
    let overlapFound = false;

    polygonAnnotations.forEach((ann) => {
      // Convert the segmentation flat list into an array of points.
      const seg = ann.segmentation[0];
      const polyPoints: { x: number; y: number }[] = [];
      for (let i = 0; i < seg.length; i += 2) {
        polyPoints.push({ x: seg[i], y: seg[i + 1] });
      }

      // Compute a bounding box from the segmentation points.
      const xs = polyPoints.map((p) => p.x);
      const ys = polyPoints.map((p) => p.y);
      const minX = Math.floor(Math.min(...xs));
      const minY = Math.floor(Math.min(...ys));
      const maxX = Math.ceil(Math.max(...xs));
      const maxY = Math.ceil(Math.max(...ys));

      // For each pixel in the bounding box, test if its center is inside the polygon.
      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          if (pointInPolygon(x + 0.5, y + 0.5, polyPoints)) {
            const idx = y * canvasWidth + x;
            if (mask[idx] !== 0) {
              overlapFound = true;
              break;
            } else {
              mask[idx] = ann.category_id;
            }
          }
        }
        if (overlapFound) break;
      }
    });

    if (overlapFound) {
      alert(
        "Overlap detected: one or more pixels are assigned to more than one class. " +
          "Please adjust your annotations and try again."
      );
      return;
    }

    // 4. Build the final COCO-format JSON.
    // Retrieve the background image source by casting the backgroundImage.
    const bgSrc =
      canvas.backgroundImage &&
      (canvas.backgroundImage as FabricImage).get("src")
        ? (canvas.backgroundImage as FabricImage).get("src")
        : "no_image";

    const allAnnotations: COCOAnnotation[] =
      polygonAnnotations.concat(brushAnnotations);

    const cocoData = {
      images: [
        {
          id: image_id,
          width: canvasWidth,
          height: canvasHeight,
          file_name: bgSrc,
        },
      ],
      annotations: allAnnotations,
      categories: classes.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color, // Custom field for color.
        supercategory: "none",
      })),
    };

    // 5. Trigger the download of the JSON file.
    const jsonStr = JSON.stringify(cocoData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "annotations.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(jsonStr);
  };

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
            <Tooltip
              trigger={["hover"]}
              title="Eraser"
              placement="top"
              id="eraser-tooltip"
            >
            <LuEraser
              onClick={handleEraser}
              className="cursor-pointer hover:text-purple-400 hover:scale-105 transition ease-in-out duration-200"
              size={18}
            /></Tooltip>
            <Tooltip
              trigger={["hover"]}
              title="Undo"
              placement="top"
              id="undo-tooltip"
            >
            <FaUndo
              onClick={handleUndo}
              className="cursor-pointer hover:text-purple-400 hover:scale-105 transition ease-in-out duration-200"
              size={14}
            /></Tooltip>
          </div>
        </div>
        <div className={"flex gap-1 items-center text-zinc-700"}>
          <p className="">Brush width</p>
          <div className="w-72 mt-1">
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
      </div>

      <Class
        newColor={newColor}
        setNewColor={setNewColor}
        onAddClass={onAddClass}
      />

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
          onClick={exportAnnotations}
        >
          Export your annotations
        </Button>
      </div>
    </div>
  );
}
