import { redirect } from "next/navigation";

export default function WatchPartyIndex() {
  // Avtomatik ravishda tasodifiy xona yaratib, o'sha xonaga yo'naltirish
  const newRoomId = crypto.randomUUID();
  redirect(`/watch-party/${newRoomId}`);
}
