import "./App.css";
import MainCanvas from "./components/main-canvas";

export default function App() {
  

  return (
    <div className="bg-red-50/40 h-screen w-screen flex flex-col items-center justify-center p-4 space-y-6 text-center">
      <div className="bg-fuchsia-100/80 rounded-xl px-2 lg:px-6 py-4 w-full">
        <h1 className="text-xl lg:text-4xl font-semibold leading-loose text-violet-400">
          Frontend Segmentation Labeling Tool <br /> Overview AI
        </h1>
      </div>
      <MainCanvas />
    </div>
  );
}
