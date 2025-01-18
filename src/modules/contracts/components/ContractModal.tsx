import React from 'react';
import { EditContractModal } from './EditContractModal';
import { NewContractForm } from './NewContractForm';

type ContractModalProps = {
  mode: 'edit' | 'new' | null;
  contract?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
};

export function ContractModal({ 
  mode, 
  contract, 
  onClose, 
  onSubmit 
}: ContractModalProps) {
  if (!mode) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%' 
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {mode === 'edit' && contract && (
          <EditContractModal
            isOpen={true}
            onClose={onClose}
            onSubmit={onSubmit}
            contract={contract}
          />
        )}
        
        {mode === 'new' && (
          <NewContractForm
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
}
