import axios from "axios";

//const BASE_URL = window.location.protocol + "//" + window.location.host + "/mobloc/";
const BASE_URL = "https://covid-19.health.gov.lk/mobloc/";

export class LocationQueries {

    static getDateRange(msisdn) {
        return axios.get(`${BASE_URL}get_date_range?msisdn=${msisdn}`);
    }

    static fetchLocHistory(msisdn) {
        return axios.get(`${BASE_URL}fetch_loc_history?msisdn=${msisdn}&refid=`);
    }

    static readLocationHistory(msisdn, from, to) {
        return axios.get(`${BASE_URL}read_loc_history?msisdn=${msisdn}&start_date=${from}&end_date=${to}`);
    }
}