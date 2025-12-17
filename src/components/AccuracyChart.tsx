"use client";
import { PieChart } from "@mui/x-charts/PieChart";

export const AccuracyChart = ({ correct, incorrect }: { correct: number; incorrect: number }) => {
  return (
    <PieChart
      series={[
        {
          data: [
            { id: 0, value: correct, label: "正解", color: "#2e7d32" },
            { id: 1, value: incorrect, label: "不正解", color: "#d32f2f" }
          ]
        }
      ]}
      width={320}
      height={240}
    />
  );
};
