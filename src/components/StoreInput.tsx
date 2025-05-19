import { useEffect, useRef, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input.tsx'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default ({ className, ...props }: any) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [stores, setStores] = useState([] as Store[])
  const [listIndex, setListIndex] = useState(-1)
  const storesResult = useMemo(() => {
    if (value && listIndex === -1)
      return stores
      .map((store) => {
        const slugMatch = store.slug.toLowerCase().includes(value.toLowerCase())
        const nameMatch = store.name.toLowerCase().includes(value.toLowerCase())
        let score = 0
        if (slugMatch) score += 2
        if (nameMatch) score += 1
        return { store, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ store }) => store)
    else
      return stores
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [value, stores])

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

  useEffect(() => {
    if (!focused) return

    const keyEvent = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()

        const newIndex = listIndex + 1
        setListIndex(() => {
          if (newIndex >= stores.length) return 0
          return newIndex
        })
        setValue(stores[newIndex].slug)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        
        const newIndex = listIndex - 1
        setListIndex(() => {
          if (newIndex < 0) return stores.length - 1
          return newIndex
        })
        setValue(stores[newIndex].slug)
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        inputRef.current?.blur()
        setFocused(false)
      }
    }

    addEventListener('keydown', keyEvent)

    return () => {
      removeEventListener('keydown', keyEvent)
    }
  }, [focused, listIndex, stores])

  return (
    <>
      <div
        className={cn(
          'fixed top-0 left-0 z-10 w-full h-full',
          !focused && 'hidden'
        )}
        onClick={() => setFocused(false)}
      >
        <div
          role='listbox'
          className='absolute w-full mt-2 flex flex-col bg-card text-card-foreground rounded-xl border shadow-md'
          style={{
            width: inputRef.current?.clientWidth,
            top: (inputRef.current?.getBoundingClientRect().top || 0) + (inputRef.current?.clientHeight || 0),
            left: inputRef.current?.getBoundingClientRect().left,
          }}
        >
          {storesResult.map((store, i) => (
            <a
              key={store.id}
              role='listitem'
              href={`/store/${store.slug}`}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'h-auto px-4 py-3 flex justify-start items-center gap-2 text-sm rounded-none',
                i === listIndex && 'bg-accent text-accent-foreground dark:bg-accent/50'
              )}
              tabIndex={0}
              onClick={() => setFocused(false)}
            >
              <img
                src={store.iconUrl}
                className='w-8 h-8 rounded-full'
              />
              <span>
                {store.name}
              </span>
            </a>
          ))}
        </div>
      </div>
      <Input
        ref={inputRef}
        name='store'
        placeholder='store/'
        value={value}
        onChange={(e) => {
          setListIndex(-1)
          setValue(e.target.value)
        }}
        onKeyDown={(e: any) => {
          if (e.key === 'Enter') {
            window.location.href = `/store/${e.target.value}`
          }
        }}
        onFocus={() => setFocused(true)}
        autoComplete='off'
        autoCorrect='off'
        className={cn(
          'relative z-10',
          className
        )}
        {...props}
      />
    </>
  )
}