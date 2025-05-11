import type { APIRoute } from 'astro'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { fromEnv } from '@aws-sdk/credential-providers'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ERROR = {
  MISSING_FILE_PATH: Symbol('MISSING_FILE_PATH'),
}

const s3Client = new S3Client({
  endpoint: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: fromEnv(),
})

export const POST: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)

    const filePath = url.searchParams.get('path')
    if (!filePath) throw ERROR.MISSING_FILE_PATH

    const randomString = Math.random().toString(36).substring(2, 15)
    const fileKey = `${filePath}/${randomString}`

    // get the signed url
    const command = new PutObjectCommand({
      Bucket: import.meta.env.R2_BUCKET_NAME,
      Key: fileKey,
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300 /* 5 minutos */,
    })

    return new Response(JSON.stringify({ signedUrl }), { status: 200 })
  } catch (err) {
    console.error(err)
    if (err === ERROR.MISSING_FILE_PATH) {
      return new Response('Missing file path', { status: 400 })
    }
    return new Response('Invalid request', { status: 400 })
  }
}
