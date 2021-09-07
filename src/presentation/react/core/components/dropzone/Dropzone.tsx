import React, { useImperativeHandle, useRef } from "react";
import { DropzoneOptions, DropzoneRootProps, useDropzone } from "react-dropzone";
import styled from "styled-components";

const getColor = (props: DropzoneRootProps) => {
    if (props.isDragAccept) {
        return "#00e676";
    }
    if (props.isDragReject) {
        return "#ff1744";
    }
    if (props.isDragActive) {
        return "#2196f3";
    }
    return "#eeeeee";
};

const Shade = styled.div<DropzoneRootProps>`
    display: flex;
    place-content: center;
    text-shadow: 1px 1px 10px black;
    padding: 20px;
    align-items: center;
    border-width: 2px;
    border-radius: 2px;
    border-color: ${props => getColor(props)};
    border-style: dashed;
    background-color: #fafafa;
    outline: none;
    transition: border 0.24s ease-in-out;
    height: 100%;
    background-color: rgba(10, 10, 10, 0.5);
`;

const Text = styled.p`
    text-align: center;
    font-size: 30px;
    color: white;
`;

export interface DropzoneProps extends DropzoneOptions {
    children?: React.ReactNode;
    visible?: boolean;
}

export interface DropzoneRef {
    openDialog: () => void;
}

export const Dropzone = React.forwardRef((props: DropzoneProps, ref: React.ForwardedRef<DropzoneRef>) => {
    const childrenRef = useRef<HTMLDivElement>(null);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        noClick: !props.visible,
        ...props,
    });

    useImperativeHandle(ref, () => ({
        openDialog() {
            open();
        },
    }));

    return (
        <div {...getRootProps()} style={{ outline: "none" }}>
            <div
                style={{
                    position: "absolute",
                    height: childrenRef.current?.clientHeight,
                    width: childrenRef.current?.clientWidth,
                    visibility: props.visible || isDragActive ? "visible" : "hidden",
                }}
            >
                <Shade>
                    <input {...getInputProps()} />
                    <Text>Drag and drop some files here, or click to select files</Text>
                </Shade>
            </div>
            <div ref={childrenRef}>{props.children}</div>
        </div>
    );
});
