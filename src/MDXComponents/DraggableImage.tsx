// MDXComponents/DraggableImage.tsx
'use client'

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import ImageWithCopyRight, { IImgWithCopyRight } from './ImageWithCopyRight';

interface DraggableImageProps {
    image: IImgWithCopyRight;
    index: number;
    moveImage: (fromIndex: number, toIndex: number) => void;
    onDelete: (image: IImgWithCopyRight) => void;
    dopSrc?: string;
}

interface DragItem {
    index: number;
    id: string;
    type: string;
}

export default function DraggableImage({
                                           image,
                                           index,
                                           moveImage,
                                           onDelete,
                                           dopSrc
                                       }: DraggableImageProps) {
    const ref = React.useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'image',
        item: { index, id: image.id, type: 'image' },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'image',
        hover: (item: DragItem, monitor) => {
            if (!ref.current) return;

            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();

            if (!clientOffset) return;

            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            moveImage(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    const opacity = isDragging ? 0.4 : 1;

    return (
        <div
            ref={ref}
            style={{
                opacity,
                cursor: 'move',
                position: 'relative',
                transition: 'opacity 0.2s',
            }}
        >
            <ImageWithCopyRight
                id={image.id}
                dopSrc={dopSrc}
                img={image.img}
                copyright={image.copyright}
                copyRightColor={image.copyRightColor}
                style={{
                    objectFit: 'cover',
                    borderRadius: '20px',
                    maxWidth: '300px',
                }}
            />
            <button
                type="button"
                onClick={() => onDelete(image)}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    padding: '5px',
                    zIndex: 1,
                }}
            >
                Удалить
            </button>
        </div>
    );
}