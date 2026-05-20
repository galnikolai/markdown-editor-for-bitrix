// MDXComponents/EditorDropZone.tsx
'use client'

import React from 'react';
import { useDrop } from 'react-dnd';

interface DropZoneProps {
    onDrop: (item: any) => void;
    index: number;
}

export const EditorDropZone: React.FC<DropZoneProps> = ({ onDrop, index }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ['image', 'jsx-component'],
        drop: (item: unknown) => {
            if (onDrop) {
                const dropItem = item as Record<string, any>;
                onDrop({ ...dropItem, dropIndex: index });
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const isActive = isOver && canDrop;

    return (
        <div
            ref={drop}
            style={{

                height: isActive ? '60px' : '20px',
                background: isActive ? 'rgba(66, 153, 225, 0.2)' : 'transparent',
                border: isActive
                    ? '2px dashed #4299e1'
                    : canDrop
                        ? '1px dashed #cbd5e0'
                        : 'none',
                borderRadius: '4px',
                margin: '4px 0',
                transition: 'all 0.2s ease',
                pointerEvents: 'auto' as const,
            }}
        >
            {isActive && (
                <div style={{
                    textAlign: 'center',
                    color: '#4299e1',
                    padding: '8px',
                    fontSize: '14px',
                }}>
                    Отпустите, чтобы вставить
                </div>
            )}
        </div>
    );
};