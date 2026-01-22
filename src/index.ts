import {
  MutualTlsConfig,
  P12CertificateData,
  PemCertificateData,
  CertificateData,
  MakeRequestOptions,
  MakeRequestResult,
  ConfigureResult,
  DebugLogEventPayload,
  ErrorEventPayload,
  CertificateExpiryEventPayload,
  ParseCertificateResult,
} from "./ExpoMutualTls.types";
import ExpoMutualTlsModule from "./ExpoMutualTlsModule";

// Re-export types for convenience
export * from "./ExpoMutualTls.types";

// Simple utility functions for common operations
export class ExpoMutualTls {
  /**
   * Configure the mTLS module with P12 certificate
   * @param keychainService - Keychain service identifier
   * @param enableLogging - Enable debug logging
   */
  static async configureP12(
    keychainService: string = "client.p12",
    enableLogging: boolean = false,
  ): Promise<ConfigureResult> {
    const config: MutualTlsConfig = {
      certificateFormat: "p12",
      keychainServiceForP12: keychainService,
      keychainServiceForPassword: `${keychainService}.password`,
      enableLogging,
    };
    return ExpoMutualTlsModule.configure(config);
  }

  /**
   * Configure the mTLS module with PEM certificate
   * @param certService - Certificate service identifier
   * @param keyService - Private key service identifier
   * @param enableLogging - Enable debug logging
   */
  static async configurePEM(
    certService: string = "expo.mtls.client.cert",
    keyService: string = "expo.mtls.client.key",
    enableLogging: boolean = false,
  ): Promise<ConfigureResult> {
    const config: MutualTlsConfig = {
      certificateFormat: "pem",
      keychainServiceForCertChain: certService,
      keychainServiceForPrivateKey: keyService,
      enableLogging,
    };
    return ExpoMutualTlsModule.configure(config);
  }

  /**
   * Store P12 certificate with simple interface
   * @param p12Base64 - Base64 encoded P12 certificate
   * @param password - P12 password
   */
  static async storeP12(p12Base64: string, password: string): Promise<boolean> {
    const certData: P12CertificateData = { p12Data: p12Base64, password };
    return ExpoMutualTlsModule.storeCertificate(certData);
  }

  /**
   * Store PEM certificate with simple interface
   * @param certificate - PEM certificate content
   * @param privateKey - PEM private key content
   * @param passphrase - Optional passphrase for an encrypted private key
   */
  static async storePEM(
    certificate: string,
    privateKey: string,
    passphrase?: string,
  ): Promise<boolean> {
    const certData: PemCertificateData = {
      certificate,
      privateKey,
      passphrase,
    };
    return ExpoMutualTlsModule.storeCertificate(certData);
  }

  /**
   * Make authenticated mTLS request with simple interface
   * @param url - Target URL
   * @param options - Optional request configuration
   */
  static async request(
    url: string,
    options: Partial<MakeRequestOptions> = {},
  ): Promise<MakeRequestResult> {
    const requestOptions: MakeRequestOptions = { url, ...options };
    return ExpoMutualTlsModule.makeRequest(requestOptions);
  }

  /**
   * Test mTLS connection to a URL
   * @param url - Target URL to test
   */
  static async testConnection(url: string): Promise<MakeRequestResult> {
    return ExpoMutualTlsModule.testConnection(url);
  }

  /**
   * Get the current module state
   */
  static get isConfigured(): boolean {
    return ExpoMutualTlsModule.isConfigured;
  }

  /**
   * Get current TLS state
   */
  static get currentState(): string {
    return ExpoMutualTlsModule.currentState;
  }

  /**
   * Check if a certificate is stored
   */
  static async hasCertificate(): Promise<boolean> {
    return ExpoMutualTlsModule.hasCertificate();
  }

  /**
   * Remove stored certificate
   */
  static async removeCertificate(): Promise<void> {
    return ExpoMutualTlsModule.removeCertificate();
  }

  // Event handling utilities
  static onDebugLog(listener: (event: DebugLogEventPayload) => void) {
    return ExpoMutualTlsModule.addListener("onDebugLog", listener);
  }

  static onError(listener: (event: ErrorEventPayload) => void) {
    return ExpoMutualTlsModule.addListener("onError", listener);
  }

  static onCertificateExpiry(
    listener: (event: CertificateExpiryEventPayload) => void,
  ) {
    return ExpoMutualTlsModule.addListener("onCertificateExpiry", listener);
  }

  /**
   * Remove all event listeners
   */
  static removeAllListeners() {
    ExpoMutualTlsModule.removeAllListeners("onDebugLog");
    ExpoMutualTlsModule.removeAllListeners("onError");
    ExpoMutualTlsModule.removeAllListeners("onCertificateExpiry");
    ExpoMutualTlsModule.removeAllListeners("onWebSocketEvent");
  }

  /**
   * Parse certificate and extract detailed information
   * @param certificateData - Certificate data (P12 or PEM format)
   * @returns Certificate information including subject, issuer, validity, etc.
   */
  static async parseCertificate(
    certificateData: CertificateData,
  ): Promise<ParseCertificateResult> {
    return ExpoMutualTlsModule.parseCertificate(certificateData);
  }

  /**
   * Parse P12 certificate with simple interface
   * @param p12Base64 - Base64 encoded P12 certificate
   * @param password - P12 password
   * @returns Certificate information
   */
  static async parseCertificateP12(
    p12Base64: string,
    password: string,
  ): Promise<ParseCertificateResult> {
    const certData: P12CertificateData = { p12Data: p12Base64, password };
    return ExpoMutualTlsModule.parseCertificate(certData);
  }

  /**
   * Parse PEM certificate with simple interface
   * @param certificate - PEM certificate content
   * @returns Certificate information
   */
  static async parseCertificatePEM(
    certificate: string,
  ): Promise<ParseCertificateResult> {
    const certData: PemCertificateData = {
      certificate,
      privateKey: "", // Not needed for parsing, only certificate info
    };
    return ExpoMutualTlsModule.parseCertificate(certData);
  }

  /**
   * Get certificate information from stored certificates
   * @returns Certificate information for all stored certificates
   */
  static async getCertificatesInfo(): Promise<ParseCertificateResult> {
    return ExpoMutualTlsModule.getCertificatesInfo();
  }

  // WebSocket Methods

  /**
   * Connect to a WebSocket server with mTLS authentication
   * @param url - WebSocket URL (wss:// or ws://)
   * @param protocols - Optional list of WebSocket subprotocols
   * @returns Connection ID for managing the WebSocket connection
   */
  static async connectWebSocket(
    url: string,
    protocols?: string[]
  ): Promise<string> {
    const result = await ExpoMutualTlsModule.connectWebSocket({ url, protocols });
    if (result.success) {
      return result.connectionId;
    }
    throw new Error(result.error || "Failed to connect WebSocket");
  }

  /**
   * Disconnect from a WebSocket server
   * @param connectionId - Connection ID returned from connectWebSocket
   */
  static async disconnectWebSocket(connectionId: string): Promise<void> {
    return ExpoMutualTlsModule.disconnectWebSocket(connectionId);
  }

  /**
   * Send a message through the WebSocket connection
   * @param connectionId - Connection ID returned from connectWebSocket
   * @param message - Message string to send
   */
  static async sendWebSocketMessage(
    connectionId: string,
    message: string
  ): Promise<void> {
    return ExpoMutualTlsModule.sendWebSocketMessage(connectionId, message);
  }

  /**
   * Get the current state of a WebSocket connection
   * @param connectionId - Connection ID returned from connectWebSocket
   * @returns Connection state: 'connecting', 'open', 'closing', or 'closed'
   */
  static async getWebSocketState(connectionId: string): Promise<string> {
    return ExpoMutualTlsModule.getWebSocketState(connectionId);
  }

  // WebSocket Event Listeners

  /**
   * Listen for WebSocket connection open events
   * @param callback - Callback function with connectionId parameter
   * @returns Event subscription for removing the listener
   */
  static onWebSocketOpen(callback: (connectionId: string) => void) {
    return ExpoMutualTlsModule.addListener("onWebSocketEvent", (event) => {
      if (event.type === "open") callback(event.connectionId);
    });
  }

  /**
   * Listen for WebSocket message events
   * @param callback - Callback function with connectionId and message data
   * @returns Event subscription for removing the listener
   */
  static onWebSocketMessage(
    callback: (connectionId: string, data: string) => void
  ) {
    return ExpoMutualTlsModule.addListener("onWebSocketEvent", (event) => {
      if (event.type === "message") callback(event.connectionId, event.data || "");
    });
  }

  /**
   * Listen for WebSocket connection close events
   * @param callback - Callback function with connectionId, close code, and reason
   * @returns Event subscription for removing the listener
   */
  static onWebSocketClose(
    callback: (
      connectionId: string,
      code?: number,
      reason?: string
    ) => void
  ) {
    return ExpoMutualTlsModule.addListener("onWebSocketEvent", (event) => {
      if (event.type === "close") {
        callback(event.connectionId, event.code, event.reason);
      }
    });
  }

  /**
   * Listen for WebSocket error events
   * @param callback - Callback function with connectionId and error message
   * @returns Event subscription for removing the listener
   */
  static onWebSocketError(callback: (connectionId: string, error: string) => void) {
    return ExpoMutualTlsModule.addListener("onWebSocketEvent", (event) => {
      if (event.type === "error") callback(event.connectionId, event.error || "");
    });
  }
}

// Export both the utility class and the raw module for advanced usage
export default ExpoMutualTls;
export { ExpoMutualTlsModule as ExpoMutualTlsModuleRaw };
