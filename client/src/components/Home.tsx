import { useState } from "react"
import FileDropzone from "./FileDropzone"
import Submitted from "./Submitted"
import { Trash } from "../icons/Icons"
import Alert from "./Alert"
import { useUser } from "@clerk/clerk-react"

function Home() {
  const { user } = useUser()

  const email = user?.primaryEmailAddress?.emailAddress

  const [files, setFiles] = useState<File[]>([])
  const [emailInput, setEmailInput] = useState<string>(email ? email : "")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleClickDeleteFile = (e: React.MouseEvent<HTMLButtonElement>, deleteFile: File) => {
    e.preventDefault()
    setFiles((prev) => prev.filter((file) => file !== deleteFile))
  }

  const handleClickEmailInput = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement
    input.select()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("email", emailInput)
    files.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      })
      setLoading(true)
      if (!response.ok) {
        throw new Error(`Error ${response.statusText}`)
      }
      const result = await response.json()
      console.log(result)
    } catch (error) {
      console.log(error)
      setErrorMessage(error as string)
    } finally {
      console.log("submitted")
      setLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="p-4 mt-10 sm:mt-0 xs:p-0 sm:w-128 h-screen sm:flex sm:justify-center sm:items-center m-auto ">
      {loading || submitted ? (
        <Submitted loading={loading} />
      ) : (
        <form className="w-full" encType="multipart/form-data" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
              Email address (to send summary report)
            </label>
            <input
              type="email"
              id="email"
              value={emailInput}
              onClick={handleClickEmailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="wavid.dithrow@greenspruce.com"
              required
            />
          </div>
          <FileDropzone files={files} setFiles={setFiles} />
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
          <button
            type="submit"
            className="w-full mt-6 px-5 py-2.5 me-2 mb-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm focus:outline-none"
          >
            Submit
          </button>
          {errorMessage && <Alert errorMessage={errorMessage} />}
        </form>
      )}
    </div>
  )
}

export default Home
