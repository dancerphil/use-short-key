import {useEffect, useMemo} from 'react';

interface Options {
    code?: string;
    key?: string;
    /**
     * 宽松模式仅检查定义了的组合键，未定义的组合键不做检查。如默认下的 ⌘C 不会响应 ⌥⌘C，但宽松模式会
     */
    loose?: boolean;
    includeFormField?: boolean;
    repeat?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
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

const createKeyHook = () => {
    const optionList = new Set<Options>();
    const onDocumentKeypress: KeyboardCallback = e => {
        // 是否需要一个参数来定义是否需要 prevent
        // e.preventDefault();
        const effectList: KeyboardCallback[] = [];
        optionList.forEach(options => {
            const {keypress} = options;
            if (!keypress) {
                return;
            }
            if (isMatched(e, options)) {
                effectList.push(keypress);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const onDocumentKeydown: KeyboardCallback = e => {
        const effectList: KeyboardCallback[] = [];
        optionList.forEach(options => {
            const {keydown} = options;
            if (!keydown) {
                return;
            }
            if (isMatched(e, options)) {
                effectList.push(keydown);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const onDocumentKeyup = (e: KeyboardEvent) => {
        const effectList: KeyboardCallback[] = [];
        optionList.forEach(options => {
            const {keyup} = options;
            if (!keyup) {
                return;
            }
            /**
             * @see https://cloud.tencent.com/developer/ask/70262
             */
            if (e.key === 'Meta') {
                effectList.push(keyup);
            }
            else if (isMatched(e, options)) {
                effectList.push(keyup);
            }
        });
        effectList.forEach(keydown => keydown(e));
    };
    const useKey = (options: Options) => {
        const memoizedOptions = useMemo(
            () => options,
            // eslint-disable-next-line react-hooks/exhaustive-deps
            Object.values(options)
        );
        useEffect(
            () => {
                optionList.add(memoizedOptions);
                return () => {
                    optionList.delete(memoizedOptions);
                };
            },
            [memoizedOptions]
        );
    };
    document.addEventListener('keypress', onDocumentKeypress);
    document.addEventListener('keydown', onDocumentKeydown);
    document.addEventListener('keyup', onDocumentKeyup);
    return useKey;
};

/**
 * 快捷键 hook
 * @see https://codesandbox.io/s/usehotkey-k83fb
 * @author zhangcong06
 */
export const useShortKey = createKeyHook();
