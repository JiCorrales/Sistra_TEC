import { mockBeneficiarios } from "../data/mockData";

const STORAGE_KEY = "sistratec_admin_beneficiaries";

const readStoredBeneficiaries = () => {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  return storedValue ? JSON.parse(storedValue) : null;
};

const persistBeneficiaries = (beneficiaries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(beneficiaries));
};

const buildNextBeneficiaryId = (beneficiaries) => {
  const nextNumber = beneficiaries.length + 1;
  return `BEN-${String(nextNumber).padStart(3, "0")}`;
};

export const getAdminBeneficiaries = async () => {
  const storedBeneficiaries = readStoredBeneficiaries();
  return storedBeneficiaries || mockBeneficiarios;
};

export const createAdminBeneficiary = async (beneficiaryData) => {
  const beneficiaries = await getAdminBeneficiaries();
  const newBeneficiary = {
    ...beneficiaryData,
    id: buildNextBeneficiaryId(beneficiaries),
    ayudas: 0,
  };

  const updatedBeneficiaries = [...beneficiaries, newBeneficiary];
  persistBeneficiaries(updatedBeneficiaries);
  return newBeneficiary;
};

export const updateAdminBeneficiary = async (beneficiaryId, beneficiaryData) => {
  const beneficiaries = await getAdminBeneficiaries();
  const updatedBeneficiaries = beneficiaries.map((beneficiary) =>
    beneficiary.id === beneficiaryId
      ? { ...beneficiary, ...beneficiaryData, id: beneficiaryId }
      : beneficiary
  );

  persistBeneficiaries(updatedBeneficiaries);
  return updatedBeneficiaries.find((beneficiary) => beneficiary.id === beneficiaryId);
};

export const toggleAdminBeneficiaryStatus = async (beneficiaryId) => {
  const beneficiaries = await getAdminBeneficiaries();
  const updatedBeneficiaries = beneficiaries.map((beneficiary) => {
    if (beneficiary.id !== beneficiaryId) return beneficiary;

    return {
      ...beneficiary,
      estado: beneficiary.estado === "Activo" ? "Inactivo" : "Activo",
    };
  });

  persistBeneficiaries(updatedBeneficiaries);
  return updatedBeneficiaries;
};
