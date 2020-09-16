/********************************************************************************
** Types

This module contains type and class declarations for parse results
and interpretations.

You don't have to edit this file (unless you add things to the grammar).
********************************************************************************/
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
    var ShrdliteResult = (function () {
        function ShrdliteResult(input, parse, interpretation, plan) {
            this.input = input;
            this.parse = parse;
            this.interpretation = interpretation;
            this.plan = plan;
        }
        return ShrdliteResult;
    }());
    exports.ShrdliteResult = ShrdliteResult;
    var TakeCommand = (function () {
        function TakeCommand(entity) {
            this.entity = entity;
        }
        TakeCommand.prototype.toString = function () { return "TakeCommand(" + this.entity.toString() + ")"; };
        ;
        TakeCommand.prototype.clone = function () { return new TakeCommand(this.entity.clone()); };
        ;
        return TakeCommand;
    }());
    exports.TakeCommand = TakeCommand;
    var DropCommand = (function () {
        function DropCommand(location) {
            this.location = location;
        }
        DropCommand.prototype.toString = function () { return "DropCommand(" + this.location.toString() + ")"; };
        ;
        DropCommand.prototype.clone = function () { return new DropCommand(this.location.clone()); };
        ;
        return DropCommand;
    }());
    exports.DropCommand = DropCommand;
    var MoveCommand = (function () {
        function MoveCommand(entity, location) {
            this.entity = entity;
            this.location = location;
        }
        MoveCommand.prototype.toString = function () { return "MoveCommand(" + this.entity.toString() + ", " + this.location.toString() + ")"; };
        ;
        MoveCommand.prototype.clone = function () { return new MoveCommand(this.entity.clone(), this.location.clone()); };
        ;
        return MoveCommand;
    }());
    exports.MoveCommand = MoveCommand;
    var WhereisCommand = (function () {
        function WhereisCommand(entity) {
            this.entity = entity;
        }
        WhereisCommand.prototype.toString = function () { return "WhereisCommand(" + this.entity.toString() + ")"; };
        ;
        WhereisCommand.prototype.clone = function () { return new WhereisCommand(this.entity.clone()); };
        ;
        return WhereisCommand;
    }());
    exports.WhereisCommand = WhereisCommand;
    var Location = (function () {
        function Location(relation, entity) {
            this.relation = relation;
            this.entity = entity;
        }
        Location.prototype.toString = function () { return "Location(" + this.relation + ", " + this.entity.toString() + ")"; };
        Location.prototype.clone = function () { return new Location(this.relation, this.entity.clone()); };
        ;
        return Location;
    }());
    exports.Location = Location;
    var Entity = (function () {
        function Entity(quantifier, object) {
            this.quantifier = quantifier;
            this.object = object;
        }
        Entity.prototype.toString = function () { return "Entity(" + this.quantifier + ", " + this.object.toString() + ")"; };
        ;
        Entity.prototype.clone = function () { return new Entity(this.quantifier, this.object.clone()); };
        ;
        return Entity;
    }());
    exports.Entity = Entity;
    var RelativeObject = (function () {
        function RelativeObject(object, location) {
            this.object = object;
            this.location = location;
        }
        RelativeObject.prototype.toString = function () { return "RelativeObject(" + this.object.toString() + ", " + this.location.toString() + ")"; };
        ;
        RelativeObject.prototype.clone = function () { return new RelativeObject(this.object.clone(), this.location.clone()); };
        ;
        return RelativeObject;
    }());
    exports.RelativeObject = RelativeObject;
    var SimpleObject = (function () {
        function SimpleObject(size, color, form) {
            this.size = size;
            this.color = color;
            this.form = form;
        }
        SimpleObject.prototype.toString = function () { return "SimpleObject(" + this.size + ", " + this.color + ", " + this.form + ")"; };
        ;
        SimpleObject.prototype.toStringAdv = function () { return this.size + " " + this.color + " " + this.form; };
        ;
        SimpleObject.prototype.clone = function () { return new SimpleObject(this.size, this.color, this.form); };
        ;
        return SimpleObject;
    }());
    exports.SimpleObject = SimpleObject;
    //////////////////////////////////////////////////////////////////////
    // Interpretations
    var DNFFormula = (function () {
        function DNFFormula(conjuncts) {
            if (conjuncts === void 0) { conjuncts = []; }
            this.conjuncts = conjuncts;
        }
        DNFFormula.prototype.toString = function () { return this.conjuncts.map(function (conj) { return conj.toString(); }).join(" | "); };
        ;
        return DNFFormula;
    }());
    exports.DNFFormula = DNFFormula;
    var Conjunction = (function () {
        function Conjunction(literals) {
            if (literals === void 0) { literals = []; }
            this.literals = literals;
        }
        Conjunction.prototype.toString = function () { return this.literals.map(function (lit) { return lit.toString(); }).join(" & "); };
        ;
        return Conjunction;
    }());
    exports.Conjunction = Conjunction;
    // A Literal represents a relation that is intended to hold among some objects.
    var Literal = (function () {
        function Literal(relation, // The name of the relation in question
            args, // The arguments to the relation
            polarity) {
            if (polarity === void 0) { polarity = true; }
            this.relation = relation;
            this.args = args;
            this.polarity = polarity;
        }
        Literal.prototype.toString = function () { return (this.polarity ? "" : "-") + this.relation + "(" + this.args.join(",") + ")"; };
        ;
        return Literal;
    }());
    exports.Literal = Literal;
});
