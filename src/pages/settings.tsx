// src/pages/settings.tsx
import React, { useState } from "react";
import { useStore } from "@/store/store";
import { Box, Typography, Button, Divider, TextField, Snackbar, Alert } from "@mui/material";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function SettingsPage() {
  const { decks, groqApiKey, setGroqApiKey } = useStore();
  const [jsonInput, setJsonInput] = useState("");
  const [localApiKey, setLocalApiKey] = useState(groqApiKey);
  const [message, setMessage] = useState("");

  // 初期ロードと状態同期
  useEffect(() => {
    setLocalApiKey(groqApiKey);
  }, [groqApiKey]);

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
      setMessage("デッキを初期化しました。");
    }
  };

  const handleSaveApiKey = async () => {
    setGroqApiKey(localApiKey);
    
    // SupabaseがログインしていればCloudにも保存
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: data.user.id, groq_api_key: localApiKey });

      if (error) {
        setMessage("クラウドへのキー保存に失敗しました: " + error.message);
        return;
      }
    }
    setMessage("APIキーを保存しました！");
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        設定
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Groq API 設定 */}
      <Typography variant="h6" gutterBottom>
        AI 問題生成 (Groq)
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        問題の自動生成機能には Groq のAPIキーが必要です（無料で取得可能）。
        ログイン中の場合はクラウドに同期されます。
      </Typography>
      <TextField
        label="Groq API Key"
        type="password"
        fullWidth
        value={localApiKey}
        onChange={(e) => setLocalApiKey(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveApiKey}
      >
        APIキーを保存
      </Button>

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

      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage("")}
      >
        <Alert onClose={() => setMessage("")} severity="info">
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
