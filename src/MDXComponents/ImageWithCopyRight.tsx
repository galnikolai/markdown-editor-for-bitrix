import { memo, useState } from "react";
import { generateRandomId } from "../consts/functions";

export interface IImgWithCopyRight {
  img: {
    src: string;
    alt?: string;
  };
  copyright?: string;
  id: string;
  style?: React.CSSProperties;
  dopSrc?: string;
  copyRightColor?: string;
}

export interface IImgWithCopyRightExtends extends IImgWithCopyRight {
  changeAttr?: (attrs: IImgWithCopyRight) => void;
}

const ImageWithCopyRight = ({
  img,
  copyright,
  style = {},
  dopSrc,
  copyRightColor = "white",
  changeAttr,
}: IImgWithCopyRightExtends) => {
  const [isViewEditor, setIsViewEditor] = useState(false);
  const [formData, setFormData] = useState({
    imgSrc: "",
    imgAlt: "Картинка",
    copyright: copyright,
    copyRightColor: copyRightColor,
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleAddPhoto = () => {
    const newImg: IImgWithCopyRight = {
      img: { src: formData.imgSrc, alt: formData.imgAlt || "Картинка" },
      copyright: formData.copyright,
      copyRightColor:
        formData.copyRightColor === "" ? "white" : formData.copyRightColor,
      id: generateRandomId(),
    };
    if (changeAttr) changeAttr(newImg);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      {changeAttr && (
        <>
          <button
            type="button"
            style={{ padding: 5 }}
            onClick={() => setIsViewEditor((prev) => !prev)}
          >
            {isViewEditor ? "Скрыть editor" : "Показать editor"}
          </button>
          {isViewEditor && (
            <>
              <label htmlFor="imgSrc">Введите ссылку на картинку:</label>
              <input
                id="imgSrc"
                style={{
                  padding: "10px",
                  borderBottom: "1px solid black",
                  borderRadius: "10px",
                }}
                type="text"
                value={formData.imgSrc}
                onChange={handleChange("imgSrc")}
              />
              <label htmlFor="imgAlt">
                Введите alt (описание в 2 словах) картинки:
              </label>
              <input
                id="imgAlt"
                style={{
                  padding: "10px",
                  borderBottom: "1px solid black",
                  borderRadius: "10px",
                }}
                type="text"
                value={formData.imgAlt}
                onChange={handleChange("imgAlt")}
              />

              <label htmlFor="copyright">Введите надпись внизу картинки:</label>
              <input
                id="copyright"
                style={{
                  padding: "10px",
                  borderBottom: "1px solid black",
                  borderRadius: "10px",
                }}
                type="text"
                value={formData.copyright}
                onChange={handleChange("copyright")}
              />

              <label htmlFor="copyRightColor">
                Введите цвет надписи картинки:
              </label>
              <input
                id="copyRightColort"
                style={{
                  padding: "10px",
                  borderBottom: "1px solid black",
                  borderRadius: "10px",
                }}
                type="text"
                value={formData.copyRightColor}
                onChange={handleChange("copyRightColor")}
              />
              <button
                type="button"
                style={{ padding: 5 }}
                onClick={handleAddPhoto}
              >
                Изменить картинку
              </button>
            </>
          )}
        </>
      )}
      <div
        style={{
          position: "relative",
          aspectRatio: "1.5/1",
          minWidth: "500px",
          borderRadius: "10px",
          overflow: "hidden",
          padding: "20px",
          display: "flex",
          flexDirection: "row",
          alignItems: "end",
          ...style,
        }}
      >
        <img
          src={(dopSrc ?? "") + img.src}
          alt={img.alt ?? "картинка"}
          width={"100%"}
          height={"100%"}
          style={{
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        />
        {copyright && (
          <p
            style={{
              position: "relative",
              zIndex: 1,
              color: copyRightColor,
              background: "#172c15",
              borderRadius: 8,
              padding: "8px 4px",
            }}
          >
            {copyright}
          </p>
        )}
      </div>
    </div>
  );
};
export default memo(ImageWithCopyRight);
