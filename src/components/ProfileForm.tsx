import { useState, useEffect } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, User, CreditCard, MapPin, Home, Mail } from 'lucide-react'
import X from '@/components/icons/X'
import Discord from '@/components/icons/Discord'
import { useStore } from '@nanostores/react'
import { $userStore } from '@clerk/astro/client'

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'El nombre completo debe tener al menos 2 caracteres.',
  }),
  idNumber: z.string().min(5, {
    message: 'El número de identificación debe tener al menos 5 caracteres.',
  }),
  country: z.string().min(2, {
    message: 'El país debe tener al menos 2 caracteres.',
  }),
  city: z.string().min(2, {
    message: 'La ciudad debe tener al menos 2 caracteres.',
  }),
  state: z.string().min(2, {
    message: 'La provincia debe tener al menos 2 caracteres.',
  }),
  address: z.string().min(5, {
    message: 'La dirección debe tener al menos 5 caracteres.',
  }),
  postalCode: z.string().min(4, {
    message: 'El código postal debe tener al menos 4 caracteres.',
  }),
  twitter: z.string().min(4, {
    message: 'El nombre de usuario debe tener al menos 4 caracteres.',
  }),
  discord: z.string().min(2, {
    message: 'El nombre de usuario debe tener al menos 2 caracteres.',
  }),
})

export default () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      idNumber: '',
      country: '',
      city: '',
      state: '',
      address: '',
      postalCode: '',
      twitter: '',
      discord: '',
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const user = useStore($userStore)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return

    await fetch(`/api/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({personal: data}),
    })
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (user) {
      (async () => {
        const res = await fetch(`/api/meta?userId=${user.id}`)
        const data = await res.json()
        form.reset(data.personal)
      })()
    }
  }, [user])

  return (
    <Card className='w-full max-w-3xl mx-auto shadow-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Información Personal</CardTitle>
        <CardDescription>Completa tu información de perfil para los productos que lo requieren.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            {/* Información Personal */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Datos Personales</h3>
              <Separator />

              <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <User className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='Juan Pérez' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='idNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Identificación</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <CreditCard className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='12345678' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dirección */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Dirección</h3>
              <Separator />

              <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <MapPin className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='España' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <MapPin className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='Madrid' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <MapPin className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='Madrid' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Home className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='Calle Principal 123' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='postalCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Mail className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='28001' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Redes Sociales */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Redes Sociales</h3>
              <Separator />

              <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='twitter'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario de Twitter/X</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <X className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='@usuario' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='discord'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario de Discord</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Discord className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input className='pl-10' placeholder='usuario#1234' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex justify-center pt-4'>
              <Button
                type='submit'
                className='px-8 py-2 w-full sm:w-auto'
                disabled={isSubmitting || !user}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='animate-spin' />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
