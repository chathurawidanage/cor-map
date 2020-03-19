import {GENDER_FEMALE, GENDER_MALE} from "./DHIS2Constants";

export function getImgForGender(gender) {
    if (gender === GENDER_MALE) {
        return "img/man.png";
    } else if (gender === GENDER_FEMALE) {
        return "img/girl.png";
    } else {
        return "";
    }
}