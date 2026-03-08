import HeroSection from "@/components/home/HeroSection";
import ProjectsSection from "@/components/home/ProjectsSection";

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-[960px] px-6">
      <HeroSection />
      <ProjectsSection locale={locale} />
    </div>
  );
}
