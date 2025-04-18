import React from "react";
import BaseVisualizer from "./base-visualizer";

const GBIVisualizer: React.FC<{}> = ({
}) => {
  return (
    <BaseVisualizer
      dataKeyField="GBI"
      title="GBI Trend"
    />
  );
};

export default GBIVisualizer;