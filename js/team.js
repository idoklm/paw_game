// The rescue team: six original puppies. Art: assets/sprites/pup-<id>.webp (sitting),
// cheer-<id>.webp (jumping with joy), veh-<id>.webp (the puppy in its vehicle).

export const PUPPIES = [
  { id: 'pilpel', name: 'פִּלְפֵּל', role: 'fire', color: '#E8453C' },
  { id: 'dubi', name: 'דּוּבִּי', role: 'police', color: '#2F5BD3' },
  { id: 'anani', name: 'עֲנָנִי', role: 'pilot', color: '#8B5CF6' },
  { id: 'bloki', name: 'בְּלוֹקִי', role: 'builder', color: '#F5B301' },
  { id: 'gali', name: 'גַּלִּי', role: 'lifeguard', color: '#16B6C6' },
  { id: 'lulu', name: 'לוּלוּ', role: 'vet', color: '#FF6FAE' },
];

export const PUPPY = Object.fromEntries(PUPPIES.map((p) => [p.id, p]));
