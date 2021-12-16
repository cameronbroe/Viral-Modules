/*
 * This script is designed to take in a Vectornator file for a module's panel and generate the appropriate C++ class that
 * panel. There are some assumptions made about how the Vectornator file is organized for this script to work.
 *
 * Background - There must be a layer with a name of background that has a single element with a label of background. This
 * background element should be at x = 0, y = 0, and have width and height to match the artboard. This element is used to
 * help convert Vectornator's internal coordinate representation to what is expected on the panel. For whatever reason,
 * Vectornator does not map origin to 0,0 in their internal representation, so this script has to get the offsets needed
 * to adjust the components positions to a 0,0 origin.
 */

const fs = require('fs');
const path = require('path');

function openVectornatorFile(vectornatorFilePath) {
    const manifest = JSON.parse(fs.readFileSync(path.join(vectornatorFilePath, 'Manifest.json')).toString());
    const document = JSON.parse(fs.readFileSync(path.join(vectornatorFilePath, manifest.documentJSONFilename)).toString());
    const artboards = document.drawing.artboardPaths.map((artboardPath) => {
        return JSON.parse(fs.readFileSync(path.join(vectornatorFilePath, artboardPath)).toString());
    });
    return {
        manifest,
        document,
        artboards,
    };
}

// HSBA = HSVA
// https://www.rapidtables.com/convert/color/hsv-to-rgb.html
function converHsbaToRgbaHex(hsba) {
    const hueInDegrees = hsba.h * 360;
    const c = hsba.b * hsba.s;
    const x = c * (1 - Math.abs((hueInDegrees / 60) % 2) - 1)
    const m = hsba.b - c;
    let rgbPrime = {}
    if(0 <= hueInDegrees  && hueInDegrees < 60) { rgbPrime = { r: c, g: x, b: 0 } }
    if(60 <= hueInDegrees  && hueInDegrees < 120) { rgbPrime = { r: x, g: c, b: 0 } }
    if(120 <= hueInDegrees  && hueInDegrees < 180) { rgbPrime = { r: 0, g: c, b: x } }
    if(180 <= hueInDegrees  && hueInDegrees < 240) { rgbPrime = { r: 0, g: x, b: c } }
    if(240 <= hueInDegrees  && hueInDegrees < 300) { rgbPrime = { r: x, g: 0, b: c } }
    if(300 <= hueInDegrees  && hueInDegrees < 360) { rgbPrime = { r: c, g: 0, b: x } }

    const rgba = {
        r: (rgbPrime.r + m) * 255,
        g: (rgbPrime.g + m) * 255,
        b: (rgbPrime.b + m) * 255,
        a: hsba.a * 255,
    }

    const rgbaHexComponents = {
        r: Math.trunc(rgba.r).toString(16).padStart(2, '0'),
        g: Math.trunc(rgba.g).toString(16).padStart(2, '0'),
        b: Math.trunc(rgba.b).toString(16).padStart(2, '0'),
        a: Math.trunc(rgba.a).toString(16).padStart(2, '0'),
    }
    return `#${rgbaHexComponents.r}${rgbaHexComponents.g}${rgbaHexComponents.b}${rgbaHexComponents.a}`.toUpperCase();
}

function pointToMm(point) {
    return point * 0.3527777778;
}

function getCenterOfCircle(component) {
    if(component.styleable.abstractPath.pathData.nodes.length != 4) {
        return { error: "not a perfect circle, can't derive center point" };
    }

    let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
    let maxX = 0, maxY = 0;
    component.styleable.abstractPath.pathData.nodes.forEach((node) => {
        const anchorPoint = node.anchorPoint;
        if(anchorPoint[0] < minX) { minX = anchorPoint[0]; }
        if(anchorPoint[0] >= maxX) { maxX = anchorPoint[0]; }
        if(anchorPoint[1] < minY) { minY = anchorPoint[1]; }
        if(anchorPoint[1] >= maxY) { maxY = anchorPoint[1]; }
    });
    return {
        x: pointToMm(((maxX - minX) / 2) + minX),
        y: pointToMm(((maxY - minY) / 2) + minY)
    }
}

function getComponentCoordinates(component) {
    switch(component.elementDescription.toLowerCase()) {
        case '(oval)':
            return getCenterOfCircle(component);
        default:
            return {};
    }
}

const TYPE_PARAM = 'param';
const TYPE_INPUT = 'input';
const TYPE_OUTPUT = 'output';
const TYPE_LIGHT = 'light';
const TYPE_CUSTOM = 'custom';
const TYPE_UNKNOWN = 'unknown';

function detectComponentType(fillColor) {
    const hexColor = converHsbaToRgbaHex(fillColor);
    switch(hexColor) {
        case '#FF0000FF':
            return TYPE_PARAM;
        case '#00FF00FF':
            return TYPE_INPUT;
        case '#0000FFFF':
            return TYPE_OUTPUT;
        case '#FF00FFFF':
            return TYPE_LIGHT;
        case '#FFFF00FF':
            return TYPE_CUSTOM;
        default:
            return TYPE_UNKNOWN;
    }
}

function extractComponents(artboard) {
    const componentLayer = artboard.layers.find((layer) => layer.name.toLowerCase() === 'components');
    return componentLayer.elements.map((component) => {
        return {
            ...getComponentCoordinates(component),
            name: component.name,
            type: detectComponentType(component.styleable.fillColor),
        };
    });
}

function generateCircleInputComponent(component, slug) {
    const componentIdNormalized = component.name.replaceAll(/_input/ig, '').toUpperCase();
    return `addInput(createInputCentered<PJ301MPort>(mm2px(Vec(${component.x}, ${component.y})), module, Viral_Modules_${slug}::${componentIdNormalized}_INPUT));`;
}

function generateCircleOutputComponent(component, slug) {
    const componentIdNormalized = component.name.replaceAll(/_output/ig, '').toUpperCase();
    return `addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(${component.x}, ${component.y})), module, Viral_Modules_${slug}::${componentIdNormalized}_OUTPUT));`;
}

function generateCircleParamComponent(component, slug) {
    const componentIdNormalized = component.name.replaceAll(/_param/ig, '').toUpperCase();
    return `addParam(createParamCentered<RoundBlackKnob>(mm2px(Vec(${component.x}, ${component.y})), module, Viral_Modules_${slug}::${componentIdNormalized}_PARAM));`;
}

function indent(str, count = 4) {
    return str.split('\n').map(s => `${new Array(count).fill(' ').join('')}${s}`).join('\n');
}

function generateParamEnum(components) {
    const params = components.filter((c) => c.type === TYPE_PARAM);

    let enumBlock = `enum ParamIds {\n`;
    params.forEach((p) => {
        const componentIdNormalized = p.name.replaceAll(/_param/ig, '').toUpperCase();
        enumBlock += `    ${componentIdNormalized}_PARAM,\n`;
    });
    enumBlock += `    NUM_PARAMS
};`;
    return enumBlock;
}

function generateInputEnum(components) {
    const inputs = components.filter((c) => c.type === TYPE_INPUT);

    let enumBlock = `enum InputIds {\n`;
    inputs.forEach((p) => {
        const componentIdNormalized = p.name.replaceAll(/_input/ig, '').toUpperCase();
        enumBlock += `    ${componentIdNormalized}_INPUT,\n`;
    });
    enumBlock += `    NUM_INPUTS
};`;
    return enumBlock;
}

function generateOutputEnum(components) {
    const outputs = components.filter((c) => c.type === TYPE_OUTPUT);

    let enumBlock = `enum OutputIds {\n`;
    outputs.forEach((p) => {
        const componentIdNormalized = p.name.replaceAll(/_output/ig, '').toUpperCase();
        enumBlock += `    ${componentIdNormalized}_OUTPUT,\n`;
    });
    enumBlock += `    NUM_OUTPUTS
};`;
    return enumBlock;
}

function generateCppClass(moduleName, components) {
    const params = components.filter(c => c.type === TYPE_PARAM);
    const inputs = components.filter(c => c.type === TYPE_INPUT);
    const outputs = components.filter(c => c.type === TYPE_OUTPUT);

    return `// This file was auto-generated by scripts/generate_widget_class.js
#include "plugin.hpp"

struct Viral_Modules_${moduleName} : Module {
${indent(generateParamEnum(components))}

${indent(generateInputEnum(components))}

${indent(generateOutputEnum(components))}

    Viral_Modules_${moduleName}() {
        config(NUM_PARAMS, NUM_INPUTS, NUM_OUTPUTS, 0);
    }

    void process(const ProcessArgs &args) override {

    }
};


struct Viral_Modules_${moduleName}Widget : ModuleWidget {
    Viral_Modules_${moduleName}Widget(Viral_Modules_${moduleName} *module) {
        setModule(module);
        setPanel(APP->window->loadSvg(asset::plugin(pluginInstance, "res/${moduleName}.svg")));

        addChild(createWidget<ScrewSilver>(Vec(RACK_GRID_WIDTH, 0)));
        addChild(createWidget<ScrewSilver>(Vec(box.size.x - 2 * RACK_GRID_WIDTH, 0)));
        addChild(createWidget<ScrewSilver>(Vec(RACK_GRID_WIDTH, RACK_GRID_HEIGHT - RACK_GRID_WIDTH)));
        addChild(createWidget<ScrewSilver>(Vec(box.size.x - 2 * RACK_GRID_WIDTH, RACK_GRID_HEIGHT - RACK_GRID_WIDTH)));

        // Params
${indent(params.map(p => generateCircleParamComponent(p, moduleName)).join('\n'), 8)}

        // Inputs
${indent(inputs.map(i => generateCircleInputComponent(i, moduleName)).join('\n'), 8)}

        // Outputs
${indent(outputs.map(o => generateCircleOutputComponent(o, moduleName)).join('\n'), 8)}
    }
};


Model *modelViral_Modules_${moduleName} = createModel<Viral_Modules_${moduleName}, Viral_Modules_${moduleName}Widget>("Viral-Modules-${moduleName}");`;
}

if(require.main === module) {
    if(process.argv.length < 3) {
        console.error('please supply the path to a .vectornator file');
        process.exit(1);
    }
    const moduleName = path.basename(process.argv[2]).replace('\.vectornator', '');

    const vectornatorFile = openVectornatorFile(process.argv[2]);
    const artboard = vectornatorFile.artboards[0];
    const components = extractComponents(artboard);
    console.log(generateCppClass(moduleName, components));
}