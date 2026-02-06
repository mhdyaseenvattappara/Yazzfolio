
import { LayoutGrid, Mail, User, Briefcase, Star, PenTool, Code, Palette, Github, Linkedin, Twitter, Calendar, MessageSquare, Cog, Pencil, Clapperboard, Brush, MousePointerClick, Server, Home, Instagram, Facebook, Sparkles, Milestone } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { PhotoshopIcon, IllustratorIcon, PremiereProIcon, InDesignIcon, AfterEffectsIcon } from '@/components/tool-icons';
import { WhatsAppIcon } from '@/components/icons';


export interface PortfolioItem {
  id: string;
  adminUserId: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  category: string;
  tags: string[];
  role?: string;
  tools?: string[];
  likes?: number;
  gallery?: { imageUrl: string, imageHint?: string }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Testimonial {
    id: string;
    adminUserId: string;
    name: string;
    title: string;
    quote: string;
    imageUrl: string;
    rating: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Service {
    id: string;
    adminUserId: string;
    title: string;
    description: string;
    icon: string; // Storing icon name as string
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface TimelineEvent {
    id: string;
    adminUserId: string;
    year: string;
    event: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface AdminProfile {
    id: string;
    name: string;
    bio: string;
    address?: string;
    profileImageUrl: string;
    email: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface Tool {
    id:string;
    adminUserId: string;
    name: string;
    icon: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const currencyOptions = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
    { value: 'INR', label: 'INR (₹)', symbol: '₹' },
];
export type Currency = typeof currencyOptions[0];

export const invoiceTemplates = [
    { id: 'modern', name: 'Modern' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'professional', name: 'Professional' },
] as const;

export type InvoiceTemplateId = typeof invoiceTemplates[number]['id'];

export interface Invoice {
    id: string;
    adminUserId: string;
    invoiceNumber: string;
    clientName: string;
    clientAddress: string;
    invoiceDate: Timestamp;
    dueDate: Timestamp;
    templateId?: InvoiceTemplateId;
    lineItems: {
        id: number;
        description: string;
        quantity: number;
        price: number;
    }[];
    tax: number;
    notes: string;
    currency: Currency;
    status: 'Draft' | 'Pending' | 'Paid';
    total: number;
    yourName: string;
    yourAddress: string;
    yourEmail: string;
    logoUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const projectCategories = [
    "UI/UX Design",
    "Graphic Design",
    "Branding",
    "Web Design",
    "Motion Graphics",
    "Illustration"
];

export const navLinks = [
  { name: 'Home', href: '/#hero', icon: Home },
  { name: 'About', href: '/#about', icon: User },
  { name: 'Timeline', href: '/#timeline', icon: Milestone },
  { name: 'Services', href: '/#services', icon: Sparkles },
  { name: 'Portfolio', href: '/#projects', icon: LayoutGrid },
  { name: 'Contact', href: '/#contact', icon: Mail },
];

export const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/_hey_yasii_', icon: Instagram },
  { name: 'WhatsApp', href: 'https://wa.me/917034229912', icon: WhatsAppIcon },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { name: 'GitHub', href: 'https://github.com/mhdyaseenvattappara', icon: Github },
];

export const skillsData = [
  { name: 'UI/UX Design', level: 95, color: 'hsl(var(--chart-1))' },
  { name: 'Graphic Design', level: 90, color: 'hsl(var(--chart-2))' },
  { name: 'Motion Graphics', level: 85, color: 'hsl(var(--chart-3))' },
  { name: 'Branding', level: 80, color: 'hsl(var(--chart-4))' },
];

export const projectsData: Omit<PortfolioItem, 'adminUserId' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'project-1',
    title: 'Cosmic Branding',
    description: 'A full branding package for a new-age tech startup. The design is inspired by the cosmos, using dark themes and vibrant accent colors to create a futuristic and mysterious identity.',
    imageUrl: 'https://images.unsplash.com/photo-1651870364199-fc5f9f46ac85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxhYnN0cmFjdCUyMHB1cnBsZXxlbnwwfHx8fDE3NjM1MDc5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'abstract purple',
    category: 'Branding',
    tags: ['Branding', 'UI/UX', 'Logo Design'],
    role: 'Lead Designer',
    tools: ['Figma', 'Illustrator', 'Photoshop'],
    likes: 124,
    gallery: [
      { imageUrl: 'https://images.unsplash.com/photo-1506704519758-c68FC3552d96?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640', imageHint: 'abstract colorful' },
      { imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640', imageHint: 'retro arcade' },
    ]
  },
  {
    id: 'project-2',
    title: 'Digital Art Magazine',
    description: 'A sleek and modern UI/UX design for a digital magazine focusing on generative art and creative coding. The layout is minimalist to let the artwork shine.',
    imageUrl: 'https://images.unsplash.com/photo-1703355685722-2996b01483be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxtb2Rlcm4lMjB3b3Jrc3BhY2V8ZW58MHx8fHwxNzYzNTExMDU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'modern workspace',
    category: 'UI/UX Design',
    tags: ['UI/UX', 'Web Design'],
    role: 'UI/UX Designer',
    tools: ['Figma', 'InDesign'],
    likes: 89,
    gallery: []
  },
  {
    id: 'project-3',
    title: 'Synthwave Album Art',
    description: 'Album cover and promotional material design for a synthwave artist. The aesthetic is heavily inspired by 80s retro-futurism, with neon grids and chrome typography.',
    imageUrl: 'https://images.unsplash.com/photo-1630825523112-ff511a36e2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxyZXRybyUyMG5lb258ZW58MHx8fHwxNzYzNTc4Njc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'retro neon',
    category: 'Graphic Design',
    tags: ['Graphic Design', 'Illustration'],
    role: 'Graphic Designer',
    tools: ['Photoshop', 'Illustrator'],
    likes: 256,
    gallery: []
  },
  {
    id: 'project-4',
    title: 'Eco-Friendly Mobile App',
    description: 'UI/UX design for an app that tracks a user\'s carbon footprint. The design uses earthy tones and clean iconography to promote a sense of calm and responsibility.',
    imageUrl: 'https://images.unsplash.com/photo-1632505084039-f8ec4b00e432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxtb2JpbGUlMjBhcHAlMjBuYXR1cmV8ZW58MHx8fHwxNzYzNTc4Njc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'mobile app nature',
    category: 'UI/UX Design',
    tags: ['UI/UX', 'Mobile App'],
    role: 'UX Designer',
    tools: ['Figma', 'Miro'],
    likes: 142,
    gallery: []
  },
  {
    id: 'project-5',
    title: 'Minimalist Poster Series',
    description: 'A series of minimalist posters for a film festival. Each poster uses a single iconic element from the movie to represent it, creating a visually cohesive set.',
    imageUrl: 'https://images.unsplash.com/photo-1612388304575-812d264903c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxtaW5pbWFsaXN0JTIwcG9zdGVyc3xlbnwwfHx8fDE3NjM1Nzg2Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'minimalist posters',
    category: 'Graphic Design',
    tags: ['Graphic Design', 'Illustration'],
    role: 'Illustrator',
    tools: ['Illustrator'],
    likes: 67,
    gallery: []
  },
  {
    id: 'project-6',
    title: 'Vanguard Folio',
    description: 'The very portfolio website you are looking at now. Designed and built from scratch to be a clean, modern, and performant showcase of my work and skills.',
    imageUrl: 'https://images.unsplash.com/photo-1546349851-64285be8e9fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxt2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzYzNTczMzIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'modern architecture',
    category: 'Web Design',
    tags: ['Web Design', 'UI/UX', 'Branding'],
    role: 'Designer & Developer',
    tools: ['Next.js', 'Figma', 'Tailwind CSS'],
    likes: 312,
    gallery: []
  },
];

export const iconMap: { [key: string]: React.ElementType } = {
    LayoutGrid,
    Mail,
    User,
    Briefcase,
    Star,
    PenTool,
    Code,
    Palette,
    Github,
    Linkedin,
    Twitter,
    Calendar,
    MessageSquare,
    Cog,
    Pencil,
    Clapperboard,
    Brush,
    MousePointerClick,
    Server,
    Photoshop: PhotoshopIcon,
    Illustrator: IllustratorIcon,
    'Premiere Pro': PremiereProIcon,
    InDesign: InDesignIcon,
    'After Effects': AfterEffectsIcon,
};
