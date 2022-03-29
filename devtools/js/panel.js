
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.24.0 */

    const { Error: Error_1, Object: Object_1$1, console: console_1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		const newState = { ...history.state };
    		delete newState["__svelte_spa_router_scrollX"];
    		delete newState["__svelte_spa_router_scrollY"];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute("href");

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == "/") {
    		// Add # to the href attribute
    		href = "#" + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != "#/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	node.setAttribute("href", href);

    	node.addEventListener("click", event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute("href"));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == "string") {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener("popstate", popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == "object" && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener("popstate", popStateChanged);
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("popStateChanged" in $$props) popStateChanged = $$props.popStateChanged;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var _actions="";var Login="Ingresar";var Password="Contraseña";var Search="Buscar";var Username="Nombre de usuario";var es = {_actions:_actions,"Choose a file":"Escoge un archivo","Load more":"Cargar más",Login:Login,Password:Password,"Please enter your account":"Por favor ingrese su cuenta",Search:Search,Username:Username};

    const translations$1 = { es };
    function translation(language, labels = {}) {
        const func = function (textOrName, data = {}) {
            var _a;
            const text = labels[textOrName] || textOrName;
            const translation = (_a = translations$1[language]) === null || _a === void 0 ? void 0 : _a[text];
            if (translation === undefined) {
                return text;
            }
            // replace :placeholders
            return translation.replace(/:([a-zA-Z0-9_]+)/g, (match, placeholder) => {
                return data[placeholder] || match;
            });
        };
        func.setLabels = (labels = {}) => {
            return translation(language, labels);
        };
        return func;
    }

    // load from env api_base
    const env = {"dev_api_base":"http://localhost:5050/dev/","language":"es"};
    const translations = translation(env.language );

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const user = writable(storedUser);
    user.subscribe(value => {
        localStorage.setItem('user', JSON.stringify(value));
    });

    class Resource$1 {
        constructor(name, apiBase) {
            this.name = name;
            this.apiBase = apiBase;
            this.url = new URL(name, apiBase).toString();
            this.headers = {
                'Content-Type': 'application/json',
            };
            user.subscribe(session => {
                if (session && session.token) {
                    const token = session.token;
                    this.headers['Authorization'] = `Bearer ${token}`;
                }
            });
        }
        // get resource
        get(id = null, params = {}) {
            const url = new URL(id ? `${this.url}/${id}` : this.url);
            // add params to url
            Object.keys(params).forEach(key => {
                if (Array.isArray(params[key])) {
                    // if value is array, add multiple params
                    params[key].forEach(value => url.searchParams.append(key + '[]', value));
                }
                else if (params[key] !== undefined) {
                    url.searchParams.append(key, params[key]);
                }
            });
            return fetch(url.toString(), {
                method: 'GET',
                headers: this.headers,
            }).then(response => this.processResponse(response))
                .then(({ data }) => data);
        }
        // get resource as Row object
        getRow(id = null, row = {}) {
            this.get(id).then((data) => { Object.assign(row, data); row = row; }).catch(err => console.error(err));
            return row;
        }
        // get resource as Row object
        getList(row = []) {
            this.get(null).then((data) => row.splice(0, row.length, ...data)).catch(err => console.error(err));
            return row;
        }
        // post resource
        post(data) {
            const body = (data instanceof FormData) ? data : JSON.stringify(data);
            const headers = (data instanceof FormData) ? undefined : this.headers;
            return fetch(this.url, {
                method: 'POST',
                headers,
                body
            }).then(response => this.processResponse(response))
                .then(({ data }) => data);
        }
        // patch resource
        patch(id = null, data) {
            const url = id ? `${this.url}/${id}` : this.url;
            return fetch(url, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(data)
            });
        }
        // patch resource
        put(id = null, data) {
            const url = id ? `${this.url}/${id}` : this.url;
            return fetch(url, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(data)
            });
        }
        async processResponse(response) {
            if (!response.ok)
                throw await response.json();
            return response.json();
        }
    }

    const apiBase = 'http://localhost/';
    /**
     * @class Api
     *
     * @returns {Resource}
     */
    function api(url) {
        return new Resource$1(url, apiBase);
    }

    /* src/devtools/panels/Home.svelte generated by Svelte v3.24.0 */
    const file$2 = "src/devtools/panels/Home.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (1:0) <script lang="ts">import { translations as _ }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import { translations as _ }",
    		ctx
    	});

    	return block;
    }

    // (17:40)    {#each resources as resource}
    function create_then_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*resources*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*listResources*/ 1) {
    				each_value = /*resources*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(17:40)    {#each resources as resource}",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#each resources as resource}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*resource*/ ctx[4]["attributes"]["name"] + "";
    	let t0;
    	let t1;
    	let td1;
    	let a;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a = element("a");
    			t2 = text("Edit");
    			t3 = space();
    			add_location(td0, file$2, 19, 4, 493);
    			attr_dev(a, "href", "#/resource/" + /*resource*/ ctx[4]["id"]);
    			add_location(a, file$2, 21, 5, 549);
    			add_location(td1, file$2, 20, 4, 539);
    			add_location(tr, file$2, 18, 3, 484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a);
    			append_dev(a, t2);
    			append_dev(tr, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(18:2) {#each resources as resource}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">import { translations as _ }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script lang=\\\"ts\\\">import { translations as _ }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0_value = translations("Bienvenido al panel de desarrador") + "";
    	let t0;
    	let t1;
    	let table;
    	let tr;
    	let th0;
    	let t3;
    	let th1;
    	let t5;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 3
    	};

    	handle_promise(/*listResources*/ ctx[0](), info);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			table = element("table");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Resource";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Action";
    			t5 = space();
    			info.block.c();
    			add_location(th0, file$2, 13, 2, 365);
    			add_location(th1, file$2, 14, 2, 385);
    			add_location(tr, file$2, 12, 1, 358);
    			add_location(table, file$2, 11, 0, 349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t3);
    			append_dev(tr, th1);
    			append_dev(table, t5);
    			info.block.m(table, info.anchor = null);
    			info.mount = () => table;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[3] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const env = {"dev_api_base":"http://localhost:5050/dev/","language":"es"};
    	const apiBase = env.dev_api_base || "http://localhost/dev/";

    	function listResources() {
    		return api(apiBase + "resource").get();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	$$self.$capture_state = () => ({ _: translations, api, env, apiBase, listResources });
    	return [listResources];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/devtools/panels/Resource.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/devtools/panels/Resource.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[80] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[78] = list;
    	child_ctx[79] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[80] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[80] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[77] = list[i];
    	child_ctx[85] = list;
    	child_ctx[86] = i;
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[80] = list[i];
    	return child_ctx;
    }

    function get_each_context_7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[94] = list[i];
    	child_ctx[95] = list;
    	child_ctx[96] = i;
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[91] = list[i];
    	child_ctx[92] = list;
    	child_ctx[93] = i;
    	return child_ctx;
    }

    function get_each_context_8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[97] = list[i];
    	child_ctx[98] = list;
    	child_ctx[99] = i;
    	return child_ctx;
    }

    function get_each_context_9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[80] = list[i];
    	child_ctx[100] = list;
    	child_ctx[101] = i;
    	return child_ctx;
    }

    // (244:0) {#each model.fields as field}
    function create_each_block_9(ctx) {
    	let div;
    	let button;
    	let t1;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let label2;
    	let t6;
    	let input2;
    	let t7;
    	let label3;
    	let t8;
    	let input3;
    	let t9;
    	let label4;
    	let t10;
    	let input4;
    	let t11;
    	let label5;
    	let t12;
    	let input5;
    	let t13;
    	let label6;
    	let t14;
    	let input6;
    	let t15;
    	let label7;
    	let t16;
    	let input7;
    	let t17;
    	let label8;
    	let input8;
    	let t18;
    	let t19;
    	let label9;
    	let input9;
    	let t20;
    	let t21;
    	let label10;
    	let input10;
    	let t22;
    	let t23;
    	let label11;
    	let input11;
    	let t24;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[27](/*field*/ ctx[80], ...args);
    	}

    	function input0_input_handler_1() {
    		/*input0_input_handler_1*/ ctx[28].call(input0, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input_handler_5(...args) {
    		return /*input_handler_5*/ ctx[29](/*field*/ ctx[80], ...args);
    	}

    	function input1_input_handler_1() {
    		/*input1_input_handler_1*/ ctx[30].call(input1, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input_handler_6(...args) {
    		return /*input_handler_6*/ ctx[31](/*field*/ ctx[80], ...args);
    	}

    	function input2_input_handler_1() {
    		/*input2_input_handler_1*/ ctx[32].call(input2, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input_handler_7(...args) {
    		return /*input_handler_7*/ ctx[33](/*field*/ ctx[80], ...args);
    	}

    	function input3_input_handler_1() {
    		/*input3_input_handler_1*/ ctx[34].call(input3, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input_handler_8(...args) {
    		return /*input_handler_8*/ ctx[35](/*field*/ ctx[80], ...args);
    	}

    	function input4_input_handler_1() {
    		/*input4_input_handler_1*/ ctx[36].call(input4, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input_handler_9(...args) {
    		return /*input_handler_9*/ ctx[37](/*field*/ ctx[80], ...args);
    	}

    	function input5_input_handler() {
    		/*input5_input_handler*/ ctx[38].call(input5, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input_handler_10(...args) {
    		return /*input_handler_10*/ ctx[39](/*field*/ ctx[80], ...args);
    	}

    	function input6_input_handler() {
    		/*input6_input_handler*/ ctx[40].call(input6, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input_handler_11(...args) {
    		return /*input_handler_11*/ ctx[41](/*field*/ ctx[80], ...args);
    	}

    	function input7_input_handler() {
    		/*input7_input_handler*/ ctx[42].call(input7, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input8_change_handler() {
    		/*input8_change_handler*/ ctx[43].call(input8, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input9_change_handler() {
    		/*input9_change_handler*/ ctx[44].call(input9, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input10_change_handler() {
    		/*input10_change_handler*/ ctx[45].call(input10, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	function input11_change_handler() {
    		/*input11_change_handler*/ ctx[46].call(input11, /*each_value_9*/ ctx[100], /*field_index_4*/ ctx[101]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "-";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("Field:\n            ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Label:\n            ");
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			t6 = text("Type (DB):\n            ");
    			input2 = element("input");
    			t7 = space();
    			label3 = element("label");
    			t8 = text("Type (UI):\n            ");
    			input3 = element("input");
    			t9 = space();
    			label4 = element("label");
    			t10 = text("Select (SQL):\n            ");
    			input4 = element("input");
    			t11 = space();
    			label5 = element("label");
    			t12 = text("Create (SQL):\n            ");
    			input5 = element("input");
    			t13 = space();
    			label6 = element("label");
    			t14 = text("Update (SQL):\n            ");
    			input6 = element("input");
    			t15 = space();
    			label7 = element("label");
    			t16 = text("Extra:\n            ");
    			input7 = element("input");
    			t17 = space();
    			label8 = element("label");
    			input8 = element("input");
    			t18 = text("\n            list");
    			t19 = space();
    			label9 = element("label");
    			input9 = element("input");
    			t20 = text("\n            create");
    			t21 = space();
    			label10 = element("label");
    			input10 = element("input");
    			t22 = text("\n            update");
    			t23 = space();
    			label11 = element("label");
    			input11 = element("input");
    			t24 = text("\n            group rows");
    			add_location(button, file$1, 245, 8, 5982);
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-1rwfwyd");
    			add_location(input0, file$1, 248, 12, 6084);
    			attr_dev(label0, "class", "svelte-1rwfwyd");
    			add_location(label0, file$1, 246, 8, 6045);
    			attr_dev(input1, "name", "label");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-1rwfwyd");
    			add_location(input1, file$1, 257, 12, 6344);
    			attr_dev(label1, "class", "svelte-1rwfwyd");
    			add_location(label1, file$1, 255, 8, 6305);
    			attr_dev(input2, "name", "typeDB");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-1rwfwyd");
    			add_location(input2, file$1, 266, 12, 6610);
    			attr_dev(label2, "class", "svelte-1rwfwyd");
    			add_location(label2, file$1, 264, 8, 6567);
    			attr_dev(input3, "name", "type");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "list", "types");
    			attr_dev(input3, "class", "svelte-1rwfwyd");
    			add_location(input3, file$1, 275, 12, 6878);
    			attr_dev(label3, "class", "svelte-1rwfwyd");
    			add_location(label3, file$1, 273, 8, 6835);
    			attr_dev(input4, "name", "select");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "svelte-1rwfwyd");
    			add_location(input4, file$1, 285, 12, 7174);
    			attr_dev(label4, "class", "svelte-1rwfwyd");
    			add_location(label4, file$1, 283, 8, 7128);
    			attr_dev(input5, "name", "create");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "svelte-1rwfwyd");
    			add_location(input5, file$1, 294, 12, 7445);
    			attr_dev(label5, "class", "svelte-1rwfwyd");
    			add_location(label5, file$1, 292, 8, 7399);
    			attr_dev(input6, "name", "update");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "svelte-1rwfwyd");
    			add_location(input6, file$1, 303, 12, 7716);
    			attr_dev(label6, "class", "svelte-1rwfwyd");
    			add_location(label6, file$1, 301, 8, 7670);
    			attr_dev(input7, "name", "extra");
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "placeholder", "e.g. {list:{model:'clients', value:'id', text:'', params: {}}");
    			attr_dev(input7, "class", "svelte-1rwfwyd");
    			add_location(input7, file$1, 312, 12, 7980);
    			attr_dev(label7, "class", "svelte-1rwfwyd");
    			add_location(label7, file$1, 310, 8, 7941);
    			attr_dev(input8, "name", "showInList");
    			attr_dev(input8, "type", "checkbox");
    			add_location(input8, file$1, 320, 12, 8272);
    			attr_dev(label8, "class", "svelte-1rwfwyd");
    			add_location(label8, file$1, 319, 8, 8252);
    			attr_dev(input9, "name", "showInCreate");
    			attr_dev(input9, "type", "checkbox");
    			add_location(input9, file$1, 328, 12, 8470);
    			attr_dev(label9, "class", "svelte-1rwfwyd");
    			add_location(label9, file$1, 327, 8, 8450);
    			attr_dev(input10, "name", "showInUpdate");
    			attr_dev(input10, "type", "checkbox");
    			add_location(input10, file$1, 336, 12, 8674);
    			attr_dev(label10, "class", "svelte-1rwfwyd");
    			add_location(label10, file$1, 335, 8, 8654);
    			attr_dev(input11, "name", "groupRows");
    			attr_dev(input11, "type", "checkbox");
    			add_location(input11, file$1, 344, 12, 8878);
    			attr_dev(label11, "class", "svelte-1rwfwyd");
    			add_location(label11, file$1, 343, 8, 8858);
    			attr_dev(div, "class", "flex svelte-1rwfwyd");
    			add_location(div, file$1, 244, 4, 5955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*field*/ ctx[80].name);
    			append_dev(div, t3);
    			append_dev(div, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*field*/ ctx[80].label);
    			append_dev(div, t5);
    			append_dev(div, label2);
    			append_dev(label2, t6);
    			append_dev(label2, input2);
    			set_input_value(input2, /*field*/ ctx[80].typeDB);
    			append_dev(div, t7);
    			append_dev(div, label3);
    			append_dev(label3, t8);
    			append_dev(label3, input3);
    			set_input_value(input3, /*field*/ ctx[80].type);
    			append_dev(div, t9);
    			append_dev(div, label4);
    			append_dev(label4, t10);
    			append_dev(label4, input4);
    			set_input_value(input4, /*field*/ ctx[80].select);
    			append_dev(div, t11);
    			append_dev(div, label5);
    			append_dev(label5, t12);
    			append_dev(label5, input5);
    			set_input_value(input5, /*field*/ ctx[80].create);
    			append_dev(div, t13);
    			append_dev(div, label6);
    			append_dev(label6, t14);
    			append_dev(label6, input6);
    			set_input_value(input6, /*field*/ ctx[80].update);
    			append_dev(div, t15);
    			append_dev(div, label7);
    			append_dev(label7, t16);
    			append_dev(label7, input7);
    			set_input_value(input7, /*field*/ ctx[80].extra);
    			append_dev(div, t17);
    			append_dev(div, label8);
    			append_dev(label8, input8);
    			input8.checked = /*field*/ ctx[80].showInList;
    			append_dev(label8, t18);
    			append_dev(div, t19);
    			append_dev(div, label9);
    			append_dev(label9, input9);
    			input9.checked = /*field*/ ctx[80].showInCreate;
    			append_dev(label9, t20);
    			append_dev(div, t21);
    			append_dev(div, label10);
    			append_dev(label10, input10);
    			input10.checked = /*field*/ ctx[80].showInUpdate;
    			append_dev(label10, t22);
    			append_dev(div, t23);
    			append_dev(div, label11);
    			append_dev(label11, input11);
    			input11.checked = /*field*/ ctx[80].groupRows;
    			append_dev(label11, t24);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler, false, false, false),
    					listen_dev(input0, "input", input0_input_handler_1),
    					listen_dev(input0, "input", input_handler_5, false, false, false),
    					listen_dev(input1, "input", input1_input_handler_1),
    					listen_dev(input1, "input", input_handler_6, false, false, false),
    					listen_dev(input2, "input", input2_input_handler_1),
    					listen_dev(input2, "input", input_handler_7, false, false, false),
    					listen_dev(input3, "input", input3_input_handler_1),
    					listen_dev(input3, "input", input_handler_8, false, false, false),
    					listen_dev(input4, "input", input4_input_handler_1),
    					listen_dev(input4, "input", input_handler_9, false, false, false),
    					listen_dev(input5, "input", input5_input_handler),
    					listen_dev(input5, "input", input_handler_10, false, false, false),
    					listen_dev(input6, "input", input6_input_handler),
    					listen_dev(input6, "input", input_handler_11, false, false, false),
    					listen_dev(input7, "input", input7_input_handler),
    					listen_dev(input8, "change", input8_change_handler),
    					listen_dev(input9, "change", input9_change_handler),
    					listen_dev(input10, "change", input10_change_handler),
    					listen_dev(input11, "change", input11_change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input0.value !== /*field*/ ctx[80].name) {
    				set_input_value(input0, /*field*/ ctx[80].name);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*field*/ ctx[80].label) {
    				set_input_value(input1, /*field*/ ctx[80].label);
    			}

    			if (dirty[0] & /*model*/ 1 && input2.value !== /*field*/ ctx[80].typeDB) {
    				set_input_value(input2, /*field*/ ctx[80].typeDB);
    			}

    			if (dirty[0] & /*model*/ 1 && input3.value !== /*field*/ ctx[80].type) {
    				set_input_value(input3, /*field*/ ctx[80].type);
    			}

    			if (dirty[0] & /*model*/ 1 && input4.value !== /*field*/ ctx[80].select) {
    				set_input_value(input4, /*field*/ ctx[80].select);
    			}

    			if (dirty[0] & /*model*/ 1 && input5.value !== /*field*/ ctx[80].create) {
    				set_input_value(input5, /*field*/ ctx[80].create);
    			}

    			if (dirty[0] & /*model*/ 1 && input6.value !== /*field*/ ctx[80].update) {
    				set_input_value(input6, /*field*/ ctx[80].update);
    			}

    			if (dirty[0] & /*model*/ 1 && input7.value !== /*field*/ ctx[80].extra) {
    				set_input_value(input7, /*field*/ ctx[80].extra);
    			}

    			if (dirty[0] & /*model*/ 1) {
    				input8.checked = /*field*/ ctx[80].showInList;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				input9.checked = /*field*/ ctx[80].showInCreate;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				input10.checked = /*field*/ ctx[80].showInUpdate;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				input11.checked = /*field*/ ctx[80].groupRows;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_9.name,
    		type: "each",
    		source: "(244:0) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (379:0) {#each model.filters as filter}
    function create_each_block_8(ctx) {
    	let div;
    	let button;
    	let t1;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[50](/*filter*/ ctx[97], ...args);
    	}

    	function input0_input_handler_2() {
    		/*input0_input_handler_2*/ ctx[51].call(input0, /*each_value_8*/ ctx[98], /*filter_index*/ ctx[99]);
    	}

    	function input1_input_handler_2() {
    		/*input1_input_handler_2*/ ctx[52].call(input1, /*each_value_8*/ ctx[98], /*filter_index*/ ctx[99]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "-";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("Declaration:\n            ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Expression:\n            ");
    			input1 = element("input");
    			add_location(button, file$1, 380, 8, 9587);
    			attr_dev(input0, "name", "declaration");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "e.g.: findByName(name)");
    			attr_dev(input0, "class", "svelte-1rwfwyd");
    			add_location(input0, file$1, 383, 12, 9696);
    			attr_dev(label0, "class", "svelte-1rwfwyd");
    			add_location(label0, file$1, 381, 8, 9651);
    			attr_dev(input1, "name", "expression");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "e.g.: and name like ${contains($text)}");
    			attr_dev(input1, "class", "svelte-1rwfwyd");
    			add_location(input1, file$1, 392, 12, 9951);
    			attr_dev(label1, "class", "svelte-1rwfwyd");
    			add_location(label1, file$1, 390, 8, 9907);
    			attr_dev(div, "class", "flex svelte-1rwfwyd");
    			add_location(div, file$1, 379, 4, 9560);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*filter*/ ctx[97].declaration);
    			append_dev(div, t3);
    			append_dev(div, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*filter*/ ctx[97].expression);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler_1, false, false, false),
    					listen_dev(input0, "input", input0_input_handler_2),
    					listen_dev(input1, "input", input1_input_handler_2)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input0.value !== /*filter*/ ctx[97].declaration) {
    				set_input_value(input0, /*filter*/ ctx[97].declaration);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*filter*/ ctx[97].expression) {
    				set_input_value(input1, /*filter*/ ctx[97].expression);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_8.name,
    		type: "each",
    		source: "(379:0) {#each model.filters as filter}",
    		ctx
    	});

    	return block;
    }

    // (428:12) {#each relationship.params as param}
    function create_each_block_7(ctx) {
    	let div;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	function input0_input_handler_4() {
    		/*input0_input_handler_4*/ ctx[56].call(input0, /*each_value_7*/ ctx[95], /*param_index*/ ctx[96]);
    	}

    	function input1_input_handler_4() {
    		/*input1_input_handler_4*/ ctx[57].call(input1, /*each_value_7*/ ctx[95], /*param_index*/ ctx[96]);
    	}

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[58](/*relationship*/ ctx[91], /*param*/ ctx[94], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = text("=\n                    ");
    			input1 = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "x";
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "e.g.: user_id");
    			attr_dev(input0, "class", "svelte-1rwfwyd");
    			add_location(input0, file$1, 429, 20, 11041);
    			attr_dev(input1, "name", "value");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "e.g.: $id");
    			attr_dev(input1, "class", "svelte-1rwfwyd");
    			add_location(input1, file$1, 435, 20, 11264);
    			add_location(button, file$1, 441, 20, 11484);
    			attr_dev(div, "class", "flex relationship-param svelte-1rwfwyd");
    			add_location(div, file$1, 428, 16, 10983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*param*/ ctx[94].name);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			set_input_value(input1, /*param*/ ctx[94].value);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler_4),
    					listen_dev(input1, "input", input1_input_handler_4),
    					listen_dev(button, "click", click_handler_3, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input0.value !== /*param*/ ctx[94].name) {
    				set_input_value(input0, /*param*/ ctx[94].name);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*param*/ ctx[94].value) {
    				set_input_value(input1, /*param*/ ctx[94].value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_7.name,
    		type: "each",
    		source: "(428:12) {#each relationship.params as param}",
    		ctx
    	});

    	return block;
    }

    // (405:0) {#each model.relationships as relationship}
    function create_each_block_6(ctx) {
    	let div1;
    	let button0;
    	let t1;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let div0;
    	let t6;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[53](/*relationship*/ ctx[91], ...args);
    	}

    	function input0_input_handler_3() {
    		/*input0_input_handler_3*/ ctx[54].call(input0, /*each_value_6*/ ctx[92], /*relationship_index*/ ctx[93]);
    	}

    	function input1_input_handler_3() {
    		/*input1_input_handler_3*/ ctx[55].call(input1, /*each_value_6*/ ctx[92], /*relationship_index*/ ctx[93]);
    	}

    	let each_value_7 = /*relationship*/ ctx[91].params;
    	validate_each_argument(each_value_7);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_7.length; i += 1) {
    		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
    	}

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[59](/*relationship*/ ctx[91], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "-";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("Name:\n            ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Model:\n            ");
    			input1 = element("input");
    			t5 = text("\n        Params:\n        ");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			add_location(button0, file$1, 406, 8, 10338);
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "e.g.: roles");
    			attr_dev(input0, "class", "svelte-1rwfwyd");
    			add_location(input0, file$1, 409, 12, 10453);
    			attr_dev(label0, "class", "svelte-1rwfwyd");
    			add_location(label0, file$1, 407, 8, 10415);
    			attr_dev(input1, "name", "model");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "e.g.: user_roles");
    			attr_dev(input1, "class", "svelte-1rwfwyd");
    			add_location(input1, file$1, 418, 12, 10684);
    			attr_dev(label1, "class", "svelte-1rwfwyd");
    			add_location(label1, file$1, 416, 8, 10645);
    			add_location(button1, file$1, 448, 12, 11718);
    			attr_dev(div0, "class", "flex svelte-1rwfwyd");
    			add_location(div0, file$1, 426, 8, 10899);
    			attr_dev(div1, "class", "flex svelte-1rwfwyd");
    			add_location(div1, file$1, 405, 4, 10311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(div1, t1);
    			append_dev(div1, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*relationship*/ ctx[91].name);
    			append_dev(div1, t3);
    			append_dev(div1, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*relationship*/ ctx[91].model);
    			append_dev(div1, t5);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t6);
    			append_dev(div0, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_2, false, false, false),
    					listen_dev(input0, "input", input0_input_handler_3),
    					listen_dev(input1, "input", input1_input_handler_3),
    					listen_dev(button1, "click", click_handler_4, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input0.value !== /*relationship*/ ctx[91].name) {
    				set_input_value(input0, /*relationship*/ ctx[91].name);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*relationship*/ ctx[91].model) {
    				set_input_value(input1, /*relationship*/ ctx[91].model);
    			}

    			if (dirty[0] & /*removeRelationshipParam, model*/ 4097) {
    				each_value_7 = /*relationship*/ ctx[91].params;
    				validate_each_argument(each_value_7);
    				let i;

    				for (i = 0; i < each_value_7.length; i += 1) {
    					const child_ctx = get_each_context_7(ctx, each_value_7, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, t6);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_7.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(405:0) {#each model.relationships as relationship}",
    		ctx
    	});

    	return block;
    }

    // (461:8) {#each model.fields as field}
    function create_each_block_5(ctx) {
    	let th;
    	let t_value = /*field*/ ctx[80].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$1, 461, 12, 12000);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*model*/ 1 && t_value !== (t_value = /*field*/ ctx[80].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(461:8) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (468:12) {#each model.fields as field}
    function create_each_block_4(ctx) {
    	let td;
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[61].call(input, /*field*/ ctx[80], /*each_value_3*/ ctx[85], /*row_index_1*/ ctx[86]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			input = element("input");
    			add_location(input, file$1, 468, 20, 12227);
    			add_location(td, file$1, 468, 16, 12223);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, input);
    			set_input_value(input, /*row*/ ctx[77][/*field*/ ctx[80].name]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input.value !== /*row*/ ctx[77][/*field*/ ctx[80].name]) {
    				set_input_value(input, /*row*/ ctx[77][/*field*/ ctx[80].name]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(468:12) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (465:4) {#each model.data as row}
    function create_each_block_3(ctx) {
    	let tr;
    	let td;
    	let button;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[60](/*row*/ ctx[77], ...args);
    	}

    	let each_value_4 = /*model*/ ctx[0].fields;
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			button = element("button");
    			button.textContent = "-";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(button, file$1, 466, 16, 12108);
    			add_location(td, file$1, 466, 12, 12104);
    			add_location(tr, file$1, 465, 8, 12087);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, button);
    			append_dev(tr, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_5, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1) {
    				each_value_4 = /*model*/ ctx[0].fields;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(465:4) {#each model.data as row}",
    		ctx
    	});

    	return block;
    }

    // (483:8) {#each model.fields as field}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*field*/ ctx[80].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$1, 483, 12, 12556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*model*/ 1 && t_value !== (t_value = /*field*/ ctx[80].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(483:8) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (500:12) {#each model.fields as field}
    function create_each_block_1(ctx) {
    	let td;
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[66].call(input, /*field*/ ctx[80], /*each_value*/ ctx[78], /*row_index*/ ctx[79]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			input = element("input");
    			add_location(input, file$1, 500, 20, 13244);
    			add_location(td, file$1, 500, 16, 13240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, input);
    			set_input_value(input, /*row*/ ctx[77].attributes[/*field*/ ctx[80].name]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input.value !== /*row*/ ctx[77].attributes[/*field*/ ctx[80].name]) {
    				set_input_value(input, /*row*/ ctx[77].attributes[/*field*/ ctx[80].name]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(500:12) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (487:4) {#each (model.createButtons || []) as row}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let button;
    	let t1;
    	let td1;
    	let input0;
    	let t2;
    	let td2;
    	let input1;
    	let t3;
    	let td3;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t7;
    	let t8;
    	let mounted;
    	let dispose;

    	function click_handler_6(...args) {
    		return /*click_handler_6*/ ctx[62](/*row*/ ctx[77], ...args);
    	}

    	function input0_input_handler_5() {
    		/*input0_input_handler_5*/ ctx[63].call(input0, /*each_value*/ ctx[78], /*row_index*/ ctx[79]);
    	}

    	function input1_input_handler_5() {
    		/*input1_input_handler_5*/ ctx[64].call(input1, /*each_value*/ ctx[78], /*row_index*/ ctx[79]);
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[65].call(select, /*each_value*/ ctx[78], /*row_index*/ ctx[79]);
    	}

    	let each_value_1 = /*model*/ ctx[0].fields;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			button = element("button");
    			button.textContent = "-";
    			t1 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t2 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t3 = space();
    			td3 = element("td");
    			select = element("select");
    			option0 = element("option");
    			option1 = element("option");
    			option1.textContent = "button";
    			option2 = element("option");
    			option2.textContent = "reset";
    			option3 = element("option");
    			option3.textContent = "submit";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			add_location(button, file$1, 488, 16, 12681);
    			add_location(td0, file$1, 488, 12, 12677);
    			add_location(input0, file$1, 489, 16, 12762);
    			add_location(td1, file$1, 489, 12, 12758);
    			add_location(input1, file$1, 490, 16, 12815);
    			add_location(td2, file$1, 490, 12, 12811);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 493, 20, 12936);
    			option1.__value = "button";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 494, 20, 12983);
    			option2.__value = "reset";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 495, 20, 13042);
    			option3.__value = "submit";
    			option3.value = option3.__value;
    			add_location(option3, file$1, 496, 20, 13099);
    			if (/*row*/ ctx[77].type === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$1, 492, 16, 12885);
    			add_location(td3, file$1, 491, 12, 12864);
    			add_location(tr, file$1, 487, 8, 12660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, button);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*row*/ ctx[77].name);
    			append_dev(tr, t2);
    			append_dev(tr, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*row*/ ctx[77].icon);
    			append_dev(tr, t3);
    			append_dev(tr, td3);
    			append_dev(td3, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*row*/ ctx[77].type);
    			append_dev(tr, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler_6, false, false, false),
    					listen_dev(input0, "input", input0_input_handler_5),
    					listen_dev(input1, "input", input1_input_handler_5),
    					listen_dev(select, "change", select_change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input0.value !== /*row*/ ctx[77].name) {
    				set_input_value(input0, /*row*/ ctx[77].name);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*row*/ ctx[77].icon) {
    				set_input_value(input1, /*row*/ ctx[77].icon);
    			}

    			if (dirty[0] & /*model*/ 1) {
    				select_option(select, /*row*/ ctx[77].type);
    			}

    			if (dirty[0] & /*model*/ 1) {
    				each_value_1 = /*model*/ ctx[0].fields;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, t8);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(487:4) {#each (model.createButtons || []) as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let label1;
    	let t2;
    	let input1;
    	let t3;
    	let label2;
    	let t4;
    	let input2;
    	let t5;
    	let label3;
    	let t6;
    	let input3;
    	let t7;
    	let br0;
    	let t8;
    	let label4;
    	let t9;
    	let input4;
    	let t10;
    	let br1;
    	let t11;
    	let datalist;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let t12;
    	let button0;
    	let br2;
    	let t14;
    	let t15;
    	let label5;
    	let t16;
    	let textarea0;
    	let t17;
    	let br3;
    	let t18;
    	let label6;
    	let t19;
    	let input5;
    	let t20;
    	let br4;
    	let t21;
    	let label7;
    	let t22;
    	let input6;
    	let t23;
    	let br5;
    	let t24;
    	let hr0;
    	let t25;
    	let button1;
    	let br6;
    	let t27;
    	let t28;
    	let hr1;
    	let t29;
    	let button2;
    	let br7;
    	let t31;
    	let t32;
    	let hr2;
    	let t33;
    	let button3;
    	let br8;
    	let t35;
    	let table0;
    	let tr0;
    	let th0;
    	let t36;
    	let t37;
    	let t38;
    	let hr3;
    	let t39;
    	let button4;
    	let br9;
    	let t41;
    	let table1;
    	let tr1;
    	let th1;
    	let t42;
    	let th2;
    	let t44;
    	let th3;
    	let t46;
    	let th4;
    	let t48;
    	let t49;
    	let t50;
    	let hr4;
    	let t51;
    	let label8;
    	let input7;
    	let t52;
    	let t53;
    	let br10;
    	let t54;
    	let label9;
    	let t55;
    	let textarea1;
    	let t56;
    	let br11;
    	let t57;
    	let button5;
    	let mounted;
    	let dispose;
    	let each_value_9 = /*model*/ ctx[0].fields;
    	validate_each_argument(each_value_9);
    	let each_blocks_6 = [];

    	for (let i = 0; i < each_value_9.length; i += 1) {
    		each_blocks_6[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
    	}

    	let each_value_8 = /*model*/ ctx[0].filters;
    	validate_each_argument(each_value_8);
    	let each_blocks_5 = [];

    	for (let i = 0; i < each_value_8.length; i += 1) {
    		each_blocks_5[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
    	}

    	let each_value_6 = /*model*/ ctx[0].relationships;
    	validate_each_argument(each_value_6);
    	let each_blocks_4 = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks_4[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	let each_value_5 = /*model*/ ctx[0].fields;
    	validate_each_argument(each_value_5);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_3[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_value_3 = /*model*/ ctx[0].data;
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*model*/ ctx[0].fields;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*model*/ ctx[0].createButtons || [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			label0 = element("label");
    			t0 = text("Name:\n    ");
    			input0 = element("input");
    			t1 = space();
    			label1 = element("label");
    			t2 = text("Table:\n    ");
    			input1 = element("input");
    			t3 = space();
    			label2 = element("label");
    			t4 = text("Join:\n    ");
    			input2 = element("input");
    			t5 = space();
    			label3 = element("label");
    			t6 = text("URL: /api/\n    ");
    			input3 = element("input");
    			t7 = space();
    			br0 = element("br");
    			t8 = space();
    			label4 = element("label");
    			t9 = text("ID field:\n    ");
    			input4 = element("input");
    			t10 = space();
    			br1 = element("br");
    			t11 = space();
    			datalist = element("datalist");
    			option0 = element("option");
    			option1 = element("option");
    			option2 = element("option");
    			option3 = element("option");
    			option4 = element("option");
    			option5 = element("option");
    			option6 = element("option");
    			option7 = element("option");
    			t12 = text("\n\nFields ");
    			button0 = element("button");
    			button0.textContent = "+";
    			br2 = element("br");
    			t14 = space();

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].c();
    			}

    			t15 = space();
    			label5 = element("label");
    			t16 = text("Where:\n    ");
    			textarea0 = element("textarea");
    			t17 = space();
    			br3 = element("br");
    			t18 = space();
    			label6 = element("label");
    			t19 = text("Sort:\n    ");
    			input5 = element("input");
    			t20 = space();
    			br4 = element("br");
    			t21 = space();
    			label7 = element("label");
    			t22 = text("Enabled actions:\n    ");
    			input6 = element("input");
    			t23 = space();
    			br5 = element("br");
    			t24 = space();
    			hr0 = element("hr");
    			t25 = text("\nAvailable filters:");
    			button1 = element("button");
    			button1.textContent = "+";
    			br6 = element("br");
    			t27 = space();

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].c();
    			}

    			t28 = space();
    			hr1 = element("hr");
    			t29 = text("\nRelationships:");
    			button2 = element("button");
    			button2.textContent = "+";
    			br7 = element("br");
    			t31 = space();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t32 = space();
    			hr2 = element("hr");
    			t33 = text("\nInitial Data:");
    			button3 = element("button");
    			button3.textContent = "+";
    			br8 = element("br");
    			t35 = space();
    			table0 = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			t36 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t37 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t38 = space();
    			hr3 = element("hr");
    			t39 = text("\nCustom Create Buttons:");
    			button4 = element("button");
    			button4.textContent = "+";
    			br9 = element("br");
    			t41 = space();
    			table1 = element("table");
    			tr1 = element("tr");
    			th1 = element("th");
    			t42 = space();
    			th2 = element("th");
    			th2.textContent = "name";
    			t44 = space();
    			th3 = element("th");
    			th3.textContent = "icon";
    			t46 = space();
    			th4 = element("th");
    			th4.textContent = "type";
    			t48 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t49 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t50 = space();
    			hr4 = element("hr");
    			t51 = space();
    			label8 = element("label");
    			input7 = element("input");
    			t52 = text("\n    Load more button");
    			t53 = space();
    			br10 = element("br");
    			t54 = space();
    			label9 = element("label");
    			t55 = text("Extra (JSON):\n    ");
    			textarea1 = element("textarea");
    			t56 = space();
    			br11 = element("br");
    			t57 = space();
    			button5 = element("button");
    			button5.textContent = "SAVE";
    			attr_dev(input0, "name", "name");
    			add_location(input0, file$1, 186, 4, 4758);
    			attr_dev(label0, "class", "svelte-1rwfwyd");
    			add_location(label0, file$1, 184, 0, 4736);
    			attr_dev(input1, "name", "table");
    			add_location(input1, file$1, 195, 4, 4927);
    			attr_dev(label1, "class", "svelte-1rwfwyd");
    			add_location(label1, file$1, 193, 0, 4904);
    			attr_dev(input2, "name", "join");
    			add_location(input2, file$1, 204, 4, 5097);
    			attr_dev(label2, "class", "svelte-1rwfwyd");
    			add_location(label2, file$1, 202, 0, 5075);
    			attr_dev(input3, "name", "url");
    			add_location(input3, file$1, 213, 4, 5270);
    			attr_dev(label3, "class", "svelte-1rwfwyd");
    			add_location(label3, file$1, 211, 0, 5243);
    			add_location(br0, file$1, 219, 0, 5413);
    			attr_dev(input4, "name", "id");
    			add_location(input4, file$1, 223, 4, 5447);
    			attr_dev(label4, "class", "svelte-1rwfwyd");
    			add_location(label4, file$1, 221, 0, 5421);
    			add_location(br1, file$1, 229, 0, 5588);
    			option0.__value = "text";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 232, 4, 5622);
    			option1.__value = "email";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 233, 4, 5650);
    			option2.__value = "password";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 234, 4, 5679);
    			option3.__value = "number";
    			option3.value = option3.__value;
    			add_location(option3, file$1, 235, 4, 5711);
    			option4.__value = "tel";
    			option4.value = option4.__value;
    			add_location(option4, file$1, 236, 4, 5741);
    			option5.__value = "date";
    			option5.value = option5.__value;
    			add_location(option5, file$1, 237, 4, 5768);
    			option6.__value = "datetime";
    			option6.value = option6.__value;
    			add_location(option6, file$1, 238, 4, 5796);
    			option7.__value = "checkbox";
    			option7.value = option7.__value;
    			add_location(option7, file$1, 239, 4, 5828);
    			attr_dev(datalist, "id", "types");
    			add_location(datalist, file$1, 231, 0, 5596);
    			add_location(button0, file$1, 242, 7, 5876);
    			add_location(br2, file$1, 242, 45, 5914);
    			attr_dev(textarea0, "name", "where");
    			attr_dev(textarea0, "cols", "80");
    			add_location(textarea0, file$1, 356, 4, 9095);
    			attr_dev(label5, "class", "svelte-1rwfwyd");
    			add_location(label5, file$1, 354, 0, 9072);
    			add_location(br3, file$1, 358, 0, 9165);
    			attr_dev(input5, "name", "sort");
    			attr_dev(input5, "placeholder", "e.g.: name,-id");
    			add_location(input5, file$1, 362, 4, 9195);
    			attr_dev(label6, "class", "svelte-1rwfwyd");
    			add_location(label6, file$1, 360, 0, 9173);
    			add_location(br4, file$1, 364, 0, 9279);
    			attr_dev(input6, "name", "actions");
    			attr_dev(input6, "placeholder", "e.g.: edit,view,print");
    			add_location(input6, file$1, 368, 4, 9320);
    			attr_dev(label7, "class", "svelte-1rwfwyd");
    			add_location(label7, file$1, 366, 0, 9287);
    			add_location(br5, file$1, 374, 0, 9445);
    			add_location(hr0, file$1, 376, 0, 9453);
    			add_location(button1, file$1, 377, 18, 9478);
    			add_location(br6, file$1, 377, 57, 9517);
    			add_location(hr1, file$1, 402, 0, 10190);
    			add_location(button2, file$1, 403, 14, 10211);
    			add_location(br7, file$1, 403, 59, 10256);
    			add_location(hr2, file$1, 455, 0, 11854);
    			add_location(button3, file$1, 456, 13, 11874);
    			add_location(br8, file$1, 456, 50, 11911);
    			add_location(th0, file$1, 459, 8, 11943);
    			add_location(tr0, file$1, 458, 4, 11930);
    			add_location(table0, file$1, 457, 0, 11918);
    			add_location(hr3, file$1, 474, 0, 12327);
    			add_location(button4, file$1, 475, 22, 12356);
    			add_location(br9, file$1, 475, 67, 12401);
    			add_location(th1, file$1, 478, 8, 12433);
    			add_location(th2, file$1, 479, 8, 12448);
    			add_location(th3, file$1, 480, 8, 12470);
    			add_location(th4, file$1, 481, 8, 12492);
    			add_location(tr1, file$1, 477, 4, 12420);
    			add_location(table1, file$1, 476, 0, 12408);
    			add_location(hr4, file$1, 506, 0, 13355);
    			attr_dev(input7, "name", "loadMore");
    			attr_dev(input7, "type", "checkbox");
    			add_location(input7, file$1, 509, 4, 13375);
    			attr_dev(label8, "class", "svelte-1rwfwyd");
    			add_location(label8, file$1, 508, 0, 13363);
    			add_location(br10, file$1, 512, 0, 13477);
    			attr_dev(textarea1, "name", "extra");
    			attr_dev(textarea1, "cols", "80");
    			add_location(textarea1, file$1, 516, 4, 13515);
    			attr_dev(label9, "class", "svelte-1rwfwyd");
    			add_location(label9, file$1, 514, 0, 13485);
    			add_location(br11, file$1, 518, 0, 13594);
    			add_location(button5, file$1, 520, 0, 13602);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label0, anchor);
    			append_dev(label0, t0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*model*/ ctx[0].name);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, t2);
    			append_dev(label1, input1);
    			set_input_value(input1, /*model*/ ctx[0].table);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, t4);
    			append_dev(label2, input2);
    			set_input_value(input2, /*model*/ ctx[0].join);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, label3, anchor);
    			append_dev(label3, t6);
    			append_dev(label3, input3);
    			set_input_value(input3, /*model*/ ctx[0].url);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, label4, anchor);
    			append_dev(label4, t9);
    			append_dev(label4, input4);
    			set_input_value(input4, /*model*/ ctx[0].id);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, datalist, anchor);
    			append_dev(datalist, option0);
    			append_dev(datalist, option1);
    			append_dev(datalist, option2);
    			append_dev(datalist, option3);
    			append_dev(datalist, option4);
    			append_dev(datalist, option5);
    			append_dev(datalist, option6);
    			append_dev(datalist, option7);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t14, anchor);

    			for (let i = 0; i < each_blocks_6.length; i += 1) {
    				each_blocks_6[i].m(target, anchor);
    			}

    			insert_dev(target, t15, anchor);
    			insert_dev(target, label5, anchor);
    			append_dev(label5, t16);
    			append_dev(label5, textarea0);
    			set_input_value(textarea0, /*model*/ ctx[0].where);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, label6, anchor);
    			append_dev(label6, t19);
    			append_dev(label6, input5);
    			set_input_value(input5, /*model*/ ctx[0].sort);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, label7, anchor);
    			append_dev(label7, t22);
    			append_dev(label7, input6);
    			set_input_value(input6, /*model*/ ctx[0].actions);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t27, anchor);

    			for (let i = 0; i < each_blocks_5.length; i += 1) {
    				each_blocks_5[i].m(target, anchor);
    			}

    			insert_dev(target, t28, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t31, anchor);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(target, anchor);
    			}

    			insert_dev(target, t32, anchor);
    			insert_dev(target, hr2, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, button3, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, table0, anchor);
    			append_dev(table0, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t36);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(tr0, null);
    			}

    			append_dev(table0, t37);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(table0, null);
    			}

    			insert_dev(target, t38, anchor);
    			insert_dev(target, hr3, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, button4, anchor);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, table1, anchor);
    			append_dev(table1, tr1);
    			append_dev(tr1, th1);
    			append_dev(tr1, t42);
    			append_dev(tr1, th2);
    			append_dev(tr1, t44);
    			append_dev(tr1, th3);
    			append_dev(tr1, t46);
    			append_dev(tr1, th4);
    			append_dev(tr1, t48);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr1, null);
    			}

    			append_dev(table1, t49);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table1, null);
    			}

    			insert_dev(target, t50, anchor);
    			insert_dev(target, hr4, anchor);
    			insert_dev(target, t51, anchor);
    			insert_dev(target, label8, anchor);
    			append_dev(label8, input7);
    			input7.checked = /*model*/ ctx[0].loadMore;
    			append_dev(label8, t52);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, br10, anchor);
    			insert_dev(target, t54, anchor);
    			insert_dev(target, label9, anchor);
    			append_dev(label9, t55);
    			append_dev(label9, textarea1);
    			set_input_value(textarea1, /*model*/ ctx[0].extra);
    			insert_dev(target, t56, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t57, anchor);
    			insert_dev(target, button5, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[17]),
    					listen_dev(input0, "input", /*input_handler*/ ctx[18], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[19]),
    					listen_dev(input1, "input", /*input_handler_1*/ ctx[20], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[21]),
    					listen_dev(input2, "input", /*input_handler_2*/ ctx[22], false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[23]),
    					listen_dev(input3, "input", /*input_handler_3*/ ctx[24], false, false, false),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[25]),
    					listen_dev(input4, "input", /*input_handler_4*/ ctx[26], false, false, false),
    					listen_dev(button0, "click", /*addField*/ ctx[4], false, false, false),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[47]),
    					listen_dev(input5, "input", /*input5_input_handler_1*/ ctx[48]),
    					listen_dev(input6, "input", /*input6_input_handler_1*/ ctx[49]),
    					listen_dev(button1, "click", /*addFilter*/ ctx[9], false, false, false),
    					listen_dev(button2, "click", /*addRelationship*/ ctx[10], false, false, false),
    					listen_dev(button3, "click", /*addData*/ ctx[7], false, false, false),
    					listen_dev(button4, "click", /*addCreateButton*/ ctx[14], false, false, false),
    					listen_dev(input7, "change", /*input7_change_handler*/ ctx[67]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[68]),
    					listen_dev(button5, "click", /*createResource*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*model*/ 1 && input0.value !== /*model*/ ctx[0].name) {
    				set_input_value(input0, /*model*/ ctx[0].name);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*model*/ ctx[0].table) {
    				set_input_value(input1, /*model*/ ctx[0].table);
    			}

    			if (dirty[0] & /*model*/ 1 && input2.value !== /*model*/ ctx[0].join) {
    				set_input_value(input2, /*model*/ ctx[0].join);
    			}

    			if (dirty[0] & /*model*/ 1 && input3.value !== /*model*/ ctx[0].url) {
    				set_input_value(input3, /*model*/ ctx[0].url);
    			}

    			if (dirty[0] & /*model*/ 1 && input4.value !== /*model*/ ctx[0].id) {
    				set_input_value(input4, /*model*/ ctx[0].id);
    			}

    			if (dirty[0] & /*model, inputField, fieldDefaults, removeField*/ 45) {
    				each_value_9 = /*model*/ ctx[0].fields;
    				validate_each_argument(each_value_9);
    				let i;

    				for (i = 0; i < each_value_9.length; i += 1) {
    					const child_ctx = get_each_context_9(ctx, each_value_9, i);

    					if (each_blocks_6[i]) {
    						each_blocks_6[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_6[i] = create_each_block_9(child_ctx);
    						each_blocks_6[i].c();
    						each_blocks_6[i].m(t15.parentNode, t15);
    					}
    				}

    				for (; i < each_blocks_6.length; i += 1) {
    					each_blocks_6[i].d(1);
    				}

    				each_blocks_6.length = each_value_9.length;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				set_input_value(textarea0, /*model*/ ctx[0].where);
    			}

    			if (dirty[0] & /*model*/ 1 && input5.value !== /*model*/ ctx[0].sort) {
    				set_input_value(input5, /*model*/ ctx[0].sort);
    			}

    			if (dirty[0] & /*model*/ 1 && input6.value !== /*model*/ ctx[0].actions) {
    				set_input_value(input6, /*model*/ ctx[0].actions);
    			}

    			if (dirty[0] & /*model, removeField*/ 33) {
    				each_value_8 = /*model*/ ctx[0].filters;
    				validate_each_argument(each_value_8);
    				let i;

    				for (i = 0; i < each_value_8.length; i += 1) {
    					const child_ctx = get_each_context_8(ctx, each_value_8, i);

    					if (each_blocks_5[i]) {
    						each_blocks_5[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_5[i] = create_each_block_8(child_ctx);
    						each_blocks_5[i].c();
    						each_blocks_5[i].m(t28.parentNode, t28);
    					}
    				}

    				for (; i < each_blocks_5.length; i += 1) {
    					each_blocks_5[i].d(1);
    				}

    				each_blocks_5.length = each_value_8.length;
    			}

    			if (dirty[0] & /*addRelationshipParam, model, removeRelationshipParam, removeRelationship*/ 14337) {
    				each_value_6 = /*model*/ ctx[0].relationships;
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks_4[i]) {
    						each_blocks_4[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_4[i] = create_each_block_6(child_ctx);
    						each_blocks_4[i].c();
    						each_blocks_4[i].m(t32.parentNode, t32);
    					}
    				}

    				for (; i < each_blocks_4.length; i += 1) {
    					each_blocks_4[i].d(1);
    				}

    				each_blocks_4.length = each_value_6.length;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				each_value_5 = /*model*/ ctx[0].fields;
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_5(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(tr0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_5.length;
    			}

    			if (dirty[0] & /*model, removeData*/ 257) {
    				each_value_3 = /*model*/ ctx[0].data;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(table0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				each_value_2 = /*model*/ ctx[0].fields;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*model, removeCreateButton*/ 32769) {
    				each_value = /*model*/ ctx[0].createButtons || [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				input7.checked = /*model*/ ctx[0].loadMore;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				set_input_value(textarea1, /*model*/ ctx[0].extra);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(label1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(label2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(label3);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(label4);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(datalist);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t14);
    			destroy_each(each_blocks_6, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(label5);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(label6);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(label7);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t27);
    			destroy_each(each_blocks_5, detaching);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t31);
    			destroy_each(each_blocks_4, detaching);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(hr2);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(button3);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(table0);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(hr3);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(button4);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(table1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t50);
    			if (detaching) detach_dev(hr4);
    			if (detaching) detach_dev(t51);
    			if (detaching) detach_dev(label8);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t54);
    			if (detaching) detach_dev(label9);
    			if (detaching) detach_dev(t56);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t57);
    			if (detaching) detach_dev(button5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const env = {"dev_api_base":"http://localhost:5050/dev/","language":"es"};
    	const apiBase = env.dev_api_base || "http://localhost/";
    	let { params = { id: null } } = $$props;

    	let model = {
    		name: "",
    		table: "",
    		join: "",
    		url: "",
    		id: "id",
    		fields: [],
    		where: "",
    		sort: "",
    		filters: [],
    		data: [],
    		actions: "edit,view,print",
    		relationships: [],
    		createButtons: [],
    		loadMore: false,
    		extra: ""
    	};

    	let modelDefaults = { table: "${name}", url: "${name}" };

    	let fieldDefaults = {
    		label: "${capitalize(name)}",
    		select: "${name}",
    		create: ":${name}",
    		update: ":${name}"
    	};

    	let changed = {};
    	let response = "";
    	let listOfObjects = [];

    	function keyOf(object) {
    		if (!listOfObjects) {
    			listOfObjects = [];
    		}

    		if (listOfObjects.indexOf(object) === -1) {
    			listOfObjects.push(object);
    		}

    		return listOfObjects.indexOf(object);
    	}

    	initInputFieldDefaults(model, modelDefaults);

    	window["capitalize"] = function (word) {
    		const lower = word.toLowerCase();
    		return word.charAt(0).toUpperCase() + lower.slice(1);
    	};

    	if (params.id) {
    		loadModel(params.id);
    	}

    	function loadModel(id) {
    		api(apiBase + "resource").get(id).then(resource => {
    			$$invalidate(0, model = resource.attributes);
    			initInputFieldDefaults(model, modelDefaults);

    			model.fields.forEach(field => {
    				initInputFieldDefaults(field, fieldDefaults);
    			});
    		});
    	}

    	function initInputFieldDefaults(model1, defaults) {
    		const model1Key = keyOf(model1);
    		changed[model1Key] = {};

    		Object.keys(defaults).forEach(key => {
    			const defaultValue = defaults[key]
    			? new Function(...Object.keys(model1), "return `" + defaults[key] + "`")(...Object.values(model1))
    			: undefined;

    			const ch = model1[key] !== defaultValue && model1[key] !== null;
    			changed[model1Key][key] = ch;
    		});
    	}

    	function inputField(event, model1, defaults) {
    		const name = event.target["name"];
    		event.target["value"];
    		const model1Key = keyOf(model1);
    		changed[model1Key][name] = true;

    		Object.keys(defaults).forEach(key => {
    			const defaultValue = defaults[key]
    			? new Function(...Object.keys(model1), "return `" + defaults[key] + "`")(...Object.values(model1))
    			: undefined;

    			if (!changed[model1Key][key] && defaultValue !== undefined) {
    				model1[key] = defaultValue;
    			}
    		});

    		$$invalidate(0, model);
    	}

    	function addField() {
    		const field = {
    			name: "",
    			typeDB: "varchar(64)",
    			type: "text",
    			select: null,
    			create: null,
    			update: null,
    			extra: null,
    			showInList: true,
    			showInCreate: true,
    			showInUpdate: true,
    			groupRows: false
    		};

    		model.fields.push(field);
    		initInputFieldDefaults(field, fieldDefaults);
    		$$invalidate(0, model);
    	}

    	function removeField(field) {
    		model.fields.splice(model.fields.indexOf(field), 1);
    		$$invalidate(0, model);
    	}

    	function createResource() {
    		api(apiBase + "resource").post({ data: { attributes: model } }).then(async result => {
    			response = result;
    		});
    	}

    	function addData() {
    		const row = {};

    		model.fields.forEach(field => {
    			row[field.name] = "";
    		});

    		model.data.push(row);
    		$$invalidate(0, model);
    	}

    	function removeData(row) {
    		model.data.splice(model.data.indexOf(row), 1);
    		$$invalidate(0, model);
    	}

    	function addFilter() {
    		const filter = { declaration: "", expression: "" };
    		model.filters.push(filter);
    		$$invalidate(0, model);
    	}

    	function addRelationship() {
    		const relationship = { name: "", params: [] };
    		model.relationships.push(relationship);
    		$$invalidate(0, model);
    	}

    	function removeRelationship(relationship) {
    		model.relationships.splice(model.relationships.indexOf(relationship), 1);
    		$$invalidate(0, model);
    	}

    	function removeRelationshipParam(relationship, param) {
    		relationship.params.splice(relationship.params.indexOf(param), 1);
    		$$invalidate(0, model);
    	}

    	function addRelationshipParam(relationship) {
    		const param = { name: "", value: "" };
    		relationship.params.push(param);
    		$$invalidate(0, model);
    	}

    	function addCreateButton() {
    		if (!model.createButtons) {
    			$$invalidate(0, model.createButtons = [], model);
    		}

    		const button = {
    			name: "",
    			icon: "plus",
    			type: "submit",
    			attributes: {}
    		};

    		model.createButtons.push(button);
    		$$invalidate(0, model);
    	}

    	function removeCreateButton(button) {
    		model.createButtons.splice(model.createButtons.indexOf(button), 1);
    		$$invalidate(0, model);
    	}

    	const writable_props = ["params"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Resource> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Resource", $$slots, []);

    	function input0_input_handler() {
    		model.name = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler = event => inputField(event, model, modelDefaults);

    	function input1_input_handler() {
    		model.table = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_1 = event => inputField(event, model, modelDefaults);

    	function input2_input_handler() {
    		model.join = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_2 = event => inputField(event, model, modelDefaults);

    	function input3_input_handler() {
    		model.url = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_3 = event => inputField(event, model, modelDefaults);

    	function input4_input_handler() {
    		model.id = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_4 = event => inputField(event, model, modelDefaults);
    	const click_handler = field => removeField(field);

    	function input0_input_handler_1(each_value_9, field_index_4) {
    		each_value_9[field_index_4].name = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_5 = (field, event) => inputField(event, field, fieldDefaults);

    	function input1_input_handler_1(each_value_9, field_index_4) {
    		each_value_9[field_index_4].label = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_6 = (field, event) => inputField(event, field, fieldDefaults);

    	function input2_input_handler_1(each_value_9, field_index_4) {
    		each_value_9[field_index_4].typeDB = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_7 = (field, event) => inputField(event, field, fieldDefaults);

    	function input3_input_handler_1(each_value_9, field_index_4) {
    		each_value_9[field_index_4].type = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_8 = (field, event) => inputField(event, field, fieldDefaults);

    	function input4_input_handler_1(each_value_9, field_index_4) {
    		each_value_9[field_index_4].select = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_9 = (field, event) => inputField(event, field, fieldDefaults);

    	function input5_input_handler(each_value_9, field_index_4) {
    		each_value_9[field_index_4].create = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_10 = (field, event) => inputField(event, field, fieldDefaults);

    	function input6_input_handler(each_value_9, field_index_4) {
    		each_value_9[field_index_4].update = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_11 = (field, event) => inputField(event, field, fieldDefaults);

    	function input7_input_handler(each_value_9, field_index_4) {
    		each_value_9[field_index_4].extra = this.value;
    		$$invalidate(0, model);
    	}

    	function input8_change_handler(each_value_9, field_index_4) {
    		each_value_9[field_index_4].showInList = this.checked;
    		$$invalidate(0, model);
    	}

    	function input9_change_handler(each_value_9, field_index_4) {
    		each_value_9[field_index_4].showInCreate = this.checked;
    		$$invalidate(0, model);
    	}

    	function input10_change_handler(each_value_9, field_index_4) {
    		each_value_9[field_index_4].showInUpdate = this.checked;
    		$$invalidate(0, model);
    	}

    	function input11_change_handler(each_value_9, field_index_4) {
    		each_value_9[field_index_4].groupRows = this.checked;
    		$$invalidate(0, model);
    	}

    	function textarea0_input_handler() {
    		model.where = this.value;
    		$$invalidate(0, model);
    	}

    	function input5_input_handler_1() {
    		model.sort = this.value;
    		$$invalidate(0, model);
    	}

    	function input6_input_handler_1() {
    		model.actions = this.value;
    		$$invalidate(0, model);
    	}

    	const click_handler_1 = filter => removeField(filter);

    	function input0_input_handler_2(each_value_8, filter_index) {
    		each_value_8[filter_index].declaration = this.value;
    		$$invalidate(0, model);
    	}

    	function input1_input_handler_2(each_value_8, filter_index) {
    		each_value_8[filter_index].expression = this.value;
    		$$invalidate(0, model);
    	}

    	const click_handler_2 = relationship => removeRelationship(relationship);

    	function input0_input_handler_3(each_value_6, relationship_index) {
    		each_value_6[relationship_index].name = this.value;
    		$$invalidate(0, model);
    	}

    	function input1_input_handler_3(each_value_6, relationship_index) {
    		each_value_6[relationship_index].model = this.value;
    		$$invalidate(0, model);
    	}

    	function input0_input_handler_4(each_value_7, param_index) {
    		each_value_7[param_index].name = this.value;
    		$$invalidate(0, model);
    	}

    	function input1_input_handler_4(each_value_7, param_index) {
    		each_value_7[param_index].value = this.value;
    		$$invalidate(0, model);
    	}

    	const click_handler_3 = (relationship, param) => removeRelationshipParam(relationship, param);
    	const click_handler_4 = relationship => addRelationshipParam(relationship);
    	const click_handler_5 = row => removeData(row);

    	function input_input_handler(field, each_value_3, row_index_1) {
    		each_value_3[row_index_1][field.name] = this.value;
    		$$invalidate(0, model);
    	}

    	const click_handler_6 = row => removeCreateButton(row);

    	function input0_input_handler_5(each_value, row_index) {
    		each_value[row_index].name = this.value;
    		$$invalidate(0, model);
    	}

    	function input1_input_handler_5(each_value, row_index) {
    		each_value[row_index].icon = this.value;
    		$$invalidate(0, model);
    	}

    	function select_change_handler(each_value, row_index) {
    		each_value[row_index].type = select_value(this);
    		$$invalidate(0, model);
    	}

    	function input_input_handler_1(field, each_value, row_index) {
    		each_value[row_index].attributes[field.name] = this.value;
    		$$invalidate(0, model);
    	}

    	function input7_change_handler() {
    		model.loadMore = this.checked;
    		$$invalidate(0, model);
    	}

    	function textarea1_input_handler() {
    		model.extra = this.value;
    		$$invalidate(0, model);
    	}

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(16, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		api,
    		env,
    		apiBase,
    		params,
    		model,
    		modelDefaults,
    		fieldDefaults,
    		changed,
    		response,
    		listOfObjects,
    		keyOf,
    		loadModel,
    		initInputFieldDefaults,
    		inputField,
    		addField,
    		removeField,
    		createResource,
    		addData,
    		removeData,
    		addFilter,
    		addRelationship,
    		removeRelationship,
    		removeRelationshipParam,
    		addRelationshipParam,
    		addCreateButton,
    		removeCreateButton
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(16, params = $$props.params);
    		if ("model" in $$props) $$invalidate(0, model = $$props.model);
    		if ("modelDefaults" in $$props) $$invalidate(1, modelDefaults = $$props.modelDefaults);
    		if ("fieldDefaults" in $$props) $$invalidate(2, fieldDefaults = $$props.fieldDefaults);
    		if ("changed" in $$props) changed = $$props.changed;
    		if ("response" in $$props) response = $$props.response;
    		if ("listOfObjects" in $$props) listOfObjects = $$props.listOfObjects;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		model,
    		modelDefaults,
    		fieldDefaults,
    		inputField,
    		addField,
    		removeField,
    		createResource,
    		addData,
    		removeData,
    		addFilter,
    		addRelationship,
    		removeRelationship,
    		removeRelationshipParam,
    		addRelationshipParam,
    		addCreateButton,
    		removeCreateButton,
    		params,
    		input0_input_handler,
    		input_handler,
    		input1_input_handler,
    		input_handler_1,
    		input2_input_handler,
    		input_handler_2,
    		input3_input_handler,
    		input_handler_3,
    		input4_input_handler,
    		input_handler_4,
    		click_handler,
    		input0_input_handler_1,
    		input_handler_5,
    		input1_input_handler_1,
    		input_handler_6,
    		input2_input_handler_1,
    		input_handler_7,
    		input3_input_handler_1,
    		input_handler_8,
    		input4_input_handler_1,
    		input_handler_9,
    		input5_input_handler,
    		input_handler_10,
    		input6_input_handler,
    		input_handler_11,
    		input7_input_handler,
    		input8_change_handler,
    		input9_change_handler,
    		input10_change_handler,
    		input11_change_handler,
    		textarea0_input_handler,
    		input5_input_handler_1,
    		input6_input_handler_1,
    		click_handler_1,
    		input0_input_handler_2,
    		input1_input_handler_2,
    		click_handler_2,
    		input0_input_handler_3,
    		input1_input_handler_3,
    		input0_input_handler_4,
    		input1_input_handler_4,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		input_input_handler,
    		click_handler_6,
    		input0_input_handler_5,
    		input1_input_handler_5,
    		select_change_handler,
    		input_input_handler_1,
    		input7_change_handler,
    		textarea1_input_handler
    	];
    }

    class Resource extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { params: 16 }, [-1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resource",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get params() {
    		throw new Error("<Resource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Resource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/devtools/Panel.svelte generated by Svelte v3.24.0 */
    const file = "src/devtools/Panel.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (40:2) {#if option.href}
    function create_if_block(ctx) {
    	let t0;
    	let a;
    	let span;
    	let t1_value = /*option*/ ctx[3].label + "";
    	let t1;
    	let t2;
    	let a_class_value;

    	const block = {
    		c: function create() {
    			t0 = text("/\n\t\t\t");
    			a = element("a");
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			add_location(span, file, 45, 4, 974);

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*$location*/ ctx[1] == /*option*/ ctx[3].href
    			? "active"
    			: "") + " svelte-oglahv"));

    			attr_dev(a, "href", `#${/*option*/ ctx[3].href}`);
    			add_location(a, file, 41, 3, 880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, span);
    			append_dev(span, t1);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && a_class_value !== (a_class_value = "" + (null_to_empty(/*$location*/ ctx[1] == /*option*/ ctx[3].href
    			? "active"
    			: "") + " svelte-oglahv"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:2) {#if option.href}",
    		ctx
    	});

    	return block;
    }

    // (39:1) {#each options as option}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*option*/ ctx[3].href && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*option*/ ctx[3].href) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:1) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let hr;
    	let t1;
    	let router;
    	let current;
    	let each_value = /*options*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			hr = element("hr");
    			t1 = space();
    			create_component(router.$$.fragment);
    			add_location(div, file, 37, 0, 819);
    			add_location(hr, file, 50, 0, 1034);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$location, options*/ 6) {
    				each_value = /*options*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const router_changes = {};
    			if (dirty & /*routes*/ 1) router_changes.routes = /*routes*/ ctx[0];
    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t1);
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $location;
    	validate_store(location, "location");
    	component_subscribe($$self, location, $$value => $$invalidate(1, $location = $$value));

    	let options = [
    		{
    			href: "/",
    			label: "Home",
    			component: Home
    		},
    		{
    			href: "/resource",
    			label: "+ Resource",
    			component: Resource,
    			route: "/resource"
    		},
    		{
    			label: "+ Resource",
    			component: Resource,
    			route: "/resource/:id"
    		}
    	];

    	const routes = {};

    	options.forEach(({ href, component, route }) => {
    		$$invalidate(0, routes[route || href] = component, routes);
    	});

    	// Listen events from main page
    	if (chrome.runtime.onMessage) {
    		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    			if (request.type === "reload") {
    				window.location.reload();
    			}
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Panel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Panel", $$slots, []);

    	$$self.$capture_state = () => ({
    		Router,
    		location,
    		Home,
    		AddResource: Resource,
    		options,
    		routes,
    		$location
    	});

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(2, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [routes, $location, options];
    }

    class Panel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Panel",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Panel({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=panel.js.map
