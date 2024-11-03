import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DailySummary from "@/components/News/DailySummary";

export const metadata: Metadata = {
  title: "뉴스 요약 | AI-NewsLetter-Next",
  description: "AI가 요약한 뉴스 목록을 확인할 수 있습니다.",
};

const DailySummaryPage = () => {
  return (
    <DefaultLayout>
      <DailySummary />
    </DefaultLayout>
  );
};

export default DailySummaryPage;
