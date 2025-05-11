import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.tsx'
import ProfileForm from '@/components/ProfileForm.tsx'
import ExchangesList from '@/components/ExchangesList.tsx'

export default () => {
  return (
    <Tabs defaultValue='contact'>
      <TabsList className='w-full max-w-3xl mx-auto'>
        <TabsTrigger value='contact'>
          Contacto
        </TabsTrigger>
        <TabsTrigger value='exchanges'>
          Canjes
        </TabsTrigger>
      </TabsList>
      <TabsContent value='contact'>
        <ProfileForm />
      </TabsContent>
      <TabsContent value='exchanges'>
        <ExchangesList />
      </TabsContent>
    </Tabs>
  )
}