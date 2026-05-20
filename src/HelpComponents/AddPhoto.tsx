'use client'

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from "react";
import { IImgWithCopyRight } from "../MDXComponents/ImageWithCopyRight";
import { sanitizeQuotesForMdx } from "../consts/functions";

interface IAddPhoto {
    updatePhoto: (photo: IImgWithCopyRight) => void;
}

// Типы для ответа API
/*
interface UploadResponse {
    success: boolean;
    url?: string;
    error?: string;
    name?: string;
    size?: number;
    type?: string;
}
*/
export default function AddPhoto({ updatePhoto }: IAddPhoto) {
    const [imgSrc, setImgSrc] = useState<string>("");
    const [imgAlt, setImgAlt] = useState<string>("");
    const [copyright, setCopyright] = useState<string>("");
    const [copyRightColor, setCopyRightColor] = useState<string>("#ffffff");
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);
// Функция для получения полного URL с доменом
    const getFullImageUrl = useCallback((relativeUrl: string): string => {
        // Если уже полный URL (начинается с http://, https://, data: или //)
        if (
            relativeUrl.startsWith('http://') ||
            relativeUrl.startsWith('https://') ||
            relativeUrl.startsWith('data:') ||
            relativeUrl.startsWith('//')
        ) {
            return relativeUrl;
        }

        // Добавляем текущий домен к относительному пути
        const currentOrigin = window.location.origin;

        // Если путь начинается с /, просто добавляем origin
        if (relativeUrl.startsWith('/')) {
            return `${currentOrigin}${relativeUrl}`;
        }

        // Если путь без начального /, добавляем и его
        return `${currentOrigin}/${relativeUrl}`;
    }, []);
    // Функция для загрузки файла на сервер
    // В функции uploadToServer в AddPhoto.tsx
    const uploadToServer = useCallback(async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload_image.php', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Ошибка загрузки');
            }

            // Преобразуем относительный URL в абсолютный с доменом
            const fullUrl = getFullImageUrl(result.url);
            return fullUrl;
        } catch (error) {
            console.error('Upload error:', error);

            // Fallback на base64 для маленьких файлов
            if (file.size < 500000) { // 500KB
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve(e.target?.result as string);
                    };
                    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
                    reader.readAsDataURL(file);
                });
            }

            throw new Error('Файл слишком большой для загрузки без сервера');
        }
    }, [getFullImageUrl]); // Добавляем зависимость

    // Обработка перетаскивания файла
    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setUploadError("");
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setUploadError("");

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await handleFileSelect(files[0]);
        }
    }, []);

    // Обработка выбора файла через input
    const handleFileInputChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleFileSelect(e.target.files[0]);
        }
    }, []);

    const handleFileSelect = useCallback(async (file: File) => {
        // Проверяем тип файла
        if (!file.type.match('image.*')) {
            setUploadError("Пожалуйста, выберите файл изображения (JPEG, PNG, GIF, etc.)");
            return;
        }

        // Проверяем размер файла
        if (file.size > 10 * 1024 * 1024) {
            setUploadError("Файл слишком большой. Максимальный размер: 10MB");
            return;
        }

        setUploadedFile(file);
        setUploadError("");

        // Создаем превью
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const dataUrl = event.target.result as string;
                setPreviewUrl(dataUrl);
            }
        };
        reader.readAsDataURL(file);

        // Загружаем на сервер
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Симулируем прогресс для UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            // Загружаем файл на сервер
            const serverUrl = await uploadToServer(file);

            clearInterval(progressInterval);
            setUploadProgress(100);
            setImgSrc(serverUrl);

            // Автоматически заполняем alt из имени файла
            if (!imgAlt.trim()) {
                const fileName = file.name.replace(/\.[^/.]+$/, "");
                setImgAlt(fileName);
            }

            setTimeout(() => setIsUploading(false), 500);

        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError(error instanceof Error ? error.message : 'Ошибка загрузки файла');
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [uploadToServer, imgAlt]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!imgSrc.trim() && !uploadedFile) {
            setUploadError("Выберите файл или введите ссылку на изображение");
            return;
        }

        if (!imgSrc.trim()) {
            setUploadError("Сначала загрузите изображение");
            return;
        }

        const altValue = sanitizeQuotesForMdx(
            imgAlt.trim() || `Изображение ${new Date().toLocaleDateString()}`
        );
        const newPhoto: IImgWithCopyRight = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            img: {
                src: imgSrc,
                alt: altValue,
            },
            copyright: copyright.trim()
                ? sanitizeQuotesForMdx(copyright.trim())
                : undefined,
            copyRightColor: copyRightColor !== "#000000" ? copyRightColor : undefined
        };

        updatePhoto(newPhoto);

        // Сброс формы
        clearForm();
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setPreviewUrl("");
        setImgSrc("");
        setUploadProgress(0);
        setIsUploading(false);
        setUploadError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const clearForm = () => {
        setImgSrc("");
        setImgAlt("");
        setCopyright("");
        setCopyRightColor("#ffffff");
        setUploadedFile(null);
        setPreviewUrl("");
        setUploadProgress(0);
        setIsUploading(false);
        setUploadError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Функция для получения контрастного цвета текста
    const getContrastColor = (hexColor: string): string => {
        if (!hexColor || hexColor.length < 7) return "#000000";

        try {
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);

            // Рассчитываем яркость по формуле
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            return brightness > 128 ? "#000000" : "#ffffff";
        } catch {
            return "#000000";
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                {/* Блок загрузки файла */}
                <div>
                    <h4 style={{ marginBottom: "10px" }}>Загрузите изображение с компьютера:</h4>

                    {/* Область перетаскивания */}
                    <div
                        style={{
                            border: isDragging ? "3px dashed #4299e1" : "2px dashed #cbd5e0",
                            borderRadius: "8px",
                            padding: "30px 20px",
                            textAlign: "center",
                            cursor: isUploading ? "not-allowed" : "pointer",
                            backgroundColor: isDragging ? "#ebf8ff" : "#f7fafc",
                            opacity: isUploading ? 0.7 : 1,
                            transition: "all 0.3s ease",
                            marginBottom: "15px"
                        }}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={isUploading ? undefined : triggerFileInput}
                    >
                        <div style={{ fontSize: "48px", color: "#a0aec0", marginBottom: "10px" }}>
                            {isUploading ? "⏳" : "📁"}
                        </div>

                        {isUploading ? (
                            <div>
                                <p style={{ marginBottom: "10px", color: "#4a5568", fontWeight: "500" }}>
                                    Загрузка {uploadProgress}%
                                </p>
                                <div style={{
                                    width: "100%",
                                    height: "8px",
                                    background: "#e2e8f0",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    margin: "0 auto"
                                }}>
                                    <div style={{
                                        width: `${uploadProgress}%`,
                                        height: "100%",
                                        background: "#4299e1",
                                        transition: "width 0.3s ease",
                                        borderRadius: "4px"
                                    }} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={{ marginBottom: "5px", color: "#4a5568", fontWeight: "500" }}>
                                    Перетащите изображение сюда
                                </p>
                                <p style={{ fontSize: "14px", color: "#a0aec0", marginBottom: "15px" }}>
                                    или нажмите для выбора файла
                                </p>
                                <p style={{ fontSize: "12px", color: "#a0aec0" }}>
                                    Поддерживаются: JPEG, PNG, GIF, WebP (до 10MB)
                                </p>
                            </>
                        )}

                        {/* Скрытый input для файла */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            style={{ display: "none" }}
                            disabled={isUploading}
                        />
                    </div>

                    {/* Превью загруженного файла */}
                    {uploadedFile && previewUrl && (
                        <div style={{
                            marginBottom: "15px",
                            padding: "15px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            backgroundColor: "#f9f9f9"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "10px"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                        border: "1px solid #e2e8f0"
                                    }}>
                                        <img
                                            src={previewUrl}
                                            alt="Превью"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: "500", marginBottom: "2px" }}>
                                            {uploadedFile.name}
                                        </p>
                                        <p style={{ fontSize: "12px", color: "#718096" }}>
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                {!isUploading && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            fontSize: "20px",
                                            cursor: "pointer",
                                            color: "#e53e3e",
                                            padding: "5px"
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* URL загруженного изображения */}
                            {imgSrc && !imgSrc.startsWith('data:') && (
                                <div style={{
                                    marginTop: "10px",
                                    padding: "8px",
                                    background: "#e6fffa",
                                    borderRadius: "4px",
                                    border: "1px solid #81e6d9"
                                }}>
                                    <div style={{ fontSize: "12px", color: "#234e52", marginBottom: "4px" }}>
                                        Изображение загружено на сервер:
                                    </div>
                                    <div style={{
                                        fontSize: "11px",
                                        color: "#2d3748",
                                        wordBreak: "break-all",
                                        fontFamily: "monospace"
                                    }}>
                                        {imgSrc}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Сообщение об ошибке */}
                    {uploadError && (
                        <div style={{
                            marginBottom: "15px",
                            padding: "12px",
                            background: "#fff5f5",
                            border: "1px solid #fed7d7",
                            borderRadius: "6px",
                            color: "#c53030"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "18px" }}>⚠️</span>
                                <span>{uploadError}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Разделитель */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "10px 0",
                    gap: "10px"
                }}>
                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                    <span style={{ color: "#a0aec0", fontSize: "14px" }}>ИЛИ</span>
                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                </div>

                {/* Прямая ссылка на изображение */}
                <div>
                    <label htmlFor="imgSrc" style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#4a5568"
                    }}>
                        Вставьте ссылку на изображение:
                    </label>
                    <input
                        id="imgSrc"
                        type="text"
                        value={imgSrc}
                        onChange={(e) => {
                            setImgSrc(e.target.value);
                            setUploadError("");
                        }}
                        placeholder="https://example.com/image.jpg или /upload/image.png"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "14px"
                        }}
                        disabled={isUploading}
                    />
                </div>

                {/* Описание изображения */}
                <div>
                    <label htmlFor="imgAlt" style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#4a5568"
                    }}>
                        Описание изображения (alt):
                        <span style={{ fontSize: "12px", color: "#718096", marginLeft: "5px" }}>
              (опционально)
            </span>
                    </label>
                    <input
                        id="imgAlt"
                        type="text"
                        value={imgAlt}
                        onChange={(e) =>
                            setImgAlt(sanitizeQuotesForMdx(e.target.value))
                        }
                        placeholder="Описание изображения для доступности"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "14px"
                        }}
                        disabled={isUploading}
                    />
                </div>

                {/* Копирайт */}
                <div>
                    <label htmlFor="copyright" style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#4a5568"
                    }}>
                        Копирайт (автор):
                        <span style={{ fontSize: "12px", color: "#718096", marginLeft: "5px" }}>
              (опционально)
            </span>
                    </label>
                    <input
                        id="copyright"
                        type="text"
                        value={copyright}
                        onChange={(e) =>
                            setCopyright(sanitizeQuotesForMdx(e.target.value))
                        }
                        placeholder="Автор изображения"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            fontSize: "14px"
                        }}
                        disabled={isUploading}
                    />
                </div>

                {/* Цвет копирайта */}
                <div>
                    <label htmlFor="copyRightColor" style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#4a5568"
                    }}>
                        Цвет копирайта:
                        <span style={{ fontSize: "12px", color: "#718096", marginLeft: "5px" }}>
              (опционально)
            </span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                            id="copyRightColor"
                            type="color"
                            value={copyRightColor}
                            onChange={(e) => setCopyRightColor(e.target.value)}
                            style={{
                                width: "50px",
                                height: "40px",
                                borderRadius: "4px",
                                border: "1px solid #e2e8f0",
                                cursor: "pointer"
                            }}
                            disabled={isUploading}
                        />
                        <span style={{
                            padding: "8px 12px",
                            background: copyRightColor,
                            color: getContrastColor(copyRightColor),
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "500",
                            border: "1px solid rgba(0,0,0,0.1)"
                        }}>
              Предпросмотр цвета
            </span>
                    </div>
                </div>

                {/* Кнопки управления */}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                        type="submit"
                        disabled={isUploading || (!imgSrc.trim() && !uploadedFile)}
                        style={{
                            flex: 1,
                            padding: "12px 24px",
                            background: isUploading || (!imgSrc.trim() && !uploadedFile)
                                ? "#cbd5e0"
                                : "#4299e1",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isUploading || (!imgSrc.trim() && !uploadedFile)
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "600",
                            fontSize: "16px",
                            transition: "background-color 0.2s"
                        }}
                    >
                        {isUploading ? "Загрузка..." : "Добавить фото"}
                    </button>

                    <button
                        type="button"
                        onClick={clearForm}
                        disabled={isUploading}
                        style={{
                            padding: "12px 24px",
                            background: "#e2e8f0",
                            color: "#4a5568",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isUploading ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            fontSize: "16px",
                            transition: "background-color 0.2s"
                        }}
                    >
                        Очистить
                    </button>
                </div>
            </form>
        </div>
    );
}