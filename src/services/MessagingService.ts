import apiService from './ApiService';

export class MessagingService {
  private static readonly BASE_URL = '/messaging';

  public static async sendInstallmentMessage(installmentId: number): Promise<void> {
    try {
      await apiService.post(`${this.BASE_URL}/installment`, {
        installment_id: installmentId
      });
    } catch (error) {
      console.error('Error sending installment message:', error);
      throw error;
    }
  }

  public static async sendInvoiceMessage(movementId: number): Promise<void> {
    try {
      await apiService.post(`${this.BASE_URL}/invoice`, {
        movement_id: movementId
      });
    } catch (error) {
      console.error('Error sending invoice message:', error);
      throw error;
    }
  }
}