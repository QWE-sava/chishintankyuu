import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },   // 進捗カード: 青系
    success: { main: "#2e7d32" },   // 正解率カード: 緑系
    warning: { main: "#ed6c02" },   // 復習カード: オレンジ系
    info: { main: "#455a64" },      // 履歴カード: ネイビー/グレー系
    error: { main: "#d32f2f" }      // 苦手カード: 赤系
  },
  shape: { borderRadius: 12 }
});
