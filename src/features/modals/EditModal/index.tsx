import React from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Button, Group } from "@mantine/core";

export const EditModal = ({ opened, onClose }: ModalProps) => {
  
  return (
    <Modal title="Your Modal Title" opened={opened} onClose={onClose} centered>
      <Stack py="sm">
        {/* Your modal content here */}
      </Stack>
      <Group justify="right">
        <Button onClick={onClose}>Close</Button>
      </Group>
    </Modal>
  );
};