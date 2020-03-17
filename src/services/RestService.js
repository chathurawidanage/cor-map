import axios from "axios";

const headers = {Authorization: "Basic YWRtaW46ZGlzdHJpY3Q="};
const baseURL = "https://cors-anywhere.herokuapp.com/https://play.dhis2.org/2.33.2/api/";

export class RestService {
    static get(path) {
        return axios.get(baseURL + path, {headers})
    }
}