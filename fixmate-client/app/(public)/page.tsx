import { api } from "@/lib/api";
import {
  toServiceCardData,
  type ServiceCardData,
  type ServiceListResponse,
} from "@/lib/services";

import { FeaturedServices } from "@/components/featured-services";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { PopularCategories } from "@/components/popular-categories";
import { WhyChooseUs } from "@/components/why-choose-us";

export const dynamic = "force-dynamic";

export default async function Home() {
  const response = await api.get<ServiceListResponse>(
    "/api/services?page=1&limit=6&sort=newest&approvalStatus=approved&isAvailable=true",
    { cache: "no-store" },
  );
  const featuredServices: ServiceCardData[] = (response?.services ?? [])
    .slice(0, 6)
    .map(toServiceCardData);

  return (
    <>
      <Hero />
      <FeaturedServices services={featuredServices} />
      <HowItWorks />
      <PopularCategories />
      <WhyChooseUs />
    </>
  );
}
