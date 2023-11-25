import { useState, useEffect } from "react"

interface AnimatedTextProps {
  text: string
  start?: boolean
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, start = true }) => {
  const [currText, setCurrText] = useState("")
  const [i, setI] = useState(0)

  useEffect(() => {
    if (start) {
      const textArr = text.split(" ")
      if (i < textArr.length) {
        const timeout = setTimeout(() => {
          setCurrText((prevText) => prevText + " " + textArr[i])
          setI((prevI) => prevI + 1)
        }, 100)
        return () => clearTimeout(timeout)
      }
    }
  }, [currText, i, text, start])

  return <div className="text-sm font-semibold text-center">{currText}</div>
}

export default AnimatedText
