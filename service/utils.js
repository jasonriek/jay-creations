/*

UTILITY FUNCTIONS WILL GO HERE

*/

function capitalize(string)
{
    let split_string = string.split(' ')
    for(let i=0; i<split_string.length; i++) {
        split_string[i] = split_string[i][0].toUpperCase() + split_string[i].slice(1).toLowerCase();
    }
    return split_string.join(' ');
}

module.exports = {
    capitalize
}