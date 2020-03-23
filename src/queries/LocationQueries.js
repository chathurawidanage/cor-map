import axios from "axios";


const BASE_URL = "https://cors-anywhere.herokuapp.com/http://198.154.99.128:8081/mobloc/";

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