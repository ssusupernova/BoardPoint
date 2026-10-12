"use strict";
/**
 * BoardPoint renter preferences checklist.
 *
 * The checklist is saved on-device per account (SecureStore / localStorage on
 * web), mirroring the local auth service. Validation runs on the raw form
 * values before saving so a submission with missing required fields is caught
 * inline on the screen.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOUSE_RULE_OPTIONS = exports.NICE_TO_HAVE_OPTIONS = exports.AMENITY_OPTIONS = exports.OCCUPANT_OPTIONS = exports.ROOM_TYPE_OPTIONS = exports.RADIUS_OPTIONS = void 0;
exports.optionLabel = optionLabel;
exports.createDefaultForm = createDefaultForm;
exports.validateChecklist = validateChecklist;
exports.hasErrors = hasErrors;
exports.toChecklist = toChecklist;
exports.toForm = toForm;
exports.loadChecklist = loadChecklist;
exports.saveChecklist = saveChecklist;
const storage_1 = require("@/services/storage");
const date_1 = require("@/utils/date");
exports.RADIUS_OPTIONS = [
    { label: 'Within 1 km', value: '1' },
    { label: 'Within 2 km', value: '2' },
    { label: 'Within 3 km', value: '3' },
    { label: 'Within 5 km', value: '5' },
    { label: 'Within 10 km', value: '10' },
];
exports.ROOM_TYPE_OPTIONS = [
    { label: 'Private room', value: 'private' },
    { label: 'Shared room', value: 'shared' },
];
exports.OCCUPANT_OPTIONS = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4+', value: '4' },
];
exports.AMENITY_OPTIONS = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'bathroom', label: 'Private bathroom' },
    { id: 'aircon', label: 'Air conditioning' },
    { id: 'kitchen', label: 'Kitchen access' },
    { id: 'water', label: 'Water included' },
    { id: 'electricity', label: 'Electricity included' },
];
exports.NICE_TO_HAVE_OPTIONS = [
    { id: 'furnished', label: 'Furnished' },
    { id: 'laundry', label: 'Laundry area' },
];
exports.HOUSE_RULE_OPTIONS = [
    { id: 'no-curfew', label: 'No curfew' },
    { id: 'non-smoking', label: 'Non-smoking' },
    { id: 'visitors', label: 'Visitors allowed' },
    { id: 'pets', label: 'Pets allowed' },
];
function optionLabel(options, id) {
    return options.find((option) => option.id === id)?.label;
}
function createDefaultForm() {
    const moveIn = new Date();
    moveIn.setDate(moveIn.getDate() + 14);
    return {
        originLabel: '',
        originPoint: null,
        radiusKm: '3',
        minRent: '3500',
        maxRent: '6000',
        roomType: 'private',
        occupants: '1',
        moveInDate: (0, date_1.toISODate)(moveIn),
        mustHave: ['wifi', 'bathroom'],
        nice: ['furnished', 'laundry'],
        rules: ['no-curfew', 'non-smoking'],
    };
}
/* ------------------------------------------------------------- validation */
function validateChecklist(form) {
    const errors = {};
    if (!form.originLabel.trim()) {
        errors.originLabel = 'Enter an area, school, or workplace as your search origin.';
    }
    const radius = Number(form.radiusKm);
    if (!exports.RADIUS_OPTIONS.some((option) => option.value === form.radiusKm) || !Number.isFinite(radius)) {
        errors.radiusKm = 'Choose a search radius.';
    }
    const min = parseDigits(form.minRent);
    const max = parseDigits(form.maxRent);
    if (!min) {
        errors.minRent = !form.minRent.trim()
            ? 'Enter your minimum budget.'
            : 'Enter an amount greater than ₱0.';
    }
    if (!max) {
        errors.maxRent = !form.maxRent.trim()
            ? 'Enter your maximum budget.'
            : 'Enter an amount greater than ₱0.';
    }
    if (min && max && min > max) {
        errors.maxRent = "Minimum budget can't be greater than maximum.";
    }
    if (!exports.ROOM_TYPE_OPTIONS.some((option) => option.value === form.roomType)) {
        errors.roomType = 'Choose a room type.';
    }
    const occupants = Number(form.occupants);
    if (!exports.OCCUPANT_OPTIONS.some((option) => option.value === form.occupants) || !Number.isFinite(occupants)) {
        errors.occupants = 'Choose how many will live in the room.';
    }
    if (!(0, date_1.parseISODate)(form.moveInDate)) {
        errors.moveInDate = 'Choose your earliest move-in date.';
    }
    return errors;
}
function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
/* ------------------------------------------------------------- conversions */
function parseDigits(value) {
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits)
        return null;
    const amount = Number(digits);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}
function toChecklist(form) {
    return {
        originLabel: form.originLabel.trim(),
        originPoint: form.originPoint,
        radiusKm: Number(form.radiusKm),
        minRent: parseDigits(form.minRent) ?? 0,
        maxRent: parseDigits(form.maxRent) ?? 0,
        roomType: form.roomType,
        occupants: Number(form.occupants),
        moveInDate: form.moveInDate ?? (0, date_1.toISODate)(new Date()),
        mustHave: form.mustHave,
        nice: form.nice,
        rules: form.rules,
    };
}
function toForm(checklist) {
    return {
        originLabel: checklist.originLabel,
        originPoint: checklist.originPoint,
        radiusKm: String(checklist.radiusKm),
        minRent: String(checklist.minRent),
        maxRent: String(checklist.maxRent),
        roomType: checklist.roomType,
        occupants: String(checklist.occupants),
        moveInDate: checklist.moveInDate,
        mustHave: checklist.mustHave,
        nice: checklist.nice,
        rules: checklist.rules,
    };
}
/* ---------------------------------------------------------------- persistence */
async function loadChecklist(userId) {
    const raw = await (0, storage_1.storageGet)(`checklist.${userId}`);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
async function saveChecklist(userId, checklist) {
    await (0, storage_1.storageSet)(`checklist.${userId}`, JSON.stringify(checklist));
}
