import { Testimonial } from './types';

export const HEALTH_CONDITIONS = [
  { value: 'none', label: 'None / Preventive Care' },
  { value: 'weight_loss_gain', label: 'Weight Management / General Fitness' },
  { value: 'pcos_pcod', label: 'PCOS / PCOD' },
  { value: 'thyroid', label: 'Thyroid (Hypo/Hyper)' },
  { value: 'diabetes', label: 'Diabetes / Insulin Resistance' },
  { value: 'hypertension', label: 'Hypertension / High BP' },
  { value: 'cholesterol', label: 'High Cholesterol / Heart Health' },
  { value: 'gut_health', label: 'Gut Health (Acidity, Bloating, IBS)' },
  { value: 'fatty_liver', label: 'Fatty Liver' },
  { value: 'uric_acid', label: 'High Uric Acid / Gout' },
  { value: 'other', label: 'Other Chronic Conditions' }
];

export const HEAR_ABOUT_SOURCES = [
  { value: 'instagram', label: 'Instagram Ads / Posts' },
  { value: 'facebook', label: 'Facebook Group / Ads' },
  { value: 'google_search', label: 'Google Search' },
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'friend_referral', label: 'Friend or Family Referral' },
  { value: 'whatsapp_group', label: 'WhatsApp / Community Group' },
  { value: 'other', label: 'Other' }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Ramesh S.',
    tagline: 'Achieved Significant Fat Loss',
    rating: 5,
    quote: 'The diet plan and guidance helped me lose weight in a healthy way. Highly recommend! The consistent follow-ups kept me on track and motivated throughout my journey.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350',
    metric: 'Lost 14 KG'
  },
  {
    id: '2',
    name: 'Pooja M.',
    tagline: 'Naturally Reversal Support',
    rating: 5,
    quote: 'My periods are regular now and I feel more energetic than ever. Thank you Arogya Wellness! The gut-healing diet and specific exercise schedule reduced my cystic symtpoms drastically.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=350',
    metric: 'Managed PCOS'
  },
  {
    id: '3',
    name: 'Ankit D.',
    tagline: 'Healthy Muscle Gain',
    rating: 5,
    quote: 'I was underweight and struggled to build muscle, but with the right diet structure I gained healthy weight, endurance, and unmatched mental confidence.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=350',
    metric: 'Gained 8 KG'
  }
];
