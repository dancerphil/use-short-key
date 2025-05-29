/* eslint-disable max-lines */
import {describe, test, expect} from 'vitest';
import {fireEvent} from '@testing-library/react';
import {renderHook} from '@testing-library/react-hooks';
import {useShortKey} from '..';

describe('useHotKey', () => {
    test('basic', () => {
        let value = 0;
        renderHook(() => useShortKey({
            keydown: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyDown(document.body);
        expect(value).toBe(1);
    });

    test('press Enter', () => {
        let value = 0;
        renderHook(() => useShortKey({
            code: 'Enter',
            keydown: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {code: 'Enter'});
        expect(value).toBe(1);
    });

    test('keyup with key c', () => {
        let value = 0;
        renderHook(() => useShortKey({
            key: 'c',
            keyup: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyUp(document.body, {key: 'c'});
        expect(value).toBe(1);
    });

    test('press ⌥⌘C', () => {
        let value = 0;
        renderHook(() => useShortKey({
            metaKey: true,
            altKey: true,
            code: 'KeyC',
            keydown: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {
            metaKey: true,
            altKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(1);
    });

    test('subscribe ⌘C then subscribe ⌘V', async () => {
        let cPressedTimes = 0;
        let vPressedTimes = 0;
        const fireEvents = () => {
            fireEvent.keyDown(document.body, {
                metaKey: true,
                code: 'KeyC',
            });
            fireEvent.keyDown(document.body, {
                metaKey: true,
                code: 'KeyV',
            });
        };
        const initialProps = {
            metaKey: true,
            code: 'KeyC',
            keydown: () => {
                cPressedTimes++;
            },
        };
        const {rerender} = renderHook(useShortKey, {initialProps});
        expect(cPressedTimes).toBe(0);
        expect(vPressedTimes).toBe(0);
        fireEvents();
        expect(cPressedTimes).toBe(1);
        expect(vPressedTimes).toBe(0);

        // strict equal
        await rerender(initialProps);
        fireEvents();
        expect(cPressedTimes).toBe(2);
        expect(vPressedTimes).toBe(0);

        // shallow equal
        await rerender({...initialProps});
        fireEvents();
        expect(cPressedTimes).toBe(3);
        expect(vPressedTimes).toBe(0);

        // not equal
        await rerender({
            metaKey: true,
            code: 'KeyC',
            keydown: () => {
                cPressedTimes += 2;
            },
        });
        fireEvents();
        expect(cPressedTimes).toBe(5);
        expect(vPressedTimes).toBe(0);

        // subscribe ⌘V
        await rerender({
            metaKey: true,
            code: 'KeyV',
            keydown: () => {
                vPressedTimes++;
            },
        });
        fireEvents();
        expect(cPressedTimes).toBe(5);
        expect(vPressedTimes).toBe(1);
    });

    test('[strict ⌥⌘C]: ⌘C ✕ ⌥⌘C ✓ ⇧⌥⌘C ✕', () => {
        let value = 0;
        renderHook(() => useShortKey({
            metaKey: true,
            altKey: true,
            code: 'KeyC',
            keydown: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(1);
        fireEvent.keyDown(document.body, {
            shiftKey: true,
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(1);
    });

    test('[loose ⌘C]: ⌘C ✓ ⌥⌘C ✓ ⇧⌥⌘C ✓', () => {
        let value = 0;
        renderHook(() => useShortKey({
            loose: true,
            metaKey: true,
            code: 'KeyC',
            keydown: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(1);
        fireEvent.keyDown(document.body, {
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(2);
        fireEvent.keyDown(document.body, {
            shiftKey: true,
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(3);
    });

    test('[loose ⌥⌘C]: ⌘C ✕ ⌥⌘C ✓ ⇧⌥⌘C ✓', () => {
        let value = 0;
        renderHook(() => useShortKey({
            loose: true,
            altKey: true,
            metaKey: true,
            code: 'KeyC',
            keydown: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(1);
        fireEvent.keyDown(document.body, {
            shiftKey: true,
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(2);
    });

    test('[loose ⌘C (⇧ not allowed)]: ⌘C ✓ ⌥⌘C ✓ ⇧⌥⌘C ✕', () => {
        let value = 0;
        renderHook(() => useShortKey({
            loose: true,
            metaKey: true,
            shiftKey: false,
            code: 'KeyC',
            keydown: () => {
                value++;
            },
        }));
        expect(value).toBe(0);
        fireEvent.keyDown(document.body, {
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(1);
        fireEvent.keyDown(document.body, {
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(2);
        fireEvent.keyDown(document.body, {
            shiftKey: true,
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(2);
    });
});
