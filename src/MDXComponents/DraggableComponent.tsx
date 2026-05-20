// MDXComponents/DraggableComponent.tsx
'use client'

import React from 'react';
import { useDrag } from 'react-dnd';

interface DraggableComponentProps {
    children: React.ReactNode;
    type: string;
    data: any;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
                                                                          children,
                                                                          type,
                                                                          data
                                                                      }) => {
    const [{ isDragging }, drag] = useDrag({
        type: type,
        item: { ...data, type },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const opacity = isDragging ? 0.4 : 1;

    return (
        <div
            ref={drag}
            style={{
                opacity,
                cursor: 'move',
                position: 'relative',
            }}
        >
            {children}
        </div>
    );
};