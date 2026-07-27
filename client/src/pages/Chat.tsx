import Layout from "../components/common/Layout";
import ChatWindow from "../components/chat/ChatWindow";

const Chat = () => {
  return (
    <Layout>

      <div className="h-[calc(100vh-120px)]">

        <h1 className="text-3xl font-bold mb-6">
          AI Chat
        </h1>

        <ChatWindow />

      </div>

    </Layout>
  );
};

export default Chat;