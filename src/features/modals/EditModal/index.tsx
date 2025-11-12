import React from "react";
import { ModalProps, TextInput } from "@mantine/core";
import { Modal, Stack, Text, Button, Flex, CloseButton, ScrollArea } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";
import useJson from "../../../store/useJson";
import useFile from "../../../store/useFile";

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const EditModal = ({ opened, onClose }: ModalProps) => {
    const nodeData = useGraph(state => state.selectedNode);

    // Editable rows (only primitive types)
    const editableRows = React.useMemo(
        () => nodeData?.text.filter(row => row.type === "string" || row.type === "number" || row.type === "boolean") ?? [],
        [nodeData?.text]
    );

    // Local input state: initialised from nodeData but kept local so editing inputs doesn't mutate the store
    const [inputValues, setInputValues] = React.useState<string[]>([]);

    // Initialize/reset inputs when nodeData (or modal open) changes
    React.useEffect(() => {
        setInputValues(editableRows.map(r => (r.value === null || r.value === undefined ? "" : String(r.value))));
    }, [opened, nodeData?.id]);

    const handleChange = (index: number, value: string) => {
        setInputValues(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleSave = () => {
        if (!nodeData) return;

        // Parse current JSON and apply edited values from inputs
        const rawJson = useJson.getState().json;
        let jsonRoot = JSON.parse(rawJson);

        const getAtPath = (obj: any, path?: any[]) => (path && path.length ? path.reduce((acc, seg) => (acc == null ? undefined : acc[seg as any]), obj) : obj);

        const setAtPath = (obj: any, path: any[] | undefined, value: any) => {
            if (!path || path.length === 0) return value;
            const parent = getAtPath(obj, path.slice(0, -1));
            const last = path[path.length - 1] as string | number;
            if (parent && typeof parent === "object") parent[last as any] = value;
            return obj;
        };

        // Loop through primitive rows and update jsonRoot with parsed input values
        let inputIdx = 0;
        nodeData.text.forEach(row => {
            if (row.type !== "string" && row.type !== "number" && row.type !== "boolean") return;

            const raw = inputValues[inputIdx++] ?? "";
            let parsedForJson: any;

            if (row.type === "number") {
                const n = parseFloat(raw);
                parsedForJson = Number.isNaN(n) ? null : n;
            } else if (row.type === "boolean") {
                const lowered = raw.trim().toLowerCase();
                parsedForJson = lowered === "true" ? true : lowered === "false" ? false : Boolean(raw);
            } else {
                parsedForJson = raw;
            }

            if (row.key !== null) {
                const target = getAtPath(jsonRoot, nodeData.path);
                if (target && typeof target === "object") target[row.key] = parsedForJson;
            } else {
                jsonRoot = setAtPath(jsonRoot, nodeData.path ?? [], parsedForJson);
            }
        });

        // Write updated JSON back to both editor and graph store
        const jsonString = JSON.stringify(jsonRoot, null, 2);
        useFile.getState().setContents({ contents: jsonString, hasChanges: true, skipUpdate: true });
        useJson.getState().setJson(jsonString);

        onClose();
    };

    return (
        <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
        <Stack pb="sm" gap="sm">
            <Stack gap="xs">
                <Flex justify="space-between" align="center">
                    <Text fz="xs" fw={500}>
                        Content
                    </Text>
                    <Flex gap="sm" align="center">
                        <Button color="green" onClick={handleSave}>Save</Button>
                        <Button color="red" onClick={onClose}>Cancel</Button>
                        <CloseButton onClick={onClose} />
                    </Flex>
                </Flex>
                {editableRows.map((row, idx) => (
                    <TextInput
                        key={row.key ?? String(idx)}
                        label={row.key ?? String(idx)}
                        value={inputValues[idx] ?? ""}
                        onChange={e => handleChange(idx, e.currentTarget.value)}
                    />
                ))}
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