export interface Author {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  credentials: string;
}

export const authors: Author[] = [
  {
    id: '1',
    slug: 'doc-c',
    name: 'Dr. C',
    title: 'Emergency Radiologist',
    bio: 'Dr. C is a leading expert in trauma imaging and has published extensively on CT protocol optimization. He is passionate about education and mentorship, with over 15 years of experience in emergency radiology.',
    avatar: '/placeholder.svg',
    credentials: 'MD, Emergency Radiology',
  },
  {
    id: '2',
    slug: 'doc-m',
    name: 'Dr. M',
    title: 'Neuroradiology Fellow',
    bio: 'Dr. M focuses on diagnostic error analysis and cognitive biases in radiology. His work aims to improve patient safety through systemic learning and has been featured in multiple peer-reviewed journals.',
    avatar: '/placeholder.svg',
    credentials: 'MD, Neuroradiology Fellow',
  },
  {
    id: '3',
    slug: 'doc-h',
    name: 'Dr. H',
    title: 'Radiologist',
    bio: 'Dr. H has a keen interest in the intersection of artificial intelligence and medical imaging, particularly in the context of acute stroke care. He leads AI implementation initiatives at her institution.',
    avatar: '/placeholder.svg',
    credentials: 'MD, Radiology Resident',
  },
];