import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

const transactions: Transaction[] = [
  { id: 1, description: 'Pagamento Cliente A', amount: 1500, type: 'income', date: '2024-03-15' },
  { id: 2, description: 'Fornecedor XYZ', amount: -850, type: 'expense', date: '2024-03-14' },
  { id: 3, description: 'Assinatura Mensal', amount: 2000, type: 'income', date: '2024-03-13' },
  { id: 4, description: 'Manutenção', amount: -350, type: 'expense', date: '2024-03-12' },
];

export const RecentTransactions: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold">Transações Recentes</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
            </div>
            <span className={`font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};