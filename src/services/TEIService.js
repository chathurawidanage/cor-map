import {RestService} from "./RestService";

export default class TEIService {
    static getTEIs() {
        return RestService.get("trackedEntityInstances.json?ouMode=ACCESSIBLE&fields=[trackedEntityInstance,relationships]&pageSize=1000");
    }
}