import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react"

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw "Missing Publishable Key"
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SignedIn>
        <Welcome />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  )
}

function Welcome() {
  return <div>Hello you are signed in</div>
}

export default App
