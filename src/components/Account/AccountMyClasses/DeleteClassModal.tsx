import React from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Checkbox,
} from "@nextui-org/react";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isRecurring: boolean;
  deleteFutureOccurences: boolean;
  setDeleteFutureOccurences: (value: boolean) => void;
}

const DeleteClassModal: React.FC<DeleteClassModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  isRecurring,
  deleteFutureOccurences,
  setDeleteFutureOccurences,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this class?</p>
          {isRecurring && (
            <>
              <p>This is a recurring class.</p>
              <Checkbox
                isSelected={deleteFutureOccurences}
                onValueChange={setDeleteFutureOccurences}
              >
                Delete all future occurrences
              </Checkbox>
            </>
          )}
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
