import "@mdxeditor/editor/style.css";
import { useCallback, useState, useEffect, useRef } from "react";
import { DopImgSrcProvider } from "../contexts/DopImgSrcProvider.tsx";
import MDXEditorWrapper from "../MDXEditorWrapper/MDXEditorWrapper.tsx";
import styles from "./App.module.css";
import { jsxComponentDescriptors } from "../consts/jsxComponentDescriptors.tsx";

interface IApp {
  textareaName: string;
  content: string;
  imgSrc?: string;
}

function App(props: IApp) {
  const { textareaName, content, imgSrc } = props;
  const [text, setText] = useState<string>(content);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const isInitialized = useRef(false);

  // Безопасная функция для вызова BX.fireEvent
  const fireBitrixEvent = useCallback((element: HTMLElement, eventName: string) => {
    if (typeof window !== 'undefined' && (window as any).BX && typeof (window as any).BX.fireEvent === 'function') {
      (window as any).BX.fireEvent(element, eventName);
    } else {
      // Fallback для событий
      const event = new Event(eventName, { bubbles: true });
      element.dispatchEvent(event);
    }
  }, []);

  useEffect(() => {
    // Инициализируем только один раз при монтировании
    if (!isInitialized.current) {
      setText(content);
      isInitialized.current = true;
    }
  }, [content]);

  const handleChange = useCallback((val: string) => {
    setText(val);

    // Обновляем скрытое textarea для Bitrix формы
    const textarea = document.querySelector(`textarea[name="${textareaName}"]`) as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = val;

      // Триггерим события для валидации
      fireBitrixEvent(textarea, 'change');

      // Также триггерим input событие
      const inputEvent = new Event('input', { bubbles: true });
      textarea.dispatchEvent(inputEvent);
    }
  }, [textareaName, fireBitrixEvent]);

  // Дополнительно: обрабатываем изменения через MutationObserver
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const textarea = document.querySelector(`textarea[name="${textareaName}"]`);
      if (textarea && (textarea as HTMLTextAreaElement).value !== text) {
        // Если Bitrix изменил значение, синхронизируем
        setText((textarea as HTMLTextAreaElement).value);
      }
    });

    const form = document.querySelector('form');
    if (form) {
      observer.observe(form, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    return () => observer.disconnect();
  }, [textareaName, text]);

  // Безопасная интеграция с Bitrix AJAX (только в среде выполнения)
  useEffect(() => {
    // Эта часть выполняется только в браузере
    if (typeof window === 'undefined') return;

    const handleAjaxComplete = () => {
      // Даем время Bitrix обновить DOM
      setTimeout(() => {
        const textarea = document.querySelector(`textarea[name="${textareaName}"]`) as HTMLTextAreaElement;
        if (textarea && textarea.value !== text) {
          setText(textarea.value);
        }
      }, 100);
    };

    // Проверяем наличие BX.ajax безопасно
    const win = window as any;
    if (win.BX && win.BX.ajax) {
      // Сохраняем оригинальную функцию
      const originalSubmit = win.BX.ajax.submit;

      // Оборачиваем с обработкой завершения
      win.BX.ajax.submit = function(...args: any[]) {
        const result = originalSubmit.apply(this, args);
        handleAjaxComplete();
        return result;
      };
    }

    // Также слушаем jQuery события, если Bitrix их использует
    if (win.$) {
      win.$(document).on('ajaxComplete', handleAjaxComplete);
    }

    return () => {
      if (win.$) {
        win.$(document).off('ajaxComplete', handleAjaxComplete);
      }
    };
  }, [textareaName, text]);

  // Обработка перед уходом со страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Принудительно синхронизируем перед уходом
      const textarea = document.querySelector(`textarea[name="${textareaName}"]`) as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = text;
        fireBitrixEvent(textarea, 'change');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Также обрабатываем событие отправки формы
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', handleBeforeUnload);
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      forms.forEach(form => {
        form.removeEventListener('submit', handleBeforeUnload);
      });
    };
  }, [textareaName, text, fireBitrixEvent]);

  const handleSaveToHtml = useCallback(async () => {
    if (!import.meta.env.DEV) {
      return;
    }

    setSaveStatus("Сохранение...");

    try {
      const response = await fetch("/api/dev/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          rootId: "root1",
          textareaName,
          imgSrc: imgSrc ?? "",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Не удалось сохранить index.html");
      }

      setSaveStatus("Сохранено в index.html");
    } catch (error) {
      setSaveStatus(
        error instanceof Error ? error.message : "Ошибка сохранения"
      );
    }
  }, [text, textareaName, imgSrc]);



  return (
      <DopImgSrcProvider>
        <div className={styles.parent}>
        <textarea
            name={textareaName}
            className={styles.texterea}
            defaultValue={content}
            rows={10}
            style={{ display: "none" }}
            // Bitrix иногда добавляет свои обработчики
            onChange={(e) => {
              // Пропускаем событие дальше
              const event = new Event('change', { bubbles: true });
              e.target.dispatchEvent(event);
            }}
        />
          <h3>
            Здесь можно описать
            <br />
            Вашу кастомную страницу:
          </h3>
          {import.meta.env.DEV && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={handleSaveToHtml}
                style={{
                  padding: "8px 16px",
                  background: "#4299e1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Сохранить в index.html
              </button>
              {saveStatus && (
                <span style={{ fontSize: "14px", color: "#4a5568" }}>
                  {saveStatus}
                </span>
              )}
            </div>
          )}
          <div className={styles.editor}>
            <MDXEditorWrapper
                onChange={handleChange}
                jsxComponentDescriptors={jsxComponentDescriptors}
                imgSrc={imgSrc}
                startContent={text}
            />
          </div>
        </div>
      </DopImgSrcProvider>
  );
}

export default App;