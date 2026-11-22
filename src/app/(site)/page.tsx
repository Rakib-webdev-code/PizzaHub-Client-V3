import { Hero } from "@/components/home/hero";
import { CategoriesSection, FeaturedItems, HowItWorks, VendorCta, WhyChoose } from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedItems />
      <CategoriesSection />
      <WhyChoose />
      <HowItWorks />
      <VendorCta />
    </>
  );
}
