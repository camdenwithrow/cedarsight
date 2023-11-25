import React, { ChangeEvent, useState } from "react"

interface FileDropzoneProps {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
}

function FileDropzone(props: FileDropzoneProps) {
  const { files, setFiles } = props
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault() // Prevent default behavior (prevent file from being opened)
    setIsDragOver(true)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...new Set([...prev, ...files])])
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFiles((prev) => [...new Set([...prev, ...files])])
    }
  }

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-32  border-dashed rounded-lg cursor-pointer
          ${
            isDragOver
              ? "border-blue-300 border-2 text-gray-300"
              : files.length > 0
              ? "text-gray-500 border-2 border-green-200 hover:bg-gray-100 bg-gray-50"
              : "text-gray-500 border-2 border-gray-300 hover:bg-gray-100 bg-gray-50"
          }
        `}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-8 h-8"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="text-sm ">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
        </div>
        <input id="dropzone-file" type="file" multiple className="hidden" onChange={handleFileChange} required/>
      </label>
    </div>
  )
}

export default FileDropzone
