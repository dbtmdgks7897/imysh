import { useTranslations } from "next-intl";
import SocialLinks from "@/components/ui/SocialLinks";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-6 md:px-8">
        <p className="text-sm text-text-muted">{t("copyright")}</p>
        <SocialLinks />
      </div>
    </footer>
  );
}
