import Image from "next/image";
import ChatInput from "./ChatInput";

function ChatWindow() {
  return (
    <div className="flex flex-col justify-center items-center h-screen ">
      <Image
        src="/images/logo.webp"
        alt="로고"
        width={150}
        height={150}
        priority
        className="mb-15"
      />
      <h1 className="font-bold text-3xl">무엇을 도와드릴까요?</h1>
      <ChatInput />
    </div>
  );
}
export default ChatWindow;
