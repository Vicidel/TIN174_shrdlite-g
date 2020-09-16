(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./lib/jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    require("./lib/jquery");
    /********************************************************************************
    ** SVGWorld
    
    This is the implementation of the World interface, for the browser version.
    It is used by 'shrdlite-html.ts'.
    
    You don't have to edit this file, but you might want to play around with
    the public constants defined below.
    ********************************************************************************/
    var SVGWorld = (function () {
        function SVGWorld(currentState, useSpeech) {
            if (useSpeech === void 0) { useSpeech = false; }
            var _this = this;
            this.currentState = currentState;
            this.useSpeech = useSpeech;
            //////////////////////////////////////////////////////////////////////
            // Public constants that can be played around with
            this.dialogueHistory = 100; // max nr. utterances
            this.floorThickness = 10; // pixels
            this.wallSeparation = 4; // pixels
            this.armSize = 0.2; // of stack width
            this.animationPause = 0.01; // seconds
            this.promptPause = 0.5; // seconds
            this.ajaxTimeout = 5; // seconds
            this.armSpeed = 1000; // pixels per second
            //////////////////////////////////////////////////////////////////////
            // Added for 3D
            this.theta = Math.PI * 145 / 180;
            this.scaleFactor = 0.65;
            // There is no way of setting male/female voice,
            // so this is one way of having different voices for user/system:
            this.voices = {
                system: { lang: "en-GB", rate: 1.1 },
                user: { lang: "en-US", rate: 1.0 }
            };
            // HTML id's for different containers
            this.containers = {
                world: $('#theworld'),
                dialogue: $('#dialogue'),
                inputform: $('#dialogue form'),
                userinput: $('#dialogue form input:text'),
                inputexamples: $('#dialogue form select')
            };
            this.svgNS = 'http://www.w3.org/2000/svg';
            //////////////////////////////////////////////////////////////////////
            // Object types
            this.objectData = { brick: { small: { width: 0.30, height: 0.30 },
                    large: { width: 0.70, height: 0.60 } },
                plank: { small: { width: 0.60, height: 0.10 },
                    large: { width: 1.00, height: 0.15 } },
                ball: { small: { width: 0.30, height: 0.30 },
                    large: { width: 0.70, height: 0.70 } },
                pyramid: { small: { width: 0.60, height: 0.25 },
                    large: { width: 1.00, height: 0.40 } },
                box: { small: { width: 0.60, height: 0.30, thickness: 0.10 },
                    large: { width: 1.00, height: 0.40, thickness: 0.10 } },
                cup: { small: { width: 0.60, height: 0.30, thickness: 0.10 },
                    large: { width: 1.00, height: 0.40, thickness: 0.10 } },
                table: { small: { width: 0.60, height: 0.30, thickness: 0.10 },
                    large: { width: 1.00, height: 0.40, thickness: 0.10 } }
            };
            // Default arm position
            if (!this.currentState.arm)
                this.currentState.arm = [0, 0];
            // Get world size
            this.rowCount = this.currentState.stacks.length;
            this.columnCount = this.currentState.stacks[0].length;
            // Canvas geometry
            this.canvasWidth = this.containers.world.width();
            this.canvasHeight = this.containers.world.height();
            // Scale for full width
            this.columnWidth =
                (this.canvasWidth - this.wallSeparation * 2) / (this.columnCount - this.rowCount * Math.cos(this.theta) * this.scaleFactor);
            this.rowX = this.columnWidth * Math.cos(this.theta) * this.scaleFactor;
            this.rowY = this.columnWidth * Math.sin(this.theta) * this.scaleFactor;
            this.columnHeight =
                this.canvasHeight - this.floorThickness - this.rowCount * this.rowY;
            this.viewLeft =
                -this.wallSeparation - 0.5 * this.columnWidth + (this.rowCount - 0.5) * this.rowX;
            this.viewTop =
                -this.columnHeight - 0.5 * this.rowY;
            this.objectWidth = Math.min(this.columnWidth - 4, this.columnWidth * 0.95);
            this.boxSpacing = this.columnWidth - this.objectWidth;
            var dropdown = this.containers.inputexamples;
            dropdown.empty();
            dropdown.append($('<option value="">').text("(Select an example utterance)"));
            $.each(this.currentState.examples, function (i, value) {
                dropdown.append($('<option>').text(value));
            });
            dropdown.change(function () {
                var userinput = dropdown.val().trim();
                if (userinput) {
                    _this.containers.userinput.val(userinput).focus();
                }
            });
            this.containers.inputform.submit(function () { return _this.handleUserInput.call(_this); });
            this.disableInput();
        }
        //////////////////////////////////////////////////////////////////////
        // Public methods
        SVGWorld.prototype.readUserInput = function (prompt, callback) {
            this.printSystemOutput(prompt);
            this.enableInput();
            this.inputCallback = callback;
        };
        SVGWorld.prototype.printSystemOutput = function (output, participant, utterance) {
            if (participant === void 0) { participant = "system"; }
            if (utterance == undefined) {
                utterance = output;
            }
            var dialogue = this.containers.dialogue;
            if (dialogue.children().length > this.dialogueHistory) {
                dialogue.children().first().remove();
            }
            $('<p>').attr("class", participant)
                .text(output)
                .insertBefore(this.containers.inputform);
            dialogue.scrollTop(dialogue.prop("scrollHeight"));
            if (this.useSpeech && utterance && /^\w/.test(utterance)) {
                try {
                    // W3C Speech API (works in Chrome and Safari)
                    var speech = new SpeechSynthesisUtterance(utterance);
                    speech.lang = this.voices[participant].lang;
                    speech.rate = this.voices[participant].rate;
                    console.log("SPEAKING: " + utterance);
                    window.speechSynthesis.speak(speech);
                }
                catch (err) {
                }
            }
        };
        SVGWorld.prototype.printDebugInfo = function (info) {
            console.log(info);
        };
        SVGWorld.prototype.printError = function (error, message) {
            console.error(error, message);
            if (message) {
                error += ": " + message;
            }
            this.printSystemOutput(error, "error");
        };
        SVGWorld.prototype.printWorld = function (callback) {
            this.containers.world.empty();
            var viewBox = [this.viewLeft, this.viewTop,
                this.canvasWidth, this.canvasHeight];
            var svg = $(this.SVG('svg')).attr({
                viewBox: viewBox.join(' '),
                width: viewBox[2],
                height: viewBox[3]
            }).appendTo(this.containers.world);
            // The floor:
            $(this.SVG('polygon')).attr({
                points: this.projection([
                    -0.5, -0.5, 0,
                    this.rowCount - 0.5, -0.5, 0,
                    this.rowCount - 0.5, -0.5, this.floorThickness,
                    this.rowCount - 0.5, this.columnCount - 0.5, this.floorThickness,
                    -0.5, this.columnCount - 0.5, this.floorThickness,
                    -0.5, this.columnCount - 0.5, 0,
                ]).join(' '),
                stroke: '#888',
                fill: '#888'
            }).appendTo(svg);
            for (var row = 0; row < this.rowCount; row++)
                for (var col = 0; col < this.columnCount; col++)
                    $(this.SVG('polygon')).attr({
                        points: this.projection([
                            row - 0.48, col - 0.48, 0,
                            row + 0.48, col - 0.48, 0,
                            row + 0.48, col + 0.48, 0,
                            row - 0.48, col + 0.48, 0,
                        ]).join(' '),
                        stroke: '#888',
                        fill: '#bbb'
                    }).appendTo(svg);
            // Held object
            if (this.currentState.holding) {
                this.makeObject(svg, this.currentState.holding, this.currentState.arm, 0);
            }
            // The objects on the floor:
            var timeout = 0;
            for (var row = 0; row < this.rowCount; row++) {
                // composition mark
                $(this.SVG('rect')).attr({
                    id: 'row' + row.toString(),
                    x: this.viewLeft,
                    y: this.viewTop,
                    width: this.canvasWidth,
                    height: this.canvasHeight,
                    stroke: 'none',
                    fill: '#dbf',
                    opacity: '0.10'
                }).appendTo(svg);
                for (var col = 0; col < this.columnCount; col++) {
                    for (var height = 0; height < this.currentState.stacks[row][col].length; height++) {
                        var objectid = this.currentState.stacks[row][col][height];
                        this.makeObject(svg, objectid, [row, col], timeout);
                        timeout += this.animationPause;
                    }
                }
            }
            // The arm:
            $(this.SVG('line')).attr({
                id: 'arm',
                x1: 0,
                y1: 0,
                x2: 0,
                y2: -this.canvasHeight,
                stroke: 'black',
                'stroke-width': this.armSize * this.columnWidth
            }).appendTo(svg);
            this.animateMotion($("#arm"), ["M", this.projection([this.currentState.arm[0], this.currentState.arm[1], -this.columnHeight]).join(' ')], 0, 0);
            if (callback) {
                setTimeout(callback, (timeout + this.promptPause) * 1000);
            }
        };
        SVGWorld.prototype.performPlan = function (plan, callback) {
            var _this = this;
            if (this.isSpeaking()) {
                setTimeout(function () { return _this.performPlan(plan, callback); }, this.animationPause * 1000);
                return;
            }
            var planctr = 0;
            var performNextAction = function () {
                planctr++;
                if (plan && plan.length) {
                    var item = plan.shift().trim();
                    var action = _this.getAction(item);
                    if (action) {
                        try {
                            action.call(_this, performNextAction);
                        }
                        catch (err) {
                            _this.printError(err);
                            if (callback)
                                setTimeout(callback, _this.promptPause * 1000);
                        }
                    }
                    else {
                        if (item && item[0] != "#") {
                            if (_this.isSpeaking()) {
                                plan.unshift(item);
                                setTimeout(performNextAction, _this.animationPause * 1000);
                            }
                            else {
                                _this.printSystemOutput(item);
                                performNextAction();
                            }
                        }
                        else {
                            performNextAction();
                        }
                    }
                }
                else {
                    if (callback)
                        setTimeout(callback, _this.promptPause * 1000);
                }
            };
            performNextAction();
        };
        SVGWorld.prototype.SVG = function (tag) {
            return document.createElementNS(this.svgNS, tag);
        };
        SVGWorld.prototype.animateMotion = function (object, path, timeout, duration) {
            var animation = this.SVG('animateMotion');
            $(animation).attr({
                begin: 'indefinite',
                fill: 'freeze',
                path: path.join(" "),
                dur: duration + "s"
            }).appendTo(object);
            animation.beginElementAt(timeout);
            return animation;
        };
        //////////////////////////////////////////////////////////////////////
        // The basic actions: left, right, pick, drop
        SVGWorld.prototype.getAction = function (act) {
            var actions = { p: this.pick, d: this.drop, l: this.left, r: this.right, b: this.backward, f: this.forward };
            return actions[act.toLowerCase()];
        };
        SVGWorld.prototype.backward = function (callback) {
            if (this.currentState.arm[0] <= 0)
                throw "Already at back edge!";
            this.horizontalMove([this.currentState.arm[0] - 1, this.currentState.arm[1]], callback);
        };
        SVGWorld.prototype.forward = function (callback) {
            if (this.currentState.arm[0] >= this.columnCount - 1)
                throw "Already at front edge!";
            this.horizontalMove([this.currentState.arm[0] + 1, this.currentState.arm[1]], callback);
        };
        SVGWorld.prototype.left = function (callback) {
            if (this.currentState.arm[1] <= 0)
                throw "Already at left edge!";
            this.horizontalMove([this.currentState.arm[0], this.currentState.arm[1] - 1], callback);
        };
        SVGWorld.prototype.right = function (callback) {
            if (this.currentState.arm[1] >= this.columnCount)
                throw "Already at right edge!";
            this.horizontalMove([this.currentState.arm[0], this.currentState.arm[1] + 1], callback);
        };
        SVGWorld.prototype.drop = function (callback) {
            if (!this.currentState.holding)
                throw "Not holding anything!";
            this.verticalMove('drop', callback);
            this.currentState.stacks[this.currentState.arm[0]][this.currentState.arm[1]].push(this.currentState.holding);
            this.currentState.holding = null;
        };
        SVGWorld.prototype.pick = function (callback) {
            if (this.currentState.holding)
                throw "Already holding something!";
            this.currentState.holding = this.currentState.stacks[this.currentState.arm[0]][this.currentState.arm[1]].pop();
            this.verticalMove('pick', callback);
        };
        //////////////////////////////////////////////////////////////////////
        // Moving around
        SVGWorld.prototype.horizontalMove = function (newArm, callback) {
            var here = this.projection([this.currentState.arm[0], this.currentState.arm[1], -this.columnHeight]);
            var there = this.projection([newArm[0], newArm[1], -this.columnHeight]);
            var path1 = ["M", here[0], here[1], "L", there[0], there[1]];
            var duration = (Math.abs(there[0] - here[0]) + Math.abs(there[1] - here[1])) / this.armSpeed;
            var arm = $('#arm');
            this.animateMotion(arm, path1, 0, duration);
            if (this.currentState.holding) {
                var object = $("#" + this.currentState.holding);
                if (newArm[0] != this.currentState.arm[0]) {
                    object.detach().insertBefore("#row" + newArm[0].toString());
                }
                var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
                var path2 = ["M", here[0], here[1] + objectHeight, "L", there[0], there[1] + objectHeight];
                this.animateMotion(object, path2, 0, duration);
            }
            this.currentState.arm = newArm;
            if (callback)
                setTimeout(callback, (duration + this.animationPause) * 1000);
        };
        SVGWorld.prototype.verticalMove = function (action, callback) {
            var altitude = this.getAltitude(this.currentState.arm);
            var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
            var up = this.projection([this.currentState.arm[0], this.currentState.arm[1], -this.columnHeight]);
            var down = this.projection([this.currentState.arm[0], this.currentState.arm[1], -altitude - objectHeight]);
            var path1 = ["M", up[0], up[1], "V", down[1]];
            var path2 = ["M", down[0], down[1], "V", up[1]];
            var duration = (down[1] - up[1]) / this.armSpeed;
            var arm = $('#arm');
            var object = $("#" + this.currentState.holding);
            this.animateMotion(arm, path1, 0, duration);
            this.animateMotion(arm, path2, duration + this.animationPause, duration);
            if (action == 'pick') {
                var path3 = ["M", down[0], down[1] + objectHeight, "V", up[1] + objectHeight];
                this.animateMotion(object, path3, duration + this.animationPause, duration);
            }
            else {
                var path3 = ["M", up[0], up[1] + objectHeight, "V", down[1] + objectHeight];
                this.animateMotion(object, path3, 0, duration);
            }
            if (callback)
                setTimeout(callback, 2 * (duration + this.animationPause) * 1000);
        };
        //////////////////////////////////////////////////////////////////////
        // Methods for getting information about objects 
        SVGWorld.prototype.getObjectDimensions = function (objectid) {
            var attrs = this.currentState.objects[objectid];
            var size = this.objectData[attrs.form][attrs.size];
            var width = size.width * this.objectWidth;
            var height = size.height * this.objectWidth;
            var thickness = size.thickness * this.objectWidth;
            var heightadd = (attrs.form == 'box' || attrs.form == 'cup') ? thickness : height;
            return {
                width: width,
                height: height,
                heightadd: heightadd,
                thickness: thickness
            };
        };
        SVGWorld.prototype.getAltitude = function (stacknr, objectid) {
            var stack = this.currentState.stacks[stacknr[0]][stacknr[1]];
            var altitude = 0;
            for (var i = 0; stack[i] && objectid != stack[i]; i++)
                altitude += this.getObjectDimensions(stack[i]).heightadd + this.boxSpacing;
            return altitude;
        };
        //////////////////////////////////////////////////////////////////////
        // Creating objects
        SVGWorld.prototype.makeObject = function (svg, objectid, stacknr, timeout) {
            var attrs = this.currentState.objects[objectid];
            var dim = this.getObjectDimensions(objectid);
            if (objectid == this.currentState.holding) {
                var altitude = this.columnHeight - dim.heightadd;
            }
            else {
                var altitude = this.getAltitude(stacknr, objectid);
            }
            var ybottom = 0; // this.canvasHeight - this.boxSpacing();
            var ytop = ybottom - dim.height;
            var ycenter = (ybottom + ytop) / 2;
            var yradius = (ybottom - ytop) / 2;
            var xcenter = 0; // (xright + xleft) / 2;
            var xleft = -dim.width / 2;
            var xright = xleft + dim.width;
            var xradius = dim.width / 2;
            var xmidleft = (xcenter + xleft) / 2;
            var xmidright = (xcenter + xright) / 2;
            var object;
            switch (attrs.form) {
                case 'brick':
                case 'plank':
                    object = $(this.SVG('rect')).attr({
                        x: xleft,
                        y: ytop,
                        width: dim.width,
                        height: dim.height
                    });
                    break;
                case 'ball':
                    object = $(this.SVG('ellipse')).attr({
                        cx: xcenter,
                        cy: ycenter,
                        rx: xradius,
                        ry: yradius
                    });
                    break;
                case 'pyramid':
                    var points = [xleft, ybottom, xmidleft, ytop, xmidright, ytop, xright, ybottom];
                    object = $(this.SVG('polygon')).attr({
                        points: points.join(" ")
                    });
                    break;
                case 'cup':
                    var points = [xleft, ytop, xleft + 1.5 * dim.thickness, ybottom, xright - 1.5 * dim.thickness, ybottom, xright, ytop,
                        xright - 0.5 * dim.thickness, ytop, xright - 1.5 * dim.thickness, ybottom - dim.thickness,
                        xleft + 1.5 * dim.thickness, ybottom - dim.thickness, xleft + 0.5 * dim.thickness, ytop];
                    object = $(this.SVG('polygon')).attr({
                        points: points.join(" ")
                    });
                    break;
                case 'box':
                    var points = [xleft, ytop, xleft, ybottom, xright, ybottom, xright, ytop,
                        xright - dim.thickness, ytop, xright - dim.thickness, ybottom - dim.thickness,
                        xleft + dim.thickness, ybottom - dim.thickness, xleft + dim.thickness, ytop];
                    object = $(this.SVG('polygon')).attr({
                        points: points.join(" ")
                    });
                    break;
                case 'table':
                    var points = [xleft, ytop, xright, ytop, xright, ytop + dim.thickness,
                        xmidright, ytop + dim.thickness, xmidright, ybottom,
                        xmidright - dim.thickness, ybottom, xmidright - dim.thickness, ytop + dim.thickness,
                        xmidleft + dim.thickness, ytop + dim.thickness, xmidleft + dim.thickness, ybottom,
                        xmidleft, ybottom, xmidleft, ytop + dim.thickness, xleft, ytop + dim.thickness];
                    object = $(this.SVG('polygon')).attr({
                        points: points.join(" ")
                    });
                    break;
            }
            object.attr({
                id: objectid,
                stroke: 'black',
                'stroke-width': this.boxSpacing / 2,
                fill: attrs.color
            });
            object.appendTo(svg);
            var path = ["M", this.projection([stacknr[0], stacknr[1], -altitude - this.canvasHeight]).join(' ')];
            this.animateMotion(object, path, 0, 0);
            path.push("v", this.canvasHeight.toString());
            this.animateMotion(object, path, timeout, 0.5);
        };
        //////////////////////////////////////////////////////////////////////
        // Methods for handling user input and system output
        SVGWorld.prototype.enableInput = function () {
            this.containers.inputexamples.prop('disabled', false).val('');
            this.containers.inputexamples.find("option:first").attr('selected', 'selected');
            this.containers.userinput.prop('disabled', false);
            this.containers.userinput.focus().select();
        };
        SVGWorld.prototype.disableInput = function () {
            this.containers.inputexamples.blur();
            this.containers.inputexamples.prop('disabled', true);
            this.containers.userinput.blur();
            this.containers.userinput.prop('disabled', true);
        };
        SVGWorld.prototype.handleUserInput = function () {
            var userinput = this.containers.userinput.val().trim();
            this.disableInput();
            this.printSystemOutput(userinput, "user");
            this.inputCallback(userinput);
            return false;
        };
        SVGWorld.prototype.projection = function (coordinates) {
            if (coordinates.length % 3)
                throw "Bad coordinate array!";
            var result = [];
            var count = coordinates.length / 3;
            for (var i = 0; i < count; i++) {
                var row = coordinates.shift();
                var column = coordinates.shift();
                var height = coordinates.shift();
                result.push(row * this.rowX + column * this.columnWidth);
                result.push(row * this.rowY + height);
            }
            return result;
        };
        SVGWorld.prototype.isSpeaking = function () {
            return this.useSpeech && window && window.speechSynthesis && window.speechSynthesis.speaking;
        };
        return SVGWorld;
    }());
    exports.SVGWorld = SVGWorld;
});
