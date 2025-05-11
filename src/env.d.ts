/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    store?: Store
  }
}

type UserPrivateData = {
  personal: {
    fullName: string
    idNumber: string
    country: string
    city: string
    state: string
    address: string
    postalCode: string
    twitter: string
    discord: string
  }
}

type UserPublicData = {
  yourStoreId: string
  wallet: {
    [storeId: string]: number
  }
}

type User = import('@clerk/types').UserResource & {
  publicMetadata: UserPublicData
  privateMetadata: UserPrivateData
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  storeId: string
}

type Exchange = {
  id: string
  buyerId: string
  storeId: string
  product: Product
  status: string
}

type Coin = {
  name: string
  imageUrl: string
}

type Store = {
  id: string
  slug: string
  name: string
  iconUrl: string
  bannerUrl: string
  coin: Coin
}