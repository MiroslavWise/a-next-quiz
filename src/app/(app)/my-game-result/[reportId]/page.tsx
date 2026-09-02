import MyGameResultClient from "./my-game-result-client"

export default async function MyGameResultPage({ params }: PageProps<"/my-game-result/[reportId]">) {
  const { reportId } = await params
  return <MyGameResultClient reportId={reportId} />
}
