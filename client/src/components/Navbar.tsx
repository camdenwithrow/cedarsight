import { useClerk } from "@clerk/clerk-react"

export default function Navbar() {
  const { signOut } = useClerk()

  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-3 pl-6 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700  to-purple-500 inline-block text-transparent bg-clip-text">
        CedarSight
      </h1>
      <button
        type="button"
        className="font-medium rounded-lg text-sm px-3 py-1.5 mr-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 active:bg-gray-200 focus:ring-4 focus:ring-gray-200"
        onClick={() => signOut()}
      >
        Logout
      </button>
    </div>
  )
}
