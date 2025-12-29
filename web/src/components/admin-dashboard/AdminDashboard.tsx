"use client";
import { useState } from "react";
import { BookingAnalyticsTab } from "./BookingAnalyticsTab";
import { RevenueAnalyticsTab } from "./RevenueAnalyticsTab";

const TABS = [
  { key: "booking", label: "Booking Analytics" },
  { key: "revenue", label: "Revenue Analytics" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("booking");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-6 py-3 font-semibold text-lg border-b-2 transition-all duration-150 focus:outline-none ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-gray-50 dark:bg-gray-900"
                : "border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === "booking" && <BookingAnalyticsTab />}
        {activeTab === "revenue" && <RevenueAnalyticsTab />}
      </div>
    </div>
  );
}
