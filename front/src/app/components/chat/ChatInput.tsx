"use client";

import React from "react";

function ChatInput() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("제출됨");
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="border-2 border-gray-300 rounded-2xl h-[80px] w-[800px] mx-auto px-4 flex items-center bg-white shadow-md my-4"
      >
        <input
          className="w-full outline-none bg-transparent"
          placeholder="무엇이든 물어보세요"
        />
      </form>
    </>
  );
}
export default ChatInput;
