import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function WatchPartyIndex() {
  // Avtomatik ravishda tasodifiy xona yaratib, o'sha xonaga yo'naltirish
  const newRoomId = uuidv4();
  redirect(`/watch-party/${newRoomId}`);
}
