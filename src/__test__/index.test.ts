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

    test('⌘C (not strict) will response to ⌘C and ⌥⌘C', () => {
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
            loose: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(1);
        fireEvent.keyDown(document.body, {
            loose: true,
            altKey: true,
            metaKey: true,
            code: 'KeyC',
        });
        expect(value).toBe(2);
    });

    test('strict ⌥⌘C will not response to ⌘C or ⇧⌥⌘C', () => {
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
});
