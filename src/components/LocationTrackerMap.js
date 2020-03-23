import React from "react";
import GoogleMapReact from 'google-map-react';
import Loader from "./loader/Loader";
import {Card, RangeSlider} from "@blueprintjs/core";
import "./LocationTrackerMap.css";
import {LocationQueries} from "../queries/LocationQueries";
import moment from "moment";

const DAY_MILIS = 1000 * 60 * 60 * 24;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default class LocationTrackerMap extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            dataAvailable: false,
            loading: true,
            loadingTxt: "Tracing " + this.props.match.params.msisdn + "...",
            availableDateRange: {
                availableStartDate: Date.now() - DAY_MILIS * 7,
                availableEndDate: Date.now()
            },
            selectedDateRange: {
                fromIndex: 0,
                toIndex: 6
            },
            locations: [
                // {
                //     from: new Date("2020-03-16 03:29:08").getTime(),
                //     to: new Date("2020-03-17 16:19:35").getTime(),
                //     lat: 6.9172219999999998,
                //     lon: 79.859170000000006,
                //     accuracy: 300
                // },
                // {
                //     from: new Date("2020-03-20 08:49:39").getTime(),
                //     to: new Date("2020-03-21 08:49:39").getTime(),
                //     lat: 6.95,
                //     lon: 79.859170000000006,
                //     accuracy: 500
                // },
                // {
                //     from: new Date("2020-03-16 08:49:39").getTime(),
                //     to: new Date("2020-03-16 09:49:39").getTime(),
                //     lat: 6.93,
                //     lon: 79.839170000000006,
                //     accuracy: 500
                // }
            ]
        };

        this.map = undefined;
        this.markers = {};
        this.polyString = "";
        this.polyLines = [];

        this.dataAvailabilityInterval = -1;
        this.rangeChangedTimeout = -1;
    }

    setLoadingText = (text) => {
        this.setState({
            loadingTxt: text
        });
    };

    fetchData = () => {

        console.log("Fetching data");

        let from = new Date((this.state.selectedDateRange.fromIndex * DAY_MILIS)
            + (this.state.availableDateRange.availableStartDate));
        let to = new Date((this.state.selectedDateRange.toIndex * DAY_MILIS)
            + (this.state.availableDateRange.availableStartDate));

        let fromStr = moment(from).format('MM/DD/YYYY');
        let toStr = moment(to).format('MM/DD/YYYY');

        LocationQueries.readLocationHistory(this.props.match.params.msisdn, fromStr, toStr).then(resp => {
            if (resp?.data?.data) {
                let locations = resp.data.data.map(d => {
                    return {
                        from: new Date(d[0]).getTime(),
                        to: new Date(d[1]).getTime(),
                        lat: d[2],
                        lon: d[3],
                        accuracy: 500
                    }
                });
                this.setState({
                    locations,
                    loading: false
                });
            } else {
                console.log("Received an unknown data format");
            }
        }).catch(err => {
            console.log(err);
        });
    };

    repeatDataAvailabilityCheck() {
        this.setLoadingText("Checking for Availability");
        LocationQueries.fetchLocHistory(this.props.match.params.msisdn).then(resp => {
            if (resp?.data?.status === 1) {
                console.log("Data available");
                this.setState({
                    dataAvailable: true,
                    loadingTxt: "Querying for location data..."
                }, this.fetchData);
                clearTimeout(this.dataAvailabilityInterval);
            } else {
                this.setLoadingText("Data not available yet. We will retry in 10secs..");
                this.dataAvailabilityInterval = setTimeout(() => {
                    this.repeatDataAvailabilityCheck();
                }, 5000);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    componentDidMount() {
        if (this.props.match?.params?.msisdn) {
            LocationQueries.getDateRange(this.props.match.params.msisdn).then(resp => {
                if (resp?.data?.start_date && resp?.data?.end_date) {
                    let start = new Date(resp.data.start_date).getTime();
                    let end = new Date(resp.data.end_date).getTime();

                    let length = (end - start) / DAY_MILIS;

                    this.setState({
                        availableDateRange: {
                            availableStartDate: start,
                            availableEndDate: end
                        },
                        selectedDateRange: {
                            fromIndex: Math.max(length - 6, 0),
                            toIndex: Math.max(length - 1, 0)
                        },
                    }, this.repeatDataAvailabilityCheck);
                }
            }).catch(err => {
                console.log("Failed to get the data range");
            });
        } else {
            console.error("MSISDN not specified");
        }
    }


    getMarkerKey = (loc) => {
        return loc.lat + "_" + loc.lon;
    };

    redrawMarkers = (filteredDates) => {
        if (!this.map) {
            return;
        }

        console.log("Drawing markers...");

        let markersToDel = {...this.markers};

        filteredDates.forEach(loc => {
            let key = this.getMarkerKey(loc);
            if (markersToDel[key]) {
                delete markersToDel[key];
                return;
            }

            let marker = new window.google.maps.Marker({
                map: this.map,
                position: new window.google.maps.LatLng(loc.lat, loc.lon),
                icon: {
                    url: "https://i.ya-webdesign.com/images/red-dot-png-4.png",
                    scaledSize: {width: 20, height: 20},
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(10, 10)
                }
            });
            let circle = new window.google.maps.Circle({
                map: this.map,
                radius: loc.accuracy === 0 ? 5000 : loc.accuracy,    // 10 miles in metres
                fillColor: '#AA0000'
            });
            circle.bindTo('center', marker, 'position');
            this.markers[loc.lat + "_" + loc.lon] = [marker, circle];
        });

        Object.keys(markersToDel).forEach(key => {
            this.markers[key].forEach(ms => {
                ms.setMap(null);
            });
            delete this.markers[key];
        });

        // zoom appropriately
        try {
            if (Object.keys(this.markers).length > 0) {
                let latlngbounds = new window.google.maps.LatLngBounds();
                Object.values(this.markers).forEach(marker => {
                    latlngbounds.extend(marker[0].position);
                });
                this.map.fitBounds(latlngbounds);
            }
        } catch (e) { // just for demo try catch
            console.error("Error in centering");
        }

        // let sortedLocations = filteredDates
        // // .sort((a, b) => {
        // //     return -a.from + b.from
        // // });
        //
        // let polyString = "";
        // let polyLines = [];
        //
        // for (let i = 0; i < sortedLocations.length - 1; i++) {
        //     let start = new window.google.maps.LatLng(sortedLocations[i].lat, sortedLocations[i].lon);
        //     let end = new window.google.maps.LatLng(sortedLocations[i + 1].lat, sortedLocations[i + 1].lon);
        //     let polyline = new window.google.maps.Polyline({
        //         path: [start, end],
        //         strokeOpacity: 1.0,
        //         strokeWeight: 2,
        //         geodesic: true,
        //         icons: [{
        //             icon: {path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
        //             offset: '100%'
        //         }]
        //     });
        //     polyLines.push(polyline);
        //     polyString += this.getMarkerKey(sortedLocations[i]) + "_" + this.getMarkerKey(sortedLocations[i + 1]);
        // }
        //
        // if (this.polyString !== polyString) {
        //     this.polyString = polyString;
        //     this.polyLines.forEach(pl => {
        //         pl.setMap(null);
        //     });
        //     this.polyLines = polyLines;
        //     polyLines.forEach(pl => {
        //         pl.setMap(this.map);
        //     });
        // }
    };

    getBeginningOfDay = (time) => {
        return time - (time % DAY_MILIS);
    };

    getDateLabel = (time) => {
        return `${MONTHS[time.getMonth()]} ${time.getDate()}`;
    };

    onRangeChanged = (range) => {
        this.setState({
            selectedDateRange: {
                fromIndex: range[0],
                toIndex: range[1]
            }
        }, () => {
            clearTimeout(this.rangeChangedTimeout);
            this.rangeChangedTimeout = setTimeout(this.fetchData, 2000);
        });
    };

    render() {

        console.log("rendering");

        let ticks = (this.state.availableDateRange.availableEndDate
            - this.state.availableDateRange.availableStartDate) / DAY_MILIS;

        let selectedStartDate = this.state.availableDateRange.availableStartDate
            + this.state.selectedDateRange.fromIndex * DAY_MILIS;
        let selectedEndDate = this.state.availableDateRange.availableStartDate
            + this.state.selectedDateRange.toIndex * DAY_MILIS;

        let filteredDates = this.state.locations.filter(loc => {
            return loc.from >= selectedStartDate && loc.to <= selectedEndDate;
        });

        this.redrawMarkers(filteredDates);

        return (
            <div>
                {this.state.loading ?
                    <Loader text={this.state.loadingTxt}/> :
                    <div>
                        <div className="date-slider">
                            <Card>
                                <RangeSlider min={0} max={ticks}
                                             value={[this.state.selectedDateRange.fromIndex,
                                                 this.state.selectedDateRange.toIndex]}
                                             onChange={this.onRangeChanged}
                                             labelRenderer={(tick) => {
                                                 let time = new Date(
                                                     this.getBeginningOfDay(this.state.availableDateRange.availableStartDate + (tick * DAY_MILIS))
                                                 );
                                                 return this.getDateLabel(time);
                                             }}/>
                            </Card>
                        </div>
                        <div className="tracker-map">
                            <GoogleMapReact
                                options={{
                                    disableDefaultUI: true
                                }}
                                bootstrapURLKeys={{key: "AIzaSyBnllJ3UdOMvv3S-1yAw4TNCi6iQYUOGjg"}}
                                yesIWantToUseGoogleMapApiInternals
                                defaultCenter={[7.8731, 80.7718]}
                                defaultZoom={8}

                                onGoogleApiLoaded={({map, maps}) => {
                                    this.map = map;
                                    this.redrawMarkers(filteredDates);
                                }}/></div>
                    </div>
                }
            </div>
        );
    }
}

class RadiusMarker extends React.Component {
    render() {
        return (
            <div style={{height: 100, width: 100, color: "red"}}>
                MY TEST
            </div>
        );
    }
}