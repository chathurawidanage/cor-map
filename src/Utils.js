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

/*Visualization Template Utils*/

export function getProgramsToQuery(template) {
    let programs = {};
    Object.values(template.teTemplates).forEach(rt => {
        if (rt.program) {
            programs[rt.program.value] = true;
        }
    });
    return Object.keys(programs);
}


export function getTEAttributes(template, programId) {
    let attributes = {};
    Object.values(template.teTemplates).forEach(temp => {
        if (!temp.program || temp.program.value !== programId) {
            return;
        }

        if (temp.genderAttribute?.value) {
            attributes[temp.genderAttribute.value] = true;
        }

        temp.labelAttributes.forEach(lat => {
            attributes[lat.value] = true;
        });
    })
    return Object.keys(attributes);
}