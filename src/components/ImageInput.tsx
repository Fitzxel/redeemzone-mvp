import { useRef, useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ImageUp } from 'lucide-react'

interface Props {
  onFile?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  src?: string
  alt?: string
  width?: number
  height?: number
  label?: string
  hideTip?: boolean
  [key: string]: InputHTMLAttributes<HTMLInputElement> | any
}

export default ({ onFile=()=> {}, accept, multiple, disabled, src, alt, width, height, label, hideTip, ...props }: Props)=> {
  const input = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <label
      onDragOver={e => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) onFile([file])
      }}
      className='group flex flex-col gap-1 cursor-pointer'
      title='Click to upload or drag and drop an image'
    >
      <input
        type='file'
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onInput={e=> {
          onFile([...(e.target as HTMLInputElement).files || []]);
          (e.target as HTMLInputElement).value = '';
        }}
        hidden
        ref={input}
        {...props}
      />
      {label}
      <div
        className={cn(
          'relative flex bg-muted cursor-pointer rounded-md overflow-hidden border border-input group-hover:bg-muted/50',
          isDragging && 'border-2 border-dashed border-white'
        )}
        style={{
          width: width ? width+'px' : '100%',
          height: height ? height+'px' : '100%',
        }}
      >
        {
          src &&
          <img
            src={src}
            alt={alt}
            width='100%'
            height='100%'
            className='object-cover object-center group-hover:opacity-45'
          />
        }
        <div className={cn(
          'absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center gap-1 text-sm',
          src && 'opacity-45 group-hover:opacity-100'
        )}>
          <ImageUp className='!w-12 !h-12 max-w-1/2 max-h-1/2' />
          <span className={cn(
            'w-full px-1 truncate text-center',
            hideTip && 'hidden'
          )}>
            Click to upload or drag and drop an image
          </span>
        </div>
      </div>
    </label>
  )
}