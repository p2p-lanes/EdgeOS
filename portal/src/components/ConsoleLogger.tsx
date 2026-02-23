import { useEffect, useState } from "react"

const ConsoleLogger = () => {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const originalLog = console.log
    console.log = (...args) => {
      setLogs((prevLogs) => [...prevLogs, ...args])
      originalLog(...args)
    }
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        backgroundColor: "black",
        color: "white",
        padding: "10px",
        maxHeight: "100px",
        overflowY: "auto",
        width: "100%",
      }}
    >
      {logs.map((log, index) => (
        <div key={index}>{log?.toString()}</div>
      ))}
    </div>
  )
}

export default ConsoleLogger
