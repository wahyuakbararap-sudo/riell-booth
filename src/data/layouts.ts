export type BoothLayout = {
  id: string
  name: string
  description: string
  photoCount: number
}

export const layouts: BoothLayout[] = [
  {
    id: 'solo',
    name: 'Solo Shot',
    description: '1 foto simple buat profile.',
    photoCount: 1,
  },
  {
    id: 'duo',
    name: 'Duo Shot',
    description: '2 foto stacked vertical.',
    photoCount: 2,
  },
  {
    id: 'grid',
    name: 'Grid 2x2',
    description: '4 foto kotak ala booth modern.',
    photoCount: 4,
  },
  {
    id: 'strip',
    name: 'Classic Strip',
    description: '4 foto vertikal ala photobooth.',
    photoCount: 4,
  },
]