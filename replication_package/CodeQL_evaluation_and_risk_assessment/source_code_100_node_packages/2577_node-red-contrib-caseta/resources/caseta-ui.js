/*
Apache-2.0

Copyright (c) 2024  Vahdettin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/
let casIsLoaded = false;

class CASUI {


    constructor(base, bridge = null) {

        this.API_BASE = "caseta/data/";
        this.debug = false;
        this.base = base;
        this.bridge = bridge;

        this.device_list = {};
        this.scene_list = {};
        this.f_prepend_area = false;
        this.f_append_id = false;
        this.opts = {};
        this.library = {};
        this.refresher = {};
        if (this.bridge) {

            this.device_list = this.bridge.device_list
            this.scene_list = this.bridge.scene_list
            this.f_prepend_area = this.bridge.f_prepend_area || false;
            this.f_append_id = this.bridge.f_append_id || false;
        }

        this.fields = {
            bridge: $("#node-input-bridge"),
            bridge_name: $("#node-config-input-bridge_name"),
            device: $("#node-input-device"),
            action: $("#node-input-action"),
            hold_time: $("#node-input-hold_time"),
            event: $("#node-input-event"),
            int_report: $("#node-config-input-int_report"),
            bridge_ip_address: $("#node-config-input-bridge_ip_address"),
            param_1: $("#node-input-param_1"),
            param_2: $("#node-input-param_2"),
            sid: ".node-input-device-sid-value",
            name: ".node-input-device-name-value",
            label: ".node-input-device-label-value",
            area: ".node-input-device-area-value",
            type: ".node-input-device-map-value",
            device_help: $("#device-help"),
            row_param_1: $("#row-param_1"),
            row_param_2: $("#row-param_2"),
            device_list: $("#device_list"),
            device_list_container: $(".node-input-devices-container-row"),
            scene_list: $("#scene_list"),
            scene_list_container: $(".node-input-scenes-container-row"),
            row_event: $("#row-event"),
            row_hold_time: $("#row-hold_time"),
            import_report: $("#import-report"),
            deps: $("#form-dependencies"),

            l_device_sid: "node-input-device-sid-value",
            l_device_name: "node-input-device-name-value",
            l_device_label: "node-input-device-label-value",
            l_device_hash: "node-input-device-hash-value",
            l_device_area: "node-input-device-area-value",
            l_device_type: "node-input-device-type-value",

            l_scene_sid: "node-input-scene-sid-value",
            l_scene_name: "node-input-scene-name-value",
            l_scene_label: "node-input-scene-label-value",
            l_scene_hash: "node-input-scene-hash-value",


        };
        this.inpListStyles = {
            device: {
                sid: "margin-left:5px; width:calc(7% - 6px);",
                label: "margin-left:5px; width:calc(31% - 20px);",
                type: "margin-left:5px; width:calc(31% - 20px);",
                area: "margin-left:5px; width:calc(31% - 20px);",
                help_link: "margin-left:5px; width:calc(7% - 6px);",
                name: "visibility: hidden;"
            },
            scene: {
                sid: "margin-left:5px; width:calc(7% - 6px);",
                label: "margin-left:5px; width:calc(31% - 20px);",
                name: "visibility: hidden;",
                hash: "visibility: hidden;"

            }
        }

        this.typeFields = {
            device: $("#node-input-type_device"),
            event: $("#node-input-type_event"),
            action: $("#node-input-type_action"),
            command: $("#node-input-type_command"),
            int_report: $("#type_int_report"),
            param_1: $("#node-input-type_param_1"),
            param_2: $("#node-input-type_param_2"),
            hold_time: $("#node-input-type_hold_time")
        };
        this.validators = {
            "ip_address": function (value) {
                let re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                if (!value.match(re)) {

                    return false;
                }
                return true;
            },
            "param_1": function (value) {
                if (parseInt(value) > -1 && parseInt(value) < 101) {

                    return true;
                }
                return false;
            },
            "param_2": function (value) {
                if (parseInt(value) && parseInt(value) > 0 && parseInt(value) < 91) {
                    return true;
                }
                return false;
            },
            "hold_time": function (value) {
                if ((parseInt(value) && parseInt(value) > -1 && parseInt(value) < 12) || value === "0") {
                    return true;
                }
                return false;
            },
            "action": function (value) {
                if (value) {
                    return true;
                }
                return false;
            },
            "event": function (value) {
                if (value) {
                    return true;
                }
                return false;
            }

        }

        this.selectors = {
            device: []
        }

        return this;

    }

    inpListStyle(type, name) {
        return this.inpListStyles[type][name];
    }

    inpListClass(type, name) {
        return ("node-input-" + type + "-" + name + "-value");

    }

    get Device() {
        return this.device_list;
    }

    get Scene() {
        return this.scene_list;
    }

    get Fields() {
        return this.fields;
    }

    get TypeFields() {
        return this.typeFields;
    }

    get Library() {
        return this.library;
    }

    get Selectors() {
        return this.selectors;
    }

    get Validators() {
        return this.validators;
    }


    /**
     * Load data and initialize UI elements
     * @param {function} done - Callback function
     */
    load(done) {
        let ui = this;

        ui.d("load-Base: " + ui.base);
        try {
            ui.getData('library', {}, function (err, library) {
                if (library && JSON.parse(library)) {
                    ui.library = JSON.parse(library);

                    for (const t in ui.Library) {
                        if (ui.Library.hasOwnProperty(t)) {
                            let item = ui.Library[t];
                            ui.library[t].Selectors = {
                                action_map: [],
                                event_map: [],
                                param_map: [],
                                query_map: []
                            };


                            if (item.action_map) {

                                if (t === "smartbridge" && ui.scene_list) {
                                    for (const s in ui.scene_list) {

                                        ui.library[t].Selectors.action_map.push({
                                            value: ui.scene_list[s].sid,
                                            label: "Set " + ui.scene_list[s].label
                                        })
                                    }
                                } else {

                                    for (const a in item.action_map) {
                                        ui.library[t].Selectors.action_map.push({
                                            value: a,
                                            label: item.action_map[a]
                                        })
                                    }
                                }
                            }
                            if (item.event_map) {

                                for (const e in item.event_map) {
                                    ui.library[t].Selectors.event_map.push({
                                        value: e,
                                        label: item.event_map[e]
                                    })
                                }
                            }
                            if (item.param_map) {

                                for (const q in item.param_map) {
                                    ui.library[t].Selectors.param_map.push({

                                        value: q,
                                        label: item.param_map[q]
                                    })
                                }
                            }
                            if (item.query_map) {

                                for (const q in item.query_map) {
                                    ui.library[t].Selectors.query_map.push({

                                        value: q,
                                        label: item.query_map[q]
                                    })
                                }
                            }

                        }


                    }
                    ui.d("load-Base: " + ui.base + " Result: success.");
                    done(null, true);
                } else {
                    RED.notify("UI initialisation failed. Missing data.", 'warn');
                    done(true);
                }

            })
        } catch (err) {
            RED.notify("UI initialisation failed. General error.", 'warn');
            done(true);
        }


    }

    /**
     * Generate device dropdown selectors
     * @param {function} done - Callback function
     */
    genDeviceSelectors(done) {
        const ui = this;
        let selectors = [];
        const devices = ui.Device;
        try {
            for (const d in ui.Device) {

                if (ui.Device.hasOwnProperty(d) && ui.Device[d].type) {
                    let device = devices[d];
                    let label = device.label + " - " + device.area;
                    if (device.sid === "1") label = device.label;
                    try {
                        if (ui.Library[device.type].base.indexOf(ui.base) > -1) {
                            if (ui.f_append_id) {
                                label = label + " [" + device.sid + "] ";
                            }
                            selectors.push({
                                value: d,
                                label: label
                            })
                        }
                    } catch (err) {
                        console.warn(err)
                    }
                }
            }

            selectors.sort((a, b) => (a.label > b.label) ? 1 : -1);
            done(null, selectors);
        } catch (err) {
            console.warn(err);
            RED.notify("UI initialisation failed. General error.", 'warn');
            done("genDeviceSelectors");
        }


    }

    deviceClass(device) {
        const ui = this;

        if (ui.Device[device.value].type === "smartbridge") {
            return "smartbridge";
        } else if (ui.Device[device.value].type.indexOf("pico_") === 0) {
            return "remote";
        } else if (ui.Device[device.value].type.indexOf("dimmer_") === 0) {
            return "dimmer";
        } else if (ui.Device[device.value].type.indexOf("switch)") === 0) {
            return "switch";
        }
    }

    /**
     * Initial draw function
     * @param {function} done - Callback function
     */
    draw(done) {
        const ui = this;
        try {
            if (Object.keys(ui.Device).length < 1) {
                done("No devices yet.");
            } else {
                ui.drawDevices(function (err, drawn) {
                    if (drawn) {
                        done(null, true);
                    } else {
                        console.warn(err || {});
                        done("draw")
                    }

                });
            }
        } catch (err) {
            console.warn(err);
            done("draw", true);
        }

    }

    /**
     * Draw device selectors
     * @param {function} done - Callback function
     */
    drawDevices(done) {
        const ui = this;
        const el = ui.Fields.device;
        let typeDefault = "device";
        try {
            ui.genDeviceSelectors(function (err, selectors) {


                if (selectors) {
                    let types = [
                        {
                            value: "device",
                            options: selectors
                        }
                    ];
                    try {
                        el.typedInput('types', types);
                    } catch (err) {
                        el.typedInput({
                            typeField: ui.TypeFields.device,
                            default: typeDefault,
                            types: types
                        });
                    }
                    ui.drawActions({
                        value: el.typedInput('value'),
                        type: el.typedInput('type')
                    }, function (err, drawn) {

                        if (drawn) {
                            done(null, true);
                        } else {
                            done("drawActions");
                        }


                    })
                }
            })

        } catch (err) {
            done("drawDevices");
        }
    }

    /**
     * Draw action selectors
     * @param {string} device - Device ID
     * @param {function} callback - Callback function
     */
    drawActions(device, callback) {

        let ui = this;
        let el = ui.Fields.action;
        let types = [];
        let type;
        let typeDefault = "msg";
        let holdTypes = [{
            value: "msg",
            label: "msg.hold_time",
            icon: "fa fa-envelope",
            hasValue: false,
            default: "0"
        },
            {
                value: "flow",
                label: "flow.hold_time",
                icon: "fa fa-arrows-alt",
                hasValue: false,
                default: "0"
            },
            {
                value: "num",
                label: "Hold Time",
                validate: ui.Validators.hold_time,
                icon: "resources/node-red-contrib-caseta/09.svg",
                options: [
                    {value: "0", label: "None"},
                    {value: "1", label: "1 second"},
                    {value: "2", label: "2 seconds"},
                    {value: "3", label: "3 seconds"},
                    {value: "4", label: "4 seconds"},
                    {value: "5", label: "5 seconds"},
                    {value: "6", label: "6 seconds"},
                    {value: "7", label: "7 seconds"},
                    {value: "8", label: "8 seconds"},
                    {value: "9", label: "9 seconds"},
                    {value: "10", label: "10 seconds"},
                ],
                default: "0"
            }];

        try {

            switch (ui.base) {
                case "control":
                    types = [
                        {
                            value: "action",
                            validate: ui.Validators.action,
                            options: ui.Library[ui.Device[device.value].type].Selectors.action_map


                        }]
                    typeDefault = "action";
                    break;
                case "react":

                    ui.d("drawActions-type:" + device.type + " value:" + device.value)

                    typeDefault = "action";
                    type = {
                        value: "action",
                        multiple: true,
                        validate: ui.Validators.action,
                        options: ui.Library[ui.Device[device.value].type].Selectors.action_map
                    }
                    if (ui.Device[device.value] && ui.library[ui.Device[device.value].type].Selectors.action_map.length === 1) {
                        type.multiple = false;
                    }


                    types = [type]
                    break;
                case "query":
                    typeDefault = "action";
                    types = [{
                        value: "action",
                        validate: ui.Validators.action,
                        options: ui.Library[ui.Device[device.value].type].Selectors.query_map
                    }]

                    break;
            }


        } catch (err) {
            console.warn(err);
            callback("drawActions");
        }


        try {
            ui.Fields.hold_time.typedInput('types', holdTypes);
        } catch (err) {
            ui.Fields.hold_time.typedInput({
                default: "num",
                typeField: ui.TypeFields.hold_time,
                types: holdTypes
            });
        }
        try {
            el.typedInput('types', types);
        } catch (err) {
            el.typedInput({
                default: typeDefault,
                typeField: ui.TypeFields.action,
                types: types
            });
        }

        if (ui.base === "control" && ui.Device[device.value].type.indexOf("pico_") === 0) {
            ui.Fields.row_hold_time.show();

        } else {
            ui.Fields.row_hold_time.hide();
        }
        ui.drawEvents({
            value: device.value,
            type: device.type
        }, function (drawn) {
            ui.drawParams({
                value: el.typedInput('value'),
                type: el.typedInput('type')
            }, {
                value: device.value,
                type: device.type
            }, function (err, drawn) {
                if (drawn) {
                    callback(null, true);
                } else {
                    console.warn(err || {});
                    callback("drawActions")
                }


            })

        })
    };

    /**
     * Draw event selectors
     * @param {string} device - Device ID
     * @param {function} done - Callback function
     */
    drawEvents(device, done) {

        const ui = this;
        let typeDefault = "event";
        let el = ui.Fields.event;
        let types = [];
        let type;
        let fields = ui.Fields;


        try {

            const Device = ui.Device[device.value];


            switch (ui.base) {
                case "react":
                    typeDefault = "event";
                    type = {
                        value: "event",
                        options: [],
                        multiple: true,
                        validate: ui.Validators.event
                    }

                    if (!ui.Library[Device.type].Selectors.event_map || ui.Library[Device.type].Selectors.event_map.length === 1 || (ui.Library[Device.type].Selectors.action_map.length === 1 && Device.type !== "system_smartbridge")) {
                        type.multiple = false;
                        type.options = [];
                        fields.row_event.hide();
                    } else {
                        fields.row_event.show();
                        type.options = ui.Library[Device.type].Selectors.event_map;
                    }

                    types.push(type);

                    break;
                case "control":

                    typeDefault = "event";
                    type = {
                        value: "event",
                        validate: ui.Validators.event,
                        options: ui.Library[Device.type].Selectors.event_map,
                        multiple: true

                    }
                    if (ui.Library[Device.type].Selectors.event_map.length === 1) {
                        type.multiple = false;
                    }


                    types.push(type);

                    break;
            }

        } catch (err) {
            console.warn(err);
            done("drawEvents")
        }


        try {
            el.typedInput('types', types);
        } catch (err) {
            el.typedInput({
                default: typeDefault,
                typeField: ui.TypeFields.event,
                types: types
            });
        }

        done(null, true)


    };

    /**
     * Draw param selectors
     * @param {string} action - action
     * @param {string} device - Device ID
     * @param {function} done - Callback function
     */
    drawParams(action, device, done) {

        let ui = this;
        const el1 = ui.Fields.param_1;
        const elType1 = ui.TypeFields.param_1;
        const el2 = ui.Fields.param_2;
        const elType2 = ui.TypeFields.param_2;
        const row1 = $("#row-param_1");
        const row2 = $("#row-param_2");

        let types2 = [
            {
                value: "msg",
                label: "msg.fade_time",
                icon: "fa fa-envelope",
                hasValue: false,
                default: "1"
            },
            {
                value: "flow",
                label: "flow.fade_time",
                icon: "fa fa-arrows-alt",
                hasValue: false,
                default: "1"
            },
            {
                value: "num",
                label: "Fade time",
                validate: ui.Validators.param_2,
                icon: "resources/node-red-contrib-caseta/09.svg",
                default: "1"
            }];
        let types1 = [{
            value: "msg",
            label: "msg.level",
            icon: "fa fa-envelope",
            hasValue: false,
            default: "100"
        },
            {
                value: "flow",
                label: "flow.level",
                icon: "fa fa-arrows-alt",
                hasValue: false,
                default: "100"
            },
            {
                value: "num",
                label: "Level",
                validate: ui.Validators.param_1,
                icon: "resources/node-red-contrib-caseta/09.svg",
                default: "100"
            }];
        if (action.type && action.type === 'action') {
            if (device.type === "device") {
                ui.d("drawParams-type:" + action.type + " value:" + action.value + " devicetype:" + device.type + " devicevalue:" + device.value)
                let deviceType = ui.Device[device.value].type;
                if (ui.Library[deviceType].param_map) {

                    row1.show();
                    if(ui.deviceClass(device) === "dimmer"){
                        row2.show();
                    } else {
                        row2.hide();
                    }


                } else {
                    row1.hide();
                    row2.hide();
                }


            } else {
                row1.hide();
                row2.hide();
            }

        } else {
            row1.hide();
            row2.hide();
        }


        try {
            el1.typedInput('types', types1);
        } catch (err) {
            el1.typedInput({
                default: "num",
                typeField: elType1,
                types: types1

            });
        }
        try {
            el2.typedInput('types', types2);
        } catch (err) {
            el2.typedInput({
                default: "num",
                typeField: elType2,
                types: types2
            });
        }
        done(null, true)
    };

    /**
     * Setup ad selectors
     * @param {string} action - action
     * @param {string} device - Device ID
     * @param {function} done - Callback function
     */
    initAdvArea(el) {

        try {
            let coll = document.getElementById(el);
            coll.addEventListener("click", function () {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        } catch (err) {
            console.warn(err);
        }

    }

    /**
     * Generate the UI labels
     * @param {string} type - action
     * @param {string} value - Device ID
     */
    genPaletteLabel(type, value) {
        const ui = this;
        if (type && value && type === "device") {
            return ui.Device[value].label || ui.base.charAt(0).toUpperCase() + ui.base.slice(1);
        } else {
            return ui.base.charAt(0).toUpperCase() + ui.base.slice(1);
        }
    }
    refresh(theNode){
       let ui = this;
       for(const n in ui.refresher){
           ui.refresher[n](theNode)
       }
    }
    /**
     * Finish up the UI draw
     */
    finish(node,func) {
        let ui = this;

        ui.initAdvArea("node-section-advanced-" + ui.base);

        if(func && !ui.refresher[node.id]) {
            ui.refresher[node.id] = func;
        }

        //common
        if (!casIsLoaded) {
            RED.events.on("nodes:change", function (theNode) {
               console.log("nodeChange:" + theNode.name + " Type:" + theNode.type + " Dirty:" + theNode.dirty + " Valid:" + theNode.valid);
                if (theNode && theNode.type === 'caseta-bridge') {
                    if (theNode.dirty && theNode.dirty !== false && theNode.valid && theNode.valid !== false) {

                        ui.refresh(theNode);
                        //RED.notify("Changes to devices or zones must first be deployed to be seen in node properties.", 'info');
                    }
                }
            });
            casIsLoaded = true;

        }


    };

    /**
     * Retrieve data from admin UI via REST call
     * @param {string} resource - URL component to append
     * @param {object} opts -  Params for REST call
     * @param {function} callback - Callback function
     */
    getData(resource, opts, callback) {
        let ui = this;

        if (opts) {
            opts = Object.assign(opts, ui.opts);
        } else {
            opts = ui.opts;
        }

        if (opts && resource) {
            ui.d("getData-Resource:" + resource + " opts:" + JSON.stringify(opts));
            try {


                $.ajax({
                    url: ui.API_BASE + resource,
                    method: 'GET',
                    timeout: 1000,
                    data: opts
                })
                    .done(function (response) {

                        if (response && JSON.parse(response)) {

                            callback(null, response);
                        } else {
                            callback("Expected data not returned.");
                        }

                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {

                        callback(textStatus || "Unknown.");

                    });
            } catch (err) {
                callback("API call error. Undefined.");
            }
        } else {
            callback("Incorrect params supplied.");
        }


    };


    /**
     * Show the help panel if not in view and scroll to the help topic
     * @param {string} target - CSS property fragment to scroll to
     */
    showSidebarHelpPanel(target) {
        RED.sidebar.help.show();//  >= V1.1.0
        if (target) {
            $(target).get(0).scrollIntoView();
        }
    }

    /**
     * Debug to console
     * @param {string} msg - Text message
     * @param {object} obj - And object to append to the msg
     */
    d(msg, obj = {}) {
        if (this.debug) {
            console.log(msg + " - " + JSON.stringify(obj))
        }
    }
}
