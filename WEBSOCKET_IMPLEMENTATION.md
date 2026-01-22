# WebSocket with mTLS Support - Implementation Summary

## Overview
This document describes the WebSocket implementation with mTLS authentication support for the expo-mutual-tls module.

## Architecture

### Design Principles
1. **Reuses existing mTLS infrastructure** - Leverages existing SSLContextManager (iOS) and SSLSocketFactory (Android)
2. **Connection ID management** - UUID-based unique identifiers for each WebSocket connection
3. **Unified event model** - Single `onWebSocketEvent` with connectionId for multi-connection support
4. **Thread-safe** - ConcurrentMap on Android, DispatchQueue on iOS
5. **Consistent API** - Follows the existing ExpoMutualTls utility pattern

### Component Layers

#### 1. TypeScript Layer
- **ExpoMutualTls.types.ts** - Type definitions for WebSocket operations
- **ExpoMutualTlsModule.ts** - Native module interface declarations
- **index.ts** - Public API utility methods

#### 2. iOS Layer (Swift)
- **WebSocketManager.swift** - WebSocket connection management using URLSessionWebSocketTask
- **ExpoMutualTlsModule.swift** - Integration with module and event emission

#### 3. Android Layer (Kotlin)
- **ExpoMutualTlsModule.kt** - OkHttp WebSocket integration
- **WebSocketEventListener** - Event callbacks for WebSocket lifecycle

---

## API Reference

### Connection Management

#### `connectWebSocket(url: string, protocols?: string[]): Promise<string>`
Creates a new WebSocket connection with mTLS authentication.

**Parameters:**
- `url` - WebSocket URL (wss:// or ws://)
- `protocols` - Optional list of WebSocket subprotocols

**Returns:** Connection ID (UUID string)

**Example:**
```typescript
const connectionId = await ExpoMutualTls.connectWebSocket(
  'wss://secure.example.com/ws',
  ['chat', 'v1']
);
```

---

#### `disconnectWebSocket(connectionId: string): Promise<void>`
Disconnects an active WebSocket connection.

**Parameters:**
- `connectionId` - Connection ID returned from `connectWebSocket`

**Example:**
```typescript
await ExpoMutualTls.disconnectWebSocket(connectionId);
```

---

#### `sendWebSocketMessage(connectionId: string, message: string): Promise<void>`
Sends a text message through the WebSocket connection.

**Parameters:**
- `connectionId` - Connection ID returned from `connectWebSocket`
- `message` - Message string to send

**Example:**
```typescript
await ExpoMutualTls.sendWebSocketMessage(connectionId, 'Hello, Server!');
```

---

#### `getWebSocketState(connectionId: string): Promise<string>`
Gets the current state of a WebSocket connection.

**Parameters:**
- `connectionId` - Connection ID returned from `connectWebSocket`

**Returns:** Connection state - `'connecting' | 'open' | 'closing' | 'closed'`

**Example:**
```typescript
const state = await ExpoMutualTls.getWebSocketState(connectionId);
console.log('WebSocket state:', state); // 'open'
```

---

### Event Listeners

#### `onWebSocketOpen(callback: (connectionId: string) => void)`
Listens for WebSocket connection open events.

**Parameters:**
- `callback` - Function called with connectionId when connection opens

**Returns:** Event subscription for removing listener

**Example:**
```typescript
const subscription = ExpoMutualTls.onWebSocketOpen((connectionId) => {
  console.log('WebSocket connected:', connectionId);
});

// Remove listener when done
subscription.remove();
```

---

#### `onWebSocketMessage(callback: (connectionId: string, data: string) => void)`
Listens for incoming WebSocket messages.

**Parameters:**
- `callback` - Function called with connectionId and message data

**Returns:** Event subscription for removing listener

**Example:**
```typescript
const subscription = ExpoMutualTls.onWebSocketMessage((connectionId, data) => {
  console.log('Message received:', data);
  // Parse and process message
  const message = JSON.parse(data);
});
```

---

#### `onWebSocketClose(callback: (connectionId: string, code?: number, reason?: string) => void)`
Listens for WebSocket connection close events.

**Parameters:**
- `callback` - Function called with connectionId, close code, and reason

**Returns:** Event subscription for removing listener

**Example:**
```typescript
const subscription = ExpoMutualTls.onWebSocketClose((connectionId, code, reason) => {
  console.log('WebSocket closed:', { code, reason });
  if (code === 1000) {
    console.log('Normal closure');
  } else {
    console.log('Abnormal closure:', code);
  }
});
```

---

#### `onWebSocketError(callback: (connectionId: string, error: string) => void)`
Listens for WebSocket error events.

**Parameters:**
- `callback` - Function called with connectionId and error message

**Returns:** Event subscription for removing listener

**Example:**
```typescript
const subscription = ExpoMutualTls.onWebSocketError((connectionId, error) => {
  console.error('WebSocket error:', error);
  // Handle error - possibly reconnect
});
```

---

## Usage Examples

### Basic WebSocket Connection

```typescript
import ExpoMutualTls from '@a-cube-io/expo-mutual-tls';

// 1. Configure and store certificate
await ExpoMutualTls.configureP12('demo.client.p12', true);
await ExpoMutualTls.storeP12(p12Data, 'password');

// 2. Connect to WebSocket
const connectionId = await ExpoMutualTls.connectWebSocket(
  'wss://secure.example.com/ws'
);

// 3. Set up event listeners
ExpoMutualTls.onWebSocketOpen((id) => {
  console.log('✅ Connected:', id);
});

ExpoMutualTls.onWebSocketMessage((id, data) => {
  console.log('📨 Message:', data);
});

ExpoMutualTls.onWebSocketClose((id, code, reason) => {
  console.log('🔌 Closed:', id, code, reason);
});

ExpoMutualTls.onWebSocketError((id, error) => {
  console.error('❌ Error:', error);
});

// 4. Send message
await ExpoMutualTls.sendWebSocketMessage(connectionId, 'Hello, Server!');

// 5. Disconnect when done
await ExpoMutualTls.disconnectWebSocket(connectionId);
```

---

### React Component Integration

```typescript
import React, { useEffect, useState } from 'react';
import ExpoMutualTls from '@a-cube-io/expo-mutual-tls';

function ChatComponent() {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    // Set up event listeners
    const openSubscription = ExpoMutualTls.onWebSocketOpen((id) => {
      setStatus('Connected');
      setConnectionId(id);
    });

    const messageSubscription = ExpoMutualTls.onWebSocketMessage((id, data) => {
      setMessages(prev => [...prev, data]);
    });

    const closeSubscription = ExpoMutualTls.onWebSocketClose((id) => {
      setStatus('Disconnected');
      setConnectionId(null);
    });

    const errorSubscription = ExpoMutualTls.onWebSocketError((id, error) => {
      console.error('WebSocket error:', error);
      setStatus('Error');
    });

    return () => {
      openSubscription.remove();
      messageSubscription.remove();
      closeSubscription.remove();
      errorSubscription.remove();
    };
  }, []);

  const connect = async () => {
    try {
      await ExpoMutualTls.connectWebSocket('wss://chat.example.com/ws');
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!connectionId) return;
    try {
      await ExpoMutualTls.sendWebSocketMessage(connectionId, message);
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  const disconnect = async () => {
    if (connectionId) {
      await ExpoMutualTls.disconnectWebSocket(connectionId);
    }
  };

  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={connect} disabled={status !== 'Disconnected'}>
        Connect
      </button>
      <button onClick={disconnect} disabled={!connectionId}>
        Disconnect
      </button>

      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.messageInput.value;
        if (input) {
          sendMessage(input);
          e.currentTarget.messageInput.value = '';
        }
      }}>
        <input name="messageInput" placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

---

### Multiple Connections

```typescript
// Connect to multiple WebSocket endpoints
const chatConnectionId = await ExpoMutualTls.connectWebSocket(
  'wss://chat.example.com/ws'
);

const notificationConnectionId = await ExpoMutualTls.connectWebSocket(
  'wss://notifications.example.com/ws'
);

// Handle messages based on connection ID
ExpoMutualTls.onWebSocketMessage((connectionId, data) => {
  if (connectionId === chatConnectionId) {
    console.log('Chat message:', data);
  } else if (connectionId === notificationConnectionId) {
    console.log('Notification:', data);
  }
});
```

---

### WebSocket Subprotocols

```typescript
// Connect with WebSocket subprotocols
const connectionId = await ExpoMutualTls.connectWebSocket(
  'wss://secure.example.com/ws',
  ['v1.chat', 'v1.notification']
);
```

---

## Implementation Details

### iOS Implementation

**Technology:** URLSessionWebSocketTask (iOS 13+)

**Key Components:**
- `WebSocketManager` - Manages active WebSocket connections
- Uses existing `SSLContextManager` for mTLS
- `URLSessionWebSocketTask` for WebSocket communication
- Background tasks for receiving messages
- Thread-safe connection dictionary

**Connection States:**
- `.running` → 'open'
- `.suspended` → 'connecting'
- `.canceling` → 'closing'
- `.completed` → 'closed'

**Event Flow:**
1. `connectWebSocket()` creates WebSocket task
2. Task resumes and immediately sends 'open' event
3. Background task continuously receives messages
4. Each message triggers 'message' event
5. Task cancellation or error triggers 'close' event

---

### Android Implementation

**Technology:** OkHttp WebSocket

**Key Components:**
- `activeWebSockets` - ConcurrentHashMap for connection management
- `WebSocketEventListener` - Inner class for WebSocket callbacks
- Uses existing `SSLSocketFactory` and `TrustManager` for mTLS
- OkHttp client builder for WebSocket

**Connection States:**
- WebSocket exists in `activeWebSockets` → 'open'
- WebSocket removed from `activeWebSockets` → 'closed'

**Event Flow:**
1. `connectWebSocket()` creates OkHttp client and WebSocket
2. `onOpen()` callback sends 'open' event
3. `onMessage()` callback sends 'message' event for each message
4. `onClosed()` callback sends 'close' event and removes from map
5. `onFailure()` callback sends 'error' event

---

## Type Definitions

### WebSocketOptions
```typescript
{
  url: string;           // WebSocket URL (wss:// or ws://)
  protocols?: string[];   // Optional list of subprotocols
}
```

### WebSocketConnectionResult
```typescript
{
  success: boolean;       // Connection success status
  connectionId: string;   // UUID for connection management
  error?: string;         // Error message if failed
}
```

### WebSocketEventPayload
```typescript
{
  connectionId: string;   // Connection ID
  type: 'open' | 'message' | 'close' | 'error';  // Event type
  data?: string;         // Message data (for 'message' event)
  code?: number;         // Close code (for 'close' event)
  reason?: string;       // Close reason (for 'close' event)
  error?: string;        // Error message (for 'error' event)
}
```

---

## WebSocket Close Codes

Common WebSocket close codes:

| Code | Meaning | Description |
|------|---------|-------------|
| 1000 | Normal Closure | Connection closed normally |
| 1001 | Going Away | Client/server is closing |
| 1002 | Protocol Error | WebSocket protocol error |
| 1003 | Unsupported Data | Received unsupported data type |
| 1006 | Abnormal Closure | Connection closed abnormally |
| 1007 | Invalid Data | Received invalid UTF-8 data |
| 1008 | Policy Violation | Message violates policy |
| 1009 | Message Too Big | Message is too large |
| 1010 | Missing Extension | Required extension not negotiated |
| 1011 | Internal Error | Server encountered internal error |
| 1015 | TLS Handshake | TLS handshake failed |

---

## Error Handling

### Common Errors

**NOT_CONFIGURED**
- Cause: Module not configured
- Solution: Call `configure()` and `storeCertificate()` first

**SSL not configured**
- Cause: SSL context not initialized
- Solution: Store certificate before connecting

**Connection not found**
- Cause: Invalid connectionId or connection already closed
- Solution: Verify connectionId is correct

**Network errors**
- Cause: Network connectivity issues
- Solution: Check network connection, verify server is reachable

**TLS handshake errors**
- Cause: Certificate validation failure
- Solution: Verify certificate validity, check server configuration

---

## Best Practices

### 1. Event Listener Cleanup
Always remove event listeners when unmounting components:
```typescript
useEffect(() => {
  const subscription = ExpoMutualTls.onWebSocketMessage((id, data) => {
    // Handle message
  });

  return () => subscription.remove(); // Cleanup
}, []);
```

### 2. Error Handling
Wrap WebSocket operations in try-catch:
```typescript
try {
  const connectionId = await ExpoMutualTls.connectWebSocket(url);
  // Use connection
} catch (error) {
  console.error('WebSocket error:', error);
  // Handle error
}
```

### 3. Connection State Management
Track connection state to prevent duplicate operations:
```typescript
const [isConnecting, setIsConnecting] = useState(false);

const connect = async () => {
  if (isConnecting) return;
  setIsConnecting(true);
  try {
    const connectionId = await ExpoMutualTls.connectWebSocket(url);
    setConnectionId(connectionId);
  } finally {
    setIsConnecting(false);
  }
};
```

### 4. Reconnection Logic
Implement exponential backoff for reconnection:
```typescript
const reconnect = async (attempt = 1) => {
  try {
    const connectionId = await ExpoMutualTls.connectWebSocket(url);
    return connectionId;
  } catch (error) {
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    return reconnect(attempt + 1);
  }
};
```

### 5. Message Validation
Validate messages before sending:
```typescript
const sendMessage = async (message: string) => {
  if (!connectionId) {
    console.warn('No active connection');
    return;
  }

  if (!message || message.length > 10000) {
    console.warn('Invalid message');
    return;
  }

  await ExpoMutualTls.sendWebSocketMessage(connectionId, message);
};
```

---

## Testing

### Manual Testing Checklist

- [ ] Connect to WebSocket with mTLS
- [ ] Verify 'open' event fires
- [ ] Send text message
- [ ] Verify 'message' event receives data
- [ ] Disconnect WebSocket
- [ ] Verify 'close' event fires with correct code
- [ ] Test connection with invalid URL
- [ ] Verify 'error' event fires
- [ ] Test multiple simultaneous connections
- [ ] Test WebSocket subprotocols
- [ ] Test connection state queries

### Automated Testing

```typescript
describe('WebSocket mTLS', () => {
  it('should connect with mTLS', async () => {
    await ExpoMutualTls.configureP12('test', true);
    await ExpoMutualTls.storeP12(p12Data, 'password');

    const connectionId = await ExpoMutualTls.connectWebSocket(wsUrl);
    expect(connectionId).toBeDefined();
  });

  it('should send and receive messages', async (done) => {
    ExpoMutualTls.onWebSocketMessage((id, data) => {
      expect(data).toBe('test message');
      done();
    });

    const connectionId = await ExpoMutualTls.connectWebSocket(wsUrl);
    await ExpoMutualTls.sendWebSocketMessage(connectionId, 'test message');
  });
});
```

---

## Migration Guide

### From Other WebSocket Libraries

If migrating from other WebSocket libraries:

**Before (react-native-websocket):**
```typescript
const ws = new WebSocket('wss://example.com/ws', {
  cert: certificateData,
  key: keyData
});
```

**After (expo-mutual-tls):**
```typescript
await ExpoMutualTls.configureP12('service', true);
await ExpoMutualTls.storeP12(p12Data, 'password');
const connectionId = await ExpoMutualTls.connectWebSocket('wss://example.com/ws');
```

### Event Listener Migration

**Before:**
```typescript
ws.onmessage = (event) => {
  console.log('Message:', event.data);
};
```

**After:**
```typescript
ExpoMutualTls.onWebSocketMessage((connectionId, data) => {
  console.log('Message:', data);
});
```

---

## Security Considerations

1. **Certificate Validation**
   - Always validate server certificates
   - Check certificate expiry
   - Verify certificate chain

2. **Secure URLs Only**
   - Use `wss://` (WebSocket Secure) instead of `ws://`
   - Verify URL is HTTPS/WSS
   - Validate server domain

3. **Certificate Storage**
   - Certificates stored in secure keychain/keystore
   - Use biometric authentication for sensitive apps
   - Implement certificate rotation

4. **Message Validation**
   - Validate incoming message format
   - Sanitize message content
   - Implement message size limits

5. **Error Handling**
   - Log security-related errors
   - Report certificate errors
   - Monitor for suspicious activity

---

## Performance Considerations

1. **Connection Pooling**
   - Reuse connections when possible
   - Limit number of simultaneous connections
   - Implement connection timeouts

2. **Message Batching**
   - Batch small messages together
   - Use efficient serialization
   - Minimize message size

3. **Event Listeners**
   - Remove unused listeners
   - Debounce rapid events
   - Throttle message processing

4. **Memory Management**
   - Disconnect unused connections
   - Clear message buffers
   - Clean up resources on unmount

---

## Troubleshooting

### Connection Issues

**Problem: WebSocket fails to connect**
- Verify mTLS certificate is stored
- Check server URL is correct (wss://)
- Ensure server accepts client certificates
- Check network connectivity

**Problem: Connection drops unexpectedly**
- Check server timeout settings
- Verify client certificate is valid
- Review server logs for errors
- Check network stability

### Message Issues

**Problem: Messages not received**
- Verify event listeners are attached
- Check connection is in 'open' state
- Ensure messages are being sent by server
- Review message format

**Problem: Messages fail to send**
- Check connection state before sending
- Verify message format is correct
- Check server message size limits
- Review error events

### Certificate Issues

**Problem: TLS handshake fails**
- Verify certificate is valid and not expired
- Check certificate has clientAuth EKU
- Verify server CA is trusted
- Test with different certificate

---

## Future Enhancements

Potential future improvements:

1. **Binary Message Support** - Dedicated methods for ArrayBuffer/Blob
2. **Ping/Pong** - Automatic keep-alive pings
3. **Compression** - WebSocket per-message compression
4. **Statistics** - Connection metrics and analytics
5. **Reconnection** - Built-in automatic reconnection logic
6. **Connection Pooling** - Managed connection pools
7. **Message Queuing** - Queue messages when disconnected
8. **Rate Limiting** - Automatic message throttling
9. **Retry Logic** - Configurable retry policies
10. **Advanced Options** - Custom headers, origin, etc.

---

## Support

- **Documentation**: README.md
- **Issues**: https://github.com/a-cube-io/expo-mutual-tls/issues
- **Examples**: example/ directory

---

**Implementation completed on**: 2026-01-22
**Version**: 1.0.5+
**Platform Support**: iOS 13+, Android 7.0+
