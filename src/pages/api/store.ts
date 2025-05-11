import type { APIRoute } from 'astro'
import { firestore } from '@/lib/firebase-admin/config'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const db = firestore.collection('stores')

type StoreCache = {
  values: Store[]
  timestamp: number
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)

    // get the store id from the search params
    const storeId = url.searchParams.get('storeId')

    if (storeId) {
      // get the store
      const snapshot = await db.doc(storeId).get()
      const store = {
        id: snapshot.id,
        ...snapshot.data(),
      } as Store
  
      return new Response(JSON.stringify(store), { status: 200 })
    } else {
      // get the store from the cache file
      await fs.mkdir(path.join(currentDir, '.cache'), { recursive: true })
      const cacheFilePath = path.join(currentDir, '.cache/stores.json')
      const storesCache = await fs.readFile(cacheFilePath, 'utf-8')
      .then((data) => JSON.parse(data))
      .catch(() => ({
        values: [] as Store[],
        timestamp: 0,
      })) as StoreCache

      let stores = storesCache.values

      if (storesCache.values.length === 0 || Date.now() - storesCache.timestamp > 24 * 60 * 60 * 1000 /* 24 hours */) {
        console.log('no cache')
        // get all stores
        const snapshot = await db.get()
        stores = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Store))
        
        // cache the stores
        await fs.writeFile(cacheFilePath, JSON.stringify({
          values: stores,
          timestamp: Date.now(),
        }))
      }
  
      return new Response(JSON.stringify(stores), { status: 200 })
    }
  } catch (err) {
    console.error(err)
    return new Response('Something went wrong', { status: 500 })
  }
}