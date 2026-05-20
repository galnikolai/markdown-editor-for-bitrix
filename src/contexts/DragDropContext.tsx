import React, { createContext, useContext, ReactNode } from 'react';

interface DragDropContextType {
    moveItem: (fromIndex: number, toIndex: number) => void;
    insertItem: (item: any, index: number) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const useDragDrop = () => {
    const context = useContext(DragDropContext);
    if (!context) {
        throw new Error('useDragDrop must be used within DragDropProvider');
    }
    return context;
};

interface DragDropProviderProps {
    children: ReactNode;
    value: DragDropContextType;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children, value }) => {
    return (
        <DragDropContext.Provider value={value}>
            {children}
        </DragDropContext.Provider>
    );
};