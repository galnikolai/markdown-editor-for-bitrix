'use client'

import { useContext, useState, useEffect } from "react"; // Добавили useEffect в импорт
import AddPhoto from "../HelpComponents/AddPhoto";
import { IImgWithCopyRight } from "./ImageWithCopyRight";
import { DopImgSrcGlobalContext } from "../contexts/DopImgSrcProvider";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ISwiper {
    onAdd: (val: IImgWithCopyRight) => void,
    onDelete: (val: IImgWithCopyRight) => void,
    onReorder?: (images: IImgWithCopyRight[]) => void,
    dopSrc?: string;
    objects?: IImgWithCopyRight[]
}

// Компонент сортируемого изображения
function SortableImage({
                           image,
                           onDelete,
                           dopSrcGlobal
                       }: {
    image: IImgWithCopyRight,
    onDelete: (img: IImgWithCopyRight) => void,
    dopSrc?: string,
    dopSrcGlobal?: string
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="sortable-image"
        >
            <div
                style={{
                    position: "relative",
                }}
            >
                <div

                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(image);
                    }}
                    style={{
                        width: "30px",
                        height: "30px",
                        padding: "5px",
                        position: "absolute",
                        right: "10px",
                        top: "10px",
                        borderRadius: "8px",
                        zIndex: 1,
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                    }}
                >
                    <img
                        src={dopSrcGlobal + 'src/assets/cross.svg'}
                        alt="Удалить"
                        style={{ width: '15px', height: '15px' }}
                    />
                </div>
                <img
                    src={image.img.src}
                    alt={image.img.alt ?? `картинка c id${image.id}`}
                    style={{
                        width: "200px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "20px",
                        border: '2px solid transparent',
                    }}
                />
                {image.copyright && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        right: '10px',
                        background: '#172c15',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                    }}>
                        © {image.copyright}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ImgsSwiper({ onAdd, onDelete, onReorder, dopSrc, objects = [] }: ISwiper) {
    const [isVisibleEdit, setIsVisibleEdit] = useState<boolean>(false);
    const { dopSrcGlobal } = useContext(DopImgSrcGlobalContext)
    const [localObjects, setLocalObjects] = useState<IImgWithCopyRight[]>(objects);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = localObjects.findIndex((img) => img.id === active.id);
            const newIndex = localObjects.findIndex((img) => img.id === over.id);

            const newOrder = arrayMove(localObjects, oldIndex, newIndex);

            // Обновляем локальное состояние
            setLocalObjects(newOrder);

            // Если передан onReorder, вызываем его
            if (onReorder && typeof onReorder === 'function') {
                onReorder(newOrder);
            }
        }
    };

    const changeVisibilityEdit = () => {
        setIsVisibleEdit((prev) => !prev);
    };

    // Обновляем локальное состояние при изменении props
    useEffect(() => { // Заменили React.useEffect на useEffect
        setLocalObjects(objects);
    }, [objects]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <button
                type="button"
                style={{
                    padding: "10px",
                    borderRadius: "6px",
                    width: "200px",
                    background: "#4299e1",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                }}
                onClick={changeVisibilityEdit}
            >
                {isVisibleEdit ? "Скрыть редактор" : "Показать редактор"}
            </button>

            {isVisibleEdit && (
                <AddPhoto
                    updatePhoto={onAdd}
                    //hasAnotherPhoto={localObjects.length > 0}
                />
            )}

            <h4>Перетащите фото для изменения порядка (drag and drop):</h4>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={localObjects.map(img => img.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "15px",
                        flexWrap: "wrap",
                        minHeight: "200px",
                        padding: "10px",
                        border: localObjects.length > 0 ? "2px dashed #e2e8f0" : "none",
                        borderRadius: "8px",
                    }}>
                        {localObjects.map((photo) => (
                            <SortableImage
                                key={photo.id}
                                image={photo}
                                onDelete={onDelete}
                                dopSrc={dopSrc}
                                dopSrcGlobal={dopSrcGlobal}
                            />
                        ))}

                        {localObjects.length === 0 && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "200px",
                                color: "#a0aec0",
                                border: "2px dashed #cbd5e0",
                                borderRadius: "8px",
                            }}>
                                <p>Добавьте изображения, используя редактор выше</p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}