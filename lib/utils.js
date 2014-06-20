// utils.js
// Static utility functions shared by modules

/**
 * Takes a number and adds a comma after every third value digit.
 * For example, "200000.12313" becomes "200,000.12313".
 *
 * @param numberString A number, either as a string or as a number.
 * @returns {string} A human-friendly version of the number, or the input if the numberString
 *                   parameter could not be parsed.
 */
var addCommas = function addCommas(numberString) {
    var num = Number(numberString);
    if(!isNaN(num)) {
        var parts = num.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    } else {
        return numberString;
    }
};

module.exports = {
    addCommas: addCommas
};
