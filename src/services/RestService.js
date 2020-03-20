import axios from "axios";
import {DHIS2_ENDPOINT} from "../DHIS2Constants";

//const headers = {};
const headers = {Authorization: "Basic YWRtaW46ZGlzdHJpY3Q="};
const baseURL = `${DHIS2_ENDPOINT}/api/`;

export class RestService {
    static get(path) {
        return axios.get(baseURL + path, {headers})
    }
}