## Proyecto: RedeemZone

> [!NOTE]  
> Presentación rápida. Más info en el README del proyecto.

Plataforma web que convierte los puntos de canal de Twitch en una moneda personalizable. Cada streamer tiene su propia tienda y su propia moneda, que los espectadores pueden ganar al canjear sus puntos y luego usar para obtener recompensas reales.

🔐 Autenticación con el servicio de [Clerk](https://clerk.dev/) usando Twitch como único proveedor, asegurando que el usuario que canjea los puntos y el que obtiene las monedas sea el mismo, a través de su ~~ID~~ *(por ahora utilizando el nombre de usuario)* brindada por Twitch.

✨ **Características principales:**
- Tienda y moneda propia personalizable para el streamer.
- Canjeo de puntos por monedas.
- Monedas intercambiables por los productos en la tienda.
- Servicio descentralizado: cada streamer se encarga de su tienda, productos, reclamos, entregas y la ejecución del servicio que realiza el canjeo de puntos por monedas.

🚀 **Desarrollo a futuro:**
- [ ] Productos disponibles únicamente al estar en directo.
- [ ] Descuentos en productos.
- [ ] Alertas visuales al realizarse una compra.

### 🔗 Enlaces

**Repositorio**: [github.com/Fitzxel/redeemzone-mvp](https://github.com/Fitzxel/redeemzone-mvp/)  
**Web**: [redeemzone.vercel.app](https://redeemzone.vercel.app/)
