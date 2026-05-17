import MDEditor from '@uiw/react-md-editor';

/**
 * RichTextEditor wraps @uiw/react-md-editor.
 * It provides a split Markdown editor + live preview with syntax highlighting
 * out of the box (the library bundles highlight.js for code fences).
 *
 * @param {string}   value    - Controlled markdown string
 * @param {Function} onChange - Called with the new markdown string
 */
const RichTextEditor = ({ value, onChange }) => {
  return (
    <div data-color-mode="auto">
      {/*
        data-color-mode="auto" makes the editor follow the user's system preference.
        The parent container's data-theme attribute also controls the rendered preview
        through our global CSS variables.
      */}
      <MDEditor
        value={value}
        onChange={onChange}
        height={500}
        preview="live"
        textareaProps={{
          placeholder: 'Write your post in Markdown...\n\n```javascript\nconsole.log("Hello, SyntaxShare!");\n```',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
