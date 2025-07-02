// 그래프 상세 모달 화면

"use client";

import React from "react";

export default function GraphDetailModal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FAF7F7",
          padding: 40, // 내부 여백도 조금 키움
          borderRadius: 12,
          width: 800, // 너비 키움
          height: 800,
          maxWidth: "80%", // 최대 너비 제한 (반응형 대응)
          maxHeight: "80vh", // 최대 높이 제한
          overflowY: "auto", // 내용이 넘치면 스크롤
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
