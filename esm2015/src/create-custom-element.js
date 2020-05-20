/**
 * @fileoverview added by tsickle
 * Generated from: packages/elements/src/create-custom-element.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentNgElementStrategyFactory } from './component-factory-strategy';
import { createCustomEvent, getComponentInputs, getDefaultAttributeToPropertyInputs } from './utils';
/**
 * Prototype for a class constructor based on an Angular component
 * that can be used for custom element registration. Implemented and returned
 * by the {\@link createCustomElement createCustomElement() function}.
 *
 * \@publicApi
 * @record
 * @template P
 */
export function NgElementConstructor() { }
if (false) {
    /**
     * An array of observed attribute names for the custom element,
     * derived by transforming input property names from the source component.
     * @type {?}
     */
    NgElementConstructor.prototype.observedAttributes;
    /* Skipping unhandled member: new(injector?: Injector): NgElement&WithProperties<P>;*/
}
/**
 * Implements the functionality needed for a custom element.
 *
 * \@publicApi
 * @abstract
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
if (false) {
    /**
     * The strategy that controls how a component is transformed in a custom element.
     * @type {?}
     * @protected
     */
    NgElement.prototype.ngElementStrategy;
    /**
     * A subscription to change, connect, and disconnect events in the custom element.
     * @type {?}
     * @protected
     */
    NgElement.prototype.ngElementEventsSubscription;
    /**
     * Prototype for a handler that responds to a change in an observed attribute.
     * @abstract
     * @param {?} attrName The name of the attribute that has changed.
     * @param {?} oldValue The previous value of the attribute.
     * @param {?} newValue The new value of the attribute.
     * @param {?=} namespace The namespace in which the attribute is defined.
     * @return {?} Nothing.
     */
    NgElement.prototype.attributeChangedCallback = function (attrName, oldValue, newValue, namespace) { };
    /**
     * Prototype for a handler that responds to the insertion of the custom element in the DOM.
     * @abstract
     * @return {?} Nothing.
     */
    NgElement.prototype.connectedCallback = function () { };
    /**
     * Prototype for a handler that responds to the deletion of the custom element from the DOM.
     * @abstract
     * @return {?} Nothing.
     */
    NgElement.prototype.disconnectedCallback = function () { };
}
/**
 * A configuration that initializes an NgElementConstructor with the
 * dependencies and strategy it needs to transform a component into
 * a custom element class.
 *
 * \@publicApi
 * @record
 */
export function NgElementConfig() { }
if (false) {
    /**
     * The injector to use for retrieving the component's factory.
     * @type {?}
     */
    NgElementConfig.prototype.injector;
    /**
     * An optional custom strategy factory to use instead of the default.
     * The strategy controls how the transformation is performed.
     * @type {?|undefined}
     */
    NgElementConfig.prototype.strategyFactory;
}
/**
 * \@description Creates a custom element class based on an Angular component.
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
 * \@publicApi
 * @template P
 * @param {?} component The component to transform.
 * @param {?} config A configuration that provides initialization information to the created class.
 * @return {?} The custom-element construction class, which can be registered with
 * a browser's `CustomElementRegistry`.
 *
 */
export function createCustomElement(component, config) {
    /** @type {?} */
    const inputs = getComponentInputs(component, config.injector);
    /** @type {?} */
    const strategyFactory = config.strategyFactory || new ComponentNgElementStrategyFactory(component, config.injector);
    /** @type {?} */
    const attributeToPropertyInputs = getDefaultAttributeToPropertyInputs(inputs);
    let NgElementImpl = /** @class */ (() => {
        class NgElementImpl extends NgElement {
            /**
             * @param {?=} injector
             */
            constructor(injector) {
                super();
                this.injector = injector;
            }
            /**
             * @protected
             * @return {?}
             */
            get ngElementStrategy() {
                // NOTE:
                // Some polyfills (e.g. `document-register-element`) do not call the constructor, therefore
                // it is not safe to set `ngElementStrategy` in the constructor and assume it will be
                // available inside the methods.
                //
                // TODO(andrewseguin): Add e2e tests that cover cases where the constructor isn't called. For
                // now this is tested using a Google internal test suite.
                if (!this._ngElementStrategy) {
                    /** @type {?} */
                    const strategy = this._ngElementStrategy =
                        strategyFactory.create(this.injector || config.injector);
                    // Collect pre-existing values on the element to re-apply through the strategy.
                    /** @type {?} */
                    const preExistingValues = inputs.filter((/**
                     * @param {?} __0
                     * @return {?}
                     */
                    ({ propName }) => this.hasOwnProperty(propName))).map((/**
                     * @param {?} __0
                     * @return {?}
                     */
                    ({ propName }) => [propName, ((/** @type {?} */ (this)))[propName]]));
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
                        preExistingValues.forEach((/**
                         * @param {?} __0
                         * @return {?}
                         */
                        ([propName]) => delete ((/** @type {?} */ (this)))[propName]));
                    }
                    // Re-apply pre-existing values through the strategy.
                    preExistingValues.forEach((/**
                     * @param {?} __0
                     * @return {?}
                     */
                    ([propName, value]) => strategy.setInputValue(propName, value)));
                }
                return (/** @type {?} */ (this._ngElementStrategy));
            }
            /**
             * @param {?} attrName
             * @param {?} oldValue
             * @param {?} newValue
             * @param {?=} namespace
             * @return {?}
             */
            attributeChangedCallback(attrName, oldValue, newValue, namespace) {
                /** @type {?} */
                const propName = (/** @type {?} */ (attributeToPropertyInputs[attrName]));
                this.ngElementStrategy.setInputValue(propName, newValue);
            }
            /**
             * @return {?}
             */
            connectedCallback() {
                this.ngElementStrategy.connect(this);
                // Listen for events from the strategy and dispatch them as custom events
                this.ngElementEventsSubscription = this.ngElementStrategy.events.subscribe((/**
                 * @param {?} e
                 * @return {?}
                 */
                e => {
                    /** @type {?} */
                    const customEvent = createCustomEvent((/** @type {?} */ (this.ownerDocument)), e.name, e.value);
                    this.dispatchEvent(customEvent);
                }));
            }
            /**
             * @return {?}
             */
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
        }
        // Work around a bug in closure typed optimizations(b/79557487) where it is not honoring static
        // field externs. So using quoted access to explicitly prevent renaming.
        NgElementImpl['observedAttributes'] = Object.keys(attributeToPropertyInputs);
        return NgElementImpl;
    })();
    if (false) {
        /* Skipping unnamed member:
        static readonly['observedAttributes'] = Object.keys(attributeToPropertyInputs);*/
        /**
         * @type {?}
         * @private
         */
        NgElementImpl.prototype._ngElementStrategy;
        /**
         * @type {?}
         * @private
         */
        NgElementImpl.prototype.injector;
    }
    // TypeScript 3.9+ defines getters/setters as configurable but non-enumerable properties (in
    // compliance with the spec). This breaks emulated inheritance in ES5 on environments that do not
    // natively support `Object.setPrototypeOf()` (such as IE 9-10).
    // Update the property descriptor of `NgElementImpl#ngElementStrategy` to make it enumerable.
    Object.defineProperty(NgElementImpl.prototype, 'ngElementStrategy', { enumerable: true });
    // Add getters and setters to the prototype for each property input.
    defineInputGettersSetters(inputs, NgElementImpl.prototype);
    return (/** @type {?} */ (((/** @type {?} */ (NgElementImpl)))));
}
// Helpers
/**
 * @param {?} inputs
 * @param {?} target
 * @return {?}
 */
function defineInputGettersSetters(inputs, target) {
    // Add getters and setters for each property input.
    inputs.forEach((/**
     * @param {?} __0
     * @return {?}
     */
    ({ propName }) => {
        Object.defineProperty(target, propName, {
            /**
             * @return {?}
             */
            get() {
                return this.ngElementStrategy.getInputValue(propName);
            },
            /**
             * @param {?} newValue
             * @return {?}
             */
            set(newValue) {
                this.ngElementStrategy.setInputValue(propName, newValue);
            },
            configurable: true,
            enumerable: true,
        });
    }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWN1c3RvbS1lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZWxlbWVudHMvc3JjL2NyZWF0ZS1jdXN0b20tZWxlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXQSxPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUUvRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsbUNBQW1DLEVBQUMsTUFBTSxTQUFTLENBQUM7Ozs7Ozs7Ozs7QUFTbkcsMENBWUM7Ozs7Ozs7SUFQQyxrREFBc0M7Ozs7Ozs7OztBQWN4QyxNQUFNLE9BQWdCLFNBQVUsU0FBUSxXQUFXO0lBQW5EOzs7OztRQVNZLGdDQUEyQixHQUFzQixJQUFJLENBQUM7SUFzQmxFLENBQUM7Q0FBQTs7Ozs7OztJQTFCQyxzQ0FBZ0Q7Ozs7OztJQUloRCxnREFBZ0U7Ozs7Ozs7Ozs7SUFVaEUsc0dBQ3lGOzs7Ozs7SUFLekYsd0RBQW1DOzs7Ozs7SUFLbkMsMkRBQXNDOzs7Ozs7Ozs7O0FBcUJ4QyxxQ0FVQzs7Ozs7O0lBTkMsbUNBQW1COzs7Ozs7SUFLbkIsMENBQTJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCN0MsTUFBTSxVQUFVLG1CQUFtQixDQUMvQixTQUFvQixFQUFFLE1BQXVCOztVQUN6QyxNQUFNLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUM7O1VBRXZELGVBQWUsR0FDakIsTUFBTSxDQUFDLGVBQWUsSUFBSSxJQUFJLGlDQUFpQyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDOztVQUV6Rix5QkFBeUIsR0FBRyxtQ0FBbUMsQ0FBQyxNQUFNLENBQUM7SUFFN0U7UUFBQSxNQUFNLGFBQWMsU0FBUSxTQUFTOzs7O1lBNkNuQyxZQUE2QixRQUFtQjtnQkFDOUMsS0FBSyxFQUFFLENB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IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7Q29tcG9uZW50TmdFbGVtZW50U3RyYXRlZ3lGYWN0b3J5fSBmcm9tICcuL2NvbXBvbmVudC1mYWN0b3J5LXN0cmF0ZWd5JztcbmltcG9ydCB7TmdFbGVtZW50U3RyYXRlZ3ksIE5nRWxlbWVudFN0cmF0ZWd5RmFjdG9yeX0gZnJvbSAnLi9lbGVtZW50LXN0cmF0ZWd5JztcbmltcG9ydCB7Y3JlYXRlQ3VzdG9tRXZlbnQsIGdldENvbXBvbmVudElucHV0cywgZ2V0RGVmYXVsdEF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHN9IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIFByb3RvdHlwZSBmb3IgYSBjbGFzcyBjb25zdHJ1Y3RvciBiYXNlZCBvbiBhbiBBbmd1bGFyIGNvbXBvbmVudFxuICogdGhhdCBjYW4gYmUgdXNlZCBmb3IgY3VzdG9tIGVsZW1lbnQgcmVnaXN0cmF0aW9uLiBJbXBsZW1lbnRlZCBhbmQgcmV0dXJuZWRcbiAqIGJ5IHRoZSB7QGxpbmsgY3JlYXRlQ3VzdG9tRWxlbWVudCBjcmVhdGVDdXN0b21FbGVtZW50KCkgZnVuY3Rpb259LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ0VsZW1lbnRDb25zdHJ1Y3RvcjxQPiB7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBvYnNlcnZlZCBhdHRyaWJ1dGUgbmFtZXMgZm9yIHRoZSBjdXN0b20gZWxlbWVudCxcbiAgICogZGVyaXZlZCBieSB0cmFuc2Zvcm1pbmcgaW5wdXQgcHJvcGVydHkgbmFtZXMgZnJvbSB0aGUgc291cmNlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlYWRvbmx5IG9ic2VydmVkQXR0cmlidXRlczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGEgY29uc3RydWN0b3IgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSBpbmplY3RvciBJZiBwcm92aWRlZCwgb3ZlcnJpZGVzIHRoZSBjb25maWd1cmVkIGluamVjdG9yLlxuICAgKi9cbiAgbmV3KGluamVjdG9yPzogSW5qZWN0b3IpOiBOZ0VsZW1lbnQmV2l0aFByb3BlcnRpZXM8UD47XG59XG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgZnVuY3Rpb25hbGl0eSBuZWVkZWQgZm9yIGEgY3VzdG9tIGVsZW1lbnQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmdFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAvKipcbiAgICogVGhlIHN0cmF0ZWd5IHRoYXQgY29udHJvbHMgaG93IGEgY29tcG9uZW50IGlzIHRyYW5zZm9ybWVkIGluIGEgY3VzdG9tIGVsZW1lbnQuXG4gICAqL1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJvdGVjdGVkIG5nRWxlbWVudFN0cmF0ZWd5ITogTmdFbGVtZW50U3RyYXRlZ3k7XG4gIC8qKlxuICAgKiBBIHN1YnNjcmlwdGlvbiB0byBjaGFuZ2UsIGNvbm5lY3QsIGFuZCBkaXNjb25uZWN0IGV2ZW50cyBpbiB0aGUgY3VzdG9tIGVsZW1lbnQuXG4gICAqL1xuICBwcm90ZWN0ZWQgbmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb258bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFByb3RvdHlwZSBmb3IgYSBoYW5kbGVyIHRoYXQgcmVzcG9uZHMgdG8gYSBjaGFuZ2UgaW4gYW4gb2JzZXJ2ZWQgYXR0cmlidXRlLlxuICAgKiBAcGFyYW0gYXR0ck5hbWUgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0aGF0IGhhcyBjaGFuZ2VkLlxuICAgKiBAcGFyYW0gb2xkVmFsdWUgVGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGUuXG4gICAqIEBwYXJhbSBuZXdWYWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGUuXG4gICAqIEBwYXJhbSBuYW1lc3BhY2UgVGhlIG5hbWVzcGFjZSBpbiB3aGljaCB0aGUgYXR0cmlidXRlIGlzIGRlZmluZWQuXG4gICAqIEByZXR1cm5zIE5vdGhpbmcuXG4gICAqL1xuICBhYnN0cmFjdCBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soXG4gICAgICBhdHRyTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nfG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQ7XG4gIC8qKlxuICAgKiBQcm90b3R5cGUgZm9yIGEgaGFuZGxlciB0aGF0IHJlc3BvbmRzIHRvIHRoZSBpbnNlcnRpb24gb2YgdGhlIGN1c3RvbSBlbGVtZW50IGluIHRoZSBET00uXG4gICAqIEByZXR1cm5zIE5vdGhpbmcuXG4gICAqL1xuICBhYnN0cmFjdCBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkO1xuICAvKipcbiAgICogUHJvdG90eXBlIGZvciBhIGhhbmRsZXIgdGhhdCByZXNwb25kcyB0byB0aGUgZGVsZXRpb24gb2YgdGhlIGN1c3RvbSBlbGVtZW50IGZyb20gdGhlIERPTS5cbiAgICogQHJldHVybnMgTm90aGluZy5cbiAgICovXG4gIGFic3RyYWN0IGRpc2Nvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogQWRkaXRpb25hbCB0eXBlIGluZm9ybWF0aW9uIHRoYXQgY2FuIGJlIGFkZGVkIHRvIHRoZSBOZ0VsZW1lbnQgY2xhc3MsXG4gKiBmb3IgcHJvcGVydGllcyB0aGF0IGFyZSBhZGRlZCBiYXNlZFxuICogb24gdGhlIGlucHV0cyBhbmQgbWV0aG9kcyBvZiB0aGUgdW5kZXJseWluZyBjb21wb25lbnQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBXaXRoUHJvcGVydGllczxQPiA9IHtcbiAgW3Byb3BlcnR5IGluIGtleW9mIFBdOiBQW3Byb3BlcnR5XVxufTtcblxuLyoqXG4gKiBBIGNvbmZpZ3VyYXRpb24gdGhhdCBpbml0aWFsaXplcyBhbiBOZ0VsZW1lbnRDb25zdHJ1Y3RvciB3aXRoIHRoZVxuICogZGVwZW5kZW5jaWVzIGFuZCBzdHJhdGVneSBpdCBuZWVkcyB0byB0cmFuc2Zvcm0gYSBjb21wb25lbnQgaW50b1xuICogYSBjdXN0b20gZWxlbWVudCBjbGFzcy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdFbGVtZW50Q29uZmlnIHtcbiAgLyoqXG4gICAqIFRoZSBpbmplY3RvciB0byB1c2UgZm9yIHJldHJpZXZpbmcgdGhlIGNvbXBvbmVudCdzIGZhY3RvcnkuXG4gICAqL1xuICBpbmplY3RvcjogSW5qZWN0b3I7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBjdXN0b20gc3RyYXRlZ3kgZmFjdG9yeSB0byB1c2UgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdC5cbiAgICogVGhlIHN0cmF0ZWd5IGNvbnRyb2xzIGhvdyB0aGUgdHJhbnNmb3JtYXRpb24gaXMgcGVyZm9ybWVkLlxuICAgKi9cbiAgc3RyYXRlZ3lGYWN0b3J5PzogTmdFbGVtZW50U3RyYXRlZ3lGYWN0b3J5O1xufVxuXG4vKipcbiAqICBAZGVzY3JpcHRpb24gQ3JlYXRlcyBhIGN1c3RvbSBlbGVtZW50IGNsYXNzIGJhc2VkIG9uIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqIEJ1aWxkcyBhIGNsYXNzIHRoYXQgZW5jYXBzdWxhdGVzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSBwcm92aWRlZCBjb21wb25lbnQgYW5kXG4gKiB1c2VzIHRoZSBjb25maWd1cmF0aW9uIGluZm9ybWF0aW9uIHRvIHByb3ZpZGUgbW9yZSBjb250ZXh0IHRvIHRoZSBjbGFzcy5cbiAqIFRha2VzIHRoZSBjb21wb25lbnQgZmFjdG9yeSdzIGlucHV0cyBhbmQgb3V0cHV0cyB0byBjb252ZXJ0IHRoZW0gdG8gdGhlIHByb3BlclxuICogY3VzdG9tIGVsZW1lbnQgQVBJIGFuZCBhZGQgaG9va3MgdG8gaW5wdXQgY2hhbmdlcy5cbiAqXG4gKiBUaGUgY29uZmlndXJhdGlvbidzIGluamVjdG9yIGlzIHRoZSBpbml0aWFsIGluamVjdG9yIHNldCBvbiB0aGUgY2xhc3MsXG4gKiBhbmQgdXNlZCBieSBkZWZhdWx0IGZvciBlYWNoIGNyZWF0ZWQgaW5zdGFuY2UuVGhpcyBiZWhhdmlvciBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIHRoZVxuICogc3RhdGljIHByb3BlcnR5IHRvIGFmZmVjdCBhbGwgbmV3bHkgY3JlYXRlZCBpbnN0YW5jZXMsIG9yIGFzIGEgY29uc3RydWN0b3IgYXJndW1lbnQgZm9yXG4gKiBvbmUtb2ZmIGNyZWF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29tcG9uZW50IFRoZSBjb21wb25lbnQgdG8gdHJhbnNmb3JtLlxuICogQHBhcmFtIGNvbmZpZyBBIGNvbmZpZ3VyYXRpb24gdGhhdCBwcm92aWRlcyBpbml0aWFsaXphdGlvbiBpbmZvcm1hdGlvbiB0byB0aGUgY3JlYXRlZCBjbGFzcy5cbiAqIEByZXR1cm5zIFRoZSBjdXN0b20tZWxlbWVudCBjb25zdHJ1Y3Rpb24gY2xhc3MsIHdoaWNoIGNhbiBiZSByZWdpc3RlcmVkIHdpdGhcbiAqIGEgYnJvd3NlcidzIGBDdXN0b21FbGVtZW50UmVnaXN0cnlgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUVsZW1lbnQ8UD4oXG4gICAgY29tcG9uZW50OiBUeXBlPGFueT4sIGNvbmZpZzogTmdFbGVtZW50Q29uZmlnKTogTmdFbGVtZW50Q29uc3RydWN0b3I8UD4ge1xuICBjb25zdCBpbnB1dHMgPSBnZXRDb21wb25lbnRJbnB1dHMoY29tcG9uZW50LCBjb25maWcuaW5qZWN0b3IpO1xuXG4gIGNvbnN0IHN0cmF0ZWd5RmFjdG9yeSA9XG4gICAgICBjb25maWcuc3RyYXRlZ3lGYWN0b3J5IHx8IG5ldyBDb21wb25lbnROZ0VsZW1lbnRTdHJhdGVneUZhY3RvcnkoY29tcG9uZW50LCBjb25maWcuaW5qZWN0b3IpO1xuXG4gIGNvbnN0IGF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHMgPSBnZXREZWZhdWx0QXR0cmlidXRlVG9Qcm9wZXJ0eUlucHV0cyhpbnB1dHMpO1xuXG4gIGNsYXNzIE5nRWxlbWVudEltcGwgZXh0ZW5kcyBOZ0VsZW1lbnQge1xuICAgIC8vIFdvcmsgYXJvdW5kIGEgYnVnIGluIGNsb3N1cmUgdHlwZWQgb3B0aW1pemF0aW9ucyhiLzc5NTU3NDg3KSB3aGVyZSBpdCBpcyBub3QgaG9ub3Jpbmcgc3RhdGljXG4gICAgLy8gZmllbGQgZXh0ZXJucy4gU28gdXNpbmcgcXVvdGVkIGFjY2VzcyB0byBleHBsaWNpdGx5IHByZXZlbnQgcmVuYW1pbmcuXG4gICAgc3RhdGljIHJlYWRvbmx5WydvYnNlcnZlZEF0dHJpYnV0ZXMnXSA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHMpO1xuXG4gICAgcHJvdGVjdGVkIGdldCBuZ0VsZW1lbnRTdHJhdGVneSgpOiBOZ0VsZW1lbnRTdHJhdGVneSB7XG4gICAgICAvLyBOT1RFOlxuICAgICAgLy8gU29tZSBwb2x5ZmlsbHMgKGUuZy4gYGRvY3VtZW50LXJlZ2lzdGVyLWVsZW1lbnRgKSBkbyBub3QgY2FsbCB0aGUgY29uc3RydWN0b3IsIHRoZXJlZm9yZVxuICAgICAgLy8gaXQgaXMgbm90IHNhZmUgdG8gc2V0IGBuZ0VsZW1lbnRTdHJhdGVneWAgaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCBhc3N1bWUgaXQgd2lsbCBiZVxuICAgICAgLy8gYXZhaWxhYmxlIGluc2lkZSB0aGUgbWV0aG9kcy5cbiAgICAgIC8vXG4gICAgICAvLyBUT0RPKGFuZHJld3NlZ3Vpbik6IEFkZCBlMmUgdGVzdHMgdGhhdCBjb3ZlciBjYXNlcyB3aGVyZSB0aGUgY29uc3RydWN0b3IgaXNuJ3QgY2FsbGVkLiBGb3JcbiAgICAgIC8vIG5vdyB0aGlzIGlzIHRlc3RlZCB1c2luZyBhIEdvb2dsZSBpbnRlcm5hbCB0ZXN0IHN1aXRlLlxuICAgICAgaWYgKCF0aGlzLl9uZ0VsZW1lbnRTdHJhdGVneSkge1xuICAgICAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuX25nRWxlbWVudFN0cmF0ZWd5ID1cbiAgICAgICAgICAgIHN0cmF0ZWd5RmFjdG9yeS5jcmVhdGUodGhpcy5pbmplY3RvciB8fCBjb25maWcuaW5qZWN0b3IpO1xuXG4gICAgICAgIC8vIENvbGxlY3QgcHJlLWV4aXN0aW5nIHZhbHVlcyBvbiB0aGUgZWxlbWVudCB0byByZS1hcHBseSB0aHJvdWdoIHRoZSBzdHJhdGVneS5cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdWYWx1ZXMgPVxuICAgICAgICAgICAgaW5wdXRzLmZpbHRlcigoe3Byb3BOYW1lfSkgPT4gdGhpcy5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpLm1hcCgoe3Byb3BOYW1lfSk6IFtcbiAgICAgICAgICAgICAgc3RyaW5nLCBhbnlcbiAgICAgICAgICAgIF0gPT4gW3Byb3BOYW1lLCAodGhpcyBhcyBhbnkpW3Byb3BOYW1lXV0pO1xuXG4gICAgICAgIC8vIEluIHNvbWUgYnJvd3NlcnMgKGUuZy4gSUUxMCksIGBPYmplY3Quc2V0UHJvdG90eXBlT2YoKWAgKHdoaWNoIGlzIHJlcXVpcmVkIGJ5IHNvbWUgQ3VzdG9tXG4gICAgICAgIC8vIEVsZW1lbnRzIHBvbHlmaWxscykgaXMgbm90IGRlZmluZWQgYW5kIGlzIHRodXMgcG9seWZpbGxlZCBpbiBhIHdheSB0aGF0IGRvZXMgbm90IHByZXNlcnZlXG4gICAgICAgIC8vIHRoZSBwcm90b3R5cGUgY2hhaW4uIEluIHN1Y2ggY2FzZXMsIGB0aGlzYCB3aWxsIG5vdCBiZSBhbiBpbnN0YW5jZSBvZiBgTmdFbGVtZW50SW1wbGAgYW5kXG4gICAgICAgIC8vIHRodXMgbm90IGhhdmUgdGhlIGNvbXBvbmVudCBpbnB1dCBnZXR0ZXJzL3NldHRlcnMgZGVmaW5lZCBvbiBgTmdFbGVtZW50SW1wbC5wcm90b3R5cGVgLlxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTmdFbGVtZW50SW1wbCkpIHtcbiAgICAgICAgICAvLyBBZGQgZ2V0dGVycyBhbmQgc2V0dGVycyB0byB0aGUgaW5zdGFuY2UgaXRzZWxmIGZvciBlYWNoIHByb3BlcnR5IGlucHV0LlxuICAgICAgICAgIGRlZmluZUlucHV0R2V0dGVyc1NldHRlcnMoaW5wdXRzLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBEZWxldGUgdGhlIHByb3BlcnR5IGZyb20gdGhlIGluc3RhbmNlLCBzbyB0aGF0IGl0IGNhbiBnbyB0aHJvdWdoIHRoZSBnZXR0ZXJzL3NldHRlcnNcbiAgICAgICAgICAvLyBzZXQgb24gYE5nRWxlbWVudEltcGwucHJvdG90eXBlYC5cbiAgICAgICAgICBwcmVFeGlzdGluZ1ZhbHVlcy5mb3JFYWNoKChbcHJvcE5hbWVdKSA9PiBkZWxldGUgKHRoaXMgYXMgYW55KVtwcm9wTmFtZV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmUtYXBwbHkgcHJlLWV4aXN0aW5nIHZhbHVlcyB0aHJvdWdoIHRoZSBzdHJhdGVneS5cbiAgICAgICAgcHJlRXhpc3RpbmdWYWx1ZXMuZm9yRWFjaCgoW3Byb3BOYW1lLCB2YWx1ZV0pID0+IHN0cmF0ZWd5LnNldElucHV0VmFsdWUocHJvcE5hbWUsIHZhbHVlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9uZ0VsZW1lbnRTdHJhdGVneSE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbmdFbGVtZW50U3RyYXRlZ3k/OiBOZ0VsZW1lbnRTdHJhdGVneTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgaW5qZWN0b3I/OiBJbmplY3Rvcikge1xuICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soXG4gICAgICAgIGF0dHJOYW1lOiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmd8bnVsbCwgbmV3VmFsdWU6IHN0cmluZywgbmFtZXNwYWNlPzogc3RyaW5nKTogdm9pZCB7XG4gICAgICBjb25zdCBwcm9wTmFtZSA9IGF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHNbYXR0ck5hbWVdITtcbiAgICAgIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kuc2V0SW5wdXRWYWx1ZShwcm9wTmFtZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgICAgdGhpcy5uZ0VsZW1lbnRTdHJhdGVneS5jb25uZWN0KHRoaXMpO1xuXG4gICAgICAvLyBMaXN0ZW4gZm9yIGV2ZW50cyBmcm9tIHRoZSBzdHJhdGVneSBhbmQgZGlzcGF0Y2ggdGhlbSBhcyBjdXN0b20gZXZlbnRzXG4gICAgICB0aGlzLm5nRWxlbWVudEV2ZW50c1N1YnNjcmlwdGlvbiA9IHRoaXMubmdFbGVtZW50U3RyYXRlZ3kuZXZlbnRzLnN1YnNjcmliZShlID0+IHtcbiAgICAgICAgY29uc3QgY3VzdG9tRXZlbnQgPSBjcmVhdGVDdXN0b21FdmVudCh0aGlzLm93bmVyRG9jdW1lbnQhLCBlLm5hbWUsIGUudmFsdWUpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3VzdG9tRXZlbnQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgICAvLyBOb3QgdXNpbmcgYHRoaXMubmdFbGVtZW50U3RyYXRlZ3lgIHRvIGF2b2lkIHVubmVjZXNzYXJpbHkgY3JlYXRpbmcgdGhlIGBOZ0VsZW1lbnRTdHJhdGVneWAuXG4gICAgICBpZiAodGhpcy5fbmdFbGVtZW50U3RyYXRlZ3kpIHtcbiAgICAgICAgdGhpcy5fbmdFbGVtZW50U3RyYXRlZ3kuZGlzY29ubmVjdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5uZ0VsZW1lbnRFdmVudHNTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5uZ0VsZW1lbnRFdmVudHNTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgdGhpcy5uZ0VsZW1lbnRFdmVudHNTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFR5cGVTY3JpcHQgMy45KyBkZWZpbmVzIGdldHRlcnMvc2V0dGVycyBhcyBjb25maWd1cmFibGUgYnV0IG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMgKGluXG4gIC8vIGNvbXBsaWFuY2Ugd2l0aCB0aGUgc3BlYykuIFRoaXMgYnJlYWtzIGVtdWxhdGVkIGluaGVyaXRhbmNlIGluIEVTNSBvbiBlbnZpcm9ubWVudHMgdGhhdCBkbyBub3RcbiAgLy8gbmF0aXZlbHkgc3VwcG9ydCBgT2JqZWN0LnNldFByb3RvdHlwZU9mKClgIChzdWNoIGFzIElFIDktMTApLlxuICAvLyBVcGRhdGUgdGhlIHByb3BlcnR5IGRlc2NyaXB0b3Igb2YgYE5nRWxlbWVudEltcGwjbmdFbGVtZW50U3RyYXRlZ3lgIHRvIG1ha2UgaXQgZW51bWVyYWJsZS5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5nRWxlbWVudEltcGwucHJvdG90eXBlLCAnbmdFbGVtZW50U3RyYXRlZ3knLCB7ZW51bWVyYWJsZTogdHJ1ZX0pO1xuXG4gIC8vIEFkZCBnZXR0ZXJzIGFuZCBzZXR0ZXJzIHRvIHRoZSBwcm90b3R5cGUgZm9yIGVhY2ggcHJvcGVydHkgaW5wdXQuXG4gIGRlZmluZUlucHV0R2V0dGVyc1NldHRlcnMoaW5wdXRzLCBOZ0VsZW1lbnRJbXBsLnByb3RvdHlwZSk7XG5cbiAgcmV0dXJuIChOZ0VsZW1lbnRJbXBsIGFzIGFueSkgYXMgTmdFbGVtZW50Q29uc3RydWN0b3I8UD47XG59XG5cbi8vIEhlbHBlcnNcbmZ1bmN0aW9uIGRlZmluZUlucHV0R2V0dGVyc1NldHRlcnMoXG4gICAgaW5wdXRzOiB7cHJvcE5hbWU6IHN0cmluZywgdGVtcGxhdGVOYW1lOiBzdHJpbmd9W10sIHRhcmdldDogb2JqZWN0KTogdm9pZCB7XG4gIC8vIEFkZCBnZXR0ZXJzIGFuZCBzZXR0ZXJzIGZvciBlYWNoIHByb3BlcnR5IGlucHV0LlxuICBpbnB1dHMuZm9yRWFjaCgoe3Byb3BOYW1lfSkgPT4ge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BOYW1lLCB7XG4gICAgICBnZXQoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kuZ2V0SW5wdXRWYWx1ZShwcm9wTmFtZSk7XG4gICAgICB9LFxuICAgICAgc2V0KG5ld1ZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5uZ0VsZW1lbnRTdHJhdGVneS5zZXRJbnB1dFZhbHVlKHByb3BOYW1lLCBuZXdWYWx1ZSk7XG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=