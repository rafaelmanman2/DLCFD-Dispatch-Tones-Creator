/**
 * To Do:
 *  Consider the addition of the shortened_command skipping "/queue sound_1: " to HTML and in general, see ref_anchor1
 */

// HTML DOM References
const dispatched_units_input = document.getElementById("dispatched_units");
const dispatched_units_clear = document.getElementById("dispatched_units_clear");
const dispatched_units_manual_input = document.getElementById("dispatched_units_manual_entry");
const box_number_input = document.getElementById("box_number");
const incident_type_input = document.getElementById("incident_type");
const incident_channel_input = document.getElementById("incident_channel");
const dispatch_format_input = document.getElementById("dispatch_format");

const create_tones_button = document.getElementById("create_tones");

const results_hr = document.querySelector("hr");
const results_div = document.getElementById("results_div");
const station1_results = document.getElementById("station1_results");
const station2_results = document.getElementById("station2_results");
const station3_results = document.getElementById("station3_results");
const station4_results = document.getElementById("station4_results");

// Other Variables
var dispatched_units = [];
var dispatched_stations = [];
const station_result_divs = [station1_results, station2_results, station3_results, station4_results];
var box_number = box_number_input.text;
var incident_type = incident_type_input.options[incident_type_input.selectedIndex].text;
var incident_channel = incident_channel_input.options[incident_channel_input.selectedIndex].text;
var dispatch_format = dispatch_format_input.options[dispatch_format_input.selectedIndex].text.split(" ");

// Stored Dispatch Sounds
const attention_tones = {"FD": "98464", "EMS": "98463"};
const box_number_sounds = {
    "101": "", "102": "98536", "103": "110073", "104": "", "105": "", "106": "", "107": "", "108": "", "109": "", "110": "98543", "111": "", "112": "",
    "201": "", "202": "98555", "203": "98556", "204": "", "205": "98558", "206": "98559", "207": "", "208": "", "209": "",
    "301": "98569", "302": "", "303": "", "304": "", "305": "", "306": "", "307": "", "308": "", "309": "", "310": "", "311": "",
    "401": "", "402": "98604", "403": "98605", "404": "", "405": "", "406": "", "407": "", "408": "", "409": ""
};
const incident_type_sounds = {
    "Building Fire": "100536", "Fire Alarm": "98622", "Brush Fire": "122973", "Odor Investigation": "98629", "Smoke Investigation": "98632",
    "Traumatic Injury": "98622", "Unknown Problem": "98524", "Major Traffic Accident": "98881", "Full Arrest": "98499"
};
const unit_sounds = {
    "E1": "98474", "Tk1": "98484", "R1": "98479", "A1-1": "122971", "A1-2": "", "Br1": "98468", "U1": "98487",
    "E2": "98475", "Tk2": "98485", "Sq2": "125905", "A2": "98466",
    "E3": "98476", "Sq3": "98482", "Br3": "98469", "U3": "", "T3": "98483", "HM3": "",
    "E4": "115676", "Tk4": "98486", "R4": "123355", "A4": "115675",
    "DO21": "122659", "DO22": "117646", "M1": "98478", "M22": "", "BC3": "101689", "BC4": "103044", "C1": "98470"
};

const incident_channel_sounds = {
    "FD OPS 1": "98532", "FD OPS 2": "98533", "FD OPS 3": "", "FD OPS 4": "",
    "EMS OPS 1": "98528", "EMS OPS 2": "", "EMS OPS 3": ""
}

// Miscellaneous Variables
var units_without_stations = ["DO21", "DO22", "M1", "M22", "BC3", "BC4", "C1"];

/**
  * Updates the styling of the dispatched units list when any of them are clicked
  * @param unit | The unit on the dispatched units list that needs to be updated
  */
function updateDispatchedUnits(unit){
    Array.from(dispatched_units_input.children).forEach((selected_unit) => {
        if(selected_unit.nodeName == "BUTTON" && !selected_unit.disabled && selected_unit.innerHTML == unit){
            if(selected_unit.dataset.selected == "false"){
                selected_unit.dataset.selected = "true";
                dispatched_units.push(unit);
            }else if(selected_unit.dataset.selected == "true"){
                selected_unit.dataset.selected = "false";
                dispatched_units.splice(dispatched_units.indexOf(unit));
            }
        }
    });
    if(dispatched_units.length > 0){
        dispatched_units_clear.removeAttribute("disabled");
    }else{
        dispatched_units_clear.disabled = "true";
    }
}

function clearDispatchedUnits(){
    Array.from(dispatched_units_input.children).forEach((selected_unit) => {
        if(selected_unit.nodeName == "BUTTON" && !selected_unit.disabled && selected_unit.dataset.selected == "true"){
            selected_unit.dataset.selected = "false";
        }
    });
    dispatched_units = [];
    dispatched_units_clear.disabled = "true";
}

/**
 * Creates the dispatch tones based on the provided call details
 */
function createTones(){
    // Disable the create_tones button
    create_tones_button.disabled = "true";
    // Hide the horizontal bar
    results_hr.style.display = "none";
    // Hide the results div
    results_div.style.display = "none";
    // Loop over each station's result div and for each...
    station_result_divs.forEach((station_result_div) => {
        station_result_div.style.display = "none";
    });

    // If dispatched units were manually entered...
    if(dispatched_units_manual_input.value !== ""){
        // Update the list of dispatched units
        dispatched_units = dispatched_units_manual_input.value.split(",");
        // Convert to a set to remove any duplicates
        dispatched_units = [...new Set(dispatched_units)];
    }

    // Update the box number, incident type, incident channel, and dispatch format
    box_number = box_number_input.value;
    incident_type = incident_type_input.options[incident_type_input.selectedIndex].text;
    incident_channel = incident_channel_input.options[incident_channel_input.selectedIndex].text;
    dispatch_format = dispatch_format_input.options[dispatch_format_input.selectedIndex].text.split(" ");
    // Declare and initialize a variable storing the call type based on the string of characters before the first space in the selected incident channel
    var call_type = incident_channel.split(" ")[0];
    // Combine the units, box_number, incident_type, and incident_channel into the dispatch_elements object
    const dispatch_elements = {"BOX": box_number_sounds[box_number], "TYPE": incident_type_sounds[incident_type], "CHANNEL": incident_channel_sounds[incident_channel]};

    // Ensure that any manually entered dispatched_units have been entered correctly
    // Declare and initialize a variable storing a boolean on whether any dispatched_units are entered incorrectly
    var wrongly_dispatched_unit = false;
    // Ensure the manually entered dispatched units matches the pattern provided in the element's pattern attribute
    wrongly_dispatched_unit = dispatched_units_manual_input.validity.patternMismatch;
    // Loop over each dispatched unit and for each...
    dispatched_units.forEach((unit) => {
        if(!(unit in unit_sounds) || unit_sounds.unit == "") wrongly_dispatched_unit = true;
    });

    // Ensure that all the required fields have been completed
    // Declare and initialize a list for the fields requiring completion
    var incomplete_fields = [];
    if(dispatched_units.length == 0){
        incomplete_fields.push("add at least one unit to dispatch");
    }else if(wrongly_dispatched_unit){
        incomplete_fields.push("check your manually entered list of dispatched units");
    }
    if(box_number == ""){
        incomplete_fields.push("add the box number of the call");
    }else if(!(box_number in box_number_sounds)){
        incomplete_fields.push("input a valid box number");
    }else if(box_number_sounds[box_number] == ""){
        incomplete_fields.push("input another box number as this one does not yet have a dispatch sound defined")
    }
    // If the user had at least one field unfilled, alert them of the error and stop creating the tones
    if(incomplete_fields.length > 0){
        alert("Please " + incomplete_fields.join(" and ") + ".");
        // Reenable the create_tones button
        create_tones_button.removeAttribute("disabled");
        // End the execution of the function
        return;
    }

    // Declare variables for the final dispatch tones and initialize them with the base queue command (/queue)
    var full_tones = {"command": "/queue", "shortened_command": "", "list": []};
    var station_tones = {"station1": {"command": "/queue", "shortened_command": "", "list": []}, "station2": {"command": "/queue", "shortened_command": "", "list": []}, "station3": {"command": "/queue", "shortened_command": "", "list": []}, "station4": {"command": "/queue", "shortened_command": "", "list": []}};

    
    // Create the master tones for all stations
    // Clear the old list of dispatched stations
    dispatched_stations = [];

    // Add the attention tone dispatch sound to the full tones list
    full_tones.list.push(attention_tones[call_type]);
    // Loop over each active station and for each of them...
    for(let i=0; i<4; i++){
        // Add the incident channel's dispatch sound to its per-station list
        station_tones["station" + (i + 1)].list.push(attention_tones[call_type]);
    }

    // Loop over each of the elements of the selected dispatch format and for each of them...
    dispatch_format.forEach((dispatch_element) => {
        // If the dispatch element is the units, then...
        if(dispatch_element == "UNITS"){
            // Loop over each of the dispatched units and for each of them...
            dispatched_units.forEach((unit) => {
                // Add the unit's dispatch sound to the full tones list
                full_tones.list.push(unit_sounds[unit]);
                // If the unit has an associated station...
                if(!units_without_stations.includes(unit)){
                    // Define the unit's station as the last character of the unit's name
                    let station_of_unit = unit[unit.length - 1];
                    // Add the unit's dispatch sound to its per-station list
                    station_tones["station" + station_of_unit].list.push(unit_sounds[unit]);
                    // If the unit's station is not already in the list, add the unit's station to the list
                    if(!dispatched_stations.includes(station_of_unit)) dispatched_stations.push(station_of_unit);
                }
            });
        // Otherwise, if the dispatch element is another element that is within the defined dispatch elements, then
        }else if(dispatch_element in dispatch_elements){
            // Add the definition of the dispatch element to the full_tones sound list
            full_tones.list.push(dispatch_elements[dispatch_element]);
            // Loop over each active station and for each of them...
            for(let i=0; i<4; i++){
                // Add the definition of the dispatch element to the station's sound list
                station_tones["station" + (i + 1)].list.push(dispatch_elements[dispatch_element]);
            }
        } 
    });

    /*
    // Add the appropriate attention tone based on the call type
    full_tones.list.push(attention_tones[call_type]);
    // Add the appropriate sound based on the box number
    full_tones.list.push(box_number_sounds[box_number]);
    // Add the appropriate sound based on the incident type
    full_tones.list.push(incident_type_sounds[incident_type]);
    // Loop over the dispatched stations and for each one...
    for(let i=0; i<4; i++){
        // Declare and initialize a variable storing a reference to the station's dispatch sounds list
        let station_dispatch_sounds = station_tones["station" + (i + 1)].list
        // Add the appropriate attention tone based on the call type
        station_dispatch_sounds.push(attention_tones[call_type]);
        // Add the appropriate sound based on the box number
        station_dispatch_sounds.push(box_number_sounds[box_number]);
        // Add the appropriate sound based on the incident type
        station_dispatch_sounds.push(incident_type_sounds[incident_type]);
    }

    // Clear the old list of dispatched stations
    dispatched_stations = [];
    // Loop over the dispatched units and for each one...
    dispatched_units.forEach((unit) => {
        // Add the unit's dispatch sound to the full tones list
        full_tones.list.push(unit_sounds[unit]);
        // If the unit has an associated station...
        if(!units_without_stations.includes(unit)){
            // Define the unit's station as the last character of the unit's name
            let station_of_unit = unit[unit.length - 1];
            // Add the unit's dispatch sound to its per-station list
            station_tones["station" + station_of_unit].list.push(unit_sounds[unit]);
            // If the unit's station is not already in the list, add the unit's station to the list
            if(!dispatched_stations.includes(station_of_unit)) dispatched_stations.push(station_of_unit);
        }
    });

    // Add the incident channel's dispatch sound to the full tones list
    full_tones.list.push(incident_channel_sounds[incident_channel]);
    // Loop over the dispatched stations and for each one...
    dispatched_stations.forEach((station) => {
        // Add the incident channel's dispatch sound to its per-station list
        station_tones["station" + station].list.push(incident_channel_sounds[incident_channel]);
    });
    */

    // Convert the list of sound IDs into a command
    // Loop over each sound in the list of dispatch sounds for the full dispatch and for each sound...
    for(let i=0; i<full_tones.list.length; i++){
        // Add the " sound#: " key to the full command string
        full_tones.command += " sound_" + (i + 1) + ": ";
        // Add the dispatch sound to the full command string
        full_tones.command += full_tones.list[i];

        // Add the " sound#: " key to the shortened command string if it isn't the first sound
        if(i > 0) full_tones.shortened_command += " sound_" + (i + 1) + ": ";
        // Add the dispatch sound to the shortened command string
        full_tones.shortened_command += full_tones.list[i];
    }
    // ref_anchor1
    // Add the final universal command to the associated HTML element
    results_div.querySelector("code").innerHTML = full_tones.command;

    // Create the tones specific to each of the dispatched stations
    // If more than one station has been dispatched
    if(dispatched_stations.length > 1){
        // Loop over the dispatched stations and for each one...
        dispatched_stations.forEach((station) => {
            // Declare and initialize a variable storing a reference to the station's dispatch sounds
            let station_dispatch_sounds = station_tones["station" + station]
            // Loop over each sound in the list of dispatch sounds for the station's dispatch and for each sound...
            for(let i=0; i<station_dispatch_sounds.list.length; i++){
                // Add the " sound#: " key to the full command string
                station_dispatch_sounds.command += " sound_" + (i + 1) + ": ";
                // Add the dispatch sound to the full command string
                station_dispatch_sounds.command += station_dispatch_sounds.list[i];
                
                // Add the " sound#: " key to the shortened command string if it isn't the first sound
                if(i > 0) station_dispatch_sounds.shortened_command += " sound_" + (i + 1) + ": ";
                // Add the dispatch sound to the shortened command string
                station_dispatch_sounds.shortened_command += station_dispatch_sounds.list[i];
            }
            // ref_anchor1
            // Add the final per-station command to its associated HTML element
            station_result_divs[station - 1].querySelector("code").innerHTML = station_dispatch_sounds.command;
            // If the station's results div is not the first one, add a left border
            if(Number(station) !== Math.min(...dispatched_stations.map((x) => Number(x)))) station_result_divs[station - 1].style.borderLeft = "0.25px solid var(--primary2)";
            // Reveal the station's results div
            station_result_divs[station - 1].style.display = "block";
        });
    }

    // Reveal the necessary HTML elements
    // Reveal the horizontal bar
    results_hr.style.display = "block";
    // Reveal the results div
    results_div.style.display = "grid";
    // Adjust the number of columns in the results_div depending on the number of stations dispatched
    results_div.style.gridTemplateColumns = "repeat(" + (dispatched_stations.length > 0 ? dispatched_stations.length : 1) + ", minmax(0, 1fr))";
    // Adjust the number of columns spanned by the universal results_div dpending on the number of stations dispatched
    results_div.querySelector("div").style.gridColumn = "1 / span " + (dispatched_stations.length > 0 ? dispatched_stations.length : 1);
    
    // Reenable the create_tones button
    create_tones_button.removeAttribute("disabled");

    // Scroll to the results div
    location.hash = "#results_div";
}

function copyCommand(type_of_command){
    var text_to_copy;
    if(type_of_command == "universal"){
        text_to_copy = results_div.querySelector("code").innerHTML;
    }else if(type_of_command.includes("station")){
        text_to_copy = station_result_divs[Number(type_of_command[-1]) - 1].querySelector("code").innerHTML;
    }
    navigator.clipboard.writeText(text_to_copy);
    alert("Copied!");
}

// When the webpage loads
window.onload = () => {
    // For each button representing a unit in the dispatched_units_input...
    dispatched_units_input.querySelectorAll("button").forEach((button) => {
        // If the unit does not have a dispatch sound defined, disable its associated button
        if(unit_sounds[button.innerHTML] == "") button.disabled = "true";
    });

    // For each suggestion representing a box number in the box number datalist...
    document.querySelector("datalist").querySelectorAll("option").forEach((option) => {
        // If the box number does not have a dispatch sound defined, disable its associated suggestion
        if(box_number_sounds[option.value] == "") option.disabled = "true";
    });

    // Set the footer
    document.getElementById("year").innerHTML = new Date().getFullYear();
}