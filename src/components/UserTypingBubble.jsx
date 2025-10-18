// src/components/UserTypingBubble.jsx
export default function UserTypingBubble() {
  return (
    <div className="flex justify-end mb-3">
      <div
        className="px-4 py-2 rounded-2xl shadow bg-pink-500 text-white flex items-center gap-1"
        style={{ fontSize: "0.875rem" }}
      >
        <span>你正在输入</span>
        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
}
