let war = false;

function enable(){ war = true; }
function disable(){ war = false; }
function status(){ return war; }

module.exports = { enable, disable, status };
