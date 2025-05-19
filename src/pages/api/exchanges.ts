import type { APIRoute } from 'astro'
import { firestore } from '@/lib/firebase-admin/config'
import { createClerkClient } from '@clerk/astro/server'

const clerkClient = createClerkClient({
  secretKey: import.meta.env.CLERK_SECRET_KEY,
})

const ERROR = {
  UNAUTHORIZED: Symbol('UNAUTHORIZED'),
  STORE_NOT_FOUND: Symbol('STORE_NOT_FOUND'),
  PRODUCT_NOT_FOUND: Symbol('PRODUCT_NOT_FOUND'),
  NOT_ENOUGH_COINS: Symbol('NOT_ENOUGH_COINS'),
}

const db_exchanges = firestore.collection('exchanges')
const db_stores = firestore.collection('stores')
const db_products = firestore.collection('products')

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const userId = await locals.currentUser().then((user) => user?.id)
    if (!userId) throw ERROR.UNAUTHORIZED

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (storeId) {
      // get all exchanges by store for the owner
      const storeSnap = await db_stores.doc(storeId).get()
      const store = storeSnap.data()
      if (!store) throw ERROR.STORE_NOT_FOUND
      if (store.ownerId !== userId) throw ERROR.UNAUTHORIZED

      const exchangesSnap = await db_exchanges.where('product.storeId', '==', storeId).get()
      const exchanges = exchangesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Exchange))

      return new Response(JSON.stringify(exchanges), { status: 200 })
    } else {
      // get all exchanges for an user
      const snapshot = await db_exchanges.where('buyerId', '==', userId).get()
      const exchanges = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Exchange))
  
      return new Response(JSON.stringify(exchanges), { status: 200 })
    }
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    if (err === ERROR.STORE_NOT_FOUND) {
      return new Response('Store not found', { status: 404 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = await locals.currentUser() as User | null
    if (!user) throw ERROR.UNAUTHORIZED

    const { product } = await request.json() as { product: Product }
    if (!product) throw ERROR.PRODUCT_NOT_FOUND

    const coins = user.publicMetadata.wallet[product.storeId] || 0
    if (coins < product.price) throw ERROR.NOT_ENOUGH_COINS

    // create a new exchange
    const exchangeRef = await db_exchanges.add({
      buyerId: user.id,
      product,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    } as ExchangeDB)

    const exchangeSnap = await exchangeRef.get()

    const exchange = {
      id: exchangeSnap.id,
      ...exchangeSnap.data(),
    } as Exchange

    // less coins
    // if (user.publicMetadata?.yourStoreId !== product.storeId) {
      await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: {
          wallet: {
            [product.storeId]: coins - product.price,
          },
        },
      })
      // update product stock
      await db_products.doc(product.id).update({
        stock: product.stock - 1,
      })
    // }

    return new Response(JSON.stringify(exchange), { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    if (err === ERROR.PRODUCT_NOT_FOUND) {
      return new Response('Product not found', { status: 404 })
    }
    if (err === ERROR.NOT_ENOUGH_COINS) {
      return new Response('Not enough coins', { status: 400 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}