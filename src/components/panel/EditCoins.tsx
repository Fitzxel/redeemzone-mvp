import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ImageInput from '@/components/ImageInput.tsx'
import { uploadToR2 } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }).refine((name) => name.endsWith('Coins'), {
    message: 'El nombre debe terminar en "Coins".',
  }),
  imageFile: z.instanceof(File).optional().refine((file) => {
    if (!file) return true
    return file.type.startsWith('image/')
  }, {
    message: 'El archivo debe ser una imagen.',
  }).refine((file) => {
    if (!file) return true
    return file.size < 50 * 1024
  }, {
    message: 'El archivo debe pesar menos de 50KB.',
  }),
})

export default ({ store }: { store: Store }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: store.coin.name,
      imageFile: undefined,
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState(store.coin.imageUrl)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data)
    const { name, imageFile } = data

    // get signed url for each file
    if (imageFile) {
      const { signedUrl } = await fetch(`/api/signedurl?path=images/${store.id}/coin`).then(res => res.json())
      // upload image file to r2
      await uploadToR2(signedUrl, imageFile)
    }

    await fetch(`/api/store`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coin: {
          name,
          imageUrl: imageFile ? `${import.meta.env.PUBLIC_R2_URL}/images/${store.id}/coin` : store.coin.imageUrl,
        }
      } as Store),
    })
  }

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className='w-full'>
          <CardHeader className='flex justify-between items-center'>
            <CardTitle className='text-2xl font-bold'>
              Moneda
            </CardTitle>
            <Button
              type='submit'
              disabled={isSubmitting}
            >
              {
                isSubmitting && <Loader2 className='animate-spin-clockwise animate-iteration-count-infinite' />
              }
              Guardar
            </Button>
          </CardHeader>
          <CardContent className='flex gap-4'>
            <FormField
              control={form.control}
              name='imageFile'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>
                    Icono
                  </FormLabel>
                  <FormControl>
                    <ImageInput
                      accept='image/*'
                      src={imageUrl}
                      alt='image'
                      width={48}
                      height={48}
                      hideTip
                      onFile={(files: File[]) => {
                        setImageUrl(URL.createObjectURL(files[0]))
                        field.onChange(files[0])
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel className='text-base'>
                    Nombre (debe terminar en "Coins")
                  </FormLabel>
                  <FormControl>
                    <Input
                      id='name'
                      placeholder='Nombre de la moneda'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}