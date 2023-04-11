import {Dimensions, Platform, Text, TextInput} from 'react-native';

const {height, width} = Dimensions.get('window');

export const responsiveHeight = h => height * (h / 100);

export const deviceHeight = height;

export const deviceWidth = width;

export const isSmallDevice = deviceWidth <= 385;

export const responsiveWidth = w => width * (w / 100);

export const responsiveFontSize = f => Math.sqrt(height * height + width * width) * (f / 100);

export function isIphoneX() {
  const dimen = Dimensions.get('window');
  return Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && (dimen.height === 812 || dimen.width === 812);
}

export function ifIphoneX(iphoneXStyle, regularStyle) {
  if (isIphoneX()) {
    return iphoneXStyle;
  }
  return regularStyle;
}

export function disableFontScaling() {
  if (Text.defaultProps === null) {
    Text.defaultProps = {};
  }
  Text.defaultProps.allowFontScaling = false;
  if (TextInput.defaultProps === null) {
    TextInput.defaultProps = {};
  }
  TextInput.defaultProps.allowFontScaling = false;
}
