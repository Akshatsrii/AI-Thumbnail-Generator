import HeroSection from "../sections/HeroSection";
import FeaturesSection from "../sections/FeaturesSection";
import TestimonialSection from "../sections/TestimonialSection";
import PricingSection from "../sections/PricingSection";
// import ContactSection from "../sections/ContactSection";
import CTASection from "../sections/CTASection";
import ChatBot from "../components/ChatBot";


export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialSection />
      <PricingSection />
      <ChatBot />

      {/* 🔥 CONTACT SECTION (ANCHOR TARGET) */}
      {/* <div id="contact">
        <ContactSection />
      </div> */}

      <CTASection />
    </>
  );
}
