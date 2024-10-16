import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SettingsContent from "@/components/Settings/SettingsContent";

export const metadata: Metadata = {
  title: "Settings | AI-NewsLetter-Next",
  description: "This is Settings page for AI-NewsLetter-Next",
};

const SettingsPage = () => {
  return (
    <DefaultLayout>
      <SettingsContent />
    </DefaultLayout>
  );
};

export default SettingsPage;