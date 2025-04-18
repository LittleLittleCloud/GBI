import React from "react";
import BaseVisualizer from "./base-visualizer";

const MarketPriceVisualizer: React.FC<{}> = ({
}) => {
  return (
    <BaseVisualizer
      dataKeyField="Price"
      title="Market Price Trend"
    />
  );
};

export default MarketPriceVisualizer;