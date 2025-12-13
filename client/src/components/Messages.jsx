// Messages.jsx
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  Spinner,
  Card,
  Row,
  Col,
  Container,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { HiOutlineDotsVertical } from "react-icons/hi";
import dayjs from "dayjs";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const menuRef = useRef();

  // Fetch conversations on load
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/messages");
        setConversations(res.data || []);
      } catch (err) {
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(
          `/messages/${selectedConversation.conversationId}`
        );
        console.log("Fetched messages:", res.data);
        setMessages(res.data.messages || []);
      } catch (err) {
        toast.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId ? { ...m, isRead: true } : m
        )
      );
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    } finally {
      setOpenMenuId(null);
    }
  };

  const markAsUnread = async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/unread`);
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId ? { ...m, isRead: false } : m
        )
      );
      toast.success("Marked as unread");
    } catch {
      toast.error("Failed to mark as unread");
    } finally {
      setOpenMenuId(null);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.messageId !== messageId));
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setOpenMenuId(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const res = await api.post(
        `/messages/${selectedConversation.conversationId}`,
        {
          content: newMessage,
        }
      );
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Conversations Sidebar */}
        <Col
          xs={12}
          md={4}
          lg={3}
          className="border-end"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <h5 className="mb-3">Conversations</h5>
          <Form.Control
            placeholder="Search messages..."
            className="mb-3"
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              setConversations((prev) =>
                prev.map((c) => ({
                  ...c,
                  visible:
                    c.latestMessage.toLowerCase().includes(q) ||
                    c.participantsName.toLowerCase().includes(q),
                }))
              );
            }}
          />
          {conversations.length === 0 && (
            <p className="text-muted">No conversations</p>
          )}
          {conversations.map((conv) => (
            <Card
              key={conv.conversationId}
              className={`mb-2 ${
                selectedConversation?.conversationId === conv.conversationId
                  ? "border-primary"
                  : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedConversation(conv)}
            >
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <strong
                    style={{
                      fontWeight: conv.unreadCount > 0 ? "bold" : "normal",
                    }}
                  >
                    {conv.participantsName}
                  </strong>
                  {conv.unreadCount > 0 && (
                    <span className="badge bg-primary">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="text-truncate" style={{ maxWidth: "100%" }}>
                  {conv.latestMessage.messageContent.slice(0, 50)}
                  {conv.latestMessage.messageContent.length > 50 ? "..." : ""}
                </div>
              </Card.Body>
            </Card>
          ))}
        </Col>

        {/* Messages View */}
        <Col xs={12} md={8} lg={9} className="d-flex flex-column">
          {!selectedConversation ? (
            <div className="text-center text-muted my-auto">
              Select a conversation to read messages.
            </div>
          ) : (
            <>
              <div
                className="flex-grow-1 overflow-auto mb-3"
                style={{ maxHeight: "70vh" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`d-flex mb-2 ${
                      msg.isOwnMessage
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                    style={{ position: "relative" }}
                  >
                    <Card
                      style={{
                        backgroundColor: msg.isOwnMessage
                          ? "#dcf8c6"
                          : "#f1f0f0",
                        minWidth: "200px",
                        maxWidth: "70%",
                      }}
                    >
                      <Card.Body className="position-relative p-2">
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{msg.senderName}</strong>
                          </div>
                          <div>
                            <HiOutlineDotsVertical
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                setOpenMenuId(
                                  msg.messageId === openMenuId
                                    ? null
                                    : msg.messageId
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>{msg.messageContent}</div>
                        <small className="text-muted">
                          {dayjs(msg.createdAt).format("MMM D, YYYY h:mm A")}
                        </small>

                        {/* Floating menu */}
                        {openMenuId === msg.messageId && (
                          <div
                            ref={menuRef}
                            className="position-absolute bg-white shadow rounded"
                            style={{
                              top: "30px",
                              right: "0",
                              zIndex: 20,
                              minWidth: "140px",
                            }}
                          >
                            {!msg.isRead && (
                              <div
                                className="p-2 hover-bg"
                                style={{ cursor: "pointer" }}
                                onClick={() => markAsRead(msg.messageId)}
                              >
                                Mark as Read
                              </div>
                            )}
                            {msg.isRead && (
                              <div
                                className="p-2 hover-bg"
                                style={{ cursor: "pointer" }}
                                onClick={() => markAsUnread(msg.messageId)}
                              >
                                Mark as Unread
                              </div>
                            )}
                            <div
                              className="p-2 hover-bg text-danger"
                              style={{ cursor: "pointer" }}
                              onClick={() => deleteMessage(msg.messageId)}
                            >
                              Delete
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Input Box */}
              <InputGroup className="mt-auto">
                <Form.Control
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button variant="primary" onClick={sendMessage}>
                  Send
                </Button>
              </InputGroup>
            </>
          )}
        </Col>
      </Row>
      <style>{`
        .hover-bg:hover { background-color: #f2f2f2; }
      `}</style>
    </Container>
  );
};

export default Messages;
