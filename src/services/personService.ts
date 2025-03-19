import axios from 'axios';
import api from './api';

const API_URL = import.meta.env.VITE_API_URL;

export const personService = {
  async search(query: string, page = 1, limit = 10) {
    try {
      console.log(' Buscando pessoas com query:', query);
      
      const token = localStorage.getItem('accessToken') || '';
      
      const response = await axios.get(`${API_URL}/persons`, {
        params: { 
          query,
          page,
          limit
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(' Pessoas encontradas:', response.data.data);

      return {
        items: response.data.data,
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error(' Erro ao buscar pessoas:', error);
      throw error;
    }
  },

  async getById(id: string) {
    try {
      const token = localStorage.getItem('accessToken') || '';
      
      const response = await axios.get(`${API_URL}/persons/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(` Erro ao buscar pessoa com ID ${id}:`, error);
      throw error;
    }
  }
};
