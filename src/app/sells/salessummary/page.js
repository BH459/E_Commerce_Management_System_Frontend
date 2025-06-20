import SalesSummary from "@/components/SalesSummary";
import { Suspense } from "react";

const SalesSummaryPage = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SalesSummary />
    </Suspense>
  );
};

export default SalesSummaryPage;