import {RestService} from "./RestService";

export default class TEIService {
    static getTEIs(program) {
        // return RestService.get("trackedEntityInstances.json?ouMode=ACCESSIBLE&fields=[trackedEntityInstance,relationships,attributes]&pageSize=1000&program=" + program);

        return RestService.get("trackedEntityInstances.json?ouMode=ACCESSIBLE&fields=trackedEntityInstance,relationships[relationshipType,from[trackedEntityInstance[trackedEntityInstance]],to[trackedEntityInstance[trackedEntityInstance]]]&paging=false&programStatus=ACTIVE&program=" + program);
    }

    static getTEI(teiId) {
        return RestService.get(`trackedEntityInstances/${teiId}.json`);
    }

    static getTEIAttributes(program, attributes) {
        return RestService.get(`trackedEntityInstances/query.json?ouMode=ACCESSIBLE&skipMeta=true&skipPaging=true&program=${program}&programStatus=ACTIVE&attribute=${attributes.join(",")}`);
    }
}