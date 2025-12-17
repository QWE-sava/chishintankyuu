import { Box, LinearProgress, Typography } from "@mui/material";

export const ProgressChart = ({ current, total }: { current: number; total: number }) => {
  const value = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <Box>
      <Typography variant="body2">進捗: {current} / {total} ({value}%)</Typography>
      <LinearProgress variant="determinate" value={value} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
    </Box>
  );
};
