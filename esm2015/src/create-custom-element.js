/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentNgElementStrategyFactory } from './component-factory-strategy';
import { createCustomEvent, getComponentInputs, getDefaultAttributeToPropertyInputs } from './utils';
/**
 * Implements the functionality needed for a custom element.
 *
 * @publicApi
 */
export class NgElement extends HTMLElement {
    constructor() {
        super(...arguments);
        /**
         * A subscription to change, connect, and disconnect events in the custom element.
         */
        this.ngElementEventsSubscription = null;
    }
}
/**
 *  @description Creates a custom element class based on an Angular component.
 *
 * Builds a class that encapsulates the functionality of the provided component and
 * uses the configuration information to provide more context to the class.
 * Takes the component factory's inputs and outputs to convert them to the proper
 * custom element API and add hooks to input changes.
 *
 * The configuration's injector is the initial injector set on the class,
 * and used by default for each created instance.This behavior can be overridden with the
 * static property to affect all newly created instances, or as a constructor argument for
 * one-off creations.
 *
 * @param component The component to transform.
 * @param config A configuration that provides initialization information to the created class.
 * @returns The custom-element construction class, which can be registered with
 * a browser's `CustomElementRegistry`.
 *
 * @publicApi
 */
export function createCustomElement(component, config) {
    const inputs = getComponentInputs(component, config.injector);
    const strategyFactory = config.strategyFactory || new ComponentNgElementStrategyFactory(component, config.injector);
    const attributeToPropertyInputs = getDefaultAttributeToPropertyInputs(inputs);
    class NgElementImpl extends NgElement {
        constructor(injector) {
            super();
            this.injector = injector;
        }
        get ngElementStrategy() {
            // NOTE:
            // Some polyfills (e.g. `document-register-element`) do not call the constructor, therefore
            // it is not safe to set `ngElementStrategy` in the constructor and assume it will be
            // available inside the methods.
            //
            // TODO(andrewseguin): Add e2e tests that cover cases where the constructor isn't called. For
            // now this is tested using a Google internal test suite.
            if (!this._ngElementStrategy) {
                const strategy = this._ngElementStrategy =
                    strategyFactory.create(this.injector || config.injector);
                // Collect pre-existing values on the element to re-apply through the strategy.
                const preExistingValues = inputs.filter(({ propName }) => this.hasOwnProperty(propName)).map(({ propName }) => [propName, this[propName]]);
                // In some browsers (e.g. IE10), `Object.setPrototypeOf()` (which is required by some Custom
                // Elements polyfills) is not defined and is thus polyfilled in a way that does not preserve
                // the prototype chain. In such cases, `this` will not be an instance of `NgElementImpl` and
                // thus not have the component input getters/setters defined on `NgElementImpl.prototype`.
                if (!(this instanceof NgElementImpl)) {
                    // Add getters and setters to the instance itself for each property input.
                    defineInputGettersSetters(inputs, this);
                }
                else {
                    // Delete the property from the instance, so that it can go through the getters/setters
                    // set on `NgElementImpl.prototype`.
                    preExistingValues.forEach(([propName]) => delete this[propName]);
                }
                // Re-apply pre-existing values through the strategy.
                preExistingValues.forEach(([propName, value]) => strategy.setInputValue(propName, value));
            }
            return this._ngElementStrategy;
        }
        attributeChangedCallback(attrName, oldValue, newValue, namespace) {
            const propName = attributeToPropertyInputs[attrName];
            this.ngElementStrategy.setInputValue(propName, newValue);
        }
        connectedCallback() {
            // For historical reasons, some strategies may not have initialized the `events` property
            // until after `connect()` is run. Subscribe to `events` if it is available before running
            // `connect()` (in order to capture events emitted suring inittialization), otherwise
            // subscribe afterwards.
            //
            // TODO: Consider deprecating/removing the post-connect subscription in a future major version
            //       (e.g. v11).
            let subscribedToEvents = false;
            if (this.ngElementStrategy.events) {
                // `events` are already available: Subscribe to it asap.
                this.subscribeToEvents();
                subscribedToEvents = true;
            }
            this.ngElementStrategy.connect(this);
            if (!subscribedToEvents) {
                // `events` were not initialized before running `connect()`: Subscribe to them now.
                // The events emitted during the component initialization have been missed, but at least
                // future events will be captured.
                this.subscribeToEvents();
            }
        }
        disconnectedCallback() {
            // Not using `this.ngElementStrategy` to avoid unnecessarily creating the `NgElementStrategy`.
            if (this._ngElementStrategy) {
                this._ngElementStrategy.disconnect();
            }
            if (this.ngElementEventsSubscription) {
                this.ngElementEventsSubscription.unsubscribe();
                this.ngElementEventsSubscription = null;
            }
        }
        subscribeToEvents() {
            // Listen for events from the strategy and dispatch them as custom events.
            this.ngElementEventsSubscription = this.ngElementStrategy.events.subscribe(e => {
                const customEvent = createCustomEvent(this.ownerDocument, e.name, e.value);
                this.dispatchEvent(customEvent);
            });
        }
    }
    // Work around a bug in closure typed optimizations(b/79557487) where it is not honoring static
    // field externs. So using quoted access to explicitly prevent renaming.
    NgElementImpl['observedAttributes'] = Object.keys(attributeToPropertyInputs);
    // TypeScript 3.9+ defines getters/setters as configurable but non-enumerable properties (in
    // compliance with the spec). This breaks emulated inheritance in ES5 on environments that do not
    // natively support `Object.setPrototypeOf()` (such as IE 9-10).
    // Update the property descriptor of `NgElementImpl#ngElementStrategy` to make it enumerable.
    // The below 'const', shouldn't be needed but currently this breaks build-optimizer
    // Build-optimizer currently uses TypeScript 3.6 which is unable to resolve an 'accessor'
    // in 'getTypeOfVariableOrParameterOrPropertyWorker'.
    const getterName = 'ngElementStrategy';
    Object.defineProperty(NgElementImpl.prototype, getterName, { enumerable: true });
    // Add getters and setters to the prototype for each property input.
    defineInputGettersSetters(inputs, NgElementImpl.prototype);
    return NgElementImpl;
}
// Helpers
function defineInputGettersSetters(inputs, target) {
    // Add getters and setters for each property input.
    inputs.forEach(({ propName }) => {
        Object.defineProperty(target, propName, {
            get() {
                return this.ngElementStrategy.getInputValue(propName);
            },
            set(newValue) {
                this.ngElementStrategy.setInputValue(propName, newValue);
            },
            configurable: true,
            enumerable: true,
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWN1c3RvbS1lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZWxlbWVudHMvc3JjL2NyZWF0ZS1jdXN0b20tZWxlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSCxPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUUvRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsbUNBQW1DLEVBQUMsTUFBTSxTQUFTLENBQUM7QUF1Qm5HOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLFNBQVUsU0FBUSxXQUFXO0lBQW5EOztRQU1FOztXQUVHO1FBQ08sZ0NBQTJCLEdBQXNCLElBQUksQ0FBQztJQXNCbEUsQ0FBQztDQUFBO0FBZ0NEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0gsTUFBTSxVQUFVLG1CQUFtQixDQUMvQixTQUFvQixFQUFFLE1BQXVCO0lBQy9DLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFOUQsTUFBTSxlQUFlLEdBQ2pCLE1BQU0sQ0FBQyxlQUFlLElBQUksSUFBSSxpQ0FBaUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhHLE1BQU0seUJBQXlCLEdBQUcsbUNBQW1DLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFOUUsTUFBTSxhQUFjLFNBQVEsU0FBUztRQTZDbkMsWUFBNkIsUUFBbUI7WUFDOUMsS0FBSyxFQUFFLENBQUM7WUFEbUIsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUVoRCxDQUFDO1FBMUNELElBQWMsaUJBQWlCO1lBQzdCLFFBQVE7WUFDUiwyRkFBMkY7WUFDM0YscUZBQXFGO1lBQ3JGLGdDQUFnQztZQUNoQyxFQUFFO1lBQ0YsNkZBQTZGO1lBQzdGLHlEQUF5RDtZQUN6RCxJ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QUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQ0QsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0NvbXBvbmVudE5nRWxlbWVudFN0cmF0ZWd5RmFjdG9yeX0gZnJvbSAnLi9jb21wb25lbnQtZmFjdG9yeS1zdHJhdGVneSc7XG5pbXBvcnQge05nRWxlbWVudFN0cmF0ZWd5LCBOZ0VsZW1lbnRTdHJhdGVneUZhY3Rvcnl9IGZyb20gJy4vZWxlbWVudC1zdHJhdGVneSc7XG5pbXBvcnQge2NyZWF0ZUN1c3RvbUV2ZW50LCBnZXRDb21wb25lbnRJbnB1dHMsIGdldERlZmF1bHRBdHRyaWJ1dGVUb1Byb3BlcnR5SW5wdXRzfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBQcm90b3R5cGUgZm9yIGEgY2xhc3MgY29uc3RydWN0b3IgYmFzZWQgb24gYW4gQW5ndWxhciBjb21wb25lbnRcbiAqIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGN1c3RvbSBlbGVtZW50IHJlZ2lzdHJhdGlvbi4gSW1wbGVtZW50ZWQgYW5kIHJldHVybmVkXG4gKiBieSB0aGUge0BsaW5rIGNyZWF0ZUN1c3RvbUVsZW1lbnQgY3JlYXRlQ3VzdG9tRWxlbWVudCgpIGZ1bmN0aW9ufS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdFbGVtZW50Q29uc3RydWN0b3I8UD4ge1xuICAvKipcbiAgICogQW4gYXJyYXkgb2Ygb2JzZXJ2ZWQgYXR0cmlidXRlIG5hbWVzIGZvciB0aGUgY3VzdG9tIGVsZW1lbnQsXG4gICAqIGRlcml2ZWQgYnkgdHJhbnNmb3JtaW5nIGlucHV0IHByb3BlcnR5IG5hbWVzIGZyb20gdGhlIHNvdXJjZSBjb21wb25lbnQuXG4gICAqL1xuICByZWFkb25seSBvYnNlcnZlZEF0dHJpYnV0ZXM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBhIGNvbnN0cnVjdG9yIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gaW5qZWN0b3IgSWYgcHJvdmlkZWQsIG92ZXJyaWRlcyB0aGUgY29uZmlndXJlZCBpbmplY3Rvci5cbiAgICovXG4gIG5ldyhpbmplY3Rvcj86IEluamVjdG9yKTogTmdFbGVtZW50JldpdGhQcm9wZXJ0aWVzPFA+O1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgdGhlIGZ1bmN0aW9uYWxpdHkgbmVlZGVkIGZvciBhIGN1c3RvbSBlbGVtZW50LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgLyoqXG4gICAqIFRoZSBzdHJhdGVneSB0aGF0IGNvbnRyb2xzIGhvdyBhIGNvbXBvbmVudCBpcyB0cmFuc2Zvcm1lZCBpbiBhIGN1c3RvbSBlbGVtZW50LlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByb3RlY3RlZCBuZ0VsZW1lbnRTdHJhdGVneSE6IE5nRWxlbWVudFN0cmF0ZWd5O1xuICAvKipcbiAgICogQSBzdWJzY3JpcHRpb24gdG8gY2hhbmdlLCBjb25uZWN0LCBhbmQgZGlzY29ubmVjdCBldmVudHMgaW4gdGhlIGN1c3RvbSBlbGVtZW50LlxuICAgKi9cbiAgcHJvdGVjdGVkIG5nRWxlbWVudEV2ZW50c1N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9ufG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBQcm90b3R5cGUgZm9yIGEgaGFuZGxlciB0aGF0IHJlc3BvbmRzIHRvIGEgY2hhbmdlIGluIGFuIG9ic2VydmVkIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIGF0dHJOYW1lIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgdGhhdCBoYXMgY2hhbmdlZC5cbiAgICogQHBhcmFtIG9sZFZhbHVlIFRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlLlxuICAgKiBAcGFyYW0gbmV3VmFsdWUgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlLlxuICAgKiBAcGFyYW0gbmFtZXNwYWNlIFRoZSBuYW1lc3BhY2UgaW4gd2hpY2ggdGhlIGF0dHJpYnV0ZSBpcyBkZWZpbmVkLlxuICAgKiBAcmV0dXJucyBOb3RoaW5nLlxuICAgKi9cbiAgYWJzdHJhY3QgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKFxuICAgICAgYXR0ck5hbWU6IHN0cmluZywgb2xkVmFsdWU6IHN0cmluZ3xudWxsLCBuZXdWYWx1ZTogc3RyaW5nLCBuYW1lc3BhY2U/OiBzdHJpbmcpOiB2b2lkO1xuICAvKipcbiAgICogUHJvdG90eXBlIGZvciBhIGhhbmRsZXIgdGhhdCByZXNwb25kcyB0byB0aGUgaW5zZXJ0aW9uIG9mIHRoZSBjdXN0b20gZWxlbWVudCBpbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJucyBOb3RoaW5nLlxuICAgKi9cbiAgYWJzdHJhY3QgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZDtcbiAgLyoqXG4gICAqIFByb3RvdHlwZSBmb3IgYSBoYW5kbGVyIHRoYXQgcmVzcG9uZHMgdG8gdGhlIGRlbGV0aW9uIG9mIHRoZSBjdXN0b20gZWxlbWVudCBmcm9tIHRoZSBET00uXG4gICAqIEByZXR1cm5zIE5vdGhpbmcuXG4gICAqL1xuICBhYnN0cmFjdCBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkO1xufVxuXG4vKipcbiAqIEFkZGl0aW9uYWwgdHlwZSBpbmZvcm1hdGlvbiB0aGF0IGNhbiBiZSBhZGRlZCB0byB0aGUgTmdFbGVtZW50IGNsYXNzLFxuICogZm9yIHByb3BlcnRpZXMgdGhhdCBhcmUgYWRkZWQgYmFzZWRcbiAqIG9uIHRoZSBpbnB1dHMgYW5kIG1ldGhvZHMgb2YgdGhlIHVuZGVybHlpbmcgY29tcG9uZW50LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IHR5cGUgV2l0aFByb3BlcnRpZXM8UD4gPSB7XG4gIFtwcm9wZXJ0eSBpbiBrZXlvZiBQXTogUFtwcm9wZXJ0eV1cbn07XG5cbi8qKlxuICogQSBjb25maWd1cmF0aW9uIHRoYXQgaW5pdGlhbGl6ZXMgYW4gTmdFbGVtZW50Q29uc3RydWN0b3Igd2l0aCB0aGVcbiAqIGRlcGVuZGVuY2llcyBhbmQgc3RyYXRlZ3kgaXQgbmVlZHMgdG8gdHJhbnNmb3JtIGEgY29tcG9uZW50IGludG9cbiAqIGEgY3VzdG9tIGVsZW1lbnQgY2xhc3MuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nRWxlbWVudENvbmZpZyB7XG4gIC8qKlxuICAgKiBUaGUgaW5qZWN0b3IgdG8gdXNlIGZvciByZXRyaWV2aW5nIHRoZSBjb21wb25lbnQncyBmYWN0b3J5LlxuICAgKi9cbiAgaW5qZWN0b3I6IEluamVjdG9yO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgY3VzdG9tIHN0cmF0ZWd5IGZhY3RvcnkgdG8gdXNlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQuXG4gICAqIFRoZSBzdHJhdGVneSBjb250cm9scyBob3cgdGhlIHRyYW5zZm9ybWF0aW9uIGlzIHBlcmZvcm1lZC5cbiAgICovXG4gIHN0cmF0ZWd5RmFjdG9yeT86IE5nRWxlbWVudFN0cmF0ZWd5RmFjdG9yeTtcbn1cblxuLyoqXG4gKiAgQGRlc2NyaXB0aW9uIENyZWF0ZXMgYSBjdXN0b20gZWxlbWVudCBjbGFzcyBiYXNlZCBvbiBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiBCdWlsZHMgYSBjbGFzcyB0aGF0IGVuY2Fwc3VsYXRlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiB0aGUgcHJvdmlkZWQgY29tcG9uZW50IGFuZFxuICogdXNlcyB0aGUgY29uZmlndXJhdGlvbiBpbmZvcm1hdGlvbiB0byBwcm92aWRlIG1vcmUgY29udGV4dCB0byB0aGUgY2xhc3MuXG4gKiBUYWtlcyB0aGUgY29tcG9uZW50IGZhY3RvcnkncyBpbnB1dHMgYW5kIG91dHB1dHMgdG8gY29udmVydCB0aGVtIHRvIHRoZSBwcm9wZXJcbiAqIGN1c3RvbSBlbGVtZW50IEFQSSBhbmQgYWRkIGhvb2tzIHRvIGlucHV0IGNoYW5nZXMuXG4gKlxuICogVGhlIGNvbmZpZ3VyYXRpb24ncyBpbmplY3RvciBpcyB0aGUgaW5pdGlhbCBpbmplY3RvciBzZXQgb24gdGhlIGNsYXNzLFxuICogYW5kIHVzZWQgYnkgZGVmYXVsdCBmb3IgZWFjaCBjcmVhdGVkIGluc3RhbmNlLlRoaXMgYmVoYXZpb3IgY2FuIGJlIG92ZXJyaWRkZW4gd2l0aCB0aGVcbiAqIHN0YXRpYyBwcm9wZXJ0eSB0byBhZmZlY3QgYWxsIG5ld2x5IGNyZWF0ZWQgaW5zdGFuY2VzLCBvciBhcyBhIGNvbnN0cnVjdG9yIGFyZ3VtZW50IGZvclxuICogb25lLW9mZiBjcmVhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIHRyYW5zZm9ybS5cbiAqIEBwYXJhbSBjb25maWcgQSBjb25maWd1cmF0aW9uIHRoYXQgcHJvdmlkZXMgaW5pdGlhbGl6YXRpb24gaW5mb3JtYXRpb24gdG8gdGhlIGNyZWF0ZWQgY2xhc3MuXG4gKiBAcmV0dXJucyBUaGUgY3VzdG9tLWVsZW1lbnQgY29uc3RydWN0aW9uIGNsYXNzLCB3aGljaCBjYW4gYmUgcmVnaXN0ZXJlZCB3aXRoXG4gKiBhIGJyb3dzZXIncyBgQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5YC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21FbGVtZW50PFA+KFxuICAgIGNvbXBvbmVudDogVHlwZTxhbnk+LCBjb25maWc6IE5nRWxlbWVudENvbmZpZyk6IE5nRWxlbWVudENvbnN0cnVjdG9yPFA+IHtcbiAgY29uc3QgaW5wdXRzID0gZ2V0Q29tcG9uZW50SW5wdXRzKGNvbXBvbmVudCwgY29uZmlnLmluamVjdG9yKTtcblxuICBjb25zdCBzdHJhdGVneUZhY3RvcnkgPVxuICAgICAgY29uZmlnLnN0cmF0ZWd5RmFjdG9yeSB8fCBuZXcgQ29tcG9uZW50TmdFbGVtZW50U3RyYXRlZ3lGYWN0b3J5KGNvbXBvbmVudCwgY29uZmlnLmluamVjdG9yKTtcblxuICBjb25zdCBhdHRyaWJ1dGVUb1Byb3BlcnR5SW5wdXRzID0gZ2V0RGVmYXVsdEF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHMoaW5wdXRzKTtcblxuICBjbGFzcyBOZ0VsZW1lbnRJbXBsIGV4dGVuZHMgTmdFbGVtZW50IHtcbiAgICAvLyBXb3JrIGFyb3VuZCBhIGJ1ZyBpbiBjbG9zdXJlIHR5cGVkIG9wdGltaXphdGlvbnMoYi83OTU1NzQ4Nykgd2hlcmUgaXQgaXMgbm90IGhvbm9yaW5nIHN0YXRpY1xuICAgIC8vIGZpZWxkIGV4dGVybnMuIFNvIHVzaW5nIHF1b3RlZCBhY2Nlc3MgdG8gZXhwbGljaXRseSBwcmV2ZW50IHJlbmFtaW5nLlxuICAgIHN0YXRpYyByZWFkb25seVsnb2JzZXJ2ZWRBdHRyaWJ1dGVzJ10gPSBPYmplY3Qua2V5cyhhdHRyaWJ1dGVUb1Byb3BlcnR5SW5wdXRzKTtcblxuICAgIHByb3RlY3RlZCBnZXQgbmdFbGVtZW50U3RyYXRlZ3koKTogTmdFbGVtZW50U3RyYXRlZ3kge1xuICAgICAgLy8gTk9URTpcbiAgICAgIC8vIFNvbWUgcG9seWZpbGxzIChlLmcuIGBkb2N1bWVudC1yZWdpc3Rlci1lbGVtZW50YCkgZG8gbm90IGNhbGwgdGhlIGNvbnN0cnVjdG9yLCB0aGVyZWZvcmVcbiAgICAgIC8vIGl0IGlzIG5vdCBzYWZlIHRvIHNldCBgbmdFbGVtZW50U3RyYXRlZ3lgIGluIHRoZSBjb25zdHJ1Y3RvciBhbmQgYXNzdW1lIGl0IHdpbGwgYmVcbiAgICAgIC8vIGF2YWlsYWJsZSBpbnNpZGUgdGhlIG1ldGhvZHMuXG4gICAgICAvL1xuICAgICAgLy8gVE9ETyhhbmRyZXdzZWd1aW4pOiBBZGQgZTJlIHRlc3RzIHRoYXQgY292ZXIgY2FzZXMgd2hlcmUgdGhlIGNvbnN0cnVjdG9yIGlzbid0IGNhbGxlZC4gRm9yXG4gICAgICAvLyBub3cgdGhpcyBpcyB0ZXN0ZWQgdXNpbmcgYSBHb29nbGUgaW50ZXJuYWwgdGVzdCBzdWl0ZS5cbiAgICAgIGlmICghdGhpcy5fbmdFbGVtZW50U3RyYXRlZ3kpIHtcbiAgICAgICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLl9uZ0VsZW1lbnRTdHJhdGVneSA9XG4gICAgICAgICAgICBzdHJhdGVneUZhY3RvcnkuY3JlYXRlKHRoaXMuaW5qZWN0b3IgfHwgY29uZmlnLmluamVjdG9yKTtcblxuICAgICAgICAvLyBDb2xsZWN0IHByZS1leGlzdGluZyB2YWx1ZXMgb24gdGhlIGVsZW1lbnQgdG8gcmUtYXBwbHkgdGhyb3VnaCB0aGUgc3RyYXRlZ3kuXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nVmFsdWVzID1cbiAgICAgICAgICAgIGlucHV0cy5maWx0ZXIoKHtwcm9wTmFtZX0pID0+IHRoaXMuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKS5tYXAoKHtwcm9wTmFtZX0pOiBbXG4gICAgICAgICAgICAgIHN0cmluZywgYW55XG4gICAgICAgICAgICBdID0+IFtwcm9wTmFtZSwgKHRoaXMgYXMgYW55KVtwcm9wTmFtZV1dKTtcblxuICAgICAgICAvLyBJbiBzb21lIGJyb3dzZXJzIChlLmcuIElFMTApLCBgT2JqZWN0LnNldFByb3RvdHlwZU9mKClgICh3aGljaCBpcyByZXF1aXJlZCBieSBzb21lIEN1c3RvbVxuICAgICAgICAvLyBFbGVtZW50cyBwb2x5ZmlsbHMpIGlzIG5vdCBkZWZpbmVkIGFuZCBpcyB0aHVzIHBvbHlmaWxsZWQgaW4gYSB3YXkgdGhhdCBkb2VzIG5vdCBwcmVzZXJ2ZVxuICAgICAgICAvLyB0aGUgcHJvdG90eXBlIGNoYWluLiBJbiBzdWNoIGNhc2VzLCBgdGhpc2Agd2lsbCBub3QgYmUgYW4gaW5zdGFuY2Ugb2YgYE5nRWxlbWVudEltcGxgIGFuZFxuICAgICAgICAvLyB0aHVzIG5vdCBoYXZlIHRoZSBjb21wb25lbnQgaW5wdXQgZ2V0dGVycy9zZXR0ZXJzIGRlZmluZWQgb24gYE5nRWxlbWVudEltcGwucHJvdG90eXBlYC5cbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE5nRWxlbWVudEltcGwpKSB7XG4gICAgICAgICAgLy8gQWRkIGdldHRlcnMgYW5kIHNldHRlcnMgdG8gdGhlIGluc3RhbmNlIGl0c2VsZiBmb3IgZWFjaCBwcm9wZXJ0eSBpbnB1dC5cbiAgICAgICAgICBkZWZpbmVJbnB1dEdldHRlcnNTZXR0ZXJzKGlucHV0cywgdGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRGVsZXRlIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBpbnN0YW5jZSwgc28gdGhhdCBpdCBjYW4gZ28gdGhyb3VnaCB0aGUgZ2V0dGVycy9zZXR0ZXJzXG4gICAgICAgICAgLy8gc2V0IG9uIGBOZ0VsZW1lbnRJbXBsLnByb3RvdHlwZWAuXG4gICAgICAgICAgcHJlRXhpc3RpbmdWYWx1ZXMuZm9yRWFjaCgoW3Byb3BOYW1lXSkgPT4gZGVsZXRlICh0aGlzIGFzIGFueSlbcHJvcE5hbWVdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlLWFwcGx5IHByZS1leGlzdGluZyB2YWx1ZXMgdGhyb3VnaCB0aGUgc3RyYXRlZ3kuXG4gICAgICAgIHByZUV4aXN0aW5nVmFsdWVzLmZvckVhY2goKFtwcm9wTmFtZSwgdmFsdWVdKSA9PiBzdHJhdGVneS5zZXRJbnB1dFZhbHVlKHByb3BOYW1lLCB2YWx1ZSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fbmdFbGVtZW50U3RyYXRlZ3khO1xuICAgIH1cblxuICAgIHByaXZhdGUgX25nRWxlbWVudFN0cmF0ZWd5PzogTmdFbGVtZW50U3RyYXRlZ3k7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGluamVjdG9yPzogSW5qZWN0b3IpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKFxuICAgICAgICBhdHRyTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nfG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgICAgY29uc3QgcHJvcE5hbWUgPSBhdHRyaWJ1dGVUb1Byb3BlcnR5SW5wdXRzW2F0dHJOYW1lXSE7XG4gICAgICB0aGlzLm5nRWxlbWVudFN0cmF0ZWd5LnNldElucHV0VmFsdWUocHJvcE5hbWUsIG5ld1ZhbHVlKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICAgIC8vIEZvciBoaXN0b3JpY2FsIHJlYXNvbnMsIHNvbWUgc3RyYXRlZ2llcyBtYXkgbm90IGhhdmUgaW5pdGlhbGl6ZWQgdGhlIGBldmVudHNgIHByb3BlcnR5XG4gICAgICAvLyB1bnRpbCBhZnRlciBgY29ubmVjdCgpYCBpcyBydW4uIFN1YnNjcmliZSB0byBgZXZlbnRzYCBpZiBpdCBpcyBhdmFpbGFibGUgYmVmb3JlIHJ1bm5pbmdcbiAgICAgIC8vIGBjb25uZWN0KClgIChpbiBvcmRlciB0byBjYXB0dXJlIGV2ZW50cyBlbWl0dGVkIHN1cmluZyBpbml0dGlhbGl6YXRpb24pLCBvdGhlcndpc2VcbiAgICAgIC8vIHN1YnNjcmliZSBhZnRlcndhcmRzLlxuICAgICAgLy9cbiAgICAgIC8vIFRPRE86IENvbnNpZGVyIGRlcHJlY2F0aW5nL3JlbW92aW5nIHRoZSBwb3N0LWNvbm5lY3Qgc3Vic2NyaXB0aW9uIGluIGEgZnV0dXJlIG1ham9yIHZlcnNpb25cbiAgICAgIC8vICAgICAgIChlLmcuIHYxMSkuXG5cbiAgICAgIGxldCBzdWJzY3JpYmVkVG9FdmVudHMgPSBmYWxzZTtcblxuICAgICAgaWYgKHRoaXMubmdFbGVtZW50U3RyYXRlZ3kuZXZlbnRzKSB7XG4gICAgICAgIC8vIGBldmVudHNgIGFyZSBhbHJlYWR5IGF2YWlsYWJsZTogU3Vic2NyaWJlIHRvIGl0IGFzYXAuXG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9FdmVudHMoKTtcbiAgICAgICAgc3Vic2NyaWJlZFRvRXZlbnRzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5uZ0VsZW1lbnRTdHJhdGVneS5jb25uZWN0KHRoaXMpO1xuXG4gICAgICBpZiAoIXN1YnNjcmliZWRUb0V2ZW50cykge1xuICAgICAgICAvLyBgZXZlbnRzYCB3ZXJlIG5vdCBpbml0aWFsaXplZCBiZWZvcmUgcnVubmluZyBgY29ubmVjdCgpYDogU3Vic2NyaWJlIHRvIHRoZW0gbm93LlxuICAgICAgICAvLyBUaGUgZXZlbnRzIGVtaXR0ZWQgZHVyaW5nIHRoZSBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24gaGF2ZSBiZWVuIG1pc3NlZCwgYnV0IGF0IGxlYXN0XG4gICAgICAgIC8vIGZ1dHVyZSBldmVudHMgd2lsbCBiZSBjYXB0dXJlZC5cbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb0V2ZW50cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgICAgLy8gTm90IHVzaW5nIGB0aGlzLm5nRWxlbWVudFN0cmF0ZWd5YCB0byBhdm9pZCB1bm5lY2Vzc2FyaWx5IGNyZWF0aW5nIHRoZSBgTmdFbGVtZW50U3RyYXRlZ3lgLlxuICAgICAgaWYgKHRoaXMuX25nRWxlbWVudFN0cmF0ZWd5KSB7XG4gICAgICAgIHRoaXMuX25nRWxlbWVudFN0cmF0ZWd5LmRpc2Nvbm5lY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMubmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIHRoaXMubmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN1YnNjcmliZVRvRXZlbnRzKCk6IHZvaWQge1xuICAgICAgLy8gTGlzdGVuIGZvciBldmVudHMgZnJvbSB0aGUgc3RyYXRlZ3kgYW5kIGRpc3BhdGNoIHRoZW0gYXMgY3VzdG9tIGV2ZW50cy5cbiAgICAgIHRoaXMubmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uID0gdGhpcy5uZ0VsZW1lbnRTdHJhdGVneS5ldmVudHMuc3Vic2NyaWJlKGUgPT4ge1xuICAgICAgICBjb25zdCBjdXN0b21FdmVudCA9IGNyZWF0ZUN1c3RvbUV2ZW50KHRoaXMub3duZXJEb2N1bWVudCEsIGUubmFtZSwgZS52YWx1ZSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChjdXN0b21FdmVudCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBUeXBlU2NyaXB0IDMuOSsgZGVmaW5lcyBnZXR0ZXJzL3NldHRlcnMgYXMgY29uZmlndXJhYmxlIGJ1dCBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzIChpblxuICAvLyBjb21wbGlhbmNlIHdpdGggdGhlIHNwZWMpLiBUaGlzIGJyZWFrcyBlbXVsYXRlZCBpbmhlcml0YW5jZSBpbiBFUzUgb24gZW52aXJvbm1lbnRzIHRoYXQgZG8gbm90XG4gIC8vIG5hdGl2ZWx5IHN1cHBvcnQgYE9iamVjdC5zZXRQcm90b3R5cGVPZigpYCAoc3VjaCBhcyBJRSA5LTEwKS5cbiAgLy8gVXBkYXRlIHRoZSBwcm9wZXJ0eSBkZXNjcmlwdG9yIG9mIGBOZ0VsZW1lbnRJbXBsI25nRWxlbWVudFN0cmF0ZWd5YCB0byBtYWtlIGl0IGVudW1lcmFibGUuXG4gIC8vIFRoZSBiZWxvdyAnY29uc3QnLCBzaG91bGRuJ3QgYmUgbmVlZGVkIGJ1dCBjdXJyZW50bHkgdGhpcyBicmVha3MgYnVpbGQtb3B0aW1pemVyXG4gIC8vIEJ1aWxkLW9wdGltaXplciBjdXJyZW50bHkgdXNlcyBUeXBlU2NyaXB0IDMuNiB3aGljaCBpcyB1bmFibGUgdG8gcmVzb2x2ZSBhbiAnYWNjZXNzb3InXG4gIC8vIGluICdnZXRUeXBlT2ZWYXJpYWJsZU9yUGFyYW1ldGVyT3JQcm9wZXJ0eVdvcmtlcicuXG4gIGNvbnN0IGdldHRlck5hbWUgPSAnbmdFbGVtZW50U3RyYXRlZ3knO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmdFbGVtZW50SW1wbC5wcm90b3R5cGUsIGdldHRlck5hbWUsIHtlbnVtZXJhYmxlOiB0cnVlfSk7XG5cbiAgLy8gQWRkIGdldHRlcnMgYW5kIHNldHRlcnMgdG8gdGhlIHByb3RvdHlwZSBmb3IgZWFjaCBwcm9wZXJ0eSBpbnB1dC5cbiAgZGVmaW5lSW5wdXRHZXR0ZXJzU2V0dGVycyhpbnB1dHMsIE5nRWxlbWVudEltcGwucHJvdG90eXBlKTtcblxuICByZXR1cm4gKE5nRWxlbWVudEltcGwgYXMgYW55KSBhcyBOZ0VsZW1lbnRDb25zdHJ1Y3RvcjxQPjtcbn1cblxuLy8gSGVscGVyc1xuZnVuY3Rpb24gZGVmaW5lSW5wdXRHZXR0ZXJzU2V0dGVycyhcbiAgICBpbnB1dHM6IHtwcm9wTmFtZTogc3RyaW5nLCB0ZW1wbGF0ZU5hbWU6IHN0cmluZ31bXSwgdGFyZ2V0OiBvYmplY3QpOiB2b2lkIHtcbiAgLy8gQWRkIGdldHRlcnMgYW5kIHNldHRlcnMgZm9yIGVhY2ggcHJvcGVydHkgaW5wdXQuXG4gIGlucHV0cy5mb3JFYWNoKCh7cHJvcE5hbWV9KSA9PiB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcE5hbWUsIHtcbiAgICAgIGdldCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZ0VsZW1lbnRTdHJhdGVneS5nZXRJbnB1dFZhbHVlKHByb3BOYW1lKTtcbiAgICAgIH0sXG4gICAgICBzZXQobmV3VmFsdWU6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLm5nRWxlbWVudFN0cmF0ZWd5LnNldElucHV0VmFsdWUocHJvcE5hbWUsIG5ld1ZhbHVlKTtcbiAgICAgIH0sXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIH0pO1xuICB9KTtcbn1cbiJdfQ==