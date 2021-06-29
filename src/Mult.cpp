#include "plugin.hpp"


struct Viral_Modules_Mult : Module {
    enum ParamIds {
        NUM_PARAMS
    };
    enum InputIds {
        INPUT_0_INPUT,
        INPUT_1_INPUT,
        INPUT_2_INPUT,
        INPUT_3_INPUT,
        INPUT_4_INPUT,
        INPUT_5_INPUT,
        NUM_INPUTS
    };
    enum OutputIds {
        OUTPUT_0_1_OUTPUT,
        OUTPUT_0_2_OUTPUT,
        OUTPUT_0_0_OUTPUT,
        OUTPUT_1_1_OUTPUT,
        OUTPUT_1_2_OUTPUT,
        OUTPUT_1_0_OUTPUT,
        OUTPUT_2_1_OUTPUT,
        OUTPUT_2_2_OUTPUT,
        OUTPUT_2_0_OUTPUT,
        OUTPUT_3_1_OUTPUT,
        OUTPUT_3_2_OUTPUT,
        OUTPUT_3_0_OUTPUT,
        OUTPUT_4_1_OUTPUT,
        OUTPUT_4_2_OUTPUT,
        OUTPUT_4_0_OUTPUT,
        OUTPUT_5_1_OUTPUT,
        OUTPUT_5_2_OUTPUT,
        OUTPUT_5_0_OUTPUT,
        NUM_OUTPUTS
    };
    enum LightIds {
        NUM_LIGHTS
    };

    Viral_Modules_Mult() {
        config(NUM_PARAMS, NUM_INPUTS, NUM_OUTPUTS, NUM_LIGHTS);
    }

    std::map<int, std::vector<int>> input_output_map = {
            {
                    Viral_Modules_Mult::INPUT_0_INPUT,
                    {
                            Viral_Modules_Mult::OUTPUT_0_0_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_0_1_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_0_2_OUTPUT
                    }
            },
            {
                    Viral_Modules_Mult::INPUT_1_INPUT,
                    {
                            Viral_Modules_Mult::OUTPUT_1_0_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_1_1_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_1_2_OUTPUT
                    }
            },
            {
                    Viral_Modules_Mult::INPUT_2_INPUT,
                    {
                            Viral_Modules_Mult::OUTPUT_2_0_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_2_1_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_2_2_OUTPUT
                    }
            },
            {
                    Viral_Modules_Mult::INPUT_3_INPUT,
                    {
                            Viral_Modules_Mult::OUTPUT_3_0_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_3_1_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_3_2_OUTPUT
                    }
            },
            {
                    Viral_Modules_Mult::INPUT_4_INPUT,
                    {
                            Viral_Modules_Mult::OUTPUT_4_0_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_4_1_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_4_2_OUTPUT
                    }
            },
            {
                    Viral_Modules_Mult::INPUT_5_INPUT,
                    {
                            Viral_Modules_Mult::OUTPUT_5_0_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_5_1_OUTPUT,
                            Viral_Modules_Mult::OUTPUT_5_2_OUTPUT
                    }
            }
    };

    void process(const ProcessArgs &args) override {
        for(auto io_pair: input_output_map) {
            auto channels = inputs[io_pair.first].getChannels();
            auto voltages = inputs[io_pair.first].getVoltages();
            for(auto out: io_pair.second) {
                outputs[out].setChannels(channels);
                outputs[out].writeVoltages(voltages);
            }
        }
    }
};


struct Viral_Modules_MultWidget : ModuleWidget {
    Viral_Modules_MultWidget(Viral_Modules_Mult *module) {
        setModule(module);
        setPanel(APP->window->loadSvg(asset::plugin(pluginInstance, "res/6x3Mult.svg")));

        addChild(createWidget<ScrewSilver>(Vec(RACK_GRID_WIDTH, 0)));
        addChild(createWidget<ScrewSilver>(Vec(box.size.x - 2 * RACK_GRID_WIDTH, 0)));
        addChild(createWidget<ScrewSilver>(Vec(RACK_GRID_WIDTH, RACK_GRID_HEIGHT - RACK_GRID_WIDTH)));
        addChild(createWidget<ScrewSilver>(Vec(box.size.x - 2 * RACK_GRID_WIDTH, RACK_GRID_HEIGHT - RACK_GRID_WIDTH)));

        addInput(createInputCentered<PJ301MPort>(mm2px(Vec(9.493, 23.316)), module, Viral_Modules_Mult::INPUT_0_INPUT));
        addInput(createInputCentered<PJ301MPort>(mm2px(Vec(9.493, 38.662)), module, Viral_Modules_Mult::INPUT_1_INPUT));
        addInput(createInputCentered<PJ301MPort>(mm2px(Vec(9.493, 54.008)), module, Viral_Modules_Mult::INPUT_2_INPUT));
        addInput(createInputCentered<PJ301MPort>(mm2px(Vec(9.493, 69.199)), module, Viral_Modules_Mult::INPUT_3_INPUT));
        addInput(createInputCentered<PJ301MPort>(mm2px(Vec(9.493, 84.393)), module, Viral_Modules_Mult::INPUT_4_INPUT));
        addInput(createInputCentered<PJ301MPort>(mm2px(Vec(9.493, 99.845)), module, Viral_Modules_Mult::INPUT_5_INPUT));

        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(32.361, 23.407)), module,
                                                   Viral_Modules_Mult::OUTPUT_0_1_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(42.523, 23.447)), module,
                                                   Viral_Modules_Mult::OUTPUT_0_2_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(22.313, 23.456)), module,
                                                   Viral_Modules_Mult::OUTPUT_0_0_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(32.228, 38.749)), module,
                                                   Viral_Modules_Mult::OUTPUT_1_1_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(42.391, 38.789)), module,
                                                   Viral_Modules_Mult::OUTPUT_1_2_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(22.181, 38.797)), module,
                                                   Viral_Modules_Mult::OUTPUT_1_0_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(32.306, 54.059)), module,
                                                   Viral_Modules_Mult::OUTPUT_2_1_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(42.468, 54.1)), module,
                                                   Viral_Modules_Mult::OUTPUT_2_2_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(22.258, 54.108)), module,
                                                   Viral_Modules_Mult::OUTPUT_2_0_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(32.356, 69.367)), module,
                                                   Viral_Modules_Mult::OUTPUT_3_1_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(42.519, 69.408)), module,
                                                   Viral_Modules_Mult::OUTPUT_3_2_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(22.309, 69.416)), module,
                                                   Viral_Modules_Mult::OUTPUT_3_0_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(32.365, 84.457)), module,
                                                   Viral_Modules_Mult::OUTPUT_4_1_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(42.528, 84.498)), module,
                                                   Viral_Modules_Mult::OUTPUT_4_2_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(22.318, 84.506)), module,
                                                   Viral_Modules_Mult::OUTPUT_4_0_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(32.363, 99.906)), module,
                                                   Viral_Modules_Mult::OUTPUT_5_1_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(42.526, 99.946)), module,
                                                   Viral_Modules_Mult::OUTPUT_5_2_OUTPUT));
        addOutput(createOutputCentered<PJ301MPort>(mm2px(Vec(22.315, 99.954)), module,
                                                   Viral_Modules_Mult::OUTPUT_5_0_OUTPUT));
    }
};


Model *modelViral_Modules_Mult = createModel<Viral_Modules_Mult, Viral_Modules_MultWidget>("Viral-Modules-Mult");