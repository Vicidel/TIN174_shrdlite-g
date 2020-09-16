///<reference path="lib/node.d.ts"/>
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./TextWorld", "./ExampleWorlds", "./Shrdlite"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var TextWorld_1 = require("./TextWorld");
    var ExampleWorlds_1 = require("./ExampleWorlds");
    var Shrdlite_1 = require("./Shrdlite");
    /********************************************************************************
    ** shrdlite-offline
    
    This is the main file for the command-line version.
    You don't have to edit this file.
    ********************************************************************************/
    // Extract command line arguments.
    var nodename = process.argv[0];
    var jsfile = process.argv[1].replace(/^.*\//, "");
    var worldname = process.argv[2];
    var utterances = process.argv.slice(3);
    // Print command usage and exit if necessary.
    var usage = "Usage: " + nodename + " " + jsfile +
        " (" + Object.keys(ExampleWorlds_1.ExampleWorlds).join(" | ") + ")" +
        " (utterance | example no. | plan)*";
    if (utterances.length == 0 || !ExampleWorlds_1.ExampleWorlds[worldname]) {
        console.error(usage);
        process.exit(1);
    }
    // Loop through all example utterances, updating the world state
    var world = new TextWorld_1.TextWorld(ExampleWorlds_1.ExampleWorlds[worldname]);
    world.printWorld();
    for (var _i = 0, utterances_1 = utterances; _i < utterances_1.length; _i++) {
        var utter = utterances_1[_i];
        var example = parseInt(utter);
        if (!isNaN(example)) {
            utter = world.currentState.examples[example];
            if (!utter) {
                console.error("ERROR: Cannot find example no. " + example);
                process.exit(1);
            }
        }
        console.log();
        console.log("############################################################" +
            "############################################################");
        console.log("#####", utter);
        console.log("############################################################" +
            "############################################################");
        console.log();
        var theplan = Shrdlite_1.splitStringIntoPlan(utter);
        if (!theplan) {
            theplan = Shrdlite_1.parseUtteranceIntoPlan(world, utter);
        }
        if (!theplan) {
            console.error("ERROR: Couldn't find a plan for utterance '" + utter + "'");
            process.exit(1);
        }
        console.log();
        world.performPlan(theplan);
        world.printWorld();
    }
});
