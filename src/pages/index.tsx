// src/pages/index.tsx
import React from "react";
import { useStore } from "@/store/store";
import { Box, Grid, Stack, Typography, Button } from "@mui/material";
import { SummaryCard } from "@/components/SummaryCard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimelineIcon from "@mui/icons-material/Timeline";
import HistoryIcon from "@mui/icons-material/History";
import WarningIcon from "@mui/icons-material/Warning";
import dayjs from "dayjs";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { decks, history, getSummary } = useStore();
  const router = useRouter();

  const correct = (history ?? []).reduce((a, h) => a + h.correctCount, 0);
  const incorrect = (history ?? []).reduce((a, h) => a + h.incorrectCount, 0);

  return (
    <Stack gap={3}>
      <Typography variant="h4">学習ダッシュボード</Typography>

      {decks.length === 0 && (
        <Typography>デッキがありません。設定画面からインポートしてください。</Typography>
      )}

      {decks.map((deck) => {
        const sum = getSummary ? getSummary(deck.id) : undefined;

        return (
          <Box key={deck.id} mb={4}>
            <Typography variant="h5">{deck.name}</Typography>

            {/* 学習モード選択ボタン */}
            <Stack direction="row" gap={2} mb={2}>
              <Button
                variant="contained"
                onClick={() => router.push(`/study?deckId=${deck.id}`)}
              >
                クイズカードで学習
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push(`/flashcards?deckId=${deck.id}`)}
              >
                フラッシュカードで暗記
              </Button>
            </Stack>

            {/* サマリーカード群 */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <SummaryCard
                  icon={<AssessmentIcon />}
                  title="学習進捗"
                  value={sum ? `${sum.studiedCards} / ${sum.totalCards}` : "0 / 0"}
                  subtitle={sum ? `進捗率 ${Math.round((sum.studiedCards / sum.totalCards) * 100)}%` : ""}
                  color="primary"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <SummaryCard
                  icon={<CheckCircleIcon />}
                  title="正解率"
                  value={sum ? `${sum.accuracyPercent}%` : "0%"}
                  subtitle={sum?.lastStudied ? `最終学習 ${dayjs(sum.lastStudied).format("YYYY/MM/DD")}` : ""}
                  color="success"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <SummaryCard
                  icon={<TimelineIcon />}
                  title="復習履歴"
                  value={sum ? `${sum.reviewCount} 回` : "0 回"}
                  subtitle="直近の復習回数"
                  color="info"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <SummaryCard
                  icon={<HistoryIcon />}
                  title="最終学習"
                  value={sum?.lastStudied ? dayjs(sum.lastStudied).format("YYYY/MM/DD") : "未学習"}
                  subtitle="最後に学習した日"
                  color="warning"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <SummaryCard
                  icon={<WarningIcon />}
                  title="苦手カード"
                  value={sum ? `${sum.weakCardsCount} 枚` : "0 枚"}
                  subtitle="復習対象カード数"
                  color="error"
                />
              </Grid>
            </Grid>
          </Box>
        );
      })}

      <Box mt={4}>
        <Typography variant="h6">全体統計</Typography>
        <Typography>正解数: {correct}</Typography>
        <Typography>不正解数: {incorrect}</Typography>
      </Box>
    </Stack>
  );
}
