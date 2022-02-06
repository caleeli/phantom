
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
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
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
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
            set_current_component(null);
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
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
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
                if (!info.hasCatch) {
                    throw error;
                }
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
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
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
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
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
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
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
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
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

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.42.1 */

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
    				} else {
    					if_block.p(ctx, dirty);
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
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

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
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

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

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
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

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
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
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
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
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
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
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
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
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
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
    		window.addEventListener('popstate', popStateChanged);

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
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

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
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
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
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
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
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
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
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
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

    var _actions="";var Login="Ingresar";var Password="Contraseña";var Search="Buscar";var Username="Nombre de usuario";var es = {_actions:_actions,"Load more":"Cargar más",Login:Login,Password:Password,"Please enter your account":"Por favor ingrese su cuenta",Search:Search,Username:Username};

    const translations = { es };
    function translation(language) {
        let labels = {};
        const func = function (textOrName, data = {}) {
            var _a;
            const text = labels[textOrName] || textOrName;
            const translation = (_a = translations[language]) === null || _a === void 0 ? void 0 : _a[text];
            if (translation === undefined) {
                return text;
            }
            // replace :placeholders
            return translation.replace(/:([a-zA-Z0-9_]+)/g, (match, placeholder) => {
                return data[placeholder] || match;
            });
        };
        func.setLabels = (labelsO = {}) => {
            labels = labelsO;
        };
        return func;
    }

    // load from env api_base
    const env = {"dev_api_base":"http://localhost:5050/dev/","language":"es"};
    const _ = translation(env.language );

    class Resource$1 {
        constructor(name, apiBase) {
            this.name = name;
            this.apiBase = apiBase;
            this.url = new URL(name, apiBase).toString();
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
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
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
            return fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        // patch resource
        patch(id = null, data) {
            const url = id ? `${this.url}/${id}` : this.url;
            return fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        // patch resource
        put(id = null, data) {
            const url = id ? `${this.url}/${id}` : this.url;
            return fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
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

    /* src/devtools/panels/Home.svelte generated by Svelte v3.42.1 */
    const file$2 = "src/devtools/panels/Home.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (1:0) <script lang="ts">import { _ }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import { _ }",
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
    	let t0_value = /*resource*/ ctx[4]['attributes']['name'] + "";
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
    			add_location(td0, file$2, 19, 4, 438);
    			attr_dev(a, "href", "#/resource/" + /*resource*/ ctx[4]['id']);
    			add_location(a, file$2, 21, 5, 494);
    			add_location(td1, file$2, 20, 4, 484);
    			add_location(tr, file$2, 18, 3, 429);
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

    // (1:0) <script lang="ts">import { _ }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script lang=\\\"ts\\\">import { _ }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0_value = _("Bienvenido al panel de desarrador") + "";
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
    		hasCatch: false,
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
    			add_location(th0, file$2, 13, 2, 310);
    			add_location(th1, file$2, 14, 2, 330);
    			add_location(tr, file$2, 12, 1, 303);
    			add_location(table, file$2, 11, 0, 294);
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
    			update_await_block_branch(info, ctx, dirty);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const env = {"dev_api_base":"http://localhost:5050/dev/","language":"es"};
    	const apiBase = env.dev_api_base || "http://localhost/dev/";

    	function listResources() {
    		return api(apiBase + "resource").get();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ _, api, env, apiBase, listResources });
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

    /* src/devtools/panels/Resource.svelte generated by Svelte v3.42.1 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/devtools/panels/Resource.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[50] = list[i];
    	child_ctx[51] = list;
    	child_ctx[52] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[53] = list[i];
    	child_ctx[54] = list;
    	child_ctx[55] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[53] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[58] = list[i];
    	child_ctx[59] = list;
    	child_ctx[60] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[53] = list[i];
    	child_ctx[61] = list;
    	child_ctx[62] = i;
    	return child_ctx;
    }

    // (160:0) {#each model.fields as field}
    function create_each_block_4(ctx) {
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
    	let input7;
    	let t16;
    	let t17_value = /*field*/ ctx[53].showInList + "";
    	let t17;
    	let t18;
    	let label8;
    	let input8;
    	let t19;
    	let t20;
    	let label9;
    	let input9;
    	let t21;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[19](/*field*/ ctx[53]);
    	}

    	function input0_input_handler_1() {
    		/*input0_input_handler_1*/ ctx[20].call(input0, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input_handler_4(...args) {
    		return /*input_handler_4*/ ctx[21](/*field*/ ctx[53], ...args);
    	}

    	function input1_input_handler_1() {
    		/*input1_input_handler_1*/ ctx[22].call(input1, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input_handler_5(...args) {
    		return /*input_handler_5*/ ctx[23](/*field*/ ctx[53], ...args);
    	}

    	function input2_input_handler_1() {
    		/*input2_input_handler_1*/ ctx[24].call(input2, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input_handler_6(...args) {
    		return /*input_handler_6*/ ctx[25](/*field*/ ctx[53], ...args);
    	}

    	function input3_input_handler_1() {
    		/*input3_input_handler_1*/ ctx[26].call(input3, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input_handler_7(...args) {
    		return /*input_handler_7*/ ctx[27](/*field*/ ctx[53], ...args);
    	}

    	function input4_input_handler() {
    		/*input4_input_handler*/ ctx[28].call(input4, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input_handler_8(...args) {
    		return /*input_handler_8*/ ctx[29](/*field*/ ctx[53], ...args);
    	}

    	function input5_input_handler() {
    		/*input5_input_handler*/ ctx[30].call(input5, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input_handler_9(...args) {
    		return /*input_handler_9*/ ctx[31](/*field*/ ctx[53], ...args);
    	}

    	function input6_input_handler() {
    		/*input6_input_handler*/ ctx[32].call(input6, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input_handler_10(...args) {
    		return /*input_handler_10*/ ctx[33](/*field*/ ctx[53], ...args);
    	}

    	function input7_change_handler() {
    		/*input7_change_handler*/ ctx[34].call(input7, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input8_change_handler() {
    		/*input8_change_handler*/ ctx[35].call(input8, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
    	}

    	function input9_change_handler() {
    		/*input9_change_handler*/ ctx[36].call(input9, /*each_value_4*/ ctx[61], /*field_index_2*/ ctx[62]);
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
    			input7 = element("input");
    			t16 = text("\n            list ");
    			t17 = text(t17_value);
    			t18 = space();
    			label8 = element("label");
    			input8 = element("input");
    			t19 = text("\n            create");
    			t20 = space();
    			label9 = element("label");
    			input9 = element("input");
    			t21 = text("\n            update");
    			add_location(button, file$1, 161, 8, 3630);
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-17c38a3");
    			add_location(input0, file$1, 164, 12, 3732);
    			attr_dev(label0, "class", "svelte-17c38a3");
    			add_location(label0, file$1, 162, 8, 3693);
    			attr_dev(input1, "name", "label");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-17c38a3");
    			add_location(input1, file$1, 173, 12, 3992);
    			attr_dev(label1, "class", "svelte-17c38a3");
    			add_location(label1, file$1, 171, 8, 3953);
    			attr_dev(input2, "name", "typeDB");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-17c38a3");
    			add_location(input2, file$1, 182, 12, 4258);
    			attr_dev(label2, "class", "svelte-17c38a3");
    			add_location(label2, file$1, 180, 8, 4215);
    			attr_dev(input3, "name", "type");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "list", "types");
    			attr_dev(input3, "class", "svelte-17c38a3");
    			add_location(input3, file$1, 191, 12, 4526);
    			attr_dev(label3, "class", "svelte-17c38a3");
    			add_location(label3, file$1, 189, 8, 4483);
    			attr_dev(input4, "name", "select");
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "svelte-17c38a3");
    			add_location(input4, file$1, 201, 12, 4822);
    			attr_dev(label4, "class", "svelte-17c38a3");
    			add_location(label4, file$1, 199, 8, 4776);
    			attr_dev(input5, "name", "create");
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "class", "svelte-17c38a3");
    			add_location(input5, file$1, 210, 12, 5093);
    			attr_dev(label5, "class", "svelte-17c38a3");
    			add_location(label5, file$1, 208, 8, 5047);
    			attr_dev(input6, "name", "update");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "class", "svelte-17c38a3");
    			add_location(input6, file$1, 219, 12, 5364);
    			attr_dev(label6, "class", "svelte-17c38a3");
    			add_location(label6, file$1, 217, 8, 5318);
    			attr_dev(input7, "name", "showInList");
    			attr_dev(input7, "type", "checkbox");
    			add_location(input7, file$1, 227, 12, 5609);
    			attr_dev(label7, "class", "svelte-17c38a3");
    			add_location(label7, file$1, 226, 8, 5589);
    			attr_dev(input8, "name", "showInCreate");
    			attr_dev(input8, "type", "checkbox");
    			add_location(input8, file$1, 235, 12, 5826);
    			attr_dev(label8, "class", "svelte-17c38a3");
    			add_location(label8, file$1, 234, 8, 5806);
    			attr_dev(input9, "name", "showInUpdate");
    			attr_dev(input9, "type", "checkbox");
    			add_location(input9, file$1, 243, 12, 6030);
    			attr_dev(label9, "class", "svelte-17c38a3");
    			add_location(label9, file$1, 242, 8, 6010);
    			attr_dev(div, "class", "flex svelte-17c38a3");
    			add_location(div, file$1, 160, 4, 3603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*field*/ ctx[53].name);
    			append_dev(div, t3);
    			append_dev(div, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*field*/ ctx[53].label);
    			append_dev(div, t5);
    			append_dev(div, label2);
    			append_dev(label2, t6);
    			append_dev(label2, input2);
    			set_input_value(input2, /*field*/ ctx[53].typeDB);
    			append_dev(div, t7);
    			append_dev(div, label3);
    			append_dev(label3, t8);
    			append_dev(label3, input3);
    			set_input_value(input3, /*field*/ ctx[53].type);
    			append_dev(div, t9);
    			append_dev(div, label4);
    			append_dev(label4, t10);
    			append_dev(label4, input4);
    			set_input_value(input4, /*field*/ ctx[53].select);
    			append_dev(div, t11);
    			append_dev(div, label5);
    			append_dev(label5, t12);
    			append_dev(label5, input5);
    			set_input_value(input5, /*field*/ ctx[53].create);
    			append_dev(div, t13);
    			append_dev(div, label6);
    			append_dev(label6, t14);
    			append_dev(label6, input6);
    			set_input_value(input6, /*field*/ ctx[53].update);
    			append_dev(div, t15);
    			append_dev(div, label7);
    			append_dev(label7, input7);
    			input7.checked = /*field*/ ctx[53].showInList;
    			append_dev(label7, t16);
    			append_dev(label7, t17);
    			append_dev(div, t18);
    			append_dev(div, label8);
    			append_dev(label8, input8);
    			input8.checked = /*field*/ ctx[53].showInCreate;
    			append_dev(label8, t19);
    			append_dev(div, t20);
    			append_dev(div, label9);
    			append_dev(label9, input9);
    			input9.checked = /*field*/ ctx[53].showInUpdate;
    			append_dev(label9, t21);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler, false, false, false),
    					listen_dev(input0, "input", input0_input_handler_1),
    					listen_dev(input0, "input", input_handler_4, false, false, false),
    					listen_dev(input1, "input", input1_input_handler_1),
    					listen_dev(input1, "input", input_handler_5, false, false, false),
    					listen_dev(input2, "input", input2_input_handler_1),
    					listen_dev(input2, "input", input_handler_6, false, false, false),
    					listen_dev(input3, "input", input3_input_handler_1),
    					listen_dev(input3, "input", input_handler_7, false, false, false),
    					listen_dev(input4, "input", input4_input_handler),
    					listen_dev(input4, "input", input_handler_8, false, false, false),
    					listen_dev(input5, "input", input5_input_handler),
    					listen_dev(input5, "input", input_handler_9, false, false, false),
    					listen_dev(input6, "input", input6_input_handler),
    					listen_dev(input6, "input", input_handler_10, false, false, false),
    					listen_dev(input7, "change", input7_change_handler),
    					listen_dev(input8, "change", input8_change_handler),
    					listen_dev(input9, "change", input9_change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input0.value !== /*field*/ ctx[53].name) {
    				set_input_value(input0, /*field*/ ctx[53].name);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*field*/ ctx[53].label) {
    				set_input_value(input1, /*field*/ ctx[53].label);
    			}

    			if (dirty[0] & /*model*/ 1 && input2.value !== /*field*/ ctx[53].typeDB) {
    				set_input_value(input2, /*field*/ ctx[53].typeDB);
    			}

    			if (dirty[0] & /*model*/ 1 && input3.value !== /*field*/ ctx[53].type) {
    				set_input_value(input3, /*field*/ ctx[53].type);
    			}

    			if (dirty[0] & /*model*/ 1 && input4.value !== /*field*/ ctx[53].select) {
    				set_input_value(input4, /*field*/ ctx[53].select);
    			}

    			if (dirty[0] & /*model*/ 1 && input5.value !== /*field*/ ctx[53].create) {
    				set_input_value(input5, /*field*/ ctx[53].create);
    			}

    			if (dirty[0] & /*model*/ 1 && input6.value !== /*field*/ ctx[53].update) {
    				set_input_value(input6, /*field*/ ctx[53].update);
    			}

    			if (dirty[0] & /*model*/ 1) {
    				input7.checked = /*field*/ ctx[53].showInList;
    			}

    			if (dirty[0] & /*model*/ 1 && t17_value !== (t17_value = /*field*/ ctx[53].showInList + "")) set_data_dev(t17, t17_value);

    			if (dirty[0] & /*model*/ 1) {
    				input8.checked = /*field*/ ctx[53].showInCreate;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				input9.checked = /*field*/ ctx[53].showInUpdate;
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
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(160:0) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (278:0) {#each model.filters as filter}
    function create_each_block_3(ctx) {
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

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[40](/*filter*/ ctx[58]);
    	}

    	function input0_input_handler_2() {
    		/*input0_input_handler_2*/ ctx[41].call(input0, /*each_value_3*/ ctx[59], /*filter_index*/ ctx[60]);
    	}

    	function input1_input_handler_2() {
    		/*input1_input_handler_2*/ ctx[42].call(input1, /*each_value_3*/ ctx[59], /*filter_index*/ ctx[60]);
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
    			add_location(button, file$1, 279, 8, 6741);
    			attr_dev(input0, "name", "declaration");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "e.g.: findByName(name)");
    			attr_dev(input0, "class", "svelte-17c38a3");
    			add_location(input0, file$1, 282, 12, 6850);
    			attr_dev(label0, "class", "svelte-17c38a3");
    			add_location(label0, file$1, 280, 8, 6805);
    			attr_dev(input1, "name", "expression");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "e.g.: and name like ${contains($text)}");
    			attr_dev(input1, "class", "svelte-17c38a3");
    			add_location(input1, file$1, 291, 12, 7105);
    			attr_dev(label1, "class", "svelte-17c38a3");
    			add_location(label1, file$1, 289, 8, 7061);
    			attr_dev(div, "class", "flex svelte-17c38a3");
    			add_location(div, file$1, 278, 4, 6714);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*filter*/ ctx[58].declaration);
    			append_dev(div, t3);
    			append_dev(div, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*filter*/ ctx[58].expression);

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

    			if (dirty[0] & /*model*/ 1 && input0.value !== /*filter*/ ctx[58].declaration) {
    				set_input_value(input0, /*filter*/ ctx[58].declaration);
    			}

    			if (dirty[0] & /*model*/ 1 && input1.value !== /*filter*/ ctx[58].expression) {
    				set_input_value(input1, /*filter*/ ctx[58].expression);
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
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(278:0) {#each model.filters as filter}",
    		ctx
    	});

    	return block;
    }

    // (307:8) {#each model.fields as field}
    function create_each_block_2(ctx) {
    	let th;
    	let t_value = /*field*/ ctx[53].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$1, 307, 12, 7490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*model*/ 1 && t_value !== (t_value = /*field*/ ctx[53].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(307:8) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (314:12) {#each model.fields as field}
    function create_each_block_1(ctx) {
    	let td;
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[44].call(input, /*field*/ ctx[53], /*each_value*/ ctx[51], /*row_index*/ ctx[52]);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			input = element("input");
    			add_location(input, file$1, 314, 20, 7717);
    			add_location(td, file$1, 314, 16, 7713);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, input);
    			set_input_value(input, /*row*/ ctx[50][/*field*/ ctx[53].name]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*model*/ 1 && input.value !== /*row*/ ctx[50][/*field*/ ctx[53].name]) {
    				set_input_value(input, /*row*/ ctx[50][/*field*/ ctx[53].name]);
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
    		source: "(314:12) {#each model.fields as field}",
    		ctx
    	});

    	return block;
    }

    // (311:4) {#each model.data as row}
    function create_each_block$1(ctx) {
    	let tr;
    	let td;
    	let button;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[43](/*row*/ ctx[50]);
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
    			td = element("td");
    			button = element("button");
    			button.textContent = "-";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(button, file$1, 312, 16, 7598);
    			add_location(td, file$1, 312, 12, 7594);
    			add_location(tr, file$1, 311, 8, 7577);
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
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

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
    						each_blocks[i].m(tr, t2);
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
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(311:4) {#each model.data as row}",
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
    	let br0;
    	let t6;
    	let label3;
    	let t7;
    	let input3;
    	let t8;
    	let br1;
    	let t9;
    	let datalist;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let t10;
    	let button0;
    	let br2;
    	let t12;
    	let t13;
    	let label4;
    	let t14;
    	let textarea;
    	let t15;
    	let br3;
    	let t16;
    	let label5;
    	let t17;
    	let input4;
    	let t18;
    	let br4;
    	let t19;
    	let label6;
    	let t20;
    	let input5;
    	let t21;
    	let br5;
    	let t22;
    	let hr0;
    	let t23;
    	let button1;
    	let br6;
    	let t25;
    	let t26;
    	let hr1;
    	let t27;
    	let button2;
    	let br7;
    	let t29;
    	let table;
    	let tr;
    	let th;
    	let t30;
    	let t31;
    	let t32;
    	let hr2;
    	let t33;
    	let button3;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*model*/ ctx[0].fields;
    	validate_each_argument(each_value_4);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_3[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*model*/ ctx[0].filters;
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

    	let each_value = /*model*/ ctx[0].data;
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
    			t4 = text("URL: /api/\n    ");
    			input2 = element("input");
    			t5 = space();
    			br0 = element("br");
    			t6 = space();
    			label3 = element("label");
    			t7 = text("ID field:\n    ");
    			input3 = element("input");
    			t8 = space();
    			br1 = element("br");
    			t9 = space();
    			datalist = element("datalist");
    			option0 = element("option");
    			option1 = element("option");
    			option2 = element("option");
    			option3 = element("option");
    			option4 = element("option");
    			option5 = element("option");
    			option6 = element("option");
    			option7 = element("option");
    			t10 = text("\n\nFields ");
    			button0 = element("button");
    			button0.textContent = "+";
    			br2 = element("br");
    			t12 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t13 = space();
    			label4 = element("label");
    			t14 = text("Where:\n    ");
    			textarea = element("textarea");
    			t15 = space();
    			br3 = element("br");
    			t16 = space();
    			label5 = element("label");
    			t17 = text("Sort:\n    ");
    			input4 = element("input");
    			t18 = space();
    			br4 = element("br");
    			t19 = space();
    			label6 = element("label");
    			t20 = text("Enabled actions:\n    ");
    			input5 = element("input");
    			t21 = space();
    			br5 = element("br");
    			t22 = space();
    			hr0 = element("hr");
    			t23 = text("\nAvailable filters:");
    			button1 = element("button");
    			button1.textContent = "+";
    			br6 = element("br");
    			t25 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t26 = space();
    			hr1 = element("hr");
    			t27 = text("\nInitial Data:");
    			button2 = element("button");
    			button2.textContent = "+";
    			br7 = element("br");
    			t29 = space();
    			table = element("table");
    			tr = element("tr");
    			th = element("th");
    			t30 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t31 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t32 = space();
    			hr2 = element("hr");
    			t33 = space();
    			button3 = element("button");
    			button3.textContent = "CREATE";
    			attr_dev(input0, "name", "name");
    			add_location(input0, file$1, 111, 4, 2574);
    			attr_dev(label0, "class", "svelte-17c38a3");
    			add_location(label0, file$1, 109, 0, 2552);
    			attr_dev(input1, "name", "table");
    			add_location(input1, file$1, 120, 4, 2743);
    			attr_dev(label1, "class", "svelte-17c38a3");
    			add_location(label1, file$1, 118, 0, 2720);
    			attr_dev(input2, "name", "url");
    			add_location(input2, file$1, 129, 4, 2918);
    			attr_dev(label2, "class", "svelte-17c38a3");
    			add_location(label2, file$1, 127, 0, 2891);
    			add_location(br0, file$1, 135, 0, 3061);
    			attr_dev(input3, "name", "id");
    			add_location(input3, file$1, 139, 4, 3095);
    			attr_dev(label3, "class", "svelte-17c38a3");
    			add_location(label3, file$1, 137, 0, 3069);
    			add_location(br1, file$1, 145, 0, 3236);
    			option0.__value = "text";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 148, 4, 3270);
    			option1.__value = "email";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 149, 4, 3298);
    			option2.__value = "password";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 150, 4, 3327);
    			option3.__value = "number";
    			option3.value = option3.__value;
    			add_location(option3, file$1, 151, 4, 3359);
    			option4.__value = "tel";
    			option4.value = option4.__value;
    			add_location(option4, file$1, 152, 4, 3389);
    			option5.__value = "date";
    			option5.value = option5.__value;
    			add_location(option5, file$1, 153, 4, 3416);
    			option6.__value = "datetime";
    			option6.value = option6.__value;
    			add_location(option6, file$1, 154, 4, 3444);
    			option7.__value = "checkbox";
    			option7.value = option7.__value;
    			add_location(option7, file$1, 155, 4, 3476);
    			attr_dev(datalist, "id", "types");
    			add_location(datalist, file$1, 147, 0, 3244);
    			add_location(button0, file$1, 158, 7, 3524);
    			add_location(br2, file$1, 158, 45, 3562);
    			attr_dev(textarea, "name", "where");
    			attr_dev(textarea, "cols", "80");
    			add_location(textarea, file$1, 255, 4, 6249);
    			attr_dev(label4, "class", "svelte-17c38a3");
    			add_location(label4, file$1, 253, 0, 6226);
    			add_location(br3, file$1, 257, 0, 6319);
    			attr_dev(input4, "name", "sort");
    			attr_dev(input4, "placeholder", "e.g.: name,-id");
    			add_location(input4, file$1, 261, 4, 6349);
    			attr_dev(label5, "class", "svelte-17c38a3");
    			add_location(label5, file$1, 259, 0, 6327);
    			add_location(br4, file$1, 263, 0, 6433);
    			attr_dev(input5, "name", "actions");
    			attr_dev(input5, "placeholder", "e.g.: edit,view,print");
    			add_location(input5, file$1, 267, 4, 6474);
    			attr_dev(label6, "class", "svelte-17c38a3");
    			add_location(label6, file$1, 265, 0, 6441);
    			add_location(br5, file$1, 273, 0, 6599);
    			add_location(hr0, file$1, 275, 0, 6607);
    			add_location(button1, file$1, 276, 18, 6632);
    			add_location(br6, file$1, 276, 57, 6671);
    			add_location(hr1, file$1, 301, 0, 7344);
    			add_location(button2, file$1, 302, 13, 7364);
    			add_location(br7, file$1, 302, 50, 7401);
    			add_location(th, file$1, 305, 8, 7433);
    			add_location(tr, file$1, 304, 4, 7420);
    			add_location(table, file$1, 303, 0, 7408);
    			add_location(hr2, file$1, 319, 0, 7816);
    			add_location(button3, file$1, 320, 0, 7823);
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
    			set_input_value(input2, /*model*/ ctx[0].url);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, label3, anchor);
    			append_dev(label3, t7);
    			append_dev(label3, input3);
    			set_input_value(input3, /*model*/ ctx[0].id);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, datalist, anchor);
    			append_dev(datalist, option0);
    			append_dev(datalist, option1);
    			append_dev(datalist, option2);
    			append_dev(datalist, option3);
    			append_dev(datalist, option4);
    			append_dev(datalist, option5);
    			append_dev(datalist, option6);
    			append_dev(datalist, option7);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t12, anchor);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(target, anchor);
    			}

    			insert_dev(target, t13, anchor);
    			insert_dev(target, label4, anchor);
    			append_dev(label4, t14);
    			append_dev(label4, textarea);
    			set_input_value(textarea, /*model*/ ctx[0].where);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, label5, anchor);
    			append_dev(label5, t17);
    			append_dev(label5, input4);
    			set_input_value(input4, /*model*/ ctx[0].sort);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, label6, anchor);
    			append_dev(label6, t20);
    			append_dev(label6, input5);
    			set_input_value(input5, /*model*/ ctx[0].actions);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t25, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(target, anchor);
    			}

    			insert_dev(target, t26, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th);
    			append_dev(tr, t30);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t31);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t32, anchor);
    			insert_dev(target, hr2, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, button3, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input0, "input", /*input_handler*/ ctx[12], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[13]),
    					listen_dev(input1, "input", /*input_handler_1*/ ctx[14], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    					listen_dev(input2, "input", /*input_handler_2*/ ctx[16], false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[17]),
    					listen_dev(input3, "input", /*input_handler_3*/ ctx[18], false, false, false),
    					listen_dev(button0, "click", /*addField*/ ctx[4], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[37]),
    					listen_dev(input4, "input", /*input4_input_handler_1*/ ctx[38]),
    					listen_dev(input5, "input", /*input5_input_handler_1*/ ctx[39]),
    					listen_dev(button1, "click", /*addFilter*/ ctx[9], false, false, false),
    					listen_dev(button2, "click", /*addData*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", /*createResource*/ ctx[6], false, false, false)
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

    			if (dirty[0] & /*model*/ 1 && input2.value !== /*model*/ ctx[0].url) {
    				set_input_value(input2, /*model*/ ctx[0].url);
    			}

    			if (dirty[0] & /*model*/ 1 && input3.value !== /*model*/ ctx[0].id) {
    				set_input_value(input3, /*model*/ ctx[0].id);
    			}

    			if (dirty[0] & /*model, inputField, fieldDefaults, removeField*/ 45) {
    				each_value_4 = /*model*/ ctx[0].fields;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_4(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(t13.parentNode, t13);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_4.length;
    			}

    			if (dirty[0] & /*model*/ 1) {
    				set_input_value(textarea, /*model*/ ctx[0].where);
    			}

    			if (dirty[0] & /*model*/ 1 && input4.value !== /*model*/ ctx[0].sort) {
    				set_input_value(input4, /*model*/ ctx[0].sort);
    			}

    			if (dirty[0] & /*model*/ 1 && input5.value !== /*model*/ ctx[0].actions) {
    				set_input_value(input5, /*model*/ ctx[0].actions);
    			}

    			if (dirty[0] & /*model, removeField*/ 33) {
    				each_value_3 = /*model*/ ctx[0].filters;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(t26.parentNode, t26);
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
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*model, removeData*/ 257) {
    				each_value = /*model*/ ctx[0].data;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
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
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(label3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(datalist);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t12);
    			destroy_each(each_blocks_3, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(label4);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(label5);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(label6);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t25);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(hr2);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(button3);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Resource', slots, []);
    	const env = {"dev_api_base":"http://localhost:5050/dev/","language":"es"};
    	const apiBase = env.dev_api_base || "http://localhost/";
    	let { params = { id: null } } = $$props;

    	let model = {
    		name: "",
    		table: "",
    		url: "",
    		id: "id",
    		fields: [],
    		where: "",
    		sort: "",
    		filters: [],
    		data: [],
    		actions: "edit,view,print"
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
    		});
    	}

    	function inputField(event, model1, defaults) {
    		const name = event.target["name"];
    		const value = event.target["value"];

    		if (!changed[model1]) {
    			changed[model1] = {};
    		}

    		changed[model1][name] = value != "";

    		Object.keys(defaults).forEach(key => {
    			const defaultValue = defaults[key]
    			? new Function(...Object.keys(model1), "return `" + defaults[key] + "`")(...Object.values(model1))
    			: undefined;

    			if (!changed[model1][key] && defaultValue !== undefined) {
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
    			select: "",
    			create: "",
    			update: "",
    			showInList: true,
    			showInCreate: true,
    			showInUpdate: true
    		};

    		model.fields.push(field);
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

    	const writable_props = ['params'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Resource> was created with unknown prop '${key}'`);
    	});

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
    		model.url = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_2 = event => inputField(event, model, modelDefaults);

    	function input3_input_handler() {
    		model.id = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_3 = event => inputField(event, model, modelDefaults);
    	const click_handler = field => removeField(field);

    	function input0_input_handler_1(each_value_4, field_index_2) {
    		each_value_4[field_index_2].name = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_4 = (field, event) => inputField(event, field, fieldDefaults);

    	function input1_input_handler_1(each_value_4, field_index_2) {
    		each_value_4[field_index_2].label = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_5 = (field, event) => inputField(event, field, fieldDefaults);

    	function input2_input_handler_1(each_value_4, field_index_2) {
    		each_value_4[field_index_2].typeDB = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_6 = (field, event) => inputField(event, field, fieldDefaults);

    	function input3_input_handler_1(each_value_4, field_index_2) {
    		each_value_4[field_index_2].type = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_7 = (field, event) => inputField(event, field, fieldDefaults);

    	function input4_input_handler(each_value_4, field_index_2) {
    		each_value_4[field_index_2].select = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_8 = (field, event) => inputField(event, field, fieldDefaults);

    	function input5_input_handler(each_value_4, field_index_2) {
    		each_value_4[field_index_2].create = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_9 = (field, event) => inputField(event, field, fieldDefaults);

    	function input6_input_handler(each_value_4, field_index_2) {
    		each_value_4[field_index_2].update = this.value;
    		$$invalidate(0, model);
    	}

    	const input_handler_10 = (field, event) => inputField(event, field, fieldDefaults);

    	function input7_change_handler(each_value_4, field_index_2) {
    		each_value_4[field_index_2].showInList = this.checked;
    		$$invalidate(0, model);
    	}

    	function input8_change_handler(each_value_4, field_index_2) {
    		each_value_4[field_index_2].showInCreate = this.checked;
    		$$invalidate(0, model);
    	}

    	function input9_change_handler(each_value_4, field_index_2) {
    		each_value_4[field_index_2].showInUpdate = this.checked;
    		$$invalidate(0, model);
    	}

    	function textarea_input_handler() {
    		model.where = this.value;
    		$$invalidate(0, model);
    	}

    	function input4_input_handler_1() {
    		model.sort = this.value;
    		$$invalidate(0, model);
    	}

    	function input5_input_handler_1() {
    		model.actions = this.value;
    		$$invalidate(0, model);
    	}

    	const click_handler_1 = filter => removeField(filter);

    	function input0_input_handler_2(each_value_3, filter_index) {
    		each_value_3[filter_index].declaration = this.value;
    		$$invalidate(0, model);
    	}

    	function input1_input_handler_2(each_value_3, filter_index) {
    		each_value_3[filter_index].expression = this.value;
    		$$invalidate(0, model);
    	}

    	const click_handler_2 = row => removeData(row);

    	function input_input_handler(field, each_value, row_index) {
    		each_value[row_index][field.name] = this.value;
    		$$invalidate(0, model);
    	}

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(10, params = $$props.params);
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
    		loadModel,
    		inputField,
    		addField,
    		removeField,
    		createResource,
    		addData,
    		removeData,
    		addFilter
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(10, params = $$props.params);
    		if ('model' in $$props) $$invalidate(0, model = $$props.model);
    		if ('modelDefaults' in $$props) $$invalidate(1, modelDefaults = $$props.modelDefaults);
    		if ('fieldDefaults' in $$props) $$invalidate(2, fieldDefaults = $$props.fieldDefaults);
    		if ('changed' in $$props) changed = $$props.changed;
    		if ('response' in $$props) response = $$props.response;
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
    		params,
    		input0_input_handler,
    		input_handler,
    		input1_input_handler,
    		input_handler_1,
    		input2_input_handler,
    		input_handler_2,
    		input3_input_handler,
    		input_handler_3,
    		click_handler,
    		input0_input_handler_1,
    		input_handler_4,
    		input1_input_handler_1,
    		input_handler_5,
    		input2_input_handler_1,
    		input_handler_6,
    		input3_input_handler_1,
    		input_handler_7,
    		input4_input_handler,
    		input_handler_8,
    		input5_input_handler,
    		input_handler_9,
    		input6_input_handler,
    		input_handler_10,
    		input7_change_handler,
    		input8_change_handler,
    		input9_change_handler,
    		textarea_input_handler,
    		input4_input_handler_1,
    		input5_input_handler_1,
    		click_handler_1,
    		input0_input_handler_2,
    		input1_input_handler_2,
    		click_handler_2,
    		input_input_handler
    	];
    }

    class Resource extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { params: 10 }, null, [-1, -1, -1]);

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

    /* src/devtools/Panel.svelte generated by Svelte v3.42.1 */
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
    	validate_store(location, 'location');
    	component_subscribe($$self, location, $$value => $$invalidate(1, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Panel', slots, []);

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Panel> was created with unknown prop '${key}'`);
    	});

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
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
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
