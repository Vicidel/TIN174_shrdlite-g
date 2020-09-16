(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./SVGWorld", "./ExampleWorlds", "./Shrdlite", "./lib/jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var SVGWorld_1 = require("./SVGWorld");
    var ExampleWorlds_1 = require("./ExampleWorlds");
    var Shrdlite_1 = require("./Shrdlite");
    require("./lib/jquery");
    /********************************************************************************
    ** shrdlite-html
    
    This is the main file for the browser-based version.
    You don't have to edit this file.
    ********************************************************************************/
    var defaultWorld = 'small';
    var defaultSpeech = false;
    $(function () {
        var current = getURLParameter('world');
        if (!(current in ExampleWorlds_1.ExampleWorlds)) {
            current = defaultWorld;
        }
        var speech = (getURLParameter('speech') || "").toLowerCase();
        var useSpeech = (speech == 'true' || speech == '1' || defaultSpeech);
        $('#currentworld').text(current);
        $('<a>').text('reset')
            .attr('href', '?world=' + current + '&speech=' + useSpeech)
            .appendTo($('#resetworld'));
        $('#otherworlds').empty();
        for (var wname in ExampleWorlds_1.ExampleWorlds) {
            if (wname !== current) {
                $('<a>').text(wname)
                    .attr('href', '?world=' + wname + '&speech=' + useSpeech)
                    .appendTo($('#otherworlds'))
                    .after(' ');
            }
        }
        $('<a>').text(useSpeech ? 'turn off' : 'turn on')
            .attr('href', '?world=' + current + '&speech=' + (!useSpeech))
            .appendTo($('#togglespeech'));
        var world = new SVGWorld_1.SVGWorld(ExampleWorlds_1.ExampleWorlds[current], useSpeech);
        interactiveLoop(world);
    });
    // The interaction loop.
    // It calls 'splitStringIntoPlan()' and 'parseUtteranceIntoPlan()' after each utterance.
    function interactiveLoop(world) {
        function endlessLoop(utterance) {
            if (utterance === void 0) { utterance = ""; }
            var inputPrompt = "What can I do for you today? ";
            var nextInput = function () { return world.readUserInput(inputPrompt, endlessLoop); };
            if (utterance.trim()) {
                var theplan = Shrdlite_1.splitStringIntoPlan(utterance);
                if (!theplan) {
                    theplan = Shrdlite_1.parseUtteranceIntoPlan(world, utterance);
                }
                if (theplan) {
                    world.printDebugInfo("Plan: " + theplan.join(", "));
                    world.performPlan(theplan, nextInput);
                    return;
                }
            }
            nextInput();
        }
        world.printWorld(endlessLoop);
    }
    // This function will ask for confirmation if the user tries to close the window.
    // Adapted from: http://www.openjs.com/scripts/events/exit_confirmation.php
    function goodbye(event) {
        // Note: the type of 'event' is really 'Event', but its interface says that
        // 'event.returnValue' is a boolean, which is not the case, so we set the type to 'any'
        if (!event)
            event = window.event;
        // event.cancelBubble is supported by IE - this will kill the bubbling process.
        event.cancelBubble = true;
        // This is displayed in the dialog:
        event.returnValue = 'Are you certain?\nYou cannot undo this, you know.';
        // event.stopPropagation works in Firefox.
        if (event.stopPropagation) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
    window.onbeforeunload = goodbye;
    // This function gets the URL parameter value for a given key all parameters in the URL string,
    // i.e., if the URL is "http://..../....?x=3&y=42", then getURLParameter("y") == 42
    // Adapted from: http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
    function getURLParameter(sParam) {
        var sPageURL = window.location.search.slice(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
        return "";
    }
});
