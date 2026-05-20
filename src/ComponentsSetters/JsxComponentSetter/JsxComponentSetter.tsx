import { Button, insertJsx$ } from "@mdxeditor/editor";
import { usePublisher } from "@mdxeditor/gurx";
import { PhrasingContent, BlockContent, DefinitionContent } from 'mdast';
import { DopImgSrcGlobalContext } from "../../contexts/DopImgSrcProvider";
import { useContext, useState, ReactNode } from "react";

interface IJsxComponentSetter {
    title: string;
    iconSrc: string;
    tsx: {
        kind: "text";
        name: string;
        hasChildren: boolean;
        props: { name: string; default: string }[];
        children?: PhrasingContent[];
    } | {
        kind: "flow";
        name: string;
        props: { name: string; default: string }[];
        hasChildren: boolean;
        children?: (BlockContent | DefinitionContent)[];
    };
    // Новые опциональные пропсы для расширенного режима
    mode?: 'simple' | 'expandable'; // Режим работы
    previewComponent?: ReactNode; // Компонент для предпросмотра
    getDynamicProps?: () => Record<string, any>; // Функция для получения динамических пропсов
    customContent?: ReactNode; // Кастомный контент для расширенного режима
}

const JsxComponentSetter = (props: IJsxComponentSetter) => {
    const {
        tsx,
        title,
        iconSrc,
        mode = 'simple',

        getDynamicProps,

    } = props;

    const { dopSrcGlobal } = useContext(DopImgSrcGlobalContext);
    const insertJsx = usePublisher(insertJsx$);
    const [isExpanded, setIsExpanded] = useState(false);

    const transformProps = (props: { name: string; default: string }[]): Record<string, string> => {
        return props.reduce((acc, prop) => {
            acc[prop.name] = prop.default;
            return acc;
        }, {} as Record<string, string>);
    };

    const handleInsert = () => {
        // Если есть функция для получения динамических пропсов, используем ее
        const propsToUse = getDynamicProps ? getDynamicProps() : transformProps(tsx.props);

        const transformedTsx = {
            ...tsx,
            props: propsToUse
        };

        insertJsx(transformedTsx);
    };

    // Простой режим (как было раньше) - только кнопка
    if (mode === 'simple') {
        return (
            <Button
                title={title}
                type="button"
                onClick={handleInsert}
            >
                <img src={dopSrcGlobal + iconSrc} width={25} height={25} alt={title} />
            </Button>
        );
    }

    // Расширенный режим с предпросмотром и дополнительным UI
    return (
        <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginBottom: '12px',

        }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f7fafc',
                    cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={handleInsert}>
                    <img
                        src={dopSrcGlobal + iconSrc}
                        width={30}
                        height={30}
                        alt={title}
                        style={{ borderRadius: '4px' }}
                    />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{title}</span>
                </div>

            </div>


        </div>
    );
};

export default JsxComponentSetter;