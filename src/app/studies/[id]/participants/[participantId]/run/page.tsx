import { notFound } from "next/navigation";
import { SessionRunner } from "@/components/session-runner";
import { getRunData } from "@/lib/actions";

type Props = {
  params: Promise<{ id: string; participantId: string }>;
};

export default async function RunSessionPage({ params }: Props) {
  const { id, participantId } = await params;
  const data = await getRunData(id, participantId);
  if (!data) notFound();

  return (
    <div crux-attr="ex-283390">
      <SessionRunner study={data.study} participant={data.participant} />
    </div>
  );
}
