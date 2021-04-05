/*Visualization Template Utils*/

export function getProgramsToQuery(template) {
    const programs = new Set();
    Object.values(template.teTemplates).reverse().forEach(rt => {
        if (rt.program) {
            programs.add(rt.program)
        }
    });
    return Array.from(programs.values());
}


export function getTEAttributes(template, programId) {
    let attributes = new Map();
    Object.values(template.teTemplates).forEach(temp => {
        if (temp.program !== programId) {
            return;
        }

        temp.labelAttributes.forEach(lat => {
            attributes.set(lat, true);
        });
    })
    return attributes;
}