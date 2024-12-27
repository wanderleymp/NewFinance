import { UsersResponse } from '../types/user';
import apiService from './ApiService';

export class UserService {
  private static readonly BASE_URL = '/users';

  public static async getUsers(page: number = 1, perPage: number = 10): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      return await apiService.get<UsersResponse>(`${this.BASE_URL}?${params.toString()}`);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  public static async deleteUser(userId: number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_URL}/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}