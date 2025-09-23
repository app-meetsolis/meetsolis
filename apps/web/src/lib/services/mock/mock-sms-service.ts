import { SMSService, ServiceStatus, ServiceInfo } from '@meetsolis/shared';
import { BaseService } from '../base-service';

interface SMSMessage {
  id: string;
  to: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export class MockSMSService extends BaseService implements SMSService {
  private sentMessages: SMSMessage[] = [];
  private messageCounter = 0;

  constructor() {
    super();
    this.enableFallbackMode();
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Mock SMS Service',
      version: '1.0.0',
      description: 'Mock SMS service with console logging and delivery status simulation',
      dependencies: [],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    await new Promise(resolve => setTimeout(resolve, 60));

    return {
      status: 'healthy',
      responseTime: 60,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log(`[MockSMSService] Sending SMS to ${to}:`, message);

    this.messageCounter++;

    // Validate phone number format (basic validation)
    if (!this.isValidPhoneNumber(to)) {
      throw new Error(`Invalid phone number format: ${to}`);
    }

    // Validate message length
    if (message.length > 160) {
      console.warn('[MockSMSService] Message exceeds 160 characters, will be sent as multiple SMS');
    }

    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const smsMessage: SMSMessage = {
      id: `mock-sms-${this.messageCounter}`,
      to,
      message,
      timestamp: new Date(),
      status: 'pending',
    };

    this.sentMessages.push(smsMessage);

    // Simulate delivery status updates
    setTimeout(() => {
      smsMessage.status = 'sent';
      console.log(`[MockSMSService] SMS ${smsMessage.id} status: sent`);
    }, 1000);

    setTimeout(() => {
      // 95% success rate simulation
      smsMessage.status = Math.random() > 0.05 ? 'delivered' : 'failed';
      console.log(`[MockSMSService] SMS ${smsMessage.id} status: ${smsMessage.status}`);
    }, 3000);

    // Log to console for development visibility
    console.log(`📱 SMS Sent to ${to}: ${message}`);
    console.log(`   Message ID: ${smsMessage.id}`);
    console.log(`   Character count: ${message.length}`);
    console.log(`   Estimated cost: $${this.calculateCost(message)}`);

    return true;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s()-]/g, ''));
  }

  private calculateCost(message: string): string {
    // Simulate SMS cost calculation (typical SMS pricing)
    const segmentCount = Math.ceil(message.length / 160);
    const costPerSegment = 0.0075; // $0.0075 per SMS segment
    return (segmentCount * costPerSegment).toFixed(4);
  }

  // Mock-specific methods
  getSentMessages(): SMSMessage[] {
    return [...this.sentMessages];
  }

  getMessageById(id: string): SMSMessage | undefined {
    return this.sentMessages.find(msg => msg.id === id);
  }

  getMessagesByPhoneNumber(phoneNumber: string): SMSMessage[] {
    return this.sentMessages.filter(msg => msg.to === phoneNumber);
  }

  clearMessageHistory(): void {
    this.sentMessages = [];
    this.messageCounter = 0;
  }

  getMessageCount(): number {
    return this.sentMessages.length;
  }

  getDeliveryStats(): { total: number; sent: number; delivered: number; failed: number } {
    const stats = {
      total: this.sentMessages.length,
      sent: 0,
      delivered: 0,
      failed: 0,
    };

    this.sentMessages.forEach(msg => {
      switch (msg.status) {
        case 'sent':
          stats.sent++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }
    });

    return stats;
  }

  // Utility methods for testing
  simulateMessageFailure(messageId: string): void {
    const message = this.getMessageById(messageId);
    if (message) {
      message.status = 'failed';
      console.log(`[MockSMSService] Simulated failure for message ${messageId}`);
    }
  }

  simulateDeliveryDelay(messageId: string, delayMs: number): void {
    const message = this.getMessageById(messageId);
    if (message) {
      setTimeout(() => {
        message.status = 'delivered';
        console.log(`[MockSMSService] Delayed delivery for message ${messageId}`);
      }, delayMs);
    }
  }
}