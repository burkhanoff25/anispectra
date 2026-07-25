import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WatchPartyRoom from "@/components/WatchPartyRoom";

export default async function WatchPartyPage({ params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/watch-party/" + params.roomId);
  }

  return (
    <div className="w-full">
      <WatchPartyRoom roomId={params.roomId} />
    </div>
  );
}
