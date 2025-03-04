import { create } from "zustand";

export type ContactForm = {
  msg: string;
  name: string;
};

export type ModalType = "contact" | "import-contacts";

interface ModalData {
  contactForm?: ContactForm;
  import_options?: "excel" | "google_sheets" | "manual";
}

interface ModalStore {
  modalType: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
  logState: () => void;
}
//hook to control all modals (controls the global state)
const useModalStore = create<ModalStore>((set, get) => ({
  modalType: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => {
    set({ isOpen: true, modalType: type, data });
    console.log("State after opening modal:", get());
  },
  onClose: () => {
    set({ isOpen: false, modalType: null });
    console.log("State after closing modal:", get());
  },
  logState: () => console.log("Current state:", get()),
}));

export default useModalStore;
