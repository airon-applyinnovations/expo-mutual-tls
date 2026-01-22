import { NativeModule, requireNativeModule } from "expo";

import {
  ExpoMutualTlsModuleEvents,
  MutualTlsConfig,
  StoreCertificateOptions,
  MakeRequestOptions,
  MakeRequestResult,
  ConfigureResult,
  CertificateData,
  ParseCertificateResult,
  WebSocketOptions,
  WebSocketConnectionResult,
} from "./ExpoMutualTls.types";

declare class ExpoMutualTlsModule extends NativeModule<ExpoMutualTlsModuleEvents> {
  configure(config: MutualTlsConfig): Promise<ConfigureResult>;
  storeCertificate(options: StoreCertificateOptions): Promise<boolean>;
  storeP12Certificate(p12Base64: string, password: string): Promise<boolean>;
  removeCertificate(): Promise<void>;
  hasCertificate(): Promise<boolean>;
  parseCertificate(
    certificateData: CertificateData,
  ): Promise<ParseCertificateResult>;
  getCertificatesInfo(): Promise<ParseCertificateResult>;
  testConnection(url: string): Promise<MakeRequestResult>;
  makeRequest(options: MakeRequestOptions): Promise<MakeRequestResult>;
  isConfigured: boolean;
  currentState: string;

  // WebSocket methods
  connectWebSocket(options: WebSocketOptions): Promise<WebSocketConnectionResult>;
  disconnectWebSocket(connectionId: string): Promise<void>;
  sendWebSocketMessage(connectionId: string, message: string): Promise<void>;
  getWebSocketState(connectionId: string): Promise<string>;  // 'connecting' | 'open' | 'closing' | 'closed'
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoMutualTlsModule>("ExpoMutualTls");
