$(document).ready(function () {
    var location = "Home";
    var locationIndex = "0";
    var goals = {
        "Obtain cake ingredient": false,
        "Train two of": {
            "Woodcutting": false,
            "Agility": false,
            "Mining": false
        },
        "Talk to Ali the Wise": false
    }
    var time = 14;
    var items = [];
    var coins = 8000;
    var achievements = {};

    var currentOptions = {};
    var index = "0";
    var isEpilogue = false;

    loadTextAndOptions(index);
    $("#input").on("keyup", processInput);

    function processInput(event) {
        if (event && event.key !== "Enter") {
            return;
        }

        var choice = (event.target.value).replace(".", "");
        if ((time <= 0 || (choice.toLowerCase() === "end")) && !isEpilogue) {
            beginEpilogue();
            return;
        }
        else if (!Object.keys(currentOptions).includes(choice)) {
            $("#error").text("Sorry, I didn't understand that.");
            $("#input").val("");
            return;
        }

        if (index === "200") {
            index = "201";
        }
        else if (script[index]["options"][currentOptions[choice]].length > 1) {
            index = script[index]["options"][currentOptions[choice]].shift();
        }
        else {
            index = script[index]["options"][currentOptions[choice]][0];
        }
        if (index === "-1") {
            index = locationIndex;
        }
        else if (index === "1000") {
            index = getEnding();
        }
        loadTextAndOptions(index);

        if (index === "1" || Object.keys(script[index]).includes("goals")) {
            updateGoals(script[index]["goals"]);
            loadGoals();
        }

        if (["2", "3", "4"].includes(index)) {
            loadCoins();
            loadTime();
            $("#items-label").show();
        }

        if (Object.keys(script[index]).includes("time")) {
            time -= script[index]["time"];
            loadTime();
        }

        if (Object.keys(script[index]).includes("gain")) {
            for (let item of script[index]["gain"]) {
                if (!items.includes(item)) {
                    items.push(item);
                }
            }
            loadItems();
        }

        if (Object.keys(script[index]).includes("loss")) {
            for (let item of script[index]["loss"]) {
                if (item.includes(" coins")) {
                    coins -= parseInt(item.split(" ")[0]);
                    loadCoins();
                }
                else if (items.includes(item)) {
                    items.splice(items.indexOf(item), 1);
                }
            }
            loadItems();
        }

        if (Object.keys(script[index]).includes("achievement")) {
            achievements[script[index]["achievement"][0]] = script[index]["achievement"][1];
        }

        $("#input").val("");
    }

    function beginEpilogue() {
        $("#time").hide();
        $("#input").val("");
        choice = "1";
        index = "200";
        isEpilogue = true;

        loadTextAndOptions(index);
    }

    function getEnding() {
        var numSkills = 0;
        for (let goal in goals["Train two of"]) {
            if (goals["Train two of"][goal] === true) {
                numSkills++;
            }
        }

        if (numSkills < 2) {
            return "207";
        }
        else if (goals["Talk to Ali the Wise"] === false) {
            return "208";
        }
        else {
            return "209";
        }
    }

    function loadAchievements() {
        for (let achievement in achievements) {
            $("#text").append("<hr><p><b>" + achievement + "</b><p>");
            $("#text").append("<p>" + achievements[achievement] + "<p>");
        }
    }

    function loadTextAndOptions(index) {
        $("#error").empty();
        $("#text").empty();
        $("#text-options").empty();
        currentOptions = {};

        if (Object.keys(script[index]).includes("location")) {
            location = script[index]["location"];
            locationIndex = index;
        }
        $("#location").text(location);

        var text = script[index]["text"];
        var options = script[index]["options"];

        for (let paragraph of text) {
            $("#text").append("<p>" + paragraph + "</p>");
        }

        if (index === "210") {
            loadAchievements();
            $("#input").hide();
        }

        var i = 1;
        for (let option of Object.keys(options)) {
            // prevent user from selecting options they don't have the resources for
            if (option.includes("[")) {
                var startIndex = option.search("\\[") + 1;
                var endIndex = option.search("\\]");
                if (option.includes("coins]")) {
                    requiredCoins = parseInt(option.substring(startIndex, endIndex - 6));
                    if (coins < requiredCoins) {
                        continue;
                    }
                }
                else {
                    var requiredItem = option.substring(startIndex, endIndex);
                    if (!items.includes(requiredItem)) {
                        continue;
                    }
                }
            }

            $("#text-options").append("<p>" + i + ". " + option + "</p>");
            currentOptions[i] = option;
            if (isEpilogue) {
                break; // epilogue is linear, only one available choice
            }
            i++;
        }
    }

    function updateGoals(finishedGoal) {
        for (let goal in goals) {
            if (goal === finishedGoal) {
                goals[goal] = true;
                return;
            }
            if (typeof goals[goal] === "object") {
                for (let subGoal in goals[goal]) {
                    if (subGoal === finishedGoal) {
                        goals[goal][subGoal] = true;
                        return;
                    }
                }
            }
        }
    }

    function loadGoals() {
        $("#goals-label").show();
        $("#goals").empty();
        goalString = "";
        for (let goal in goals) {
            if (goals[goal] === true) {
                goalString += "<li style=\"text-decoration: line-through !important\">" + goal;
            }
            else {
                goalString += "<li>" + goal;
            }
            if (typeof goals[goal] === "object") {
                goalString += ":<ul>";
                for (let subGoal in goals[goal]) {
                    if (goals[goal][subGoal] === true) {
                        goalString += "<li style=\"text-decoration: line-through !important\">" + subGoal + "</li>";
                    }
                    else {
                        goalString += "<li>" + subGoal + "</li>";
                    }
                }
                goalString += "</ul>";
            }
            goalString += "</li>";
        }
        $("#goals").append(goalString);
    }

    function loadItems() {
        $("#items").empty();
        items.sort();
        for (let item of items) {
            $("#items").append("<li>" + item + "</li>");
        }
    }

    function loadCoins() {
        $("#coins").text("Coins: " + coins);
    }

    function loadTime() {
        if (time <= 0) {
            $("#time").text("Time left: 0 minutes");
            return;
        }

        var partialHours = time - Math.floor(time);
        if (Math.floor(partialHours) > 0) {
            $("#time").text("Time left: " + (partialHours * 60) + " minutes");
        }
        else {
            var formattedTime = Math.floor(time) === 1 ? "1 hour" : Math.floor(time) + " hours";
            if (partialHours > 0) {
                formattedTime += " " + (partialHours * 60) + " minutes";
            }
            $("#time").text("Time left: " + formattedTime);
        }
    }
});