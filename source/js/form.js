import { COORDINATE_ACCURACY, RADIX, Index } from './const';
import { sendData } from './api';
import { showErrorMessage } from './status-message';

const UNINHABITED_CAPACITY = 100;
const PROPERTY_MAX_PRICE = 1000000;
const WRONG_FILE_TEXT_ERROR = 'Выбран недопустимый тип файла. Допустимый формат Jpeg / Png';

const TitleLength = {
  MIN: 30,
  MAX: 100,
};

const propertyMinPrice = {
  bungalow: 0,
  flat: 1000,
  house: 5000,
  palace: 10000,
};

export const adFormElement = document.querySelector('.ad-form');
const titleInputElement = adFormElement.querySelector('#title');
const addressInputElement = adFormElement.querySelector('#address');
const housingTypeInputElement = adFormElement.querySelector('#type');
const priceInputElement = adFormElement.querySelector('#price');
const checkInInputElement = adFormElement.querySelector('#timein');
const checkOutInputElement = adFormElement.querySelector('#timeout');
const roomInputElement = adFormElement.querySelector('#room_number');
const guestInputElement = adFormElement.querySelector('#capacity');
const guestOptionElements = Array.from(guestInputElement.children);
const resetButtonElement = adFormElement.querySelector('.ad-form__reset');
const avatarElement = adFormElement.querySelector('.ad-form-header__preview-image');
const avatarInputElement = adFormElement.querySelector('.ad-form-header__input');


export const showAddress = (coordinate) => {
  const {lat, lng} = coordinate;
  addressInputElement.value = `${(lat).toFixed(COORDINATE_ACCURACY)},
  ${lng.toFixed(COORDINATE_ACCURACY)}`;
};

const onTitleInputChange = (evt) => {
  const { target } = evt;
  const validity = target.validity;
  if (validity.tooLong) {
    target.setCustomValidity(`Вероятно заголовок вашего объявления слишком подробен. Попробуйте его уместить в ${TitleLength.MAX} символов. Осталось ужаться на ${target.value.length - TitleLength.MAX}`);
  } else if (validity.tooShort) {
    target.setCustomValidity(`Вероятно заголовок вашего объявления слишком лаконичен. Попробуйте его разместить на ${TitleLength.MIN} символах. Осталось добавить ${TitleLength.MIN - target.value.length}`);
  } else {
    target.setCustomValidity('');
  }
  target.reportValidity();
};
titleInputElement.addEventListener('input', onTitleInputChange);

const onHousingTypeInputChange = (evt) => {
  const propertyType = evt.target.value;
  priceInputElement.min = propertyMinPrice[propertyType];
  priceInputElement.placeholder = propertyMinPrice[propertyType];
};
housingTypeInputElement.addEventListener('change', onHousingTypeInputChange);

const resetPriceInputValue = () => {
  priceInputElement.min = propertyMinPrice.flat;
  priceInputElement.placeholder = propertyMinPrice.flat;
};

const onPriceInputChange = (evt) => {
  const { target } = evt;
  const priceValue = parseInt(target.value, RADIX);
  const propertyType = housingTypeInputElement.value;
  if (priceValue < propertyMinPrice[propertyType]) {
    target.setCustomValidity(`Минимальная стоимость для данного типа жилья составляет ${propertyMinPrice[propertyType]}`);
  } else if (priceValue > PROPERTY_MAX_PRICE) {
    target.setCustomValidity(`Если мы поставим стоимость не более ${PROPERTY_MAX_PRICE}, то сдадим площадку быстрее. Пожалуйста, уменьшите стоимость.`);
  } else {
    target.setCustomValidity('');
  }
  target.reportValidity();
};
priceInputElement.addEventListener('change', onPriceInputChange);

const onCheckInOrOutInputChange = (evt) => {
  const { target } = evt;
  if (target.id === 'timein') {
    checkOutInputElement.value = target.value;
    return;
  }  checkInInputElement.value = target.value;
};
checkInInputElement.addEventListener('change', onCheckInOrOutInputChange);
checkOutInputElement.addEventListener('change', onCheckInOrOutInputChange);

const onRoomInputChange = (evt) => {
  const currentRoomValue = parseInt(evt.target.value, RADIX);
  if (currentRoomValue === UNINHABITED_CAPACITY) {
    guestInputElement.value = 0;
    guestOptionElements.forEach((option) => {
      option.disabled = parseInt(option.value, RADIX) !== 0;
    });
    return;
  }
  guestInputElement.value = currentRoomValue;
  guestOptionElements.forEach((option) => {
    const guestValue = parseInt(option.value, RADIX);
    option.disabled = guestValue > currentRoomValue || guestValue === 0;
  });
};
roomInputElement.addEventListener('change', onRoomInputChange);

const resetGuestDisabledStatus = () => {
  guestOptionElements.forEach((option, index, array) => {
    option.disabled = index === array.length - Index.FIRST;
  });
};

const resetForm = () => {
  adFormElement.reset();
  resetGuestDisabledStatus();
  resetPriceInputValue();
};

export const setResetButtonClick = (onMapReset) => {
  resetButtonElement.addEventListener('click', (evt) => {
    evt.preventDefault();
    resetForm();
    onMapReset();
  });
};

export const setFormSubmit = (onSuccess, onFail) => {
  adFormElement.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    sendData(() => {
      resetForm();
      onSuccess();
    }, onFail, formData);
  });
};

const checkFileType = (fileType) =>
  /jpeg$|jpg$|png$/.test(fileType);

avatarInputElement.addEventListener('change', (evt) => {
  const file = evt.target.files[0];
  const fileReader = new FileReader();
  if (checkFileType(file.type)) {
    fileReader.addEventListener('load', () => {
      avatarElement.src = fileReader.result;
    });
    fileReader.readAsDataURL(file);
    return;
  }
  showErrorMessage(WRONG_FILE_TEXT_ERROR);
});
