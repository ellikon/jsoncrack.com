import React from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Button, Group } from "@mantine/core";

export const EditModal = ({ opened, onClose }: ModalProps) => {
  
  return (
    <Modal title="Content" opened={opened} onClose={onClose} centered>
      <Stack py="sm">
      </Stack>
    </Modal>
  );
};