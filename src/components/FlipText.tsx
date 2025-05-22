import { useEffect, useState } from 'react'

interface FlipTextProps {
  texts: string[]
  interval?: number
  className?: string
}

export default ({
  texts = ['Primer texto', 'Segundo texto'],
  interval = 4000,
  className = '',
}: FlipTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true)

      // Cambiar el texto después de que la animación de salida termine
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)

        // Reiniciar la animación
        setTimeout(() => {
          setIsFlipping(false)
        }, 50)
      }, 400) // La mitad de la duración de la animación
    }, interval)

    return () => clearInterval(timer)
  }, [texts, interval])

  return (
    <div className={`relative w-full h-10 overflow-hidden animate-fade-in-up ${className}`}>
      <div
        className={`absolute w-full h-full transition-all duration-800 ${
          isFlipping ? 'opacity-0 -translate-y-full transform-gpu rotateX-90' : 'opacity-100'
        }`}
        style={{
          transformOrigin: 'center bottom',
          transform: isFlipping ? 'rotateX(-90deg) translateY(-100%)' : 'rotateX(0) translateY(0)',
        }}
      >
        <div className='flex items-center justify-center h-full'>
          {texts[currentIndex]}
        </div>
      </div>
    </div>
  )
}
