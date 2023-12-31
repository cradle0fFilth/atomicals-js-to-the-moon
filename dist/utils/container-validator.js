"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContainerAll = exports.validateContainerMetadata = exports.validateContainerItemsForDmint = exports.validateContainerItems = exports.validateContainerTraits = exports.validateTrait = void 0;
// A trait
const validateTrait = (trait) => {
    if (!trait) {
        return false;
    }
};
exports.validateTrait = validateTrait;
const validateContainerTraits = (traits) => {
    if (!Array.isArray(traits)) {
        return false;
    }
    for (const trait of traits) {
        if (!(0, exports.validateTrait)(trait)) {
            return false;
        }
    }
    return false;
};
exports.validateContainerTraits = validateContainerTraits;
const validateContainerItems = (items) => {
    return false;
};
exports.validateContainerItems = validateContainerItems;
const validateContainerItemsForDmint = (dmint) => {
    return false;
};
exports.validateContainerItemsForDmint = validateContainerItemsForDmint;
const validateContainerMetadata = (meta) => {
    return false;
};
exports.validateContainerMetadata = validateContainerMetadata;
const validateContainerAll = (data) => {
    if (!data['traits']) {
        return false;
    }
    if (!data['meta']) {
        return false;
    }
    if (!data['items']) {
        return false;
    }
    if (!data['dmint']) {
        return false;
    }
    return (0, exports.validateContainerTraits)(data['traits']) &&
        (0, exports.validateContainerTraits)(data['meta']) &&
        (0, exports.validateContainerTraits)(data['items']) &&
        (0, exports.validateContainerTraits)(data['dmint']);
};
exports.validateContainerAll = validateContainerAll;
