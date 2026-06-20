export interface ConsultationLead {
  id: string;
  fullName: string;
  mobileNumber: string;
  age: string;
  emailAddress: string;
  gender: 'male' | 'female' | 'other' | '';
  goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | '';
  currentWeight: string;
  height: string;
  healthConditions: string;
  healthConcerns: string;
  howHeard: string;
  agreed: boolean;
  createdAt: string;
  bmi?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  quote: string;
  image: string;
  metric: string;
}
