import JsxComponentSetter from "./JsxComponentSetter/JsxComponentSetter";

const ArticleAdd = ({ title }: { title: string }) => {
  return (
    <JsxComponentSetter
      title={title}
      iconSrc={"src/assets/article.svg"}
      tsx={{
        name: "ColumnsArticle",
        kind: "flow",
        hasChildren: false,
        props: [{name: 'title', default: 'Заголовок'}],
      }}
    />
  );
};
export default ArticleAdd;
