/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver } from '@angular/core';
/**
 * Provide methods for scheduling the execution of a callback.
 */
export const scheduler = {
    /**
     * Schedule a callback to be called after some delay.
     *
     * Returns a function that when executed will cancel the scheduled function.
     */
    schedule(taskFn, delay) {
        const id = setTimeout(taskFn, delay);
        return () => clearTimeout(id);
    },
    /**
     * Schedule a callback to be called before the next render.
     * (If `window.requestAnimationFrame()` is not available, use `scheduler.schedule()` instead.)
     *
     * Returns a function that when executed will cancel the scheduled function.
     */
    scheduleBeforeRender(taskFn) {
        // TODO(gkalpak): Implement a better way of accessing `requestAnimationFrame()`
        //                (e.g. accounting for vendor prefix, SSR-compatibility, etc).
        if (typeof window === 'undefined') {
            // For SSR just schedule immediately.
            return scheduler.schedule(taskFn, 0);
        }
        if (typeof window.requestAnimationFrame === 'undefined') {
            const frameMs = 16;
            return scheduler.schedule(taskFn, frameMs);
        }
        const id = window.requestAnimationFrame(taskFn);
        return () => window.cancelAnimationFrame(id);
    },
};
/**
 * Convert a camelCased string to kebab-cased.
 */
export function camelToDashCase(input) {
    return input.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
}
/**
 * Create a `CustomEvent` (even on browsers where `CustomEvent` is not a constructor).
 */
export function createCustomEvent(doc, name, detail) {
    const bubbles = false;
    const cancelable = false;
    // On IE11, `CustomEvent` is not a constructor.
    if (typeof CustomEvent !== 'function') {
        const event = doc.createEvent('CustomEvent');
        event.initCustomEvent(name, bubbles, cancelable, detail);
        return event;
    }
    return new CustomEvent(name, { bubbles, cancelable, detail });
}
/**
 * Check whether the input is an `Element`.
 */
export function isElement(node) {
    return !!node && node.nodeType === Node.ELEMENT_NODE;
}
/**
 * Check whether the input is a function.
 */
export function isFunction(value) {
    return typeof value === 'function';
}
/**
 * Convert a kebab-cased string to camelCased.
 */
export function kebabToCamelCase(input) {
    return input.replace(/-([a-z\d])/g, (_, char) => char.toUpperCase());
}
let _matches;
/**
 * Check whether an `Element` matches a CSS selector.
 * NOTE: this is duplicated from @angular/upgrade, and can
 * be consolidated in the future
 */
export function matchesSelector(el, selector) {
    if (!_matches) {
        const elProto = Element.prototype;
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export function strictEquals(value1, value2) {
    return value1 === value2 || (value1 !== value1 && value2 !== value2);
}
/** Gets a map of default set of attributes to observe and the properties they affect. */
export function getDefaultAttributeToPropertyInputs(inputs) {
    const attributeToPropertyInputs = {};
    inputs.forEach(({ propName, templateName }) => {
        attributeToPropertyInputs[camelToDashCase(templateName)] = propName;
    });
    return attributeToPropertyInputs;
}
/**
 * Gets a component's set of inputs. Uses the injector to get the component factory where the inputs
 * are defined.
 */
export function getComponentInputs(component, injector) {
    const componentFactoryResolver = injector.get(ComponentFactoryResolver);
    const componentFactory = componentFactoryResolver.resolveComponentFactory(component);
    return componentFactory.inputs;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9lbGVtZW50cy9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLHdCQUF3QixFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUV2RTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRztJQUN2Qjs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLE1BQWtCLEVBQUUsS0FBYTtRQUN4QyxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILG9CQUFvQixDQUFDLE1BQWtCO1FBQ3JDLCtFQUErRTtRQUMvRSw4RUFBOEU7UUFDOUUsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7WUFDakMscUNBQXFDO1lBQ3JDLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEM7UUFFRCxJQUFJLE9BQU8sTUFBTSxDQUFDLHFCQUFxQixLQUFLLFdBQVcsRUFBRTtZQUN2RCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDbkIsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM1QztRQUVELE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0YsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxLQUFhO0lBQzNDLE9B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QUE2QixRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDbEcsTUFBTSxnQkFBZ0IsR0FBRyx3QkFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRixPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIFByb3ZpZGUgbWV0aG9kcyBmb3Igc2NoZWR1bGluZyB0aGUgZXhlY3V0aW9uIG9mIGEgY2FsbGJhY2suXG4gKi9cbmV4cG9ydCBjb25zdCBzY2hlZHVsZXIgPSB7XG4gIC8qKlxuICAgKiBTY2hlZHVsZSBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhZnRlciBzb21lIGRlbGF5LlxuICAgKlxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aGVuIGV4ZWN1dGVkIHdpbGwgY2FuY2VsIHRoZSBzY2hlZHVsZWQgZnVuY3Rpb24uXG4gICAqL1xuICBzY2hlZHVsZSh0YXNrRm46ICgpID0+IHZvaWQsIGRlbGF5OiBudW1iZXIpOiAoKSA9PiB2b2lkIHtcbiAgICBjb25zdCBpZCA9IHNldFRpbWVvdXQodGFza0ZuLCBkZWxheSk7XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dChpZCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlIGEgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgbmV4dCByZW5kZXIuXG4gICAqIChJZiBgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgpYCBpcyBub3QgYXZhaWxhYmxlLCB1c2UgYHNjaGVkdWxlci5zY2hlZHVsZSgpYCBpbnN0ZWFkLilcbiAgICpcbiAgICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2hlbiBleGVjdXRlZCB3aWxsIGNhbmNlbCB0aGUgc2NoZWR1bGVkIGZ1bmN0aW9uLlxuICAgKi9cbiAgc2NoZWR1bGVCZWZvcmVSZW5kZXIodGFza0ZuOiAoKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgLy8gVE9ETyhna2FscGFrKTogSW1wbGVtZW50IGEgYmV0dGVyIHdheSBvZiBhY2Nlc3NpbmcgYHJlcXVlc3RBbmltYXRpb25GcmFtZSgpYFxuICAgIC8vICAgICAgICAgICAgICAgIChlLmcuIGFjY291bnRpbmcgZm9yIHZlbmRvciBwcmVmaXgsIFNTUi1jb21wYXRpYmlsaXR5LCBldGMpLlxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gRm9yIFNTUiBqdXN0IHNjaGVkdWxlIGltbWVkaWF0ZWx5LlxuICAgICAgcmV0dXJuIHNjaGVkdWxlci5zY2hlZHVsZSh0YXNrRm4sIDApO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IGZyYW1lTXMgPSAxNjtcbiAgICAgIHJldHVybiBzY2hlZHVsZXIuc2NoZWR1bGUodGFza0ZuLCBmcmFtZU1zKTtcbiAgICB9XG5cbiAgICBjb25zdCBpZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGFza0ZuKTtcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKTtcbiAgfSxcbn07XG5cbi8qKlxuICogQ29udmVydCBhIGNhbWVsQ2FzZWQgc3RyaW5nIHRvIGtlYmFiLWNhc2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxUb0Rhc2hDYXNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5wdXQucmVwbGFjZSgvW0EtWl0vZywgY2hhciA9PiBgLSR7Y2hhci50b0xvd2VyQ2FzZSgpfWApO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGBDdXN0b21FdmVudGAgKGV2ZW4gb24gYnJvd3NlcnMgd2hlcmUgYEN1c3RvbUV2ZW50YCBpcyBub3QgYSBjb25zdHJ1Y3RvcikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21FdmVudChkb2M6IERvY3VtZW50LCBuYW1lOiBzdHJpbmcsIGRldGFpbDogYW55KTogQ3VzdG9tRXZlbnQge1xuICBjb25zdCBidWJibGVzID0gZmFsc2U7XG4gIGNvbnN0IGNhbmNlbGFibGUgPSBmYWxzZTtcblxuICAvLyBPbiBJRTExLCBgQ3VzdG9tRXZlbnRgIGlzIG5vdCBhIGNvbnN0cnVjdG9yLlxuICBpZiAodHlwZW9mIEN1c3RvbUV2ZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgZXZlbnQgPSBkb2MuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KG5hbWUsIGJ1YmJsZXMsIGNhbmNlbGFibGUsIGRldGFpbCk7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG5cbiAgcmV0dXJuIG5ldyBDdXN0b21FdmVudChuYW1lLCB7YnViYmxlcywgY2FuY2VsYWJsZSwgZGV0YWlsfSk7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgaW5wdXQgaXMgYW4gYEVsZW1lbnRgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbGVtZW50KG5vZGU6IE5vZGV8bnVsbCk6IG5vZGUgaXMgRWxlbWVudCB7XG4gIHJldHVybiAhIW5vZGUgJiYgbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREU7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgaW5wdXQgaXMgYSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWU6IGFueSk6IHZhbHVlIGlzIEZ1bmN0aW9uIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEga2ViYWItY2FzZWQgc3RyaW5nIHRvIGNhbWVsQ2FzZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZWJhYlRvQ2FtZWxDYXNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gaW5wdXQucmVwbGFjZSgvLShbYS16XFxkXSkvZywgKF8sIGNoYXIpID0+IGNoYXIudG9VcHBlckNhc2UoKSk7XG59XG5cbmxldCBfbWF0Y2hlczogKHRoaXM6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGFuIGBFbGVtZW50YCBtYXRjaGVzIGEgQ1NTIHNlbGVjdG9yLlxuICogTk9URTogdGhpcyBpcyBkdXBsaWNhdGVkIGZyb20gQGFuZ3VsYXIvdXBncmFkZSwgYW5kIGNhblxuICogYmUgY29uc29saWRhdGVkIGluIHRoZSBmdXR1cmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghX21hdGNoZXMpIHtcbiAgICBjb25zdCBlbFByb3RvID0gPGFueT5FbGVtZW50LnByb3RvdHlwZTtcbiAgICBfbWF0Y2hlcyA9IGVsUHJvdG8ubWF0Y2hlcyB8fCBlbFByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBlbFByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuICByZXR1cm4gZWwubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFID8gX21hdGNoZXMuY2FsbChlbCwgc2VsZWN0b3IpIDogZmFsc2U7XG59XG5cbi8qKlxuICogVGVzdCB0d28gdmFsdWVzIGZvciBzdHJpY3QgZXF1YWxpdHksIGFjY291bnRpbmcgZm9yIHRoZSBmYWN0IHRoYXQgYE5hTiAhPT0gTmFOYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmljdEVxdWFscyh2YWx1ZTE6IGFueSwgdmFsdWUyOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbHVlMSA9PT0gdmFsdWUyIHx8ICh2YWx1ZTEgIT09IHZhbHVlMSAmJiB2YWx1ZTIgIT09IHZhbHVlMik7XG59XG5cbi8qKiBHZXRzIGEgbWFwIG9mIGRlZmF1bHQgc2V0IG9mIGF0dHJpYnV0ZXMgdG8gb2JzZXJ2ZSBhbmQgdGhlIHByb3BlcnRpZXMgdGhleSBhZmZlY3QuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHMoXG4gICAgaW5wdXRzOiB7cHJvcE5hbWU6IHN0cmluZywgdGVtcGxhdGVOYW1lOiBzdHJpbmd9W10pIHtcbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eUlucHV0czoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgaW5wdXRzLmZvckVhY2goKHtwcm9wTmFtZSwgdGVtcGxhdGVOYW1lfSkgPT4ge1xuICAgIGF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHNbY2FtZWxUb0Rhc2hDYXNlKHRlbXBsYXRlTmFtZSldID0gcHJvcE5hbWU7XG4gIH0pO1xuXG4gIHJldHVybiBhdHRyaWJ1dGVUb1Byb3BlcnR5SW5wdXRzO1xufVxuXG4vKipcbiAqIEdldHMgYSBjb21wb25lbnQncyBzZXQgb2YgaW5wdXRzLiBVc2VzIHRoZSBpbmplY3RvciB0byBnZXQgdGhlIGNvbXBvbmVudCBmYWN0b3J5IHdoZXJlIHRoZSBpbnB1dHNcbiAqIGFyZSBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50SW5wdXRzKFxuICAgIGNvbXBvbmVudDogVHlwZTxhbnk+LCBpbmplY3RvcjogSW5qZWN0b3IpOiB7cHJvcE5hbWU6IHN0cmluZywgdGVtcGxhdGVOYW1lOiBzdHJpbmd9W10ge1xuICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9IGluamVjdG9yLmdldChDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICBjb25zdCBjb21wb25lbnRGYWN0b3J5ID0gY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGNvbXBvbmVudCk7XG4gIHJldHVybiBjb21wb25lbnRGYWN0b3J5LmlucHV0cztcbn1cbiJdfQ==