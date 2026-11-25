'use client'

import { useContext, useState, useEffect, useRef } from "react";
import AddPhoto, { AddPhotoRef } from "../HelpComponents/AddPhoto";
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
    onUpdate?: (val: IImgWithCopyRight) => void,
    onReorder?: (images: IImgWithCopyRight[]) => void,
    dopSrc?: string;
    objects?: IImgWithCopyRight[]
}

function SortableImage({
    image,
    onDelete,
    onEdit,
    dopSrcGlobal
}: {
    image: IImgWithCopyRight,
    onDelete: (img: IImgWithCopyRight) => void,
    onEdit: (img: IImgWithCopyRight) => void,
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
            <div style={{ position: "relative" }}>
                <button
                    type="button"
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={dopSrcGlobal + 'src/assets/cross.svg'}
                        alt="Удалить"
                        style={{ width: '15px', height: '15px' }}
                    />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(image);
                    }}
                    style={{
                        height: "30px",
                        padding: "5px 10px",
                        position: "absolute",
                        left: "10px",
                        top: "10px",
                        borderRadius: "8px",
                        zIndex: 1,
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                    }}
                >
                    Редактировать
                </button>
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
                {image.copyright && image.copyright !== "undefined" && (
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        right: '10px',
                        background: '#172c15',
                        color: image.copyRightColor || '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        width: 'max-content',
                        maxWidth: '70%',
                    }}>
                        {image.copyright.startsWith("© ") ? "" : "© "}
                        {image.copyright}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ImgsSwiper({
    onAdd,
    onDelete,
    onUpdate,
    onReorder,
    objects = []
}: ISwiper) {
    const [isVisibleEdit, setIsVisibleEdit] = useState<boolean>(false);
    const [editingImage, setEditingImage] = useState<IImgWithCopyRight | null>(null);
    const { dopSrcGlobal } = useContext(DopImgSrcGlobalContext);
    const [localObjects, setLocalObjects] = useState<IImgWithCopyRight[]>(objects);
    const addPhotoRef = useRef<AddPhotoRef>(null);

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

            setLocalObjects(newOrder);

            if (onReorder) {
                onReorder(newOrder);
            }
        }
    };

    const changeVisibilityEdit = () => {
        setIsVisibleEdit((prev) => {
            if (prev) {
                setEditingImage(null);
            }
            return !prev;
        });
    };

    const handleEdit = (image: IImgWithCopyRight) => {
        setEditingImage(image);
        setIsVisibleEdit(true);

        setTimeout(() => {
            document.querySelector(".image-editor-section")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            addPhotoRef.current?.setEditingData(image);
        }, 100);
    };

    const handlePhotoSubmit = (photo: IImgWithCopyRight) => {
        if (editingImage) {
            setLocalObjects((prev) =>
                prev.map((item) => (item.id === editingImage.id ? photo : item))
            );
            onUpdate?.(photo);
            setEditingImage(null);
            setIsVisibleEdit(false);
        } else {
            onAdd(photo);
            setIsVisibleEdit(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingImage(null);
    };

    useEffect(() => {
        setLocalObjects(objects);
    }, [objects]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                    type="button"
                    style={{
                        padding: "10px 20px",
                        borderRadius: "6px",
                        background: isVisibleEdit ? "#e53e3e" : "#4299e1",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "background-color 0.2s",
                    }}
                    onClick={changeVisibilityEdit}
                >
                    {isVisibleEdit ? "Скрыть редактор" : "Показать редактор"}
                </button>

                {editingImage && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "6px",
                            background: "#805ad5",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Отменить редактирование
                    </button>
                )}
            </div>

            {isVisibleEdit && (
                <div
                    className="image-editor-section"
                    style={{
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "20px",
                        backgroundColor: "#f8fafc",
                    }}
                >
                    <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#2d3748" }}>
                        {editingImage ? "Редактирование изображения" : "Добавление нового изображения"}
                    </h3>
                    <AddPhoto
                        ref={addPhotoRef}
                        updatePhoto={handlePhotoSubmit}
                        editingImage={editingImage}
                        onCancelEdit={handleCancelEdit}
                    />
                </div>
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
                                onEdit={handleEdit}
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
