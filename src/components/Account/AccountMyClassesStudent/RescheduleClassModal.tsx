import React from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  DatePicker,
} from "@nextui-org/react";
import { fromDate } from "@internationalized/date";
import { DisplayBookedClass } from "@/lib/types";

interface RescheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedClass: DisplayBookedClass | null;
  onChangeDate: (date: Date) => void;
}

const RescheduleClassModal: React.FC<RescheduleClassModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedClass,
  onChangeDate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Reschedule Class
        </ModalHeader>
        <ModalBody>
          <DatePicker
            hideTimeZone
            showMonthAndYearPickers
            label="Event Date"
            variant="bordered"
            onChange={(date) => onChangeDate(date.toDate())}
            defaultValue={
              selectedClass?.date
                ? fromDate(
                    new Date(selectedClass.date),
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                  )
                : fromDate(
                    new Date(),
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                  )
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RescheduleClassModal;
