"use client"

import StatusStart from "@/components/start/StatusStart"

export default function PagePreview() {
  return (
    <main className="start-shell">
      <div className="start-shell-top" aria-hidden />
      <section className="start-shell-inner">
        <StatusStart refetch={() => undefined} questionCount={12} quizName="Ночной квиз" />
      </section>
    </main>
  )
}
