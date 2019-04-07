let util = {}

util.renameKeys = (keysMap, obj) => Object
    .keys(obj)
    .reduce((acc, key) => ({
        ...acc,
        ...{ [keysMap[key] || key]: obj[key] }
}), {});


module.exports = util;



