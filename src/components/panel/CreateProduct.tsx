import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BarChart3, Coins, Eye, ImageIcon, Loader2, Package, Pen, Plus, ShoppingCart } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import ImageInput from '../ImageInput'
import { Separator } from '@radix-ui/react-separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { Card, CardContent } from '../ui/card'
import { cn, uploadToR2 } from '@/lib/utils'
import { COIN_VALUE_PER_TWITCH_POINT } from '@/data/coin.data'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'El nombre del producto debe tener al menos 1 caracter.',
  }),
  description: z.string().min(1, {
    message: 'La descripción del producto debe tener al menos 1 caracter.',
  }),
  price: z.number().refine((v) => v >= 0, {
    message: 'El precio del producto debe ser mayor o igual a 0.',
  }),
  stock: z.number().refine((v) => v >= 0, {
    message: 'El stock debe ser mayor o igual a 0.',
  }),
  infiniteStock: z.boolean().optional(),
  inStore: z.boolean().optional(),
  enabled: z.boolean().optional(),
  requireContactInfo: z.boolean().optional(),
  imageFile: z.instanceof(File).optional().refine((file) => {
    if (!file) return true
    return file.type.startsWith('image/')
  }, {
    message: 'El archivo debe ser una imagen.',
  }).refine((file) => {
    if (!file) return true
    return file.size < 400 * 1024
  }, {
    message: 'El archivo debe pesar menos de 400KB.',
  }),
})

interface Props extends React.ComponentProps<"button"> {
  store: Store
  product?: Product
  onCreate?: () => void
}

export default ({ store, product, onCreate, ...props }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      infiniteStock: product?.infiniteStock || false,
      inStore: product?.inStore ?? true,
      enabled: product?.enabled ?? true,
      requireContactInfo: product?.requireContactInfo ?? false,
      imageFile: undefined,
    },
  })
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '')
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { id } = await fetch(`/api/product?productId=${product?.id || ''}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId: store.id,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        infiniteStock: data.infiniteStock,
        inStore: data.inStore,
        enabled: data.enabled,
        imageUrl: data.imageFile || !product ? `${import.meta.env.PUBLIC_R2_URL}/images/product/[id]` : product.imageUrl,
      } as ProductDB),
    }).then(res => res.json())


    // get signed url
    if (data.imageFile) {
      const { signedUrl } = await fetch(`/api/signedurl?path=images/product/${id}`).then(res => res.json())
      // upload image file to r2
      await uploadToR2(signedUrl, data.imageFile)
    }

    setIsOpen(false)
    if (onCreate) onCreate()
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          form.reset()
          setImageUrl('')
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={product ? 'outline' : 'default'}
          className={cn(
            'gap-2 bg-mango-400 hover:bg-mango-500',
            product && 'w-full'
          )}
          {...props}
        >
          {
            product ?
            <>
              <Pen />
              Editar
            </> :
            <>
              <Plus className='h-4 w-4' />
              Nuevo producto
            </>
          }
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader className='mb-6'>
              <DialogTitle className='text-2xl font-bold flex items-center gap-2'>
                <Package className='h-6 w-6 text-mango-400' />
                {product ? 'Editar producto' : 'Nuevo producto'}
              </DialogTitle>
              <DialogDescription className='text-base'>
                Completa la información para {product ? 'editar' : 'crear'} un nuevo producto en tu tienda
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='info' className='w-full'>
              <TabsList className='grid grid-cols-2 mb-6'>
                <TabsTrigger value='info'>
                  Información básica
                </TabsTrigger>
                <TabsTrigger value='settings'>
                  Configuración
                </TabsTrigger>
              </TabsList>

              <TabsContent value='info' className='space-y-6'>
                <Card>
                  <CardContent>
                    <div className='grid md:grid-cols-2 gap-6'>
                      <div className='md:col-span-2'>
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem className='w-full'>
                              <FormLabel className='text-base font-medium flex items-center gap-2'>
                                <Package className='h-4 w-4 text-mango-400' />
                                Nombre del producto
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id='name'
                                  placeholder='Ej: Camiseta de algodón'
                                  className='focus-visible:ring-mango-400'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className='md:col-span-2'>
                        <FormField
                          control={form.control}
                          name='description'
                          render={({ field }) => (
                            <FormItem className='w-full'>
                              <FormLabel className='text-base font-medium flex items-center gap-2'>
                                <Eye className='h-4 w-4 text-mango-400' />
                                Descripción
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  id='description'
                                  placeholder='Describe tu producto'
                                  className='min-h-32 focus-visible:ring-mango-400'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name='price'
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel className='text-base font-medium flex items-center gap-2'>
                              <Coins className='h-4 w-4 text-mango-400' />
                              Precio (en monedas)
                            </FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Coins className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                <Input
                                  id='price'
                                  type='number'
                                  placeholder='0.00'
                                  className='pl-9 focus-visible:ring-mango-400'
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <span className='text-purple-600'>
                              Equivalente: {(field.value / COIN_VALUE_PER_TWITCH_POINT).toLocaleString()} puntos
                            </span>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='stock'
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel className='text-base font-medium flex items-center gap-2'>
                              <BarChart3 className='h-4 w-4 text-mango-400' />
                              Stock
                            </FormLabel>
                            <FormControl>
                              <Input
                                id='stock'
                                type='number'
                                placeholder='Cantidad disponible'
                                className='focus-visible:ring-mango-400'
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                disabled={form.watch('infiniteStock')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name='imageFile'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-base font-medium flex items-center gap-2'>
                            <ImageIcon className='h-4 w-4 text-mango-400' />
                            Imagen del producto
                          </FormLabel>
                          <p className='text-sm text-muted-foreground mb-3'>
                            Sube una imagen de tu producto (máx. 400KB)
                          </p>
                          <FormControl>
                            <ImageInput
                              accept='image/*'
                              src={imageUrl}
                              alt='Imagen del producto'
                              width={200}
                              height={200}
                              onFile={(files: File[]) => {
                                if (files.length > 0) {
                                  setImageUrl(URL.createObjectURL(files[0]))
                                  field.onChange(files[0])
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='settings' className='space-y-6'>
                <Card>
                  <CardContent>
                    <h3 className='text-lg font-medium mb-4 flex items-center gap-2'>
                      <ShoppingCart className='h-5 w-5 text-mango-400' />
                      Opciones de inventario
                    </h3>
                    <div className='space-y-4'>
                      <FormField
                        control={form.control}
                        name='infiniteStock'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                            <FormControl>
                              <Checkbox
                                id='infiniteStock'
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className='data-[state=checked]:bg-mango-400 data-[state=checked]:border-mango-400'
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel className='text-base font-medium'>Stock infinito</FormLabel>
                              <p className='text-sm text-muted-foreground'>
                                Activa esta opción si el producto siempre está disponible
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Separator className='my-4' />

                      <FormField
                        control={form.control}
                        name='inStore'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                            <FormControl>
                              <Checkbox
                                id='inStore'
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className='data-[state=checked]:bg-mango-400 data-[state=checked]:border-mango-400'
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel className='text-base font-medium'>Mostrar en tienda</FormLabel>
                              <p className='text-sm text-muted-foreground'>
                                El producto aparecerá en el catálogo de tu tienda
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Separator className='my-4' />

                      <FormField
                        control={form.control}
                        name='enabled'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                            <FormControl>
                              <Checkbox
                                id='enabled'
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className='data-[state=checked]:bg-mango-400 data-[state=checked]:border-mango-400'
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel className='text-base font-medium'>Producto habilitado</FormLabel>
                              <p className='text-sm text-muted-foreground'>
                                Desactiva esta opción para inhabilitar la compra del producto
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Separator className='my-4' />

                      <FormField
                        control={form.control}
                        name='requireContactInfo'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                            <FormControl>
                              <Checkbox
                                id='requireContactInfo'
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className='data-[state=checked]:bg-mango-400 data-[state=checked]:border-mango-400'
                              />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                              <FormLabel className='text-base font-medium'>Requerir información de contacto</FormLabel>
                              <p className='text-sm text-muted-foreground'>
                                Requerir información de contacto para poder comprar el producto
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className='mt-8 gap-2'>
              <DialogClose asChild>
                <Button
                  variant='secondary'
                  disabled={isSubmitting}
                  className='hover:text-mango-500'
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                disabled={isSubmitting} 
                type='submit'
                className='bg-mango-400 hover:bg-mango-500'
              >
                {isSubmitting && <Loader2 className='animate-spin-clockwise animate-iteration-count-infinite' />}
                {product ? 'Editar producto' : 'Crear producto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}