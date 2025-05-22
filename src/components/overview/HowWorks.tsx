import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.tsx'

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className='mb-2 text-lg xl:text-2xl font-bold'>
    {children}
  </h3>
)

export default () => {
  return (
    <Tabs defaultValue='redeem' className='w-full'>
      <TabsList className='w-full max-w-3xl h-auto mx-auto flex-col md:flex-row'>
        <TabsTrigger value='streamer'>
          Soy streamer y quiero crear mi tienda
        </TabsTrigger>
        <TabsTrigger value='redeem'>
          Quiero canjear en la tienda de un streamer
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value='streamer'
        className='max-w-3xl mx-auto py-9 flex flex-col items-center gap-4 text-start'
      >
        <section>
          <H3>
            1. Inicia sesión con tu cuenta de Twitch.
          </H3>
          <img
            src='/images/login.webp'
            alt='login'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            2. Crea una tienda.
          </H3>
          <p>
            Ve al <a href='/panel' className='text-mango-400 hover:text-mango-500'>Streamer Panel</a> y selecciona <b>Crear tienda</b>
          </p>
          <img
            src='/images/create-store.webp'
            alt='create store'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            3. Personaliza tu tienda.
          </H3>
          <p>
            En la sección <a href='/panel/store' className='text-mango-400 hover:text-mango-500'>Tienda</a> podrás personalizar tu tienda y moneda.
          </p>
          <img
            src='/images/panel-store.webp'
            alt='panel store'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            4. Agrega productos.
          </H3>
          <p>
            En la sección <a href='/panel/products' className='text-mango-400 hover:text-mango-500'>Productos</a> podrás agregar y modificar productos en tu tienda.
          </p>
          <img
            src='/images/panel-products.webp'
            alt='panel products'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            5. Canjeos.
          </H3>
          <p>
            En la sección <a href='/panel/exchanges' className='text-mango-400 hover:text-mango-500'>Canjeos</a> podrás administrar los canjeos recibidos.
          </p>
          <img
            src='/images/panel-redeems.webp'
            alt='panel redeems'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            6. ¿Cómo consiguen monedas tus espectadores?
          </H3>
          <p>
            En el apartado "Servicio de puntos x monedas" debes proporcionar los permisos necesarios para realizar operaciones en las recompensas de tu canal.
          </p>
          <img
            src='/images/panel-perms.webp'
            alt='panel permissions'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
          <p>
            Una vez hecho, configura las recompensas que luego tus espectadores podrán canjear por monedas.
          </p>
          <img
            src='/images/panel-conf-rewards.webp'
            alt='panel configure rewards'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
          <img
            src='/images/twitch-rewards.webp'
            alt='twitch rewards'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
          <p>
            Para que el canjeo convierta los puntos en monedas debes estar ejecutando el servicio, este servicio se encargara de convertir todos los canjes previos y nuevos en monedas. Siempre y cuando el servicio esté ejecutándose y el espectador este registrado en RedeemZone.
          </p>
          <img
            src='/images/panel-service.webp'
            alt='panel service'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
      </TabsContent>
      <TabsContent
        value='redeem'
        className='max-w-3xl mx-auto py-9 flex flex-col items-center gap-4 text-start'
      >
        <section>
          <H3>
            1. Inicia sesión con tu cuenta de Twitch.
          </H3>
          <img
            src='/images/login.webp'
            alt='login'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            2. Canjea tus puntos por monedas.
          </H3>
          <p>
            En el canal del streamer, ve a la sección de recompensas y selecciona la recompensa que quieres canjear por monedas.
          </p>
          <img
            src='/images/twitch-rewards.webp'
            alt='twitch rewards'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            3. Ve a la tienda del streamer que quieres canjear.
          </H3>
          <img
            src='/images/search-store.webp'
            alt='search store'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
        <section>
          <H3>
            4. Mira los productos disponibles y canjea.
          </H3>
          <p>
            En la sección de productos podrás ver los productos que están disponibles para canjear.
          </p>
          <p>
            Selecciona el producto que quieres canjear. En tu <a href='/account' className='text-mango-400 hover:text-mango-500'>cuenta</a> podrás ver el historial de canjeos realizados.
          </p>
          <img
            src='/images/streamer-store.webp'
            alt='streamer store'
            className='w-full max-w-3xl my-4 border-2 border-mango-400 rounded-lg'
          />
        </section>
      </TabsContent>
    </Tabs>
  )
}