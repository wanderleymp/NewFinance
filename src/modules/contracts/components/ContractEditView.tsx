import React from 'react';
import { Contract } from '../types/contract';
import { EditContractModal } from './EditContractModal';

interface ContractEditViewProps {
  contract: Contract;
  onClose: () => void;
  onSubmit: (data: Partial<Contract>) => void;
}

export function ContractEditView({ 
  contract, 
  onClose, 
  onSubmit 
}: ContractEditViewProps) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-white overflow-hidden"
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%' 
      }}
    >
      <div className="w-full h-full p-4 overflow-y-auto">
        <EditContractModal
          isOpen={true}
          onClose={onClose}
          onSubmit={onSubmit}
          contract={contract}
        />
      </div>
    </div>
  );
}
