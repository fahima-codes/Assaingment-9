export interface ServiceCardData {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  serviceMode?: string;
  serviceArea?: string;
  duration?: string;
  price?: number;
  technicianName?: string;
  technicianPhoto?: string;
  technicianArea?: string;
  technicianBio?: string;
}

export interface Service {
  _id: string;
  title: string;
  serviceImage?: string;
  description?: string;
  category?: string;
  serviceMode?: string;
  serviceArea?: string;
  duration?: string;
  price?: number;
  technicianName?: string;
  technicianEmail?: string;
  technicianPhoto?: string;
  technicianArea?: string;
  technicianBio?: string;
  approvalStatus?: string;
  isAvailable?: boolean;
  createdAt?: string;
}

export interface ServiceListResponse {
  services: Service[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function toServiceCardData(service: Service): ServiceCardData {
  return {
    id: service._id,
    title: service.title,
    description: service.description,
    image: service.serviceImage,
    category: service.category,
    serviceMode: service.serviceMode,
    serviceArea: service.serviceArea,
    duration: service.duration,
    price: service.price,
    technicianName: service.technicianName,
    technicianPhoto: service.technicianPhoto,
    technicianArea: service.technicianArea,
    technicianBio: service.technicianBio,
  };
}

export const SERVICE_CATEGORIES = [
  "AC",
  "Plumbing",
  "Electrical",
  "Appliance Repair",
  "Carpentry",
  "Painting",
  "Furniture Assembly",
];

export const SERVICE_MODES = ["Home Visit", "On-site"];

export const FALLBACK_SERVICES: ServiceCardData[] = [
  {
    title: "Plumbing Repair",
    description:
      "Leaks, clogs, and installations fixed by certified plumbers in as little as 24 hours.",
    category: "Plumbing",
    serviceMode: "Home Visit",
    serviceArea: "Dhaka",
    price: 49,
    technicianName: "Rafiq",
  },
  {
    title: "Electrical Repair",
    description:
      "Wiring, panel upgrades, and safety checks handled by licensed electricians.",
    category: "Electrical",
    serviceMode: "On-site",
    serviceArea: "Dhaka",
    price: 89,
    technicianName: "Sabbir",
  },
  {
    title: "AC Service",
    description:
      "Air conditioner cooling issues, gas refill, and deep cleaning by certified technicians.",
    category: "AC Service",
    serviceMode: "Home Visit",
    serviceArea: "Dhaka",
    price: 59,
    technicianName: "Nusrat",
  },
  {
    title: "Appliance Repair",
    description:
      "Broken refrigerators, washing machines, and other appliances diagnosed and fixed on site.",
    category: "Appliance Repair",
    serviceMode: "Home Visit",
    serviceArea: "Dhaka",
    price: 65,
    technicianName: "Javed",
  },
  {
    title: "Carpentry & Furniture",
    description:
      "Custom furniture, shelves, doors, and structural repairs by expert carpenters.",
    category: "Carpentry",
    serviceMode: "On-site",
    serviceArea: "Dhaka",
    price: 120,
    technicianName: "Abdul",
  },
  {
    title: "Painting",
    description:
      "Interior and exterior painting services by experienced painters.",
    category: "Painting",
    serviceMode: "Home Visit",
    serviceArea: "Dhaka",
    price: 199,
    technicianName: "Karim",
  },
];
