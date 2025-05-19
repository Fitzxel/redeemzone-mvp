import type { APIRoute } from 'astro'
import { firestore } from '@/lib/firebase-admin/config'
import { createClerkClient } from '@clerk/astro/server'
// import { promises as fs } from 'fs'
// import { fileURLToPath } from 'url'
// import path from 'path'

const ERROR = {
  UNAUTHORIZED: Symbol('UNAUTHORIZED'),
  STORE_ALREADY_EXISTS: Symbol('STORE_ALREADY_EXISTS'),
  STORE_NOT_FOUND: Symbol('STORE_NOT_FOUND'),
}

const clerkClient = createClerkClient({
  secretKey: import.meta.env.CLERK_SECRET_KEY,
})

// const currentDir = path.dirname(fileURLToPath(import.meta.url))
const db = firestore.collection('stores')

// type StoreCache = {
//   values: Store[]
//   timestamp: number
// }

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const storeId = url.searchParams.get('storeId')

    if (storeId) {
      // get an store
      const storeSnap = await db.doc(storeId).get()
      if (!storeSnap.exists) throw ERROR.STORE_NOT_FOUND

      const store = {
        id: storeSnap.id,
        ...storeSnap.data(),
      } as Store
  
      return new Response(JSON.stringify(store), { status: 200 })
    } else {
      // get all stores

      // use cache
      // await fs.mkdir(path.join(currentDir, '.cache'), { recursive: true })
      // const cacheFilePath = path.join(currentDir, '.cache/stores.json')
      // const storesCache = await fs.readFile(cacheFilePath, 'utf-8')
      // .then((data) => JSON.parse(data))
      // .catch(() => ({
      //   values: [] as Store[],
      //   timestamp: 0,
      // })) as StoreCache

      // let stores = storesCache.values
      let stores = [] as Store[]

      // if (stores.length === 0 || Date.now() - storesCache.timestamp > 24 * 60 * 60 * 1000 /* 24 hours */) {
      if (stores.length === 0) {
        // use database
        const snapshot = await db.get()
        stores = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Store))
        
        // cache the stores
        // await fs.writeFile(cacheFilePath, JSON.stringify({
        //   values: stores,
        //   timestamp: Date.now(),
        // }))
      }
  
      return new Response(JSON.stringify(stores), { status: 200 })
    }
  } catch (err) {
    console.error(err)
    return new Response('Something went wrong', { status: 500 })
  }
}

export const POST: APIRoute = async ({ locals }) => {
  try {
    const user = await locals.currentUser()
    if (!user) throw ERROR.UNAUTHORIZED

    if (user.publicMetadata.yourStoreId) throw ERROR.STORE_ALREADY_EXISTS

    // create a new store
    const storeRef = await db.add({
      ownerId: user.id,
      slug: user.username,
      name: user.firstName + "'s Store",
      iconUrl: user.imageUrl,
      bannerUrl: '',
      coin: {
        name: user.firstName + " Coins",
        imageUrl: '',
      },
      views: 0,
    })
    const storeSnap = await storeRef.get()

    const store = {
      id: storeSnap.id,
      ...storeSnap.data(),
    } as Store

    // update user public metadata)
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        yourStoreId: store.id,
      },
    })

    return new Response(JSON.stringify(store), { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    if (err === ERROR.STORE_ALREADY_EXISTS) {
      return new Response('Store already exists', { status: 400 })
    }
    return new Response('Invalid request', { status: 400 })
  }
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const user = await locals.currentUser() as User | null
    if (!user) throw ERROR.UNAUTHORIZED

    const storeId = user.publicMetadata.yourStoreId
    if (!storeId) throw ERROR.UNAUTHORIZED

    // get store
    const storeSnap = await db.doc(storeId).get()
    if (!storeSnap.exists) throw ERROR.STORE_NOT_FOUND

    const { name, iconUrl, bannerUrl, coin } = await request.json()

    // update store data
    await db.doc(storeId).update({
      name,
      iconUrl,
      bannerUrl,
      coin,
    })

    const store = {
      id: storeSnap.id,
      name,
      iconUrl,
      bannerUrl,
      coin,
    } as Store

    return new Response(JSON.stringify(store), { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    if (err === ERROR.STORE_NOT_FOUND) {
      return new Response('Store not found', { status: 404 })
    }
    return new Response('Invalid request', { status: 400 })
  }
}