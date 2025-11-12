import React from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, Button, Group, Flex, CloseButton, ScrollArea } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const EditModal = ({ opened, onClose }: ModalProps) => {
    const nodeData = useGraph(state => state.selectedNode);
  
    return (
        <Modal opened={opened} onClose={onClose} centered withCloseButton={false}>
        <Stack pb="sm" gap="sm">
            <Stack gap="xs">
                <Flex justify="space-between" align="center">
                    <Text fz="xs" fw={500}>
                        Content
                    </Text>
                    <Flex gap="sm" align="center">
                        <Button color="green">Save</Button>
                        <Button color="red" onClick={onClose}>Cancel</Button>
                        <CloseButton onClick={onClose} />
                    </Flex>
                </Flex>
            </Stack>
            <Text fz="xs" fw={500}>
                JSON Path
            </Text>
            <ScrollArea.Autosize maw={600}>
                <CodeHighlight
                    code={jsonPathToString(nodeData?.path)}
                    miw={350}
                    mah={250}
                    language="json"
                    copyLabel="Copy to clipboard"
                    copiedLabel="Copied to clipboard"
                    withCopyButton
                />
            </ScrollArea.Autosize>
        </Stack>
        </Modal>
    );
};