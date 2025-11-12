import ChatBubble from '../ChatBubble';

export default function ChatBubbleExample() {
  return (
    <div>
      <ChatBubble
        message="I've been having a mild fever for the past two days"
        isUser={true}
        timestamp="10:30 AM"
      />
      <ChatBubble
        message="I understand you're experiencing a mild fever. Can you tell me if you have any other symptoms like headache, body aches, or cough?"
        isUser={false}
        timestamp="10:31 AM"
      />
    </div>
  );
}
