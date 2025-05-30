import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Type, Undo, Redo, Users, Zap
} from 'lucide-react';
import { Select } from './Select';

/**
 * @typedef {import('../types').WebSocketMessage} WebSocketMessage
 */

/**
 * @param {Object} props
 * @param {string} props.content
 * @param {boolean} props.isConnected
 * @param {function(string): void} props.onContentChange
 * @param {function(WebSocketMessage): void} props.sendMessage
 * @param {Array} props.users
 * @param {string} props.currentUserId
 * @param {Object} props.cursors
 */
export const Editor = ({
  content,
  isConnected,
  onContentChange,
  sendMessage,
  users = [],
  currentUserId,
  cursors: externalCursors = {}
}) => {
  const textareaRef = useRef(null);
  const [cursors, setCursors] = useState({});
  const [formatting, setFormatting] = useState({
    alignment: 'left',
    fontSize: '16',
    fontFamily: 'Arial',
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    lineHeight: '1.6'
  });
  const [history, setHistory] = useState([{ content: '', formatting }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
  const [isUndoRedo, setIsUndoRedo] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, right: 0 });

  const timeoutRef = useRef(null);
  const cursorTimeoutRef = useRef(null);
  const historyTimeoutRef = useRef(null);
  const colorButtonRef = useRef(null);

  const colorPresets = ['#000000', '#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED'];
  
  // Options for dropdown selects
  const fontFamilyOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Courier New', label: 'Mono' }
  ];
  
  const fontSizeOptions = [10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => ({
    value: size.toString(),
    label: size.toString()
  }));
  
  const lineHeightOptions = [
    { value: '1.2', label: '1.2' },
    { value: '1.4', label: '1.4' },
    { value: '1.6', label: '1.6' },
    { value: '2.0', label: '2.0' }
  ];

  const textareaStyle = {
    textAlign: formatting.alignment,
    fontSize: `${formatting.fontSize}px`,
    fontFamily: formatting.fontFamily,
    lineHeight: formatting.lineHeight,
  };

  const addToHistory = useCallback((newContent, cursorPosition = 0) => {
    if (isUndoRedo) return;
    
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({
          content: newContent,
          timestamp: Date.now(),
          cursorPosition
        });
        
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        
        return newHistory;
      });
      
      setHistoryIndex(prev => {
        const newIndex = prev + 1;
        return newIndex >= 50 ? 49 : newIndex;
      });
    }, 500);
  }, [historyIndex, isUndoRedo]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true);
      const previousState = history[historyIndex - 1];
      onContentChange(previousState.content);
      setHistoryIndex(prev => prev - 1);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.innerHTML = previousState.content;
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(textareaRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        setIsUndoRedo(false);
      }, 0);

      sendMessage({
        type: 'content_change',
        content: previousState.content,
        from: currentUserId
      });
    }
  }, [historyIndex, history, onContentChange, sendMessage, currentUserId]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true);
      const nextState = history[historyIndex + 1];
      onContentChange(nextState.content);
      setHistoryIndex(prev => prev + 1);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.innerHTML = nextState.content;
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(textareaRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        setIsUndoRedo(false);
      }, 0);

      sendMessage({
        type: 'content_change',
        content: nextState.content,
        from: currentUserId
      });
    }
  }, [historyIndex, history, onContentChange, sendMessage, currentUserId]);

  const handleChange = (e) => {
    if (!isConnected || isUndoRedo) return;
    
    const newContent = e.target.innerHTML;
    onContentChange(newContent);
    
    addToHistory(newContent);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      sendMessage({
        type: 'content_change',
        content: newContent,
        from: currentUserId
      });
    }, 300);
  };

  const sendCursorUpdate = useCallback(() => {
    if (!textareaRef.current || !isConnected) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const position = range.startOffset;
      
      console.log('📍 Sending cursor update:', { position, from: currentUserId });
      sendMessage({
        type: 'cursor_update',
        position: position,
        from: currentUserId
      });
    }
  }, [sendMessage, currentUserId, isConnected]);

  const handleSelectionChange = () => {
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }
    cursorTimeoutRef.current = setTimeout(() => {
      sendCursorUpdate();
      updateFormattingState();
    }, 100);
  };

  const applyFormatting = (type, value = null) => {
    if (!isConnected) return;

    // Save the current selection
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // For text-level formatting, apply to selection
    if (['bold', 'italic', 'underline', 'color'].includes(type)) {
      switch (type) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
        case 'color':
          document.execCommand('foreColor', false, value);
          break;
      }
      
      // Update button states based on current selection
      updateFormattingState();
    } else {
      // For block-level formatting, update the container styles
      let newFormatting = { ...formatting };
      
      switch (type) {
        case 'alignment':
        case 'fontSize':
        case 'fontFamily':
        case 'lineHeight':
          newFormatting[type] = value;
          break;
      }
      
      setFormatting(newFormatting);
      
      sendMessage({
        type: 'formatting_change',
        formatting: newFormatting,
        from: currentUserId
      });
    }
  };

  // Function to update formatting state based on current selection
  const updateFormattingState = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    // Check the formatting of the current selection
    const newFormatting = { ...formatting };
    
    try {
      newFormatting.bold = document.queryCommandState('bold');
      newFormatting.italic = document.queryCommandState('italic');
      newFormatting.underline = document.queryCommandState('underline');
      
      // Get the color of the selection
      const color = document.queryCommandValue('foreColor');
      if (color) {
        newFormatting.color = color;
      }
    } catch (error) {
      console.log('Error checking command state:', error);
    }

    setFormatting(newFormatting);
  };

  const handleKeyDown = (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
    
    if (ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('underline');
          break;
      }
    }
  };

  const calculateCursorPosition = (position, element) => {
    if (!element) return { x: 0, y: 0 };
    
    try {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let charCount = 0;
      let currentNode;
      
      while (currentNode = walker.nextNode()) {
        const nodeLength = currentNode.textContent.length;
        if (charCount + nodeLength >= position) {
          const range = document.createRange();
          range.setStart(currentNode, position - charCount);
          range.setEnd(currentNode, position - charCount);
          
          const rect = range.getBoundingClientRect();
          const containerRect = element.getBoundingClientRect();
          
          return {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top
          };
        }
        charCount += nodeLength;
      }
      
      return { x: 0, y: 0 };
    } catch (error) {
      return { x: 0, y: 0 };
    }
  };

  const renderCursorOverlays = () => {
    console.log('🎯 Rendering cursor overlays:', { externalCursors, users, currentUserId });
    
    return Object.entries(externalCursors).map(([userId, cursor]) => {
      if (userId === currentUserId) return null;
      
      const user = users.find(u => u.id === userId);
      console.log(`🎯 Processing cursor for user ${userId}:`, { user, cursor });
      
      if (!user) return null;
      
      const position = calculateCursorPosition(cursor.position || 0, textareaRef.current);
      console.log(`🎯 Calculated position for ${userId}:`, position);
      
      return (
        <div key={userId}>
          <div
            className="absolute w-0.5 h-5 bg-current animate-pulse z-20 transition-all duration-200"
            style={{
              left: `${position.x + 32}px`,
              top: `${position.y + 32}px`,
              color: user.color,
              boxShadow: `0 0 8px ${user.color}`
            }}
          />
          <div
            className="absolute text-xs font-medium z-30 transition-all duration-200 whitespace-nowrap px-1 py-0.5 bg-white/90 backdrop-blur-sm rounded shadow-lg border border-gray-200/50"
            style={{
              left: `${position.x + 32}px`,
              top: `${position.y + 20}px`,
              color: user.color,
              transform: 'translateY(-100%)'
            }}
          >
            {user.name}
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    const handleWebSocketMessage = (event) => {
      const data = event.detail;
      
      switch (data.type) {
        case 'init':
          if (data.formatting) setFormatting(data.formatting);
          break;
        case 'content_update':
          if (data.from !== currentUserId && !isUndoRedo) {
            if (textareaRef.current) {
              textareaRef.current.innerHTML = data.content || '';
            }
          }
          break;
        case 'formatting_update':
          if (data.from !== currentUserId) {
            setFormatting(data.formatting);
          }
          break;
      }
    };

    window.addEventListener('websocket-message', handleWebSocketMessage);
    return () => window.removeEventListener('websocket-message', handleWebSocketMessage);
  }, [currentUserId, isUndoRedo]);

  useEffect(() => {
    if (!isUndoRedo && textareaRef.current && content !== textareaRef.current.innerHTML) {
      textareaRef.current.innerHTML = content;
    }
  }, [content, isUndoRedo]);

  // Handle clicking outside color picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && 
          colorButtonRef.current && 
          !colorButtonRef.current.contains(event.target) &&
          !event.target.closest('.fixed')) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  return (
    <div className="flex-1 p-3 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="h-full flex flex-col max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl p-2 mb-3 relative">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={`p-1 rounded text-xs ${
                  historyIndex <= 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Undo"
              >
                <Undo size={12} />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className={`p-1 rounded text-xs ${
                  historyIndex >= history.length - 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Redo"
              >
                <Redo size={12} />
              </button>
              
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              
              {['bold', 'italic', 'underline'].map((style) => {
                const IconComponent = { bold: Bold, italic: Italic, underline: Underline }[style];
                return (
                  <button
                    key={style}
                    onClick={() => applyFormatting(style)}
                    className={`p-1 rounded text-xs ${
                      formatting[style]
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                    title={style.charAt(0).toUpperCase() + style.slice(1)}
                  >
                    <IconComponent size={12} />
                  </button>
                );
              })}
              
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              
              {[
                { key: 'left', icon: AlignLeft },
                { key: 'center', icon: AlignCenter },
                { key: 'right', icon: AlignRight },
                { key: 'justify', icon: AlignJustify }
              ].map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => applyFormatting('alignment', key)}
                  className={`p-1 rounded text-xs ${
                    formatting.alignment === key
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                  title={`Align ${key}`}
                >
                  <Icon size={12} />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <Select
                value={formatting.fontFamily}
                onChange={(value) => applyFormatting('fontFamily', value)}
                options={fontFamilyOptions}
                width="w-20"
              />
              
              <Select
                value={formatting.fontSize}
                onChange={(value) => applyFormatting('fontSize', value)}
                options={fontSizeOptions}
                width="w-12"
              />
              
              <div className="relative">
                <button
                  ref={colorButtonRef}
                  onClick={() => {
                    if (!showColorPicker && colorButtonRef.current) {
                      const rect = colorButtonRef.current.getBoundingClientRect();
                      setColorPickerPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right
                      });
                    }
                    setShowColorPicker(!showColorPicker);
                  }}
                  className="flex items-center gap-1 p-1 rounded text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 text-xs"
                  title="Color"
                >
                  <Palette size={12} />
                  <div
                    className="w-2 h-2 rounded border border-gray-300"
                    style={{ backgroundColor: formatting.color }}
                  />
                </button>
              </div>
              
              <Select
                value={formatting.lineHeight}
                onChange={(value) => applyFormatting('lineHeight', value)}
                options={lineHeightOptions}
                width="w-12"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl relative flex flex-col min-h-0">
          <div className="absolute inset-0 pointer-events-none z-10">
            {renderCursorOverlays()}
          </div>
          
          {Object.keys(externalCursors).length > 0 && (
            <div className="absolute top-4 right-4 z-50">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/90 backdrop-blur-sm text-white rounded-full shadow-lg border border-green-400/50">
                <Zap className="animate-pulse" size={14} />
                <span className="text-xs font-medium">
                  {Object.keys(externalCursors).length} user{Object.keys(externalCursors).length > 1 ? 's' : ''} editing
                </span>
              </div>
            </div>
          )}
          
          <div
            ref={textareaRef}
            contentEditable={isConnected}
            onInput={handleChange}
            onSelect={handleSelectionChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleSelectionChange}
            onMouseUp={handleSelectionChange}
            data-placeholder={
              isConnected
                ? 'Start typing to collaborate with others...'
                : 'Connecting to server...'
            }
            suppressContentEditableWarning={true}
            className={`flex-1 w-full p-4 md:p-8 resize-none outline-none relative z-5 transition-all duration-200 overflow-y-auto overflow-x-hidden ${
              !isConnected ? 'bg-gray-50/50 text-gray-400 cursor-not-allowed' : 'focus:bg-white/80'
            }`}
            style={{ 
              minHeight: '300px',
              maxHeight: 'calc(100vh - 280px)',
              ...textareaStyle
            }}
          />
        </div>
      </div>
      
      {/* Color picker as portal to body */}
      {showColorPicker && createPortal(
        <div 
          className="fixed p-2 bg-white rounded-lg shadow-2xl border border-gray-200 min-w-[120px]" 
          style={{ 
            top: `${colorPickerPosition.top}px`,
            right: `${colorPickerPosition.right}px`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            zIndex: 99999
          }}>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {colorPresets.map(color => (
              <button
                key={color}
                onClick={() => {
                  applyFormatting('color', color);
                  setShowColorPicker(false);
                }}
                className="w-5 h-5 rounded border hover:scale-110 transition-transform duration-200"
                style={{ 
                  backgroundColor: color,
                  borderColor: formatting.color === color ? '#6366f1' : '#d1d5db'
                }}
              />
            ))}
          </div>
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            onBlur={() => {
              applyFormatting('color', customColor);
              setShowColorPicker(false);
            }}
            className="w-full h-5 rounded border border-gray-300 cursor-pointer"
          />
        </div>,
        document.body
      )}
    </div>
  );
};