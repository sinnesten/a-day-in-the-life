$(document).ready(function () {
    var location = "Home";
    var goals = {
        "Obtain cake ingredient": false,
        "Train two of": {
            "Woodcutting": false,
            "Agility": false,
            "Mining": false
        },
        "Talk to Ali the Wise": false
    }
    var time = 13;
    var items = [];
    var coins = 2000;
    var achievements = [];

    var currentOptions = {};
    var index = $("#index").val();

    // TODO: let player skip to end of day
    
    loadTextAndOptions(index);
    $("#input").on("keyup", processInput);

    function processInput(event) {
        if (event && event.key !== "Enter") {
            return;
        }

        var choice = (event.target.value).replace(".", "");
        if (!Object.keys(currentOptions).includes(choice)) {
            $("#error").text("Sorry, I didn't understand that.");
            $("#input").val("");
            return;
        }

        // TODO: implement tea handling

        index = script[index]["options"][currentOptions[choice]][0];
        loadTextAndOptions(index);

        if (index === "1" || Object.keys(script[index]).includes("goals")) {
            // TODO: process goal change
            loadGoals();
            console.log("loaded");
        }

        if (["2", "3", "4"].includes(index)) {
            loadTime();
        }

        if (Object.keys(script[index]).includes("time")) {
            time -= script[index]["time"];
            loadTime();
        }

        if (Object.keys(script[index]).includes("gain")) {
            items.push(script[index]["gain"]);
            loadItems();
        }

        if (Object.keys(script[index]).includes("loss")) {
            if (script[index]["loss"].includes(" coins")) {
                coins -= parseInt(script[index]["loss"].split(" ")[0]);
            }
            else {
                items.splice(items.indexOf(script[index]["loss"]), 1);
            }
            loadItems();
        }

        if (Object.keys(script[index]).includes("achievement")) {
            achievements.push(script[index]["achievement"]);
        }

        $("#input").val("");
    }

    function loadTextAndOptions(index) {
        $("#error").empty();
        $("#text").empty();
        $("#text-options").empty();
        currentOptions = {};

        if (Object.keys(script[index]).includes("location")) {
            location = script[index]["location"];
        }
        $("#location").text(location);

        var text = script[index]["text"];
        var options = script[index]["options"];

        for (let paragraph of text) {
            $("#text").append("<p>" + paragraph + "</p>");
        }

        // TODO: hide "item" options if the player does not have the required item
        var i = 1;
        for (let option of Object.keys(options)) {
            $("#text-options").append("<p>" + i + ". " + option + "</p>");
            currentOptions[i] = option;
            i++;
        }
    }

    function loadGoals() {
        // TODO: strike through complete goals
        $("#goals").empty();
        goalString = "";
        for (let goal in goals) {
            goalString += "<li>" + goal;
            if (typeof goals[goal] === "object") {
                goalString += ":<ul>";
                for (let subGoal in goals[goal]) {
                    goalString += "<li>" + subGoal + "</li>";
                }
                goalString += "</ul>";
            }
            goalString += "</li>";
        }
        $("#goals").append(goalString);
    }

    function loadItems() {
        $("#items").empty();
        for (let item of items) {
            $("#items").append("<li>" + item + "</li>");
        }
    }

    function loadTime() {
        // TODO: format time
        $("#time").text("Time left: " + Math.min(12, time));
    }
});