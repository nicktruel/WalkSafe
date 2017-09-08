'use strict';
/* eslint no-console: 0 */
import React, { Component } from 'react';
import Mapbox, { MapView } from 'react-native-mapbox-gl';
import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  Button,
  ScrollView
} from 'react-native';
import { MAPBOX_ACCESS_TOKEN, SPOTCRIME_API_KEY } from 'react-native-dotenv';
import axios from 'axios';

import Icon from 'react-native-vector-icons/FontAwesome';
import menuIcon from './icons/Menu';
import locationIcon from './icons/Location';
import alertIcon from './icons/Alert';
import noViewIcon from './icons/NoView';

const accessToken = MAPBOX_ACCESS_TOKEN;
Mapbox.setAccessToken(accessToken);

export default class BaseMap extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    center: {
      latitude: 40.72052634,
      longitude: -73.97686958312988
    },
    zoom: 14,
    userTrackingMode: Mapbox.userTrackingMode.none,
    annotations: [],
    annotationsHistory: []
  };

  onCrimesToggleClick = () => {
    const crimes = this.state.annotations.filter(a => a.type === 'point');

    if (crimes.length > 0) {
      this.setState({
        annotationsHistory: this.state.annotations.concat(crimes),
        annotations: this.state.annotations.filter(a => a.type !== 'point')
      })
    } else {
      this.setState({ annotations: this.state.annotationsHistory });
    }
  };

  onRegionDidChange = (location) => {
    this.setState({ currentZoom: location.zoomLevel });
    console.log('onRegionDidChange', location);

    axios.get('http://api.spotcrime.com/crimes.json', {params: {
        lat: location.latitude,
        lon: location.longitude,
        key: SPOTCRIME_API_KEY,
        radius: 0.01
    }})
      .then(response => {
        const oldCrimes = this.state.annotations.map(crime => {
          return crime.id;
        });

        const newCrimes = response.data.crimes.map(crime => {
          let image;
          switch(crime.type) {
            case 'Theft':
              image = 'http://www.hershberglaw.ca/wp-content/uploads/2014/03/icon-9.png';
              break;
            case 'Assault':
              image = 'https://d30y9cdsu7xlg0.cloudfront.net/png/36066-200.png';
              break;
            case 'Arrest':
              image = 'https://www.votesilo.com/images/bill-subject-icons/crime-law-enforcement-icon.svg';
              break;
            case 'Burglary':
              image = 'https://d30y9cdsu7xlg0.cloudfront.net/png/80199-200.png';
              break;
            case 'Shooting':
              image = 'https://www.shareicon.net/download/2015/12/25/693155_hand.svg';
              break;
            case 'Arson':
              image = 'http://cdn.onlinewebfonts.com/svg/download_504940.png';
              break;
            case 'Vandalism':
              image = 'https://d30y9cdsu7xlg0.cloudfront.net/png/60818-200.png';
              break;
            case 'Burglary':
              image = 'https://maxcdn.icons8.com/windows8/PNG/512/City/burglary-512.png';
            case 'Robbery':
              image = 'https://d30y9cdsu7xlg0.cloudfront.net/png/21302-200.png';
              break;
            default:
              image = 'https://maxcdn.icons8.com/Share/icon/City//police_badge1600.png';
          }
          return {
            coordinates: [crime.lat, crime.lon],
            type: 'point',
            title: crime.type,
            subtitle: `${crime.address} ${crime.date}`,
            annotationImage: {
              source: { uri: image },
              height: 30,
              width: 30
            },
            id: crime.cdid.toString()
          };
        }).filter(crime => {
          return !oldCrimes.includes(crime.id);
        });

        this.setState({
          annotations: [...this.state.annotations, ...newCrimes]
        });
      });
  };
  onRegionWillChange = (location) => {
    console.log('onRegionWillChange', location);
  };
  onUpdateUserLocation = (location) => {
    console.log('onUpdateUserLocation', location);
  };
  onOpenAnnotation = (annotation) => {
    console.log('onOpenAnnotation', annotation);
  };
  onRightAnnotationTapped = (e) => {
    console.log('onRightAnnotationTapped', e);
  };
  onLongPress = (location) => {
    console.log('onLongPress', location);
  };
  onTap = (location) => {
    console.log('onTap', location);
  };
  onChangeUserTrackingMode = (userTrackingMode) => {
    this.setState({ userTrackingMode });
    console.log('onChangeUserTrackingMode', userTrackingMode);
  };

  componentWillMount() {
    this._offlineProgressSubscription = Mapbox.addOfflinePackProgressListener(progress => {
      console.log('offline pack progress', progress);
    });
    this._offlineMaxTilesSubscription = Mapbox.addOfflineMaxAllowedTilesListener(tiles => {
      console.log('offline max allowed tiles', tiles);
    });
    this._offlineErrorSubscription = Mapbox.addOfflineErrorListener(error => {
      console.log('offline error', error);
    });
  }

  componentWillUnmount() {
    this._offlineProgressSubscription.remove();
    this._offlineMaxTilesSubscription.remove();
    this._offlineErrorSubscription.remove();
  }

  addNewMarkers = () => {
    // Treat annotations as immutable and create a new one instead of using .push()
    this.setState({
      annotations: [ ...this.state.annotations, {
        coordinates: [40.73312,-73.989],
        type: 'point',
        title: 'This is a new marker',
        id: 'foo'
      }, {
        'coordinates': [[40.749857912194386, -73.96820068359375], [40.741924698522055,-73.9735221862793], [40.735681504432264,-73.97523880004883], [40.7315190495212,-73.97438049316406], [40.729177554196376,-73.97180557250975], [40.72345355209305,-73.97438049316406], [40.719290332250544,-73.97455215454102], [40.71369559554873,-73.97729873657227], [40.71200407096382,-73.97850036621094], [40.71031250340588,-73.98691177368163], [40.71031250340588,-73.99154663085938]],
        'type': 'polygon',
        'fillAlpha': 1,
        'fillColor': '#000000',
        'strokeAlpha': 1,
        'id': 'new-black-polygon'
      }]
    });
  };

  updateMarker2 = () => {
    // Treat annotations as immutable and use .map() instead of changing the array
    this.setState({
      annotations: this.state.annotations.map(annotation => {
        if (annotation.id !== 'marker2') { return annotation; }
        return {
          coordinates: [40.714541341726175,-74.00579452514648],
          'type': 'point',
          title: 'New Title!',
          subtitle: 'New Subtitle',
          annotationImage: {
            source: { uri: 'https://cldup.com/7NLZklp8zS.png' },
            height: 25,
            width: 25
          },
          id: 'marker2'
        };
      })
    });
  };

  removeMarker2 = () => {
    this.setState({
      annotations: this.state.annotations.filter(a => a.id !== 'marker2')
    });
  };

  render() {
    StatusBar.setHidden(false);
    console.log('line 24', this.props)
    return (
      <View style={styles.container}>
        <MapView
          ref={map => { this._map = map; }}
          style={styles.map}
          initialCenterCoordinate={this.state.center}
          initialZoomLevel={this.state.zoom}
          initialDirection={0}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          showsUserLocation={true}
          styleURL={Mapbox.mapStyles.streets}
          userTrackingMode={this.state.userTrackingMode}
          annotations={this.state.annotations}
          annotationsAreImmutable
          onChangeUserTrackingMode={this.onChangeUserTrackingMode}
          onRegionDidChange={this.onRegionDidChange}
          onRegionWillChange={this.onRegionWillChange}
          onOpenAnnotation={this.onOpenAnnotation}
          onRightAnnotationTapped={this.onRightAnnotationTapped}
          onUpdateUserLocation={this.onUpdateUserLocation}
          onLongPress={this.onLongPress}
          onTap={this.onTap}
          logoIsHidden={true}
          contentInset={[15,0,0,0]}
        />
      <View style={styles.mapButtons}>
          <Text onPress={ () => this.props.data.navigation.navigate('DrawerOpen')} >{ menuIcon }</Text>
          <Text onPress={ () => this.setState({ userTrackingMode: Mapbox.userTrackingMode.followWithHeading })} >{ locationIcon }</Text>
          <Text onPress={ () => this.props.data.navigation.navigate('DrawerOpen')} >{ alertIcon }</Text>
          <Text onPress={ () => this.onCrimesToggleClick()} >{ noViewIcon }</Text>
        </View>
      </View>
    );
  }

  _renderButtons() {
    return (
      <View>
        <Text onPress={() => this._map && this._map.setDirection(0)}>
          Set direction to 0
        </Text>
        <Text onPress={() => this._map && this._map.setZoomLevel(6)}>
          Zoom out to zoom level 6
        </Text>
        <Text onPress={() => this._map && this._map.setCenterCoordinate(48.8589, 2.3447)}>
          Go to Paris at current zoom level {parseInt(this.state.currentZoom)}
        </Text>
        <Text onPress={() => this._map && this._map.setCenterCoordinateZoomLevel(35.68829, 139.77492, 14)}>
          Go to Tokyo at fixed zoom level 14
        </Text>
        <Text onPress={() => this._map && this._map.easeTo({ pitch: 30 })}>
          Set pitch to 30 degrees
        </Text>
        <Text onPress={this.addNewMarkers}>
          Add new marker
        </Text>
        <Text onPress={this.updateMarker2}>
          Update marker2
        </Text>
        <Text onPress={() => this._map && this._map.selectAnnotation('marker1')}>
          Open marker1 popup
        </Text>
        <Text onPress={() => this._map && this._map.deselectAnnotation()}>
          Deselect annotation
        </Text>
        <Text onPress={this.removeMarker2}>
          Remove marker2 annotation
        </Text>
        <Text onPress={() => this.setState({ annotations: [] })}>
          Remove all annotations
        </Text>
        <Text onPress={() => this._map && this._map.setVisibleCoordinateBounds(40.712, -74.227, 40.774, -74.125, 100, 0, 0, 0)}>
          Set visible bounds to 40.7, -74.2, 40.7, -74.1
        </Text>
        <Text onPress={() => this.setState({ userTrackingMode: Mapbox.userTrackingMode.followWithHeading })}>
          Set userTrackingMode to followWithHeading
        </Text>
        <Text onPress={() => this._map && this._map.getCenterCoordinateZoomLevel((location)=> {
            console.log(location);
          })}>
          Get location
        </Text>
        <Text onPress={() => this._map && this._map.getDirection((direction)=> {
            console.log(direction);
          })}>
          Get direction
        </Text>
        <Text onPress={() => this._map && this._map.getBounds((bounds)=> {
            console.log(bounds);
          })}>
          Get bounds
        </Text>
        <Text onPress={() => {
            Mapbox.addOfflinePack({
              name: 'test',
              type: 'bbox',
              bounds: [0, 0, 0, 0],
              minZoomLevel: 0,
              maxZoomLevel: 0,
              metadata: { anyValue: 'you wish' },
              styleURL: Mapbox.mapStyles.dark
            }).then(() => {
              console.log('Offline pack added');
            }).catch(err => {
              console.log(err);
            });
        }}>
          Create offline pack
        </Text>
        <Text onPress={() => {
            Mapbox.getOfflinePacks()
              .then(packs => {
                console.log(packs);
              })
              .catch(err => {
                console.log(err);
              });
        }}>
          Get offline packs
        </Text>
        <Text onPress={() => {
            Mapbox.suspendOfflinePack('test')
              .then(info => {
                if (info.suspended) {
                  console.log('Suspended', info.suspended);
                } else {
                  console.log('No packs to suspend');
                }
              })
              .catch(err => {
                console.log(err);
              });
        }}>
          Pause/Suspend pack with name 'test'
        </Text>
        <Text onPress={() => {
            Mapbox.resumeOfflinePack('test')
              .then(info => {
                if (info.resumed) {
                  console.log('Resumed', info.resumed);
                } else {
                  console.log('No packs to resume');
                }
              })
              .catch(err => {
                console.log(err);
              });
        }}>
          Resume pack with name 'test'
        </Text>
        <Text onPress={() => {
            Mapbox.removeOfflinePack('test')
              .then(info => {
                if (info.deleted) {
                  console.log('Deleted', info.deleted);
                } else {
                  console.log('No packs to delete');
                }
              })
              .catch(err => {
                console.log(err);
              });
        }}>
          Remove pack with name 'test'
        </Text>
        <Text>User tracking mode is {this.state.userTrackingMode}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch'
  },
  map: {
    flex: 4
  },
  scrollView: {
    flex: 1
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

// <ScrollView style={styles.scrollView}>
//   {this._renderButtons()}
// </ScrollView>