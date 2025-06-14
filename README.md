# [RedeemZone](https://redeemzone.vercel.app/)

Tienda para streamers donde los espectadores canjean puntos de canal por recompensas reales.

#

Plataforma web que convierte los puntos de canal de Twitch en una moneda personalizable. Cada streamer tiene su propia tienda y su propia moneda, que los espectadores pueden ganar al canjear sus puntos y luego usar para obtener recompensas reales.

✨ **Características principales:**
- Tienda y moneda propia personalizable para el streamer.
- Canjeo de puntos por monedas.
- Monedas intercambiables por los productos en la tienda.
- Servicio descentralizado: cada streamer se encarga de su tienda, productos, reclamos, entregas y la ejecución del servicio que realiza el canjeo de puntos por monedas.

## 🔐 Uso de Clerk

Autenticación con el servicio de [Clerk](https://clerk.dev/) usando Twitch como único proveedor, asegurando que el usuario que canjea los puntos y el que obtiene las monedas sea el mismo, a través de su ~~ID~~ *(por ahora utilizando el nombre de usuario)* brindada por Twitch.

### Datos y monedas

Se utiliza Clerk para almacenar los datos personales de cada usuario y sus monedas para cada tienda (streamer) en la que hayan canjeado puntos.

### Cuentas externas

Se utiliza los datos proporcionados por Clerk para identificar a los usuarios que se han registrado en RedeemZone, y sus datos relacionados con Twitch, como su nombre de usuario y foto para completar su perfil; además de utilizar su nombre de usuario para entregar las monedas canjeadas al usuario correspondiente.

### Protección de rutas

Rutas protegidas con el middleware proporcionado por Clerk.

## 🪙 Sistema de canjeo de puntos por monedas

Desde el [Panel](https://redeemzone.vercel.app/panel), cada streamer debe inicializar el servicio que se encarga de transformar los canjeos hechos por puntos en monedas, que se entregarán al usuario coincidente mediante su ~~ID de Twitch única~~ *(por ahora utilizando el nombre de usuario)*, si este se ha registrado previamente en **RedeemZone**.

Al iniciarse el servicio, este listará los canjeos de monedas hechos y no completados, y escuchará nuevos canjeos en tiempo real mientras la página esté abierta.

## 🧑‍💻 Stack utilizado
- [Astro](https://astro.build/) como framework principal.
- [React](https://reactjs.org/) como librería de UI.
- [Shadcn](https://ui.shadcn.com/) como librería de componentes.
- [Tailwind CSS](https://tailwindcss.com/) como framework de CSS.
- [Clerk](https://clerk.dev/) como servicio de autenticación.
- [Firebase](https://firebase.google.com/) como servicio de base de datos.
- [Vercel](https://vercel.com/) como plataforma de hosting.
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) como CDN.
- [Lucide](https://lucide.dev/) como librería de iconos.
- [Tailwind Animations by Midudev](https://github.com/midudev/tailwind-animations) como librería de animaciones.
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://github.com/colinhacks/zod) + [Zod Resolvers](https://github.com/react-hook-form/resolvers) como librería de validación de formularios.

---

🚀 **Desarrollo a futuro:**
- [ ] Completar tratamiento de las propiedades de los productos.
- [ ] Productos disponibles únicamente al estar en directo.
- [ ] Descuentos en productos.
- [ ] Alertas visuales al realizarse una compra.
- [ ] Ranking de usuarios por monedas en tiendas.
- [ ] Recuento de visitas a la tienda.
- [ ] Funciones de eliminación de tienda, productos, canjeos, cuenta.
- [ ] Personalización del valor de la moneda.

---

🫂 **Agradecimientos**
- [PrimeIsWanted](https://x.com/primeiswanted) por apoyar con su cuenta de Twitch para los testings.