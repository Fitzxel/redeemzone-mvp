import type { APIRoute } from 'astro'
import { firestore } from '@/lib/firebase-admin/config'

const ERROR = {
  UNAUTHORIZED: Symbol('UNAUTHORIZED'),
}

const db = firestore.collection('exchanges')

export const GET: APIRoute = async ({ locals }) => {
  try {
    const userId = await locals.currentUser().then((user) => user?.id)
    if (!userId) throw ERROR.UNAUTHORIZED

    // get the user's private metadata
    const snapshot = await db.where('buyerId', '==', userId).get()
    const exchanges = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Exchange))

    return new Response(JSON.stringify(exchanges), { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.UNAUTHORIZED) {
      return new Response('Unauthorized', { status: 401 })
    }
    return new Response('Invalid request', { status: 400 })
  }
}