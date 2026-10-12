import TcpSocket from 'react-native-tcp-socket';
import { TcpPacket } from './embedded-host';

type EventHandler = (data: any) => void;
type AckCallback = (response: any) => void;

export class UnifiedClientSocket {
  private socket: any = null; // TcpSocket.Socket
  public connected: boolean = false;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private ackCallbacks: Map<string, AckCallback> = new Map();
  private buffer: string = '';
  private nextReqId: number = 1;

  public connect(host: string, port: number = 3000): Promise<boolean> {
    this.disconnect();

    return new Promise((resolve) => {
      try {
        const socket = TcpSocket.createConnection({ host, port }, () => {
          this.connected = true;
          this.emitInternal('connect', {});
          resolve(true);
        });

        this.socket = socket;
        socket.setNoDelay(true);
        socket.setKeepAlive(true);

        socket.on('data', (data: any) => {
          const raw = typeof data === 'string' ? data : data.toString('utf8');
          this.buffer += raw;
          const lines = this.buffer.split('\n');
          this.buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const packet: TcpPacket = JSON.parse(line);
              if (packet.event === 'ack' && packet.id && this.ackCallbacks.has(packet.id)) {
                const ack = this.ackCallbacks.get(packet.id);
                this.ackCallbacks.delete(packet.id);
                ack?.(packet.payload);
              } else {
                this.emitInternal(packet.event, packet.payload);
              }
            } catch (err) {
              console.warn('[TcpClient] JSON parse error:', err);
            }
          }
        });

        socket.on('error', (err: any) => {
          this.connected = false;
          this.emitInternal('connect_error', err);
          resolve(false);
        });

        socket.on('close', () => {
          this.connected = false;
          this.emitInternal('disconnect', {});
        });
      } catch (err) {
        this.connected = false;
        this.emitInternal('connect_error', err);
        resolve(false);
      }
    });
  }

  public on(event: string, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  public off(event: string, handler?: EventHandler) {
    if (!handler) {
      this.eventHandlers.delete(event);
    } else {
      this.eventHandlers.get(event)?.delete(handler);
    }
  }

  public once(event: string, handler: EventHandler) {
    const wrapper = (data: any) => {
      this.off(event, wrapper);
      handler(data);
    };
    this.on(event, wrapper);
  }

  public emit(event: string, payload?: any, ack?: AckCallback) {
    if (!this.socket || !this.connected) {
      if (ack) ack({ success: false, error: 'Socket not connected' });
      return;
    }

    const reqId = ack ? `req_${this.nextReqId++}` : undefined;
    if (reqId && ack) {
      this.ackCallbacks.set(reqId, ack);
      // Auto-cleanup timeout for ack
      setTimeout(() => {
        if (this.ackCallbacks.has(reqId)) {
          this.ackCallbacks.delete(reqId);
          ack({ success: false, error: 'Request timeout' });
        }
      }, 7000);
    }

    const packet: TcpPacket = {
      event,
      payload,
      id: reqId,
    };

    try {
      this.socket.write(JSON.stringify(packet) + '\n', 'utf8');
    } catch (err) {
      console.warn('[TcpClient] Write failed:', err);
      if (reqId && ack) {
        this.ackCallbacks.delete(reqId);
        ack({ success: false, error: 'Write error' });
      }
    }
  }

  private emitInternal(event: string, payload: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const h of handlers) {
        try {
          h(payload);
        } catch (e) {
          console.warn(`[TcpClient] Handler error for event ${event}:`, e);
        }
      }
    }
  }

  public disconnect() {
    if (this.socket) {
      try {
        this.socket.destroy();
      } catch {}
      this.socket = null;
    }
    this.connected = false;
    this.ackCallbacks.clear();
    this.buffer = '';
  }
}
