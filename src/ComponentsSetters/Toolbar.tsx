import {
  BoldItalicUnderlineToggles,
  CreateLink,
  UndoRedo,
} from "@mdxeditor/editor";
import RedTextAdd from "./RedTextAdd";
import PhotoAdd from "./PhotoAdd";
import SwiperAdd from "./SwiperAdd";
import ArticleAdd from "./ArtcileAdd";
import NewsPageButtonAdd from "./NewsPageButtonAdd";
import "@mdxeditor/editor/style.css";
import QuoteAdd from "./QuoteAdd";
import RutubeVideoAdd from "./RutubeVideoAdd";
import VkVideoAdd from "./VkVideoAdd";

const ToolBar = ({ isShort = false }: { isShort?: boolean }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: "30px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <UndoRedo />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <p>Изменение текста:</p>
          <BoldItalicUnderlineToggles />
          <RedTextAdd title="добавить красный текст" />
          <CreateLink />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {!isShort && (
            <>
              <p>Картинка:</p>
              <PhotoAdd title="Добавить Фото" />
            </>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: "10px",
          alignItems: "center",
        }}
      >
        {!isShort && (
          <>
            <p>Компоненты:</p>
            <SwiperAdd title="Компонент Swiper" />
            <ArticleAdd title="Добавить статью" />
            <NewsPageButtonAdd title="Добавить кнопку со ссылкой" />
            <QuoteAdd title="Добавить цитату" />
            <RutubeVideoAdd title="вставить видео с Rutube" />
            <VkVideoAdd title="вставить видео с vk.com" />
          </>
        )}
      </div>
    </div>
  );
};

export default ToolBar;
