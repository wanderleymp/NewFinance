export interface Invoice {
  invoiceId: number;
  referenceId: string;
  type: string;
  status: string;
  environment: string;
  totalAmount: number;
  movementId: number;
}

export interface Nfse {
  nfseId: number;
  invoiceId: number;
  integrationNfseId: string;
  serviceValue: number;
  issValue: number;
  aliquotaService: number;
  createdAt: string;
  updatedAt: string;
  invoice: Invoice;
  pdfUrl: string;
  xmlUrl: string;
}

export interface NfseListResponse {
  items: Nfse[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}

export interface NfseListParams {
  page?: number;
  limit?: number;
  status?: string;
  integrationNfseId?: string;
  invoiceId?: number;
  dataInicio?: string;
  dataFim?: string;
}
