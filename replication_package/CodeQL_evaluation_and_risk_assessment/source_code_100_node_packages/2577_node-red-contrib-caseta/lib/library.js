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
module.exports = {
    pico_paddle_light: {
        base: ["react","control"],
        type_label: "Pico - Lighting Paddle",
        model: "PJ2-P2B-G***",
        action_map: {
            2: "On",
            4: "Off",
            3: "Preset",
            5: "Increase",
            6: "Decrease"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
    },
    pico_paddle_shades: {
        base: ["react","control"],
        type_label: "Pico - Shades Paddle",
        model: "PJ2-P2B-G***",
        action_map: {
            2: "Open",
            4: "Close",

        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
    },
    pico_two_button_light: {
        base: ["react","control"],
        type_label: "Pico - 2 Button Lighting",
        model: "PJ2-2B-G***",
        action_map: {
            2: "On",
            4: "Off"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
    },
    pico_paddle_two_button_light: {
        base: ["react","control"],
        type_label: "Pico - 2 Button Paddle",
        model: "PJ2-P2B-G***",
        action_map: {
            2: "On",
            4: "Off"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
    },
    pico_four_button_light: {
        base: ["react","control"],
        type_label: "Pico - 4 Button Lighting",
        model: "PJ2-4B-***-L31P",
        action_map: {
            2: "On",
            4: "Off",
            5: "Increase",
            6: "Decrease"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
    },

    pico_five_button_light: {
        base: ["react","control"],
        type_label: "Pico - 5 Button Lighting",
        model: "PJ2-3BRL-G***-L01R",
        action_map: {
            2: "On",
            4: "Off",
            3: "Preset",
            5: "Increase",
            6: "Decrease"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
    },
    pico_five_button_fan: {

        base: ["react","control"],
        type_label: "Pico - 5 Button Fan",
        model: "PJ2-3BRL-G***-F01",
        action_map: {
            2: "High",
            3: "Preset",
            4: "Off",
            5: "Faster",
            6: "Slower"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
    },

    pico_five_button_audio: {
        base: ["react","control"],
        type_label: "Pico - 5 Button Audio",
        model: "PJ2-3BRL-G***-A02",
        action_map: {
            2: "Toggle play",
            3: "Preset",
            4: "Next",
            5: "Increase",
            6: "Decrease"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },


    },
    pico_five_button_shades: {
        base: ["react","control"],
        type_label: "Pico - 5 Button Shades",
        model: " PJ2-3BRL-G***-S01",
        action_map: {
            2: "Open",
            3: "Favorite",
            4: "Close",
            5: "Raise",
            6: "Lower"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },


    },
    pico_five_button_wood_shades: {
        base: ["react","control"],
        type_label: "Pico - 5 Button Wood Shades",
        model: "PJ2-3BRL-G***-S10",
        action_map: {
            2: "Open",
            3: "Favorite",
            4: "Close",
            5: "Tilt up",
            6: "Tilt down"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },


    },
    smartbridge: {

        base: ["react","control"],
        type_label: "Smart Hub",
        action_map: {
            3: "Set"
        },
        event_map: {
            3: "Starting",
            4: "Complete"
        },
        notes: "The Smart Hub is the device that is used to initialize scenes.  A scene can be set only.  It cannot be 'unset'."
    },
    dimmer_diva: {

        model: "DVRF-6L-**",
        base: ["react", "control", "query"],
        type_label: "Dimmer - Diva",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
            2: "Fade time"
        },
        query_map: {
            1: "Get level"
        }
    },
    dimmer_diva_elv: {

        model: "DVRF-5NE-**",
        base: ["react", "control", "query"],
        type_label: "Dimmer - Diva ELV+",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
            2: "Fade time"
        },
        query_map: {
            1: "Get level"
        }
    },
    switch_claro: {
        base: ["react", "control", "query"],
        type_label: "Switch - Claro",
        model: "DVRF-5NS-**",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
        },
        query_map: {
            1: "Get level"
        },
        on_off_only: true,
        notes: "This device can only be set to a level of 0 or 100 (off or on)."

    },
    accessory_switch_claro_diva: {
        base: [],
        type_label: "Accessory Switch",
        model: "DVRF-AS-**",
        notes: "Use with Claro or Diva. This device type cannot be controlled or monitored and will not show as available for configuration."

    },
    dimmer_four_button: {
        base: ["react", "control", "query"],
        type_label: "Dimmer - 4 Button",
        model: "PD-6WCL-**",
        action_map: {
            1: "Set level"

        },
        param_map: {
            1: "Level",
            2: "Fade time"
        },
        query_map: {
            1: "Get level"
        }
    },
    dimmer_five_button: {
        base: ["react", "control", "query"],
        type_label: "Dimmer - 5 Button",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
            2: "Fade time"
        },
        query_map: {
            1: "Get level"
        }
    },
    dimmer_five_button_elv: {
        base: ["react", "control", "query"],
        type_label: "ELV Dimmer - 5 Button",
        model: "PD-5NE-**",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
            2: "Fade time"
        },
        query_map: {
            1: "Get level"
        }
    },
    dimmer_four_button_plugin: {

        base: ["react", "control", "query"],
        type_label: "Dimmer - 4 Button Plugin",
        model: "PD-3PCL-**",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
            2: "Fade time"
        },
        query_map: {
            1: "Get level"
        }

    },
    fan_five_button: {
        base: ["react", "control", "query"],
        type_label: "Fan - 5 Button Controller",
        model: "PD-FSQN-***",
        action_map: {
            2: "On",
            3: "Preset",
            4: "Off",
            5: "Faster",
            6: "Slower"
        },
        param_map: {
            1: "Level"
        },
        query_map: {
            1: "Get level"
        }
    },
    switch_two_button: {

        base: ["react", "control", "query"],
        type_label: "Lighting - 2 Button Switch",
        model: "PD-6ANS-***",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
        },
        query_map: {
            1: "Get level"
        },

        on_off_only: true,
        notes: "This device can only be set to a level of 0 or 100 (off or on)."

    },
    fan_two_button: {

        base: ["react", "control", "query"],
        type_label: "Fan - 2 Button Switch",
        model: "PD-6ANS-***",
        action_map: {
            2: "On",
            4: "Off"
        },
        on_off_only: true,
        query_map: {
            1: "Get level"
        }

    },

    switch_outdoor_two_button: {
        base: ["react", "control", "query"],
        type_label: "Power - Outdoor Switch",
        model: "PD-15OUT-BL",
        action_map: {
            1: "Set level"
        },
        param_map: {
            1: "Level",
        },
        query_map: {
            1: "Get level"
        },
        on_off_only: true,
        notes: "This device can only be set to a level of 0 or 100 (off or on)."

    },
    motion_sensor_occupancyvacancy: {
        base: [],
        type_label: "Motion Sensor - Occupancy/Vacancy",
        model: "PD-OSENS",
        notes: "This device type cannot be controlled or monitored and will not show as available for configuration."
    },
    motion_sensor_vacancy: {
        base: [],
        type_label: "Motion Sensor - Vacancy Only",
        model: "PD-VSENS",
        notes: "This device type cannot be controlled or monitored and will not show as available for configuration."
    },
    wireless_repeater: {
        base: [],
        type_label: "Wireless Repeater",
        model: "PD-REP",
        notes: "This device type cannot be controlled or monitored and will not show as available for configuration."
    }

}