'use client';

import Script from 'next/script';
import { useEffect, useState, useCallback, useRef } from 'react';

// Tipos para la API de Blip Chat
type BlipAuthType = 'Guest' | 'Dev';

interface BlipButtonConfig {
  color?: string;
  icon?: string;
}

interface BlipAuthConfig {
  authType: BlipAuthType;
  userIdentity?: string;
  userPassword?: string;
}

interface BlipAccountConfig {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
}

interface BlipChatInstance {
  withAppKey: (key: string) => BlipChatInstance;
  withButton: (config: BlipButtonConfig) => BlipChatInstance;
  withAuth: (config: BlipAuthConfig) => BlipChatInstance;
  withAccount: (config: BlipAccountConfig) => BlipChatInstance;
  withCustomStyle: (css: string) => BlipChatInstance;
  withCustomCommonUrl: (url: string) => BlipChatInstance;
  withTarget: (elementId: string) => BlipChatInstance;
  withEventHandler: (event: string, handler: () => void) => BlipChatInstance;
  build: () => BlipChatClient;
}

interface BlipChatClient {
  toogleChat: () => void;
  destroy: () => void;
  sendMessage: (message: { type: string; content: string }) => void;
}

interface BlipChatConstructor {
  new (): BlipChatInstance;
  ENTER_EVENT: string;
  LEAVE_EVENT: string;
  LOAD_EVENT: string;
  CREATE_ACCOUNT_EVENT: string;
  DEV_AUTH: BlipAuthType;
  GUEST_AUTH: BlipAuthType;
}

declare global {
  interface Window {
    BlipChat: BlipChatConstructor;
  }
}

// Configuración por defecto de BaldeCash
const BLIP_APP_KEY = 'YXRlbmNpb25iYWxkZWNhc2g6YjVkNjU4ZjAtNzc4Ni00MWQ4LThhNWItZGU4YWU3OTI3NjZh';
const BLIP_COMMON_URL = 'https://baldecash.chat.blip.ai/';
const BLIP_DEFAULT_COLOR = '#0096fa';

export interface BlipChatProps {
  /** Color del botón flotante y header (default: #0096fa) */
  buttonColor?: string;
  /** URL de icono personalizado para el botón */
  buttonIcon?: string;
  /** Ocultar el botón flotante de Blip (para abrir el chat programáticamente) */
  hideFloatingButton?: boolean;
  /** Datos de la cuenta del usuario */
  account?: BlipAccountConfig;
  /** Configuración de autenticación */
  auth?: {
    userIdentity: string;
    userPassword: string;
  };
  /** CSS personalizado para el widget */
  customStyle?: string;
  /** ID del elemento donde renderizar (si no se quiere el botón flotante) */
  targetElementId?: string;
  /** Callback cuando se abre el chat */
  onOpen?: () => void;
  /** Callback cuando se cierra el chat */
  onClose?: () => void;
  /** Callback cuando el chat termina de cargar */
  onLoad?: () => void;
  /** Callback cuando se crea una cuenta */
  onCreateAccount?: () => void;
}

export function BlipChat({
  buttonColor = BLIP_DEFAULT_COLOR,
  buttonIcon,
  hideFloatingButton = false,
  account,
  auth,
  customStyle,
  targetElementId,
  onOpen,
  onClose,
  onLoad,
  onCreateAccount,
}: BlipChatProps = {}) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const clientRef = useRef<BlipChatClient | null>(null);
  const isInitializedRef = useRef(false);

  // Guardar las props en refs para usar el valor más reciente al inicializar
  const propsRef = useRef({
    buttonColor,
    buttonIcon,
    hideFloatingButton,
    account,
    auth,
    customStyle,
    targetElementId,
    onOpen,
    onClose,
    onLoad,
    onCreateAccount,
  });

  // Actualizar refs cuando cambien las props
  useEffect(() => {
    propsRef.current = {
      buttonColor,
      buttonIcon,
      hideFloatingButton,
      account,
      auth,
      customStyle,
      targetElementId,
      onOpen,
      onClose,
      onLoad,
      onCreateAccount,
    };
  }, [buttonColor, buttonIcon, hideFloatingButton, account, auth, customStyle, targetElementId, onOpen, onClose, onLoad, onCreateAccount]);

  const initializeBlipChat = useCallback(() => {
    if (typeof window === 'undefined' || !window.BlipChat) return;
    if (isInitializedRef.current) return; // Solo inicializar una vez

    const props = propsRef.current;

    // Generar CSS para el header y opcionalmente ocultar el botón flotante
    let generatedStyle = `
      #blip-chat-header {
        background-color: ${props.buttonColor} !important;
      }
    `;

    // Si se quiere ocultar el botón flotante (para abrir programáticamente)
    if (props.hideFloatingButton) {
      generatedStyle += `
        #blip-chat-open-iframe {
          display: none !important;
        }
      `;
    }

    // Combinar con cualquier CSS personalizado adicional
    const combinedStyle = generatedStyle + (props.customStyle || '');

    let instance = new window.BlipChat()
      .withAppKey(BLIP_APP_KEY)
      .withButton({ color: props.buttonColor, icon: props.buttonIcon })
      .withCustomCommonUrl(BLIP_COMMON_URL)
      .withCustomStyle(combinedStyle);

    // Configurar autenticación
    if (props.auth) {
      instance = instance.withAuth({
        authType: window.BlipChat.DEV_AUTH,
        userIdentity: props.auth.userIdentity,
        userPassword: props.auth.userPassword,
      });
    }

    // Configurar datos de cuenta
    if (props.account) {
      instance = instance.withAccount(props.account);
    }

    // Configurar elemento target
    if (props.targetElementId) {
      instance = instance.withTarget(props.targetElementId);
    }

    // Configurar event handlers (incluyendo los internos para el estado)
    instance = instance.withEventHandler(window.BlipChat.ENTER_EVENT, () => {
      setIsChatOpen(true);
      props.onOpen?.();
    });
    instance = instance.withEventHandler(window.BlipChat.LEAVE_EVENT, () => {
      setIsChatOpen(false);
      props.onClose?.();
    });
    if (props.onLoad) {
      instance = instance.withEventHandler(window.BlipChat.LOAD_EVENT, props.onLoad);
    }
    if (props.onCreateAccount) {
      instance = instance.withEventHandler(window.BlipChat.CREATE_ACCOUNT_EVENT, props.onCreateAccount);
    }

    clientRef.current = instance.build();
    isInitializedRef.current = true;
  }, []);

  useEffect(() => {
    if (isScriptLoaded) {
      // Pequeño delay para asegurar que las props estén actualizadas
      const timer = setTimeout(() => {
        initializeBlipChat();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScriptLoaded, initializeBlipChat]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.destroy();
        } catch {
          // Ignorar errores de cleanup
        }
        clientRef.current = null;
      }
      isInitializedRef.current = false;

      // Limpieza manual de elementos DOM residuales que destroy() no remueve
      const blipButton = document.getElementById('blip-chat-open-iframe');
      if (blipButton) blipButton.remove();

      document.querySelectorAll('iframe[id^="blip-chat"]').forEach((el) => el.remove());
      document.querySelectorAll('div[id^="blip-chat"]').forEach((el) => el.remove());
    };
  }, []);

  // Inyectar CSS global para ocultar/mostrar el botón flotante según el estado del chat
  useEffect(() => {
    if (!hideFloatingButton) return;

    const styleId = 'blip-chat-hide-button';
    let style = document.getElementById(styleId) as HTMLStyleElement;

    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    // Si el chat está abierto, mostrar el botón (para poder cerrar)
    // Si el chat está cerrado, ocultar el botón
    style.textContent = `
      #blip-chat-open-iframe {
        display: ${isChatOpen ? 'block' : 'none'} !important;
      }
    `;

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [hideFloatingButton, isChatOpen]);

  return (
    <Script
      src="https://unpkg.com/blip-chat-widget"
      strategy="lazyOnload"
      onLoad={() => setIsScriptLoaded(true)}
    />
  );
}

// Hook para controlar el chat programáticamente
export function useBlipChat() {
  const openChat = useCallback(() => {
    // Método 1: Simular click en el botón de Blip (funciona aunque esté oculto)
    const blipButton = document.getElementById('blip-chat-open-iframe');
    if (blipButton) {
      (blipButton as HTMLElement).click();
      return true;
    }
    // Método 2: Buscar el iframe y disparar evento
    const iframe = document.querySelector('iframe[id^="blip-chat"]');
    if (iframe) {
      (iframe as HTMLElement).click();
      return true;
    }
    return false;
  }, []);

  const closeChat = useCallback(() => {
    // El botón de cerrar está dentro del iframe, intentamos con el botón principal
    const blipButton = document.getElementById('blip-chat-open-iframe');
    if (blipButton) {
      // Si el chat está abierto, el click lo cierra
      (blipButton as HTMLElement).click();
      return true;
    }
    return false;
  }, []);

  const toggle = useCallback(() => {
    return openChat();
  }, [openChat]);

  return { openChat, closeChat, toggle };
}
