import { useState, useCallback, useContext } from "react";
import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";
import { IImgWithCopyRight } from "../MDXComponents/ImageWithCopyRight";
import ImgsSwiper from "../MDXComponents/ImgsSwiper";
import { DopImgSrcGlobalContext } from "../contexts/DopImgSrcProvider";
import { serializeSwiperObjects } from "../consts/functions";

const SwiperAdd = ({ title }: { title: string }) => {
    const { dopSrcGlobal } = useContext(DopImgSrcGlobalContext);
    const [images, setImages] = useState<IImgWithCopyRight[]>([]);

    const handleAddImage = useCallback((image: IImgWithCopyRight) => {
        setImages(prev => [...prev, image]);
    }, []);

    const handleDeleteImage = useCallback((imageToDelete: IImgWithCopyRight) => {
        setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
    }, []);

    const handleUpdateImage = useCallback((image: IImgWithCopyRight) => {
        setImages(prev => prev.map(img => img.id === image.id ? image : img));
    }, []);

    const handleReorderImages = useCallback((reorderedImages: IImgWithCopyRight[]) => {
        setImages(reorderedImages);
    }, []);

    // Функция для получения динамических пропсов
    const getDynamicProps = useCallback(() => {
        // Формируем строку объектов для атрибута
        const objectsValue =
            images.length > 0 ? serializeSwiperObjects(images) : "[]";

        return {
            objects: objectsValue
        };
    }, [images]);

    // Предпросмотр компонента
    const previewComponent = (
        <div>
            {images.length > 0 ? (
                <div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        {images.slice(0, 3).map((img, index) => (
                            <div key={img.id} style={{ position: 'relative' }}>
                                <img
                                    src={img.img.src}
                                    alt={img.img.alt}
                                    style={{
                                        width: '80px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '1px 4px',
                                    borderRadius: '2px'
                                }}>
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                        {images.length > 3 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '80px',
                                height: '60px',
                                background: '#edf2f7',
                                borderRadius: '4px',
                                border: '1px dashed #cbd5e0'
                            }}>
                <span style={{ fontSize: '12px', color: '#718096' }}>
                  +{images.length - 3}
                </span>
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>
                        Изображений: {images.length}
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60px',
                    background: '#f7fafc',
                    borderRadius: '4px',
                    border: '1px dashed #cbd5e0',
                    color: '#a0aec0',
                    fontStyle: 'italic'
                }}>
                    Добавьте изображения в свайпер
                </div>
            )}
        </div>
    );

    // Кастомный контент - компонент управления свайпером
    const customContent = (
        <div style={{ marginBottom: '16px' }}>
            <ImgsSwiper
                onAdd={handleAddImage}
                onDelete={handleDeleteImage}
                onUpdate={handleUpdateImage}
                onReorder={handleReorderImages}
                objects={images}
                dopSrc={dopSrcGlobal}
            />
        </div>
    );

    return (
        <JsxComponentSetter
            title={title}
            iconSrc={"src/assets/swiper.svg"}
            tsx={{
                name: "ImgsSwiper",
                kind: "flow",
                hasChildren: false,
                props: [
                    { name: "objects", default: "[]" }
                ],
            }}
            mode="expandable"
            previewComponent={previewComponent}
            getDynamicProps={getDynamicProps}
            customContent={customContent}
        />
    );
};

export default SwiperAdd;