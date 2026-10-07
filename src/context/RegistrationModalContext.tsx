import React, { createContext, useContext, useState } from 'react';
import StudentRegistrationModal from '@/components/StudentRegistrationModal';

interface RegistrationModalContextType {
  isOpen: boolean;
  openRegistration: (specialtyId?: string) => void;
  closeRegistration: () => void;
  selectedSpecialtyId?: string;
}

const RegistrationModalContext = createContext<RegistrationModalContextType | undefined>(undefined);

export function RegistrationModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | undefined>(undefined);

  const openRegistration = (specialtyId?: string) => {
    setSelectedSpecialtyId(specialtyId);
    setIsOpen(true);
  };

  const closeRegistration = () => {
    setIsOpen(false);
    setSelectedSpecialtyId(undefined);
  };

  return (
    <RegistrationModalContext.Provider
      value={{
        isOpen,
        openRegistration,
        closeRegistration,
        selectedSpecialtyId
      }}
    >
      {children}
      <StudentRegistrationModal
        isOpen={isOpen}
        onClose={closeRegistration}
        defaultSpecialtyId={selectedSpecialtyId}
      />
    </RegistrationModalContext.Provider>
  );
}

export function useRegistrationModal() {
  const context = useContext(RegistrationModalContext);
  if (!context) {
    throw new Error('useRegistrationModal must be used within a RegistrationModalProvider');
  }
  return context;
}
