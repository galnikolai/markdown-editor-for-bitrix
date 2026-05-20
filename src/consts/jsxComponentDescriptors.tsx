import "@mdxeditor/editor/style.css";
import { JsxComponentDescriptor } from "@mdxeditor/editor";
import { EditorSwiper } from "../MDXComponents/EditorFunctions/EditorSwiper.tsx";
import { EditorImageWithCopyRight } from "../MDXComponents/EditorFunctions/EditorImageWithCopyRight.tsx";
import ColumnsArticleEditor from "../MDXComponents/EditorFunctions/ColumnsArticleEditor.tsx";
import GenericJsxEditorWithDelete from "../HelpComponents/GenericJsxEditorWithDelete.tsx";

export const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: "u",
    kind: "text",
    props: [],
    hasChildren: true,
    //@ts-ignore
    Editor: ({ ...props }) => <u>{props.children}</u>,
  },
  {
    name: "ImgsSwiper",
    kind: "text",
    props: [{ name: "objects", type: "expression" }],
    hasChildren: false,
    Editor: EditorSwiper,
  },
  {
    name: "ImageWithCopyRight",
    kind: "text",
    props: [
      { name: "img", type: "expression" },
      { name: "copyright", type: "string" },
      { name: "copyRightColor", type: "string" },
      { name: "id", type: "string" },
    ],
    hasChildren: false,
    Editor: EditorImageWithCopyRight,
  },
  {
    name: "ColumnsArticle",
    kind: "text",
    props: [{ name: "title", type: "string" }],
    hasChildren: true,
    Editor: ColumnsArticleEditor,
  },
  {
    name: "RedText",
    kind: "text",
    props: [
      { name: "text", type: "string" },
    ],
    hasChildren: false,
    Editor: GenericJsxEditorWithDelete,
  },
  {
    name: "QuotePersonBlock",
    kind: "text",
    props: [
      { name: "quote", type: "string" },
      { name: "img", type: "string" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
    ],
    hasChildren: false,
    Editor: GenericJsxEditorWithDelete,
  },
  {
    name: "RutubeVideo",
    kind: "text",
    props: [
      { name: "id", type: "string" },
    ],
    hasChildren: false,
    Editor: GenericJsxEditorWithDelete,
  },
  {
    name: "VkVideo",
    kind: "text",
    props: [
      { name: "id", type: "string" },
    ],
    hasChildren: false,
    Editor: GenericJsxEditorWithDelete,
  },
  {
    name: "NewsPageButton",
    kind: "text",
    props: [
      { name: "buttonText", type: "string" },
      { name: "link", type: "string" },
    ],
    hasChildren: false,
    Editor: GenericJsxEditorWithDelete,
  },
];
