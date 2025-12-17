// src/pages/settings.tsx
import React, { useState } from "react";
import { useStore } from "@/store/store";
import { Box, Typography, Button, Divider, TextField } from "@mui/material";

export default function SettingsPage() {
  const { decks } = useStore();
  const [jsonInput, setJsonInput] = useState("");

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      useStore.getState().addDeck(parsed);
      alert("デッキをインポートしました！");
      setJsonInput("");
    } catch (e) {
      alert("JSONの形式が正しくありません。");
    }
  };

  const handleClearDecks = () => {
    const confirmed = window.confirm("本当にすべてのデッキを削除しますか？");
    if (confirmed) {
      useStore.getState().clearDecks();
      alert("デッキを初期化しました。");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        設定
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* デッキインポート機能 */}
      <Typography variant="h6" gutterBottom>
        デッキインポート
      </Typography>
      <TextField
        label="デッキJSONを貼り付け"
        multiline
        rows={6}
        fullWidth
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleImport}
        sx={{ mt: 2 }}
      >
        インポート
      </Button>

      <Divider sx={{ my: 3 }} />

      {/* デッキ削除機能 */}
      <Typography variant="h6" gutterBottom>
        デッキ管理
      </Typography>
      <Typography variant="body1" gutterBottom>
        現在のデッキ数: {decks.length}
      </Typography>
      <Button
        variant="outlined"
        color="error"
        onClick={handleClearDecks}
        sx={{ mt: 2 }}
      >
        デッキをすべて削除（初期化）
      </Button>
    </Box>
  );
}
