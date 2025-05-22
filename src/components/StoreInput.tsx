import { useEffect, useRef, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input.tsx'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface Props {
  className?: string
  closeOnScroll?: boolean
  overlayMode?: boolean
}

export default ({ className, closeOnScroll, overlayMode, ...props }: Props) => {
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
  const [clickItem, setClickItem] = useState(false)
  const listboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let tabNavigation = false

    const keyEvent = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Tab') {
        tabNavigation = true
      }
    }
    const onScroll = () => {
      if (closeOnScroll && !tabNavigation) {
        inputRef.current?.blur()
        setFocused(false)
      }
    }
    document.addEventListener('keydown', keyEvent);
    window.addEventListener('scroll', onScroll);

    (async () => {
      const res = await fetch('/api/store')
      const data = await res.json()
      setStores(data)
    })()

    return () => {
      document.removeEventListener('keydown', keyEvent)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!focused) return

    setListBoxStyle()

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

  const setListBoxStyle = () => {
    const listbox = listboxRef.current
    const input = inputRef.current
    if (!listbox || !input) return

    listbox.style.top = `${input.getBoundingClientRect().top + input.clientHeight}px`
    listbox.style.left = `${input.getBoundingClientRect().left}px`
    listbox.style.width = `${input.clientWidth}px`
  }

  return (
    <>
      <div
        className={cn(
          'fixed top-0 left-0 z-10 w-full h-full',
          !focused && 'hidden',
          focused && overlayMode && 'bg-background/45 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none'
        )}
        onClick={() => setFocused(false)}
      >
        <div
          ref={listboxRef}
          role='listbox'
          className='absolute w-full mt-2 flex flex-col bg-card text-card-foreground rounded-xl border shadow-md'
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
              tabIndex={-1}
              onMouseDown={() => setClickItem(true)}
              onMouseUp={() => setClickItem(false)}
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
        onBlur={() => !clickItem && setFocused(false)}
        autoComplete='off'
        autoCorrect='off'
        className={cn(
          'relative z-10',
          className,
          focused && overlayMode && 'absolute md:relative w-[calc(100%-2rem)] md:w-full'
        )}
        {...props}
      />
    </>
  )
}