import { Card, CardContent, Typography, Box } from "@mui/material";

type Props = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "primary" | "success" | "warning" | "info" | "error";
  onClick?: () => void;
};

export const SummaryCard: React.FC<Props> = ({
  icon,
  title,
  value,
  subtitle,
  color = "info",
  onClick
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        bgcolor: (theme) => theme.palette[color].main,
        color: "white"
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          <Box>{icon}</Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" mt={1}>{value}</Typography>
        {subtitle && <Typography variant="body2" mt={0.5} sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
};
