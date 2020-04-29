/*Visualization Template Utils*/

export function getProgramsToQuery(template) {
    const programs = new Set();
    Object.values(template.teTemplates).reverse().forEach(rt => {
        if (rt.program) {
            programs.add(rt.program.value)
        }
    });
    return Array.from(programs.values());
}


export function getTEAttributes(template, programId) {
    let attributes = new Map();
    Object.values(template.teTemplates).forEach(temp => {
        if (!temp.program || temp.program.value !== programId) {
            return;
        }

        if (temp.genderAttribute?.value) {
            attributes.set(temp.genderAttribute.value, true);
        }

        temp.labelAttributes.forEach(lat => {
            attributes.set(lat.value, true);
        });
    })
    return attributes;
}