import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatButton } from "@/components/layout/WhatsAppFloatButton";
import { VisitTracker } from "@/components/site/VisitTracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VisitTracker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatButton />
    </>
  );
}
