import { List, ListItem, ListItemText } from "@material-ui/core";
import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useRef } from "react";
import styled from "styled-components";
import { NamedRef } from "../../../../../domain/common/entities/Ref";

export const OverlappingEditor: React.FC<OverlappingEditorProps> = props => {
    const { metadata, variables, value, onChange } = props;

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
        editorRef.current = editor;
    }

    return (
        <GridContainer>
            <GridItem column={1}>
                <Editor
                    height="15vh"
                    defaultLanguage="dhis"
                    onChange={onChange}
                    value={value}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        lineNumbers: "off",
                        renderLineHighlight: "none",
                        scrollbar: { useShadows: false, vertical: "hidden" },
                        suggest: { snippetsPreventQuickSuggestions: false },
                        wordWrap: "on",
                    }}
                />
            </GridItem>
            <GridItem column={2}>
                <ItemList>
                    <List>
                        {variables?.map(key => {
                            const item = metadata?.find(item => item.id === key);
                            if (!item) return null;

                            return (
                                <ListItem
                                    key={key}
                                    button={true}
                                    onClick={() => {
                                        onChange((string = "") => `${string}#{${key}}`);
                                        editorRef?.current?.focus();
                                    }}
                                >
                                    <ListItemText>{`${item.name} (${item.id})`}</ListItemText>
                                </ListItem>
                            );
                        })}
                    </List>
                </ItemList>
            </GridItem>
        </GridContainer>
    );
};

const GridContainer = styled.div`
    display: grid;
    grid-gap: 20px;
    grid-auto-columns: 50%;
    margin-right: 25px;
`;

const GridItem = styled.div<{ column: number; expand?: boolean }>`
    grid-column: ${props => props.column} ${props => (props.expand ? "/ span 2" : "")};
    grid-row: auto;
    padding: 20px;
    border: 1px solid rgb(160, 173, 186);
`;

export interface OverlappingEditorProps {
    variables: string[];
    metadata: NamedRef[];
    value: string;
    onChange: (update?: string | ((oldValue: string) => string)) => void;
}

const ItemList = styled.div`
    height: 200px;
    overflow: auto;
`;
