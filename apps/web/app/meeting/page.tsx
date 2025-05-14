"use client";
import generateUniqueRoomKey from "@/utils/generateUniqueRoomName";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const page = () => {
  const uniqueName = generateUniqueRoomKey();
  const [roomName, setRoomName] = useState<string>(uniqueName);
  const router = useRouter();
  const isValidRoomFormat = (key: string): boolean => {
    const regex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    return regex.test(key);
  };
  const handleJoinRoom = () => {
    if (roomName.trim() == "") {
      toast("Please enter a room name", {
        cancel: {
          label: "cancel",
          onClick: () => console.log("cancel"),
        },
      });
      return;
    }
    if (!isValidRoomFormat(roomName)) {
      toast("Please enter a valid room name", {
        cancel: {
          label: "cancel",
          onClick: () => console.log("cancel"),
        },
      });
      return;
    }
    router.push(`meeting/${roomName}`);
  };

  return (
    <div className="flex px-5 h-screen w-full items-center justify-center">
      <div className="border-[0.6px] flex flex-col gap-10 p-12 border-gray-200 size-96 rounded-xl">
        <h1 className="text-center text-2xl font-bold">
          Welcome to Echomeet VideoCall 🎥
        </h1>
        <Input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          type="text"
          placeholder="Enter room name"
        />
        <Button onClick={handleJoinRoom}>Join</Button>
      </div>
    </div>
  );
};

export default page;
