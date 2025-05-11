import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const rawCredentials = import.meta.env.FIREBASE_ADMIN_CREDENTIALS
if (!rawCredentials) {
  throw new Error('FIREBASE_ADMIN_CREDENTIALS env variable is not set')
}
const credentials = JSON.parse(rawCredentials)

if (!getApps().length) initializeApp({
  credential: cert(credentials)
})

const firestore = getFirestore()
if (!getApps().length) {
  firestore.settings({
    ignoreUndefinedProperties: true
  })
}

export {
  firestore
}
