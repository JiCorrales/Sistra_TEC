import { useEffect, useMemo, useState } from 'react';
import {
  SectionHeader,
  Table,
  TR,
  TD,
  Input,
  Btn,
  BackBtn,
} from '../components/UI';
import {
  createAdminBeneficiary,
  getAdminBeneficiaries,
  updateAdminBeneficiary,
} from '../services/AdminBeneficiaries';

const EMPTY_BENEFICIARY = {
  name: '',
  identification: '',
  start_date: '',
};

export default function AdminBeneficiariosPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const loadBeneficiaries = async () => {
    try {
      const loadedBeneficiaries = await getAdminBeneficiaries();
      setBeneficiaries(loadedBeneficiaries);
    } catch (error) {
      alert('Error al cargar los beneficiarios: ' + error.message);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const filteredBeneficiaries = useMemo(
    () => filterBeneficiaries(beneficiaries, searchTerm),
    [beneficiaries, searchTerm]
  );

  const openCreateBeneficiaryForm = () => {
    setSelectedBeneficiary(null);
    setIsFormVisible(true);
  };

  const openEditBeneficiaryForm = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsFormVisible(true);
  };

  const closeBeneficiaryForm = () => {
    setSelectedBeneficiary(null);
    setIsFormVisible(false);
  };

  const saveBeneficiary = async (beneficiaryData) => {
    try {
      if (selectedBeneficiary) {
        await updateAdminBeneficiary(selectedBeneficiary.id, beneficiaryData);
      } else {
        await createAdminBeneficiary(beneficiaryData);
      }
      await loadBeneficiaries();
      closeBeneficiaryForm();
    } catch (error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        alert('Ya existe un beneficiario con esta identificación.');
      } else {
        alert('Error al guardar: ' + error.message);
      }
    }
  };


  if (isFormVisible) {
    return (
      <BeneficiaryForm
        beneficiary={selectedBeneficiary}
        onBack={closeBeneficiaryForm}
        onSave={saveBeneficiary}
      />
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={styles.headerRow}>
        <SectionHeader title="Todos los Beneficiarios" />
        <Btn size="sm" variant="secondary" onClick={openCreateBeneficiaryForm}>
          + Agregar
        </Btn>
      </div>

      <div style={styles.filterRow}>
        <Input
          placeholder="Buscar por nombre o identificación"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => setSearchTerm('')}
        >
          Limpiar
        </Btn>
      </div>

      <Table
        columns={['Nombre', 'Identificación', 'Fecha Inicio', 'Acciones']}
        rows={filteredBeneficiaries}
        renderRow={(beneficiary) => (
          <TR key={beneficiary.id} hover>
            <TD>
              <strong>{beneficiary.name}</strong>
            </TD>
            <TD>{beneficiary.identification}</TD>
            <TD>{formatDate(beneficiary.start_date)}</TD>
            <TD>
              <Btn size="sm" variant="ghost" onClick={() => openEditBeneficiaryForm(beneficiary)}>
                Editar
              </Btn>
            </TD>
          </TR>
        )}
      />
    </div>
  );
}

function BeneficiaryForm({ beneficiary, onBack, onSave }) {
  const [formData, setFormData] = useState(() => ({
    ...EMPTY_BENEFICIARY,
    ...beneficiary,
  }));

  const updateFormField = (fieldName, value) => {
    setFormData((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const submitBeneficiary = () => {
    const validationMessage = validateBeneficiaryForm(formData);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    onSave({
      name: formData.name.trim(),
      identification: formData.identification.trim(),
      start_date: formData.start_date,
    });
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      <SectionHeader title={beneficiary ? 'Editar Beneficiario' : 'Agregar Beneficiario'} />
      <div style={styles.formCard}>
        <div style={styles.formGrid}>
          <Input
            label="Nombre del beneficiario:"
            placeholder="Nombre completo o institución"
            value={formData.name}
            onChange={(event) => updateFormField('name', event.target.value)}
          />
          <Input
            label="Identificación:"
            placeholder="NIT, cédula, registro único"
            value={formData.identification}
            onChange={(event) => updateFormField('identification', event.target.value)}
          />
          <Input
            label="Fecha de inicio:"
            type="date"
            value={formData.start_date}
            onChange={(event) => updateFormField('start_date', event.target.value)}
          />
        </div>

        <div style={styles.formActions}>
          <BackBtn onClick={onBack} />
          <Btn onClick={submitBeneficiary} style={{ flex: 1 }}>
            Guardar Beneficiario
          </Btn>
        </div>
      </div>
    </div>
  );
}

function filterBeneficiaries(beneficiaries, searchTerm) {
  const normalizedSearchTerm = normalizeSearchText(searchTerm);

  return beneficiaries.filter((beneficiary) => {
    const searchableText = normalizeSearchText(
      `${beneficiary.name} ${beneficiary.identification}`
    );
    return normalizedSearchTerm ? searchableText.includes(normalizedSearchTerm) : true;
  });
}

function validateBeneficiaryForm(formData) {
  if (!formData.name.trim()) return 'El nombre del beneficiario es obligatorio.';
  if (!formData.identification.trim()) return 'La identificación es obligatoria.';
  if (!formData.start_date) return 'La fecha de inicio es obligatoria.';
  return null;
}


function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year}`;
}

function normalizeSearchText(value) {
  return String(value || '').toLowerCase().trim();
}

const styles = {
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'end',
    marginBottom: 20,
  },
  formCard: {
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    padding: 32,
    maxWidth: 760,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  formActions: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
    alignItems: 'center',
  },
};