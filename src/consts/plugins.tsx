import {
  AdmonitionDirectiveDescriptor,
  directivesPlugin,
  headingsPlugin,
  JsxComponentDescriptor,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import ToolBar from "../ComponentsSetters/Toolbar";

export const plugins = (jsxComponentDescriptors: JsxComponentDescriptor[], isShort: boolean = false) => [
  directivesPlugin({
    directiveDescriptors: [AdmonitionDirectiveDescriptor],
  }),
  headingsPlugin(),
  quotePlugin(),
  listsPlugin(),
  thematicBreakPlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  markdownShortcutPlugin({ disableKeyboardShortcuts: false, allowHTML: true }),
  jsxPlugin({ jsxComponentDescriptors }),
  toolbarPlugin({
    toolbarContents: () => <ToolBar isShort={isShort} />,
  }),
];
