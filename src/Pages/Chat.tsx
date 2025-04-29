import React, { useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
});

const Chat = ({ user }: any) => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [totalMessages, setTotalMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // scrolling effect
  useEffect(() => {
    const isAtBottom = () => {
      const container = chatEndRef.current?.parentElement;
      if (container) {
        return (
          container.scrollHeight - container.scrollTop ===
          container.clientHeight
        );
      }
      return false;
    };

    if (isAtBottom()) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [totalMessages]);

  useEffect(() => {
    if (user?.id) {
      socket.emit("add-user", user.id);
    }
  }, [user]);

  useEffect(() => {
    const handleReceiveMessage = (msg: any) => {
      console.log("📩 Real-time message received:", msg);
      setTotalMessages((prev) => [
        ...prev,
        {
          sender_id: msg.from,
          receiver_id: user.id,
          message: msg.message,
        },
      ]);
    };

    const handleUpdateOnlineUsers = (onlineUserIds: number[]) => {
      console.log("🟢 Online Users:", onlineUserIds);
      setOnlineUsers(onlineUserIds);
    };

    socket.on("msg-receive", handleReceiveMessage);
    socket.on("update-online-users", handleUpdateOnlineUsers);

    return () => {
      socket.off("msg-receive", handleReceiveMessage);
      socket.off("update-online-users", handleUpdateOnlineUsers);
    };
  }, [newMessage]);

  useEffect(() => {
    const fetchAllContacts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user_api/getAllUsers`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        const otherUsers = data.users.filter((u: any) => u.id !== user?.id);
        setContacts(otherUsers);
      } catch (error) {
        console.log("error fetching contacts", error);
      }
    };

    fetchAllContacts();
  }, [user]);

  const fetchtotalMessages = async (contact: any) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/message_api/get_messages/${user.id}/${contact.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      setTotalMessages(data?.totalMessages || []);
      setSelectedContact(contact);
      setNewMessage("");
    } catch (error) {
      console.log("error fetching messages", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      // Send message to socket
      socket.emit("send-msg", {
        to: selectedContact.id,
        message: newMessage.trim(),
      });

      // Save message in DB
      await fetch(`${BACKEND_URL}/message_api/create_message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: selectedContact.id,
          message: newMessage.trim(),
        }),
      });

      setNewMessage(""); // Clear input after sending
    } catch (error) {
      console.log("error sending message", error);
    }
  };

  const handleLogout = () => {
    // Clear the user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to the login page
    navigate("/login");
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <h2 className={styles.heading}>Contacts (You: {user?.name})</h2>
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`${styles.contact} ${
              selectedContact?.id === contact.id ? styles.selected : ""
            }`}
            onClick={() => fetchtotalMessages(contact)}
          >
            {contact.name} {contact.id}
            {onlineUsers.includes(contact.id) ? (
              <span className={styles.onlineDot}>🟢</span>
            ) : (
              <span className={styles.offlineDot}>⚪</span>
            )}
          </div>
        ))}
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          {selectedContact ? (
            <h2>Chat with {selectedContact.name}</h2>
          ) : (
            <h2>Select a contact</h2>
          )}
        </div>

        <div className={styles.messages}>
          {totalMessages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender_id === user.id
                  ? styles.myMessage
                  : styles.theirMessage
              }
            >
              {msg.message}
              {/* Empty div at the bottom to act as the scroll target */}
              <div ref={chatEndRef}></div>
            </div>
          ))}
        </div>

        {selectedContact && (
          <form className={styles.messageForm} onSubmit={handleSendMessage}>
            <input
              type="text"
              className={styles.messageInput}
              placeholder="Type your message..."
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
            />
            <button type="submit" className={styles.sendButton}>
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
