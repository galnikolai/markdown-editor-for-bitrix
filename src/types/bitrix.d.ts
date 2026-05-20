
declare global {
    interface Window {
        BX: typeof BX;
        $: any;
    }

    const BX: {
        ajax: {
            submit: Function;
            [key: string]: any;
        };
        fireEvent: (element: HTMLElement, eventName: string) => void;
        addCustomEvent: (eventName: string, handler: Function) => void;
        removeCustomEvent: (eventName: string, handler: Function) => void;
        [key: string]: any;
    };

    const $: any;
}

export {};