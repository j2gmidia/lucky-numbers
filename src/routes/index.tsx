import { createFileRoute } from "@tanstack/react-router";
import { LotteryApp } from "@/components/lottery-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LotteryApp />;
}
