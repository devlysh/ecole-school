import React from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteClassModal: React.FC<DeleteClassModalProps> = ({
  isOpen,
  onClose,
  onDelete,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this class?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            No
          </Button>
          <Button color="primary" onPress={onDelete}>
            Yes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteClassModal;
