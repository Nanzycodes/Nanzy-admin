"use client";

import InnerLayout from "@/components/inner-layout";
import Account from "@/components/settings/Account";
import UserRoles from "@/components/settings/User-roles";
import Notifications from "@/components/settings/Notifications";
import Logout from "@/components/settings/Logout";
import { useState } from "react";

type SettingsTab = "account" | "user roles" | "notifications" | "logout";

const tabs: SettingsTab[] = [
  "account",
  "user roles",
  "notifications",
  "logout",
];

const Page = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  return (
    <div>
      <InnerLayout
        sectionHeader="Settings"
        sectionSubheader="Manage user roles, notifications"
      >
        <div className="w-full">
          <div className="flex gap-2 mb-4 border-b border-[#E6E6E6]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-6.25 rounded-[5px] text-center font-medium capitalize transition-colors cursor-pointer
                  ${
                    activeTab === tab
                      ? "bg-[#ECEBFF]"
                      : "bg-transparent text-[#9E9E9E]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div>
            {activeTab === "account" && <Account />}
            {activeTab === "user roles" && <UserRoles />}
            {activeTab === "notifications" && <Notifications />}
            {activeTab === "logout" && <Logout />}
          </div>
        </div>
      </InnerLayout>
    </div>
  );
};

export default Page;
