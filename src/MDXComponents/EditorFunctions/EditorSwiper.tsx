import { useCallback, useEffect, useState } from "react";
import { useMdastNodeUpdater } from "@mdxeditor/editor";
import { MdastJsx } from "@mdxeditor/editor";
import ImgsSwiper from "../ImgsSwiper";
import { IImgWithCopyRight } from "../ImageWithCopyRight";
import {
    sanitizeImgWithCopyRight,
    sanitizeQuotesForMdx,
} from "../../consts/functions";
import ButtonForDelete from "../../HelpComponents/ButtonForDelete";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";

type CustomMdxJsxAttribute = {
    type: string;
    name: string;
    value: string | { type: string; value: string };
};

interface EditorSwiperProps {
    mdastNode: MdastJsx;
}

export const EditorSwiper = ({ mdastNode }: EditorSwiperProps) => {
    const updateMdastNode = useMdastNodeUpdater();
    const [objects, setObjects] = useState<IImgWithCopyRight[]>([]);

    const updateString = useCallback((mdastNode: MdastJsx) => {
        try {
            if (mdastNode.attributes) {
                const objectsAttr = mdastNode.attributes.find(
                    (attr: any) => attr.name === "objects"
                ) as CustomMdxJsxAttribute;

                if (objectsAttr?.value) {
                    const valueString =
                        typeof objectsAttr.value === "string"
                            ? objectsAttr.value
                            : objectsAttr.value.value;

                    if (valueString) {
                        const fixedJsonString = valueString
                            .replace(/"(\w+)":/g, '"$1":')
                            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
                            .replace(/"https:"/g, "https:")
                            .replace(/:\s*"/g, ': "');

                        const parsedObjects = JSON.parse(fixedJsonString);
                        if (Array.isArray(parsedObjects)) {
                            setObjects(
                                parsedObjects.map((item: IImgWithCopyRight) =>
                                    sanitizeImgWithCopyRight(item)
                                )
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error parsing initial objects:", error);
        }
    }, []);

    useEffect(() => {
        updateString(mdastNode);
    }, [mdastNode, updateString]);

    const mapImgWithCRToMDastNode = useCallback(
        (arr: IImgWithCopyRight[]): any => {
            const value = {
                type: "mdxJsxExpressionAttribute",
                value: `[${arr
                    .map(
                        (item) =>
                            `{ id: "${item.id}", img: { src: "${item.img.src}", alt: "${
                                item.img.alt
                                    ? sanitizeQuotesForMdx(item.img.alt)
                                    : ""
                            }" }, copyright: "${
                                item.copyright
                                    ? sanitizeQuotesForMdx(item.copyright)
                                    : ""
                            }", copyRightColor: "${item.copyRightColor}" }`
                    )
                    .join(", ")}]`,
            };

            const updatedAttributes: CustomMdxJsxAttribute[] = [
                {
                    type: "mdxJsxAttribute",
                    name: "objects",
                    value: value,
                },
            ];
            return {
                attributes: updatedAttributes as any,
            };
        },
        []
    );

    const handleAdd = useCallback(
        (val: IImgWithCopyRight) => {
            setObjects((prev) => {
                const res = [...prev, val];
                updateMdastNode(mapImgWithCRToMDastNode(res));
                return res;
            });
        },
        [updateMdastNode, mapImgWithCRToMDastNode]
    );

    const handleDelete = useCallback(
        (val: IImgWithCopyRight) => {
            setObjects((prev) => {
                const res = prev.filter((old) => old.id !== val.id);
                updateMdastNode(mapImgWithCRToMDastNode(res));
                return res;
            });
        },
        [updateMdastNode, mapImgWithCRToMDastNode]
    );

    const handleReorder = useCallback(
        (reorderedImages: IImgWithCopyRight[]) => {
            setObjects(reorderedImages);
            updateMdastNode(mapImgWithCRToMDastNode(reorderedImages));
        },
        [updateMdastNode, mapImgWithCRToMDastNode]
    );

    const [editor] = useLexicalComposerContext();

    const handleDeleteSwiper = useCallback(
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
                border: "1px dashed transparent",
            }}
        >
            <ImgsSwiper
                onAdd={handleAdd}
                onDelete={handleDelete}
                onReorder={handleReorder}
                objects={objects}
            />
            <ButtonForDelete handleDelete={handleDeleteSwiper} />
        </div>
    );
};