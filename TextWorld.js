(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /********************************************************************************
    ** TextWorld
    
    This is the implementation of the World interface, for the command-line version.
    It is used by 'shrdlite-offline.ts'.
    
    You don't have to edit this file.
    ********************************************************************************/
    var TextWorld = (function () {
        function TextWorld(currentState) {
            this.currentState = currentState;
            if (!this.currentState.arm)
                this.currentState.arm = [0, 0];
        }
        TextWorld.prototype.readUserInput = function (prompt, callback) {
            throw "Not implemented!";
        };
        TextWorld.prototype.printSystemOutput = function (output, participant) {
            if (participant == "user") {
                output = '"' + output + '"';
            }
            console.log(output);
        };
        TextWorld.prototype.printDebugInfo = function (info) {
            console.log(info);
        };
        TextWorld.prototype.printError = function (error, message) {
            console.error(error, message);
        };
        TextWorld.prototype.printWorld = function (callback) {
            var world = this;
            for (var row = 0; row < this.currentState.stacks.length; row++) {
                console.log();
                if (row == 0) {
                    console.log("Back row (#" + row + ")");
                }
                else if (row == this.currentState.stacks.length - 1) {
                    console.log("Front row (#" + row + ")");
                }
                else {
                    console.log("Row #" + row);
                }
                var stacks = this.currentState.stacks[row];
                var maxHeight = Math.max.apply(null, stacks.map(function (s) { return s.length; }));
                var stackWidth = 3 + Math.max.apply(null, stacks.map(function (s) {
                    return Math.max.apply(null, s.map(function (o) { return o.length; }));
                }));
                console.log(" " + repeat("_", stacks.length * stackWidth - 1));
                var left = repeat(" ", this.currentState.arm[1] * stackWidth);
                var right = repeat(" ", (stacks.length - this.currentState.arm[1] - 1) * stackWidth);
                var line = left + center((this.currentState.arm[0] == row ? "\\_/" : "   "), stackWidth) + right;
                console.log("|" + line.slice(1) + "|");
                if (this.currentState.holding && this.currentState.arm[0] == row) {
                    var line = left + center(this.currentState.holding, stackWidth) + right;
                    console.log("|" + line.slice(1) + "|");
                }
                for (var y = maxHeight; y >= 0; y--) {
                    var line = "";
                    for (var x = 0; x < stacks.length; x++) {
                        var obj = stacks[x][y] || "";
                        line += center(obj, stackWidth);
                    }
                    console.log("|" + line.slice(1) + "|");
                }
                console.log("+" + repeat(repeat("-", stackWidth - 1) + "+", stacks.length));
                var line = "";
                for (var x = 0; x < stacks.length; x++) {
                    line += center(x + "", stackWidth);
                }
                console.log(line);
            }
            console.log();
            //// Uncomment these if you want to print a list of the object identifiers and their parameters:
            // var printObject = (obj : string) => {
            //     var props : SimpleObject = world.currentState.objects[obj];
            //     console.log(center(obj, stackWidth) + ": " +
            //                 props.form + ", " + props.size + ", " + props.color
            //                );
            // };
            // if (this.currentState.holding) printObject(this.currentState.holding);
            // stacks.forEach((stack : string[]) => stack.forEach(printObject));
            // console.log();
            if (callback)
                callback();
        };
        TextWorld.prototype.performPlan = function (plan, callback) {
            var planctr = 0;
            var world = this;
            function performNextAction() {
                planctr++;
                if (plan && plan.length) {
                    var item = plan.shift().trim();
                    var action = world.getAction(item);
                    if (action) {
                        try {
                            action.call(world, performNextAction);
                        }
                        catch (err) {
                            world.printSystemOutput("ERROR: " + err);
                            if (callback)
                                setTimeout(callback, 1);
                        }
                    }
                    else {
                        if (item && item[0] != "#") {
                            world.printSystemOutput(item);
                        }
                        performNextAction();
                    }
                }
                else {
                    if (callback)
                        setTimeout(callback, 1);
                }
            }
            performNextAction();
        };
        //////////////////////////////////////////////////////////////////////
        // The basic actions: left, right, pick, drop
        TextWorld.prototype.getAction = function (act) {
            var actions = { p: this.pick, d: this.drop, l: this.left, r: this.right, b: this.backward, f: this.forward };
            return actions[act.toLowerCase()];
        };
        TextWorld.prototype.left = function (callback) {
            if (this.currentState.arm[1] <= 0) {
                throw "Already at left edge!";
            }
            this.currentState.arm[1]--;
            callback();
        };
        TextWorld.prototype.right = function (callback) {
            if (this.currentState.arm[1] >= this.currentState.stacks[0].length - 1) {
                throw "Already at right edge!";
            }
            this.currentState.arm[1]++;
            callback();
        };
        TextWorld.prototype.backward = function (callback) {
            if (this.currentState.arm[0] <= 0) {
                throw "Already at back edge!";
            }
            this.currentState.arm[0]--;
            callback();
        };
        TextWorld.prototype.forward = function (callback) {
            if (this.currentState.arm[0] >= this.currentState.stacks.length - 1) {
                throw "Already at front edge!";
            }
            this.currentState.arm[0]++;
            callback();
        };
        TextWorld.prototype.pick = function (callback) {
            if (this.currentState.holding) {
                throw "Already holding something!";
            }
            var row = this.currentState.arm[0];
            var col = this.currentState.arm[1];
            var pos = this.currentState.stacks[row][col].length - 1;
            if (pos < 0) {
                throw "Stack is empty!";
            }
            this.currentState.holding = this.currentState.stacks[row][col].pop();
            callback();
        };
        TextWorld.prototype.drop = function (callback) {
            if (!this.currentState.holding) {
                throw "Not holding anything!";
            }
            var row = this.currentState.arm[0];
            var col = this.currentState.arm[1];
            this.currentState.stacks[row][col].push(this.currentState.holding);
            this.currentState.holding = null;
            callback();
        };
        return TextWorld;
    }());
    exports.TextWorld = TextWorld;
    //////////////////////////////////////////////////////////////////////
    // Utilities
    function center(str, width) {
        var padlen = width - str.length;
        if (padlen > 0) {
            str = Array(Math.floor((padlen + 3) / 2)).join(" ") + str + Array(Math.floor((padlen + 2) / 2)).join(" ");
        }
        return str;
    }
    function repeat(str, n) {
        return Array(1 + n).join(str);
    }
});
