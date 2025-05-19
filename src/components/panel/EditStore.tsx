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

const schema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  iconFile: z.instanceof(File).optional().refine((file) => {
    if (!file) return true
    return file.type.startsWith('image/')
  }, {
    message: 'El archivo debe ser una imagen.',
  }).refine((file) => {
    if (!file) return true
    return file.size < 100 * 1024
  }, {
    message: 'El archivo debe pesar menos de 100KB.',
  }),
  bannerFile: z.instanceof(File).optional().refine((file) => {
    if (!file) return true
    return file.type.startsWith('image/')
  }, {
    message: 'El archivo debe ser una imagen.',
  }).refine((file) => {
    if (!file) return true
    return file.size < 1024 * 1024
  }, {
    message: 'El archivo debe pesar menos de 1MB.',
  }),
})

export default ({ store }: { store: Store }) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: store.name,
      iconFile: undefined,
      bannerFile: undefined,
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [iconUrl, setIconUrl] = useState(store.iconUrl)
  const [bannerUrl, setBannerUrl] = useState(store.bannerUrl)

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const { name, iconFile, bannerFile } = data

    // get signed url for each file
    if (iconFile) {
      const { signedUrl } = await fetch(`/api/signedurl?path=images/${store.id}/icon`).then(res => res.json())
      // upload icon file to r2
      await uploadToR2(signedUrl, iconFile)
    }
    if (bannerFile) {
      const { signedUrl } = await fetch(`/api/signedurl?path=images/${store.id}/banner`).then(res => res.json())
      // upload banner file to r2
      await uploadToR2(signedUrl, bannerFile)
    }

    await fetch(`/api/store`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name || store.name,
        iconUrl: iconFile ? `${import.meta.env.PUBLIC_R2_URL}/images/${store.id}/icon` : store.iconUrl,
        bannerUrl: bannerFile ? `${import.meta.env.PUBLIC_R2_URL}/images/${store.id}/banner` : store.bannerUrl,
      } as Store),
    })
  }

  const handleSubmit = async (data: z.infer<typeof schema>) => {
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
              Tienda
            </CardTitle>
            <Button
              type='submit'
              disabled={isSubmitting}
            >
              {
                isSubmitting && <Loader2 className='animate-spin' />
              }
              Guardar
            </Button>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel className='text-base'>
                      Nombre
                    </FormLabel>
                    <FormControl>
                      <Input
                        id='name'
                        placeholder='Nombre de la tienda'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='iconFile'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-base'>
                      Icono
                    </FormLabel>
                    <FormControl>
                      <ImageInput
                        accept='image/*'
                        src={iconUrl}
                        alt='image'
                        width={128}
                        height={128}
                        onFile={(files: File[]) => {
                          setIconUrl(URL.createObjectURL(files[0]))
                          field.onChange(files[0])
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='bannerFile'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-base'>
                    Banner
                  </FormLabel>
                  <FormControl>
                    <ImageInput
                      accept='image/*'
                      src={bannerUrl}
                      alt='image'
                      height={240}
                      onFile={(files: File[]) => {
                        setBannerUrl(URL.createObjectURL(files[0]))
                        field.onChange(files[0])
                      }}
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
        