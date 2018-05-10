/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ComponentNgElementStrategyFactory } from './component-factory-strategy';
import { createCustomEvent, getComponentInputs, getDefaultAttributeToPropertyInputs } from './utils';
/**
 * Implements the functionality needed for a custom element.
 *
 * @experimental
 */
var /**
 * Implements the functionality needed for a custom element.
 *
 * @experimental
 */
NgElement = /** @class */ (function (_super) {
    tslib_1.__extends(NgElement, _super);
    function NgElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
           * A subscription to change, connect, and disconnect events in the custom element.
           */
        _this.ngElementEventsSubscription = null;
        return _this;
    }
    return NgElement;
}(HTMLElement));
/**
 * Implements the functionality needed for a custom element.
 *
 * @experimental
 */
export { NgElement };
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
 * @experimental
 */
export function createCustomElement(component, config) {
    var inputs = getComponentInputs(component, config.injector);
    var strategyFactory = config.strategyFactory || new ComponentNgElementStrategyFactory(component, config.injector);
    var attributeToPropertyInputs = getDefaultAttributeToPropertyInputs(inputs);
    var NgElementImpl = /** @class */ (function (_super) {
        tslib_1.__extends(NgElementImpl, _super);
        function NgElementImpl(injector) {
            var _this = _super.call(this) || this;
            // Note that some polyfills (e.g. document-register-element) do not call the constructor.
            // Do not assume this strategy has been created.
            // TODO(andrewseguin): Add e2e tests that cover cases where the constructor isn't called. For
            // now this is tested using a Google internal test suite.
            // Note that some polyfills (e.g. document-register-element) do not call the constructor.
            // Do not assume this strategy has been created.
            // TODO(andrewseguin): Add e2e tests that cover cases where the constructor isn't called. For
            // now this is tested using a Google internal test suite.
            _this.ngElementStrategy = strategyFactory.create(injector || config.injector);
            return _this;
        }
        NgElementImpl.prototype.attributeChangedCallback = function (attrName, oldValue, newValue, namespace) {
            if (!this.ngElementStrategy) {
                this.ngElementStrategy = strategyFactory.create(config.injector);
            }
            var propName = (attributeToPropertyInputs[attrName]);
            this.ngElementStrategy.setInputValue(propName, newValue);
        };
        NgElementImpl.prototype.connectedCallback = function () {
            var _this = this;
            if (!this.ngElementStrategy) {
                this.ngElementStrategy = strategyFactory.create(config.injector);
            }
            this.ngElementStrategy.connect(this);
            // Listen for events from the strategy and dispatch them as custom events
            this.ngElementEventsSubscription = this.ngElementStrategy.events.subscribe(function (e) {
                var customEvent = createCustomEvent(_this.ownerDocument, e.name, e.value);
                _this.dispatchEvent(customEvent);
            });
        };
        NgElementImpl.prototype.disconnectedCallback = function () {
            if (this.ngElementStrategy) {
                this.ngElementStrategy.disconnect();
            }
            if (this.ngElementEventsSubscription) {
                this.ngElementEventsSubscription.unsubscribe();
                this.ngElementEventsSubscription = null;
            }
        };
        NgElementImpl.observedAttributes = Object.keys(attributeToPropertyInputs);
        return NgElementImpl;
    }(NgElement));
    // Add getters and setters to the prototype for each property input. If the config does not
    // contain property inputs, use all inputs by default.
    inputs.map(function (_a) {
        var propName = _a.propName;
        return propName;
    }).forEach(function (property) {
        Object.defineProperty(NgElementImpl.prototype, property, {
            get: function () { return this.ngElementStrategy.getInputValue(property); },
            set: function (newValue) { this.ngElementStrategy.setInputValue(property, newValue); },
            configurable: true,
            enumerable: true,
        });
    });
    return NgElementImpl;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWN1c3RvbS1lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvZWxlbWVudHMvc3JjL2NyZWF0ZS1jdXN0b20tZWxlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQVdBLE9BQU8sRUFBQyxpQ0FBaUMsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBRS9FLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxtQ0FBbUMsRUFBQyxNQUFNLFNBQVMsQ0FBQzs7Ozs7O0FBNEJuRzs7Ozs7QUFBQTtJQUF3QyxxQ0FBVzs7Ozs7OzRDQVFVLElBQUk7OztvQkFqRGpFO0VBeUN3QyxXQUFXLEVBOEJsRCxDQUFBOzs7Ozs7QUE5QkQscUJBOEJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvREQsTUFBTSw4QkFDRixTQUFvQixFQUFFLE1BQXVCO0lBQy9DLElBQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFOUQsSUFBTSxlQUFlLEdBQ2pCLE1BQU0sQ0FBQyxlQUFlLElBQUksSUFBSSxpQ0FBaUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWhHLElBQU0seUJBQXlCLEdBQUcsbUNBQW1DLENBQUMsTUFBTSxDQUFDLENBQUM7O1FBRWxELHlDQUFTO1FBR25DLHVCQUFZLFFBQW1CO1lBQS9CLFlBQ0UsaUJBQU8sU0FPUjs7Ozs7WUFEQyxBQUpBLHlGQUF5RjtZQUN6RixnREFBZ0Q7WUFDaEQsNkZBQTZGO1lBQzdGLHlEQUF5RDtZQUN6RCxLQUFJLENBQUMsaUJBQWlCLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztTQUM5RTtRQUVELGdEQUF3QixHQUF4QixVQUNJLFFBQWdCLEVBQUUsUUFBcUIsRUFBRSxRQUFnQixFQUFFLFNBQWtCO1lBQy9FLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2xFO1lBRUQsSUFBTSxRQUFRLEdBQUcsQ0FBQSx5QkFBeUIsQ0FBQyxRQUFRLENBQUcsQ0FBQSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzFEO1FBRUQseUNBQWlCLEdBQWpCO1lBQUEsaUJBWUM7WUFYQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNsRTtZQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O1lBR3JDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFBLENBQUM7Z0JBQzFFLElBQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNFLEtBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDakMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCw0Q0FBb0IsR0FBcEI7WUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDckM7WUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQy9DLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7YUFDekM7U0FDRjsyQ0E3Q29DLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUM7NEJBckkvRTtNQW9JOEIsU0FBUzs7O0lBbURyQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsRUFBVTtZQUFULHNCQUFRO1FBQU0sT0FBQSxRQUFRO0lBQVIsQ0FBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUTtRQUNuRCxNQUFNLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFO1lBQ3ZELEdBQUcsRUFBRSxjQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7WUFDMUUsR0FBRyxFQUFFLFVBQVMsUUFBYSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7WUFDMUYsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFFLGFBQWdELENBQUM7Q0FDMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0NvbXBvbmVudE5nRWxlbWVudFN0cmF0ZWd5RmFjdG9yeX0gZnJvbSAnLi9jb21wb25lbnQtZmFjdG9yeS1zdHJhdGVneSc7XG5pbXBvcnQge05nRWxlbWVudFN0cmF0ZWd5LCBOZ0VsZW1lbnRTdHJhdGVneUZhY3Rvcnl9IGZyb20gJy4vZWxlbWVudC1zdHJhdGVneSc7XG5pbXBvcnQge2NyZWF0ZUN1c3RvbUV2ZW50LCBnZXRDb21wb25lbnRJbnB1dHMsIGdldERlZmF1bHRBdHRyaWJ1dGVUb1Byb3BlcnR5SW5wdXRzfSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBQcm90b3R5cGUgZm9yIGEgY2xhc3MgY29uc3RydWN0b3IgYmFzZWQgb24gYW4gQW5ndWxhciBjb21wb25lbnRcbiAqIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGN1c3RvbSBlbGVtZW50IHJlZ2lzdHJhdGlvbi4gSW1wbGVtZW50ZWQgYW5kIHJldHVybmVkXG4gKiBieSB0aGUge0BsaW5rIGNyZWF0ZUN1c3RvbUVsZW1lbnQgY3JlYXRlQ3VzdG9tRWxlbWVudCgpIGZ1bmN0aW9ufS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdFbGVtZW50Q29uc3RydWN0b3I8UD4ge1xuICAvKipcbiAgICogQW4gYXJyYXkgb2Ygb2JzZXJ2ZWQgYXR0cmlidXRlIG5hbWVzIGZvciB0aGUgY3VzdG9tIGVsZW1lbnQsXG4gICAqIGRlcml2ZWQgYnkgdHJhbnNmb3JtaW5nIGlucHV0IHByb3BlcnR5IG5hbWVzIGZyb20gdGhlIHNvdXJjZSBjb21wb25lbnQuXG4gICAqL1xuICByZWFkb25seSBvYnNlcnZlZEF0dHJpYnV0ZXM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBhIGNvbnN0cnVjdG9yIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gaW5qZWN0b3IgVGhlIHNvdXJjZSBjb21wb25lbnQncyBpbmplY3Rvci5cbiAgICovXG4gIG5ldyAoaW5qZWN0b3I6IEluamVjdG9yKTogTmdFbGVtZW50JldpdGhQcm9wZXJ0aWVzPFA+O1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgdGhlIGZ1bmN0aW9uYWxpdHkgbmVlZGVkIGZvciBhIGN1c3RvbSBlbGVtZW50LlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgLyoqXG4gICAqIFRoZSBzdHJhdGVneSB0aGF0IGNvbnRyb2xzIGhvdyBhIGNvbXBvbmVudCBpcyB0cmFuc2Zvcm1lZCBpbiBhIGN1c3RvbSBlbGVtZW50LlxuICAgKi9cbiAgcHJvdGVjdGVkIG5nRWxlbWVudFN0cmF0ZWd5OiBOZ0VsZW1lbnRTdHJhdGVneTtcbiAgLyoqXG4gICAqIEEgc3Vic2NyaXB0aW9uIHRvIGNoYW5nZSwgY29ubmVjdCwgYW5kIGRpc2Nvbm5lY3QgZXZlbnRzIGluIHRoZSBjdXN0b20gZWxlbWVudC5cbiAgICovXG4gIHByb3RlY3RlZCBuZ0VsZW1lbnRFdmVudHNTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICAqIFByb3RvdHlwZSBmb3IgYSBoYW5kbGVyIHRoYXQgcmVzcG9uZHMgdG8gYSBjaGFuZ2UgaW4gYW4gb2JzZXJ2ZWQgYXR0cmlidXRlLlxuICAgICogQHBhcmFtIGF0dHJOYW1lIFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgdGhhdCBoYXMgY2hhbmdlZC5cbiAgICAqIEBwYXJhbSBvbGRWYWx1ZSBUaGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZS5cbiAgICAqIEBwYXJhbSBuZXdWYWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGUuXG4gICAgKiBAcGFyYW0gbmFtZXNwYWNlIFRoZSBuYW1lc3BhY2UgaW4gd2hpY2ggdGhlIGF0dHJpYnV0ZSBpcyBkZWZpbmVkLlxuICAgICogQHJldHVybnMgTm90aGluZy5cbiAgICAqL1xuICBhYnN0cmFjdCBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soXG4gICAgICBhdHRyTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nfG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQ7XG4gIC8qKlxuICAgKiBQcm90b3R5cGUgZm9yIGEgaGFuZGxlciB0aGF0IHJlc3BvbmRzIHRvIHRoZSBpbnNlcnRpb24gb2YgdGhlIGN1c3RvbSBlbGVtZW50IGluIHRoZSBET00uXG4gICAqIEByZXR1cm5zIE5vdGhpbmcuXG4gICAqL1xuICBhYnN0cmFjdCBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkO1xuICAvKipcbiAgICogUHJvdG90eXBlIGZvciBhIGhhbmRsZXIgdGhhdCByZXNwb25kcyB0byB0aGUgZGVsZXRpb24gb2YgdGhlIGN1c3RvbSBlbGVtZW50IGZyb20gdGhlIERPTS5cbiAgICogQHJldHVybnMgTm90aGluZy5cbiAgICovXG4gIGFic3RyYWN0IGRpc2Nvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogQWRkaXRpb25hbCB0eXBlIGluZm9ybWF0aW9uIHRoYXQgY2FuIGJlIGFkZGVkIHRvIHRoZSBOZ0VsZW1lbnQgY2xhc3MsXG4gKiBmb3IgcHJvcGVydGllcyB0aGF0IGFyZSBhZGRlZCBiYXNlZFxuICogb24gdGhlIGlucHV0cyBhbmQgbWV0aG9kcyBvZiB0aGUgdW5kZXJseWluZyBjb21wb25lbnQuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdHlwZSBXaXRoUHJvcGVydGllczxQPiA9IHtcbiAgW3Byb3BlcnR5IGluIGtleW9mIFBdOiBQW3Byb3BlcnR5XVxufTtcblxuLyoqXG4gKiBBIGNvbmZpZ3VyYXRpb24gdGhhdCBpbml0aWFsaXplcyBhbiBOZ0VsZW1lbnRDb25zdHJ1Y3RvciB3aXRoIHRoZVxuICogZGVwZW5kZW5jaWVzIGFuZCBzdHJhdGVneSBpdCBuZWVkcyB0byB0cmFuc2Zvcm0gYSBjb21wb25lbnQgaW50b1xuICogYSBjdXN0b20gZWxlbWVudCBjbGFzcy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdFbGVtZW50Q29uZmlnIHtcbiAgLyoqXG4gICAqIFRoZSBpbmplY3RvciB0byB1c2UgZm9yIHJldHJpZXZpbmcgdGhlIGNvbXBvbmVudCdzIGZhY3RvcnkuXG4gICAqL1xuICBpbmplY3RvcjogSW5qZWN0b3I7XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBjdXN0b20gc3RyYXRlZ3kgZmFjdG9yeSB0byB1c2UgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdC5cbiAgICogVGhlIHN0cmF0ZWd5IGNvbnRyb2xzIGhvdyB0aGUgdHJhbmZvcm1hdGlvbiBpcyBwZXJmb3JtZWQuXG4gICAqL1xuICBzdHJhdGVneUZhY3Rvcnk/OiBOZ0VsZW1lbnRTdHJhdGVneUZhY3Rvcnk7XG59XG5cbi8qKlxuICogIEBkZXNjcmlwdGlvbiBDcmVhdGVzIGEgY3VzdG9tIGVsZW1lbnQgY2xhc3MgYmFzZWQgb24gYW4gQW5ndWxhciBjb21wb25lbnQuXG4gKlxuICogQnVpbGRzIGEgY2xhc3MgdGhhdCBlbmNhcHN1bGF0ZXMgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgdGhlIHByb3ZpZGVkIGNvbXBvbmVudCBhbmRcbiAqIHVzZXMgdGhlIGNvbmZpZ3VyYXRpb24gaW5mb3JtYXRpb24gdG8gcHJvdmlkZSBtb3JlIGNvbnRleHQgdG8gdGhlIGNsYXNzLlxuICogVGFrZXMgdGhlIGNvbXBvbmVudCBmYWN0b3J5J3MgaW5wdXRzIGFuZCBvdXRwdXRzIHRvIGNvbnZlcnQgdGhlbSB0byB0aGUgcHJvcGVyXG4gKiBjdXN0b20gZWxlbWVudCBBUEkgYW5kIGFkZCBob29rcyB0byBpbnB1dCBjaGFuZ2VzLlxuICpcbiAqIFRoZSBjb25maWd1cmF0aW9uJ3MgaW5qZWN0b3IgaXMgdGhlIGluaXRpYWwgaW5qZWN0b3Igc2V0IG9uIHRoZSBjbGFzcyxcbiAqIGFuZCB1c2VkIGJ5IGRlZmF1bHQgZm9yIGVhY2ggY3JlYXRlZCBpbnN0YW5jZS5UaGlzIGJlaGF2aW9yIGNhbiBiZSBvdmVycmlkZGVuIHdpdGggdGhlXG4gKiBzdGF0aWMgcHJvcGVydHkgdG8gYWZmZWN0IGFsbCBuZXdseSBjcmVhdGVkIGluc3RhbmNlcywgb3IgYXMgYSBjb25zdHJ1Y3RvciBhcmd1bWVudCBmb3JcbiAqIG9uZS1vZmYgY3JlYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb21wb25lbnQgVGhlIGNvbXBvbmVudCB0byB0cmFuc2Zvcm0uXG4gKiBAcGFyYW0gY29uZmlnIEEgY29uZmlndXJhdGlvbiB0aGF0IHByb3ZpZGVzIGluaXRpYWxpemF0aW9uIGluZm9ybWF0aW9uIHRvIHRoZSBjcmVhdGVkIGNsYXNzLlxuICogQHJldHVybnMgVGhlIGN1c3RvbS1lbGVtZW50IGNvbnN0cnVjdGlvbiBjbGFzcywgd2hpY2ggY2FuIGJlIHJlZ2lzdGVyZWQgd2l0aFxuICogYSBicm93c2VyJ3MgYEN1c3RvbUVsZW1lbnRSZWdpc3RyeWAuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VzdG9tRWxlbWVudDxQPihcbiAgICBjb21wb25lbnQ6IFR5cGU8YW55PiwgY29uZmlnOiBOZ0VsZW1lbnRDb25maWcpOiBOZ0VsZW1lbnRDb25zdHJ1Y3RvcjxQPiB7XG4gIGNvbnN0IGlucHV0cyA9IGdldENvbXBvbmVudElucHV0cyhjb21wb25lbnQsIGNvbmZpZy5pbmplY3Rvcik7XG5cbiAgY29uc3Qgc3RyYXRlZ3lGYWN0b3J5ID1cbiAgICAgIGNvbmZpZy5zdHJhdGVneUZhY3RvcnkgfHwgbmV3IENvbXBvbmVudE5nRWxlbWVudFN0cmF0ZWd5RmFjdG9yeShjb21wb25lbnQsIGNvbmZpZy5pbmplY3Rvcik7XG5cbiAgY29uc3QgYXR0cmlidXRlVG9Qcm9wZXJ0eUlucHV0cyA9IGdldERlZmF1bHRBdHRyaWJ1dGVUb1Byb3BlcnR5SW5wdXRzKGlucHV0cyk7XG5cbiAgY2xhc3MgTmdFbGVtZW50SW1wbCBleHRlbmRzIE5nRWxlbWVudCB7XG4gICAgc3RhdGljIHJlYWRvbmx5IG9ic2VydmVkQXR0cmlidXRlcyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZVRvUHJvcGVydHlJbnB1dHMpO1xuXG4gICAgY29uc3RydWN0b3IoaW5qZWN0b3I/OiBJbmplY3Rvcikge1xuICAgICAgc3VwZXIoKTtcblxuICAgICAgLy8gTm90ZSB0aGF0IHNvbWUgcG9seWZpbGxzIChlLmcuIGRvY3VtZW50LXJlZ2lzdGVyLWVsZW1lbnQpIGRvIG5vdCBjYWxsIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgIC8vIERvIG5vdCBhc3N1bWUgdGhpcyBzdHJhdGVneSBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgLy8gVE9ETyhhbmRyZXdzZWd1aW4pOiBBZGQgZTJlIHRlc3RzIHRoYXQgY292ZXIgY2FzZXMgd2hlcmUgdGhlIGNvbnN0cnVjdG9yIGlzbid0IGNhbGxlZC4gRm9yXG4gICAgICAvLyBub3cgdGhpcyBpcyB0ZXN0ZWQgdXNpbmcgYSBHb29nbGUgaW50ZXJuYWwgdGVzdCBzdWl0ZS5cbiAgICAgIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kgPSBzdHJhdGVneUZhY3RvcnkuY3JlYXRlKGluamVjdG9yIHx8IGNvbmZpZy5pbmplY3Rvcik7XG4gICAgfVxuXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKFxuICAgICAgICBhdHRyTmFtZTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nfG51bGwsIG5ld1ZhbHVlOiBzdHJpbmcsIG5hbWVzcGFjZT86IHN0cmluZyk6IHZvaWQge1xuICAgICAgaWYgKCF0aGlzLm5nRWxlbWVudFN0cmF0ZWd5KSB7XG4gICAgICAgIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kgPSBzdHJhdGVneUZhY3RvcnkuY3JlYXRlKGNvbmZpZy5pbmplY3Rvcik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb3BOYW1lID0gYXR0cmlidXRlVG9Qcm9wZXJ0eUlucHV0c1thdHRyTmFtZV0gITtcbiAgICAgIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kuc2V0SW5wdXRWYWx1ZShwcm9wTmFtZSwgbmV3VmFsdWUpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgICAgaWYgKCF0aGlzLm5nRWxlbWVudFN0cmF0ZWd5KSB7XG4gICAgICAgIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kgPSBzdHJhdGVneUZhY3RvcnkuY3JlYXRlKGNvbmZpZy5pbmplY3Rvcik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kuY29ubmVjdCh0aGlzKTtcblxuICAgICAgLy8gTGlzdGVuIGZvciBldmVudHMgZnJvbSB0aGUgc3RyYXRlZ3kgYW5kIGRpc3BhdGNoIHRoZW0gYXMgY3VzdG9tIGV2ZW50c1xuICAgICAgdGhpcy5uZ0VsZW1lbnRFdmVudHNTdWJzY3JpcHRpb24gPSB0aGlzLm5nRWxlbWVudFN0cmF0ZWd5LmV2ZW50cy5zdWJzY3JpYmUoZSA9PiB7XG4gICAgICAgIGNvbnN0IGN1c3RvbUV2ZW50ID0gY3JlYXRlQ3VzdG9tRXZlbnQodGhpcy5vd25lckRvY3VtZW50LCBlLm5hbWUsIGUudmFsdWUpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoY3VzdG9tRXZlbnQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgICBpZiAodGhpcy5uZ0VsZW1lbnRTdHJhdGVneSkge1xuICAgICAgICB0aGlzLm5nRWxlbWVudFN0cmF0ZWd5LmRpc2Nvbm5lY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRoaXMubmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIHRoaXMubmdFbGVtZW50RXZlbnRzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBZGQgZ2V0dGVycyBhbmQgc2V0dGVycyB0byB0aGUgcHJvdG90eXBlIGZvciBlYWNoIHByb3BlcnR5IGlucHV0LiBJZiB0aGUgY29uZmlnIGRvZXMgbm90XG4gIC8vIGNvbnRhaW4gcHJvcGVydHkgaW5wdXRzLCB1c2UgYWxsIGlucHV0cyBieSBkZWZhdWx0LlxuICBpbnB1dHMubWFwKCh7cHJvcE5hbWV9KSA9PiBwcm9wTmFtZSkuZm9yRWFjaChwcm9wZXJ0eSA9PiB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5nRWxlbWVudEltcGwucHJvdG90eXBlLCBwcm9wZXJ0eSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubmdFbGVtZW50U3RyYXRlZ3kuZ2V0SW5wdXRWYWx1ZShwcm9wZXJ0eSk7IH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKG5ld1ZhbHVlOiBhbnkpIHsgdGhpcy5uZ0VsZW1lbnRTdHJhdGVneS5zZXRJbnB1dFZhbHVlKHByb3BlcnR5LCBuZXdWYWx1ZSk7IH0sXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gKE5nRWxlbWVudEltcGwgYXMgYW55KSBhcyBOZ0VsZW1lbnRDb25zdHJ1Y3RvcjxQPjtcbn0iXX0=