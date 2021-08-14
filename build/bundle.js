
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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

    /* src/App.svelte generated by Svelte v3.42.1 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let header;
    	let t1;
    	let aside_1;
    	let button0;
    	let i0;
    	let t2;
    	let button1;
    	let i1;
    	let t3;
    	let figure;
    	let img;
    	let img_src_value;
    	let t4;
    	let figcaption;
    	let t6;
    	let a0;
    	let i2;
    	let t7;
    	let span0;
    	let t9;
    	let a1;
    	let i3;
    	let t10;
    	let span1;
    	let t12;
    	let a2;
    	let i4;
    	let t13;
    	let span2;
    	let t15;
    	let footer;
    	let span3;
    	let t17;
    	let main;
    	let h1;
    	let t19;
    	let form;
    	let h2;
    	let t21;
    	let nav0;
    	let button2;
    	let t22;
    	let br0;
    	let t23;
    	let i5;
    	let t24;
    	let mark0;
    	let t26;
    	let i6;
    	let t27;
    	let button3;
    	let t28;
    	let br1;
    	let t29;
    	let i7;
    	let t30;
    	let mark1;
    	let t32;
    	let i8;
    	let t33;
    	let button4;
    	let t34;
    	let br2;
    	let t35;
    	let i9;
    	let t36;
    	let mark2;
    	let t38;
    	let i10;
    	let t39;
    	let button5;
    	let t40;
    	let br3;
    	let t41;
    	let i11;
    	let t42;
    	let mark3;
    	let t44;
    	let i12;
    	let t45;
    	let button6;
    	let t46;
    	let br4;
    	let t47;
    	let i13;
    	let t48;
    	let mark4;
    	let t50;
    	let fieldset0;
    	let legend0;
    	let i14;
    	let t51;
    	let t52;
    	let input0;
    	let t53;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let t65;
    	let input1;
    	let t66;
    	let select1;
    	let option11;
    	let option12;
    	let option13;
    	let option14;
    	let option15;
    	let option16;
    	let option17;
    	let option18;
    	let option19;
    	let option20;
    	let option21;
    	let t78;
    	let fieldset1;
    	let legend1;
    	let i15;
    	let t79;
    	let t80;
    	let input2;
    	let t81;
    	let input3;
    	let t82;
    	let button7;
    	let t84;
    	let label0;
    	let input4;
    	let t85;
    	let t86;
    	let label1;
    	let input5;
    	let t87;
    	let input6;
    	let t88;
    	let t89;
    	let nav1;
    	let label2;
    	let input7;
    	let t90;
    	let t91;
    	let label3;
    	let input8;
    	let t92;
    	let t93;
    	let label4;
    	let input9;
    	let t94;
    	let t95;
    	let label5;
    	let input10;
    	let t96;
    	let t97;
    	let label6;
    	let input11;
    	let t98;
    	let t99;
    	let nav2;
    	let button8;
    	let t101;
    	let button9;
    	let t103;
    	let button10;
    	let t105;
    	let button11;
    	let t107;
    	let button12;
    	let t109;
    	let textarea;
    	let t110;
    	let div0;
    	let label7;
    	let t112;
    	let select2;
    	let option22;
    	let option23;
    	let option24;
    	let option25;
    	let option26;
    	let t118;
    	let div1;
    	let label8;
    	let t120;
    	let input12;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			header.textContent = "Talento Humano";
    			t1 = space();
    			aside_1 = element("aside");
    			button0 = element("button");
    			i0 = element("i");
    			t2 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t3 = space();
    			figure = element("figure");
    			img = element("img");
    			t4 = space();
    			figcaption = element("figcaption");
    			figcaption.textContent = "@username";
    			t6 = space();
    			a0 = element("a");
    			i2 = element("i");
    			t7 = space();
    			span0 = element("span");
    			span0.textContent = "Home";
    			t9 = space();
    			a1 = element("a");
    			i3 = element("i");
    			t10 = space();
    			span1 = element("span");
    			span1.textContent = "Users";
    			t12 = space();
    			a2 = element("a");
    			i4 = element("i");
    			t13 = space();
    			span2 = element("span");
    			span2.textContent = "About";
    			t15 = space();
    			footer = element("footer");
    			span3 = element("span");
    			span3.textContent = "© 2021 phantom";
    			t17 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Busqueda de candidatos";
    			t19 = space();
    			form = element("form");
    			h2 = element("h2");
    			h2.textContent = "Buttons";
    			t21 = space();
    			nav0 = element("nav");
    			button2 = element("button");
    			t22 = text("Perfiles");
    			br0 = element("br");
    			t23 = space();
    			i5 = element("i");
    			t24 = space();
    			mark0 = element("mark");
    			mark0.textContent = "5";
    			t26 = space();
    			i6 = element("i");
    			t27 = space();
    			button3 = element("button");
    			t28 = text("Fuentes de reclutamiento");
    			br1 = element("br");
    			t29 = space();
    			i7 = element("i");
    			t30 = space();
    			mark1 = element("mark");
    			mark1.textContent = "2";
    			t32 = space();
    			i8 = element("i");
    			t33 = space();
    			button4 = element("button");
    			t34 = text("Potenciales");
    			br2 = element("br");
    			t35 = space();
    			i9 = element("i");
    			t36 = space();
    			mark2 = element("mark");
    			mark2.textContent = "14";
    			t38 = space();
    			i10 = element("i");
    			t39 = space();
    			button5 = element("button");
    			t40 = text("Contactos");
    			br3 = element("br");
    			t41 = space();
    			i11 = element("i");
    			t42 = space();
    			mark3 = element("mark");
    			mark3.textContent = "8";
    			t44 = space();
    			i12 = element("i");
    			t45 = space();
    			button6 = element("button");
    			t46 = text("Evaluación");
    			br4 = element("br");
    			t47 = space();
    			i13 = element("i");
    			t48 = space();
    			mark4 = element("mark");
    			mark4.textContent = "5";
    			t50 = space();
    			fieldset0 = element("fieldset");
    			legend0 = element("legend");
    			i14 = element("i");
    			t51 = text("\n\t\t\t\tBuscar");
    			t52 = space();
    			input0 = element("input");
    			t53 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Seleccione un país";
    			option1 = element("option");
    			option1.textContent = "Argentina";
    			option2 = element("option");
    			option2.textContent = "Bolivia";
    			option3 = element("option");
    			option3.textContent = "Brasil";
    			option4 = element("option");
    			option4.textContent = "Chile";
    			option5 = element("option");
    			option5.textContent = "Colombia";
    			option6 = element("option");
    			option6.textContent = "Ecuador";
    			option7 = element("option");
    			option7.textContent = "Perú";
    			option8 = element("option");
    			option8.textContent = "Paraguay";
    			option9 = element("option");
    			option9.textContent = "Uruguay";
    			option10 = element("option");
    			option10.textContent = "Venezuela";
    			t65 = space();
    			input1 = element("input");
    			t66 = space();
    			select1 = element("select");
    			option11 = element("option");
    			option11.textContent = "Seleccione un país";
    			option12 = element("option");
    			option12.textContent = "Argentina";
    			option13 = element("option");
    			option13.textContent = "Bolivia";
    			option14 = element("option");
    			option14.textContent = "Brasil";
    			option15 = element("option");
    			option15.textContent = "Chile";
    			option16 = element("option");
    			option16.textContent = "Colombia";
    			option17 = element("option");
    			option17.textContent = "Ecuador";
    			option18 = element("option");
    			option18.textContent = "Perú";
    			option19 = element("option");
    			option19.textContent = "Paraguay";
    			option20 = element("option");
    			option20.textContent = "Uruguay";
    			option21 = element("option");
    			option21.textContent = "Venezuela";
    			t78 = space();
    			fieldset1 = element("fieldset");
    			legend1 = element("legend");
    			i15 = element("i");
    			t79 = text("\n\t\t\t\tLogin");
    			t80 = space();
    			input2 = element("input");
    			t81 = space();
    			input3 = element("input");
    			t82 = space();
    			button7 = element("button");
    			button7.textContent = "Iniciar sesión";
    			t84 = space();
    			label0 = element("label");
    			input4 = element("input");
    			t85 = text("\n\t\t\t\tRecordarme");
    			t86 = space();
    			label1 = element("label");
    			input5 = element("input");
    			t87 = space();
    			input6 = element("input");
    			t88 = text("\n\t\t\t\tRecordarme (Disabled)");
    			t89 = space();
    			nav1 = element("nav");
    			label2 = element("label");
    			input7 = element("input");
    			t90 = text("\n\t\t\t\t\tRojo");
    			t91 = space();
    			label3 = element("label");
    			input8 = element("input");
    			t92 = text("\n\t\t\t\t\tVerde");
    			t93 = space();
    			label4 = element("label");
    			input9 = element("input");
    			t94 = text("\n\t\t\t\t\tAzul");
    			t95 = space();
    			label5 = element("label");
    			input10 = element("input");
    			t96 = text("\n\t\t\t\t\tAmarillo");
    			t97 = space();
    			label6 = element("label");
    			input11 = element("input");
    			t98 = text("\n\t\t\t\t\tNaranja");
    			t99 = space();
    			nav2 = element("nav");
    			button8 = element("button");
    			button8.textContent = "default";
    			t101 = space();
    			button9 = element("button");
    			button9.textContent = "button";
    			t103 = space();
    			button10 = element("button");
    			button10.textContent = "reset";
    			t105 = space();
    			button11 = element("button");
    			button11.textContent = "submit";
    			t107 = space();
    			button12 = element("button");
    			button12.textContent = "submit";
    			t109 = space();
    			textarea = element("textarea");
    			t110 = space();
    			div0 = element("div");
    			label7 = element("label");
    			label7.textContent = "Example multiple select";
    			t112 = space();
    			select2 = element("select");
    			option22 = element("option");
    			option22.textContent = "1";
    			option23 = element("option");
    			option23.textContent = "2";
    			option24 = element("option");
    			option24.textContent = "3";
    			option25 = element("option");
    			option25.textContent = "4";
    			option26 = element("option");
    			option26.textContent = "5";
    			t118 = space();
    			div1 = element("div");
    			label8 = element("label");
    			label8.textContent = "Example file input";
    			t120 = space();
    			input12 = element("input");
    			add_location(header, file, 22, 0, 531);
    			attr_dev(i0, "class", "fas fa-chevron-circle-left");
    			add_location(i0, file, 25, 54, 640);
    			attr_dev(button0, "id", "hide-sidebar");
    			add_location(button0, file, 25, 1, 587);
    			attr_dev(i1, "class", "fas fa-chevron-circle-right");
    			add_location(i1, file, 26, 52, 744);
    			attr_dev(button1, "id", "show-sidebar");
    			add_location(button1, file, 26, 1, 693);
    			if (!src_url_equal(img.src, img_src_value = /*avatar*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "user");
    			add_location(img, file, 28, 2, 809);
    			add_location(figcaption, file, 29, 2, 841);
    			add_location(figure, file, 27, 1, 798);
    			attr_dev(i2, "class", "fas fa-home");
    			add_location(i2, file, 33, 33, 927);
    			add_location(span0, file, 33, 61, 955);
    			attr_dev(a0, "class", "active");
    			attr_dev(a0, "href", "#/home");
    			add_location(a0, file, 33, 1, 895);
    			attr_dev(i3, "class", "fas fa-users");
    			add_location(i3, file, 34, 19, 996);
    			add_location(span1, file, 34, 48, 1025);
    			attr_dev(a1, "href", "#/users");
    			add_location(a1, file, 34, 1, 978);
    			attr_dev(i4, "class", "fas fa-question-circle");
    			add_location(i4, file, 35, 19, 1067);
    			add_location(span2, file, 35, 58, 1106);
    			attr_dev(a2, "href", "#/about");
    			add_location(a2, file, 35, 1, 1049);
    			add_location(span3, file, 37, 2, 1141);
    			add_location(footer, file, 36, 1, 1130);
    			attr_dev(aside_1, "class", /*aside*/ ctx[0]);
    			add_location(aside_1, file, 24, 0, 564);
    			add_location(h1, file, 42, 1, 1198);
    			add_location(h2, file, 44, 2, 1240);
    			add_location(br0, file, 47, 12, 1289);
    			attr_dev(i5, "class", "fas fa-id-card-alt");
    			add_location(i5, file, 48, 4, 1298);
    			add_location(mark0, file, 49, 4, 1337);
    			add_location(button2, file, 46, 3, 1268);
    			attr_dev(i6, "class", "fas fa-arrow-right");
    			add_location(i6, file, 51, 3, 1368);
    			add_location(br1, file, 53, 28, 1457);
    			attr_dev(i7, "class", "fas fa-globe");
    			add_location(i7, file, 54, 4, 1466);
    			add_location(mark1, file, 55, 4, 1499);
    			attr_dev(button3, "type", "button");
    			add_location(button3, file, 52, 3, 1406);
    			attr_dev(i8, "class", "fas fa-arrow-right");
    			add_location(i8, file, 57, 3, 1530);
    			add_location(br2, file, 59, 15, 1605);
    			attr_dev(i9, "class", "fas fa-users");
    			add_location(i9, file, 60, 4, 1614);
    			add_location(mark2, file, 61, 4, 1647);
    			attr_dev(button4, "type", "reset");
    			add_location(button4, file, 58, 3, 1568);
    			attr_dev(i10, "class", "fas fa-arrow-right");
    			add_location(i10, file, 63, 3, 1679);
    			add_location(br3, file, 65, 13, 1753);
    			attr_dev(i11, "class", "fas fa-address-card");
    			add_location(i11, file, 66, 4, 1762);
    			add_location(mark3, file, 67, 4, 1802);
    			attr_dev(button5, "type", "submit");
    			add_location(button5, file, 64, 3, 1717);
    			attr_dev(i12, "class", "fas fa-arrow-right");
    			add_location(i12, file, 69, 3, 1833);
    			add_location(br4, file, 71, 14, 1907);
    			attr_dev(i13, "class", "fas fa-check-circle");
    			add_location(i13, file, 72, 4, 1916);
    			add_location(mark4, file, 73, 4, 1956);
    			attr_dev(button6, "type", "reset");
    			add_location(button6, file, 70, 3, 1871);
    			add_location(nav0, file, 45, 2, 1259);
    			attr_dev(i14, "class", "fas fa-search");
    			add_location(i14, file, 78, 4, 2022);
    			add_location(legend0, file, 77, 3, 2009);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "size", "47");
    			attr_dev(input0, "placeholder", "Buscar por nombre, apellido, cédula, etc.");
    			add_location(input0, file, 81, 3, 2079);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file, 83, 4, 2196);
    			option1.__value = "Argentina";
    			option1.value = option1.__value;
    			add_location(option1, file, 84, 4, 2245);
    			option2.__value = "Bolivia";
    			option2.value = option2.__value;
    			add_location(option2, file, 85, 4, 2294);
    			option3.__value = "Brasil";
    			option3.value = option3.__value;
    			add_location(option3, file, 86, 4, 2339);
    			option4.__value = "Chile";
    			option4.value = option4.__value;
    			add_location(option4, file, 87, 4, 2382);
    			option5.__value = "Colombia";
    			option5.value = option5.__value;
    			add_location(option5, file, 88, 4, 2423);
    			option6.__value = "Ecuador";
    			option6.value = option6.__value;
    			add_location(option6, file, 89, 4, 2470);
    			option7.__value = "Perú";
    			option7.value = option7.__value;
    			add_location(option7, file, 90, 4, 2515);
    			option8.__value = "Paraguay";
    			option8.value = option8.__value;
    			add_location(option8, file, 91, 4, 2554);
    			option9.__value = "Uruguay";
    			option9.value = option9.__value;
    			add_location(option9, file, 92, 4, 2601);
    			option10.__value = "Venezuela";
    			option10.value = option10.__value;
    			add_location(option10, file, 93, 4, 2646);
    			attr_dev(select0, "name", "country");
    			add_location(select0, file, 82, 3, 2168);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "disabled");
    			input1.disabled = true;
    			add_location(input1, file, 95, 3, 2707);
    			option11.__value = "";
    			option11.value = option11.__value;
    			add_location(option11, file, 97, 4, 2799);
    			option12.__value = "Argentina";
    			option12.value = option12.__value;
    			add_location(option12, file, 98, 4, 2848);
    			option13.selected = true;
    			option13.__value = "Bolivia";
    			option13.value = option13.__value;
    			add_location(option13, file, 99, 4, 2897);
    			option14.__value = "Brasil";
    			option14.value = option14.__value;
    			add_location(option14, file, 100, 4, 2951);
    			option15.__value = "Chile";
    			option15.value = option15.__value;
    			add_location(option15, file, 101, 4, 2994);
    			option16.__value = "Colombia";
    			option16.value = option16.__value;
    			add_location(option16, file, 102, 4, 3035);
    			option17.__value = "Ecuador";
    			option17.value = option17.__value;
    			add_location(option17, file, 103, 4, 3082);
    			option18.__value = "Perú";
    			option18.value = option18.__value;
    			add_location(option18, file, 104, 4, 3127);
    			option19.__value = "Paraguay";
    			option19.value = option19.__value;
    			add_location(option19, file, 105, 4, 3166);
    			option20.__value = "Uruguay";
    			option20.value = option20.__value;
    			add_location(option20, file, 106, 4, 3213);
    			option21.__value = "Venezuela";
    			option21.value = option21.__value;
    			add_location(option21, file, 107, 4, 3258);
    			attr_dev(select1, "name", "country");
    			select1.disabled = true;
    			add_location(select1, file, 96, 3, 2762);
    			add_location(fieldset0, file, 76, 2, 1995);
    			attr_dev(i15, "class", "fas fa-lock");
    			add_location(i15, file, 113, 4, 3381);
    			add_location(legend1, file, 112, 3, 3368);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "placeholder", "Correo electrónico");
    			add_location(input2, file, 116, 3, 3435);
    			attr_dev(input3, "type", "password");
    			attr_dev(input3, "placeholder", "Contraseña");
    			add_location(input3, file, 117, 3, 3492);
    			attr_dev(button7, "type", "submit");
    			add_location(button7, file, 118, 3, 3544);
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "name", "remember");
    			attr_dev(input4, "id", "remember");
    			add_location(input4, file, 122, 4, 3614);
    			add_location(label0, file, 121, 3, 3602);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "name", "remember");
    			input5.disabled = true;
    			add_location(input5, file, 126, 4, 3710);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "name", "remember");
    			input6.disabled = true;
    			input6.checked = true;
    			add_location(input6, file, 127, 4, 3763);
    			add_location(label1, file, 125, 3, 3698);
    			attr_dev(input7, "type", "radio");
    			attr_dev(input7, "name", "color");
    			input7.value = "red";
    			add_location(input7, file, 133, 5, 3910);
    			add_location(label2, file, 132, 4, 3897);
    			attr_dev(input8, "type", "radio");
    			attr_dev(input8, "name", "color");
    			input8.value = "green";
    			add_location(input8, file, 137, 5, 3996);
    			add_location(label3, file, 136, 4, 3983);
    			attr_dev(input9, "type", "radio");
    			attr_dev(input9, "name", "color");
    			input9.value = "blue";
    			add_location(input9, file, 141, 5, 4085);
    			add_location(label4, file, 140, 4, 4072);
    			attr_dev(input10, "type", "radio");
    			attr_dev(input10, "name", "color");
    			input10.value = "yellow";
    			add_location(input10, file, 145, 5, 4172);
    			add_location(label5, file, 144, 4, 4159);
    			attr_dev(input11, "type", "radio");
    			attr_dev(input11, "name", "color");
    			input11.value = "orange";
    			input11.disabled = true;
    			input11.checked = true;
    			add_location(input11, file, 149, 5, 4265);
    			add_location(label6, file, 148, 4, 4252);
    			add_location(nav1, file, 131, 3, 3887);
    			add_location(fieldset1, file, 111, 2, 3354);
    			add_location(button8, file, 156, 3, 4393);
    			attr_dev(button9, "type", "button");
    			add_location(button9, file, 159, 3, 4430);
    			attr_dev(button10, "type", "reset");
    			add_location(button10, file, 162, 3, 4480);
    			attr_dev(button11, "type", "submit");
    			add_location(button11, file, 165, 3, 4528);
    			attr_dev(button12, "type", "submit");
    			button12.disabled = true;
    			add_location(button12, file, 168, 3, 4578);
    			add_location(nav2, file, 155, 2, 4384);
    			add_location(textarea, file, 172, 2, 4645);
    			attr_dev(label7, "for", "exampleFormControlSelect2");
    			add_location(label7, file, 174, 3, 4678);
    			option22.__value = "1";
    			option22.value = option22.__value;
    			add_location(option22, file, 176, 4, 4814);
    			option23.__value = "2";
    			option23.value = option23.__value;
    			add_location(option23, file, 177, 4, 4837);
    			option24.__value = "3";
    			option24.value = option24.__value;
    			add_location(option24, file, 178, 4, 4860);
    			option25.__value = "4";
    			option25.value = option25.__value;
    			add_location(option25, file, 179, 4, 4883);
    			option26.__value = "5";
    			option26.value = option26.__value;
    			add_location(option26, file, 180, 4, 4906);
    			select2.multiple = true;
    			attr_dev(select2, "size", "5");
    			attr_dev(select2, "id", "exampleFormControlSelect2");
    			add_location(select2, file, 175, 3, 4752);
    			add_location(div0, file, 173, 2, 4669);
    			attr_dev(label8, "for", "exampleFormControlFile1");
    			add_location(label8, file, 184, 3, 4958);
    			attr_dev(input12, "type", "file");
    			attr_dev(input12, "id", "exampleFormControlFile1");
    			add_location(input12, file, 185, 3, 5025);
    			add_location(div1, file, 183, 2, 4949);
    			add_location(form, file, 43, 1, 1231);
    			add_location(main, file, 41, 0, 1190);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, aside_1, anchor);
    			append_dev(aside_1, button0);
    			append_dev(button0, i0);
    			append_dev(aside_1, t2);
    			append_dev(aside_1, button1);
    			append_dev(button1, i1);
    			append_dev(aside_1, t3);
    			append_dev(aside_1, figure);
    			append_dev(figure, img);
    			append_dev(figure, t4);
    			append_dev(figure, figcaption);
    			append_dev(aside_1, t6);
    			append_dev(aside_1, a0);
    			append_dev(a0, i2);
    			append_dev(a0, t7);
    			append_dev(a0, span0);
    			append_dev(aside_1, t9);
    			append_dev(aside_1, a1);
    			append_dev(a1, i3);
    			append_dev(a1, t10);
    			append_dev(a1, span1);
    			append_dev(aside_1, t12);
    			append_dev(aside_1, a2);
    			append_dev(a2, i4);
    			append_dev(a2, t13);
    			append_dev(a2, span2);
    			append_dev(aside_1, t15);
    			append_dev(aside_1, footer);
    			append_dev(footer, span3);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t19);
    			append_dev(main, form);
    			append_dev(form, h2);
    			append_dev(form, t21);
    			append_dev(form, nav0);
    			append_dev(nav0, button2);
    			append_dev(button2, t22);
    			append_dev(button2, br0);
    			append_dev(button2, t23);
    			append_dev(button2, i5);
    			append_dev(button2, t24);
    			append_dev(button2, mark0);
    			append_dev(nav0, t26);
    			append_dev(nav0, i6);
    			append_dev(nav0, t27);
    			append_dev(nav0, button3);
    			append_dev(button3, t28);
    			append_dev(button3, br1);
    			append_dev(button3, t29);
    			append_dev(button3, i7);
    			append_dev(button3, t30);
    			append_dev(button3, mark1);
    			append_dev(nav0, t32);
    			append_dev(nav0, i8);
    			append_dev(nav0, t33);
    			append_dev(nav0, button4);
    			append_dev(button4, t34);
    			append_dev(button4, br2);
    			append_dev(button4, t35);
    			append_dev(button4, i9);
    			append_dev(button4, t36);
    			append_dev(button4, mark2);
    			append_dev(nav0, t38);
    			append_dev(nav0, i10);
    			append_dev(nav0, t39);
    			append_dev(nav0, button5);
    			append_dev(button5, t40);
    			append_dev(button5, br3);
    			append_dev(button5, t41);
    			append_dev(button5, i11);
    			append_dev(button5, t42);
    			append_dev(button5, mark3);
    			append_dev(nav0, t44);
    			append_dev(nav0, i12);
    			append_dev(nav0, t45);
    			append_dev(nav0, button6);
    			append_dev(button6, t46);
    			append_dev(button6, br4);
    			append_dev(button6, t47);
    			append_dev(button6, i13);
    			append_dev(button6, t48);
    			append_dev(button6, mark4);
    			append_dev(form, t50);
    			append_dev(form, fieldset0);
    			append_dev(fieldset0, legend0);
    			append_dev(legend0, i14);
    			append_dev(legend0, t51);
    			append_dev(fieldset0, t52);
    			append_dev(fieldset0, input0);
    			append_dev(fieldset0, t53);
    			append_dev(fieldset0, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			append_dev(select0, option5);
    			append_dev(select0, option6);
    			append_dev(select0, option7);
    			append_dev(select0, option8);
    			append_dev(select0, option9);
    			append_dev(select0, option10);
    			append_dev(fieldset0, t65);
    			append_dev(fieldset0, input1);
    			append_dev(fieldset0, t66);
    			append_dev(fieldset0, select1);
    			append_dev(select1, option11);
    			append_dev(select1, option12);
    			append_dev(select1, option13);
    			append_dev(select1, option14);
    			append_dev(select1, option15);
    			append_dev(select1, option16);
    			append_dev(select1, option17);
    			append_dev(select1, option18);
    			append_dev(select1, option19);
    			append_dev(select1, option20);
    			append_dev(select1, option21);
    			append_dev(form, t78);
    			append_dev(form, fieldset1);
    			append_dev(fieldset1, legend1);
    			append_dev(legend1, i15);
    			append_dev(legend1, t79);
    			append_dev(fieldset1, t80);
    			append_dev(fieldset1, input2);
    			append_dev(fieldset1, t81);
    			append_dev(fieldset1, input3);
    			append_dev(fieldset1, t82);
    			append_dev(fieldset1, button7);
    			append_dev(fieldset1, t84);
    			append_dev(fieldset1, label0);
    			append_dev(label0, input4);
    			append_dev(label0, t85);
    			append_dev(fieldset1, t86);
    			append_dev(fieldset1, label1);
    			append_dev(label1, input5);
    			append_dev(label1, t87);
    			append_dev(label1, input6);
    			append_dev(label1, t88);
    			append_dev(fieldset1, t89);
    			append_dev(fieldset1, nav1);
    			append_dev(nav1, label2);
    			append_dev(label2, input7);
    			append_dev(label2, t90);
    			append_dev(nav1, t91);
    			append_dev(nav1, label3);
    			append_dev(label3, input8);
    			append_dev(label3, t92);
    			append_dev(nav1, t93);
    			append_dev(nav1, label4);
    			append_dev(label4, input9);
    			append_dev(label4, t94);
    			append_dev(nav1, t95);
    			append_dev(nav1, label5);
    			append_dev(label5, input10);
    			append_dev(label5, t96);
    			append_dev(nav1, t97);
    			append_dev(nav1, label6);
    			append_dev(label6, input11);
    			append_dev(label6, t98);
    			append_dev(form, t99);
    			append_dev(form, nav2);
    			append_dev(nav2, button8);
    			append_dev(nav2, t101);
    			append_dev(nav2, button9);
    			append_dev(nav2, t103);
    			append_dev(nav2, button10);
    			append_dev(nav2, t105);
    			append_dev(nav2, button11);
    			append_dev(nav2, t107);
    			append_dev(nav2, button12);
    			append_dev(form, t109);
    			append_dev(form, textarea);
    			append_dev(form, t110);
    			append_dev(form, div0);
    			append_dev(div0, label7);
    			append_dev(div0, t112);
    			append_dev(div0, select2);
    			append_dev(select2, option22);
    			append_dev(select2, option23);
    			append_dev(select2, option24);
    			append_dev(select2, option25);
    			append_dev(select2, option26);
    			append_dev(form, t118);
    			append_dev(form, div1);
    			append_dev(div1, label8);
    			append_dev(div1, t120);
    			append_dev(div1, input12);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*collapseSidebar*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*expandSidebar*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*aside*/ 1) {
    				attr_dev(aside_1, "class", /*aside*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(aside_1);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let aside = "expanded";

    	// avatar aleatorio
    	let avatar = "https://i.pravatar.cc/300";

    	// colapsa el menu lateral
    	function collapseSidebar() {
    		$$invalidate(0, aside = "collapsed");
    	}

    	// expande el menu lateral
    	function expandSidebar() {
    		$$invalidate(0, aside = "expanded");
    	}

    	onMount(() => {
    		// focus first visible input or select in main content
    		const input = document.querySelector('main input, main select');

    		if (input) {
    			input.focus();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		aside,
    		avatar,
    		collapseSidebar,
    		expandSidebar
    	});

    	$$self.$inject_state = $$props => {
    		if ('aside' in $$props) $$invalidate(0, aside = $$props.aside);
    		if ('avatar' in $$props) $$invalidate(1, avatar = $$props.avatar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [aside, avatar, collapseSidebar, expandSidebar];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
