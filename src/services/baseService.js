import api from './api';
import { API_PROVIDERS } from '../config/apiRegistry';

class BaseService {
  constructor(endpoint, providerKey = 'MAIN_BACKEND') {
    this.api = api;
    this.endpoint = endpoint;
    this.providerKey = providerKey;
  }

  async get(params = {}) {
    try {
      const response = await this.api.get(this.endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data) {
    try {
      const response = await this.api.post(this.endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id, data) {
    try {
      const response = await this.api.put(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id) {
    try {
      const response = await this.api.delete(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error(`Erro na requisição para ${this.endpoint}:`, error);
    throw error;
  }
}

export default BaseService;
