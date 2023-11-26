import { SetStateAction } from "react"
import { Trash } from "../icons/Icons"

export default function FileList(props: { files: File[]; setFiles: React.Dispatch<SetStateAction<File[]>> }) {
  const { files, setFiles } = props

  const handleClickDeleteFile = (e: React.MouseEvent<HTMLButtonElement>, deleteFile: File) => {
    e.preventDefault()
    setFiles((prev) => prev.filter((file) => file !== deleteFile))
  }

  return (
    <div className="mt-3">
      {files &&
        files.map((file) => (
          <div key={file.name} className="flex items-center mb-2">
            <button onClick={(e) => handleClickDeleteFile(e, file)}>
              <Trash className="w-4 h-4" />
            </button>
            <p key={file.name} className="text-xs ml-3">
              {file.name}
            </p>
          </div>
        ))}
    </div>
  )
}
