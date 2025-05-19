import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default ({ user }: { user: User }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createStore = async () => {
    setIsSubmitting(true)

    const res = await fetch('/api/store', {
      method: 'POST',
    })
    const data = await res.json()
    location.reload()
    return data
  }

  return (
    <Button
      disabled={isSubmitting}
      onClick={createStore}
    >
      {isSubmitting && <Loader2 className='animate-spin' />}
      Crear tienda
    </Button>
  )
}