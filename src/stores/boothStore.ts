import { reactive } from 'vue'

export type BoothState = {
  frameId: string
  photos: string[]
}

export const boothState = reactive<BoothState>({
  frameId: '',
  photos: [],
})

export function saveBoothSession(frameId: string, photos: string[]) {
  boothState.frameId = frameId
  boothState.photos = photos
}

export function clearBoothSession() {
  boothState.frameId = ''
  boothState.photos = []
}
