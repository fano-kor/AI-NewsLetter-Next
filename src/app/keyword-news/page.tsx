import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import KeywordNews from "@/components/News/KeywordNews";

export const metadata: Metadata = {
  title: "Keyword News | AI-NewsLetter-Next",
  description: "This is Keyword News page for AI-NewsLetter-Next",
  // 기타 메타데이터
};

const KeywordNewsPage = () => {
  return (
    <DefaultLayout>
      <KeywordNews />
    </DefaultLayout>
  );
};

export default KeywordNewsPage;
