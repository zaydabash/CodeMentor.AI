'use client'

import { useState, useEffect } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data.value))
  }, [])

  const handleClick = () => {
    setCount(count + 1)
    setTimeout(() => {
      setCount(count + 1)
    }, 1000)
  }

  const renderUserContent = (userInput: string) => {
    return <div dangerouslySetInnerHTML={{ __html: userInput }} />
  }

  return (
    <div>
      <button onClick={handleClick}>Count: {count}</button>
      <div>{data}</div>
      {renderUserContent(data || '')}
    </div>
  )
}

