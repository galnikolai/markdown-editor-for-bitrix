import { useCallback, useContext, useEffect, useState } from "react";
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from "mdast-util-mdx-jsx";
import { useMdastNodeUpdater, MdastJsx } from "@mdxeditor/editor";
import ImageWithCopyRight, { IImgWithCopyRight } from "../ImageWithCopyRight";
import { DopImgSrcGlobalContext } from "../../contexts/DopImgSrcProvider";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";
import ButtonForDelete from "../../HelpComponents/ButtonForDelete";
import {
  sanitizeImgWithCopyRight,
  sanitizeQuotesForMdx,
} from "../../consts/functions";

type CustomMdxJsxAttribute = MdxJsxAttribute | MdxJsxExpressionAttribute;

export const EditorImageWithCopyRight = ({
  mdastNode,
}: {
  mdastNode: MdastJsx;
}) => {
  const updateMdastNode = useMdastNodeUpdater();
  const { dopSrcGlobal } = useContext(DopImgSrcGlobalContext);
  const [attributes, setAttributes] = useState<IImgWithCopyRight>({
    img: {
      src: dopSrcGlobal + "src/assets/exemple.jpg",
      alt: "Пример",
    },
    copyright: "",
    id: "1",
  });

  const updatePhoto = useCallback(
    async (value: IImgWithCopyRight) => {
      const sanitized = sanitizeImgWithCopyRight(value);
      setAttributes(sanitized);

      const nodes: CustomMdxJsxAttribute[] = Object.entries(sanitized).map(
        ([key, val]) => {
          return {
            type: "mdxJsxAttribute",
            name: key,
            value:
              key === "img"
                ? {
                    type: "mdxJsxAttributeValueExpression",
                    value: JSON.stringify(val),
                  }
                : val,
          };
        }
      );

      await updateMdastNode({
        type: "mdxJsxFlowElement",
        attributes: nodes,
      });
    },
    [updateMdastNode]
  );

  const init = (mdastNode: MdastJsx) => {
    try {
      if (!mdastNode.attributes) return;

      const initialAttributes: Partial<IImgWithCopyRight> = {};

      mdastNode.attributes.forEach((attr: CustomMdxJsxAttribute) => {
        if (attr.type === "mdxJsxAttribute") {
          if (
            attr.name === "img" &&
            typeof attr.value !== "string" &&
            attr.value?.type === "mdxJsxAttributeValueExpression"
          ) {
            try {
              const parsedImg = JSON.parse(attr.value.value);
              initialAttributes.img = {
                ...parsedImg,
                alt: parsedImg.alt
                  ? sanitizeQuotesForMdx(parsedImg.alt)
                  : parsedImg.alt,
              };
            } catch (e) {
              console.error("Error parsing img attribute:", e);
            }
          } else if (attr.name === "copyright") {
            initialAttributes.copyright = sanitizeQuotesForMdx(
              String(attr.value)
            );
          } else if (attr.name === "id") {
            initialAttributes.id = String(attr.value);
          }
        }
      });

      if (Object.keys(initialAttributes).length > 0) {
        setAttributes((prev) => ({
          img: initialAttributes.img || prev.img,
          copyright: initialAttributes.copyright || prev.copyright,
          id: initialAttributes.id || prev.id,
        }));
      }
    } catch (error) {
      console.error("Error parsing initial attributes:", error);
    }
  };

  useEffect(() => {
    init(mdastNode);
  }, []);

  const [editor] = useLexicalComposerContext();

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      editor.update(() => {
        const target = e.currentTarget.parentElement;
        if (!target) return;

        const node = $getNearestNodeFromDOMNode(target);
        if (node) {
          node.remove();
        }
      });
    },
    [editor]
  );

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        margin: "8px 0",
        padding: "8px",
        border: "1px dashed grey",
      }}
    >
      <ImageWithCopyRight
        {...attributes}
        style={{ width: "100%" }}
        changeAttr={updatePhoto}
      />
      <ButtonForDelete handleDelete={handleDelete} />
    </div>
  );
};
