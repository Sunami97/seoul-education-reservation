const empty = ' ';
const defaultStartIndex = 1;
const defaultEndIndex = 15;

const queryParams = {
    startIndex: defaultStartIndex,
    endIndex: defaultEndIndex,
    category: empty,
    title: empty,
    target: empty,
    area: empty
};

let reservationMap = new Map();

let totalDataCount = 0; // 총 데이터 개수
let pageSize = 15; // 가져오는 데이터 개수
let totalPages = 0; // 총 페이지 수
let visiblePageCount = 5; // 한 번에 보이는 페이지 번호 수
let currentPage = 1;

const $logo = document.getElementById('logo');
const $categoryButtonContainer = document.getElementById('categoryButtonContainer');
const $categoryButtons = document.querySelectorAll('.category-button');
const $hambugerButton = document.getElementById('hambugerButton');
const $rightSection = document.getElementById('rightSection');
const $rightSectionContent = document.getElementById('rightSectionContent');

const $loading = document.getElementById('loading');

const $searchBox = document.getElementById('searchBox');
const $searchSelect = document.getElementById('searchSelect');
const $searchButton = document.getElementById('searchButton');
const $searchInput = document.getElementById('searchInput');

const $itemList = document.getElementById('itemList');
const $pagination = document.getElementById('pagination');

const $descriptionText = document.getElementById('descriptionText');
const $reservationButton = document.getElementById('reservationButton');
const $backButton = document.getElementById('backButton');

const mediaQuery = window.matchMedia('(max-width: 767px)');

let currentReservationLink = "";
let isSearching = false;

const decodeHTMLEntities = (str) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
}

function removeAllImagesFromHtml(htmlString) {
    return htmlString.replace(/<img[^>]*>/g, '');
}

const createElement = (type, className, textContent = '') => {
    const element = document.createElement(type);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
};

const getCleanText = (rawText) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawText;

    return tempDiv.innerHTML;
}

const onClickItemMore = (id) => {
    $rightSectionContent.classList.add("active-description");
    $rightSection.classList.add('show');
    const reservation = reservationMap.get(id);

    const removeImgHtml = removeAllImagesFromHtml(reservation["DTLCONT"]);
    $descriptionText.innerHTML = removeImgHtml;
    $descriptionText.scrollTop = 0;
    moveMap(parseFloat(reservation['Y']), parseFloat(reservation['X']), zoomMapLevel, true);
    currentReservationLink = reservation['SVCURL'];
}

const createItem = (item) => {
    const $item = createElement('li', 'item');
    const $itemImage = createElement('div', 'item-image');
    const $mainImage = createElement('img');
    $mainImage.src = item["IMGURL"];
    $mainImage.alt = "item_img";

    const state = item["SVCSTATNM"];
    let stateClass = "";
    if (state === "접수중" || state === "안내중") {
        stateClass = "receiving";
    } else if (state === "일시중지") {
        stateClass = "pause";
    } else if (state === "예약마감" || state === "접수종료") {
        stateClass = "deadline";
    } else {
        //Do nothing
    }

    const $state = createElement('div', `item-state ${stateClass}`, state);

    const $itemText = createElement('div', 'item-text');

    const $itemTitle = createElement('p', 'item-title', decodeHTMLEntities(item["SVCNM"]));

    const $itemDetails = createElement('p', 'item-details');

    const $itemInfo = createElement('div', 'item-info');
    const $itemInfoIcon = document.createElement('img');
    $itemInfoIcon.src = "./image/user.png";
    $itemInfoIcon.alt = "user_icon";
    const $itemInfoText = createElement('span', '', item["USETGTINFO"].trim());

    const $itemPlace = createElement('div', 'item-place');
    const $itemPlaceIcon = document.createElement('img');
    $itemPlaceIcon.src = "./image/pin.png";
    $itemPlaceIcon.alt = "pin_icon";
    const $itemPlaceText = createElement('span', '', item["PLACENM"]);


    const $itemTime = createElement('div', 'item-time');
    const $itemTimeIcon = document.createElement('img');
    $itemTimeIcon.src = "./image/time.png";
    $itemTimeIcon.alt = "time_icon";
    const $itemTimeText = createElement('span', '', `${item["RCPTBGNDT"].substring(0, 16)} ~ ${item["RCPTENDDT"].substring(0, 16)}`);

    const $itemMore = createElement('div', 'item-more');

    $itemMore.addEventListener("click", () => onClickItemMore(item["SVCID"]));

    $itemImage.appendChild($mainImage);
    $itemImage.appendChild($state);

    $itemInfo.appendChild($itemInfoIcon);
    $itemInfo.appendChild($itemInfoText);
    $itemPlace.appendChild($itemPlaceIcon);
    $itemPlace.appendChild($itemPlaceText);
    $itemTime.appendChild($itemTimeIcon);
    $itemTime.appendChild($itemTimeText);

    $itemDetails.appendChild($itemInfo);
    $itemDetails.appendChild($itemPlace);
    $itemDetails.appendChild($itemTime);

    $itemText.appendChild($itemTitle);
    $itemText.appendChild($itemDetails);

    $item.appendChild($itemImage);
    $item.appendChild($itemText);
    $item.appendChild($itemMore);

    return $item;
}

const updatePageIndex = () => {
    queryParams.startIndex = (currentPage - 1) * pageSize + 1;
    queryParams.endIndex = currentPage * pageSize;
}

const renderPagination = () => {
    $pagination.innerHTML = '';

    totalPages = Math.ceil(totalDataCount / pageSize);

    if (totalPages <= 0) totalPages = 1;

    const fragment = document.createDocumentFragment();
    const prevButton = createElement('button', 'move-button');
    prevButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;

            updatePageIndex();
            fetchReservationData();
        }
    });
    fragment.appendChild(prevButton);

    const startPage = Math.max(1, currentPage - Math.floor(visiblePageCount / 2));
    const endPage = Math.min(totalPages, startPage + visiblePageCount - 1);

    for (let i = startPage; i <= endPage; i++) {
        const button = createElement('span', 'dot', i);
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            if (currentPage === i) return;

            currentPage = i;

            updatePageIndex();
            fetchReservationData();
        });
        fragment.appendChild(button);
    }

    const nextButton = createElement('button', 'move-button');
    nextButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;

            updatePageIndex();
            fetchReservationData();
        }
    });
    fragment.appendChild(nextButton);

    $pagination.appendChild(fragment);
}

const renderItem = (reservationList) => {
    const fragment = document.createDocumentFragment();

    reservationList.forEach(item => {
        fragment.appendChild(createItem(item));
    });

    $itemList.appendChild(fragment);
};

const fetchData = async () => {
    try {
        const response = await fetch('/api/seoul', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryParams)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
            throw new Error('No data');
        }

        return data;
    } catch (error) {
        console.error('API 요청 에러:', error);

        let errorMessage = '예약 정보를 가져오는 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

        if (error.message.includes('HTTP error')) {
            errorMessage = '서버와의 통신에 문제가 있습니다. 네트워크 상태를 확인해주세요.';
        } else if (error.message.includes('API error')) {
            errorMessage = '서버에서 유효하지 않은 응답을 받았습니다. 관리자에게 문의하세요.';
        } else if (error.message.includes('JSON')) {
            errorMessage = '응답 데이터를 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('No data')) {
            errorMessage = '예약 가능한 정보가 현재 없습니다.';
        }

        return { error: errorMessage };
    }
}

const fetchReservationData = async () => {
    $itemList.innerHTML = '';
    $descriptionText.innerHTML = '';
    $pagination.innerHTML = '';
    $rightSectionContent.classList.remove("active-description");

    $loading.style.display = 'block';
    const reservationData = await fetchData();
    $loading.style.display = 'none';

    if (reservationData.error) {
        alert(reservationData.error);
        return;
    }

    totalDataCount = reservationData.ListPublicReservationEducation.list_total_count;
    console.log('총 데이터 개수 : ', totalDataCount);
    const reservationList = reservationData.ListPublicReservationEducation.row;

    reservationMap.clear();
    reservationList.forEach((reservation) => {
        reservationMap.set(reservation['SVCID'], reservation);
    });

    renderItem(reservationList);
    renderPagination();
}

const onClickCategoryButton = async (targetCategoryButton) => {
    if (isSearching) return;
    isSearching = true;

    $categoryButtons.forEach((categoryButton) => {
        categoryButton.classList.remove('active');
    });

    targetCategoryButton.classList.add('active');

    const category = targetCategoryButton.dataset.value;

    if (category === '전체') {
        queryParams.category = empty;
    } else {
        queryParams.category = category;
    }

    $searchSelect.selectedIndex = 0;
    $searchInput.value = '';
    queryParams.title = empty;
    queryParams.area = empty;
    queryParams.startIndex = defaultStartIndex;
    queryParams.endIndex = defaultEndIndex;

    currentPage = 1;
    moveMap(defaultLatitude, defaultLongitude, defaultMapLevel);
    await fetchReservationData();

    isSearching = false;
}

const searchReservation = async () => {
    if (isSearching) return;
    isSearching = true;

    const title = $searchInput.value.trim();
    const area = $searchSelect.value;

    if (area === '지역명' || area === '전체') {
        queryParams.area = empty;
    } else {
        queryParams.area = area;
    }

    if (title) {
        queryParams.title = title;
    } else {
        queryParams.title = empty;
    }

    queryParams.startIndex = defaultStartIndex;
    queryParams.endIndex = defaultEndIndex;

    currentPage = 1;
    moveMap(defaultLatitude, defaultLongitude, defaultMapLevel);
    await fetchReservationData();
    isSearching = isSearching = false;
}

const init = () => {

    var swiper = new Swiper('.swiper-container', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        freeMode: true,
    });

    $searchInput.addEventListener('click', () => {
        $searchBox.classList.add('focused');
    });

    $searchInput.addEventListener('blur', () => {
        $searchBox.classList.remove('focused');
    });

    $categoryButtons.forEach((categoryButton) => {
        categoryButton.addEventListener('click', () => {
            onClickCategoryButton(categoryButton);
            $logo.classList.remove('rotate');
            $categoryButtonContainer.classList.remove('active');
            $categoryButtonContainer.classList.remove('drop');
        });
    });

    $searchInput.addEventListener("keyup", (e) => {
        if (e.key !== "Enter") return;
        searchReservation();
    });

    $searchButton.addEventListener('click', () => {
        searchReservation();
    });

    $reservationButton.addEventListener('click', () => {
        if (!currentReservationLink) {
            return;
        }
        window.open(currentReservationLink, '_blank');
    })

    $backButton.addEventListener('click', () => {
        $rightSection.classList.remove('show');
    });

    mediaQuery.addEventListener('change', () => {
        $rightSection.classList.remove('show');
    });

    $logo.addEventListener('click', () => {
        $logo.classList.toggle('rotate');
        $categoryButtonContainer.classList.toggle('drop');
    })

    $hambugerButton.addEventListener('click', () => {
        $categoryButtonContainer.classList.toggle('active');
    })

    fetchReservationData();
}

init();


