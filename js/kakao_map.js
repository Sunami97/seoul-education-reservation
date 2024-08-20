const KAKAO_API_KEY = config.kakaoMapApiKey;
const defaultLatitude = 37.5665;
const defaultLongitude = 126.9780;
const defaultMapLevel = 8;
const zoomMapLevel = 4;
let map;
let marker;

const script = document.createElement('script');
script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false`;
script.onload = () => {
    kakao.maps.load(() => {
        console.log('Kakao Map API loaded');
        initializeMap();
    });
};

script.onerror = () => console.error('Kakao Maps API 로드 오류');
document.head.appendChild(script);

const initializeMap = () => {
    const mapContainer = document.getElementById('map');
    const mapOption = {
        center: new kakao.maps.LatLng(defaultLatitude, defaultLongitude),
        level: defaultMapLevel
    };

    map = new kakao.maps.Map(mapContainer, mapOption);

    marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(defaultLatitude, defaultLongitude),
        map: map
    });

    marker.setMap(null);
}


const moveMap = (latitude, longitude, level, onMarker = false) => {
    if (isNaN(latitude) || isNaN(longitude)) {
        latitude = defaultLatitude;
        longitude = defaultLongitude;
        level = defaultMapLevel;
        onMarker = false;
    }

    const moveLatLon = new kakao.maps.LatLng(latitude, longitude);
    map.setCenter(moveLatLon);
    map.panTo(moveLatLon);
    map.setLevel(level);

    if (onMarker) {
        marker.setMap(map);
        marker.setPosition(moveLatLon);
    } else {
        marker.setMap(null);
    }
}