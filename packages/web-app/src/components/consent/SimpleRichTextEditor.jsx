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
  const fileInputRef = useRef(null);
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
    // Asegurar que el editor tenga el foco primero
    if (editorRef.current) {
      editorRef.current.focus();
      // Pequeño delay para asegurar que el foco se estableció
      setTimeout(() => {
        document.execCommand(command, false, value);
        handleInput(); // Notificar cambio
      }, 0);
    }
  }, [handleInput]);

  // Toolbar buttons
  const toolbarButtons = [
    { command: 'bold', icon: BoldIcon, title: 'Negrita (Ctrl+B)' },
    { command: 'italic', icon: ItalicIcon, title: 'Cursiva (Ctrl+I)' },
    { command: 'underline', icon: UnderlineIcon, title: 'Subrayado (Ctrl+U)' },
  ];

  const handleListStyle = useCallback((listType, styleType) => {
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(() => {
        // Primero crear la lista
        const command = listType === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
        document.execCommand(command, false, null);
        
        // Luego aplicar el estilo
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          let listElement = selection.anchorNode;
          while (listElement && listElement.nodeName !== 'UL' && listElement.nodeName !== 'OL') {
            listElement = listElement.parentElement;
          }
          if (listElement) {
            // Remover clases previas
            listElement.className = listElement.className.replace(/list-\w+/g, '').trim();
            // Agregar nueva clase
            listElement.classList.add(styleType);
          }
        }
        handleInput();
      }, 0);
    }
  }, [handleInput]);

  const handleLink = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const url = prompt('Ingresa la URL:');
      if (url) {
        setTimeout(() => {
          document.execCommand('createLink', false, url);
          handleInput();
        }, 0);
      }
    }
  }, [handleInput]);

  const handleImageFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Limitar tamaño a 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (editorRef.current && event.target?.result) {
        editorRef.current.focus();
        setTimeout(() => {
          const img = `<img src="${event.target.result}" style="max-width: 300px; height: auto;" />`;
          document.execCommand('insertHTML', false, img);
          handleInput();
        }, 0);
      }
    };
    reader.readAsDataURL(file);

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  }, [handleInput]);

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
            onMouseDown={(e) => {
              e.preventDefault(); // Evitar que el editor pierda el foco
            }}
            onClick={() => execCommand(command)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title={title}
          >
            <Icon className="h-4 w-4 text-gray-700" />
          </button>
        ))}

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Lista con viñetas - Dropdown */}
        <div className="relative inline-block">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand('insertUnorderedList')}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Lista con viñetas"
          >
            <ListBulletIcon className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Estilo de viñetas */}
        <select
          onChange={(e) => {
            handleListStyle('ul', e.target.value);
            e.target.value = ''; // Reset
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
          defaultValue=""
          title="Tipo de viñeta"
        >
          <option value="">Viñeta</option>
          <option value="list-disc">● Círculo lleno</option>
          <option value="list-circle">○ Círculo vacío</option>
          <option value="list-square">■ Cuadrado</option>
          <option value="list-none">Sin viñeta</option>
        </select>

        {/* Lista numerada */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('insertOrderedList')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Lista numerada"
        >
          <NumberedListIcon className="h-4 w-4 text-gray-700" />
        </button>

        {/* Estilo de numeración */}
        <select
          onChange={(e) => {
            handleListStyle('ol', e.target.value);
            e.target.value = ''; // Reset
          }}
          onMouseDown={(e) => e.preventDefault()}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
          defaultValue=""
          title="Tipo de numeración"
        >
          <option value="">Número</option>
          <option value="list-decimal">1. Números (1, 2, 3)</option>
          <option value="list-alpha">a. Letras (a, b, c)</option>
          <option value="list-upper-alpha">A. Letras mayúsculas (A, B, C)</option>
          <option value="list-roman">i. Romanos (i, ii, iii)</option>
          <option value="list-upper-roman">I. Romanos mayúsculas (I, II, III)</option>
        </select>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Alignment buttons */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Alinear a la izquierda"
        >
          <span className="text-xs font-bold">⇤</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyCenter')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Centrar"
        >
          <span className="text-xs font-bold">≡</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyRight')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Alinear a la derecha"
        >
          <span className="text-xs font-bold">⇥</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Insertar enlace"
        >
          <LinkIcon className="h-4 w-4 text-gray-700" />
        </button>

        {/* Image button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleImageButtonClick}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Insertar imagen desde archivo"
        >
          <PhotoIcon className="h-4 w-4 text-gray-700" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Clear formatting button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
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
        /* Estilos para diferentes tipos de listas */
        [contenteditable] ul {
          list-style-type: disc; /* Viñetas circulares por defecto */
        }
        [contenteditable] ul ul {
          list-style-type: circle; /* Círculos vacíos para segundo nivel */
        }
        [contenteditable] ul ul ul {
          list-style-type: square; /* Cuadrados para tercer nivel */
        }
        [contenteditable] ol {
          list-style-type: decimal; /* Números por defecto (1, 2, 3...) */
        }
        [contenteditable] ol ol {
          list-style-type: lower-alpha; /* Letras minúsculas para segundo nivel (a, b, c...) */
        }
        [contenteditable] ol ol ol {
          list-style-type: lower-roman; /* Números romanos para tercer nivel (i, ii, iii...) */
        }
        /* Clases personalizadas para cambiar estilos de lista */
        [contenteditable] ul.list-circle {
          list-style-type: circle;
        }
        [contenteditable] ul.list-square {
          list-style-type: square;
        }
        [contenteditable] ul.list-disc {
          list-style-type: disc;
        }
        [contenteditable] ul.list-none {
          list-style-type: none;
        }
        [contenteditable] ol.list-decimal {
          list-style-type: decimal;
        }
        [contenteditable] ol.list-alpha {
          list-style-type: lower-alpha;
        }
        [contenteditable] ol.list-roman {
          list-style-type: lower-roman;
        }
        [contenteditable] ol.list-upper-alpha {
          list-style-type: upper-alpha;
        }
        [contenteditable] ol.list-upper-roman {
          list-style-type: upper-roman;
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
