import { Hero } from "@/components/home/Hero";
import { QuickCategories } from "@/components/home/QuickCategories";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { TrustSection } from "@/components/home/TrustSection";
import { AiTeaser } from "@/components/home/AiTeaser";
import { listVehiclesPublic, listBrands } from "@/lib/server/db";

export default function Home() {
  const featured = listVehiclesPublic({ sort: "recent" }).slice(0, 8);
  const brands = listBrands();

  return (
    <>
      <Hero brands={brands} />
      <QuickCategories />
      <FeaturedVehicles vehicles={featured} />
      <AiTeaser />
      <TrustSection />
    </>
  );
}
