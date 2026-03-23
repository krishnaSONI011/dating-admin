import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import SalesPieChart from "@/components/charts/pieChart/Salespiechart";
import CityVisitChart from "@/components/charts/ColorCharts/CityChart";
import LocalVisitChart from "@/components/charts/ColorChartLocalArea/LocalAreaChart";

export const metadata: Metadata = {
  title:
    "Affair Escorts",
  description: "Admin for the Affair Escorts ",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <EcommerceMetrics />
        <div className="grid grid-cols-2 gap-5">
        <MonthlySalesChart />
        <SalesPieChart />
        </div>
        <CityVisitChart />
        <LocalVisitChart />

       
      </div>

    

      {/* <div className="col-span-12">
        <StatisticsChart />
      </div> */}

      {/* <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div> */}

      
    </div>
  );
}
