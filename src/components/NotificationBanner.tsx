import { Alert, Button, Box } from "@mui/material";

export const NotificationBanner = ({
  message,
  onStartReview
}: {
  message: string;
  onStartReview: () => void;
}) => {
  return (
    <Box mb={2}>
      <Alert
        icon={false}
        severity="info"
        action={<Button color="primary" variant="contained" onClick={onStartReview}>復習を開始</Button>}
      >
        {message}
      </Alert>
    </Box>
  );
};
