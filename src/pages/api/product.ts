import type { APIRoute } from 'astro'
import { firestore } from '@/lib/firebase-admin/config'

const ERROR = {
  MISSING_PRODUCT_ID: Symbol('MISSING_PRODUCT_ID'),
  MISSING_PRODUCT_ID_OR_STORE_ID: Symbol('MISSING_PRODUCT_ID_OR_STORE_ID'),
}

const db = firestore.collection('products')

export const POST: APIRoute = async ({ request }) => {
  try {
    // get the product id from the search params
    const productId = new URL(request.url).searchParams.get('productId') || ''

    const data = await request.json()

    // create or update a product
    const docRef = productId ? db.doc(productId) : db.doc()
    const docSnapshot = await docRef.get()

    if (data.imageUrl) data.imageUrl = data.imageUrl.replace('[id]', docRef.id)

    if (docSnapshot.exists) {
      await docRef.update(data)
    } else {
      await docRef.set(data)
    }

    const product = {
      id: docRef.id,
      ...data,
    } as Product

    return new Response(JSON.stringify(product), { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.MISSING_PRODUCT_ID) {
      return new Response('Missing product id', { status: 400 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const user = await locals.currentUser()

    const url = new URL(request.url)

    // get the product id from the search params
    const productId = url.searchParams.get('productId')
    const storeId = url.searchParams.get('storeId')

    if (productId) {
      // get the product
      const snapshot = await db.doc(productId).get()
      const product = {
        id: snapshot.id,
        ...snapshot.data(),
      }
  
      return new Response(JSON.stringify(product), { status: 200 })
    } else if (storeId) {
      // get all products from a store
      const snapshot = await db.where('storeId', '==', storeId).get()
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Product)).filter((product) => storeId === user?.publicMetadata?.yourStoreId ? true : product.inStore)
  
      return new Response(JSON.stringify(products), { status: 200 })
    } else {
      throw ERROR.MISSING_PRODUCT_ID_OR_STORE_ID
    }
  } catch (err) {
    console.error(err)
    if (err === ERROR.MISSING_PRODUCT_ID_OR_STORE_ID) {
      return new Response('Missing product or store id', { status: 400 })
    }
    return new Response('Something went wrong', { status: 500 })
  }
}