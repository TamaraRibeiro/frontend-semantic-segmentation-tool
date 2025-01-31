import { BiUpload } from "react-icons/bi";

// const props: UploadProps = {
//   name: "file",
//   action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",

//   onChange(info) {
//     if (info.file.status !== "uploading") {
//       console.log(info.file, info.fileList);
//     }
//     if (info.file.status === "done") {
//       message.success(`${info.file.name} file uploaded successfully`);
//     } else if (info.file.status === "error") {
//       message.error(`${info.file.name} file upload failed.`);
//     }
//   },
// };

export default function UploadButton() {
  return (
    <div className="flex items-center gap-2 px-2 py-0.5 border border-[#dab2ff] rounded-md cursor-pointer bg-white ease-in-out duration-300 text-sm hover:text-purple-600">
      <p>Click to upload</p>
      <BiUpload />
    </div>
  );
}
