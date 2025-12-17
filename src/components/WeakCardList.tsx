import { List, ListItem, ListItemText, Button, Box, Chip } from "@mui/material";

type Item = {
  id: string;
  question: string;
  accuracy: number;
  attempts: number;
  lastStudied?: string;
};

export const WeakCardList = ({
  items,
  onReview,
  onRemove
}: {
  items: Item[];
  onReview: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <List>
      {items.map((c) => (
        <ListItem key={c.id} secondaryAction={
          <Box display="flex" gap={1}>
            <Button variant="contained" color="primary" onClick={() => onReview(c.id)}>復習</Button>
            <Button variant="outlined" color="error" onClick={() => onRemove(c.id)}>削除</Button>
          </Box>
        }>
          <ListItemText
            primary={c.question}
            secondary={
              <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                <Chip label={`正解率 ${c.accuracy}%`} color={c.accuracy < 50 ? "error" : c.accuracy < 70 ? "warning" : "success"} size="small" />
                <Chip label={`学習回数 ${c.attempts}`} size="small" />
                {c.lastStudied && <Chip label={`最終学習 ${c.lastStudied}`} size="small" />}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};
