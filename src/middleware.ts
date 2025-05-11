import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server'
import { firestore } from './lib/firebase-admin/config'

const isProtectedRoute = createRouteMatcher([
  '/panel(.*)',
])

const db = firestore.collection('stores')

// @ts-expect-error
export const onRequest = clerkMiddleware(async (auth, context) => {
  const { userId, redirectToSignIn } = auth()

  if (isProtectedRoute(context.request) && !userId) {
    return redirectToSignIn()
  }

  if (context.url.pathname.startsWith('/store')) {
    // pass the store to the context.locals

    const snapshot = await db.where('slug', '==', context.params.store).get()
    const store = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Store))

    if (store.length > 0) {
      context.locals.store = store[0]
    }
  }
})