import { useEffect } from "react";
import { useStore } from "@/store/store";
import { Typography } from "@mui/material";
import { Deck } from "@/types";

export default function SeedPage() {
  const { upsertDeck } = useStore();

  useEffect(() => {
    const demo: Deck = {
      id: "quiz001",
      name: "世界史クイズ",
      cards: [
        {
          id: "q1",
          question: "産業革命が始まった国は？",
          options: ["イギリス", "フランス", "ドイツ", "アメリカ"],
          answer: "イギリス",
          explanation: "18世紀後半に始まり、世界に広がった",
          accuracy: 0,
          attempts: 0
        },
        {
          id: "q2",
          question: "フランス革命が起きた年は？",
          options: ["1776年", "1789年", "1812年", "1848年"],
          answer: "1789年",
          explanation: "人権宣言が採択された年でもある",
          accuracy: 0,
          attempts: 0
        }
      ],
      createdAt: new Date().toISOString()
    };
    upsertDeck(demo);
  }, [upsertDeck]);

  return <Typography>Seed injected. ダッシュボードへ戻ってください。</Typography>;
}
