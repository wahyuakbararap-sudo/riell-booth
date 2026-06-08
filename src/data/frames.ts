export type FrameSlot = {
  x: number
  y: number
  w: number
  h: number
}

export type RiellFrame = {
  id: string
  name: string
  image?: string
  photoCount: number
  bg: string
  accent: string
  slots: FrameSlot[]
}

export const frames: RiellFrame[] = [
  {
    id: 'vintage-red',
    name: 'Vintage Red',
    image: '/frames/test1.png',
    photoCount: 6,
    bg: '#ffffff',
    accent: '#991b1b',
    slots: [
      { x: 95, y: 170, w: 390, h: 330 },
      { x: 595, y: 170, w: 390, h: 330 },
      { x: 95, y: 580, w: 390, h: 330 },
      { x: 595, y: 580, w: 390, h: 330 },
      { x: 95, y: 990, w: 390, h: 330 },
      { x: 595, y: 990, w: 390, h: 330 },
    ],
  },
  {
  id: 'jeans-pocket-polaroid',
  name: 'Jeans Pocket Polaroid',
  image: '/frames/test2.png',
  photoCount: 6,
  bg: '#1f3560',
  accent: '#ffffff',

  slots: [
    { x: 111, y: 85, w: 366, h: 362 },
    { x: 604, y: 85, w: 366, h: 362 },

    { x: 111, y: 498, w: 366, h: 362 },
    { x: 604, y: 498, w: 366, h: 362 },

    { x: 111, y: 912, w: 366, h: 362 },
    { x: 604, y: 912, w: 366, h: 362 },
  ],
},
  {
    id: 'kawaii-grid',
    name: 'Kawaii Grid',
    photoCount: 4,
    bg: '#ffe4f3',
    accent: '#ec4899',
    slots: [
      { x: 80, y: 190, w: 440, h: 500 },
      { x: 560, y: 190, w: 440, h: 500 },
      { x: 80, y: 730, w: 440, h: 500 },
      { x: 560, y: 730, w: 440, h: 500 },
    ],
  },
  {
    id: 'classic-strip',
    name: 'Classic Strip',
    photoCount: 4,
    bg: '#fff7ed',
    accent: '#92400e',
    slots: [
      { x: 170, y: 190, w: 740, h: 360 },
      { x: 170, y: 590, w: 740, h: 360 },
      { x: 170, y: 990, w: 740, h: 360 },
      { x: 170, y: 1390, w: 740, h: 360 },
    ],
  },
  {
    id: 'duo-soft',
    name: 'Duo Soft',
    photoCount: 2,
    bg: '#eff6ff',
    accent: '#2563eb',
    slots: [
      { x: 120, y: 230, w: 840, h: 560 },
      { x: 120, y: 870, w: 840, h: 560 },
    ],
  },
]
