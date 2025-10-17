import React, { useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

/**
 * SimpleRichTextEditor - Editor HTML nativo sin dependencias externas
 * Usa contentEditable y document.execCommand para evitar conflictos con extensiones
 */
const SimpleRichTextEditor = forwardRef(({ value, onChange, placeholder, className = '' }, ref) => {
  const editorRef = useRef(null);
  const isUpdating = useRef(false);

  // Exponer método insertContent para el padre
  useImperativeHandle(ref, () => ({
    insertContent: (html) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertHTML', false, html);
        if (onChange) {
          isUpdating.current = true;
          onChange(editorRef.current.innerHTML);
          setTimeout(() => { isUpdating.current = false; }, 0);
        }
      }
    },
    focus: () => {
      editorRef.current?.focus();
    }
  }), [onChange]);

  // Manejar cambios en el editor (definir primero para usarlo en otros hooks)
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      isUpdating.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => { isUpdating.current = false; }, 0);
    }
  }, [onChange]);

  // Sincronizar contenido externo con el editor
  useEffect(() => {
    if (editorRef.current && !isUpdating.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Hacer imágenes redimensionables y movibles
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleImageClick = (e) => {
      if (e.target.tagName === 'IMG') {
        e.target.setAttribute('contenteditable', 'true');
        e.target.focus();
        
        // Permitir redimensionamiento con la esquina
        e.target.style.resize = 'both';
        e.target.style.overflow = 'hidden';
        e.target.style.display = 'inline-block';
        
        // Agregar controles de ancho
        const currentWidth = e.target.style.maxWidth || '300px';
        const newWidth = prompt('Ancho de la imagen (ej: 200px, 50%, 300px):', currentWidth);
        if (newWidth) {
          e.target.style.maxWidth = newWidth;
          e.target.style.width = newWidth;
          handleInput();
        }
      }
    };

    editor.addEventListener('click', handleImageClick);
    return () => editor.removeEventListener('click', handleImageClick);
  }, [handleInput]);

  // Ejecutar comandos de formato
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput(); // Notificar cambio
  }, [handleInput]);

  // Toolbar buttons
  const toolbarButtons = [
    { command: 'bold', icon: BoldIcon, title: 'Negrita (Ctrl+B)' },
    { command: 'italic', icon: ItalicIcon, title: 'Cursiva (Ctrl+I)' },
    { command: 'underline', icon: UnderlineIcon, title: 'Subrayado (Ctrl+U)' },
    { command: 'insertUnorderedList', icon: ListBulletIcon, title: 'Lista con viñetas' },
    { command: 'insertOrderedList', icon: NumberedListIcon, title: 'Lista numerada' },
  ];

  const handleLink = useCallback(() => {
    const url = prompt('Ingresa la URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const handleImage = useCallback(() => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url) {
      execCommand('insertImage', url);
    }
  }, [execCommand]);

  // Manejar paste para limpiar formato
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Format dropdown */}
        <select
          onChange={(e) => {
            execCommand('formatBlock', e.target.value);
            e.target.value = 'p'; // Reset
          }}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
          defaultValue="p"
        >
          <option value="p">Párrafo</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
          <option value="h4">Título 4</option>
        </select>

        {/* Font family dropdown */}
        <select
          onChange={(e) => {
            execCommand('fontName', e.target.value);
          }}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
          defaultValue=""
        >
          <option value="">Fuente</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Impact">Impact</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
        </select>

        {/* Font size dropdown */}
        <select
          onChange={(e) => {
            execCommand('fontSize', e.target.value);
          }}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
          defaultValue=""
        >
          <option value="">Tamaño</option>
          <option value="1">Muy pequeño</option>
          <option value="2">Pequeño</option>
          <option value="3">Normal</option>
          <option value="4">Mediano</option>
          <option value="5">Grande</option>
          <option value="6">Muy grande</option>
          <option value="7">Extra grande</option>
        </select>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Text color */}
        <label 
          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
          title="Color de texto"
        >
          <span>A</span>
          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            className="w-5 h-5 cursor-pointer"
          />
        </label>

        {/* Background color */}
        <label 
          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
          title="Color de fondo"
        >
          <span>🎨</span>
          <input
            type="color"
            onChange={(e) => execCommand('hiliteColor', e.target.value)}
            className="w-5 h-5 cursor-pointer"
          />
        </label>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Format buttons */}
        {toolbarButtons.map(({ command, icon: Icon, title }) => (
          <button
            key={command}
            type="button"
            onClick={() => execCommand(command)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title={title}
          >
            <Icon className="h-4 w-4 text-gray-700" />
          </button>
        ))}

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Alignment buttons */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Alinear a la izquierda"
        >
          <span className="text-xs font-bold">⇤</span>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Centrar"
        >
          <span className="text-xs font-bold">≡</span>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Alinear a la derecha"
        >
          <span className="text-xs font-bold">⇥</span>
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyFull')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Justificar"
        >
          <span className="text-xs font-bold">⊟</span>
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Link button */}
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Insertar enlace"
        >
          <LinkIcon className="h-4 w-4 text-gray-700" />
        </button>

        {/* Image button */}
        <button
          type="button"
          onClick={handleImage}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Insertar imagen"
        >
          <PhotoIcon className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Clear formatting button */}
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
          title="Limpiar formato"
        >
          ✕ Formato
        </button>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="min-h-[300px] sm:min-h-[450px] p-4 focus:outline-none overflow-y-auto prose prose-sm max-w-none"
        style={{
          lineHeight: '1.6',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif'
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          display: inline-block;
          margin: 10px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        [contenteditable] img:hover {
          border-color: #3b82f6;
        }
        [contenteditable] img:focus {
          border-color: #2563eb;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        [contenteditable] img::selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        [contenteditable] ul,
        [contenteditable] ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] h1,
        [contenteditable] h2,
        [contenteditable] h3 {
          margin: 0.8em 0 0.5em 0;
          font-weight: 600;
        }
        [contenteditable] h1 { font-size: 1.8em; }
        [contenteditable] h2 { font-size: 1.5em; }
        [contenteditable] h3 { font-size: 1.2em; }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
});

export default SimpleRichTextEditor;
