import React from "react";
import DashboardCardContainer from "./card-container";
import { BoxTealTime } from "@/lib/utils";

const RecentActivities = () => {
  return (
    <DashboardCardContainer
      cardTitle="Recent Activities"
      titleIcon={BoxTealTime}
    >
      <div></div>
    </DashboardCardContainer>
  );
};

export default RecentActivities;
