/**
 * Copyright 2018 Bart Butenaers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 module.exports = function(RED) {
    var settings = RED.settings;
    var convert = require('convert-units');

    function UnitConverterNode(config) {
        RED.nodes.createNode(this,config);
        this.inputUnit   = config.inputUnit;
        this.outputUnit  = config.outputUnit;
        this.inputField  = config.inputField;
        this.outputField = config.outputField;
        this.name        = config.name;

        var node = this;

        node.on("input", function(msg) {
            try {
                // Get the input value from the specified message field
                var inputValue = RED.util.getMessageProperty(msg, node.inputField);
            } 
            catch(err) {
                node.error("Error getting value from msg." + node.inputField + " : " + err.message);
                return;
            }
            
            var convertedValue = convert(inputValue).from(node.inputUnit).to(node.outputUnit)
            
            try {
                // Set the converted value in the specified message field
                RED.util.setMessageProperty(msg, node.outputField, convertedValue, true);
            } catch(err) {
                node.error("Error setting value in msg." + node.outputField + " : " + err.message);
            }

            node.send(msg);
        });
    }

    RED.nodes.registerType("unit-converter", UnitConverterNode);
    
    // Make all the available types accessible for the node's config screen
    RED.httpAdmin.get('/unit-converter/:cmd', /*RED.auth.needsPermission('unitconverter.read'),*/ function(req, res){
        var node = RED.nodes.getNode(req.params.id);
        
        if (req.params.cmd === "categories") {
            // Return a list of all available categories (mass, length, ...)
            res.json(convert().measures());
        }
        else {
            // Return a list of all available units for the specified category.
            // Each unit is an object on its own:
            //     [{
            //         abbr: 'kg',
            //         measure: 'mass',
            //         system: 'metric',
            //         singular: 'Kilogram',
            //         plural: 'Kilograms'
            //      }, ...]  
            res.json(convert().list(req.params.cmd));
        }
    });

}
