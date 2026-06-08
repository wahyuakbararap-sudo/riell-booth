export interface FrameSlot {
  x: number
  y: number
  w: number
  h: number
}

export interface RiellFrame {
  id: string
  name: string
  image: string

  photoCount: number

  bg: string
  accent: string

  width?: number
  height?: number

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
  { x: 280, y: 454, w: 270, h: 184 },
  { x: 290, y: 631, w: 270, h: 184 },
  { x: 300, y: 810, w: 270, h: 184 },

  { x: 507, y: 416, w: 286, h: 192 },
  { x: 498, y: 606, w: 286, h: 192 },
  { x: 488, y: 796, w: 286, h: 192 },
],
},
  {
  id: 'Purple-Cute',
  name: 'Purple Cute',
  image: '/frames/test3.png',
  photoCount: 3,
  bg: '#b7b2e6',
  accent: '#ffffff',
  width: 707,
  height: 2000,
  slots: [
    { x: 74, y: 74, w: 560, h: 507 },
    { x: 74, y: 631, w: 560, h: 507 },
    { x: 74, y: 1188, w: 560, h: 507 },
  ],
},
]
