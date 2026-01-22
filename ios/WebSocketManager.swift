// Copyright 2024-present Acube. All rights reserved.

import Foundation

internal class WebSocketManager {
    private var activeConnections: [String: URLSessionWebSocketTask] = [:]
    private var messageTasks: [String: Task<Void, Error>] = [:]
    private var sslContextManager: SSLContextManager
    private var sessionDelegate: ExpoMutualTlsURLSessionDelegate

    init(sslContextManager: SSLContextManager, sessionDelegate: ExpoMutualTlsURLSessionDelegate) {
        self.sslContextManager = sslContextManager
        self.sessionDelegate = sessionDelegate
    }

    // Connect to WebSocket with mTLS
    func connectWebSocket(url: String, protocols: [String]?, moduleId: ExpoMutualTlsModule) async throws -> String {
        guard let wsURL = URL(string: url) else {
            throw ExpoMutualTlsError.invalidURL(url)
        }

        let connectionId = UUID().uuidString

        // Create URLSession with mTLS support
        guard let session = sslContextManager.getURLSession() else {
            throw ExpoMutualTlsError.sslHandshakeFailed("SSL context not initialized")
        }

        // Create WebSocket task
        var task: URLSessionWebSocketTask
        if let protocols = protocols, !protocols.isEmpty {
            task = session.webSocketTask(with: wsURL, protocols: protocols)
        } else {
            task = session.webSocketTask(with: wsURL)
        }

        // Store connection
        activeConnections[connectionId] = task

        // Start connection
        task.resume()

        // Send open event
        moduleId.sendWebSocketEvent(
            connectionId: connectionId,
            type: "open",
            data: nil,
            code: nil,
            reason: nil,
            error: nil
        )

        // Start receiving messages in background task
        startReceiving(task: task, connectionId: connectionId, moduleId: moduleId)

        return connectionId
    }

    // Disconnect WebSocket
    func disconnectWebSocket(connectionId: String) async throws {
        guard let task = activeConnections.removeValue(forKey: connectionId) else {
            throw ExpoMutualTlsError.unknownError("Connection not found: \(connectionId)")
        }

        // Cancel message receiving task
        if let messageTask = messageTasks.removeValue(forKey: connectionId) {
            messageTask.cancel()
        }

        task.cancel(with: .goingAway, reason: nil)
    }

    // Send message
    func sendMessage(connectionId: String, message: String) async throws {
        guard let task = activeConnections[connectionId] else {
            throw ExpoMutualTlsError.unknownError("Connection not found: \(connectionId)")
        }

        let message = URLSessionWebSocketTask.Message.string(message)
        try await task.send(message)
    }

    // Get connection state
    func getConnectionState(connectionId: String) -> String? {
        guard let task = activeConnections[connectionId] else {
            return nil
        }

        switch task.state {
        case .running: return "open"
        case .suspended: return "connecting"
        case .canceling: return "closing"
        case .completed: return "closed"
        @unknown default: return "unknown"
        }
    }

    // Start receiving messages in background
    private func startReceiving(
        task: URLSessionWebSocketTask,
        connectionId: String,
        moduleId: ExpoMutualTlsModule
    ) {
        let messageTask = Task<Void, Error> {
            do {
                while !Task.isCancelled && task.state == .running {
                    let message = try await task.receive()

                    switch message {
                    case .string(let text):
                        moduleId.sendWebSocketEvent(
                            connectionId: connectionId,
                            type: "message",
                            data: text,
                            code: nil,
                            reason: nil,
                            error: nil
                        )
                    case .data(let data):
                        // Binary data - send as base64
                        let base64 = data.base64EncodedString()
                        moduleId.sendWebSocketEvent(
                            connectionId: connectionId,
                            type: "message",
                            data: base64,
                            code: nil,
                            reason: nil,
                            error: nil
                        )
                    @unknown default:
                        break
                    }
                }
            } catch {
                // Check if cancelled (normal close)
                if !Task.isCancelled {
                    // Send error event
                    moduleId.sendWebSocketEvent(
                        connectionId: connectionId,
                        type: "error",
                        data: nil,
                        code: nil,
                        reason: nil,
                        error: error.localizedDescription
                    )
                }
            }

            // Send close event when connection ends
            moduleId.sendWebSocketEvent(
                connectionId: connectionId,
                type: "close",
                data: nil,
                code: nil,
                reason: nil,
                error: nil
            )
        }

        messageTasks[connectionId] = messageTask
    }
}
