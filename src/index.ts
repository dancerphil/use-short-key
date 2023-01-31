import {useEffect, useRef} from 'react';

type PickedKeyboardEvent = Pick<KeyboardEvent, 'code' | 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'repeat'>;

interface Options extends Partial<PickedKeyboardEvent> {
    /**
     * 默认 loose 为 false，此时为严格模式。严格模式下，将检查组合键（Meta, Ctrl, Alt, Shift）的匹配，不仅设定为需要按下的组合键需要被按下，且没有设定的键不能被按下。比如如果注册了 `Meta+C` 的快捷键，当用户按下 `Meta+Alt+C` 时将不会响应，因为此时 Alt 键被错误的按下，仅在确切的 Meta+C 被按下时，注册的快捷键才会响应。
     * 如果手动设置为 true，那么将启用宽松模式。宽松模式下，组合键只会匹配为已定义的（如 metaKey: true 或 metaKey: false），未定义的组合键不做检查（如 metaKey: undefined 或者没有传入）。
     * loose 不传的情况，默认为 false，即严格模式。
     */
    loose?: boolean;
    /**
     * 在快捷键被按下的时刻，可能用户正在填写表单，此时将不触发快捷键。
     * 详细的不触发快捷键的场景包括 input, textarea 和 富文本编辑器，你可以通过源码来进一步了解判断的逻辑。
     * 在某些特定的情况下，你需要允许快捷键在表单内被触发，比如通过 Meta+S 来保存。此时你可以手动将 includeFormField 设为 true 来更改此默认行为。
     * includeFormField 不传的情况，默认为 false，即不触发快捷键。
     */
    includeFormField?: boolean;
    keypress?: (e: KeyboardEvent) => void;
    keydown?: (e: KeyboardEvent) => void;
    keyup?: (e: KeyboardEvent) => void;
}

type ComposingKey = 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey';
type ComposingKeys = ComposingKey[];

const composingKeys: ComposingKeys = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'];

// trigger e.repeat === false by default, trigger all when options.repeat === true
const isRepeatMatched = (e: KeyboardEvent, options: Options) => {
    if (options.repeat === true) {
        return true;
    }
    return !e.repeat;
};

const isComposingMatched = (e: KeyboardEvent, options: Options) => {
    if (!options.loose) {
        // omit shift if key used, like key: `?`
        const shiftMatched = options.key
            ? true
            : Boolean(e.shiftKey) === Boolean(options.shiftKey);
        // check both truthy and falsy
        return (
            Boolean(e.ctrlKey) === Boolean(options.ctrlKey)
            && shiftMatched
            && Boolean(e.altKey) === Boolean(options.altKey)
            && Boolean(e.metaKey) === Boolean(options.metaKey)
        );
    }
    // loose: only check when options.key is defined
    const keys = composingKeys.filter(
        key => options[key] !== undefined
    );

    for (const key of keys) {
        if (e[key] !== options[key]) {
            return false;
        }
    }
    return true;
};

const isKeyMatched = (e: KeyboardEvent, options: Options) => {
    if (e.code === options.code) {
        return true;
    }
    if (e.key === options.key) {
        return true;
    }
    if (options.code === undefined && options.key === undefined) {
        return true;
    }
    return false;
};

/**
 * 判断元素是否为表单元素
 * @ref https://github.com/github/hotkey/blob/main/src/utils.ts#L1
 */
// eslint-disable-next-line complexity
const isFormField = (element: Node, options: Options) => {
    if (options.includeFormField) {
        return false;
    }
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    const name = element.nodeName.toLowerCase();
    const type = (element.getAttribute('type') || '').toLowerCase();
    return (
        name === 'select'
        || name === 'textarea'
        || (name === 'input' && type !== 'submit' && type !== 'reset' && type !== 'checkbox' && type !== 'radio')
        || element.isContentEditable
    );
};

const isMatched = (e: KeyboardEvent, options: Options) => {
    return (
        !isFormField(e.target as HTMLElement, options)
        && isKeyMatched(e, options)
        && isComposingMatched(e, options)
        && isRepeatMatched(e, options)
    );
};

type KeyboardCallback = (e: KeyboardEvent) => void;

interface OptionRef {
    current: Options;
}

const createKeyHook = () => {
    const optionRefList = new Set<OptionRef>();
    const onDocumentKeypress: KeyboardCallback = e => {
        // 是否需要一个参数来定义是否需要 prevent
        // e.preventDefault();
        const effectList: KeyboardCallback[] = [];
        optionRefList.forEach(optionRef => {
            const {keypress} = optionRef.current;
            if (!keypress) {
                return;
            }
            if (isMatched(e, optionRef.current)) {
                effectList.push(keypress);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const onDocumentKeydown: KeyboardCallback = e => {
        const effectList: KeyboardCallback[] = [];
        optionRefList.forEach(optionRef => {
            const {keydown} = optionRef.current;
            if (!keydown) {
                return;
            }
            if (isMatched(e, optionRef.current)) {
                effectList.push(keydown);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const onDocumentKeyup = (e: KeyboardEvent) => {
        const effectList: KeyboardCallback[] = [];
        optionRefList.forEach(optionRef => {
            const {keyup} = optionRef.current;
            if (!keyup) {
                return;
            }
            /**
             * @see https://cloud.tencent.com/developer/ask/70262
             */
            if (e.key === 'Meta') {
                effectList.push(keyup);
            }
            else if (isMatched(e, optionRef.current)) {
                effectList.push(keyup);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const useShortKey = (options: Options) => {
        const optionsRef = useRef(options);
        optionsRef.current = options;

        useEffect(
            () => {
                optionRefList.add(optionsRef);
                return () => {
                    optionRefList.delete(optionsRef);
                };
            },
            []
        );
    };
    document.addEventListener('keypress', onDocumentKeypress);
    document.addEventListener('keydown', onDocumentKeydown);
    document.addEventListener('keyup', onDocumentKeyup);
    return useShortKey;
};

/**
 * 快捷键 hook
 * @see https://codesandbox.io/s/usehotkey-k83fb
 * @author zhangcong06
 */
export const useShortKey = createKeyHook();
