import { useState } from "react"


export default function Alert(props: { errorMessage: string }) {
  const [viewError, setViewError] = useState(false)

  const handleToggleViewError = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setViewError(!viewError)
  }

  return (
    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
      <div className="flex items-center ">
        <svg
          className="flex-shrink-0 inline w-4 h-4 me-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        <span className="sr-only">Info</span>
        <div className="w-full">
          <p className="font-semibold">There was an issue with the request :( try again</p>
          {!viewError ? (
            <button className="underline" onClick={handleToggleViewError}>
              view error
            </button>
          ) : (
            <>
              <p>{props.errorMessage}</p>
              <button className="underline" onClick={handleToggleViewError}>
                close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
