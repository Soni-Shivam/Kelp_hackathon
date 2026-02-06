'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

interface PlateEditorProps {
    initialValue?: any[];
    readOnly?: boolean;
    onChange?: (value: any[]) => void;
}

const defaultInitialValue: Descendant[] = [
    {
        type: 'paragraph',
        children: [{ text: 'Start typing here...' }],
    } as any,
];

export const PlateEditor: React.FC<PlateEditorProps> = ({ initialValue, readOnly = false, onChange }) => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const [value, setValue] = useState<Descendant[]>(initialValue || defaultInitialValue);

    const renderElement = useCallback((props: any) => {
        switch (props.element.type) {
            case 'ul':
                return <ul {...props.attributes} className="list-disc pl-5 mb-2 text-slate-800 space-y-1">{props.children}</ul>;
            case 'li':
                return <li {...props.attributes} className="text-sm">{props.children}</li>;
            default:
                return <p {...props.attributes} className="mb-2 text-slate-800 text-sm leading-relaxed">{props.children}</p>;
        }
    }, []);

    const renderLeaf = useCallback((props: any) => {
        return (
            <span
                {...props.attributes}
                style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
            >
                {props.children}
            </span>
        );
    }, []);

    return (
        <div className="w-full h-full min-h-[100px] p-2">
            <Slate editor={editor} initialValue={value} onChange={(newValue) => {
                setValue(newValue);
                onChange?.(newValue);
            }}>
                <Editable
                    readOnly={readOnly}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    className="outline-none"
                />
            </Slate>
        </div>
    );
};
