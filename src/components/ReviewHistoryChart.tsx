"use client";
import { LineChart } from "@mui/x-charts/LineChart";

type Props = {
  labels: string[];      // 日付など
  attempts: number[];    // 復習回数
  accuracy: number[];    // 正解率推移
};

export const ReviewHistoryChart: React.FC<Props> = ({ labels, attempts, accuracy }) => {
  return (
    <LineChart
      xAxis={[{ data: labels }]}
      series={[
        { data: attempts, label: "復習回数", color: "#1976d2" },
        { data: accuracy, label: "正解率", color: "#2e7d32" }
      ]}
      width={600}
      height={300}
    />
  );
};
