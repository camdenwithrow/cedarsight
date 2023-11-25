import { useState, useEffect } from "react"
import { LoadingSpinner } from "../icons/Icons"
import Lottie from "lottie-react"
import Confirm from "../assets/confirmAnimation.json"
import ChatGptLogo from "../assets/chatgpt-log.png"
import RCIMLogo from "../assets/rcim-logo.png"
import AnimatedText from "./AnimatedText"

interface SubmittedProps {
  loading: boolean
}

export default function Submitted(props: SubmittedProps) {
  const { loading } = props

  const [completed, setCompleted] = useState(false)
  const [startMessage, setStartMessage] = useState(false)
  const [iconAnimation, setIconAnimation] = useState(false)

  useEffect(() => {
    if (completed) {
      setTimeout(() => setIconAnimation(true), 500)
      setTimeout(() => setStartMessage(true), 800)
    }
  }, [completed])

  const handleEndCheckAnimation = () => {
    console.log("completed")
    setCompleted(true)
  }

  return (
    <div className="w-full flex justify-center items-center">
      {!completed ? (
        <>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Lottie
              className="w-28 h-28 -mt-6"
              animationData={Confirm}
              loop={false}
              onComplete={handleEndCheckAnimation}
            />
          )}
        </>
      ) : (
        <div>
          <div className="relative w-24 h-24 mx-auto mb-6">
            <img
              className={`absolute transition-transform duration-400 ${
                iconAnimation ? "-translate-x-1/3" : "translate-x-0"
              }`}
              src={RCIMLogo}
            ></img>
            <img
              className={`absolute w-20 h-20 m-2 -z-10 transition-transform duration-400 ${
                iconAnimation ? "translate-x-1/3" : "translate-x-0"
              }`}
              src={ChatGptLogo}
            ></img>
          </div>
          <AnimatedText
            start={startMessage}
            text="Your files are being processed and summarized now. You'll receive an email with the finalized report :)"
          />
        </div>
      )}
    </div>
  )
}
