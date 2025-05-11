import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input.tsx'

export default ({ ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stores, setStores] = useState([] as Store[])

  useEffect(() => {
    const keyEvent = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', keyEvent);

    (async () => {
      const res = await fetch('/api/store')
      const data = await res.json()
      setStores(data)
    })()

    return () => {
      document.removeEventListener('keydown', keyEvent)
    }
  }, [])

  return (
    <Input
      ref={inputRef}
      name='store'
      placeholder='store/'
      onKeyDown={(e: any) => {
        if (e.key === 'Enter') {
          window.location.href = `/store/${e.target.value}`
        }
      }}
      {...props}
    />
  )
}