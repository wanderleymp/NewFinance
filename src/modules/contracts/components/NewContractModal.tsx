import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { ContractFormData } from '../types/contractForm';
import { SearchPersonAutocomplete } from '../../persons/components/SearchPersonAutocomplete';
import { Person } from '../../persons/types/person';

interface NewContractModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContractFormData) => void;
  initialData?: Partial<ContractFormData>;
  title?: string;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  open,
  onClose,
  onSave,
  initialData = {},
  title = 'Novo Contrato'
}) => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ContractFormData>({
    defaultValues: {
      contract_name: initialData.contract_name || '',
      contract_value: initialData.contract_value || '',
      start_date: initialData.start_date || new Date().toISOString().split('T')[0],
      end_date: initialData.end_date || null,
      recurrence_period: initialData.recurrence_period || 'monthly',
      due_day: initialData.due_day || 1,
      days_before_due: initialData.days_before_due || 0,
      billing_reference: initialData.billing_reference || '',
      contract_group_id: initialData.contract_group_id || 0,
      model_movement_id: initialData.model_movement_id || 0,
      representative_person_id: initialData.representative_person_id || null,
      status: initialData.status || 'active'
    }
  });

  const onSubmit = (data: ContractFormData) => {
    // Se uma pessoa foi selecionada, adicione o ID dela aos dados do formulário
    if (selectedPerson) {
      data.representative_person_id = selectedPerson.id;
      data.full_name = selectedPerson.full_name;
    }
    
    onSave(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
  };

  return (
    <Modal show={open} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Nome do Contrato</Form.Label>
                <Controller
                  name="contract_name"
                  control={control}
                  rules={{ required: 'Nome do contrato é obrigatório' }}
                  render={({ field }) => (
                    <Form.Control 
                      {...field} 
                      isInvalid={!!errors.contract_name}
                    />
                  )}
                />
                {errors.contract_name && (
                  <Form.Control.Feedback type="invalid">
                    {errors.contract_name.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Valor do Contrato</Form.Label>
                <Controller
                  name="contract_value"
                  control={control}
                  rules={{ required: 'Valor do contrato é obrigatório' }}
                  render={({ field }) => (
                    <Form.Control 
                      {...field} 
                      type="text"
                      isInvalid={!!errors.contract_value}
                    />
                  )}
                />
                {errors.contract_value && (
                  <Form.Control.Feedback type="invalid">
                    {errors.contract_value.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Periodicidade</Form.Label>
                <Controller
                  name="recurrence_period"
                  control={control}
                  render={({ field }) => (
                    <Form.Select 
                      {...field} 
                      isInvalid={!!errors.recurrence_period}
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </Form.Select>
                  )}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Data de Início</Form.Label>
                <Controller
                  name="start_date"
                  control={control}
                  rules={{ required: 'Data de início é obrigatória' }}
                  render={({ field }) => (
                    <Form.Control 
                      {...field} 
                      type="date"
                      isInvalid={!!errors.start_date}
                    />
                  )}
                />
                {errors.start_date && (
                  <Form.Control.Feedback type="invalid">
                    {errors.start_date.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Data de Término (opcional)</Form.Label>
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <Form.Control 
                      {...field} 
                      type="date"
                      value={field.value || ''}
                      isInvalid={!!errors.end_date}
                    />
                  )}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Dia de Vencimento</Form.Label>
                <Controller
                  name="due_day"
                  control={control}
                  rules={{ 
                    required: 'Dia de vencimento é obrigatório',
                    min: { value: 1, message: 'Mínimo 1' },
                    max: { value: 31, message: 'Máximo 31' }
                  }}
                  render={({ field }) => (
                    <Form.Control 
                      {...field} 
                      type="number"
                      min={1}
                      max={31}
                      isInvalid={!!errors.due_day}
                    />
                  )}
                />
                {errors.due_day && (
                  <Form.Control.Feedback type="invalid">
                    {errors.due_day.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Dias de Antecedência</Form.Label>
                <Controller
                  name="days_before_due"
                  control={control}
                  render={({ field }) => (
                    <Form.Control 
                      {...field} 
                      type="number"
                      min={0}
                      isInvalid={!!errors.days_before_due}
                    />
                  )}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Pessoa Representante</Form.Label>
                <SearchPersonAutocomplete 
                  onSelect={handlePersonSelect}
                  initialValue={initialData.full_name || ''}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Referência de Faturamento</Form.Label>
                <Controller
                  name="billing_reference"
                  control={control}
                  render={({ field }) => (
                    <Form.Control 
                      {...field} 
                      as="textarea"
                      rows={2}
                      isInvalid={!!errors.billing_reference}
                    />
                  )}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit(onSubmit)}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewContractModal;
