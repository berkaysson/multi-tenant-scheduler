export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
  _count: {
    members: number;
    appointments: number;
    appointmentTypes: number;
  };
};

