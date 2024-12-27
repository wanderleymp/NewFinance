import apiService from './ApiService';
import { Person, PersonsResponse } from '../types/person';

export class PersonService {
  private static readonly BASE_URL = '/persons';

  public static async getPersons(page: number = 1, limit: number = 10, search?: string): Promise<PersonsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    return await apiService.get<PersonsResponse>(`${this.BASE_URL}?${params.toString()}`);
  }

  public static async getPerson(id: number): Promise<Person> {
    return await apiService.get<Person>(`${this.BASE_URL}/${id}`);
  }

  public static async createPerson(data: Partial<Person>): Promise<Person> {
    return await apiService.post<Person>(this.BASE_URL, data);
  }

  public static async createPersonByCNPJ(cnpj: string, licenseId: number): Promise<Person> {
    return await apiService.post<Person>(`${this.BASE_URL}/cnpj`, { cnpj, license_id: licenseId });
  }

  public static async updatePerson(id: number, data: Partial<Person>): Promise<Person> {
    return await apiService.put<Person>(`${this.BASE_URL}/${id}`, data);
  }

  public static async searchCEP(cep: string): Promise<any> {
    return await apiService.get(`${this.BASE_URL}/consulta/cep/${cep}`);
  }

  public static async searchCNPJ(cnpj: string): Promise<any> {
    return await apiService.get(`${this.BASE_URL}/consulta/cnpj/${cnpj}`);
  }

  public static async addDocument(personId: number, document: any): Promise<void> {
    await apiService.post(`${this.BASE_URL}/${personId}/documents`, document);
  }

  public static async deleteDocument(personId: number, documentId: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${personId}/documents/${documentId}`);
  }

  public static async addContact(personId: number, contact: any): Promise<void> {
    await apiService.post(`${this.BASE_URL}/${personId}/contacts`, contact);
  }

  public static async deleteContact(personId: number, contactId: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${personId}/contacts/${contactId}`);
  }
}