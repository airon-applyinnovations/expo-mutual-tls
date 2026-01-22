import { CertificateData, MakeRequestOptions, MakeRequestResult, ConfigureResult, DebugLogEventPayload, ErrorEventPayload, CertificateExpiryEventPayload, ParseCertificateResult } from "./ExpoMutualTls.types";
import ExpoMutualTlsModule from "./ExpoMutualTlsModule";
export * from "./ExpoMutualTls.types";
export declare class ExpoMutualTls {
    /**
     * Configure the mTLS module with P12 certificate
     * @param keychainService - Keychain service identifier
     * @param enableLogging - Enable debug logging
     */
    static configureP12(keychainService?: string, enableLogging?: boolean): Promise<ConfigureResult>;
    /**
     * Configure the mTLS module with PEM certificate
     * @param certService - Certificate service identifier
     * @param keyService - Private key service identifier
     * @param enableLogging - Enable debug logging
     */
    static configurePEM(certService?: string, keyService?: string, enableLogging?: boolean): Promise<ConfigureResult>;
    /**
     * Store P12 certificate with simple interface
     * @param p12Base64 - Base64 encoded P12 certificate
     * @param password - P12 password
     */
    static storeP12(p12Base64: string, password: string): Promise<boolean>;
    /**
     * Store PEM certificate with simple interface
     * @param certificate - PEM certificate content
     * @param privateKey - PEM private key content
     * @param passphrase - Optional passphrase for an encrypted private key
     */
    static storePEM(certificate: string, privateKey: string, passphrase?: string): Promise<boolean>;
    /**
     * Make authenticated mTLS request with simple interface
     * @param url - Target URL
     * @param options - Optional request configuration
     */
    static request(url: string, options?: Partial<MakeRequestOptions>): Promise<MakeRequestResult>;
    /**
     * Test mTLS connection to a URL
     * @param url - Target URL to test
     */
    static testConnection(url: string): Promise<MakeRequestResult>;
    /**
     * Get the current module state
     */
    static get isConfigured(): boolean;
    /**
     * Get current TLS state
     */
    static get currentState(): string;
    /**
     * Check if a certificate is stored
     */
    static hasCertificate(): Promise<boolean>;
    /**
     * Remove stored certificate
     */
    static removeCertificate(): Promise<void>;
    static onDebugLog(listener: (event: DebugLogEventPayload) => void): import("expo-modules-core/build/ts-declarations/EventEmitter").EventSubscription;
    static onError(listener: (event: ErrorEventPayload) => void): import("expo-modules-core/build/ts-declarations/EventEmitter").EventSubscription;
    static onCertificateExpiry(listener: (event: CertificateExpiryEventPayload) => void): import("expo-modules-core/build/ts-declarations/EventEmitter").EventSubscription;
    /**
     * Remove all event listeners
     */
    static removeAllListeners(): void;
    /**
     * Parse certificate and extract detailed information
     * @param certificateData - Certificate data (P12 or PEM format)
     * @returns Certificate information including subject, issuer, validity, etc.
     */
    static parseCertificate(certificateData: CertificateData): Promise<ParseCertificateResult>;
    /**
     * Parse P12 certificate with simple interface
     * @param p12Base64 - Base64 encoded P12 certificate
     * @param password - P12 password
     * @returns Certificate information
     */
    static parseCertificateP12(p12Base64: string, password: string): Promise<ParseCertificateResult>;
    /**
     * Parse PEM certificate with simple interface
     * @param certificate - PEM certificate content
     * @returns Certificate information
     */
    static parseCertificatePEM(certificate: string): Promise<ParseCertificateResult>;
    /**
     * Get certificate information from stored certificates
     * @returns Certificate information for all stored certificates
     */
    static getCertificatesInfo(): Promise<ParseCertificateResult>;
    /**
     * Connect to a WebSocket server with mTLS authentication
     * @param url - WebSocket URL (wss:// or ws://)
     * @param protocols - Optional list of WebSocket subprotocols
     * @returns Connection ID for managing the WebSocket connection
     */
    static connectWebSocket(url: string, protocols?: string[]): Promise<string>;
    /**
     * Disconnect from a WebSocket server
     * @param connectionId - Connection ID returned from connectWebSocket
     */
    static disconnectWebSocket(connectionId: string): Promise<void>;
    /**
     * Send a message through the WebSocket connection
     * @param connectionId - Connection ID returned from connectWebSocket
     * @param message - Message string to send
     */
    static sendWebSocketMessage(connectionId: string, message: string): Promise<void>;
    /**
     * Get the current state of a WebSocket connection
     * @param connectionId - Connection ID returned from connectWebSocket
     * @returns Connection state: 'connecting', 'open', 'closing', or 'closed'
     */
    static getWebSocketState(connectionId: string): Promise<string>;
    /**
     * Listen for WebSocket connection open events
     * @param callback - Callback function with connectionId parameter
     * @returns Event subscription for removing the listener
     */
    static onWebSocketOpen(callback: (connectionId: string) => void): import("expo-modules-core/build/ts-declarations/EventEmitter").EventSubscription;
    /**
     * Listen for WebSocket message events
     * @param callback - Callback function with connectionId and message data
     * @returns Event subscription for removing the listener
     */
    static onWebSocketMessage(callback: (connectionId: string, data: string) => void): import("expo-modules-core/build/ts-declarations/EventEmitter").EventSubscription;
    /**
     * Listen for WebSocket connection close events
     * @param callback - Callback function with connectionId, close code, and reason
     * @returns Event subscription for removing the listener
     */
    static onWebSocketClose(callback: (connectionId: string, code?: number, reason?: string) => void): import("expo-modules-core/build/ts-declarations/EventEmitter").EventSubscription;
    /**
     * Listen for WebSocket error events
     * @param callback - Callback function with connectionId and error message
     * @returns Event subscription for removing the listener
     */
    static onWebSocketError(callback: (connectionId: string, error: string) => void): import("expo-modules-core/build/ts-declarations/EventEmitter").EventSubscription;
}
export default ExpoMutualTls;
export { ExpoMutualTlsModule as ExpoMutualTlsModuleRaw };
//# sourceMappingURL=index.d.ts.map