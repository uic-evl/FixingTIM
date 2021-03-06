"use strict";

// Global Application variable
var App = App || {};

const d3Utils = function () {

    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            let firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    return {

        import_svg: function(svg_path, cb) {
            // load the external svg from a file
            d3.xml(svg_path, function(err,xml) {
                if(err) throw err;
                let importedNode = document.importNode(xml.documentElement, true);
                cb(d3.select(importedNode).select("g"));
            });
        },

        /* Clear the chart DOM of all elements */
        clear_chart_dom : function (domObj) {
            domObj.selectAll().remove();
        },

        /*https://stackoverflow.com/questions/18517376/d3-append-duplicates-of-a-selection*/
        clone_d3_selection: function(selection, id) {
            // Assume the selection contains only one object, or just work
            // on the first object. 'i' is an index to add to the id of the
            // newly cloned DOM element.
            let attr = selection.node().attributes,
                length = attr.length,
                node_name = selection.property("nodeName"),
                parent = d3.select(selection.node().parentNode),
                cloned = parent.append(node_name)
                    .attr("id", id);
            for (let j = 0; j < length; j++) { // Iterate on attributes and skip on "id"
                if (attr[j].nodeName === "id") continue;
                cloned.attr(attr[j].name,attr[j].value);
            }
            return cloned;
        },

        create_chart_canvas : function(domObj, options) {
            let canvas = domObj
                .append('canvas')
                .attr("id", options.id)
                .attr("class", options.class)
                .attr("width", options.width)
                .attr("height", options.height)
                .attr("transform", "translate(" + (options.x)?options.x:0 +","+ (options.y)?options.y:0 +")");
            return canvas.node();
        },

        create_chart_svg : function(domObj, options) {
            return domObj.append("svg")
                .attr("width", options.width)
                .attr("height", options.height)
                .attr("class", options.class)
                .attr("transform", "translate(" + (options.x)?options.x:0 +","+ (options.y)?options.y:0 +")");
        },

        set_chart_size(div, width, height) {
            /* Set the width/height attributes of the canvas for webGL*/
            d3.select(div)
                .attr("width", width)
                .attr("height", height);
        },

        /* Simple d3 function to construct a line*/
        lineFunction : d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
        ,

        get_translate_values: function(element) {
            let string = element.attr("transform");
           return string.substring(string.indexOf("(")+1, string.indexOf(")")).split(",");
        },

        /* Create the trend image brush SVG */
        create_brush_svg: function(domObj, options) {
            return domObj
                .append("svg")
                .attr("class", "trendImage")
                .attr("id", "trendSVG")
                .attr("width", options.width)
                .attr("height", options.height)
                .attr("transform", "translate(" + (options.x)?options.x:0 +","+ (options.y)?options.y:0 +")");
        },

        create_svg_overlay : function(domObj, width, height) {
            let overview = domObj
                .append('canvas')
                .attr("id", "trendCanvasOverview")
                .attr("width", width * 0.1)
                .attr("height", height);
            return overview.node().getContext('2d');
        },

        create_chart_back_buffer : function(options) {
            let backBufferCanvas = document.createElement('canvas');
            return d3.select(backBufferCanvas)
                .attr("width", options.width)
                .attr("height", options.height)
                .node();
        },

        /* Render the line above the bars */
        render_context_lines : function(context, points, width_class) {
            /* Add the context bar above viewers */
            if(context.node && context.node().nodeName === "svg"){

                let lines = context.selectAll(".context-line")
                    .data(points);

                lines.enter().append("line")
                    .merge(lines)
                    .attr('x1', function(d,i){return d[0].x})
                    .attr('y1', function(d,i){return d[0].y})
                    .attr('x2', function(d,i){return d[1].x})
                    .attr('y2', function(d,i){return d[1].y})
                    .attr("shape-rendering", "auto")
                    .classed("context-line", true)
                    .classed(width_class, !!(width_class));
            }
            else {
                points.forEach(function(point){
                    context.beginPath();
                    context.moveTo(point[0].x, point[0].y);
                    context.lineTo(point[1].x, point[1].y);
                    context.strokeStyle = "#000000";
                    context.closePath();
                    // Make the line visible
                    context.stroke();
                });
            }
        },

        /* Render the pointer bar */
        render_context_bars : function(svg, render_options) {
            /* Add the bars to the viewer */
            let bar = svg
                .selectAll(".context-bar")
                .data([render_options]);

            // UPDATE: add new elements if needed
            bar
                .enter().append('g')
                .append('rect')
                /* Merge the old elements (if they exist) with the new data */
                .merge(bar)
                .attr("class", "context-bar")
                .attr("width", render_options.width)
                .attr("height", render_options.height)
                .attr('y', render_options.y)
                .attr('x', render_options.x)
                .style("fill", "black");

            /* Remove the unneeded bars */
            bar.exit().remove();
        },

    }

}();