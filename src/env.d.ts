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
  settedRewards: SettedReward[]
}

type User = import('@clerk/types').UserResource & {
  publicMetadata: UserPublicData
  privateMetadata: UserPrivateData
}

interface ProductDB {
  storeId: string
  name: string
  description: string
  price: number
  stock: number
  infiniteStock: boolean
  inStore: boolean
  enabled: boolean
  requireContactInfo: boolean
  imageUrl: string
}
interface Product extends ProductDB {
  id: string
}

interface ExchangeDB {
  buyerId: string
  product: Product
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
}
interface Exchange extends ExchangeDB {
  id: string
}

type Coin = {
  name: string
  imageUrl: string
}

interface StoreDB {
  slug: string
  name: string
  iconUrl: string
  bannerUrl: string
  coin: Coin
  views: number
  ownerId: string
}
interface Store extends StoreDB {
  id: string
}

// twitch

interface Reward {
  broadcaster_name: string
  broadcaster_id: string
  id: string
  image?: any
  background_color?: string
  is_enabled?: boolean
  cost: number
  title: string
  prompt?: string
  is_user_input_required?: boolean
  max_per_stream_setting?: MaxPerStreamSetting
  max_per_user_per_stream_setting?: MaxPerUserPerStreamSetting
  global_cooldown_setting?: GlobalCooldownSetting
  is_paused?: boolean
  is_in_stock?: boolean
  default_image: DefaultImage
  should_redemptions_skip_request_queue?: boolean
  redemptions_redeemed_current_stream?: any
  cooldown_expires_at?: any
}

interface MaxPerStreamSetting {
  is_enabled: boolean
  max_per_stream: number
}

interface MaxPerUserPerStreamSetting {
  is_enabled: boolean
  max_per_user_per_stream: number
}

interface GlobalCooldownSetting {
  is_enabled: boolean
  global_cooldown_seconds: number
}

interface DefaultImage {
  url_1x: string
  url_2x: string
  url_4x: string
}

interface SettedReward {
  id: string
  cost: number
}

interface DefaultReward {
  title: string
  cost: number
  background_color: string
}

interface RedemptionEvent {
  id: string
  broadcaster_user_id: string
  broadcaster_user_login: string
  broadcaster_user_name: string
  user_id: string
  user_login: string
  user_name: string
  user_input: string
  status: string
  reward: {
    id: string
    title: string
    cost: number
    prompt: string
  }
  redeemed_at: string
}