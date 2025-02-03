export interface ClassProps {
  id: number;
  name: string;
  color: string;
}

interface BrushData {
  color: string;
  width: number;
  path: (string | number)[][];
  center: { x: number; y: number };
}

export interface COCOAnnotation {
  id: number;
  image_id: number;
  category_id: number;
  segmentation: number[][]; 
  area: number;
  bbox: [number, number, number, number]; 
  iscrowd: 0;
  annotation_type: "polygon" | "brush";
  brush?: BrushData;
}
