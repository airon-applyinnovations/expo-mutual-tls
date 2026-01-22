# WebSocket with mTLS - Implementation Checklist

## ✅ Phase 1: TypeScript Layer

### Files Modified:
- [x] `src/ExpoMutualTls.types.ts`
  - Added `onWebSocketEvent` to `ExpoMutualTlsModuleEvents`
  - Added `WebSocketOptions` type
  - Added `WebSocketMessage` type
  - Added `WebSocketConnectionResult` type
  - Added `WebSocketEventPayload` type

- [x] `src/ExpoMutualTlsModule.ts`
  - Updated `ExpoMutualTlsModule` interface to include WebSocket methods:
    - `connectWebSocket(options: WebSocketOptions): Promise<WebSocketConnectionResult>`
    - `disconnectWebSocket(connectionId: string): Promise<void>`
    - `sendWebSocketMessage(connectionId: string, message: string): Promise<void>`
    - `getWebSocketState(connectionId: string): Promise<string>`

- [x] `src/index.ts`
  - Updated `removeAllListeners()` to include `onWebSocketEvent`
  - Added `connectWebSocket()` utility method
  - Added `disconnectWebSocket()` utility method
  - Added `sendWebSocketMessage()` utility method
  - Added `getWebSocketState()` utility method
  - Added `onWebSocketOpen()` event listener
  - Added `onWebSocketMessage()` event listener
  - Added `onWebSocketClose()` event listener
  - Added `onWebSocketError()` event listener

---

## ✅ Phase 2: iOS Implementation (Swift)

### Files Created:
- [x] `ios/WebSocketManager.swift`
  - Created `WebSocketManager` class
  - Implemented `connectWebSocket()` with mTLS support
  - Implemented `disconnectWebSocket()` for connection cleanup
  - Implemented `sendMessage()` for sending text messages
  - Implemented `getConnectionState()` for state queries
  - Implemented `startReceiving()` for background message handling
  - Integrated with existing `SSLContextManager` for mTLS
  - Thread-safe connection management using dictionaries

### Files Modified:
- [x] `ios/ExpoMutualTlsModule.swift`
  - Added `webSocketManager` instance property
  - Added `connectWebSocket` async function to module definition
  - Added `disconnectWebSocket` async function to module definition
  - Added `sendWebSocketMessage` async function to module definition
  - Added `getWebSocketState` async function to module definition
  - Updated `Events` to include `onWebSocketEvent`
  - Added `sendWebSocketEvent()` internal helper method

---

## ✅ Phase 3: Android Implementation (Kotlin)

### Files Modified:
- [x] `android/src/main/java/expo/modules/mutualtls/ExpoMutualTlsModule.kt`
  - Added `activeWebSockets` ConcurrentHashMap to companion object
  - Added `connectWebSocket` async function to module definition
  - Added `disconnectWebSocket` async function to module definition
  - Added `sendWebSocketMessage` async function to module definition
  - Added `getWebSocketState` async function to module definition
  - Updated `Events` to include `onWebSocketEvent`
  - Added `sendWebSocketEvent()` internal helper function
  - Created `WebSocketEventListener` inner class with callbacks:
    - `onOpen()` - Emits 'open' event
    - `onMessage()` - Emits 'message' event
    - `onMessage(bytes)` - Handles binary data (base64)
    - `onClosing()` - Logs closing event
    - `onClosed()` - Emits 'close' event
    - `onFailure()` - Emits 'error' event

---

## ✅ Phase 4: Testing & Documentation

### Files Created:
- [x] `WEBSOCKET_IMPLEMENTATION.md` - Comprehensive implementation documentation

### Files Modified:
- [x] `example/App.tsx`
  - Added `wsConnectionId` state
  - Added `wsStatus` state
  - Added WebSocket event listeners in `useEffect`:
    - `onWebSocketOpen`
    - `onWebSocketMessage`
    - `onWebSocketClose`
    - `onWebSocketError`
  - Added `connectWebSocket()` function
  - Added `disconnectWebSocket()` function
  - Added `sendWebSocketMessage()` function
  - Added `checkWebSocketState()` function
  - Added WebSocket UI group with:
    - WebSocket status display
    - Connect button
    - Send message button
    - Check state button
    - Disconnect button
  - Added WebSocket status styles:
    - `wsStatusContainer`
    - `wsStatusLabel`
    - `wsStatusText`
    - `wsStatusConnected`

---

## Summary of Changes

### TypeScript Layer (3 files)
- Added 5 new types for WebSocket operations
- Added 4 new native module method declarations
- Added 9 new public utility methods
- Updated event listener cleanup

### iOS Layer (2 files: 1 new, 1 modified)
- Created `WebSocketManager.swift` (~170 lines)
- Integrated with existing `SSLContextManager`
- Added 4 module functions
- Added event emission helper
- Uses `URLSessionWebSocketTask` for WebSocket
- Thread-safe connection management

### Android Layer (1 file modified)
- Added WebSocket connection management
- Created `WebSocketEventListener` inner class
- Added 4 module functions
- Added event emission helper
- Uses OkHttp WebSocket
- Thread-safe with `ConcurrentHashMap`

### Example App (1 file modified)
- Added WebSocket demo functionality
- Added WebSocket UI components
- Integrated WebSocket event listeners
- Added example usage patterns

---

## Files Changed Summary

```
src/ExpoMutualTls.types.ts         (+30 lines) - New WebSocket types
src/ExpoMutualTlsModule.ts         (+10 lines) - Native module interface
src/index.ts                          (+95 lines) - Public API methods
ios/WebSocketManager.swift              (~170 lines) - NEW FILE
ios/ExpoMutualTlsModule.swift          (+90 lines) - Module integration
android/.../ExpoMutualTlsModule.kt   (+140 lines) - Android implementation
example/App.tsx                       (+130 lines) - Demo code
WEBSOCKET_IMPLEMENTATION.md              (~600 lines) - NEW DOCUMENTATION
```

---

## Testing Instructions

### 1. Build TypeScript
```bash
cd /Users/aird/Projects/ApplyInnovations/expo-mutual-tls
npm run build
```

### 2. Build iOS
```bash
cd example
npx expo run:ios
```

### 3. Build Android
```bash
cd example
npx expo run:android
```

### 4. Test WebSocket
1. Open example app
2. Configure P12/PEM certificate
3. Store certificate
4. Navigate to "WebSocket" section
5. Update `wss://your-websocket-server.com/ws` with actual server URL
6. Click "Connect WebSocket"
7. Verify connection opens (status turns green)
8. Click "Send Message"
9. Verify message appears in logs
10. Click "Disconnect WebSocket"
11. Verify connection closes

---

## Key Features Implemented

✅ **mTLS Authentication** - Reuses existing certificate infrastructure
✅ **Multiple Connections** - UUID-based connection management
✅ **Text Messages** - Full support for text WebSocket messages
✅ **Binary Messages** - Base64 encoding for binary data (Android)
✅ **Subprotocols** - WebSocket subprotocol support
✅ **Event Model** - Unified event system with connectionId
✅ **State Management** - Query connection state anytime
✅ **Error Handling** - Comprehensive error events
✅ **Thread Safety** - Concurrent operations safe
✅ **Type Safety** - Full TypeScript types
✅ **Documentation** - Complete API reference
✅ **Example Code** - React integration example

---

## API Compliance

### Standard WebSocket API
- ✅ `connect()` - Yes (`connectWebSocket`)
- ✅ `send()` - Yes (`sendWebSocketMessage`)
- ✅ `close()` - Yes (`disconnectWebSocket`)
- ✅ `onopen` - Yes (`onWebSocketOpen`)
- ✅ `onmessage` - Yes (`onWebSocketMessage`)
- ✅ `onclose` - Yes (`onWebSocketClose`)
- ✅ `onerror` - Yes (`onWebSocketError`)

### mTLS Requirements
- ✅ Certificate storage (P12/PEM)
- ✅ Certificate validation
- ✅ SSL context reuse
- ✅ Secure keychain/keystore

---

## Next Steps

### Before Release:
1. [ ] Test on physical iOS device
2. [ ] Test on physical Android device
3. [ ] Verify wss:// URL handling
4. [ ] Test with multiple concurrent connections
5. [ ] Test connection timeout scenarios
6. [ ] Verify memory cleanup on disconnect
7. [ ] Test certificate expiry handling
8. [ ] Verify subprotocol negotiation

### After Release:
1. [ ] Add automated unit tests
2. [ ] Add integration tests
3. [ ] Performance benchmarking
4. [ ] Add binary message utility methods
5. [ ] Add reconnection helper utility

---

## Dependencies

### iOS
- **Existing:** URLSession, Foundation, Security
- **New:** None (uses existing URLSessionWebSocketTask)

### Android
- **Existing:** OkHttp, Android Keystore
- **New:** None (uses existing OkHttp WebSocket)

### TypeScript/JavaScript
- **Existing:** expo, react-native
- **New:** None (uses existing event system)

---

## Breaking Changes

**NONE** - All changes are backward compatible.

---

## Migration from Previous Version

No migration needed. WebSocket support is purely additive. Existing HTTP/mTLS functionality remains unchanged.

---

## Support

For issues or questions:
- GitHub: https://github.com/a-cube-io/expo-mutual-tls/issues
- Documentation: WEBSOCKET_IMPLEMENTATION.md
- Examples: example/App.tsx (WebSocket section)

---

**Implementation Status**: ✅ COMPLETE
**Ready for**: Testing & Release
**Version**: 1.0.5+
**Date**: 2026-01-22
