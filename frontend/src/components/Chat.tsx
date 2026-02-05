import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Message, Group } from '../types';
import { ProfileModal } from './ProfileModal';
import { GroupModal } from './GroupModal';

export const Chat = () => {
  const { email, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [target, setTarget] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    connectWebSocket();
    return () => socketRef.current?.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, target]);

  const loadData = async () => {
    const [msgs, grps] = await Promise.all([api.getMessages(), api.getGroups()]);
    setMessages(msgs);
    setGroups(grps);
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(api.getWsUrl());
    socketRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'users') {
        setActiveUsers(data.users);
      } else if (data.type === 'updateGroups') {
        api.getGroups().then(setGroups);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const payload: { message: string; targetEmail?: string; groupId?: number } = {
      message: inputValue,
    };

    if (target.startsWith('GRP_')) {
      payload.groupId = parseInt(target.split('_')[1]);
    } else if (target) {
      payload.targetEmail = target;
    }

    await api.sendMessage(payload);
    socketRef.current?.send(JSON.stringify(payload));
    setInputValue('');
  };

  const filteredMessages = messages.filter((m) => {
    if (target.startsWith('GRP_')) {
      return m.groupId === parseInt(target.split('_')[1]);
    }
    if (target) {
      return !m.groupId && (
        (m.senderEmail === target && m.receiverEmail === email) ||
        (m.senderEmail === email && m.receiverEmail === target)
      );
    }
    return !m.groupId && !m.receiverEmail;
  });

  const otherUsers = activeUsers.filter((u) => u !== email);

  const handleGroupCreated = () => {
    api.getGroups().then(setGroups);
    socketRef.current?.send(JSON.stringify({ type: 'newGroup', members: [] }));
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="user-avatar" onClick={() => setShowProfile(true)}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" />
            ) : (
              email?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="user-info">
            <h2>{email?.split('@')[0]}</h2>
            <span>Online</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={() => setShowProfile(true)} title="Profil">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
          <button className="btn-logout" onClick={logout}>Kijelentkezés</button>
        </div>
      </div>

      <div className="chat-selector">
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Publikus csevegés</option>
          {groups.length > 0 && (
            <optgroup label="Csoportok">
              {groups.map((g) => (
                <option key={g.id} value={`GRP_${g.id}`}>{g.name}</option>
              ))}
            </optgroup>
          )}
          {otherUsers.length > 0 && (
            <optgroup label="Privát üzenetek">
              {otherUsers.map((u) => (
                <option key={u} value={u}>{u.split('@')[0]}</option>
              ))}
            </optgroup>
          )}
        </select>
        <button className="btn-new-group" onClick={() => setShowGroupModal(true)}>
          Új csoport
        </button>
      </div>

      <div className="messages-container">
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <span>Még nincsenek üzenetek</span>
          </div>
        ) : (
          filteredMessages.map((m, i) => {
            const isMe = m.senderEmail === email;
            return (
              <div key={i} className={`message ${isMe ? 'sent' : 'received'}`}>
                <span className="message-sender">
                  {isMe ? 'Te' : m.senderEmail?.split('@')[0]}
                </span>
                <div className="message-bubble">{m.message}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-wrapper">
          <input
            placeholder="Írj üzenetet..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="btn-send" onClick={sendMessage}>
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          avatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
        />
      )}

      {showGroupModal && (
        <GroupModal
          onClose={() => setShowGroupModal(false)}
          users={otherUsers}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  );
};
