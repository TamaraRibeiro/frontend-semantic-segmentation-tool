import { MdPhotoCameraBack } from "react-icons/md";

function triggerImageInput(id: string) {
  document.getElementById(id)?.click();
}

export default function UploadButton({
  uploadImage,
}: {
  uploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div onClick={() => triggerImageInput("upload-image")} className="flex items-center gap-2 border border-purple-300 px-4 py-1 text-sm bg-white rounded-md cursor-pointer transition ease-in-out duration-200 text-purple-300 hover:text-purple-400">
      <input id="upload-image" type="file" accept="image/*" onChange={uploadImage} hidden/>
      Upload
      <MdPhotoCameraBack />
    </div>
  );
}
