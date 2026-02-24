import React from "react";
import DashboardCardContainer from "./card-container";
import { TealPackage } from "@/lib/utils";

const OrdersCard = () => {
  return (
    <DashboardCardContainer cardTitle="Orders" titleIcon={TealPackage}>
      <div></div>
    </DashboardCardContainer>
  );
};

export default OrdersCard;
